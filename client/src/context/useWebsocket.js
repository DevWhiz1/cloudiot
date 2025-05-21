// src/contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("Initializing WebSocket connection...");
    const newSocket = io(process.env.REACT_APP_API_URL);
  
    newSocket.on('connect', () => {
      console.log("WebSocket connected:", newSocket.id);
    });
  
    newSocket.on('connect_error', (err) => {
      console.error("WebSocket connection error:", err);
    });
  
    setSocket(newSocket);
  
    return () => {
      console.log("Disconnecting WebSocket...");
      newSocket.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};