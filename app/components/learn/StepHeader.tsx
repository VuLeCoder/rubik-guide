import { BookOpen } from 'lucide-react';

interface StepHeaderProps {
  currentStep: number;
}

export const StepHeader = ({ currentStep }: StepHeaderProps) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
        <BookOpen className="text-amber-500" size={32} />
        Lộ trình 6 bước
      </h2>
      <p className="text-slate-500 font-medium mt-1">Hướng dẫn giải Rubik cho người mới bắt đầu</p>
    </div>
    <div className="text-right">
      <span className="text-4xl font-black text-slate-200">0{currentStep + 1}</span>
    </div>
  </div>
);
