import React from 'react';
import styled from 'styled-components';

// Styled components for the GameOverMenu
const MenuContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #1f2937;
  color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  text-align: center;
`;


const HighScoreText = styled.p`
  font-size: 1.25rem;
  margin-top: 8px;
`;

const RestartButton = styled.button`
  margin-top: 24px;
  padding: 12px 32px;
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  border-radius: 9999px;
  transition: all 0.3s ease;
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    background-color: #2563eb;
    transform: scale(1.1);
  }
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



const GameOverMenu = ({ finalScore, highScore, onRestart, onShowLeaderboard }) => {
  return (
    <DarkMenuContainer>
      <DarkTitle>Game Over!</DarkTitle>
      <ScoreText>Final Score: {finalScore}</ScoreText>
      <ScoreText>High Score: {highScore}</ScoreText>
      <BlueButton onClick={onRestart}>
        Play Again
      </BlueButton>
      <BlueButton onClick={onShowLeaderboard} style={{ marginTop: '10px' }}>
        Show Leaderboard
      </BlueButton>
    </DarkMenuContainer>
  );
};

export default GameOverMenu;
