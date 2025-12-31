import React, { useState, useEffect ,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import QuestionLabel from '../components/QuestionLabel';
import OptionButton from '../components/OptionButton';
import CardFinish from '../components/CardFinish';

export default function QuizPage({ socketConnection }) {
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    // Intentar recuperar la pregunta desde el localStorage solo si el estado es null
    const storedQuestion = localStorage.getItem("currentQuestion");
    console.log("Pregunta en localStorage:", storedQuestion); // Para depurar
    return storedQuestion ? JSON.parse(storedQuestion) : null;
  });
  const [serverMessage, setServerMessage] = useState("");
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [optionsDisabled, setOptionsDisabled] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const navigate = useNavigate();
   // Referencia del audio para evitar que se cree cada vez que se renderiza el componente
   const audioRef = useRef(null);

   // Cargar y preparar el audio una sola vez al montar el componente
   useEffect(() => {
     const audioPath = `${import.meta.env.BASE_URL}sonidotension.mp3`;
     const audio = new Audio(audioPath);
     audio.preload = 'auto'; 
     
     audio.onerror = (error) => {
       console.error('Error al cargar el audio:', error, 'URL:', error?.target?.src);
     };
     
     audioRef.current = audio;
     
     // Esperar la primera interacción del usuario para reproducir el audio
     const playAudioOnUserInteraction = () => {
       if (audioRef.current) {
         audioRef.current.play().catch((error) => {
           console.error('Error al reproducir el audio:', error);
         });
         // Remover el listener después de la primera interacción
         document.body.removeEventListener('click', playAudioOnUserInteraction);
       }
     };
 
     document.body.addEventListener('click', playAudioOnUserInteraction);
     
     return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = ""; // Limpiar la referencia de audio
       }
       document.body.removeEventListener('click', playAudioOnUserInteraction);
     };
   }, []);

  useEffect(() => {
    if (!socketConnection) {
      console.error('No hay conexión WebSocket disponible');
      return;
    }
    
    console.log('WebSocket conectado');

    const handleMessage = (event) => {
      console.log('Mensaje recibido del servidor:', event.data);

      if (event.data.startsWith("Enviando pregunta:")) {
        const questionPart = event.data.replace("Enviando pregunta:", "").trim();
        try {
          const parsedQuestion = JSON.parse(questionPart);
          console.log("Pregunta parseada:", parsedQuestion);

          // Guardar la nueva pregunta en el localStorage
          localStorage.setItem("currentQuestion", JSON.stringify(parsedQuestion));
          
          // Actualizar el estado
          setCurrentQuestion(parsedQuestion);
          setWaitingForPlayer(false);
          setServerMessage("");
          setOptionsDisabled(false);
        } catch (error) {
          console.error("Error al parsear la pregunta:", error);
        }
      } else if (event.data === "Esperando respuesta del otro jugador") {
        setWaitingForPlayer(true);
        setServerMessage("Esperando respuesta del otro jugador...");
      } else if (event.data === "Esperando a otro jugador") {
        setServerMessage("Esperando a otro jugador para iniciar el juego...");
      } else if (event.data === "Juego finalizado") {
        setGameEnded(true);
      } else {
        setServerMessage(event.data);
      }
    };

    socketConnection.onmessage = handleMessage;

    return () => {
      console.log('Limpiando conexión WebSocket');
      socketConnection.onmessage = null;
    };
  }, [socketConnection]);

  const handleOptionClick = (option) => {
    console.log('Opción seleccionada:', option);
    if (socketConnection) {
      socketConnection.send(JSON.stringify({ option_player: option }));
      setOptionsDisabled(true);
      setWaitingForPlayer(true);
      setServerMessage("Esperando respuesta del otro jugador...");
    }
  };

  useEffect(() => {
    console.log("Estado actualizado: currentQuestion", currentQuestion);
  }, [currentQuestion]);

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
                {['option1', 'option2', 'option3', 'option4'].map((key) => (
                  <OptionButton
                    key={key}
                    option={currentQuestion[key]}
                    onClick={() => handleOptionClick(currentQuestion[key])}
                    disabled={optionsDisabled}
                  />
                ))}
              </div>
              {waitingForPlayer && (
                <div className="bg-yellow-200 text-yellow-800 p-4 rounded-lg mt-6 shadow-lg">
                  <p>{serverMessage}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-white">{serverMessage || "Cargando pregunta..."}</p>
          )}
        </div>
      )}
    </div>
  );
}