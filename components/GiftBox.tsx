import React from 'react';
import { Gift } from 'lucide-react';

interface GiftBoxProps {
  onOpen: () => void;
}

const GiftBox: React.FC<GiftBoxProps> = ({ onOpen }) => {
  // Simplified: No internal state for "opened" image phase.
  // Directly triggers the onOpen callback to enter the scene.

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-christmas-gold/30 shadow-2xl max-w-md w-full mx-auto transform transition-all hover:scale-105 duration-500">
      <h2 className="text-2xl font-serif text-christmas-gold mb-6 tracking-widest uppercase">
        Click to Enter
      </h2>
      
      <div 
        onClick={onOpen}
        className="cursor-pointer relative group perspective-1000"
      >
        <div className="relative animate-float">
          <Gift 
            size={120} 
            className="text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-colors duration-300 group-hover:text-red-400" 
          />
          <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
              <span className="text-4xl">✨</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl group-hover:bg-red-500/30 transition-colors" />
        </div>
        <p className="mt-8 text-center text-sm font-sans text-gray-300 tracking-wider group-hover:text-white transition-colors">
          Open your Christmas World
        </p>
      </div>
    </div>
  );
};

export default GiftBox;