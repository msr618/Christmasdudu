import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Box, Lock, Hammer, Sparkles, Check } from 'lucide-react';

interface InfiniteUnboxingProps {
  onBack: () => void;
}

const COMMENTS = [
  "Are we there yet? 🤔",
  "Just one more layer...",
  "My hands are tired! 😫",
  "Is this a prank? 🤡",
  "Who wrapped this?!",
  "Keep going! 💪",
  "What's inside?? 🎁",
  "Almost... maybe?",
  "This is like an onion 🧅",
  "Harder than it looks!",
  "Nice box though 📦"
];

// Danmu Item Interface
interface DanmuItem {
  id: number;
  text: string;
  top: number; // percentage
  duration: number; // seconds
}

const InfiniteUnboxing: React.FC<InfiniteUnboxingProps> = ({ onBack }) => {
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0); 
  // 0: Tape Box (Swipe), 1: Red Gift (Click), 2: Safe (Spin), 3: Walnut (Crack), 4: Finish
  
  const [danmuList, setDanmuList] = useState<DanmuItem[]>([]);
  const [shake, setShake] = useState(false);
  
  // STAGE 0: Tape Logic
  const [tapeHealth, setTapeHealth] = useState(100);
  const isDraggingRef = useRef(false);

  // STAGE 2: Safe Logic
  const [dialRotation, setDialRotation] = useState(0);
  const [safeProgress, setSafeProgress] = useState(0);
  const dialRef = useRef<HTMLDivElement>(null);

  // STAGE 3: Walnut Logic
  const [walnutHealth, setWalnutHealth] = useState(30);
  const WALNUT_MAX = 30;

  // Danmu Generator
  useEffect(() => {
    if (stage === 4) return;
    const interval = setInterval(() => {
      const id = Date.now();
      const text = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
      setDanmuList(prev => [
        ...prev,
        { id, text, top: Math.random() * 80 + 10, duration: Math.random() * 3 + 4 }
      ]);
      
      // Cleanup old danmu
      setTimeout(() => {
        setDanmuList(prev => prev.filter(item => item.id !== id));
      }, 8000);
    }, 2000);
    return () => clearInterval(interval);
  }, [stage]);

  // --- Handlers ---

  // Stage 0: Tape
  const handleTapeMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Only if mouse is down
    setTapeHealth(prev => {
        const next = prev - 1.5;
        if (next <= 0) {
            triggerNextStage();
            return 0;
        }
        return next;
    });
  };

  // Stage 2: Safe Rotation
  const handleDialMove = (e: React.MouseEvent | React.TouchEvent) => {
     if (!dialRef.current) return;
     const rect = dialRef.current.getBoundingClientRect();
     const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
     
     const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
     const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

     const angle = Math.atan2(clientY - center.y, clientX - center.x);
     const degrees = angle * (180 / Math.PI);
     
     // Simple logic: Just tracking absolute change would be better, but direct mapping is fine
     setDialRotation(degrees);
     
     // Increase progress if moving
     setSafeProgress(prev => {
         const next = prev + 1;
         if (next >= 100) {
             triggerNextStage();
             return 100;
         }
         return next;
     });
  };

  // Stage 3: Walnut
  const handleWalnutClick = () => {
      setShake(true);
      setTimeout(() => setShake(false), 100);
      
      setWalnutHealth(prev => {
          const next = prev - 1;
          if (next <= 0) {
              triggerNextStage();
              return 0;
          }
          return next;
      });
  };

  const triggerNextStage = () => {
      // Small delay for effect
      setTimeout(() => {
          setStage(prev => (prev + 1) as any);
      }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1510] flex items-center justify-center overflow-hidden">
        {/* Danmu Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            {danmuList.map(item => (
                <div 
                    key={item.id}
                    style={{ 
                        top: `${item.top}%`, 
                        animationDuration: `${item.duration}s` 
                    }}
                    className="absolute right-[-200px] text-white/40 font-bold whitespace-nowrap text-xl animate-[float-left_linear_forwards]"
                >
                    {item.text}
                </div>
            ))}
        </div>

        <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50"
        >
            <ArrowLeft size={24} />
            <span className="font-serif">Give Up (Exit)</span>
        </button>

        {/* --- STAGE 0: UGLY BOX --- */}
        {stage === 0 && (
            <div className="flex flex-col items-center">
                <h2 className="text-amber-500 font-serif text-2xl mb-8 animate-pulse">Swipe to cut the tape!</h2>
                <div 
                    onMouseMove={handleTapeMove}
                    className="relative w-72 h-72 bg-[#8b5a2b] rounded-sm shadow-2xl cursor-crosshair flex items-center justify-center border-4 border-[#5d3a1a]"
                >
                    {/* Box Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>
                    
                    {/* Tape */}
                    <div 
                        className="absolute w-full h-16 bg-[#d1c4a7] rotate-0 flex items-center justify-center opacity-90 border-y border-[#b0a48b]"
                        style={{ opacity: tapeHealth / 100 }}
                    >
                        <span className="text-black/20 font-bold uppercase tracking-widest text-xs">Priority Mail</span>
                    </div>
                    <div 
                        className="absolute w-full h-16 bg-[#d1c4a7] rotate-90 flex items-center justify-center opacity-90 border-y border-[#b0a48b]"
                        style={{ opacity: tapeHealth / 100 }}
                    >
                    </div>

                    <Box size={64} className="text-[#5d3a1a]/50" />
                </div>
                <div className="mt-4 w-72 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-100" style={{ width: `${100 - tapeHealth}%` }}></div>
                </div>
            </div>
        )}

        {/* --- STAGE 1: RED GIFT --- */}
        {stage === 1 && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <h2 className="text-red-400 font-serif text-2xl mb-8">Oh look! A nicer box.</h2>
                <div 
                    onClick={triggerNextStage}
                    className="relative w-64 h-64 bg-red-700 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.4)] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center border-2 border-red-500"
                >
                     <div className="absolute inset-x-0 h-10 bg-yellow-400 top-1/2 -translate-y-1/2 shadow-sm"></div>
                     <div className="absolute inset-y-0 w-10 bg-yellow-400 left-1/2 -translate-x-1/2 shadow-sm"></div>
                     <div className="z-10 bg-yellow-500 p-2 rounded-full shadow-lg">
                         <span className="text-2xl">🎁</span>
                     </div>
                </div>
                <p className="mt-4 text-gray-400 text-sm">Click to open</p>
            </div>
        )}

        {/* --- STAGE 2: SAFE --- */}
        {stage === 2 && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <h2 className="text-blue-300 font-serif text-2xl mb-8">It's... a safe? Spin to unlock!</h2>
                <div 
                    ref={dialRef}
                    onMouseMove={(e) => e.buttons === 1 && handleDialMove(e)}
                    onTouchMove={handleDialMove}
                    className="relative w-64 h-64 bg-slate-800 rounded-3xl shadow-2xl border-4 border-slate-600 flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                     {/* Lock Body */}
                     <div className="absolute top-4 w-full text-center">
                         <div className={`inline-block w-4 h-4 rounded-full ${safeProgress >= 100 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} transition-colors duration-300`}></div>
                     </div>

                     {/* The Dial */}
                     <div 
                        style={{ transform: `rotate(${dialRotation}deg)` }}
                        className="w-40 h-40 rounded-full bg-slate-300 shadow-inner border-8 border-slate-400 flex items-center justify-center relative"
                     >
                         <div className="absolute top-2 w-2 h-4 bg-slate-600 rounded-full"></div>
                         <div className="w-24 h-24 rounded-full bg-slate-200 shadow-lg flex items-center justify-center">
                             <Lock size={32} className="text-slate-600" />
                         </div>
                     </div>
                </div>
                <div className="mt-6 w-64 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${safeProgress}%` }}></div>
                </div>
            </div>
        )}

        {/* --- STAGE 3: WALNUT --- */}
        {stage === 3 && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <h2 className="text-[#a67c52] font-serif text-2xl mb-8">A... Walnut? Crack it open!</h2>
                <div 
                    onClick={handleWalnutClick}
                    className={`relative w-48 h-48 bg-[#6b4423] rounded-[40%] shadow-xl cursor-pointer flex items-center justify-center border-4 border-[#4a2e16]
                        ${shake ? 'animate-[wiggle_0.1s_ease-in-out_infinite]' : ''}
                    `}
                >
                     {/* Cracks overlay */}
                     <div className="absolute inset-0 rounded-[40%] overflow-hidden opacity-70 pointer-events-none">
                         {walnutHealth < 20 && <div className="absolute top-1/4 left-1/4 w-1/2 h-1 bg-black/40 rotate-45"></div>}
                         {walnutHealth < 10 && <div className="absolute bottom-1/3 right-1/4 w-1/2 h-1 bg-black/40 -rotate-12"></div>}
                         {walnutHealth < 5 && <div className="absolute top-1/2 left-0 w-full h-1 bg-black/40 rotate-0"></div>}
                     </div>

                     <div className="text-6xl select-none">🌰</div>
                </div>
                <div className="mt-8 flex items-center gap-2 text-gray-400">
                    <Hammer size={20} className={shake ? 'rotate-[-45deg]' : ''} />
                    <span>{walnutHealth} clicks left</span>
                </div>
            </div>
        )}

        {/* --- STAGE 4: FINAL REVEAL --- */}
        {stage === 4 && (
            <div className="max-w-md w-full p-8 mx-4 animate-in zoom-in-50 duration-1000">
                 <div className="bg-[#fff1f2] rounded-lg shadow-[0_0_100px_rgba(244,63,94,0.4)] p-8 relative transform rotate-1 border border-pink-200">
                     {/* Tape on corners */}
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-pink-200/50 rotate-1 backdrop-blur-sm"></div>

                     <h3 className="font-serif text-3xl text-pink-900 mb-6 text-center">Finally!</h3>
                     <p className="font-sans text-gray-700 text-lg leading-relaxed text-center mb-6">
                         Your patience is truly legendary. <br/>
                         Just like my love for you—it has many layers, 
                         sometimes it's a bit nutty 🌰, 
                         but it's always worth it.
                     </p>
                     
                     <div className="flex justify-center mb-6">
                         <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center animate-bounce">
                             <Sparkles className="text-pink-500" />
                         </div>
                     </div>

                     <div className="text-center border-t border-pink-200 pt-4">
                         <p className="font-serif text-pink-800 italic">Merry Christmas!</p>
                         <p className="text-xs text-pink-400 mt-2">(No more boxes, I promise)</p>
                     </div>
                 </div>
            </div>
        )}

        <style>{`
          @keyframes float-left {
            from { transform: translateX(0); }
            to { transform: translateX(-200vw); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
        `}</style>
    </div>
  );
};

export default InfiniteUnboxing;