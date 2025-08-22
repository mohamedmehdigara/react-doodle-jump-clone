const PauseMenu = ({ onResume, onQuit }) => {
  return (
    <DarkMenuContainer>
      <DarkTitle>Paused</DarkTitle>
      <BlueButton onClick={onResume}>
        Resume
      </BlueButton>
      <BlueButton onClick={onQuit} style={{ marginTop: '10px' }}>
        Quit Game
      </BlueButton>
    </DarkMenuContainer>
  );
};
export default PauseMenu;