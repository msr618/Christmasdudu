import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { generateRomanticWish } from '../services/geminiService';

const WishGenerator: React.FC = () => {
  const [wish, setWish] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Randomize tone slightly for variety
    const tones = ["deeply romantic", "playful and cute", "poetic and timeless"];
    const selectedTone = tones[Math.floor(Math.random() * tones.length)];
    
    const newWish = await generateRomanticWish(selectedTone);
    setWish(newWish);
    setLoading(false);
  };

  return (
    <div className="mt-12 max-w-2xl w-full mx-auto text-center px-4">
      <div className="bg-gradient-to-b from-christmas-red/80 to-black/60 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
        <h3 className="text-xl md:text-2xl font-serif text-christmas-gold mb-4 flex items-center justify-center gap-2">
          <Wand2 size={24} />
          <span>Christmas Magic Writer</span>
        </h3>
        
        <div className="min-h-[120px] flex items-center justify-center mb-6">
          {loading ? (
            <Loader2 className="animate-spin text-white/50" size={32} />
          ) : wish ? (
             <p className="text-lg md:text-xl font-serif italic leading-relaxed text-white animate-in slide-in-from-bottom-4 fade-in duration-700">
               "{wish}"
             </p>
          ) : (
            <p className="text-white/60 font-sans font-light">
              Click the button below to generate a unique poem written just for you by AI.
            </p>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="group relative inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-800 to-green-900 rounded-full text-white font-serif tracking-wide border border-green-700/50 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,83,45,0.6)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative flex items-center gap-2">
            {loading ? 'Writing Magic...' : 'Create A Wish'}
            {!loading && <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
          </span>
        </button>
      </div>
    </div>
  );
};

export default WishGenerator;