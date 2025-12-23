import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trophy, RefreshCw } from 'lucide-react';

interface FlappySantaProps {
  onBack: () => void;
}

type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

const FlappySanta: React.FC<FlappySantaProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game Logic Refs
  const santaRef = useRef({ 
    y: 300, 
    targetY: 300, 
    x: 150, 
    width: 60, 
    height: 40,
    rotation: 0
  });
  const obstaclesRef = useRef<{x: number, y: number, type: string, size: number, speed: number}[]>([]);
  const itemsRef = useRef<{x: number, y: number, type: string, size: number}[]>([]);
  const backgroundRef = useRef<{x: number, y: number, speed: number, size: number}[]>([]);
  const frameRef = useRef(0);
  const requestRef = useRef<number>(0);

  // Mouse tracking
  const handleMouseMove = (e: MouseEvent) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    santaRef.current.targetY = Math.max(20, Math.min(canvas.height - 40, mouseY));
  };

  const initGame = () => {
    setScore(0);
    setGameState('PLAYING');
    obstaclesRef.current = [];
    itemsRef.current = [];
    backgroundRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 2 + 1
    }));
    santaRef.current.y = 300;
    santaRef.current.targetY = 300;
    santaRef.current.rotation = 0;
  };

  const drawSanta = (ctx: CanvasRenderingContext2D, s: typeof santaRef.current) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);

    // Sleigh
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.roundRect(-25, 5, 50, 15, 5);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-30, 20);
    ctx.lineTo(30, 20);
    ctx.stroke();

    // Santa Body (Simple circle/rect combo)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -5, 12, 0, Math.PI * 2);
    ctx.fill();

    // Beard
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hat
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-10, -15);
    ctx.lineTo(0, -28);
    ctx.lineTo(10, -15);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -28, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(10, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const update = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Parallax Stars
    ctx.fillStyle = '#fff';
    backgroundRef.current.forEach(star => {
      star.x -= star.speed;
      if (star.x < 0) star.x = canvas.width;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (gameState === 'PLAYING') {
      frameRef.current++;

      // Santa Follow Logic
      const s = santaRef.current;
      const dy = s.targetY - s.y;
      s.y += dy * 0.1; // Smooth follow
      s.rotation = (dy * 0.05) * (Math.PI / 180) * 10; // Tilt based on movement

      // Spawn Obstacles
      if (frameRef.current % 60 === 0) {
        const types = ['cloud', 'bird', 'poop'];
        obstaclesRef.current.push({
          x: canvas.width + 50,
          y: Math.random() * (canvas.height - 100) + 50,
          type: types[Math.floor(Math.random() * types.length)],
          size: 40 + Math.random() * 20,
          speed: 4 + Math.random() * 3 + (score / 10) // Speed up over time
        });
      }

      // Spawn Items
      if (frameRef.current % 100 === 0) {
        itemsRef.current.push({
          x: canvas.width + 50,
          y: Math.random() * (canvas.height - 100) + 50,
          type: Math.random() > 0.7 ? 'gift' : 'heart',
          size: 30
        });
      }

      // Update & Draw Obstacles
      obstaclesRef.current.forEach((obs, idx) => {
        obs.x -= obs.speed;
        
        ctx.save();
        if (obs.type === 'cloud') {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.size/2, 0, Math.PI*2);
          ctx.arc(obs.x + 20, obs.y - 10, obs.size/3, 0, Math.PI*2);
          ctx.fill();
        } else if (obs.type === 'bird') {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const flap = Math.sin(frameRef.current * 0.2) * 10;
          ctx.moveTo(obs.x - 15, obs.y + flap);
          ctx.lineTo(obs.x, obs.y);
          ctx.lineTo(obs.x + 15, obs.y + flap);
          ctx.stroke();
        } else {
          // It's a poop! 💩
          ctx.font = `${obs.size}px serif`;
          ctx.fillText('💩', obs.x - obs.size/2, obs.y + obs.size/2);
        }
        ctx.restore();

        // Collision Check
        const dist = Math.sqrt(Math.pow(s.x - obs.x, 2) + Math.pow(s.y - obs.y, 2));
        if (dist < 40) {
          setGameState('GAMEOVER');
        }

        if (obs.x < -100) obstaclesRef.current.splice(idx, 1);
      });

      // Update & Draw Items
      itemsRef.current.forEach((item, idx) => {
        item.x -= 4;
        ctx.font = '30px serif';
        ctx.fillText(item.type === 'gift' ? '🎁' : '❤️', item.x - 15, item.y + 15);

        // Collection Check
        const dist = Math.sqrt(Math.pow(s.x - item.x, 2) + Math.pow(s.y - item.y, 2));
        if (dist < 40) {
          setScore(prev => prev + (item.type === 'gift' ? 5 : 1));
          itemsRef.current.splice(idx, 1);
        }

        if (item.x < -100) itemsRef.current.splice(idx, 1);
      });

      drawSanta(ctx, s);

      // UI Score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${score}`, canvas.width - 30, 50);

    } else if (gameState === 'GAMEOVER') {
      // Draw Game Over Animation: Santa in snow
      const s = santaRef.current;
      
      // Ground snow
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(s.x, canvas.height - 20, 80, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kicking legs
      ctx.save();
      ctx.translate(s.x, canvas.height - 40);
      const kick = Math.sin(Date.now() * 0.01) * 20;
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      // Leg 1
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-20, -30 + kick);
      ctx.stroke();
      // Leg 2
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(20, -30 - kick);
      ctx.stroke();

      // Boots
      ctx.fillStyle = '#000';
      ctx.fillRect(-28, -35 + kick, 12, 8);
      ctx.fillRect(16, -35 - kick, 12, 8);
      
      ctx.restore();

      if (score > highScore) setHighScore(score);
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, score]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1445] flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* Overlays */}
      <div className="relative z-20 pointer-events-none w-full h-full flex flex-col items-center justify-center">
        
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 pointer-events-auto"
        >
            <ArrowLeft size={24} />
            <span className="font-serif text-lg">Back Home</span>
        </button>

        {gameState === 'START' && (
          <div className="bg-black/60 backdrop-blur-lg p-10 rounded-3xl border-2 border-christmas-gold text-center animate-in zoom-in duration-500 pointer-events-auto">
            <h2 className="text-4xl font-serif text-christmas-gold mb-4">Santa's Flight Training</h2>
            <p className="text-white/80 mb-8 max-w-sm">
              Use your mouse to control Santa's height.<br/>
              Dodge the clouds and birds, but watch out for the falling... you know. 💩
            </p>
            <button 
              onClick={initGame}
              className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xl shadow-lg transition-all hover:scale-110 active:scale-95"
            >
              Start Training!
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="bg-black/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-red-500 text-center animate-in zoom-in duration-300 pointer-events-auto">
            <div className="text-6xl mb-4">🤕</div>
            <h2 className="text-4xl font-serif text-white mb-2">Crash Landing!</h2>
            <p className="text-red-400 font-bold text-2xl mb-6">Score: {score}</p>
            
            <div className="flex gap-4 justify-center">
                <button 
                onClick={initGame}
                className="flex items-center gap-2 px-8 py-3 bg-christmas-gold text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                <RefreshCw size={20} />
                Try Again
                </button>
                <button 
                onClick={onBack}
                className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all shadow-lg"
                >
                Go Home
                </button>
            </div>
          </div>
        )}

        {gameState === 'PLAYING' && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-[0.3em]">
                Move mouse up/down to fly
            </div>
        )}
      </div>

      <style>{`
        canvas {
            cursor: none;
        }
      `}</style>
    </div>
  );
};

export default FlappySanta;