import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import HelpModal from './components/HelpModal';
import GameOverMenu from './components/GameOverMenu';
import PauseMenu from './components/PauseMenu';
import OptionsMenu from './components/OptionsMenu';
import Leaderboard from './components/Leaderboard';
import MessageBox from './components/MessageBox';
import StartMenu from './components/StartMenu';

// ===================================
// FIREBASE IMPORTS AND CONFIG
// ===================================
// --- STYLED COMPONENTS ---

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

// ===================================
// IN-GAME MESSAGE BOX COMPONENT
// ===================================

// ===================================
// START MENU COMPONENT
// ===================================

// ===================================
// GAME OVER MENU COMPONENT
// ===================================

// ===================================
// LEADERBOARD COMPONENT
// ===================================

// ===================================
// PAUSE MENU COMPONENT
// ===================================

// ===================================
// OPTIONS MENU COMPONENT
// ===================================

// ===================================
// HELP MODAL COMPONENT
// ===================================

// ===================================
// MAIN APP COMPONENT
// ===================================


// ===================================
// IN-GAME MESSAGE BOX COMPONENT
// ===================================

// ===================================
// START MENU COMPONENT
// ===================================

// ===================================
// GAME OVER MENU COMPONENT
// ===================================


// ===================================
// LEADERBOARD COMPONENT
// ===================================

// ===================================
// PAUSE MENU COMPONENT
// ===================================


// ===================================
// OPTIONS MENU COMPONENT
// ===================================

// ===================================
// HELP MODAL COMPONENT
// ===================================

