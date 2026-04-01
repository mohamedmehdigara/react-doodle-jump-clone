import React, { useEffect, useRef, useState, useCallback } from 'react';
import { create } from 'zustand';

/** * SKY HOP ULTRA - ENHANCED VERSION
 * Features: Particle Systems, Squash/Stretch Physics, Breaking/Moving Platforms, 
 * Dynamic Difficulty, and Space-Depth Background Shifting.
 */

// --- 1. GLOBAL STORE ---
const useGameStore = create((set) => ({
  highScore: parseInt(localStorage.getItem('skyhop_ultra_high_score') || '0'),
  gameState: 'START',
  setGameState: (state) => set({ gameState: state }),
  updateHighScore: (score) => set((state) => {
    if (score > state.highScore) {
      localStorage.setItem('skyhop_ultra_high_score', score.toString());
      return { highScore: score };
    }
    return state;
  }),
}));

export default function App() {
  const canvasRef = useRef(null);
  const [currentScore, setCurrentScore] = useState(0);
  const { highScore, gameState, setGameState, updateHighScore } = useGameStore();
  
  // Configuration
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 640;
  const PLAYER_SIZE = 36;

  // Engine Refs (High-frequency data)
  const engine = useRef({
    player: { x: 180, y: 400, vx: 0, vy: -15, w: PLAYER_SIZE, h: PLAYER_SIZE },
    platforms: [],
    particles: [],
    keys: {},
    score: 0,
    cameraY: 0,
    reqId: null,
    frameCount: 0
  });

  // --- HELPER: CREATE PLATFORM ---
  const createPlatform = (y) => {
    const scoreFactor = Math.min(engine.current.score / 5000, 1);
    const typeRoll = Math.random();
    
    let type = 'normal';
    if (scoreFactor > 0.2 && typeRoll < 0.15) type = 'breaking';
    else if (scoreFactor > 0.4 && typeRoll < 0.35) type = 'moving';

    const width = 70 - (scoreFactor * 20); // Get smaller as you go
    return {
      x: Math.random() * (CANVAS_WIDTH - width),
      y: y,
      w: width,
      h: 12,
      type: type,
      phase: Math.random() * Math.PI * 2, // For moving platforms
      speed: 1 + (scoreFactor * 3)
    };
  };

  // --- INITIALIZE ---
  const initGame = useCallback(() => {
    engine.current.score = 0;
    engine.current.particles = [];
    setCurrentScore(0);
    engine.current.player = { x: 180, y: 400, vx: 0, vy: -16, w: PLAYER_SIZE, h: PLAYER_SIZE };
    
    const startPlatforms = [];
    for (let i = 0; i < 8; i++) {
      startPlatforms.push(createPlatform(640 - (i * 90)));
    }
    // Ensure first platform is under player
    startPlatforms[0].x = 150;
    startPlatforms[0].type = 'normal';
    
    engine.current.platforms = startPlatforms;
    setGameState('PLAYING');
  }, [setGameState]);

  // --- SPAWN PARTICLES ---
  const spawnParticles = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
      engine.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color
      });
    }
  };

  // --- MAIN LOOP ---
  const update = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    const ctx = canvasRef.current.getContext('2d');
    const e = engine.current;
    const p = e.player;
    e.frameCount++;

    // 1. INPUT & PHYSICS
    if (e.keys['ArrowLeft'] || e.keys['a']) p.vx -= 1.0;
    if (e.keys['ArrowRight'] || e.keys['d']) p.vx += 1.0;
    p.vx *= 0.88;
    p.vy += 0.45;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x > CANVAS_WIDTH) p.x = -p.w;
    if (p.x < -p.w) p.x = CANVAS_WIDTH;

    // 2. PLATFORMS & COLLISION
    e.platforms.forEach((plt, idx) => {
      // Moving platform logic
      if (plt.type === 'moving') {
        plt.x += Math.sin(e.frameCount * 0.05 + plt.phase) * plt.speed;
        if (plt.x < 0 || plt.x + plt.w > CANVAS_WIDTH) plt.phase += Math.PI;
      }

      // Check collision
      if (p.vy > 0 && 
          p.x + p.w * 0.2 < plt.x + plt.w && 
          p.x + p.w * 0.8 > plt.x && 
          p.y + p.h > plt.y && 
          p.y + p.h < plt.y + plt.h + p.vy) {
        
        p.vy = -15; // Bounce
        spawnParticles(p.x + p.w/2, plt.y, plt.type === 'breaking' ? '#ef4444' : '#4ade80');
        
        if (plt.type === 'breaking') {
          e.platforms[idx] = createPlatform(-20); // Break and respawn at top
        }
      }
    });

    // 3. CAMERA & SCORING
    if (p.y < 300) {
      const diff = 300 - p.y;
      p.y = 300;
      e.score += Math.floor(diff);
      setCurrentScore(Math.floor(e.score / 10));

      e.platforms.forEach(plt => {
        plt.y += diff;
        if (plt.y > CANVAS_HEIGHT) {
          Object.assign(plt, createPlatform(plt.y - CANVAS_HEIGHT));
          plt.y = -20;
        }
      });
    }

    // 4. PARTICLES
    e.particles.forEach((part, i) => {
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 0.02;
      if (part.life <= 0) e.particles.splice(i, 1);
    });

    // 5. GAME OVER
    if (p.y > CANVAS_HEIGHT + 100) {
      updateHighScore(Math.floor(e.score / 10));
      setGameState('GAMEOVER');
      return;
    }

    // 6. DRAWING
    // Background shift based on height
    const depth = Math.min(e.score / 20000, 1);
    const bgColor = `rgb(${15 - depth * 10}, ${23 - depth * 15}, ${42 - depth * 20})`;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Particles
    e.particles.forEach(part => {
      ctx.fillStyle = part.color;
      ctx.globalAlpha = part.life;
      ctx.fillRect(part.x, part.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    // Draw Platforms
    e.platforms.forEach(plt => {
      ctx.shadowBlur = 10;
      if (plt.type === 'breaking') {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444aa';
      } else if (plt.type === 'moving') {
        ctx.fillStyle = '#3b82f6';
        ctx.shadowColor = '#3b82f6aa';
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80aa';
      }
      ctx.beginPath();
      ctx.roundRect(plt.x, plt.y, plt.w, plt.h, 4);
      ctx.fill();
    });

    // Draw Player (Squash & Stretch)
    const stretch = Math.min(Math.abs(p.vy) * 0.02, 0.4);
    const sW = p.vy < 0 ? p.w * (1 - stretch) : p.w * (1 + stretch * 0.5);
    const sH = p.vy < 0 ? p.h * (1 + stretch) : p.h * (1 - stretch * 0.5);
    
    ctx.fillStyle = '#bef264';
    ctx.shadowColor = '#bef264';
    ctx.shadowBlur = 15;
    ctx.save();
    ctx.translate(p.x + p.w/2, p.y + p.h/2);
    ctx.rotate(p.vx * 0.03);
    ctx.fillRect(-sW/2, -sH/2, sW, sH);
    ctx.restore();
    ctx.shadowBlur = 0;

    e.reqId = requestAnimationFrame(update);
  }, [gameState, setGameState, updateHighScore]);

  // Listeners
  useEffect(() => {
    const handleKey = (e) => engine.current.keys[e.key] = e.type === 'keydown';
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    if (gameState === 'PLAYING') engine.current.reqId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      cancelAnimationFrame(engine.current.reqId);
    };
  }, [gameState, update]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="w-[400px] flex justify-between items-end mb-4 px-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-lime-500/50 uppercase tracking-[0.2em]">Altitude</span>
          <span className="text-4xl font-black text-white italic leading-none">{currentScore}<span className="text-sm not-italic ml-1 opacity-50">m</span></span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Record</span>
          <span className="text-xl font-bold text-slate-400">{highScore}m</span>
        </div>
      </div>

      <div className="relative group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Glow Border Effect */}
        <div className="absolute -inset-1 bg-gradient-to-b from-lime-500/20 to-blue-500/20 rounded-[32px] blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative rounded-[28px] overflow-hidden bg-slate-900 border border-white/10">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="cursor-none"
          />

          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-8 relative">
                <div className="absolute -inset-4 bg-lime-400/20 blur-xl rounded-full animate-pulse"></div>
                <h1 className="relative text-6xl font-black italic text-white tracking-tighter">
                  SKY<span className="text-lime-400">HOP</span>
                  <div className="text-xs not-italic font-bold tracking-[0.5em] text-lime-400/50 mt-1 uppercase">Ultra Edition</div>
                </h1>
              </div>

              {gameState === 'GAMEOVER' && (
                <div className="mb-10 scale-110">
                  <p className="text-rose-500 font-black uppercase tracking-tighter text-sm mb-1">Signal Lost at {currentScore}m</p>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-full animate-pulse"></div>
                  </div>
                </div>
              )}

              <button 
                onClick={initGame}
                className="relative px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-lime-400 transition-all active:scale-95 group/btn"
              >
                <span className="relative z-10">{gameState === 'START' ? 'ENGAGE' : 'RETRY'}</span>
                <div className="absolute inset-0 bg-lime-400 rounded-2xl scale-0 group-hover/btn:scale-110 opacity-0 group-hover/btn:opacity-20 transition-all duration-300"></div>
              </button>

              <div className="mt-12 grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                  <span>Fragile</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                  <span>Moving</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <div className="text-[10px] font-black tracking-widest text-white border-x border-white/20 px-4">60 FPS ENGINE</div>
        <div className="text-[10px] font-black tracking-widest text-white border-x border-white/20 px-4">PARTICLE PHYSICS</div>
        <div className="text-[10px] font-black tracking-widest text-white border-x border-white/20 px-4">PROCEDURAL GEN</div>
      </div>
    </div>
  );
}