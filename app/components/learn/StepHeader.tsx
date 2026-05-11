import { BookOpen } from 'lucide-react';

interface StepHeaderProps {
  currentStep: number;
}

export const StepHeader = ({ currentStep }: StepHeaderProps) => (
  <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start mb-4 md:mb-8 gap-4">
    <div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
        <BookOpen className="text-amber-500 w-6 h-6 md:w-8 md:h-8" />
        Lộ trình 6 bước
      </h2>
      <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 md:mt-1">Hướng dẫn cho người mới</p>
    </div>
    <div className="text-right lg:text-left">
      <span className="text-3xl md:text-4xl lg:text-6xl font-black text-slate-200 block lg:mt-2">
        0{currentStep + 1}
      </span>
    </div>
  </div>
);
