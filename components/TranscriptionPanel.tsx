
import React from 'react';
import { MessageTurn } from '../types';

interface TranscriptionPanelProps {
  turns: MessageTurn[];
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ turns }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  return (
    <div className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col p-6 z-20">
      <h3 className="text-slate-400 font-medium mb-6 uppercase tracking-tighter text-sm">Conversation Feed</h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
        {turns.length === 0 && (
          <p className="text-slate-500 text-sm italic">Say something to begin...</p>
        )}
        {turns.map((turn, idx) => (
          <div key={idx} className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-500 uppercase mb-1">{turn.role}</span>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              turn.role === 'user' 
                ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30' 
                : 'bg-white/5 text-slate-200 border border-white/10'
            }`}>
              {turn.text}
            </div>
            {turn.mode && (
              <span className="text-[9px] text-slate-400 mt-1">Mode: {turn.mode}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptionPanel;
