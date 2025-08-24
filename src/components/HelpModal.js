import React from "react";
import styled from "styled-components";


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


const Title = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
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



const HelpModal = ({ onBack }) => {
  return (
    <MenuContainer style={{ textAlign: 'left' }}>
      <Title>How to Play</Title>
      <div className="text-gray-600 space-y-4">
        <p className="text-center">Your goal is to jump as high as you can!</p>
        <div>
          <h3 className="font-bold text-lg mb-1">Controls</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Move Left: Left Arrow or 'A'</li>
            <li>Move Right: Right Arrow or 'D'</li>
            <li>Pause Game: 'P' or 'Escape'</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">Platforms</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>**Green Platforms:** Standard platforms. Jump on them to get a boost.</li>
            <li>**Blue Platforms:** Spring platforms. Give you a much higher jump!</li>
            <li>**Brown Platforms:** Break after you land on them once.</li>
            <li>**White Platforms:** They move! Be careful not to miss them.</li>
          </ul>
        </div>
      </div>
      <BlueButton onClick={onBack} style={{ marginTop: '20px' }}>
        Back to Main Menu
      </BlueButton>
    </MenuContainer>
  );
};

export default HelpModal;