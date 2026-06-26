import { useState, useEffect, useRef, useCallback } from 'react';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const FISH_SIZE = 60;
const TRUNK_WIDTH = 120;
const SPAWN_RATE_INITIAL = 60;
const SPEED_INITIAL = 3;

type GameState = 'start' | 'playing' | 'gameover';

interface Entity {
  id: number;
  x: number;
  y: number;
  type: 'obstacle' | 'collectible';
  subtype: 'rock' | 'star';
  width: number;
  height: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  
  const fishRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, vx: 0, vy: 0 });
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef(SPEED_INITIAL);
  const spawnRateRef = useRef(SPAWN_RATE_INITIAL);
  const cameraYRef = useRef(0);
  const shakeRef = useRef(0);
  
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const saved = localStorage.getItem('fish-climb-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fish-climb-highscore', score.toString());
    }
  }, [score, highScore]);

  const spawnEntity = useCallback(() => {
    const type = Math.random() > 0.4 ? 'obstacle' : 'collectible';
    const entity: Entity = {
      id: Date.now() + Math.random(),
      x: 0,
      y: -50,
      type,
      subtype: type === 'obstacle' ? 'rock' : 'star',
      width: type === 'obstacle' ? 40 : 30,
      height: type === 'obstacle' ? 40 : 30
    };

    if (entity.type === 'obstacle') {
      entity.x = (GAME_WIDTH - TRUNK_WIDTH) / 2 + Math.random() * (TRUNK_WIDTH - entity.width);
    } else {
      entity.x = (GAME_WIDTH - TRUNK_WIDTH) / 2 + Math.random() * (TRUNK_WIDTH - entity.width);
    }

    entitiesRef.current.push(entity);
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        maxLife: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const checkCollision = (fish: any, entity: Entity) => {
    const dx = fish.x - (entity.x + entity.width / 2);
    const dy = fish.y - (entity.y + entity.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (FISH_SIZE / 2 + entity.width / 2);
  };

  const resetGame = () => {
    fishRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, vx: 0, vy: 0 };
    entitiesRef.current = [];
    particlesRef.current = [];
    speedRef.current = SPEED_INITIAL;
    spawnRateRef.current = SPAWN_RATE_INITIAL;
    cameraYRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    shakeRef.current = 0;
  };

  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    frameCountRef.current++;
    scoreRef.current += 0.1;
    setScore(Math.floor(scoreRef.current));

    const fish = fishRef.current;
    
    if (keysRef.current['ArrowUp']) fish.y -= 4;
    if (keysRef.current['ArrowDown']) fish.y += 2;
    if (keysRef.current['ArrowLeft']) fish.x -= 3;
    if (keysRef.current['ArrowRight']) fish.x += 3;

    fish.x = Math.max(FISH_SIZE, Math.min(GAME_WIDTH - FISH_SIZE, fish.x));
    fish.y = Math.max(FISH_SIZE, Math.min(GAME_HEIGHT - FISH_SIZE, fish.y));

    cameraYRef.current += speedRef.current;
    
    if (frameCountRef.current % Math.floor(spawnRateRef.current) === 0) {
      spawnEntity();
    }

    if (frameCountRef.current % 500 === 0) {
      speedRef.current = Math.min(SPEED_INITIAL + Math.floor(scoreRef.current / 500), 8);
      spawnRateRef.current = Math.max(SPAWN_RATE_INITIAL - Math.floor(scoreRef.current / 1000), 30);
    }

    entitiesRef.current.forEach(entity => {
      entity.y += speedRef.current;
    });

    entitiesRef.current = entitiesRef.current.filter(entity => {
      if (checkCollision(fish, entity)) {
        if (entity.type === 'obstacle') {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameover');
            }
            return newLives;
          });
          shakeRef.current = 10;
          createParticles(fish.x, fish.y, '#795548', 10);
          return false;
        } else {
          scoreRef.current += 10;
          createParticles(fish.x, fish.y, '#FFD700', 8);
          return false;
        }
      }
      return entity.y < GAME_HEIGHT + 50;
    });

    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;
  }, [gameState, spawnEntity]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const shakeX = (Math.random() - 0.5) * shakeRef.current;
    const shakeY = (Math.random() - 0.5) * shakeRef.current;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);

    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#E0F7FA');
    gradient.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const trunkX = (GAME_WIDTH - TRUNK_WIDTH) / 2;
    
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(trunkX, -100, TRUNK_WIDTH, GAME_HEIGHT + 200);

    entitiesRef.current.forEach(entity => {
      ctx.font = `${entity.width}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (entity.subtype === 'rock') {
        ctx.fillText('🪨', entity.x + entity.width / 2, entity.y + entity.height / 2);
      } else if (entity.subtype === 'star') {
        ctx.fillText('⭐', entity.x + entity.width / 2, entity.y + entity.height / 2);
      }
    });

    const fish = fishRef.current;
    ctx.font = `${FISH_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐟', fish.x, fish.y);

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }, [gameState]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        update();
        draw(ctx);
      }
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-100 to-sky-200 flex items-center justify-center p-4">
      <div className="relative">
        <div className="absolute -top-12 left-0 right-0 text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400 mb-2">
            Fish Can Climb
          </h1>
          <p className="text-blue-200 italic">
            "Some limits exist only because we believe them."
          </p>
        </div>
        
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-blue-500/30">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="block bg-white"
          />
          
          {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-8">
              <div className="space-y-6">
                <button
                  onClick={() => {
                    resetGame();
                    setGameState('playing');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Play Now
                </button>
                
                <div className="text-blue-200 space-y-2">
                  <p className="text-lg">Controls:</p>
                  <div className="flex gap-8 justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">↑ ↓</div>
                      <div className="text-sm">Vertical Movement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">← →</div>
                      <div className="text-sm">Lateral Shift</div>
                    </div>
                  </div>
                </div>
                
                {highScore > 0 && (
                  <div className="mt-6 text-yellow-400 text-lg">
                    High Score: {highScore}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-red-500">Game Over</h2>
                <p className="text-2xl text-white">Final Score: {score}</p>
                <p className="text-blue-300 italic text-lg">
                  "maybe the problem wasn't the fish"
                </p>
                <button
                  onClick={() => {
                    resetGame();
                    setGameState('playing');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4 right-4 flex justify-between text-white font-bold text-lg pointer-events-none">
            <div className="flex items-center gap-2">
              <span>Score: {score}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-600'}>
                  ♥
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-blue-300/60 text-sm">
          Use arrow keys to control the fish
        </div>
      </div>
    </div>
  );
}
