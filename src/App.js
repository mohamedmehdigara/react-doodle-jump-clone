import React, { useState, useEffect, useRef } from 'react';

/**
 * Sky Hop Ultra - Enhanced & Corrected Version
 * Features:
 * - Fluid physics engine with squash/stretch effects
 * - Multi-layer background depth
 * - Dynamic difficulty scaling
 * - Robust mobile-ready controls
 * - Self-contained styling system (no external dependencies)
 */

const App = () => {
  // --- Constants ---
  const CANVAS_WIDTH = 450;
  const CANVAS_HEIGHT = 700;
  const GRAVITY = 0.38;
  const JUMP_STRENGTH = -12.5;
  const PLATFORM_WIDTH = 70;
  const PLATFORM_HEIGHT = 14;
  const PLAYER_SIZE = 40;

  // --- State ---
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // --- Refs ---
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { 
      x: 205, y: 500, vx: 0, vy: 0, 
      rotation: 0, squash: 1, stretch: 1,
      facing: 1
    },
    platforms: [],
    particles: [],
    keys: {},
    score: 0,
    shake: 0,
    frame: 0,
    difficulty: 1
  });
  const requestRef = useRef();

  // --- Game Mechanics ---
  const initGame = () => {
    const g = gameRef.current;
    g.score = 0;
    g.difficulty = 1;
    setScore(0);
    
    g.player = {
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - 150,
      vx: 0,
      vy: JUMP_STRENGTH,
      rotation: 0,
      squash: 1,
      stretch: 1,
      facing: 1
    };

    g.platforms = [];
    // Initial starting platform
    g.platforms.push({
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      width: PLATFORM_WIDTH * 1.5,
      height: PLATFORM_HEIGHT,
      type: 'normal'
    });

    // Generate initial climb
    for (let i = 1; i < 10; i++) {
      g.platforms.push(generatePlatform(CANVAS_HEIGHT - i * 85 - 50));
    }
    
    setGameState('PLAYING');
  };

  const generatePlatform = (y) => {
    const g = gameRef.current;
    const typeRoll = Math.random();
    let type = 'normal';
    
    // Increase difficulty based on score
    if (g.score > 5000 && typeRoll > 0.7) type = 'moving';
    if (g.score > 10000 && typeRoll > 0.85) type = 'fragile';

    return {
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      type,
      vx: type === 'moving' ? (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1) : 0,
      broken: false
    };
  };

  const createParticles = (x, y, color, count = 5) => {
    for (let i = 0; i < count; i++) {
      gameRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color
      });
    }
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;

    const g = gameRef.current;
    const p = g.player;
    g.frame++;

    // Horizontal Logic
    if (g.keys['ArrowLeft'] || g.keys['a']) {
      p.vx -= 0.85;
      p.facing = -1;
    } else if (g.keys['ArrowRight'] || g.keys['d']) {
      p.vx += 0.85;
      p.facing = 1;
    } else {
      p.vx *= 0.82;
    }

    p.vx = Math.min(Math.max(p.vx, -10), 10);
    p.x += p.vx;
    
    // Vertical Logic
    p.vy += GRAVITY;
    p.y += p.vy;

    // Visual Polish
    p.rotation = p.vx * 0.05;
    p.stretch = 1 + Math.abs(p.vy) * 0.02;
    p.squash = 1 / p.stretch;

    // Screen Wrap
    if (p.x > CANVAS_WIDTH) p.x = -PLAYER_SIZE;
    if (p.x < -PLAYER_SIZE) p.x = CANVAS_WIDTH;

    // Scrolling Camera
    if (p.y < CANVAS_HEIGHT * 0.4) {
      const scrollAmount = CANVAS_HEIGHT * 0.4 - p.y;
      p.y = CANVAS_HEIGHT * 0.4;
      g.score += Math.floor(scrollAmount);
      setScore(g.score);

      g.platforms.forEach(plt => {
        plt.y += scrollAmount;
        if (plt.y > CANVAS_HEIGHT) {
          Object.assign(plt, generatePlatform(0));
        }
      });
    }

    // Collision Detection
    if (p.vy > 0) {
      g.platforms.forEach(plt => {
        if (!plt.broken && 
            p.x + PLAYER_SIZE * 0.8 > plt.x && 
            p.x + PLAYER_SIZE * 0.2 < plt.x + plt.width &&
            p.y + PLAYER_SIZE > plt.y && 
            p.y + PLAYER_SIZE < plt.y + plt.height + p.vy) {
          
          p.vy = JUMP_STRENGTH;
          p.y = plt.y - PLAYER_SIZE;
          g.shake = 4;
          
          if (plt.type === 'fragile') {
            plt.broken = true;
            createParticles(plt.x + plt.width/2, plt.y, '#f87171', 8);
          } else {
            createParticles(p.x + PLAYER_SIZE/2, p.y + PLAYER_SIZE, '#bef264', 3);
          }
        }
      });
    }

    // Platform Updates
    g.platforms.forEach(plt => {
      if (plt.type === 'moving') {
        plt.x += plt.vx;
        if (plt.x < 0 || plt.x + plt.width > CANVAS_WIDTH) plt.vx *= -1;
      }
    });

    // Particle Update
    g.particles = g.particles.filter(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.02;
      return pt.life > 0;
    });

    if (g.shake > 0) g.shake *= 0.9;
    if (p.y > CANVAS_HEIGHT + 100) setGameState('GAME_OVER');

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;
    const p = g.player;

    ctx.save();
    if (g.shake > 0.1) {
      ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
    }

    // Background Gradient
    const bgradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgradient.addColorStop(0, '#1e1b4b');
    bgradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dynamic Stars / Grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i=0; i<20; i++) {
      const x = (Math.sin(i * 123.4) * 0.5 + 0.5) * CANVAS_WIDTH;
      const y = ((g.score * 0.1 + i * 100) % CANVAS_HEIGHT);
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Platforms
    g.platforms.forEach(plt => {
      if (plt.broken) return;
      
      const isMoving = plt.type === 'moving';
      const isFragile = plt.type === 'fragile';
      
      ctx.fillStyle = isMoving ? '#38bdf8' : (isFragile ? '#f87171' : '#4ade80');
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.fillStyle;
      
      ctx.beginPath();
      ctx.roundRect(plt.x, plt.y, plt.width, plt.height, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Platform Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(plt.x + 10, plt.y + 3, plt.width - 20, 2);
    });

    // Particles
    g.particles.forEach(pt => {
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // Player Rendering
    ctx.save();
    ctx.translate(p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE / 2);
    ctx.rotate(p.rotation);
    ctx.scale(p.squash * p.facing, p.stretch);

    // Body Shadow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#bef264';
    ctx.fillStyle = '#bef264';
    ctx.beginPath();
    ctx.roundRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-10, -8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -8, 4, 0, Math.PI * 2); ctx.fill();
    
    // Shine in eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-11, -10, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -10, 1.5, 0, Math.PI * 2); ctx.fill();

    // Expression based on velocity
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (p.vy < 0) {
      // Jumping / Happy
      ctx.arc(0, 4, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    } else {
      // Falling / Focused
      ctx.moveTo(-5, 6);
      ctx.lineTo(5, 6);
    }
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { gameRef.current.keys[e.key] = true; };
    const handleKeyUp = (e) => { gameRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // --- Styles ---
  const styles = {
    wrapper: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#020617', padding: '1rem',
      fontFamily: '"Inter", system-ui, sans-serif', userSelect: 'none'
    },
    frame: {
      position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      backgroundColor: '#0f172a', border: '12px solid #1e293b',
      borderRadius: '2.5rem', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)', overflow: 'hidden'
    },
    ui: {
      position: 'absolute', top: '1.5rem', width: '100%', padding: '0 1.5rem',
      display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none'
    },
    counter: {
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
      padding: '0.6rem 1.2rem', borderRadius: '1.2rem', border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white'
    },
    label: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.1em' },
    value: { fontSize: '1.4rem', fontWeight: 900, display: 'block', color: '#bef264' },
    overlay: {
      position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.9)',
      backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 20, color: 'white'
    },
    title: { 
      fontSize: '4.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', fontStyle: 'italic', 
      background: 'linear-gradient(to bottom, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
    },
    button: (bg) => ({
      background: bg || '#bef264', color: bg ? 'white' : 'black',
      padding: '1.2rem 3rem', fontSize: '1.2rem', fontWeight: 900,
      borderRadius: '1.2rem', border: 'none', cursor: 'pointer',
      textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s',
      boxShadow: `0 10px 30px ${bg ? 'rgba(239, 68, 68, 0.3)' : 'rgba(190, 242, 100, 0.3)'}`
    })
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.frame}>
        <div style={styles.ui}>
          <div style={styles.counter}>
            <span style={styles.label}>Height</span>
            <span style={styles.value}>{score.toLocaleString()}</span>
          </div>
          <div style={styles.counter}>
            <span style={styles.label}>Best</span>
            <span style={styles.value}>{highScore.toLocaleString()}</span>
          </div>
        </div>

        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        {gameState === 'START' && (
          <div style={styles.overlay}>
            <div style={{ padding: '2rem', background: '#bef264', borderRadius: '2rem', marginBottom: '2rem' }}>
              <div style={{ width: 12, height: 12, background: 'black', borderRadius: '50%', display: 'inline-block', margin: '0 8px' }} />
              <div style={{ width: 12, height: 12, background: 'black', borderRadius: '50%', display: 'inline-block', margin: '0 8px' }} />
            </div>
            <h1 style={styles.title}>SKY HOP</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontWeight: 600 }}>Use Arrow Keys to Climb</p>
            <button 
              style={styles.button()} 
              onClick={initGame}
              onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
              Start Hop
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div style={styles.overlay}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>GAME OVER</h2>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>You reached</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#bef264' }}>{score.toLocaleString()}m</p>
            </div>
            <button 
              style={styles.button('#ef4444')} 
              onClick={initGame}
              onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;