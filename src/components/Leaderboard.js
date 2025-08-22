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

/**
 * Leaderboard component displays a list of top high scores.
 *
 * @param {object} props - The component props.
 * @param {Array<Object>} props.scores - An array of score objects { name, score }.
 */
const Leaderboard = ({ scores }) => {
  return (
    <LeaderboardContainer>
      <Title>Leaderboard</Title>
      <ScoreList>
        {scores.map((item, index) => (
          <ScoreItem key={index}>
            <span>{index + 1}. {item.name}</span>
            <span>{item.score}</span>
          </ScoreItem>
        ))}
      </ScoreList>
    </LeaderboardContainer>
  );
};

export default Leaderboard;
