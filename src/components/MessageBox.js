import React, {useState, useEffect} from "react";
import styled, {keyframes} from "styled-components";


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


const MessageBox = ({ message }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIsFadingOut(false);
      const timer = setTimeout(() => {
        setIsFadingOut(true);
      }, 1500); // Display for 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!currentMessage) return null;

  return (
    <MessageBoxContainer isFadingOut={isFadingOut} onAnimationEnd={() => {
      if (isFadingOut) setCurrentMessage(null);
    }}>
      {currentMessage}
    </MessageBoxContainer>
  );
};

export default MessageBox;