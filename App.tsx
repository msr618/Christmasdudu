import React, { useState, useEffect, useRef } from 'react';
import Snowfall from './components/Snowfall';
import GiftBox from './components/GiftBox';
import NaughtyGift from './components/NaughtyGift';
import TreeScene from './components/TreeScene';
import InfiniteUnboxing from './components/InfiniteUnboxing';
import FlappySanta from './components/FlappySanta';
import { Volume2, VolumeX, ArrowLeft, Gamepad2, Gift, Package, Rocket } from 'lucide-react';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewMode>(ViewMode.HOME);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Play directly on user interaction to bypass browser autoplay policies
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Audio play failed:", error);
              // Fallback: keep state as false if play failed
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const handleOpenTree = () => {
    setView(ViewMode.TREE);
    // If not playing, try to start music when entering the scene (might be blocked, but worth a try)
    if (!isPlaying && audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.log("Autoplay on navigation blocked", e));
    }
  };

  const handleStartGame = () => {
      setView(ViewMode.GAME);
  };

  const handleStartUnboxing = () => {
      setView(ViewMode.UNBOXING);
  };

  const handleStartFlappy = () => {
      setView(ViewMode.FLAPPY_SANTA);
  };

  const handleBack = () => {
    setView(ViewMode.HOME);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#1a472a] via-[#4a0404] to-[#0f172a] overflow-hidden text-christmas-cream selection:bg-christmas-gold selection:text-black">
      
      {/* 
        Background Music / 背景音乐
        Updated to a more stable CDN source to prevent "no supported sources" error.
      */}
      <audio 
        ref={audioRef} 
        // 使用更稳定的 Pixabay CDN 源 (Jingle Bells Piano Version)
        src="https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3"
        loop 
        playsInline
      />

      {/* Background Ambience - Global */}
      <Snowfall />
      
      {/* Decorative Gradient Orbs - Global */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full z-40 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
           {view !== ViewMode.HOME && (
             <button 
               onClick={handleBack}
               className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-christmas-gold transition-colors"
             >
               <ArrowLeft size={20} />
             </button>
           )}
           <div className="text-2xl font-serif text-christmas-gold tracking-widest font-bold drop-shadow-md">
             12.25
           </div>
        </div>
        
        <button 
          onClick={toggleMusic}
          className="pointer-events-auto p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
          title={isPlaying ? "Mute Music" : "Play Music"}
        >
          {isPlaying ? (
            <Volume2 size={20} className="text-christmas-gold group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX size={20} className="text-white/50 group-hover:text-white transition-colors" />
          )}
        </button>
      </nav>

      {/* Content Switching */}
      {view === ViewMode.HOME && (
        <main className="relative z-10 container mx-auto px-4 pt-28 pb-20 flex flex-col items-center">
          
          {/* Hero Section */}
          <header className={`text-center mb-8 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block mb-4 px-4 py-1 rounded-full border border-christmas-gold/30 bg-christmas-gold/10 text-christmas-gold text-xs font-sans tracking-[0.2em] uppercase backdrop-blur-sm">
              Special Delivery
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fca5a5] via-[#fcd34d] to-[#86efac] mb-6 drop-shadow-sm">
              Merry Christmas
            </h1>
            <p className="text-xl md:text-3xl font-serif italic text-christmas-cream/90 max-w-2xl mx-auto leading-relaxed tracking-wide drop-shadow-md">
              To the most wonderful person in my world. <br/>
              Here is a little magic, just for you.
            </p>
          </header>

          <div className={`w-full max-w-6xl flex flex-col md:flex-row flex-wrap items-center justify-center gap-8 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
             
             {/* 1. Main Gift (Red) -> Tree */}
             <div className="w-full max-w-xs md:max-w-sm">
                <GiftBox onOpen={handleOpenTree} />
             </div>

             {/* 2. Mini Game (Blue) -> NaughtyGift */}
             <div className="flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-2xl w-full max-w-xs md:max-w-sm h-[320px] transform transition-all hover:scale-105 duration-500 group cursor-pointer relative overflow-hidden" onClick={handleStartGame}>
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                <h2 className="text-xl font-serif text-blue-300 mb-6 tracking-widest uppercase relative z-10">
                  Catch Me
                </h2>
                <div className="relative animate-float z-10" style={{ animationDelay: '1s' }}>
                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl shadow-xl flex items-center justify-center relative border-t border-l border-blue-400/50 group-hover:rotate-12 transition-transform duration-500">
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-yellow-400 shadow-sm" />
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-yellow-400 shadow-sm" />
                        <Gift size={32} className="text-yellow-400 relative z-10" />
                   </div>
                   <div className="absolute -right-4 -top-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">
                      Try Me!
                   </div>
                </div>
                <p className="mt-6 text-center text-xs font-sans text-gray-300 tracking-wider group-hover:text-blue-200 transition-colors z-10">
                  Can you catch the gift?
                </p>
             </div>

             {/* 3. Infinite Unboxing (Brown/Gold) -> InfiniteUnboxing */}
             <div className="flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-amber-600/30 shadow-2xl w-full max-w-xs md:max-w-sm h-[320px] transform transition-all hover:scale-105 duration-500 group cursor-pointer relative overflow-hidden" onClick={handleStartUnboxing}>
                <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors"></div>
                <h2 className="text-xl font-serif text-amber-400 mb-6 tracking-widest uppercase relative z-10">
                  Express Mail
                </h2>
                <div className="relative z-10">
                   <div className="w-24 h-24 flex items-center justify-center relative group-hover:translate-x-2 transition-transform duration-500">
                        <Package size={80} className="text-amber-700 drop-shadow-lg" strokeWidth={1} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-black text-[10px] font-bold px-2 py-0.5 rounded rotate-[-10deg] border border-black/20">
                            FRAGILE
                        </div>
                   </div>
                </div>
                <p className="mt-6 text-center text-xs font-sans text-gray-300 tracking-wider group-hover:text-amber-200 transition-colors z-10">
                  A package for you... open it?
                </p>
             </div>

             {/* 4. Flappy Santa (Purple) -> FlappySanta */}
             <div className="flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-2xl w-full max-w-xs md:max-w-sm h-[320px] transform transition-all hover:scale-105 duration-500 group cursor-pointer relative overflow-hidden" onClick={handleStartFlappy}>
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                <h2 className="text-xl font-serif text-purple-300 mb-6 tracking-widest uppercase relative z-10">
                  Flight Training
                </h2>
                <div className="relative z-10">
                   <div className="relative animate-[float_3s_ease-in-out_infinite]">
                        <Rocket size={70} className="text-purple-400 -rotate-45" />
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                            <div className="w-4 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                            <div className="w-6 h-1 bg-red-500 rounded-full animate-pulse delay-75"></div>
                        </div>
                   </div>
                </div>
                <p className="mt-6 text-center text-xs font-sans text-gray-300 tracking-wider group-hover:text-purple-200 transition-colors z-10">
                  Help Santa fly the sleigh!
                </p>
             </div>

          </div>

          <footer className="mt-20 w-full text-center py-8 text-white/30 text-sm font-sans tracking-wider">
             <p>Made with ❤️ & React</p>
          </footer>
        </main>
      )}

      {view === ViewMode.TREE && (
        <main className="fixed inset-0 z-20">
          <TreeScene />
        </main>
      )}

      {view === ViewMode.GAME && (
          <NaughtyGift onBack={handleBack} />
      )}

      {view === ViewMode.UNBOXING && (
          <InfiniteUnboxing onBack={handleBack} />
      )}

      {view === ViewMode.FLAPPY_SANTA && (
          <FlappySanta onBack={handleBack} />
      )}
    </div>
  );
};

export default App;