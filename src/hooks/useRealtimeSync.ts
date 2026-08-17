import { useState, useEffect, useCallback } from 'react';
import { getWebSocketClient, ConnectionStatus, MessageHandler } from '../services/websocket';

export interface UseRealtimeSyncOptions {
  onMenuUpdated?: () => void;
  onConfigUpdated?: () => void;
  onOrderReceived?: (orderData: any) => void;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [endpointUrl, setEndpointUrl] = useState<string>('');

  useEffect(() => {
    const client = getWebSocketClient();
    setEndpointUrl(client.getUrl());

    const unsubscribeStatus = client.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubscribers: Array<() => void> = [];

    // Subscribe to menu updates
    if (options.onMenuUpdated) {
      unsubscribers.push(client.subscribe('MENU_UPDATED', () => options.onMenuUpdated?.()));
      unsubscribers.push(client.subscribe('DISH_AVAILABILITY_CHANGED', () => options.onMenuUpdated?.()));
    }

    // Subscribe to config updates
    if (options.onConfigUpdated) {
      unsubscribers.push(client.subscribe('CONFIG_UPDATED', () => options.onConfigUpdated?.()));
    }

    // Subscribe to incoming orders / reservations
    if (options.onOrderReceived) {
      unsubscribers.push(client.subscribe('NEW_ORDER', (msg) => options.onOrderReceived?.(msg.payload)));
      unsubscribers.push(client.subscribe('NEW_RESERVATION', (msg) => options.onOrderReceived?.(msg.payload)));
    }

    return () => {
      unsubscribeStatus();
      unsubscribers.forEach(unsub => unsub());
    };
  }, [options.onMenuUpdated, options.onConfigUpdated, options.onOrderReceived]);

  const broadcastEvent = useCallback((type: string, payload?: any) => {
    const client = getWebSocketClient();
    return client.send(type, payload);
  }, []);

  const reconnect = useCallback(() => {
    const client = getWebSocketClient();
    client.disconnect();
    client.connect();
  }, []);

  return {
    status,
    endpointUrl,
    isConnected: status === 'CONNECTED',
    isReconnecting: status === 'RECONNECTING' || status === 'CONNECTING',
    broadcastEvent,
    reconnect
  };
}
