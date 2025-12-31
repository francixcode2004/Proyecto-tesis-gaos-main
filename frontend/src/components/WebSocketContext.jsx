import React, { createContext, useContext, useState, useEffect } from "react";

// Crear el contexto para WebSocket
const WebSocketContext = createContext(null);

// Proveedor de WebSocket
export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Crear una nueva conexión WebSocket
    const newSocket = new WebSocket("ws://localhost:8765");

    newSocket.onopen = () => {
      console.log("WebSocket conectado");
      setSocket(newSocket);
    };

    newSocket.onmessage = (event) => {
      const message = event.data;
      console.log("Mensaje recibido del servidor:", message);
      // Aquí puedes manejar el mensaje y actualizar el estado global o notificar a los componentes.
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = () => {
      console.log("WebSocket desconectado");
      setSocket(null);
    };

    // Limpiar la conexión WebSocket al desmontar el componente
    return () => {
      if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
        newSocket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook para usar el contexto de WebSocket
export const useWebSocket = () => {
  const socket = useContext(WebSocketContext);
  if (socket === null) {
    console.warn("useWebSocket llamado fuera de WebSocketProvider");
  }
  return socket;
};