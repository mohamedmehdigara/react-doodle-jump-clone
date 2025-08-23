import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled components for the leaderboard
const LeaderboardContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f0f4f8;
  color: #1f2937;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  text-align: center;
  width: 300px;
`;

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 24px;
`;

const ScoreList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
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




const Leaderboard = ({ scores, onBack, loading, currentUserId }) => {
  // Sort scores from highest to lowest
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <MenuContainer>
      <Title>Leaderboard</Title>
      {loading ? (
        <p>Loading scores...</p>
      ) : (
        <ScoreList>
          {sortedScores.map((item, index) => (
            <ScoreItem key={item.id}>
              <span>{index + 1}. {item.name}{item.userId === currentUserId && ' (You)'}</span>
              <span>{item.score}</span>
            </ScoreItem>
          ))}
        </ScoreList>
      )}
      <Button onClick={onBack}>Back to Main Menu</Button>
    </MenuContainer>
  );
};

export default Leaderboard;
