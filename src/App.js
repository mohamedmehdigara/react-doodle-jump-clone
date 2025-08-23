import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import MessageBox from './components/MessageBox';
import StartMenu from './components/StartMenu';
import Leaderboard from './components/Leaderboard';
import PauseMenu from './components/PauseMenu';
import GameOverMenu from './components/GameOverMenu';
import OptionsMenu from './components/OptionsMenu';

// ===================================

// --- STYLED COMPONENTS ---

const MenuContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 10;
`;

const DarkMenuContainer = styled(MenuContainer)`
  background-color: #1f2937;
  color: white;
`;

const Title = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
`;

const DarkTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const InstructionText = styled.p`
  color: #4b5563;
  margin-bottom: 8px;
`;

const ScoreText = styled.p`
  color: #4b5563;
  margin-bottom: 24px;
  font-weight: 600;
`;

const Button = styled.button`
  margin-top: 16px;
  padding: 12px 32px;
  background-color: #22c55e;
  color: white;
  font-weight: bold;
  border-radius: 9999px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    background-color: #16a34a;
    transform: scale(1.05);
  }
`;

const BlueButton = styled(Button)`
  background-color: #3b82f6;
  &:hover {
    background-color: #2563eb;
  }
`;

const ScoreList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const ScoreItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 1.125rem;
  font-weight: 500;
  
  &:last-child {
    border-bottom: none;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const MessageBoxContainer = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
  animation: ${props => props.isFadingOut ? fadeOut : fadeIn} 0.5s forwards;
  z-index: 20;
`;

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Firestore-related states
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userName] = useState('DoodleJumper'); // Hardcoded since profile editing is removed
  const [highScore, setHighScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

   
   
  const isNewHighScore = finalScore > highScore;

  const quitGame = () => {
    setIsGameStarted(false);
    setIsPaused(false);
    setShowLeaderboard(false);
    setFinalScore(0);
  }

  // Handle showing the leaderboard and submitting the score if it's a new high score

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center relative" style={{ width: '400px', height: '600px' }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Doodle Jump</h1>
        <MessageBox message={message} />
        {!isGameStarted && !showLeaderboard && !showOptions && (
          <StartMenu
            onStart={() => setIsGameStarted(true)}
            highScore={highScore}
            onShowOptions={() => setShowOptions(true)}
            userName={userName}
          />
        )}
       
        {showLeaderboard && (
          <Leaderboard
            scores={leaderboardScores}
            onBack={quitGame}
            loading={loading}
          />
        )}
        {isGameStarted && isPaused && (
          <PauseMenu
            onResume={() => setIsPaused(false)}
            onQuit={quitGame}
          />
        )}
        {showOptions && (
          <OptionsMenu
            onBack={() => setShowOptions(false)}
          />
        )}
        {finalScore > 0 && !showLeaderboard && !showOptions && (
          <GameOverMenu
            finalScore={finalScore}
            highScore={highScore}
            onRestart={() => { setFinalScore(0); setIsGameStarted(true) }}
          />
        )}
      </div>
    </div>
  );
};

export default App;




  