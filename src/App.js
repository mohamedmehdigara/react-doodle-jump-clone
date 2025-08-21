import React, { useState, useEffect, useRef } from 'react';
import StartMenu from './components/StartMenu';

// Main App component for the Doodle Jump game


// Main App component for the Doodle Jump game
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
    platforms: [], // Array to hold all platforms
    score: 0,      // Player's score
    isGameOver: false,
  });

  // State to control whether the game is running or if the menu is showing
  const [isGameStarted, setIsGameStarted] = useState(false);

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

  // Function to create a new platform with a random type
  const createPlatform = (y) => {
    const platformType = Math.random();
    let platform = {};
    if (platformType < 0.7) {
      // 70% chance of a static platform
      platform = {
        x: Math.random() * (400 - platformWidth),
        y: y,
        width: platformWidth,
        height: platformHeight,
        type: 'static',
      };
    } else if (platformType < 0.9) {
      // 20% chance of a moving platform
      platform = {
        x: Math.random() * (400 - platformWidth),
        y: y,
        width: platformWidth,
        height: platformHeight,
        type: 'moving',
        vx: 1.5,
      };
    } else {
      // 10% chance of a breakable platform
      platform = {
        x: Math.random() * (400 - platformWidth),
        y: y,
        width: platformWidth,
        height: platformHeight,
        type: 'breakable',
        isBroken: false,
      };
    }

    // Add a spring power-up with a 15% chance
    if (Math.random() < 0.15) {
      platform.powerUp = {
        x: platform.x + platform.width / 2 - 10,
        y: platform.y - 20,
        width: 20,
        height: 20,
        type: 'spring',
      };
    }

    return platform;
  };

  // Initialize the game when the component mounts or starts
  useEffect(() => {
    if (!isGameStarted) return;

    const initialPlatforms = [];
    for (let i = 0; i < platformCount; i++) {
      initialPlatforms.push(createPlatform(500 - (i * platformGap) - 50));
    }
    setGameState(prev => ({
      ...prev,
      platforms: initialPlatforms,
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
    const context = canvas.getContext('2d');

    let animationFrameId;

    const gameLoop = () => {
      setGameState(prev => {
        const newPlayer = { ...prev.player };
        let newPlatforms = [...prev.platforms];
        let newScore = prev.score;
        let gameOver = false;

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
        }

        // Update moving platforms' positions
        newPlatforms = newPlatforms.map(platform => {
          if (platform.type === 'moving') {
            platform.x += platform.vx;
            // Reverse direction if platform hits the canvas edges
            if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
              platform.vx *= -1;
            }
          }
          return platform;
        });

        // Check for platform collisions
        newPlatforms.forEach((platform, index) => {
          // AABB collision detection
          if (
            newPlayer.vy > 0 && // Player is falling
            newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y + newPlayer.height < platform.y + platform.height &&
            newPlayer.y + newPlayer.height > platform.y
          ) {
            if (platform.type !== 'breakable') {
              newPlayer.vy = jumpForce; // Jump!
            } else {
              // Breakable platform disappears after one jump
              newPlatforms.splice(index, 1);
            }
            // Check for power-up collision on the platform
            if (platform.powerUp && platform.powerUp.type === 'spring') {
              newPlayer.vy = superJumpForce; // Super jump!
              delete platform.powerUp; // Remove the power-up after use
            }
          }
        });

        // If player moves up, shift platforms and generate new ones
        if (newPlayer.y < canvas.height / 2 && newPlayer.vy < 0) {
          const shiftAmount = -newPlayer.vy;
          newPlayer.y = canvas.height / 2;
          newScore += shiftAmount;
          newPlatforms.forEach(p => {
            p.y += shiftAmount;
            if (p.powerUp) {
              p.powerUp.y += shiftAmount;
            }
          });
        }

        // Remove off-screen platforms and add new ones
        const visiblePlatforms = newPlatforms.filter(p => p.y < canvas.height);
        while (visiblePlatforms.length < platformCount) {
          const lastPlatform = visiblePlatforms[visiblePlatforms.length - 1];
          visiblePlatforms.push(createPlatform(lastPlatform.y - platformGap - (Math.random() * 20)));
        }

        return {
          ...prev,
          player: newPlayer,
          platforms: visiblePlatforms,
          score: newScore,
          isGameOver: gameOver,
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

      context.fillStyle = '#4CAF50';
      context.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

      gameState.platforms.forEach(platform => {
        if (platform.type === 'static') {
          context.fillStyle = '#654321';
        } else if (platform.type === 'moving') {
          context.fillStyle = '#FFC107'; // Yellow for moving platforms
        } else if (platform.type === 'breakable') {
          context.fillStyle = '#F44336'; // Red for breakable platforms
        }
        context.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Draw the power-up if it exists
        if (platform.powerUp) {
          context.fillStyle = '#00FFFF'; // A bright color for the spring
          context.fillRect(platform.powerUp.x, platform.powerUp.y, platform.powerUp.width, platform.powerUp.height);
        }
      });

      context.fillStyle = '#333';
      context.font = '24px Inter, sans-serif';
      context.textAlign = 'center';
      context.fillText(`Score: ${Math.floor(gameState.score / 10)}`, canvas.width / 2, 30);
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
      score: 0,
      isGameOver: false,
    });
    setIsGameStarted(true);
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
        {!isGameStarted && <StartMenu onStart={() => setIsGameStarted(true)} />}
        {gameState.isGameOver && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-xl">Final Score: {Math.floor(gameState.score / 10)}</p>
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition duration-300 transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