// ===================================
// MAIN APP COMPONENT
// ===================================
const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState(null);
  const [bossMessage, setBossMessage] = useState(null);
  
  // Game state
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  // Firestore-related states
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName] = useState('DoodleJumper'); // Hardcoded since profile editing is removed
  const [highScore, setHighScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  // --- Firebase and Firestore Setup ---


  // --- Game Loop and Drawing Logic ---
  useEffect(() => {
    if (!isGameStarted || isPaused) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Game variables
    const gravity = 0.3;
    const normalJumpVelocity = -10;
    const springJumpVelocity = -20;
    const superJumpVelocity = -30;
    const shieldDuration = 5000; // 5 seconds
    const bouncingProjectileDuration = 10000; // 10 seconds
    const BOSS_SCORE_THRESHOLD = 2000;
    const BOSS_SPAWN_Y = canvas.height / 4;
    const BOSS_WIDTH = 100;
    const BOSS_HEIGHT = 80;
    const BOSS_MOVE_SPEED = 2;
    const BOSS_HEALTH = 10;
    const BOSS_FIRE_COOLDOWN = 1500; // 1.5 seconds

    let player = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: 40,
      height: 40,
      velocityY: 0,
      velocityX: 0,
      hasShield: false,
      shieldEndTime: 0,
      hasBouncingProjectiles: false,
      bouncingProjectileEndTime: 0,
    };
    let platforms = [];
    let enemies = [];
    let projectiles = [];
    let springs = [];
    let shields = [];
    let bouncingProjectileItems = [];
    let boss = null;
    let bossProjectiles = [];
    let lastBossFireTime = 0;

    const initialPlatformCount = 10;
    const platformWidth = 70;
    const platformHeight = 10;
    const playerSpeed = 5;
    let score = 0;
    let maxScore = 0;

    // Keyboard state
    let keys = {};
    const handleKeyDown = (e) => {
      keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };
    const handleKeyUp = (e) => {
      keys[e.key] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Function to create a new platform at the top with a random type
    const createNewPlatform = () => {
      // Adjusted probabilities to include the new purple platform
      const rand = Math.random();
      let type = '';
      if (rand < 0.6) {
        type = 'green';
      } else if (rand < 0.7) {
        type = 'blue';
      } else if (rand < 0.8) {
        type = 'brown';
      } else if (rand < 0.95) {
        type = 'moving';
      } else {
        type = 'purple'; // The new super-jump platform
      }
      
      platforms.push({
        x: Math.random() * (canvas.width - platformWidth),
        y: -platformHeight, // Start just above the canvas
        width: platformWidth,
        height: platformHeight,
        type: type,
        color: type === 'green' ? '#22c55e' : (type === 'blue' ? '#3b82f6' : (type === 'brown' ? '#a16207' : (type === 'moving' ? '#FFFFFF' : '#8b5cf6'))),
        velocityX: type === 'moving' ? (Math.random() > 0.5 ? 2 : -2) : 0,
      });
    };

    // Function to create a new enemy
    const createNewEnemy = () => {
      enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        velocityX: Math.random() > 0.5 ? 1 : -1,
      });
    };

    // Function to create a new projectile
    const createProjectile = () => {
      const isBouncing = player.hasBouncingProjectiles;
      projectiles.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: isBouncing ? 10 : 5,
        height: isBouncing ? 20 : 10,
        velocityY: -10,
        velocityX: isBouncing ? (Math.random() > 0.5 ? 2 : -2) : 0, // Give initial horizontal velocity
        isBouncing: isBouncing,
      });
    };

    // Function to create a new spring
    const createNewSpring = (platform) => {
      springs.push({
        x: platform.x + platform.width / 2 - 5,
        y: platform.y - 20,
        width: 10,
        height: 20,
        color: '#ff0000', // Red color for springs
      });
    };

    // Function to create a new shield
    const createNewShield = () => {
      shields.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        color: 'yellow',
      });
    };

    // Function to create a new bouncing projectile power-up
    const createNewBouncingProjectileItem = () => {
      bouncingProjectileItems.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        color: 'cyan', // Blue lightning bolt
      });
    };
    
    // Function to initialize platforms, with a chance to spawn springs on them
    const createInitialPlatforms = () => {
        platforms = [];
        springs = [];
        shields = [];
        bouncingProjectileItems = [];
        platforms.push({
            x: canvas.width / 2 - platformWidth / 2,
            y: canvas.height - 50,
            width: platformWidth,
            height: platformHeight,
            type: 'green',
            color: '#22c55e',
            velocityX: 0,
        });
        for (let i = 1; i < initialPlatformCount; i++) {
            createNewPlatform();
            platforms[i].y = (canvas.height / initialPlatformCount) * i;
            if (Math.random() < 0.1) { // 10% chance to spawn a spring on a platform
                createNewSpring(platforms[i]);
            }
        }
    };

    // Function to create the boss
    const createBoss = () => {
      boss = {
        x: canvas.width / 2 - BOSS_WIDTH / 2,
        y: -BOSS_HEIGHT, // Start above the screen
        width: BOSS_WIDTH,
        height: BOSS_HEIGHT,
        velocityX: BOSS_MOVE_SPEED,
        health: BOSS_HEALTH,
        maxHealth: BOSS_HEALTH,
        isAlive: true,
      };
      setBossMessage("The Boss has appeared!");
    };

    // Function to draw all platforms
    const drawPlatforms = () => {
      platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      });
    };

    // Function to draw enemies
    const drawEnemies = () => {
      enemies.forEach(enemy => {
        ctx.fillStyle = '#dc2626'; // Red color
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      });
    };

    // Function to draw projectiles
    const drawProjectiles = () => {
      projectiles.forEach(projectile => {
        if (projectile.isBouncing) {
          ctx.fillStyle = 'blue';
          // Draw a simple lightning bolt shape
          ctx.beginPath();
          ctx.moveTo(projectile.x + projectile.width / 2, projectile.y);
          ctx.lineTo(projectile.x, projectile.y + projectile.height / 2);
          ctx.lineTo(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2);
          ctx.lineTo(projectile.x + projectile.width / 2, projectile.y + projectile.height);
          ctx.lineTo(projectile.x + projectile.width, projectile.y + projectile.height / 2);
          ctx.lineTo(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = 'orange';
          ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        }
      });
    };
    
    // Function to draw boss projectiles
    const drawBossProjectiles = () => {
      bossProjectiles.forEach(proj => {
        ctx.fillStyle = 'purple';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Function to draw springs
    const drawSprings = () => {
      springs.forEach(spring => {
        ctx.fillStyle = spring.color;
        ctx.fillRect(spring.x, spring.y, spring.width, spring.height);
      });
    };

    // Function to draw shields
    const drawShields = () => {
      shields.forEach(shield => {
        ctx.fillStyle = shield.color;
        ctx.beginPath();
        ctx.arc(shield.x + shield.width / 2, shield.y + shield.height / 2, shield.width / 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    // Function to draw bouncing projectile power-up
    const drawBouncingProjectileItems = () => {
      bouncingProjectileItems.forEach(item => {
        ctx.fillStyle = item.color;
        // Draw a simple lightning bolt shape
        ctx.beginPath();
        ctx.moveTo(item.x + item.width / 2, item.y);
        ctx.lineTo(item.x, item.y + item.height / 2);
        ctx.lineTo(item.x + item.width / 2, item.y + item.height / 2);
        ctx.lineTo(item.x + item.width / 2, item.y + item.height);
        ctx.lineTo(item.x + item.width, item.y + item.height / 2);
        ctx.lineTo(item.x + item.width / 2, item.y + item.height / 2);
        ctx.closePath();
        ctx.fill();
      });
    };

    // Function to draw player
    const drawPlayer = () => {
      if (player.hasShield) {
        ctx.fillStyle = '#87ceeb'; // Sky blue for shield
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = 'blue';
      ctx.fillRect(player.x, player.y, player.width, player.height);
    };

    // Function to draw the boss and its health bar
    const drawBoss = () => {
      if (!boss || !boss.isAlive) return;

      // Draw boss
      ctx.fillStyle = 'darkred';
      ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

      // Draw health bar
      const healthBarWidth = 100;
      const healthBarHeight = 10;
      const healthBarX = canvas.width / 2 - healthBarWidth / 2;
      const healthBarY = 40;

      ctx.fillStyle = 'red';
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

      const currentHealthWidth = (boss.health / boss.maxHealth) * healthBarWidth;
      ctx.fillStyle = 'green';
      ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
    };

    // Function for collision detection
    const checkCollision = (rect1, rect2) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const checkCircleRectCollision = (circle, rect) => {
      const distX = Math.abs(circle.x - rect.x - rect.width / 2);
      const distY = Math.abs(circle.y - rect.y - rect.height / 2);

      if (distX > (rect.width / 2 + circle.radius)) { return false; }
      if (distY > (rect.height / 2 + circle.radius)) { return false; }

      if (distX <= (rect.width / 2)) { return true; }
      if (distY <= (rect.height / 2)) { return true; }

      const dx = distX - rect.width / 2;
      const dy = distY - rect.height / 2;
      return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    };

    // Function to draw score
    const drawScore = () => {
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${Math.floor(score)}`, 10, 30);
    };
    
    // Main game loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check and disable shield if duration has passed
      if (player.hasShield && Date.now() > player.shieldEndTime) {
        player.hasShield = false;
        setMessage("Shield deactivated!");
      }
      // Check and disable bouncing projectiles if duration has passed
      if (player.hasBouncingProjectiles && Date.now() > player.bouncingProjectileEndTime) {
        player.hasBouncingProjectiles = false;
        setMessage("Bouncing projectiles deactivated!");
      }

      // Handle key presses
      if (keys['ArrowLeft'] || keys['a']) {
        player.x -= playerSpeed;
      }
      if (keys['ArrowRight'] || keys['d']) {
        player.x += playerSpeed;
      }
      if (keys[' ']) { // Spacebar for shooting
        createProjectile();
        keys[' '] = false; // Prevent continuous shooting
      }
      
      // Wrap player around the screen
      if (player.x + player.width < 0) {
        player.x = canvas.width;
      } else if (player.x > canvas.width) {
        player.x = -player.width;
      }

      // Update moving platforms' position and reverse direction if needed
      platforms.forEach(platform => {
        if (platform.type === 'moving') {
          platform.x += platform.velocityX;
          if (platform.x + platform.width > canvas.width || platform.x < 0) {
            platform.velocityX *= -1;
          }
        }
      });
      
      // Update enemies' position
      enemies.forEach(enemy => {
        enemy.x += enemy.velocityX;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            enemy.velocityX *= -1;
        }
      });
      
      // Handle boss logic
      if (score >= BOSS_SCORE_THRESHOLD && boss === null) {
        createBoss();
      }
      
      if (boss && boss.isAlive) {
        // Move boss
        boss.x += boss.velocityX;
        if (boss.x + boss.width > canvas.width || boss.x < 0) {
          boss.velocityX *= -1;
        }

        // Boss fires projectiles
        if (Date.now() - lastBossFireTime > BOSS_FIRE_COOLDOWN) {
          const angle = Math.atan2(player.y - (boss.y + boss.height), player.x - (boss.x + boss.width / 2));
          bossProjectiles.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height,
            radius: 5,
            velocityX: Math.cos(angle) * 3,
            velocityY: Math.sin(angle) * 3,
          });
          lastBossFireTime = Date.now();
        }
      }

      // Update projectiles' position
      projectiles.forEach(projectile => {
        projectile.y += projectile.velocityY;
        if (projectile.isBouncing) {
          projectile.x += projectile.velocityX;
          // Reverse horizontal velocity if it hits the walls
          if (projectile.x + projectile.width > canvas.width || projectile.x < 0) {
            projectile.velocityX *= -1;
          }
        }
      });

      // Update boss projectiles' position
      bossProjectiles.forEach(proj => {
        proj.x += proj.velocityX;
        proj.y += proj.velocityY;
      });
      
      // If player is moving up and reaches top of screen, scroll elements down
      if (player.velocityY < 0 && player.y < canvas.height / 2) {
          platforms.forEach(platform => {
              platform.y -= player.velocityY;
          });
          enemies.forEach(enemy => {
            enemy.y -= player.velocityY;
          });
          projectiles.forEach(projectile => {
            projectile.y -= player.velocityY;
          });
          bossProjectiles.forEach(proj => {
            proj.y -= player.velocityY;
          });
          springs.forEach(spring => {
            spring.y -= player.velocityY;
          });
          shields.forEach(shield => {
            shield.y -= player.velocityY;
          });
          bouncingProjectileItems.forEach(item => {
            item.y -= player.velocityY;
          });
          if (boss) {
            boss.y -= player.velocityY;
          }
          score += -player.velocityY * 0.1;
      }

      // Update vertical position (gravity)
      player.velocityY += gravity;
      player.y += player.velocityY;

      // Check for platform collisions
      for (let i = 0; i < platforms.length; i++) {
        if (checkCollision(player, platforms[i]) && player.velocityY > 0) {
          // If collision, make player jump based on platform type
          if (platforms[i].type === 'green' || platforms[i].type === 'moving') {
            player.velocityY = normalJumpVelocity;
          } else if (platforms[i].type === 'blue') {
            player.velocityY = springJumpVelocity;
          } else if (platforms[i].type === 'purple') {
            player.velocityY = superJumpVelocity; // Super jump!
          } else if (platforms[i].type === 'brown') {
            platforms.splice(i, 1); // Remove the platform
            i--; // Decrement index to avoid skipping
            player.velocityY = normalJumpVelocity;
          }
        }
      }

      // Check for spring collisions
      for (let i = springs.length - 1; i >= 0; i--) {
        if (checkCollision(player, springs[i])) {
          player.velocityY = superJumpVelocity;
          springs.splice(i, 1); // Remove the spring
        }
      }

      // Check for shield collisions
      for (let i = shields.length - 1; i >= 0; i--) {
        if (checkCollision(player, shields[i])) {
          player.hasShield = true;
          player.shieldEndTime = Date.now() + shieldDuration;
          setMessage("Shield activated!");
          shields.splice(i, 1);
        }
      }

      // Check for bouncing projectile item collisions
      for (let i = bouncingProjectileItems.length - 1; i >= 0; i--) {
        if (checkCollision(player, bouncingProjectileItems[i])) {
          player.hasBouncingProjectiles = true;
          player.bouncingProjectileEndTime = Date.now() + bouncingProjectileDuration;
          setMessage("Bouncing projectiles activated!");
          bouncingProjectileItems.splice(i, 1);
        }
      }

      // Check for enemy collisions
      for (let i = 0; i < enemies.length; i++) {
        if (checkCollision(player, enemies[i])) {
          if (player.hasShield) {
            enemies.splice(i, 1); // Destroy enemy, but player is safe
            setMessage("Enemy destroyed by shield!");
          } else {
            setFinalScore(Math.floor(score));
            setScore(0);
            setIsGameStarted(false);
            return;
          }
        }
      }
      
      // Check for projectile-enemy collisions
      for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          if (checkCollision(projectiles[i], enemies[j])) {
            projectiles.splice(i, 1);
            enemies.splice(j, 1);
            break; // Break inner loop to avoid issues with splice
          }
        }
      }
      
      // Check for projectile-boss collisions
      if (boss && boss.isAlive) {
        for (let i = projectiles.length - 1; i >= 0; i--) {
          if (checkCollision(projectiles[i], boss)) {
            boss.health -= 1;
            projectiles.splice(i, 1);
            if (boss.health <= 0) {
              boss.isAlive = false;
              setFinalScore(Math.floor(score) + 1000); // Bonus score for defeating boss
              setBossMessage("You defeated the Boss! Great job!");
              setTimeout(() => {
                setScore(0);
                setIsGameStarted(false);
              }, 3000); // Game ends after 3 seconds
            } else {
              setBossMessage("Boss hit!");
            }
            break;
          }
        }
        
        // Check for boss projectile-player collisions
        for (let i = bossProjectiles.length - 1; i >= 0; i--) {
          if (checkCircleRectCollision(bossProjectiles[i], player)) {
            if (player.hasShield) {
              bossProjectiles.splice(i, 1);
              setMessage("Shield absorbed boss projectile!");
            } else {
              setFinalScore(Math.floor(score));
              setScore(0);
              setIsGameStarted(false);
              return;
            }
          }
        }
      }

      // Remove off-screen elements and add new ones
      platforms = platforms.filter(platform => platform.y < canvas.height);
      enemies = enemies.filter(enemy => enemy.y < canvas.height);
      projectiles = projectiles.filter(projectile => projectile.y > -projectile.height);
      springs = springs.filter(spring => spring.y < canvas.height);
      shields = shields.filter(shield => shield.y < canvas.height);
      bouncingProjectileItems = bouncingProjectileItems.filter(item => item.y < canvas.height);
      bossProjectiles = bossProjectiles.filter(proj => proj.y < canvas.height && proj.x > 0 && proj.x < canvas.width);

      while (platforms.length < initialPlatformCount) {
          createNewPlatform();
      }

      if (Math.random() < 0.005) { // Small chance to spawn a new enemy
        createNewEnemy();
      }

      if (Math.random() < 0.001) { // Very small chance to spawn a new shield
        createNewShield();
      }

      if (Math.random() < 0.0005) { // Very small chance to spawn a bouncing projectile item
        createNewBouncingProjectileItem();
      }

      // Check for game over
      if (player.y > canvas.height) {
        setFinalScore(Math.floor(score));
        setScore(0);
        setIsGameStarted(false);
      }
      
      setScore(score); // Update state for UI
      
      // Draw all elements
      drawPlatforms();
      drawEnemies();
      drawProjectiles();
      drawBossProjectiles();
      drawSprings();
      drawShields();
      drawBouncingProjectileItems();
      drawPlayer();
      drawBoss();
      drawScore();

      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Initial setup
    createInitialPlatforms();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };

  }, [isGameStarted, isPaused, setScore, setFinalScore, setIsGameStarted]);

  
  const quitGame = () => {
    setIsGameStarted(false);
    setIsPaused(false);
    setShowLeaderboard(false);
    setShowOptions(false);
    setShowHelp(false);
    setFinalScore(0);
  }

  const handleShowLeaderboard = () => {
    const isNewHighScore = finalScore > highScore;
    
    setShowLeaderboard(true);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center relative" style={{ width: '400px', height: '600px' }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Doodle Jump</h1>
        <MessageBox message={message} />
        <MessageBox message={bossMessage} />
        {!isGameStarted && !showLeaderboard && !showOptions && !showHelp && (
          <StartMenu
            onStart={() => {
              setScore(0);
              setIsGameStarted(true);
            }}
            highScore={highScore}
            onShowLeaderboard={handleShowLeaderboard}
            onShowOptions={() => setShowOptions(true)}
            onShowHelp={() => setShowHelp(true)}
            userName={userName}
          />
        )}
        {isGameStarted && !isPaused && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <canvas ref={canvasRef} width="400" height="600" style={{ backgroundColor: '#f0f8ff' }}></canvas>
            <div className="absolute top-4 left-4 text-gray-800 font-bold text-xl">Score: {Math.floor(score)}</div>
            <button className="absolute top-4 right-4 text-white bg-blue-500 px-4 py-2 rounded-lg" onClick={() => setIsPaused(true)}>Pause</button>
          </div>
        )}
        {showLeaderboard && (
          <Leaderboard
            scores={leaderboardScores}
            onBack={quitGame}
            loading={loading}
            currentUserId={userId}
          />
        )}
        {isGameStarted && isPaused && (
          <PauseMenu
            onResume={() => setIsPaused(false)}
            onQuit={quitGame}
          />
        )}
        {showOptions && (
          <OptionsMenu
            onBack={quitGame}
          />
        )}
        {showHelp && (
          <HelpModal
            onBack={quitGame}
          />
        )}
        {finalScore > 0 && !showLeaderboard && !showOptions && !showHelp && (
          <GameOverMenu
            finalScore={finalScore}
            highScore={highScore}
            onRestart={() => { setFinalScore(0); setScore(0); setIsGameStarted(true) }}
            onShowLeaderboard={handleShowLeaderboard}
          />
        )}
      </div>
    </div>
  );
};

export default App;
