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
const StartMenu = ({ onStart, highScore, onShowLeaderboard, onShowOptions, onShowHelp, userName }) => {
  return (
    <MenuContainer>
      <Title>Doodle Jump</Title>
      <InstructionText>
        Use the left and right arrow keys or 'A' and 'D' to move.
      </InstructionText>
      <ScoreText>
        High Score: {highScore}
      </ScoreText>
      <InstructionText>
        Current Player: **{userName}**
      </InstructionText>
      <Button onClick={onStart}>
        Start Game
      </Button>
      <BlueButton onClick={onShowLeaderboard}>
        Show Leaderboard
      </BlueButton>
      <BlueButton onClick={onShowOptions}>
        Options
      </BlueButton>
      <BlueButton onClick={onShowHelp}>
        Help
      </BlueButton>
    </MenuContainer>
  );
};


export default StartMenu;