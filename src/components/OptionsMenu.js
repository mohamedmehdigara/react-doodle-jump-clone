import React, {useState, useEffect} from "react";
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





const OptionsMenu = ({ onBack }) => {
  const [isSoundOn, setIsSoundOn] = useState(true);

  return (
    <MenuContainer>
      <Title>Options</Title>
      <div className="flex items-center justify-between w-full mt-4 mb-4">
        <label htmlFor="sound-toggle" className="text-gray-600">Sound</label>
        <button
          onClick={() => setIsSoundOn(!isSoundOn)}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${isSoundOn ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
        >
          {isSoundOn ? 'On' : 'Off'}
        </button>
      </div>
      <BlueButton onClick={onBack}>
        Back to Main Menu
      </BlueButton>
    </MenuContainer>
  );
};

export default OptionsMenu;