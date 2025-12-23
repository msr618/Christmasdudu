import React, { useEffect, useRef } from 'react';
import { Snowflake, BurstParticle, Point } from '../types';

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Refs for logic to avoid re-renders
  const isDrawingRef = useRef(false);
  const pathRef = useRef<Point[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Background falling snow
    const snowflakes: Snowflake[] = [];
    const numFlakes = 100;

    // Particles arrays
    let burstParticles: BurstParticle[] = []; // Standard click bursts
    let trailParticles: BurstParticle[] = []; // Sparkles while dragging
    let shapeParticles: BurstParticle[] = []; // Explosion from closed shape

    const colors = ['#d4af37', '#ea4335', '#34a853', '#ffffff', '#f3f4f6'];

    // Initialize Snow
    for (let i = 0; i < numFlakes; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        wind: Math.random() * 0.5 - 0.25,
      });
    }

    // --- Interaction Logic Functions ---

    const createBurst = (x: number, y: number) => {
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        burstParticles.push({
          x: x,
          y: y,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: Math.random() * 3 + 1,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          alpha: 1,
          decay: Math.random() * 0.02 + 0.01,
        });
      }
    };

    const createTrailSpark = (x: number, y: number) => {
      // Create a few sparks at the current mouse position
      for(let i=0; i<3; i++) {
        trailParticles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          color: '#ffdd57', // Golden sparks
          radius: Math.random() * 2,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2 + 1, // Slight gravity fall
          },
          alpha: 1,
          decay: 0.05, // Fade fast
        });
      }
    };

    const explodeShape = (path: Point[]) => {
      // Calculate geometric center
      let minX = width, maxX = 0, minY = height, maxY = 0;
      let centerX = 0, centerY = 0;

      path.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        centerX += p.x;
        centerY += p.y;
      });
      centerX /= path.length;
      centerY /= path.length;

      // Create particles along the path moving outward from center
      path.forEach((p, i) => {
        // Only sample every few points to prevent too many particles
        if (i % 2 !== 0) return; 

        // Add some randomness to the angle so it looks like a burst
        const angle = Math.atan2(p.y - centerY, p.x - centerX) + (Math.random() - 0.5);
        const speed = Math.random() * 3 + 2;
        
        shapeParticles.push({
          x: p.x,
          y: p.y,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: Math.random() * 4 + 2,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          alpha: 1,
          decay: 0.015,
        });
      });
    };

    // --- Drawing Functions ---

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 1. Draw background snow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for (let i = 0; i < numFlakes; i++) {
        const f = snowflakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);
      }
      ctx.fill();

      // 2. Draw current gesture path (if drawing)
      if (isDrawingRef.current && pathRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; // Gold line
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
        for(let i=1; i<pathRef.current.length; i++){
          ctx.lineTo(pathRef.current[i].x, pathRef.current[i].y);
        }
        ctx.stroke();
      }

      // 3. Draw Particles (Burst, Trail, Shape)
      const allParticles = [...burstParticles, ...trailParticles, ...shapeParticles];
      
      allParticles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      move();
    };

    const move = () => {
      // Snow physics
      for (let i = 0; i < numFlakes; i++) {
        const f = snowflakes[i];
        f.y += f.speed;
        f.x += f.wind;
        if (f.y > height) { f.y = 0; f.x = Math.random() * width; }
      }

      // Helper to update particle array
      const updateParticles = (arr: BurstParticle[]) => {
        for (let i = arr.length - 1; i >= 0; i--) {
          const p = arr[i];
          p.x += p.velocity.x;
          p.y += p.velocity.y;
          // Gravity only for standard bursts, not shape explosion (which shoots out)
          if(arr === burstParticles || arr === trailParticles) p.velocity.y += 0.1; 
          
          p.alpha -= p.decay;
          if (p.alpha <= 0) arr.splice(i, 1);
        }
      };

      updateParticles(burstParticles);
      updateParticles(trailParticles);
      updateParticles(shapeParticles);
    };

    let animationFrameId: number;
    const loop = () => {
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    // --- Event Handlers ---

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Prevent default to stop text selection, unless clicking an interactive element
      const target = e.target as HTMLElement;
      if (!target.closest('button, input, a, .interactive')) {
        e.preventDefault();
      }

      isDrawingRef.current = true;
      pathRef.current = [{x: e.clientX, y: e.clientY}];
      createBurst(e.clientX, e.clientY); // Initial click burst
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        pathRef.current.push({x: e.clientX, y: e.clientY});
        createTrailSpark(e.clientX, e.clientY);
        
        // Performance optimization: limit path size if dragging too long
        if(pathRef.current.length > 800) {
           pathRef.current.shift();
        }
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const path = pathRef.current;
      
      // If the path is long enough, explode it!
      // No longer need to check for closed shapes.
      if (path.length > 10) {
        explodeShape(path);
      }
      pathRef.current = [];
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', handleMouseDown, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
};

export default Snowfall;