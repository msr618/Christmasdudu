import React, { useEffect, useRef, useState } from 'react';
import { TreeParticle, LetterPosition, FireworkParticle, Rocket, SceneGift } from '../types';
import { X, Sparkles } from 'lucide-react';

// Helper to safely draw rounded rects in all browsers
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  if (typeof (ctx as any).roundRect === 'function') {
    ctx.beginPath();
    (ctx as any).roundRect(x, y, w, h, r);
    return;
  }
  // Fallback
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const TreeScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLetter, setActiveLetter] = useState<LetterPosition | null>(null);
  const requestRef = useRef<number>(0);

  // Define the letters
  const lettersRef = useRef<LetterPosition[]>([
    {
      id: 1, x: 20, y: -180, z: 40, 
      title: "First Snow",
      content: "Do you remember our first Christmas together? The snow was falling just like tonight. I knew then, as I know now, that you are my favorite gift.",
      isOpen: false
    },
    {
      id: 2, x: 40, y: -80, z: -30, 
      title: "My Wish",
      content: "This year, my only wish is to see you smile every single day. You bring so much light into my life, brighter than any star on this tree.",
      isOpen: false
    },
    {
      id: 3, x: -40, y: -20, z: 30, 
      title: "Forever",
      content: "Seasons change, but my love for you only grows stronger. Merry Christmas, my darling. Here's to a thousand more memories.",
      isOpen: false
    }
  ]);

  const fireworksRef = useRef<FireworkParticle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const mountainShapeRef = useRef<number[]>([]);
  const santaRef = useRef({ x: -200, y: 100 });
  
  // Cannon State Management
  const cannonsRef = useRef([
    { id: 1, x: -200, z: 80, color: '#c92a2a', scale: 1, auto: false, speedLevel: 0, frameOffset: 0 }, 
    { id: 2, x: 200, z: 80, color: '#c92a2a', scale: 1, auto: false, speedLevel: 0, frameOffset: 0 },  
    { id: 3, x: -450, z: 20, color: '#d4af37', scale: 1.8, auto: true, speedLevel: 1, frameOffset: 0 }, 
    { id: 4, x: 450, z: 20, color: '#d4af37', scale: 1.8, auto: true, speedLevel: 1, frameOffset: 30 }   
  ]);
  
  const cannonHitboxes = useRef<{id: number, x: number, y: number, r: number}[]>([]);

  // Static Snowmen positions - Moved small snowmen to the sides of big ones
  // Changed "cool" to "kid" as requested
  const snowmen = [
    { x: -300, z: -50, scale: 1.2, rotation: 0.2, type: 'gentleman' },
    { x: 300, z: -50, scale: 1.1, rotation: -0.5, type: 'lady' },
    { x: -380, z: -30, scale: 0.8, rotation: 0.1, type: 'kid' },
    // Changed this from 'cool' to 'kid' and adjusted scale to match
    { x: 380, z: -30, scale: 0.8, rotation: -0.2, type: 'kid' }
  ];

  // 3D Gifts under the tree
  const sceneGiftsRef = useRef<SceneGift[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- Generate Mountains ---
    if (mountainShapeRef.current.length === 0) {
        const mountainResolution = 5; 
        for(let i=0; i<=width + 400; i+=mountainResolution) {
            let h = Math.sin(i * 0.002) * 150 +      
                    Math.sin(i * 0.01) * 50 +       
                    Math.sin(i * 0.03) * 20 +       
                    Math.random() * 5;              
            mountainShapeRef.current.push(Math.abs(h));
        }
    }

    // --- Generate 3D Gifts ---
    if (sceneGiftsRef.current.length === 0) {
      const giftColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      for(let i=0; i<8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 60 + Math.random() * 40; // Distance from trunk
        sceneGiftsRef.current.push({
          x: Math.cos(angle) * dist,
          y: 0, 
          z: Math.sin(angle) * dist,
          width: 20 + Math.random() * 15,
          height: 15 + Math.random() * 15,
          color: giftColors[Math.floor(Math.random() * giftColors.length)],
          ribbonColor: '#ffd700',
          rotation: Math.random() * Math.PI
        });
      }
    }

    // --- High-Fidelity Tree Generation ---
    const particles: TreeParticle[] = [];
    const treeHeight = 440;
    const maxRadius = 170;
    
    // 1. Generate Trunk
    const trunkSegments = 70; 
    for (let i = -10; i < trunkSegments; i++) { 
        const t = i / trunkSegments; 
        
        const y = -t * (treeHeight * 0.9); 
        
        const radius = 14 * (1 - t * 0.6) + 2;
        const finalRadius = i < 0 ? radius * 1.2 : radius;

        // Increased density for trunk: 15 -> 40
        for (let j = 0; j < 40; j++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * finalRadius;
            particles.push({
                x: r * Math.cos(angle),
                y: y,
                z: r * Math.sin(angle),
                originalX: r * Math.cos(angle),
                originalZ: r * Math.sin(angle),
                yOffset: y,
                radius: 2.5,
                color: `rgb(${60 + Math.random()*20}, ${40 + Math.random()*10}, ${20 + Math.random()*10})`,
                type: 'trunk'
            });
        }
    }

    // 2. Generate Branches & Needles
    const layers = 32;
    for (let l = 0; l < layers; l++) {
        const t = l / layers; 
        const y = - (treeHeight * 0.95) + t * (treeHeight * 0.85); 
        
        const relativeHeight = 1 - t; 
        const layerRadius = 5 + Math.pow(t, 0.9) * maxRadius;

        const branchCount = 8 + Math.floor(t * 15);
        
        for (let b = 0; b < branchCount; b++) {
            const baseAngle = (Math.PI * 2 * b) / branchCount + (l * 0.3);
            const branchLength = layerRadius * (0.8 + Math.random() * 0.4);
            const particlesPerBranch = 15 + Math.floor(t * 20);
            
            for (let p = 0; p < particlesPerBranch; p++) {
                const distRatio = p / particlesPerBranch;
                const dist = distRatio * branchLength;
                const droop = dist * 0.35; 
                const spread = 2 + distRatio * 15;
                const angle = baseAngle + (Math.random() - 0.5) * 0.2;
                
                const px = dist * Math.cos(angle);
                const pz = dist * Math.sin(angle);
                const py = y + droop + (Math.random() - 0.5) * spread;

                if (py > 5) continue; 

                const green = 50 + distRatio * 80 + Math.random() * 30;
                const red = 10 + Math.random() * 20;
                const blue = 20 + Math.random() * 30;
                
                let type: TreeParticle['type'] = 'needle';
                let color = `rgb(${red}, ${green}, ${blue})`;
                let pRadius = 1.5;

                const rand = Math.random();
                if (rand > 0.985) {
                    type = 'light';
                    color = ['#ff3333', '#ffd700', '#33ff33', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 5)];
                    pRadius = 2.5;
                } else if (rand > 0.98) {
                    type = 'bell';
                    color = '#d4af37';
                    pRadius = 3;
                }

                particles.push({
                    x: px, y: py, z: pz,
                    originalX: px, originalZ: pz, yOffset: py,
                    radius: pRadius,
                    color: color,
                    type: type,
                    blinkSpeed: Math.random() * 0.1 + 0.05,
                    blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }
    }

    // Top Star
    particles.push({
        x: 0, y: -treeHeight - 5, z: 0,
        originalX: 0, originalZ: 0, yOffset: -treeHeight - 5,
        radius: 8, color: '#ffd700', type: 'star'
    });

    const launchRocket = (startX: number, startY: number, isAuto: boolean = false) => {
        const targetY = height * 0.1 + Math.random() * height * 0.25;
        const colors = ['#ff0044', '#00ffaa', '#44aaff', '#ffd700', '#ff00ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        rocketsRef.current.push({
            x: startX,
            y: startY,
            targetY: targetY,
            vx: (Math.random() - 0.5) * (isAuto ? 2 : 1), 
            vy: -10 - Math.random() * 5, 
            color: color,
            trail: []
        });
    };

    const explodeFirework = (x: number, y: number, color: string) => {
        const type = Math.random(); 
        for(let i=0; i<80; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 5 + 2;
            
            if (type > 0.8) {
                speed = 3 + Math.random() * 2;
            }

            fireworksRef.current.push({
                x: x, 
                y: y, 
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: color,
                radius: Math.random() * 2 + 1,
                trail: [] // Initialize trail
            });
        }
    };

    // --- Animation Loop ---
    let rotation = 0;
    let time = 0;
    let frameCount = 0;

    const draw = () => {
        // Clear & Background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#050214'); 
        gradient.addColorStop(0.5, '#0e1836'); 
        gradient.addColorStop(1, '#25355e'); 
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Stars
        for(let i=0; i<50; i++) {
             const starX = (i * 137.5) % width;
             const starY = (i * 293.3) % (height * 0.65);
             const twinkle = Math.sin(time * 0.5 + i) * 0.5 + 0.5;
             ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
             ctx.fillRect(starX, starY, Math.random() > 0.5 ? 2 : 1.5, Math.random() > 0.5 ? 2 : 1.5);
        }

        // Moon
        ctx.fillStyle = '#fffbeb';
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(255, 251, 235, 0.5)';
        ctx.beginPath();
        ctx.arc(width * 0.85, 80, 45, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Flying Santa Animation
        santaRef.current.x += 1.5;
        if (santaRef.current.x > width + 200) santaRef.current.x = -300;
        const santaY = 120 + Math.sin(time * 0.05) * 40;
        
        ctx.fillStyle = 'rgba(10,10,20,0.8)'; 
        ctx.beginPath();
        ctx.ellipse(santaRef.current.x, santaY, 20, 10, 0.1, 0, Math.PI*2);
        for(let i=1; i<=4; i++) {
            ctx.ellipse(santaRef.current.x + i*30, santaY + Math.sin(time*0.5 + i)*5 - 5, 8, 5, 0, 0, Math.PI*2);
        }
        ctx.fill();

        // --- Realistic Mountains ---
        // Layer 1
        ctx.fillStyle = '#0f172a'; 
        ctx.beginPath();
        ctx.moveTo(0, height);
        for(let i=0; i<=width; i+=5) {
            const idx = Math.floor(i)%mountainShapeRef.current.length;
            const h = mountainShapeRef.current[idx];
            ctx.lineTo(i, height - 150 - h * 1.5);
        }
        ctx.lineTo(width, height);
        ctx.fill();

        // Layer 2
        const mountGrad = ctx.createLinearGradient(0, height - 300, 0, height);
        mountGrad.addColorStop(0, '#334155'); 
        mountGrad.addColorStop(1, '#0f172a'); 
        ctx.fillStyle = mountGrad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for(let i=0; i<=width; i+=5) {
             const idx = Math.floor(i + 300)%mountainShapeRef.current.length;
             const h = mountainShapeRef.current[idx];
             ctx.lineTo(i, height - 100 - h * 1.2);
        }
        ctx.lineTo(width, height);
        ctx.fill();

        // --- Ground ---
        const groundY = height * 0.85; 
        const foreGrad = ctx.createRadialGradient(width/2, height + 100, 200, width/2, groundY, 1000);
        foreGrad.addColorStop(0, '#ffffff');
        foreGrad.addColorStop(0.4, '#f1f5f9');
        foreGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = foreGrad;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.bezierCurveTo(width * 0.3, groundY - 30, width * 0.7, groundY + 30, width, groundY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();

        // Update Time & Rotation
        rotation += 0.003; 
        time += 0.05;
        frameCount++;
        
        const cx = width / 2;
        const cy = groundY + 10; 
        const fov = 900;

        // Auto Fire Logic
        cannonsRef.current.forEach(c => {
            if (c.auto && c.speedLevel > 0) {
                const interval = c.speedLevel === 1 ? 120 : c.speedLevel === 2 ? 60 : 30;
                
                if ((frameCount + c.frameOffset) % interval === 0) {
                     const rz = c.z;
                     const scale = fov / (fov + rz);
                     const x2d = (c.x * scale) + cx;
                     const y2d = (10) * scale + cy;
                     launchRocket(x2d, y2d - 60*scale*c.scale, true);
                }
            }
        });

        // --- 3D Objects Sorting & Rendering ---
        
        type RenderItem = 
            | { type: 'particle', p: TreeParticle, z: number }
            | { type: 'snowman', idx: number, z: number }
            | { type: 'cannon', idx: number, z: number }
            | { type: 'letter', letter: LetterPosition, z: number }
            | { type: 'gift', gift: SceneGift, z: number };

        const renderQueue: RenderItem[] = [];

        // 1. Tree Particles (Rotating)
        particles.forEach(p => {
            const az = p.originalZ * Math.cos(rotation) - p.originalX * Math.sin(rotation);
            renderQueue.push({ type: 'particle', p, z: az });
        });

        // 2. Snowmen (Static World)
        snowmen.forEach((sm, idx) => {
            renderQueue.push({ type: 'snowman', idx, z: sm.z });
        });

        // 3. Cannons (Static World)
        cannonsRef.current.forEach((c, idx) => {
             renderQueue.push({ type: 'cannon', idx, z: c.z });
        });

        // 4. Letters (Rotating with tree)
        lettersRef.current.forEach(l => {
             const az = l.z * Math.cos(rotation) - l.x * Math.sin(rotation);
             renderQueue.push({ type: 'letter', letter: l, z: az });
        });

        // 5. Gifts (Static World - NOT rotating)
        sceneGiftsRef.current.forEach(g => {
             // Use original x/z directly, do not rotate
             renderQueue.push({ type: 'gift', gift: g, z: g.z });
        });

        renderQueue.sort((a, b) => b.z - a.z);

        cannonHitboxes.current = []; 

        renderQueue.forEach(item => {
            if (item.type === 'particle') {
                const p = item.p;
                const rx = p.originalX * Math.cos(rotation) + p.originalZ * Math.sin(rotation);
                const rz = item.z;
                const scale = fov / (fov + rz);
                const x2d = rx * scale + cx;
                const y2d = p.yOffset * scale + cy;

                if (scale > 0 && rz > -fov + 10) {
                     ctx.beginPath();
                     let alpha = 1;
                     let radius = p.radius * scale;
                     let blur = 0;
                     if (p.type === 'light') {
                         const blink = Math.sin(time * p.blinkSpeed! + p.blinkOffset!);
                         alpha = 0.7 + 0.3 * blink;
                         blur = 10 * scale;
                     } else if (p.type === 'star') {
                         blur = 30 * scale;
                         radius *= 1.2;
                     }
                     if (blur > 0) {
                         ctx.shadowBlur = blur;
                         ctx.shadowColor = p.color;
                     }
                     ctx.globalAlpha = alpha;
                     ctx.fillStyle = p.color;
                     ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
                     ctx.fill();
                     ctx.shadowBlur = 0;
                     ctx.globalAlpha = 1;
                }
            } 
            else if (item.type === 'gift') {
                const g = item.gift;
                // Static coordinates
                const rx = g.x;
                const rz = g.z;
                const scale = fov / (fov + rz);
                const x2d = rx * scale + cx;
                const y2d = (g.y) * scale + cy; 

                if (scale > 0 && rz > -fov + 10) {
                    const w = g.width * scale;
                    const h = g.height * scale;
                    
                    ctx.save();
                    ctx.translate(x2d, y2d - h); 
                    
                    ctx.fillStyle = g.color;
                    ctx.fillRect(-w/2, 0, w, h);
                    
                    ctx.fillStyle = g.ribbonColor;
                    ctx.fillRect(-w/10, 0, w/5, h);
                    
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.beginPath();
                    ctx.moveTo(-w/2, 0);
                    ctx.lineTo(-w/3, -w/3);
                    ctx.lineTo(w/2 + w/6, -w/3);
                    ctx.lineTo(w/2, 0);
                    ctx.fill();

                    ctx.restore();
                }
            }
            else if (item.type === 'snowman') {
                const sm = snowmen[item.idx];
                const rx = sm.x;
                const rz = sm.z;
                const scale = fov / (fov + rz);
                const x2d = rx * scale + cx;
                const y2d = (0) * scale + cy + 15 * scale; 

                if (scale > 0 && rz > -fov + 10) {
                    const s = sm.scale * scale;
                    const bounce = Math.abs(Math.sin(time * 2 + item.idx)) * 5 * s;

                    ctx.save();
                    ctx.translate(x2d, y2d - bounce);
                    
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.beginPath();
                    ctx.ellipse(0, 5*s + bounce, 30*s, 10*s, 0, 0, Math.PI*2);
                    ctx.fill();

                    const drawSnowball = (yOffset: number, r: number) => {
                         const grad = ctx.createRadialGradient(-r*0.3, yOffset-r*0.3, r*0.2, 0, yOffset, r);
                         grad.addColorStop(0, '#ffffff');
                         grad.addColorStop(1, '#e2e8f0');
                         ctx.fillStyle = grad;
                         ctx.beginPath();
                         ctx.arc(0, yOffset, r, 0, Math.PI*2);
                         ctx.fill();
                    };

                    drawSnowball(0, 25*s); 
                    drawSnowball(-35*s, 18*s); 
                    drawSnowball(-60*s, 12*s); 

                    if (sm.type !== 'cool') {
                        ctx.fillStyle = '#1f2937';
                        ctx.beginPath();
                        ctx.arc(-4*s, -63*s, 1.5*s, 0, Math.PI*2);
                        ctx.arc(4*s, -63*s, 1.5*s, 0, Math.PI*2);
                        ctx.fill();
                    }

                    ctx.fillStyle = '#ea580c';
                    ctx.beginPath();
                    ctx.moveTo(0, -60*s);
                    ctx.lineTo(8*s, -58*s);
                    ctx.lineTo(0, -56*s);
                    ctx.fill();

                    if (sm.type === 'gentleman') {
                        ctx.fillStyle = '#111';
                        ctx.fillRect(-10*s, -95*s, 20*s, 20*s); 
                        ctx.fillRect(-15*s, -75*s, 30*s, 3*s);  
                    } else if (sm.type === 'lady') {
                         ctx.strokeStyle = '#db2777';
                         ctx.lineWidth = 4*s;
                         ctx.lineCap = 'round';
                         ctx.beginPath();
                         ctx.moveTo(-10*s, -48*s);
                         ctx.quadraticCurveTo(0, -42*s, 10*s, -48*s);
                         ctx.stroke();
                    } else if (sm.type === 'cool') {
                        // Render logic removed/ignored since we switched to 'kid'
                    } else {
                         // Kid logic
                         ctx.strokeStyle = '#dc2626';
                         ctx.lineWidth = 4*s;
                         ctx.lineCap = 'round';
                         ctx.beginPath();
                         ctx.moveTo(-10*s, -48*s);
                         ctx.quadraticCurveTo(0, -42*s, 10*s, -48*s);
                         ctx.stroke();
                    }

                    ctx.strokeStyle = '#78350f';
                    ctx.lineWidth = 2*s;
                    ctx.beginPath();
                    ctx.moveTo(15*s, -35*s);
                    ctx.lineTo(30*s, -45*s + Math.sin(time*5)*5*s); 
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(-15*s, -35*s);
                    ctx.lineTo(-30*s, -40*s);
                    ctx.stroke();

                    ctx.restore();
                }
            } else if (item.type === 'cannon') {
                const c = cannonsRef.current[item.idx];
                const rx = c.x;
                const rz = c.z;
                const scale = fov / (fov + rz);
                const x2d = rx * scale + cx;
                const y2d = (0) * scale + cy + 10 * scale;

                if (scale > 0 && rz > -fov + 10) {
                    const s = scale * c.scale;
                    
                    cannonHitboxes.current.push({
                        id: c.id,
                        x: x2d,
                        y: y2d - 15*s,
                        r: 25 * s
                    });

                    ctx.save();
                    ctx.translate(x2d, y2d);
                    
                    ctx.fillStyle = '#4a0404'; 
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 20*s, 8*s, 0, 0, Math.PI*2);
                    ctx.fill();

                    let recoil = 0;
                    if (c.auto && c.speedLevel > 0) {
                        const interval = c.speedLevel === 1 ? 120 : c.speedLevel === 2 ? 60 : 30;
                        const cycle = (frameCount + c.frameOffset) % interval;
                        if (cycle < 5) recoil = (5 - cycle) * 2 * s;
                    }

                    const grad = ctx.createLinearGradient(-10*s, 0, 10*s, 0);
                    grad.addColorStop(0, '#b45309');
                    grad.addColorStop(0.5, c.color);
                    grad.addColorStop(1, '#b45309');
                    ctx.fillStyle = grad;
                    
                    ctx.beginPath();
                    ctx.moveTo(-10*s, 0);
                    ctx.lineTo(-12*s, -30*s + recoil); 
                    ctx.lineTo(12*s, -30*s + recoil);
                    ctx.lineTo(10*s, 0);
                    ctx.fill();

                    ctx.fillStyle = '#fcd34d'; 
                    ctx.beginPath();
                    ctx.ellipse(0, -30*s + recoil, 12*s, 3*s, 0, 0, Math.PI*2);
                    ctx.fill();
                    
                    if (!c.auto) {
                        const sparkScale = Math.sin(time*10) * 0.2 + 1;
                        ctx.fillStyle = '#fbbf24';
                        ctx.beginPath();
                        ctx.arc(8*s, -5*s, 2*s*sparkScale, 0, Math.PI*2);
                        ctx.fill();
                        
                        ctx.font = `bold ${10*s}px serif`;
                        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                        ctx.textAlign = "center";
                        ctx.fillText("FIRE", 0, -45*s);
                    } else {
                        ctx.font = `bold ${12*s}px serif`;
                        ctx.fillStyle = c.speedLevel === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,215,0,0.9)";
                        ctx.textAlign = "center";
                        const txt = c.speedLevel === 0 ? "OFF" : c.speedLevel === 1 ? "x1" : c.speedLevel === 2 ? "x2" : "MAX";
                        ctx.fillText(txt, 0, -45*s + recoil);
                    }

                    ctx.restore();
                }
            } else if (item.type === 'letter') {
                 const l = item.letter;
                 const rx = l.x * Math.cos(rotation) + l.z * Math.sin(rotation);
                 const rz = item.z;
                 const scale = fov / (fov + rz);
                 const x2d = rx * scale + cx;
                 const y2d = l.y * scale + cy;

                 if (scale > 0 && rz > -fov + 10) {
                    ctx.save();
                    ctx.translate(x2d, y2d);
                    const bob = Math.sin(time * 0.1 + l.id) * 5 * scale;
                    ctx.translate(0, bob);
                    
                    const size = 32 * scale;
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#f8f9fa';
                    drawRoundedRect(ctx, -size/2, -size*0.35, size, size * 0.7, 4);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#dee2e6';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-size/2, -size*0.35);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(size/2, -size*0.35);
                    ctx.stroke();
                    ctx.fillStyle = '#c92a2a';
                    ctx.beginPath();
                    ctx.arc(0, 4 * scale, size/6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    l.projX = x2d;
                    l.projY = y2d + bob;
                    l.projSize = size;
                 } else {
                     l.projX = -9999;
                 }
            }
        });

        // 5. Rockets Logic
        for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
            const r = rocketsRef.current[i];
            r.x += r.vx;
            r.y += r.vy;
            r.vy += 0.15; 

            r.trail.push({x: r.x, y: r.y, alpha: 1});
            if(r.trail.length > 10) r.trail.shift();

            ctx.beginPath();
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 2;
            r.trail.forEach((t, idx) => {
                if(idx === 0) ctx.moveTo(t.x, t.y);
                else ctx.lineTo(t.x, t.y);
            });
            ctx.stroke();

            ctx.shadowBlur = 10;
            ctx.shadowColor = r.color;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(r.x, r.y, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (r.vy >= 0 || r.y <= r.targetY) {
                explodeFirework(r.x, r.y, r.color);
                rocketsRef.current.splice(i, 1);
            }
        }

        // 6. Fireworks Rendering
        for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
            const fw = fireworksRef.current[i];
            
            // Update Trail logic
            fw.trail.push({x: fw.x, y: fw.y});
            // Keep trail short (7 frames) for performance and aesthetics
            if (fw.trail.length > 7) {
                fw.trail.shift();
            }

            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += 0.08; 
            fw.alpha -= 0.015;

            if (fw.alpha <= 0) {
                fireworksRef.current.splice(i, 1);
                continue;
            }

            // Draw Trail
            if (fw.trail.length > 1) {
                ctx.save();
                // Trail fades out slightly faster than the head and is transparent
                ctx.globalAlpha = fw.alpha * 0.4;
                ctx.strokeStyle = fw.color;
                ctx.lineWidth = fw.radius * 0.8; 
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(fw.trail[0].x, fw.trail[0].y);
                for (let j = 1; j < fw.trail.length; j++) {
                     ctx.lineTo(fw.trail[j].x, fw.trail[j].y);
                }
                ctx.lineTo(fw.x, fw.y);
                ctx.stroke();
                ctx.restore();
            }

            // Draw Head
            ctx.save();
            ctx.globalAlpha = fw.alpha;
            ctx.fillStyle = fw.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = fw.color;
            ctx.beginPath();
            ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let hitCannon = false;
        cannonHitboxes.current.forEach(cb => {
            const dist = Math.sqrt(Math.pow(x - cb.x, 2) + Math.pow(y - cb.y, 2));
            if (dist < cb.r) {
                const cannon = cannonsRef.current.find(c => c.id === cb.id);
                if (cannon) {
                    if (cannon.auto) {
                        cannon.speedLevel = (cannon.speedLevel + 1) % 4;
                    } else {
                        launchRocket(cb.x, cb.y);
                    }
                }
                hitCannon = true;
            }
        });
        
        if (hitCannon) return;

        lettersRef.current.forEach(letter => {
            if (letter.projX && letter.projY && letter.projSize) {
                const dist = Math.sqrt(Math.pow(x - letter.projX, 2) + Math.pow(y - letter.projY, 2));
                if (dist < letter.projSize) {
                    setActiveLetter(letter);
                }
            }
        });
    };

    const handleResize = () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleClick);

    return () => {
        cancelAnimationFrame(requestRef.current);
        window.removeEventListener('resize', handleResize);
        if (canvas) canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-screen bg-black overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer block z-10" />
        
        {/* UI Overlay */}
        <div className="absolute top-24 left-6 z-30 pointer-events-none">
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-6 duration-700">
                <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-christmas-gold/20 shadow-xl max-w-xs">
                    <div className="flex items-center gap-2 mb-2 text-christmas-gold">
                        <Sparkles size={16} />
                        <span className="font-serif font-bold text-sm">Magic Controls</span>
                    </div>
                    <p className="text-xs text-christmas-cream/80 leading-relaxed font-sans">
                        Tap <strong>Big Cannons</strong> to change speed.<br/>
                        Tap <strong>Small Cannons</strong> to fire.<br/>
                        Find the <strong>Letters</strong> hidden in the branches.
                    </p>
                </div>
            </div>
        </div>

        {/* Letter Modal */}
        {activeLetter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="relative bg-[#fdfbf7] text-[#2a0a0a] max-w-lg w-full p-10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] transform rotate-1 border-4 border-[#e6e2d8]">
                    <button 
                        onClick={() => setActiveLetter(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-800 transition-colors"
                    >
                        <X size={28} />
                    </button>

                    <div className="absolute top-6 right-10 w-20 h-24 opacity-70 border-2 border-red-800/30 flex items-center justify-center rotate-6 pointer-events-none">
                         <div className="w-16 h-20 bg-red-800/5" />
                         <span className="absolute text-[10px] text-red-900 font-serif bottom-1">NORTH POLE</span>
                    </div>

                    <h2 className="text-4xl font-serif text-red-900 mb-8 border-b-2 border-red-900/10 pb-4">
                        {activeLetter.title}
                    </h2>
                    
                    <div className="font-serif text-xl leading-loose text-gray-800 space-y-4">
                        <p>{activeLetter.content}</p>
                    </div>

                    <div className="mt-10 text-right font-serif text-red-900 italic text-lg flex flex-col items-end">
                        <span>Yours, always.</span>
                        <span className="text-sm text-gray-400 mt-2 not-italic font-sans">12.25.2024</span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TreeScene;