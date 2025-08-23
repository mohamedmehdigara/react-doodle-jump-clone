import React, {useState, useEffect} from "react";


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