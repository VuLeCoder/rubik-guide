import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPaginate: (direction: number) => void;
}

export const StepNavigation = ({ currentStep, totalSteps, onPaginate }: StepNavigationProps) => (
  <div className="flex items-center justify-between mt-10">
    <button
      onClick={() => onPaginate(-1)}
      disabled={currentStep === 0}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
        currentStep === 0 
        ? 'text-slate-300 cursor-not-allowed' 
        : 'text-slate-700 hover:bg-slate-100 active:scale-95'
      }`}
    >
      <ChevronLeft size={24} />
      Trước đó
    </button>

    <div className="flex gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === currentStep ? 'w-8 bg-slate-800' : 'bg-slate-300'
          }`}
        />
      ))}
    </div>

    <button
      onClick={() => onPaginate(1)}
      disabled={currentStep === totalSteps - 1}
      className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${
        currentStep === totalSteps - 1 
        ? 'text-slate-300 cursor-not-allowed' 
        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg active:scale-95'
      }`}
    >
      {currentStep === totalSteps - 1 ? 'Hoàn tất' : 'Tiếp theo'}
      <ChevronRight size={24} />
    </button>
  </div>
);
