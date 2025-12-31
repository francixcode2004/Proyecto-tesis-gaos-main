const PlayerScore = ({ player, score }) => (
  <div className="text-center mb-4">
    <h2 className="text-2xl font-bold text-white mb-2">{player}</h2>
    <p className="text-4xl font-bold text-orange-500">{score}</p>
  </div>
);

export default PlayerScore