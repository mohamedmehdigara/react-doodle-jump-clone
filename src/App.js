import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// --- Global Styles & Animations ---
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #1a1a2e;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

// --- Styled Components ---
const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CanvasWrapper = styled.div`
  position: relative;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
  border: 5px solid #16213e;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
`;

const Canvas = styled.canvas`
  display: block;
  background-color: #fafafa;
`;

const UIOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.isGameOver ? 'rgba(233, 69, 96, 0.85)' : 'rgba(26, 26, 46, 0.9)'};
  z-index: 10;
  text-align: center;
`;

const ScoreBoard = styled.div`
  position: absolute;
  top: -60px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 24px;
  font-weight: bold;
  color: #e94560;
`;

const Button = styled.button`
  padding: 15px 40px;
  font-size: 20px;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  font-weight: bold;
  margin-top: 20px;

  &:hover {
    background: #ff5e78;
    transform: scale(1.1);
  }
`;

const Title = styled.h1`
  font-size: 48px;
  margin: 0;
  color: #e94560;
  text-shadow: 2px 2px #16213e;
`;

const JumpIcon = styled.div`
  font-size: 60px;
  animation: ${bounce} 1s infinite ease-in-out;
`;

// --- Game Constants ---
const WIDTH = 400;
const HEIGHT = 600;
const GRAVITY = 0.3;
const JUMP = -10;

const App = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAME_OVER
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Use refs for game logic to avoid re-render lag
  const player = useRef({ x: WIDTH / 2, y: HEIGHT - 100, vx: 0, vy: 0 });
  const platforms = useRef([]);
  const keys = useRef({});
  const scrollOffset = useRef(0);

  const initGame = () => {
    player.current = { x: WIDTH / 2 - 20, y: HEIGHT - 150, vx: 0, vy: 0 };
    platforms.current = [];
    
    // Initial floor
    platforms.current.push({ x: 0, y: HEIGHT - 20, w: WIDTH, h: 20 });

    // Initial platforms
    for (let i = 0; i < 7; i++) {
      platforms.current.push({
        x: Math.random() * (WIDTH - 60),
        y: HEIGHT - (i * 100) - 100,
        w: 60,
        h: 15
      });
    }

    setScore(0);
    scrollOffset.current = 0;
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const update = () => {
      const p = player.current;

      // Input
      if (keys.current['ArrowLeft']) p.vx = -6;
      else if (keys.current['ArrowRight']) p.vx = 6;
      else p.vx *= 0.8;

      // Physics
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;

      // Wrapping
      if (p.x < -30) p.x = WIDTH;
      if (p.x > WIDTH) p.x = -30;

      // Collisions
      if (p.vy > 0) {
        platforms.current.forEach(plat => {
          if (
            p.x + 30 > plat.x &&
            p.x < plat.x + plat.w &&
            p.y + 40 > plat.y &&
            p.y + 40 < plat.y + plat.h + 10
          ) {
            p.vy = JUMP;
            p.y = plat.y - 40;
          }
        });
      }

      // Scrolling
      if (p.y < HEIGHT / 2) {
        const diff = HEIGHT / 2 - p.y;
        p.y = HEIGHT / 2;
        scrollOffset.current += diff;
        setScore(Math.floor(scrollOffset.current / 10));

        platforms.current.forEach(plat => {
          plat.y += diff;
        });
      }

      // Remove off-screen platforms & spawn new ones
      if (platforms.current[0].y > HEIGHT) {
        platforms.current.shift();
        const lastPlat = platforms.current[platforms.current.length - 1];
        platforms.current.push({
          x: Math.random() * (WIDTH - 60),
          y: lastPlat.y - 100,
          w: 60,
          h: 15
        });
      }

      // Game Over
      if (p.y > HEIGHT) {
        setGameState('GAME_OVER');
        setHighScore(prev => Math.max(prev, Math.floor(scrollOffset.current / 10)));
        return;
      }

      render();
      animationId = requestAnimationFrame(update);
    };

    const render = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Background Grid
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      for(let i=0; i<WIDTH; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, HEIGHT); ctx.stroke();
      }
      for(let i=0; i<HEIGHT; i+=40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WIDTH, i); ctx.stroke();
      }

      // Platforms
      ctx.fillStyle = '#4ecca3';
      platforms.current.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeStyle = '#1a1a2e';
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      });

      // Player
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.roundRect(player.current.x, player.current.y, 40, 40, 8);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = 'white';
      ctx.fillRect(player.current.x + 8, player.current.y + 10, 8, 8);
      ctx.fillRect(player.current.x + 24, player.current.y + 10, 8, 8);
      ctx.fillStyle = 'black';
      ctx.fillRect(player.current.x + 10 + (player.current.vx > 0 ? 2 : -2), player.current.y + 12, 4, 4);
      ctx.fillRect(player.current.x + 26 + (player.current.vx > 0 ? 2 : -2), player.current.y + 12, 4, 4);
    };

    const handleKeyDown = (e) => { keys.current[e.key] = true; };
    const handleKeyUp = (e) => { keys.current[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    update();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <>
      <GlobalStyle />
      <GameContainer>
        <CanvasWrapper>
          <ScoreBoard>
            <span>High: {highScore}</span>
            <span>{score}</span>
          </ScoreBoard>
          
          <Canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />

          {gameState === 'START' && (
            <UIOverlay>
              <JumpIcon>🚀</JumpIcon>
              <Title>DOODLE REACT</Title>
              <p>Use Left/Right Arrows</p>
              <Button onClick={initGame}>PLAY NOW</Button>
            </UIOverlay>
          )}

          {gameState === 'GAME_OVER' && (
            <UIOverlay isGameOver>
              <h1 style={{fontSize: '50px'}}>CRASHED!</h1>
              <p style={{fontSize: '24px'}}>Final Score: {score}</p>
              <Button onClick={initGame}>TRY AGAIN</Button>
            </UIOverlay>
          )}
        </CanvasWrapper>
      </GameContainer>
    </>
  );
};

export default App;