import React from "react";
const RankingList = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.animatedScore - a.animatedScore);
  const getTrophyImage = (index) => {
    switch (index) {
      case 0:
        return "/winner.png"; // Ruta de la imagen del trofeo de oro
      case 1:
        return "/silver.png"; // Ruta de la imagen del trofeo de plata
      case 2:
        return "/bronze.png"; // Ruta de la imagen del trofeo de bronce
      default:
        return "/medal.png"; // Ruta de la imagen de la medalla para los jugadores restantes
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {sortedData.map((player, index) => (
        <div 
          key={player.name} 
          className={`flex items-center justify-between bg-gray-900 text-white p-4 mb-4 rounded-lg shadow-lg ${
            index < 3 ? "border-4 border-yellow-500" : "border border-gray-700"
          }`}
        >
          <div className="flex items-center gap-4">
            <img 
              src={getTrophyImage(index)} 
              alt={`Trofeo de ${index + 1}`} 
              className="w-16 h-16 object-contain"
            />
            <span className="text-xl font-bold">{player.name}</span>
          </div>

          <div className="flex items-center gap-28">
          <span className="text-xl font-semibold">Puntaje: {player.animatedScore.toFixed(0)}</span>
          <span className="text-xl font-semibold">Tiempo: {player.time.toFixed(5)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default RankingList;
