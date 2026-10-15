import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const isDevPort = typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = isDevPort
      ? 'ws://127.0.0.1:8000/ws/live'
      : `${protocol}//${window.location.host}/ws/live`;
    let socket;

    function connect() {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
          console.log('[RoadGuard WS] Connected to live incident dispatcher');
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);

            if (data.type === 'INCIDENT_DETECTED') {
              setLiveAlerts((prev) => [
                {
                  id: Date.now(),
                  incident_id: data.data.incident_id,
                  severity: data.data.severity,
                  description: data.data.description,
                  timestamp: data.timestamp,
                },
                ...prev.slice(0, 9),
              ]);
            }
          } catch {
            // Non-JSON ping/pong
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          // Auto-reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        console.error('[RoadGuard WS] Connection error:', err);
      }
    }

    connect();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const dismissAlert = (id) => {
    setLiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, liveAlerts, dismissAlert }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
