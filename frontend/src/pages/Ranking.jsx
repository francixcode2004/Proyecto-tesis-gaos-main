import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import CardRanking from '../components/CardRanking';
import CardHeaderRanking from '../components/CardHeaderRanking';
import CardTitle from '../components/CardTitle';
import CardContent from '../components/CardContent';
import RankingBarChart from '../components/RankingBarChart';

const rankingData = [];

export default function RankingPage({ socketConnection }) {
  const [data, setData] = useState(rankingData);  // Inicializamos con un array vacío

  useEffect(() => {
    if (!socketConnection) {
      console.error("No hay conexión WebSocket disponible");
      return;
    }
    console.log("WebSocket conectado");

    const handleMessage = (event) => {
      try {
        // Parsear los datos recibidos del servidor
        const newData = JSON.parse(event.data); 
        console.log("Mensaje recibido del servidor para ranking:", newData);

        if (newData) {
          console.log("ranking llego");

          // Mapear los datos del servidor para asegurarse que el formato sea adecuado
          const formattedData = newData.map(item => ({
            name: item.name,
            score: item.score,
            time: item.time,
            animatedScore: 0,  // Inicializamos la animación en 0
          }));

          // Actualizar el estado con los datos formateados
          setData(formattedData);

          // Iniciar la animación de los puntajes
          const animationDuration = 5000; // Duración de la animación en milisegundos
          const steps = 60; // Número de pasos para la animación

          // Crear animación para actualizar los puntajes
          const interval = setInterval(() => {
            setData((currentData) =>
              currentData.map((item) => {
                const updatedItem = formattedData.find((i) => i.name === item.name);
                if (!updatedItem) return item; // Si no hay cambios, devolver el mismo elemento
                return {
                  ...item,
                  animatedScore: Math.min(
                    item.animatedScore + updatedItem.score / steps,
                    updatedItem.score
                  ),
                };
              })
            );
          }, animationDuration / steps);

          // Limpiar el intervalo después de la animación
          setTimeout(() => {
            clearInterval(interval);
          }, animationDuration);
        }
      } catch (error) {
        console.error("Error al procesar el mensaje del servidor:", error);
      }
    };

    // Asignar el manejador de eventos del WebSocket
    socketConnection.onmessage = handleMessage;

    // Limpiar recursos al desmontar o al cambiar la conexión
    return () => {
      console.log("Desconectando WebSocket...");
      socketConnection.onmessage = null;
    };
  }, [socketConnection]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/Background.webp')" }}>
      <Logo />
      <CardRanking className="w-full max-w-4xl text-white">
        <CardHeaderRanking>
          <CardTitle>
            <span className="inline-block text-center w-full">Ranking de Jugadores</span>
          </CardTitle>
        </CardHeaderRanking>
        <CardContent>
          <RankingBarChart data={data} />
        </CardContent>
      </CardRanking>
      <div className="mt-6 flex justify-center">
        <img src="/GaosMini_blackbg.webp" alt="GAOS Mini Logo" width={48} height={48} />
      </div>
    </div>
  );
}
