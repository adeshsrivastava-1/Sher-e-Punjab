/**
 * Resilient WebSocket Client with SSL (wss://) auto-detection,
 * exponential backoff reconnect logic, heartbeat keep-alive, and offline resilience.
 */

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';

export interface WebSocketMessage<T = any> {
  type: string;
  payload?: T;
  timestamp?: number;
}

export type MessageHandler<T = any> = (data: WebSocketMessage<T>) => void;

export interface WebSocketClientOptions {
  url?: string;
  path?: string;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  initialReconnectDelay?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private status: ConnectionStatus = 'DISCONNECTED';
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private initialReconnectDelay: number;
  private maxReconnectDelay: number;
  private reconnectTimer: any = null;

  private heartbeatInterval: number;
  private heartbeatTimeout: number;
  private pingTimer: any = null;
  private pongTimer: any = null;

  private messageQueue: string[] = [];
  private isManuallyClosed = false;

  constructor(options: WebSocketClientOptions = {}) {
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? Infinity;
    this.initialReconnectDelay = options.initialReconnectDelay ?? 1000;
    this.maxReconnectDelay = options.maxReconnectDelay ?? 15000;
    this.heartbeatInterval = options.heartbeatInterval ?? 25000;
    this.heartbeatTimeout = options.heartbeatTimeout ?? 5000;

    // Resolve URL with SSL detection
    this.url = options.url || this.resolveWebSocketEndpoint(options.path || '/ws');

    if (typeof window !== 'undefined') {
      // Listen to browser network state changes
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      // Reconnect when tab becomes active again
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    if (options.autoConnect !== false) {
      this.connect();
    }
  }

  /**
   * Resolves the WebSocket endpoint with proper SSL (wss:// vs ws://)
   */
  public resolveWebSocketEndpoint(path: string = '/ws'): string {
    if (typeof window === 'undefined') return `ws://localhost:3000${path}`;

    // 1. Check custom environment variable
    const customUrl = (import.meta as any).env?.VITE_WS_URL;
    if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
      return customUrl.trim();
    }

    // 2. Derive protocol based on current page security
    const isSecure = window.location.protocol === 'https:';
    const wsProtocol = isSecure ? 'wss:' : 'ws:';
    const host = window.location.host;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${wsProtocol}//${host}${normalizedPath}`;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getUrl(): string {
    return this.url;
  }

  public connect(customUrl?: string): void {
    if (customUrl) {
      this.url = customUrl;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isManuallyClosed = false;
    this.setStatus(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (err) {
      this.handleError(err);
    }
  }

  public disconnect(): void {
    this.isManuallyClosed = true;
    this.clearTimers();
    if (this.ws) {
      try {
        this.ws.close(1000, 'Normal closure');
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.setStatus('DISCONNECTED');
  }

  public send(type: string, payload?: any): boolean {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now()
    };

    const payloadString = JSON.stringify(message);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(payloadString);
        return true;
      } catch {
        this.messageQueue.push(payloadString);
        return false;
      }
    } else {
      // Queue message for delivery upon reconnection
      this.messageQueue.push(payloadString);
      if (!this.isManuallyClosed && this.status !== 'CONNECTING' && this.status !== 'RECONNECTING') {
        this.scheduleReconnect();
      }
      return false;
    }
  }

  public subscribe<T = any>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  // --- INTERNAL EVENT HANDLERS ---

  private handleOpen(): void {
    this.reconnectAttempts = 0;
    this.setStatus('CONNECTED');
    this.startHeartbeat();
    this.flushMessageQueue();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);

      // Handle keep-alive pong
      if (data.type === 'pong' || data.type === 'PONG' || data.type === 'heartbeat_ack') {
        this.handlePong();
        return;
      }

      // Handle incoming ping from server
      if (data.type === 'ping' || data.type === 'PING') {
        this.send('pong', { clientTimestamp: Date.now() });
        return;
      }

      // Dispatch to specific topic subscribers
      const specificHandlers = this.listeners.get(data.type);
      if (specificHandlers) {
        specificHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (e) {
            console.error(`Error in WebSocket subscriber for "${data.type}":`, e);
          }
        });
      }

      // Dispatch to wildcard '*' subscribers
      const wildcardHandlers = this.listeners.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (e) {
            console.error('Error in wildcard WebSocket subscriber:', e);
          }
        });
      }
    } catch {
      // Non-JSON message, ignore or dispatch raw
    }
  }

  private handleError(_event: any): void {
    this.setStatus('ERROR');
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers();
    this.ws = null;

    if (this.isManuallyClosed) {
      this.setStatus('DISCONNECTED');
      return;
    }

    // Schedule reconnect with exponential backoff if not closed normally
    this.setStatus('DISCONNECTED');
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isManuallyClosed || this.reconnectTimer) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('DISCONNECTED');
      return;
    }

    this.reconnectAttempts++;
    this.setStatus('RECONNECTING');

    // Calculate delay with exponential backoff + randomized jitter
    const delay = Math.min(
      this.initialReconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    const jitter = Math.random() * 500;
    const finalDelay = delay + jitter;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, finalDelay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { clientTimestamp: Date.now() });

        // Set timeout to detect missing pong
        this.pongTimer = setTimeout(() => {
          // No pong received in time, force reconnect
          if (this.ws) {
            try {
              this.ws.close(4000, 'Heartbeat timeout');
            } catch {
              // ignore
            }
          }
        }, this.heartbeatTimeout);
      }
    }, this.heartbeatInterval);
  }

  private handlePong(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private stopHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushMessageQueue(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) {
        try {
          this.ws.send(msg);
        } catch {
          this.messageQueue.unshift(msg);
          break;
        }
      }
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.statusListeners.forEach(fn => fn(status));
  }

  private handleOnline = (): void => {
    if (!this.isManuallyClosed && this.status !== 'CONNECTED' && this.status !== 'CONNECTING') {
      this.reconnectAttempts = 0;
      this.connect();
    }
  };

  private handleOffline = (): void => {
    this.setStatus('DISCONNECTED');
    this.clearTimers();
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && !this.isManuallyClosed && this.status !== 'CONNECTED') {
      this.connect();
    }
  };

  public destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.statusListeners.clear();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}

// Global Singleton Instance for shared app-wide synchronization
let globalWsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!globalWsClient) {
    globalWsClient = new WebSocketClient({
      autoConnect: true,
      maxReconnectDelay: 10000,
      heartbeatInterval: 20000
    });
  }
  return globalWsClient;
}
