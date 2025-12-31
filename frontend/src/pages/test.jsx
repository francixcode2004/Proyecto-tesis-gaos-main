import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import QuestionLabel from '../components/QuestionLabel';
import OptionButton from '../components/OptionButton';
import CardFinish from '../components/CardFinish';

export default function QuizPage({ socketConnection }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [serverMessage, setServerMessage] = useState("");
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [optionsDisabled, setOptionsDisabled] = useState(false); // Nuevo estado para deshabilitar las opciones
  const [gameEnded, setGameEnded] = useState(false);
  const navigate = useNavigate();

  // Escuchar mensajes desde el WebSocket
  useEffect(() => {
    if (!socketConnection) {
      console.error('No hay conexión WebSocket disponible');
      return;
    }

    console.log('WebSocket conectado');

    socketConnection.onmessage = (event) => {
      console.log('Mensaje recibido del servidor:', event.data);

      // Si el mensaje inicia con "Enviando pregunta:", extraer la pregunta
      if (event.data.startsWith("Enviando pregunta:")) {
        const questionPart = event.data.replace("Enviando pregunta:", "").trim();
        try {
          const parsedQuestion = JSON.parse(questionPart);
          setCurrentQuestion(parsedQuestion);
          setWaitingForPlayer(false);
          setServerMessage("");
          setOptionsDisabled(false); // Habilitar las opciones al recibir una nueva pregunta
          console.log("Pregunta recibida:", parsedQuestion);
        } catch (error) {
          console.error("Error al parsear la pregunta:", error);
        }
        return;
      }

      // Si se recibe "Esperando respuesta del otro jugador"
      if (event.data === "Esperando respuesta del otro jugador") {
        setWaitingForPlayer(true);
        setServerMessage("Esperando respuesta del otro jugador...");
        return;
      }

      // Si se recibe "Esperando a otro jugador"
      if (event.data === "Esperando a otro jugador") {
        setServerMessage("Esperando a otro jugador para iniciar el juego...");
        return;
      }

      // Si se recibe el mensaje "Juego finalizado"
      if (event.data === "Juego finalizado") {
        setGameEnded(true);
        return;
      }

      // Manejar otros mensajes del servidor
      setServerMessage(event.data);
      console.log("Mensaje recibido:", event.data);
    };

    return () => {
      console.log('WebSocket sigue conectado');
    };
  }, [socketConnection]);

  // Manejar cuando el jugador selecciona una opción
  const handleOptionClick = (option) => {
    console.log('Opción seleccionada:', option);

    if (socketConnection) {
      // Enviar la opción seleccionada al servidor
      socketConnection.send(JSON.stringify({ option_player: option }));
      setOptionsDisabled(true); // Deshabilitar las opciones una vez seleccionada una respuesta
      setWaitingForPlayer(true);
      setServerMessage("Esperando respuesta del otro jugador...");
    }
  };
  
  useEffect(() => {
    console.log("Estado actualizado: currentQuestion", currentQuestion);
  }, [currentQuestion]);
  // Redirigir a la página de inicio después de un retraso cuando el juego termina
  useEffect(() => {
    if (gameEnded) {
      setTimeout(() => {
        navigate('/ranking');
      }, 5000);
    }
  }, [gameEnded, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/Background.webp')" }}>
      <Logo />

      {gameEnded ? (
        // Mostrar la tarjeta de fin del juego cuando el juego ha terminado
        <CardFinish />
      ) : (
        <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-96">
          {currentQuestion ? (
            <>
              <QuestionLabel 
                question={currentQuestion.question} 
                label="Selecciona la respuesta correcta"
              />
              <div className="grid grid-cols-2 gap-4">
                <OptionButton 
                  option={currentQuestion.option1} 
                  onClick={() => handleOptionClick(currentQuestion.option1)} 
                  disabled={optionsDisabled} // Deshabilitar botón si optionsDisabled es verdadero
                />
                <OptionButton 
                  option={currentQuestion.option2} 
                  onClick={() => handleOptionClick(currentQuestion.option2)} 
                  disabled={optionsDisabled} // Deshabilitar botón si optionsDisabled es verdadero
                />
                <OptionButton 
                  option={currentQuestion.option3} 
                  onClick={() => handleOptionClick(currentQuestion.option3)} 
                  disabled={optionsDisabled} // Deshabilitar botón si optionsDisabled es verdadero
                />
                <OptionButton 
                  option={currentQuestion.option4} 
                  onClick={() => handleOptionClick(currentQuestion.option4)} 
                  disabled={optionsDisabled} // Deshabilitar botón si optionsDisabled es verdadero
                />
              </div>

              {/* Mostrar el mensaje de "Esperando respuesta del otro jugador" debajo de la pregunta */}
              {waitingForPlayer && (
                <div className="bg-yellow-200 text-yellow-800 p-4 rounded-lg mt-6 shadow-lg">
                  <p>{serverMessage}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-white">
              {serverMessage ? serverMessage : "Cargando..."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}