import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StaticCube } from '../simulator/StaticCube';
import { Step } from './types';

interface StepCardProps {
  step: Step;
  currentSubStep: number;
  direction: number;
  onSubStep: (direction: number) => void;
}

export const StepCard = ({ step, currentSubStep, direction, onSubStep }: StepCardProps) => {
  const subStepData = step.subSteps[currentSubStep];

  return (
    <div className="relative min-h-[500px] md:min-h-[450px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`${step.id}-${currentSubStep}`}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
            center: { zIndex: 1, x: 0, opacity: 1 },
            exit: (d: number) => ({ zIndex: 0, x: d < 0 ? 50 : -50, opacity: 0 })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 400, damping: 40 },
            opacity: { duration: 0.1 }
          }}
          className="w-full"
        >
          <div className={`bg-white sm:rounded-[32px] p-6 sm:p-8 md:p-12 shadow-xl border-t-8 ${step.border} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 ${step.color} opacity-5 -mr-12 -mt-12 md:-mr-16 md:-mt-16 rounded-full`} />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
                  <span className={`px-3 md:px-4 py-1 rounded-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest ${step.color}`}>
                    Step {step.id}
                  </span>
                  {step.subSteps.length > 1 && (
                    <span className="px-2 md:px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      Part {currentSubStep + 1}/{step.subSteps.length}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 leading-tight">
                  {subStepData.title}
                </h3>
                
                <p className="text-sm md:text-base text-slate-600 font-medium mb-6 md:mb-8 leading-relaxed">
                  {subStepData.content}
                </p>

                {subStepData.formula && (
                  <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-100">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 md:mb-2">Công thức</span>
                    <code className="text-base md:text-lg font-mono font-black text-amber-600 break-words">
                      {subStepData.formula}
                    </code>
                  </div>
                )}

                {/* Sub-step navigation */}
                {step.subSteps.length > 1 && (
                  <div className="flex gap-3 mt-6 md:mt-8">
                    <button
                      onClick={() => onSubStep(-1)}
                      disabled={currentSubStep === 0}
                      className={`p-2 rounded-xl border transition-all ${
                        currentSubStep === 0 ? 'border-slate-100 text-slate-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => onSubStep(1)}
                      disabled={currentSubStep === step.subSteps.length - 1}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                        currentSubStep === step.subSteps.length - 1 
                        ? 'border-slate-100 text-slate-200' 
                        : 'border-slate-800 bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xs md:text-sm font-bold">Tiếp Part {currentSubStep + 2}</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Cube Container: Fixed height issues on mobile */}
              <div className="order-1 md:order-2 bg-[#1f2a44] rounded-[20px] md:rounded-[24px] h-[300px] sm:h-[350px] md:h-[400px] shadow-inner relative overflow-hidden border border-slate-100 group">
                 <StaticCube stepId={step.id} subStep={currentSubStep} />
                 {/* Zoom Hint */}
                 <div className="absolute bottom-3 left-3 text-[9px] md:text-[10px] font-bold text-slate-400 opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/50 px-2 py-1 rounded">
                   Xoay & zoom khối 3D
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
