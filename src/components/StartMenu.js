import React from 'react';
import styled from 'styled-components';

// Styled components for the StartMenu
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
`;

const Title = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2937;
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

const StartButton = styled.button`
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

/**
 * StartMenu component displays the game title, instructions, and a start button.
 * It also shows the player's high score.
 *
 * @param {object} props - The component props.
 * @param {Function} props.onStart - Callback function to start the game.
 * @param {number} props.highScore - The current high score to display.
 */
const StartMenu = ({ onStart, highScore }) => {
  return (
    <MenuContainer>
      <Title>Doodle Jump</Title>
      <InstructionText>
        Use the left and right arrow keys or 'A' and 'D' to move.
      </InstructionText>
      <ScoreText>
        High Score: {highScore}
      </ScoreText>
      <StartButton onClick={onStart}>
        Start Game
      </StartButton>
    </MenuContainer>
  );
};

export default StartMenu;