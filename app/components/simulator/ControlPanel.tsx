import React, { memo } from 'react';

interface ControlPanelProps {
  onMove: (move: string) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const ControlPanel = memo(function ControlPanel({
  onMove,
  onReset,
  disabled = false
}: ControlPanelProps) {
  const faceMoves = ["U", "U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"];
  const sliceMoves = ["M", "M'", "E", "E'", "S", "S'"];

  const buttonClass = `
    h-12
    rounded-xl
    font-mono
    text-base
    font-bold
    border
    shadow-md
    transition-all
    active:scale-95
  `;

  return (
    <div className="col-span-12 lg:col-span-4 bg-[#1f2a44] rounded-[32px] p-6 border border-slate-200 shadow-sm">
      <div className="mb-6">
        <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
          Face Moves
        </p>

        <div className="grid grid-cols-4 gap-1.5">
          {faceMoves.map(m => (
            <button
              key={m}
              disabled={disabled}
              onClick={() => onMove(m)}
              className={`
                ${buttonClass}
                ${
                  disabled
                    ? 'bg-slate-700 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-slate-800 hover:bg-indigo-500 text-white border-slate-600'
                }
              `}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
          Slices
        </p>

        <div className="grid grid-cols-3 gap-1.5">
          {sliceMoves.map(m => (
            <button
              key={m}
              disabled={disabled}
              onClick={() => onMove(m)}
              className={`
                ${buttonClass}
                ${
                  disabled
                    ? 'bg-slate-700 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-slate-800 hover:bg-indigo-500 text-white border-slate-600'
                }
              `}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="lg:hidden mt-6 w-full bg-slate-800 text-red-500 py-3 rounded-xl text-[14px] font-black uppercase tracking-widest border border-slate-200"
      >
        Reset Cube
      </button>
    </div>
  );
});
