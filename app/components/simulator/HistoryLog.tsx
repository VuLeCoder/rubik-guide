import React, { memo } from 'react';

interface HistoryLogProps {
  history: string[];
  onReset: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const HistoryLog = memo(function HistoryLog({ history, onReset, scrollRef }: HistoryLogProps) {
  return (
    <div className="bg-[#1f2a44] rounded-[24px] p-5 border border-slate-200 shadow-sm overflow-hidden">
      <h3 className="text-[14px] font-black text-slate-400 mb-3 uppercase tracking-widest">History Log</h3>
      <div ref={scrollRef} className="h-[180px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-3 gap-1.5">
          {history.map((m, i) => (
            <div key={i} className="h-10 flex items-center justify-center rounded-lg font-mono text-sm font-bold bg-slate-800 border border-slate-600 text-yellow-400 shadow-inner">
              {m}
            </div>
          ))}
          {history.length === 0 && (
            <div className="col-span-3 h-10 flex items-center justify-center text-sm text-slate-500 italic border border-dashed border-slate-700 rounded-lg">
              No moves
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={onReset} 
        className="mt-4 w-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 py-3 rounded-xl text-[14px] font-black uppercase tracking-widest transition-all active:scale-95"
      >
        Reset
      </button>
    </div>
  );
});
