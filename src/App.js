import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// ===================================
// STYLED COMPONENTS FOR ALL MENUS
// ===================================

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

// ===================================
// START MENU COMPONENT
// ===================================
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
      <Button onClick={onStart}>
        Start Game
      </Button>
    </MenuContainer>
  );
};

// ===================================
// GAME OVER MENU COMPONENT
// ===================================
const GameOverMenu = ({ finalScore, highScore, onRestart, onShowLeaderboard }) => {
  return (
    <DarkMenuContainer>
      <DarkTitle>Game Over!</DarkTitle>
      <ScoreText>Final Score: {finalScore}</ScoreText>
      <ScoreText>High Score: {highScore}</ScoreText>
      <BlueButton onClick={onRestart}>
        Play Again
      </BlueButton>
      <BlueButton onClick={onShowLeaderboard} style={{ marginTop: '10px' }}>
        Show Leaderboard
      </BlueButton>
    </DarkMenuContainer>
  );
};

// ===================================
// LEADERBOARD COMPONENT
// ===================================
const Leaderboard = ({ scores, onBack }) => {
  return (
    <MenuContainer>
      <Title>Leaderboard</Title>
      <ScoreList>
        {scores.map((item, index) => (
          <ScoreItem key={index}>
            <span>{index + 1}. {item.name}</span>
            <span>{item.score}</span>
          </ScoreItem>
        ))}
      </ScoreList>
      <Button onClick={onBack}>Back to Main Menu</Button>
    </MenuContainer>
  );
};

