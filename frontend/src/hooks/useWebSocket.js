import { useState, useEffect } from "react";

export default function useWebSocket(url) {
  const [ws, setWs] = useState(null); // Estado para el WebSocket
  const [serverMessage, setServerMessage] = useState(""); // Mensaje del servidor

  useEffect(() => {
    // Establece la conexión WebSocket cuando el componente se monta
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    socket.onmessage = (event) => {
      console.log("Mensaje recibido del servidor:", event.data);
      setServerMessage(event.data); // Guarda el mensaje recibido
    };

    socket.onclose = () => {
      console.log("Desconectado del WebSocket");
    };

    socket.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };

    // Guarda la conexión WebSocket
    setWs(socket);

    // Limpia la conexión al desmontar el componente
    return () => {
      socket.close();
    };
  }, [url]); // El efecto depende de la URL del WebSocket

  // Función para enviar mensajes a través del WebSocket
  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.error("No hay conexión WebSocket abierta para enviar el mensaje");
    }
  };

  return { ws, serverMessage, sendMessage };
}
