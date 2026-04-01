import React, { useEffect, useRef, useCallback, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- CONSTANTS ---
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 640;
const PLAYER_SIZE = 30;
const GRAVITY = 0.45;
const JUMP_STRENGTH = -14;
const BOOST_STRENGTH = -22;

// --- ZUSTAND STORE ---
const useGameStore = create(
  persist(
    (set, get) => ({
      gameState: 'START', // START, PLAYING, GAMEOVER
      score: 0,
      highScore: 0,
      combo: 0,
      isBoosting: false,
      
      setGameState: (state) => set({ gameState: state }),
      setBoosting: (val) => set({ isBoosting: val }),
      
      updateScore: (rawY) => {
        const currentScore = Math.floor(rawY / 10);
        const currentHighScore = get().highScore;
        set({ 
          score: currentScore,
          highScore: Math.max(currentHighScore, currentScore)
        });
      },
      
      resetGame: () => set({ score: 0, combo: 0, gameState: 'PLAYING', isBoosting: false }),
      addCombo: () => set((state) => ({ combo: state.combo + 1 })),
      resetCombo: () => set({ combo: 0 }),
    }),
    {
      name: 'sky-hop-ultra-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ highScore: state.highScore }),
    }
  )
);

export default function App() {
  const canvasRef = useRef(null);
  const { 
    gameState, score, highScore, combo, isBoosting,
    setGameState, updateScore, resetGame, addCombo, resetCombo, setBoosting 
  } = useGameStore();

  // Non-reactive game engine state
  const engine = useRef({
    player: { x: 185, y: 400, vx: 0, vy: -15, w: PLAYER_SIZE, h: PLAYER_SIZE, trail: [] },
    platforms: [],
    items: [],
    particles: [],
    keys: {},
    rawScore: 0,
    shake: 0,
    frameCount: 0,
    boostTimer: 0,
    reqId: null,
  });

  const spawnPlatform = (y, forceNormal = false) => {
    const progress = Math.min(engine.current.rawScore / 50000, 1);
    const width = 80 - (progress * 30);
    let type = 'normal';
    
    if (!forceNormal) {
      const typeRoll = Math.random();
      if (typeRoll < 0.15) type = 'breaking';
      else if (typeRoll < 0.30) type = 'moving';
    }

    return {
      x: Math.random() * (CANVAS_WIDTH - width),
      y, 
      w: width, 
      h: 12, 
      type,
      phase: Math.random() * Math.PI * 2,
      speed: 1.2 + (progress * 2.5)
    };
  };

  const spawnItem = (plt) => {
    if (plt.type === 'breaking' || Math.random() > 0.12) return null;
    return {
      x: plt.x + (plt.w / 2) - 10,
      y: plt.y - 25,
      w: 20, h: 20,
      type: 'jetpack',
      collected: false
    };
  };

  const initGame = () => {
    const e = engine.current;
    e.rawScore = 0;
    e.boostTimer = 0;
    e.frameCount = 0;
    e.shake = 0;
    
    // Reset Player
    e.player = { 
      x: 185, y: 450, vx: 0, vy: JUMP_STRENGTH, 
      w: PLAYER_SIZE, h: PLAYER_SIZE, trail: [] 
    };
    
    e.particles = [];
    e.items = [];
    
    // Initial Platforms
    const platforms = [];
    for (let i = 0; i < 8; i++) {
      platforms.push(spawnPlatform(CANVAS_HEIGHT - (i * 90), i === 0));
    }
    e.platforms = platforms;
    
    resetGame();
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'PLAYING') return;
    
    const ctx = canvas.getContext('2d');
    const e = engine.current;
    const p = e.player;
    e.frameCount++;

    // 1. INPUT & PHYSICS
    if (e.keys['ArrowLeft'] || e.keys['a']) p.vx -= 0.9;
    if (e.keys['ArrowRight'] || e.keys['d']) p.vx += 0.9;
    p.vx *= 0.9;
    
    if (e.boostTimer > 0) {
      p.vy = BOOST_STRENGTH;
      e.boostTimer--;
      if (e.boostTimer <= 0) setBoosting(false);
      // Boost visuals
      for(let i=0; i<2; i++) {
        e.particles.push({
          x: p.x + p.w/2, y: p.y + p.h,
          vx: (Math.random()-0.5)*5, vy: 8,
          life: 1, color: '#f59e0b'
        });
      }
    } else {
      p.vy += GRAVITY;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Boundary Wrap
    if (p.x > CANVAS_WIDTH) p.x = -p.w;
    if (p.x < -p.w) p.x = CANVAS_WIDTH;

    // Trail
    if (e.frameCount % 3 === 0) {
      p.trail.push({ x: p.x + p.w/2, y: p.y + p.h/2, life: 1.0 });
      if (p.trail.length > 10) p.trail.shift();
    }

    // 2. COLLISIONS
    if (p.vy > 0) {
      e.platforms.forEach((plt, idx) => {
        if (p.x + p.w * 0.8 > plt.x && p.x + p.w * 0.2 < plt.x + plt.w &&
            p.y + p.h > plt.y && p.y + p.h < plt.y + plt.h + p.vy) {
          
          p.y = plt.y - p.h;
          p.vy = JUMP_STRENGTH;
          e.shake = 5;
          addCombo();

          if (plt.type === 'breaking') {
            const color = '#f43f5e';
            for(let j=0; j<12; j++) {
              e.particles.push({ 
                x: plt.x + plt.w/2, y: plt.y, 
                vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*8, 
                life: 1, color 
              });
            }
            e.platforms[idx] = spawnPlatform(-20);
          } else {
             for(let j=0; j<5; j++) {
                e.particles.push({ 
                  x: p.x + p.w/2, y: p.y + p.h, 
                  vx: (Math.random()-0.5)*6, vy: 2, 
                  life: 0.6, color: '#22d3ee' 
                });
              }
          }
        }
      });
    }

    // Item Collision
    e.items.forEach(item => {
      if (!item.collected && p.x + p.w > item.x && p.x < item.x + item.w && 
          p.y + p.h > item.y && p.y < item.y + item.h) {
        item.collected = true;
        e.boostTimer = 80;
        setBoosting(true);
        e.shake = 15;
      }
    });

    // 3. CAMERA & SCROLLING
    if (p.y < 300) {
      const scrollY = 300 - p.y;
      p.y = 300;
      e.rawScore += scrollY;
      updateScore(e.rawScore);

      e.platforms.forEach(plt => {
        plt.y += scrollY;
        if (plt.y > CANVAS_HEIGHT) {
          Object.assign(plt, spawnPlatform(-20));
          const it = spawnItem(plt);
          if (it) e.items.push(it);
        }
      });
      e.items.forEach((it, idx) => {
        it.y += scrollY;
        if (it.y > CANVAS_HEIGHT + 100) e.items.splice(idx, 1);
      });
      e.particles.forEach(pt => pt.y += scrollY);
      p.trail.forEach(tr => tr.y += scrollY);
    }

    // Platform Movement
    e.platforms.forEach(plt => {
      if (plt.type === 'moving') {
        plt.x += Math.sin(e.frameCount * 0.05 + plt.phase) * plt.speed;
        if (plt.x < 0) plt.x = 0;
        if (plt.x + plt.w > CANVAS_WIDTH) plt.x = CANVAS_WIDTH - plt.w;
      }
    });

    // Game Over
    if (p.y > CANVAS_HEIGHT + 50) {
      setGameState('GAMEOVER');
      resetCombo();
      return;
    }

    // 4. RENDERING
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Background Gradient
    const bShift = Math.min(e.rawScore / 100000, 1);
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, `rgb(${15}, ${23 - bShift*10}, ${42 + bShift*60})`);
    grad.addColorStop(1, `rgb(${2}, ${6}, ${23})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Trail
    p.trail.forEach((t, i) => {
      ctx.globalAlpha = (i / p.trail.length) * 0.3;
      ctx.fillStyle = isBoosting ? '#fbbf24' : '#22d3ee';
      ctx.beginPath();
      ctx.arc(t.x, t.y, (i / p.trail.length) * 12, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Items
    e.items.forEach(it => {
      if (!it.collected) {
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚀', it.x + 10, it.y + 15);
      }
    });

    // Platforms
    e.platforms.forEach(plt => {
      ctx.fillStyle = plt.type === 'breaking' ? '#f43f5e' : plt.type === 'moving' ? '#3b82f6' : '#10b981';
      drawRoundedRect(ctx, plt.x, plt.y, plt.w, plt.h, 4);
      ctx.fill();
      // Platform Shine
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(plt.x, plt.y, plt.w, 3);
    });

    // Particles
    for (let i = e.particles.length - 1; i >= 0; i--) {
      const pt = e.particles[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.02;
      if (pt.life <= 0) { e.particles.splice(i, 1); continue; }
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
    }
    ctx.globalAlpha = 1.0;

    // Player Rendering with Shake and Stretch
    ctx.save();
    if (e.shake > 0) {
      ctx.translate((Math.random()-0.5)*e.shake, (Math.random()-0.5)*e.shake);
      e.shake *= 0.9;
    }
    ctx.translate(p.x + p.w/2, p.y + p.h/2);
    const stretch = Math.min(Math.abs(p.vy) * 0.015, 0.4);
    ctx.scale(1 - stretch, 1 + stretch);
    
    ctx.fillStyle = isBoosting ? '#fbbf24' : '#ffffff';
    ctx.shadowBlur = isBoosting ? 20 : 10;
    ctx.shadowColor = isBoosting ? '#f59e0b' : '#22d3ee';
    drawRoundedRect(ctx, -p.w/2, -p.h/2, p.w, p.h, 6);
    ctx.fill();
    
    // Face
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-p.w/4, -p.h/4, 4, 4);
    ctx.fillRect(p.w/8, -p.h/4, 4, 4);
    ctx.restore();

    e.reqId = requestAnimationFrame(update);
  }, [gameState, setBoosting, addCombo, resetCombo, setGameState, updateScore, isBoosting]);

  useEffect(() => {
    const handleKeyDown = (e) => { engine.current.keys[e.key] = true; };
    const handleKeyUp = (e) => { engine.current.keys[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    if (gameState === 'PLAYING') {
      engine.current.reqId = requestAnimationFrame(update);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(engine.current.reqId);
    };
  }, [gameState, update]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-white font-sans overflow-hidden">
      {/* Header HUD */}
      <div className="w-full max-w-[400px] flex justify-between items-end mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Altitude</span>
          <span className="text-5xl font-black italic leading-none">{score}m</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Record</span>
          <span className="text-xl font-bold text-amber-400">{highScore}m</span>
        </div>
      </div>

      {/* Game Frame */}
      <div className="relative rounded-[42px] p-1.5 bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          className="rounded-[36px] bg-slate-900 touch-none shadow-inner"
          onMouseDown={() => { if(gameState !== 'PLAYING') initGame() }}
        />
        
        {/* Combo Multiplier */}
        {combo >= 5 && gameState === 'PLAYING' && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
              <span className="text-cyan-400 font-black italic text-lg">COMBO x{combo}</span>
            </div>
          </div>
        )}

        {/* Boost Banner */}
        {isBoosting && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 text-amber-400 font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">
            Super-Sonic Boost
          </div>
        )}

        {/* Menu Overlays */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-[36px] p-8 text-center">
            <div className="mb-4 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Experimental Flight System
            </div>
            
            <h1 className="text-6xl font-black italic text-white mb-2">
              SKY<span className="text-cyan-400">HOP</span>
            </h1>
            <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase mb-12 font-medium">Vertical Ascent Engine</p>
            
            {gameState === 'GAMEOVER' && (
              <div className="mb-10 group">
                <div className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Impact Detected</div>
                <div className="text-5xl font-black text-white group-hover:scale-110 transition-transform">{score}m</div>
                <div className="text-slate-500 text-[10px] uppercase mt-2">Peak Multiplier: x{combo}</div>
              </div>
            )}

            <button 
              onClick={initGame} 
              className="px-12 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-cyan-400 transition-colors active:scale-95 shadow-lg shadow-white/5"
            >
              {gameState === 'START' ? 'ENGAGE SYSTEM' : 'REBOOT MISSION'}
            </button>

            <div className="mt-12 flex gap-8 text-slate-500 font-bold text-[9px] tracking-widest uppercase">
              <div className="flex flex-col items-center gap-1">
                <span className="text-white bg-white/10 px-2 py-1 rounded">A / D</span>
                <span>Steering</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-white bg-white/10 px-2 py-1 rounded">🚀</span>
                <span>Ignition</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 opacity-30 text-[9px] font-bold uppercase tracking-[0.3em]">
        Zustand Storage • No Backend • V2.0.1
      </div>
    </div>
  );
}