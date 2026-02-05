
import React from 'react';
import { PersonaMode } from '../types';

interface OrbProps {
  isActive: boolean;
  mode: PersonaMode;
  audioLevel: number;
}

const Orb: React.FC<OrbProps> = ({ isActive, mode, audioLevel }) => {
  const getColors = () => {
    switch (mode) {
      case PersonaMode.ACADEMIC:
        return 'from-blue-500 via-indigo-600 to-cyan-400';
      case PersonaMode.EMPATHETIC:
        return 'from-rose-400 via-pink-600 to-amber-300';
      case PersonaMode.CREATIVE:
        return 'from-orange-400 via-rose-500 to-yellow-300';
      case PersonaMode.PROFESSIONAL:
        return 'from-emerald-500 via-teal-600 to-slate-400';
      default:
        return 'from-violet-500 via-fuchsia-600 to-indigo-400';
    }
  };

  const scale = isActive ? 1 + audioLevel * 0.5 : 1;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
      {/* Outer pulse rings */}
      {isActive && (
        <>
          <div className={`absolute inset-0 rounded-full border-2 border-white opacity-20 animate-[pulse-ring_2s_infinite]`} />
          <div className={`absolute inset-0 rounded-full border-2 border-white opacity-10 animate-[pulse-ring_2.5s_infinite_0.5s]`} />
        </>
      )}

      {/* Main Orb */}
      <div 
        className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr ${getColors()} animate-float transition-all duration-300 shadow-2xl`}
        style={{ transform: `scale(${scale})` }}
      >
        {/* Inner light */}
        <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-xl translate-x-4 -translate-y-4" />
        
        {/* Reflection */}
        <div className="absolute top-8 left-8 w-12 h-6 md:w-16 md:h-8 bg-white opacity-30 rounded-full blur-md -rotate-45" />

        {/* Dynamic Glow */}
        <div className={`absolute inset-0 rounded-full orb-glow ${isActive ? 'opacity-80' : 'opacity-40'} transition-opacity duration-1000 bg-gradient-to-tr ${getColors()}`} />
      </div>

      {/* Label Overlay */}
      <div className="absolute -bottom-16 text-center">
        <h2 className="text-white text-xl font-light tracking-widest uppercase opacity-60">
          {isActive ? (mode === PersonaMode.NEUTRAL ? 'Listening...' : mode) : 'Resting'}
        </h2>
      </div>
    </div>
  );
};

export default Orb;
