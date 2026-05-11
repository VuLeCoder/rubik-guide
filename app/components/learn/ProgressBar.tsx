import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => (
  <div className="h-2 bg-slate-200 rounded-full mb-12 overflow-hidden">
    <motion.div 
      className="h-full bg-amber-400"
      initial={{ width: 0 }}
      animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);
