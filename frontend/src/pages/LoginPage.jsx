import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import InputField from "../components/InputField";
import SubmitButton from "../components/SubmitButton";
export default function LoginPage({ setSocketConnection }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [waitingMessage, setWaitingMessage] = useState("");
  const [IsWaiting, setIsWaiting] = useState(false); // Estado booleano para mostrar u ocultar la tarjeta
  const navigate = useNavigate();

  // Conectar al WebSocket y enviar el nombre y ID
  const handleSubmit = (e) => {
    e.preventDefault();

    // Conectar al WebSocket
    const socket = new WebSocket("ws://192.168.100.7:8765");

    socket.onopen = () => {
      console.log("Conectado al WebSocket");
      socket.send(name); // Enviar el nombre del jugador al servidor
      socket.send(id); // Enviar el ID del jugador al servidor
      setSocketConnection(socket); // Guardar la conexión WebSocket en el estado o contexto
      
    };

    socket.onmessage = (event) => {
      console.log("Mensaje recibido del servidor:", event.data);
      if (event.data === "Jugadores completos") {
        navigate("/quiz"); // Usa `navigate` en lugar de `useNavigate`
      }
      // Si el mensaje es "Esperando a otro jugador", mostrar la tarjeta de espera
      if (event.data === "Esperando a otro jugador") {
        setWaitingMessage("Esperando a otro jugador...");
        setIsWaiting(true);
      }
      // Si el mensaje es "Room Id incorrecta", mostrar el mensaje de error
      if (event.data === "Room Id incorrecta") {
        setWaitingMessage("Room Id incorrecta");
        setIsWaiting(true);
      }
    };
    socket.onclose = () => {
      console.log("Desconectado del WebSocket");
    };
  };
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.webp')" }}
    >
      <Logo />
      <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-96">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese su nombre"
          />

          <InputField
            id="id"
            label="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Ingrese su ID"
          />

          <SubmitButton />
        </form>
      </div>

      {/* Mostrar la tarjeta de espera si `waitingMessage` es true */}
      {IsWaiting && (
        <div className="bg-yellow-200 text-yellow-800 p-4 rounded-lg mt-6 shadow-lg">
          <p>{waitingMessage}</p>
        </div>
      )}
    </div>
  );
}