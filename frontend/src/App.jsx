import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import QuizPage from './pages/QuizPage';
import ErrorBoundary from './components/ErrorBoundary';  // Importar ErrorBoundary
import RankingPage from './pages/Ranking'
export default function App() {
  const [socketConnection, setSocketConnection] = useState(null);  // Estado para la conexión WebSocket
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage setSocketConnection={setSocketConnection} />} />
          <Route path="/quiz" element={<QuizPage socketConnection={socketConnection} />} />
          <Route path="/ranking" element={<RankingPage socketConnection={socketConnection}/>}/>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}