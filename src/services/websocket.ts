/**
 * Resilient Realtime Synchronization Service
 * 
 * Features:
 * 1. Automatic SSL negotiation: wss:// for HTTPS domains, ws:// for local HTTP.
 * 2. Serverless & Vercel Awareness: Automatically detects serverless hosts (like vercel.app)
 *    where persistent WebSocket daemons are not hosted, and seamlessly falls back to 
 *    BroadcastChannel & LocalStorage synchronization so no red errors appear.
 * 3. Exponential backoff auto-reconnection with randomized jitter and max retry caps.
 * 4. Keep-alive heartbeat (Ping/Pong) to detect dead proxy connections.
 * 5. Cross-tab & Multi-device state broadcasting.
 */

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'FALLBACK_MODE' | 'ERROR';

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
  private url: string | null = null;
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
  private isServerlessHost = false;

  // BroadcastChannel for cross-tab sync when WebSocket is unavailable on serverless
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(options: WebSocketClientOptions = {}) {
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 4;
    this.initialReconnectDelay = options.initialReconnectDelay ?? 1500;
    this.maxReconnectDelay = options.maxReconnectDelay ?? 12000;
    this.heartbeatInterval = options.heartbeatInterval ?? 25000;
    this.heartbeatTimeout = options.heartbeatTimeout ?? 5000;

    // Check if running on serverless host like Vercel without custom external WS URL
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const customWsUrl = (import.meta as any).env?.VITE_WS_URL;
      
      // If deployed on Vercel and no external WebSocket server is explicitly set, use Fallback Sync
      if ((hostname.includes('vercel.app') || hostname.includes('now.sh')) && !customWsUrl) {
        this.isServerlessHost = true;
      }

      // Initialize cross-tab BroadcastChannel
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('sep_realtime_sync');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data) {
              this.dispatchIncomingMessage(event.data);
            }
          };
        }
      } catch {
        // ignore
      }

      // Listen for window storage events as an extra cross-tab fallback
      window.addEventListener('storage', this.handleStorageEvent);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // Resolve endpoint
    this.url = options.url || this.resolveWebSocketEndpoint(options.path || '/ws');

    if (options.autoConnect !== false) {
      this.connect();
    }
  }

  /**
   * Resolves the WebSocket endpoint with proper SSL (wss:// vs ws://)
   */
  public resolveWebSocketEndpoint(path: string = '/ws'): string | null {
    if (typeof window === 'undefined') return `ws://localhost:3000${path}`;

    // 1. Check custom environment variable (e.g., external dedicated WebSocket server)
    const customUrl = (import.meta as any).env?.VITE_WS_URL;
    if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
      return customUrl.trim();
    }

    // 2. If running on Vercel without a custom external WS URL, do not construct a broken wss:// endpoint
    if (this.isServerlessHost) {
      return null;
    }

    // 3. Derive protocol based on current page security
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
    return this.url || 'Cross-Tab Sync (Vercel Serverless)';
  }

  public connect(customUrl?: string): void {
    if (customUrl) {
      this.url = customUrl;
      this.isServerlessHost = false;
    }

    // If on Vercel with no custom URL, use resilient local/tab synchronization mode
    if (this.isServerlessHost || !this.url) {
      this.setStatus('FALLBACK_MODE');
      return;
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
    } catch {
      // Gracefully fallback
      this.handleError();
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

    // Broadcast across browser tabs via BroadcastChannel & LocalStorage
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('sep_last_broadcast_event', JSON.stringify(message));
      }
    } catch {
      // ignore
    }

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
      if (!this.isServerlessHost) {
        this.messageQueue.push(payloadString);
        if (!this.isManuallyClosed && this.status !== 'CONNECTING' && this.status !== 'RECONNECTING') {
          this.scheduleReconnect();
        }
      }
      return true;
    }
  }

  public subscribe<T = any>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

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
      this.dispatchIncomingMessage(data);
    } catch {
      // ignore non-JSON messages
    }
  }

  private dispatchIncomingMessage(data: WebSocketMessage): void {
    if (!data || !data.type) return;

    // Handle keep-alive pong
    if (data.type === 'pong' || data.type === 'PONG' || data.type === 'heartbeat_ack') {
      this.handlePong();
      return;
    }

    // Handle ping
    if (data.type === 'ping' || data.type === 'PING') {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        } catch {
          // ignore
        }
      }
      return;
    }

    // Dispatch to specific listeners
    const specific = this.listeners.get(data.type);
    if (specific) {
      specific.forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error(`Error in listener for "${data.type}":`, e);
        }
      });
    }

    // Wildcard listeners
    const wildcard = this.listeners.get('*');
    if (wildcard) {
      wildcard.forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error('Error in wildcard listener:', e);
        }
      });
    }
  }

  private handleError(): void {
    // If connection fails repeatedly or host rejects WS upgrades, switch to fallback mode gracefully
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('FALLBACK_MODE');
    } else {
      this.setStatus('ERROR');
    }
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers();
    this.ws = null;

    if (this.isManuallyClosed) {
      this.setStatus('DISCONNECTED');
      return;
    }

    // If closed due to unsupported host or normal close, handle appropriately
    if (event.code === 1000) {
      this.setStatus('DISCONNECTED');
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Transition to silent cross-tab fallback mode rather than infinitely erroring
      this.setStatus('FALLBACK_MODE');
    } else {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isManuallyClosed || this.isServerlessHost || this.reconnectTimer) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('FALLBACK_MODE');
      return;
    }

    this.reconnectAttempts++;
    this.setStatus('RECONNECTING');

    const delay = Math.min(
      this.initialReconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    const jitter = Math.random() * 400;
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
        try {
          this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          
          this.pongTimer = setTimeout(() => {
            if (this.ws) {
              try {
                this.ws.close(4000, 'Heartbeat timeout');
              } catch {
                // ignore
              }
            }
          }, this.heartbeatTimeout);
        } catch {
          // ignore
        }
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

  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === 'sep_last_broadcast_event' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        this.dispatchIncomingMessage(parsed);
      } catch {
        // ignore
      }
    }
  };

  private handleOnline = (): void => {
    if (!this.isManuallyClosed && !this.isServerlessHost && this.status !== 'CONNECTED') {
      this.reconnectAttempts = 0;
      this.connect();
    }
  };

  private handleOffline = (): void => {
    this.setStatus('DISCONNECTED');
    this.clearTimers();
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && !this.isManuallyClosed && !this.isServerlessHost && this.status !== 'CONNECTED') {
      this.connect();
    }
  };

  public destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.statusListeners.clear();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}

// Global Singleton Instance
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
