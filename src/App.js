import React, { useState, useEffect, useRef } from 'react';
import StartMenu from './components/StartMenu';

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
  const platformCount = 10;
  const platformGap = 60;
  const platformWidth = 80;
  const platformHeight = 10;
  const playerSpeed = 5;

  // Key state for player horizontal movement
  const keys = useRef({});

  // Initialize the game when the component mounts
  useEffect(() => {
    if (!isGameStarted) return; // Don't initialize if game hasn't started yet

    // Set up the initial platforms
    const initialPlatforms = [];
    for (let i = 0; i < platformCount; i++) {
      initialPlatforms.push({
        x: Math.random() * (400 - platformWidth),
        y: 500 - (i * platformGap) - 50,
        width: platformWidth,
        height: platformHeight,
      });
    }
    setGameState(prev => ({
      ...prev,
      platforms: initialPlatforms,
    }));
  }, [isGameStarted]);

  // Set up keyboard event listeners for player movement
  useEffect(() => {
    if (!isGameStarted) return; // Only listen for keys when game is active

    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up event listeners on component unmount
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
        const newPlatforms = [...prev.platforms];
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

        // Wrap player position around the screen horizontally
        if (newPlayer.x > canvas.width) newPlayer.x = -newPlayer.width;
        if (newPlayer.x < -newPlayer.width) newPlayer.x = canvas.width;

        // Check for player falling off the bottom
        if (newPlayer.y > canvas.height) {
          gameOver = true;
        }

        // Check for platform collisions
        newPlatforms.forEach(platform => {
          // AABB collision detection
          if (
            newPlayer.vy > 0 && // Player is falling
            newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y + newPlayer.height < platform.y + platform.height &&
            newPlayer.y + newPlayer.height > platform.y
          ) {
            newPlayer.vy = jumpForce; // Jump!
          }
        });

        // If player moves up, shift platforms and generate new ones
        if (newPlayer.y < canvas.height / 2 && newPlayer.vy < 0) {
          const shiftAmount = -newPlayer.vy;
          newPlayer.y = canvas.height / 2;
          newScore += shiftAmount;
          newPlatforms.forEach(p => (p.y += shiftAmount));
        }

        // Remove off-screen platforms and add new ones
        const visiblePlatforms = newPlatforms.filter(p => p.y < canvas.height);
        while (visiblePlatforms.length < platformCount) {
          const lastPlatform = visiblePlatforms[visiblePlatforms.length - 1];
          visiblePlatforms.push({
            x: Math.random() * (400 - platformWidth),
            y: lastPlatform.y - platformGap - (Math.random() * 20),
            width: platformWidth,
            height: platformHeight,
          });
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

    // Clean up the animation frame on component unmount or game over
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameStarted, gameState.isGameOver]);

  // Use a separate useEffect for drawing on the canvas
  useEffect(() => {
    if (!isGameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Drawing function
    const draw = () => {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      context.fillStyle = '#f0f8ff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw player
      context.fillStyle = '#4CAF50';
      context.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

      // Draw platforms
      context.fillStyle = '#654321';
      gameState.platforms.forEach(platform => {
        context.fillRect(platform.x, platform.y, platform.width, platform.height);
      });

      // Draw score
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
    // Start the game again
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
