import React, { useState, useEffect, useRef } from 'react';
import { Gift, MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const TAUNTS = [
  "Too slow~ 😝",
  "Can't catch me! 💨",
  "Nope, not here! 🙈",
  "Try harder! 🔥",
  "Left? No, Right! 👉",
  "You missed! 😂",
  "Catch me if you can!",
  "I'm slippery! 🧼",
  "Not even close! 🚀",
  "My grandma is faster! 👵",
  "Almost... NOT! 🤪"
];

interface NaughtyGiftProps {
  onBack: () => void;
}

const NaughtyGift: React.FC<NaughtyGiftProps> = ({ onBack }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);
  const [isSurrendered, setIsSurrendered] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [currentTaunt, setCurrentTaunt] = useState("Catch me!");
  const [winReason, setWinReason] = useState<'skill' | 'rage'>('skill');
  
  // Refs for logic
  const boxRef = useRef<HTMLDivElement>(null);
  const lastEvadeTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickHistoryRef = useRef<number[]>([]);

  // Constants - Hard Mode
  const MAX_ATTEMPTS = 30;
  const EVADE_COOLDOWN = 100; // Much faster reaction time
  const SENSITIVITY_RADIUS = 220; // Reacts from further away
  const RAGE_CLICK_THRESHOLD = 6; // Clicks needed to trigger rage surrender
  const RAGE_TIME_WINDOW = 1200; // Time window for rage clicks (ms)

  useEffect(() => {
    if (isSurrendered || isOpened) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!boxRef.current) return;

      const boxRect = boxRef.current.getBoundingClientRect();
      const boxCenterX = boxRect.left + boxRect.width / 2;
      const boxCenterY = boxRect.top + boxRect.height / 2;

      const dist = Math.sqrt(
        Math.pow(e.clientX - boxCenterX, 2) + 
        Math.pow(e.clientY - boxCenterY, 2)
      );

      // Trigger evasion
      if (dist < SENSITIVITY_RADIUS) {
        evade(e.clientX, e.clientY, boxCenterX, boxCenterY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSurrendered, isOpened, attempts]);

  const evade = (mouseX: number, mouseY: number, boxX: number, boxY: number) => {
    const now = Date.now();
    // Debounce check
    if (now - lastEvadeTime.current < EVADE_COOLDOWN) {
        return;
    }
    lastEvadeTime.current = now;

    // Increment attempts
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Surrender logic (Skill based)
    if (newAttempts >= MAX_ATTEMPTS) {
      triggerSurrender('skill');
      return;
    }

    setCurrentTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);

    // Calculate evasion vector (move away from mouse)
    const angle = Math.atan2(boxY - mouseY, boxX - mouseX);
    const distance = 250 + Math.random() * 150; // Jump further and faster
    
    let moveX = Math.cos(angle) * distance;
    let moveY = Math.sin(angle) * distance;

    // Add chaos
    moveX += (Math.random() - 0.5) * 150;
    moveY += (Math.random() - 0.5) * 150;

    // Calculate new position relative to current
    setPosition(prev => {
      let newX = prev.x + moveX;
      let newY = prev.y + moveY;

      // Safe Boundaries logic
      // We need significant padding to keep the Taunt Bubble (top) and Caption (bottom) visible
      // Top needs ~150px for bubble
      // Bottom needs ~100px for text
      // Sides need ~120px for flags/effects
      const verticalPadding = 220; // Increased to ensure no text clip
      const horizontalPadding = 150;
      
      const limitX = (window.innerWidth / 2) - horizontalPadding;
      const limitY = (window.innerHeight / 2) - verticalPadding;

      // If limits are negative (small screen), clamp to 0 (center)
      const safeLimitX = Math.max(0, limitX);
      const safeLimitY = Math.max(0, limitY);

      if (newX > safeLimitX) newX = -safeLimitX + Math.random() * 50;
      if (newX < -safeLimitX) newX = safeLimitX - Math.random() * 50;
      if (newY > safeLimitY) newY = -safeLimitY + Math.random() * 50;
      if (newY < -safeLimitY) newY = safeLimitY - Math.random() * 50;

      return { x: newX, y: newY };
    });
  };

  const triggerSurrender = (reason: 'skill' | 'rage') => {
      setIsSurrendered(true);
      setWinReason(reason);
      if (reason === 'rage') {
          setCurrentTaunt("Okay! Don't break the screen! 😨");
      } else {
          setCurrentTaunt("I give up! You win! 🏳️");
      }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation so we don't count this as a background click immediately
    
    if (isSurrendered) {
      setIsOpened(true);
      // Center the box when opening so content doesn't go off-screen
      setPosition({ x: 0, y: 0 });
    } else {
        // If user manages to click it while active (cheating or lucky), force a jump immediately
        setCurrentTaunt("Nice try! ⚡️");
        if (boxRef.current) {
             const rect = boxRef.current.getBoundingClientRect();
             evade(e.clientX, e.clientY, rect.left + rect.width/2, rect.top + rect.height/2);
        }
    }
  };

  const handleContainerClick = () => {
      if (isOpened || isSurrendered) return;

      const now = Date.now();
      clickHistoryRef.current.push(now);

      // Remove old clicks
      clickHistoryRef.current = clickHistoryRef.current.filter(t => now - t < RAGE_TIME_WINDOW);

      // Check if threshold reached
      if (clickHistoryRef.current.length >= RAGE_CLICK_THRESHOLD) {
          triggerSurrender('rage');
      }
  };

  const resetGame = () => {
      setAttempts(0);
      setIsSurrendered(false);
      setIsOpened(false);
      setPosition({ x: 0, y: 0 });
      setCurrentTaunt("Ready?");
      lastEvadeTime.current = 0;
      clickHistoryRef.current = [];
      setWinReason('skill');
  };

  return (
    <div 
        onClick={handleContainerClick}
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-1000 ${isOpened ? 'bg-black/40' : 'bg-black/80'}`}
    >
       <button 
         onClick={(e) => { e.stopPropagation(); onBack(); }}
         className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50"
       >
         <ArrowLeft size={24} />
         <span className="font-serif">Back to Home</span>
       </button>

       {/* Reset Button (for testing or replay) */}
       {(isOpened || isSurrendered) && (
           <button 
             onClick={(e) => { e.stopPropagation(); resetGame(); }}
             className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50"
           >
             <RefreshCw size={20} />
             <span className="font-serif">Replay</span>
           </button>
       )}

       <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          <div 
            ref={boxRef}
            // Use onMouseDown to catch clicks faster than onClick sometimes
            onMouseDown={handleClick}
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isOpened 
                ? 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' // Slow elegant move to center on open
                : isSurrendered 
                    ? 'transform 0.5s ease-out' 
                    : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)' // Fast evasive move
            }}
            className={`cursor-pointer relative group flex flex-col items-center justify-center`}
          >
            {/* Taunt Bubble */}
            {!isOpened && currentTaunt && (
              <div className="absolute -top-24 bg-white text-black px-4 py-3 rounded-2xl rounded-bl-none shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in zoom-in duration-200 font-bold font-sans whitespace-nowrap z-20 border-2 border-black min-w-[120px] text-center">
                {currentTaunt}
                <MessageCircle size={20} className="absolute -bottom-2.5 -left-1 text-white fill-white rotate-45 stroke-black stroke-2" />
              </div>
            )}

            {/* The Gift Box Model */}
            <div className={`relative transition-all duration-700 ${isOpened ? 'scale-150' : 'scale-100'}`}>
              
              {isOpened ? (
                // Opened State - Glorious
                <div className="flex flex-col items-center animate-in zoom-in duration-500">
                    <div className="relative">
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-yellow-400/30 blur-[60px] rounded-full animate-pulse-slow"></div>
                        
                        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-2xl border-4 border-christmas-gold text-center shadow-[0_0_100px_rgba(212,175,55,0.6)] relative z-10 transform rotate-1 min-w-[300px]">
                            <div className="animate-bounce mb-6 text-6xl drop-shadow-md">🎁</div>
                            
                            {winReason === 'rage' ? (
                                <>
                                    <h3 className="text-red-900 font-serif font-bold text-3xl mb-3 tracking-wide">Okay, Calm Down!</h3>
                                    <p className="text-gray-700 font-sans text-lg">You really wanted this gift, huh?</p>
                                    <p className="text-gray-700 font-sans text-lg mt-2">I was just teasing you!</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-red-900 font-serif font-bold text-3xl mb-3 tracking-wide">You Caught It!</h3>
                                    <p className="text-gray-700 font-sans text-lg">My love for you is harder to catch,</p>
                                    <p className="text-gray-700 font-sans text-lg">but you have it all.</p>
                                </>
                            )}
                            
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-red-800 text-sm italic font-serif">Merry Christmas 🎄</p>
                            </div>
                        </div>
                    </div>
                </div>
              ) : (
                // Closed State (Naughty or Surrendered)
                <div className="relative">
                    {/* Surrender Flag - FIXED VISUALS */}
                    {isSurrendered && (
                        <div className="absolute -right-24 -top-24 animate-in slide-in-from-bottom-8 duration-700 origin-bottom-left rotate-12 z-0">
                             {/* Pole Group */}
                             <div className="relative h-32 w-24">
                                 {/* Pole: Light gray stick */}
                                 <div className="absolute bottom-0 left-0 w-1.5 h-full bg-slate-300 rounded-full shadow-lg"></div>
                                 
                                 {/* Flag: White cloth attached to top of pole, waving right */}
                                 <div className="absolute top-1 left-1 bg-white text-black px-4 py-2 text-sm font-extrabold shadow-md border border-slate-200 animate-pulse origin-left skew-y-3">
                                     I SURRENDER!
                                 </div>
                             </div>
                        </div>
                    )}
                    
                    {/* 3D-ish Box CSS */}
                    <div className={`z-10 w-32 h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 rounded-2xl shadow-[0_20px_50px_rgba(30,58,138,0.6)] relative flex items-center justify-center border-t border-l border-blue-400/60 ${!isSurrendered ? 'animate-bounce' : ''}`}>
                        {/* Ribbon Vertical */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-yellow-400 shadow-lg border-l border-r border-yellow-500/50" />
                        {/* Ribbon Horizontal */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-yellow-400 shadow-lg border-t border-b border-yellow-500/50" />
                        {/* Bow */}
                        <div className="absolute -top-8 text-yellow-400 drop-shadow-2xl filter brightness-110">
                            <Gift size={72} strokeWidth={1.5} className="fill-yellow-400/20" />
                        </div>
                    </div>
                    
                    <p className={`mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isSurrendered ? 'text-white animate-pulse' : 'text-blue-500/50'}`}>
                        {isSurrendered ? "Click to Open" : `Attempt ${attempts}/${MAX_ATTEMPTS}`}
                    </p>
                </div>
              )}
            </div>
          </div>
       </div>
    </div>
  );
};

export default NaughtyGift;