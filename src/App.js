import React, { useState, useEffect, useRef } from 'react';

/**
 * Enhanced Doodle Jump - Fixed for VS Code / Environment compatibility.
 * Replaced complex canvas APIs with standard drawing methods.
 * Optimized Tailwind layout for better visibility.
 */

const App = () => {
  // Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.4;
  const JUMP_STRENGTH = -12;
  const PLATFORM_COUNT = 7;
  const PLATFORM_WIDTH = 60;
  const PLATFORM_HEIGHT = 15;
  const PLAYER_SIZE = 40;
  const ENEMY_SIZE = 30;
  const JETPACK_BOOST = -25;
  const JETPACK_DURATION = 1500;

  // Game State
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const canvasRef = useRef(null);
  const playerRef = useRef({
    x: 180,
    y: 300,
    vx: 0,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    isPoweredUp: false,
    powerUpTimer: 0
  });
  const platformsRef = useRef([]);
  const itemsRef = useRef([]);
  const enemiesRef = useRef([]);
  const keysRef = useRef({});
  const requestRef = useRef();
  const scoreRef = useRef(0);

  const initGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setGameState('PLAYING');

    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - 150,
      vx: 0,
      vy: JUMP_STRENGTH,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      isPoweredUp: false,
      powerUpTimer: 0
    };

    const newPlatforms = [];
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      newPlatforms.push(createPlatform(i * (CANVAS_HEIGHT / PLATFORM_COUNT)));
    }
    newPlatforms[newPlatforms.length - 1].x = playerRef.current.x - 10;
    newPlatforms[newPlatforms.length - 1].y = playerRef.current.y + 50;
    
    platformsRef.current = newPlatforms;
    itemsRef.current = [];
    enemiesRef.current = [];
  };

  const createPlatform = (y) => {
    const isMoving = Math.random() > 0.8;
    const type = Math.random() > 0.9 ? 'spring' : 'normal';
    const x = Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH);
    
    if (Math.random() > 0.92) spawnItem(x + PLATFORM_WIDTH / 4, y - 30);
    if (Math.random() > 0.85 && type === 'normal') spawnEnemy(y - 60);

    return {
      x, y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      type,
      isMoving,
      vx: isMoving ? (Math.random() * 2 + 1) : 0
    };
  };

  const spawnItem = (x, y) => {
    itemsRef.current.push({ x, y, width: 20, height: 30, type: 'jetpack', collected: false });
  };

  const spawnEnemy = (y) => {
    enemiesRef.current.push({
      x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE),
      y: y,
      width: ENEMY_SIZE,
      height: ENEMY_SIZE,
      vx: Math.random() * 2 + 1,
      alive: true
    });
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;

    const p = playerRef.current;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) p.vx = -5;
    else if (keysRef.current['ArrowRight'] || keysRef.current['d']) p.vx = 5;
    else p.vx *= 0.8;

    p.x += p.vx;
    
    if (p.isPoweredUp) {
      p.vy = JETPACK_BOOST * 0.45;
      if (Date.now() > p.powerUpTimer) p.isPoweredUp = false;
    } else {
      p.vy += GRAVITY;
    }
    p.y += p.vy;

    if (p.x + p.width < 0) p.x = CANVAS_WIDTH;
    if (p.x > CANVAS_WIDTH) p.x = -p.width;

    if (p.y < CANVAS_HEIGHT / 2) {
      const diff = CANVAS_HEIGHT / 2 - p.y;
      p.y = CANVAS_HEIGHT / 2;
      scoreRef.current += Math.floor(diff / 10);
      
      platformsRef.current.forEach(plt => {
        plt.y += diff;
        if (plt.y > CANVAS_HEIGHT) Object.assign(plt, createPlatform(0));
      });
      itemsRef.current.forEach(item => item.y += diff);
      enemiesRef.current.forEach(en => en.y += diff);
      
      itemsRef.current = itemsRef.current.filter(i => i.y < CANVAS_HEIGHT && !i.collected);
      enemiesRef.current = enemiesRef.current.filter(e => e.y < CANVAS_HEIGHT && e.alive);
    }

    if (p.vy > 0 && !p.isPoweredUp) {
      platformsRef.current.forEach(plt => {
        if (p.x < plt.x + plt.width && p.x + p.width > plt.x &&
            p.y + p.height > plt.y && p.y + p.height < plt.y + plt.height + p.vy) {
          p.vy = plt.type === 'spring' ? JUMP_STRENGTH * 1.8 : JUMP_STRENGTH;
          p.y = plt.y - p.height;
        }
      });
    }

    itemsRef.current.forEach(item => {
      if (!item.collected && p.x < item.x + item.width && p.x + p.width > item.x &&
          p.y < item.y + item.height && p.y + p.height > item.y) {
        item.collected = true;
        if (item.type === 'jetpack') {
          p.isPoweredUp = true;
          p.powerUpTimer = Date.now() + JETPACK_DURATION;
        }
      }
    });

    enemiesRef.current.forEach(en => {
      en.x += en.vx;
      if (en.x <= 0 || en.x + en.width >= CANVAS_WIDTH) en.vx *= -1;
      if (en.alive && p.x < en.x + en.width && p.x + p.width > en.x &&
          p.y < en.y + en.height && p.y + p.height > en.y) {
        if (p.vy > 0 && p.y + p.height < en.y + en.height / 2) {
          en.alive = false;
          p.vy = JUMP_STRENGTH;
          scoreRef.current += 500;
        } else if (!p.isPoweredUp) {
          setGameState('GAME_OVER');
        }
      }
    });

    platformsRef.current.forEach(plt => {
      if (plt.isMoving) {
        plt.x += plt.vx;
        if (plt.x <= 0 || plt.x + plt.width >= CANVAS_WIDTH) plt.vx *= -1;
      }
    });

    if (p.y > CANVAS_HEIGHT) setGameState('GAME_OVER');

    setScore(scoreRef.current);
    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const p = playerRef.current;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let j = 0; j < CANVAS_HEIGHT; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(CANVAS_WIDTH, j); ctx.stroke();
    }

    platformsRef.current.forEach(plt => {
      ctx.fillStyle = plt.type === 'spring' ? '#f59e0b' : '#22c55e';
      ctx.fillRect(plt.x, plt.y, plt.width, plt.height);
      if (plt.type === 'spring') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(plt.x + 10, plt.y + 2, plt.width - 20, 4);
      }
    });

    itemsRef.current.forEach(item => {
      if (!item.collected) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(item.x + 4, item.y + 4, item.width - 8, 4);
      }
    });

    enemiesRef.current.forEach(en => {
      if (en.alive) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(en.x + en.width / 2, en.y + en.height / 2, en.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(en.x - 2, en.y + 10, 5, 4);
        ctx.fillRect(en.x + en.width - 3, en.y + 10, 5, 4);
      }
    });

    ctx.save();
    if (p.isPoweredUp) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(p.x + 10, p.y + p.height);
      ctx.lineTo(p.x + p.width / 2, p.y + p.height + 25);
      ctx.lineTo(p.x + p.width - 10, p.y + p.height);
      ctx.fill();
    }
    ctx.fillStyle = p.isPoweredUp ? '#6366f1' : '#a3e635';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.fillStyle = '#000';
    const off = p.vx > 0 ? 4 : p.vx < 0 ? -4 : 0;
    ctx.fillRect(p.x + 8 + off, p.y + 8, 4, 4);
    ctx.fillRect(p.x + 24 + off, p.y + 8, 4, 4);
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    } else {
      draw(); // Initial draw for the start screen background
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 p-4">
      <div className="relative overflow-hidden rounded-lg shadow-2xl bg-white border-4 border-neutral-800" 
           style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        
        {/* Score Overlay */}
        <div className="absolute top-4 left-0 w-full px-4 flex justify-between items-start pointer-events-none z-10">
          <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-md shadow-sm border border-slate-200">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block leading-none">Score</span>
            <span className="text-xl font-black text-slate-800 leading-tight">{score.toLocaleString()}</span>
          </div>
          <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-md shadow-sm border border-slate-200 text-right">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block leading-none">Best</span>
            <span className="text-xl font-black text-slate-800 leading-tight">{highScore.toLocaleString()}</span>
          </div>
        </div>
        
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-slate-50"
        />

        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm p-8 text-center text-white">
            {gameState === 'START' ? (
              <>
                <h1 className="text-5xl font-black mb-2 italic tracking-tighter">DOODLE<br/>JUMP</h1>
                <p className="mb-8 text-slate-300 font-medium">Use Arrow Keys or A/D to move</p>
                <button
                  onClick={initGame}
                  className="bg-green-500 hover:bg-green-400 text-white font-black px-12 py-4 rounded-xl shadow-[0_5px_0_rgb(22,163,74)] active:shadow-none active:translate-y-[5px] transition-all text-xl uppercase tracking-widest"
                >
                  Start Game
                </button>
              </>
            ) : (
              <>
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Game Over</div>
                <h2 className="text-4xl font-black mb-8">Ouch! You fell.</h2>
                <div className="space-y-1 mb-8">
                  <p className="text-slate-400 text-sm font-bold uppercase">Final Score</p>
                  <p className="text-5xl font-black">{score.toLocaleString()}</p>
                </div>
                <button
                  onClick={initGame}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-black px-12 py-4 rounded-xl shadow-[0_5px_0_rgb(37,99,235)] active:shadow-none active:translate-y-[5px] transition-all text-xl uppercase tracking-widest"
                >
                  Try Again
                </button>
              </>
            )}
            
            <div className="mt-12 grid grid-cols-2 gap-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-sm"></div>
                Jetpack
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                Monsters
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;