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

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ScoreText = styled.p`
  font-size: 1.5rem;
  margin-top: 16px;
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

/**
 * GameOverMenu component displays the game over screen with the final score, high score,
 * and a button to restart the game.
 *
 * @param {object} props - The component props.
 * @param {number} props.finalScore - The player's final score for the current game.
 * @param {number} props.highScore - The recorded high score.
 * @param {Function} props.onRestart - Callback function to reset and start a new game.
 */
const GameOverMenu = ({ finalScore, highScore, onRestart }) => {
  return (
    <MenuContainer>
      <Title>Game Over!</Title>
      <ScoreText>Final Score: {finalScore}</ScoreText>
      <HighScoreText>High Score: {highScore}</HighScoreText>
      <RestartButton onClick={onRestart}>
        Play Again
      </RestartButton>
    </MenuContainer>
  );
};

export default GameOverMenu;
