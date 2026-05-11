import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPaginate: (direction: number) => void;
}

export const StepNavigation = ({ currentStep, totalSteps, onPaginate }: StepNavigationProps) => (
  <div className="flex items-center justify-between mt-6 md:mt-10 gap-2">
    <button
      onClick={() => onPaginate(-1)}
      disabled={currentStep === 0}
      className={`flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base ${
        currentStep === 0 
        ? 'text-slate-300 cursor-not-allowed' 
        : 'text-slate-700 hover:bg-slate-100 active:scale-95'
      }`}
    >
      <ChevronLeft size={20} className="md:w-6 md:h-6" />
      <span>Trước</span>
    </button>

    <div className="hidden sm:flex gap-1.5 md:gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i}
          className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
            i === currentStep ? 'w-6 md:w-8 bg-slate-800' : 'w-1.5 md:w-2 bg-slate-300'
          }`}
        />
      ))}
    </div>

    {/* Mobile step indicator */}
    <div className="sm:hidden text-xs font-black text-slate-400">
      {currentStep + 1} / {totalSteps}
    </div>

    <button
      onClick={() => onPaginate(1)}
      disabled={currentStep === totalSteps - 1}
      className={`flex items-center gap-1 md:gap-2 px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base ${
        currentStep === totalSteps - 1 
        ? 'text-slate-300 cursor-not-allowed' 
        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg active:scale-95'
      }`}
    >
      <span>{currentStep === totalSteps - 1 ? 'Hoàn tất' : 'Tiếp'}</span>
      <ChevronRight size={20} className="md:w-6 md:h-6" />
    </button>
  </div>
);