// ===================================
// MAIN APP COMPONENT
// ===================================
const App = () => {
  // Use a ref to access the canvas element
  const canvasRef = useRef(null);

  // Define game constants and state variables
  const [gameState, setGameState] = useState({
    player: {
      x: 200, // Player's horizontal position
      y: 100, // Player's vertical position
      vx: 0,  // Horizontal velocity
      vy: 0,  // Vertical velocity
      width: 40,
      height: 40,
    },
    platforms: [],    // Array to hold all platforms
    enemies: [],      // Array to hold enemy monsters
    score: 0,         // Player's current score
    highScore: 0,     // Highest score achieved, loaded from local storage
    isGameOver: false,
    isShielded: false, // New: Is the player currently shielded?
    shieldTimer: 0,    // New: Countdown for the shield duration
    scoreMultiplier: 1, // New: Score multiplier (1x by default)
    multiplierTimer: 0, // New: Countdown for the multiplier duration
  });

  // State to control which screen is visible
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Game settings
  const gravity = 0.5;
  const jumpForce = -12;
  const superJumpForce = -25; // Extra jump force for the spring
  const platformCount = 10;
  const platformGap = 60;
  const platformWidth = 80;
  const platformHeight = 10;
  const playerSpeed = 5;

  // Key state for player horizontal movement
  const keys = useRef({});
  
  // Dummy scores for the leaderboard
  const dummyScores = [
    { name: "Player 1", score: 1540 },
    { name: "Player 2", score: 1320 },
    { name: "Player 3", score: 1150 },
    { name: "Player 4", score: 980 },
    { name: "Player 5", score: 760 },
  ];

  // Function to create a new platform with a random type and power-up
  const createPlatform = (y) => {
    const platformType = Math.random();
    let platform = {};

    if (platformType < 0.6) {
      // 60% chance of a static platform
      platform = { x: Math.random() * (400 - platformWidth), y, width: platformWidth, height: platformHeight, type: 'static' };
    } else if (platformType < 0.85) {
      // 25% chance of a moving platform
      platform = { x: Math.random() * (400 - platformWidth), y, width: platformWidth, height: platformHeight, type: 'moving', vx: 1.5 };
    } else {
      // 15% chance of a breakable platform
      platform = { x: Math.random() * (400 - platformWidth), y, width: platformWidth, height: platformHeight, type: 'breakable', isBroken: false };
    }

    // Add a power-up with a 10% chance
    if (Math.random() < 0.1) {
      const powerUpType = Math.random();
      if (powerUpType < 0.5) {
        // 50% chance for a spring
        platform.powerUp = { x: platform.x + platform.width / 2 - 10, y: platform.y - 20, width: 20, height: 20, type: 'spring' };
      } else if (powerUpType < 0.8) {
        // 30% chance for a shield
        platform.powerUp = { x: platform.x + platform.width / 2 - 10, y: platform.y - 20, width: 20, height: 20, type: 'shield' };
      } else {
        // 20% chance for a score multiplier
        platform.powerUp = { x: platform.x + platform.width / 2 - 10, y: platform.y - 20, width: 20, height: 20, type: 'multiplier' };
      }
    }

    return platform;
  };

  // Function to create a new enemy with a random position
  const createEnemy = (y) => {
    return {
      x: Math.random() * (400 - 30),
      y: y,
      width: 30,
      height: 30,
      vx: Math.random() > 0.5 ? 1 : -1, // Random initial direction
    };
  };

  // Initialize the game, load high score, and set up platforms/enemies
  useEffect(() => {
    // Load high score from local storage on first render
    const storedHighScore = localStorage.getItem('doodleJumpHighScore');
    if (storedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(storedHighScore, 10) }));
    }

    if (!isGameStarted) return;

    const initialPlatforms = [];
    const initialEnemies = [];
    for (let i = 0; i < platformCount; i++) {
      const newPlatform = createPlatform(500 - (i * platformGap) - 50);
      initialPlatforms.push(newPlatform);
      // New: Add an enemy randomly
      if (Math.random() < 0.2) {
        initialEnemies.push(createEnemy(newPlatform.y - 50));
      }
    }
    setGameState(prev => ({
      ...prev,
      platforms: initialPlatforms,
      enemies: initialEnemies,
    }));
  }, [isGameStarted]);

  // Set up keyboard event listeners for player movement
  useEffect(() => {
    if (!isGameStarted) return;

    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameStarted]);

  // Main game loop using requestAnimationFrame
  useEffect(() => {
    if (!isGameStarted || gameState.isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let animationFrameId;

    const gameLoop = () => {
      setGameState(prev => {
        const newPlayer = { ...prev.player };
        let newPlatforms = [...prev.platforms];
        let newEnemies = [...prev.enemies];
        let newScore = prev.score;
        let newHighScore = prev.highScore;
        let gameOver = false;
        let isShielded = prev.isShielded;
        let shieldTimer = prev.shieldTimer;
        let scoreMultiplier = prev.scoreMultiplier;
        let multiplierTimer = prev.multiplierTimer;

        // Player movement based on key input
        if (keys.current['ArrowLeft'] || keys.current['a']) {
          newPlayer.vx = -playerSpeed;
        } else if (keys.current['ArrowRight'] || keys.current['d']) {
          newPlayer.vx = playerSpeed;
        } else {
          newPlayer.vx = 0;
        }

        // Apply velocity and gravity
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;
        newPlayer.vy += gravity;

        // Wrap player position horizontally
        if (newPlayer.x > canvas.width) newPlayer.x = -newPlayer.width;
        if (newPlayer.x < -newPlayer.width) newPlayer.x = canvas.width;

        // Check for player falling off the bottom
        if (newPlayer.y > canvas.height) {
          gameOver = true;
          // Update high score if current score is greater
          if (Math.floor(newScore / 10) > newHighScore) {
            newHighScore = Math.floor(newScore / 10);
            localStorage.setItem('doodleJumpHighScore', newHighScore);
          }
        }
        
        // --- Power-up Timers ---
        if (isShielded) {
          shieldTimer--;
          if (shieldTimer <= 0) {
            isShielded = false;
          }
        }
        if (scoreMultiplier > 1) {
          multiplierTimer--;
          if (multiplierTimer <= 0) {
            scoreMultiplier = 1;
          }
        }
        // --- End Power-up Timers ---

        // Update moving platforms' positions
        newPlatforms = newPlatforms.map(platform => {
          if (platform.type === 'moving') {
            platform.x += platform.vx;
            if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
              platform.vx *= -1;
            }
          }
          return platform;
        });

        // Update enemy positions
        newEnemies = newEnemies.map(enemy => {
          enemy.x += enemy.vx;
          if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.vx *= -1;
          }
          return enemy;
        });

        // Check for platform collisions
        newPlatforms.forEach((platform, index) => {
          if (
            newPlayer.vy > 0 &&
            newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y + newPlayer.height < platform.y + platform.height &&
            newPlayer.y + newPlayer.height > platform.y
          ) {
            if (platform.type !== 'breakable') {
              newPlayer.vy = jumpForce;
            } else {
              newPlatforms.splice(index, 1);
            }

            // --- Power-up activation ---
            if (platform.powerUp) {
              if (platform.powerUp.type === 'spring') {
                newPlayer.vy = superJumpForce;
              } else if (platform.powerUp.type === 'shield') {
                isShielded = true;
                shieldTimer = 300; // 5 seconds at 60fps
              } else if (platform.powerUp.type === 'multiplier') {
                scoreMultiplier = 2;
                multiplierTimer = 300; // 5 seconds
              }
              delete platform.powerUp;
            }
          }
        });

        // Check for enemy collisions
        newEnemies.forEach(enemy => {
          if (
            newPlayer.x < enemy.x + enemy.width &&
            newPlayer.x + newPlayer.width > enemy.x &&
            newPlayer.y < enemy.y + enemy.height &&
            newPlayer.y + newPlayer.height > enemy.y
          ) {
            // New: Only end the game if the player is NOT shielded
            if (!isShielded) {
              gameOver = true;
              if (Math.floor(newScore / 10) > newHighScore) {
                newHighScore = Math.floor(newScore / 10);
                localStorage.setItem('doodleJumpHighScore', newHighScore);
              }
            }
          }
        });

        // If player moves up, shift platforms and generate new ones
        if (newPlayer.y < canvas.height / 2 && newPlayer.vy < 0) {
          const shiftAmount = -newPlayer.vy;
          newPlayer.y = canvas.height / 2;
          // Apply the score multiplier
          newScore += shiftAmount * scoreMultiplier;
          newPlatforms.forEach(p => {
            p.y += shiftAmount;
            if (p.powerUp) {
              p.powerUp.y += shiftAmount;
            }
          });
          // Shift enemies as well
          newEnemies.forEach(e => (e.y += shiftAmount));
        }

        // Remove off-screen platforms/enemies and add new ones
        const visiblePlatforms = newPlatforms.filter(p => p.y < canvas.height);
        const visibleEnemies = newEnemies.filter(e => e.y < canvas.height);

        while (visiblePlatforms.length < platformCount) {
          const lastPlatform = visiblePlatforms[visiblePlatforms.length - 1];
          const newY = lastPlatform.y - platformGap - (Math.random() * 20);
          const newPlatform = createPlatform(newY);
          visiblePlatforms.push(newPlatform);
          if (Math.random() < 0.2) { // Chance to add a new enemy
            visibleEnemies.push(createEnemy(newPlatform.y - 50));
          }
        }

        return {
          ...prev,
          player: newPlayer,
          platforms: visiblePlatforms,
          enemies: visibleEnemies,
          score: newScore,
          highScore: newHighScore,
          isGameOver: gameOver,
          isShielded,
          shieldTimer,
          scoreMultiplier,
          multiplierTimer,
        };
      });
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameStarted, gameState.isGameOver]);

  // Use a separate useEffect for drawing on the canvas
  useEffect(() => {
    if (!isGameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#f0f8ff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the player
      context.fillStyle = '#4CAF50';
      context.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

      // Draw shield if active
      if (gameState.isShielded) {
        context.fillStyle = 'rgba(0, 255, 255, 0.4)'; // Cyan with transparency
        context.beginPath();
        context.arc(
          gameState.player.x + gameState.player.width / 2,
          gameState.player.y + gameState.player.height / 2,
          gameState.player.width * 0.8,
          0,
          2 * Math.PI
        );
        context.fill();
      }

      // Draw platforms and power-ups
      gameState.platforms.forEach(platform => {
        if (platform.type === 'static') {
          context.fillStyle = '#654321';
        } else if (platform.type === 'moving') {
          context.fillStyle = '#FFC107'; // Yellow for moving platforms
        } else if (platform.type === 'breakable') {
          context.fillStyle = '#F44336'; // Red for breakable platforms
        }
        context.fillRect(platform.x, platform.y, platform.width, platform.height);

        if (platform.powerUp) {
          if (platform.powerUp.type === 'spring') {
            context.fillStyle = '#00FFFF';
            context.fillRect(platform.powerUp.x, platform.powerUp.y, platform.powerUp.width, platform.powerUp.height);
          } else if (platform.powerUp.type === 'shield') {
            context.fillStyle = '#0000FF'; // Blue for shield
            context.beginPath();
            context.arc(
              platform.powerUp.x + platform.powerUp.width / 2,
              platform.powerUp.y + platform.powerUp.height / 2,
              platform.powerUp.width / 2,
              0,
              2 * Math.PI
            );
            context.fill();
          } else if (platform.powerUp.type === 'multiplier') {
            context.fillStyle = '#FFD700'; // Gold for multiplier
            context.font = '16px Inter, sans-serif';
            context.textAlign = 'center';
            context.fillText('2x', platform.powerUp.x + platform.powerUp.width / 2, platform.powerUp.y + platform.powerUp.height - 5);
          }
        }
      });

      // Draw the enemies
      gameState.enemies.forEach(enemy => {
        context.fillStyle = '#8A2BE2'; // Purple for monsters
        context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      });

      // Draw the scores
      context.fillStyle = '#333';
      context.font = '24px Inter, sans-serif';
      context.textAlign = 'center';
      context.fillText(`Score: ${Math.floor(gameState.score / 10)}`, canvas.width / 2, 30);
      context.fillText(`High Score: ${gameState.highScore}`, canvas.width / 2, 60);

      // Draw power-up status
      context.font = '16px Inter, sans-serif';
      context.textAlign = 'right';
      if (gameState.isShielded) {
        context.fillStyle = 'blue';
        context.fillText(`Shield: ${Math.ceil(gameState.shieldTimer / 60)}s`, canvas.width - 10, 30);
      }
      if (gameState.scoreMultiplier > 1) {
        context.fillStyle = 'gold';
        context.fillText(`Multiplier: ${Math.ceil(gameState.multiplierTimer / 60)}s`, canvas.width - 10, 50);
      }
    };

    draw();

  }, [isGameStarted, gameState]);

  // Function to reset the game
  const resetGame = () => {
    setGameState({
      player: {
        x: 200,
        y: 100,
        vx: 0,
        vy: 0,
        width: 40,
        height: 40,
      },
      platforms: [],
      enemies: [],
      score: 0,
      highScore: gameState.highScore,
      isGameOver: false,
      isShielded: false,
      shieldTimer: 0,
      scoreMultiplier: 1,
      multiplierTimer: 0,
    });
    setIsGameStarted(true);
    setShowLeaderboard(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center relative">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Doodle Jump</h1>
        <canvas
          ref={canvasRef}
          width="400"
          height="600"
          className="rounded-lg shadow-inner border-4 border-gray-300"
          style={{ backgroundColor: '#f0f8ff' }}
        />
        {/* Render the appropriate menu based on game state */}
        {!isGameStarted && !showLeaderboard && (
          <StartMenu onStart={() => setIsGameStarted(true)} highScore={gameState.highScore} />
        )}
        {gameState.isGameOver && !showLeaderboard && (
          <GameOverMenu
            finalScore={Math.floor(gameState.score / 10)}
            highScore={gameState.highScore}
            onRestart={resetGame}
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
        {showLeaderboard && (
          <Leaderboard
            scores={dummyScores}
            onBack={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
