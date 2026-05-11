"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { StaticCube } from './simulator/StaticCube';

const steps = [
  { 
    id: 1, 
    title: "B1: Dấu cộng trắng", 
    subSteps: [
      { 
        title: "Làm bông hoa cúc", 
        content: "Đưa 4 viên cạnh trắng về quanh tâm vàng ở mặt trên. Không cần quan tâm màu các mặt bên.",
        formula: "Xoay tự do"
      },
      { 
        title: "Tạo dấu cộng đúng", 
        content: "Xoay mặt trên để màu cạnh trùng với tâm mặt bên, sau đó xoay F2 để đưa về mặt trắng.",
        formula: "F2 (cho mỗi cạnh)"
      }
    ],
    color: "bg-slate-400", 
    border: "border-slate-400" 
  },
  { 
    id: 2, 
    title: "B2: Tầng 1", 
    subSteps: [
      {
        title: "Hoàn thiện mặt trắng",
        content: "Đưa các góc trắng về đúng vị trí. Hướng mặt trắng xuống dưới (đối diện mặt vàng).",
        formula: "U R U' R' | R U R' | R U2 R'"
      }
    ],
    color: "bg-blue-600", 
    border: "border-blue-600" 
  },
  { 
    id: 3, 
    title: "B3: Tầng 2", 
    subSteps: [
      {
        title: "Giải tầng giữa",
        content: "Tìm viên cạnh không có màu vàng ở tầng 3 và đưa về đúng vị trí ở tầng 2.",
        formula: "R U R' U' F' U' F (Phải) | L' U' L U F U F' (Trái)"
      }
    ],
    color: "bg-green-600", 
    border: "border-green-600" 
  },
  { 
    id: 4, 
    title: "B4: Dấu cộng vàng", 
    subSteps: [
      {
        title: "Tạo dấu cộng vàng",
        content: "Tạo dấu cộng màu vàng trên mặt trên cùng. Có 3 trường hợp: Chấm, chữ L, đường thẳng.",
        formula: "F R U R' U' F'"
      }
    ],
    color: "bg-yellow-500", 
    border: "border-yellow-500" 
  },
  { 
    id: 5, 
    title: "B5: Mặt vàng", 
    subSteps: [
      {
        title: "Full mặt vàng",
        content: "Sử dụng công thức để lật các góc vàng lên trên cùng.",
        formula: "R U R' U R U2 R'"
      }
    ],
    color: "bg-orange-500", 
    border: "border-orange-500" 
  },
  { 
    id: 6, 
    title: "B6: Hoán vị", 
    subSteps: [
      {
        title: "Về đích",
        content: "Sắp xếp lại các góc và các cạnh cuối cùng để hoàn thành khối Rubik.",
        formula: "R U R' F' R U R' U' R' F R2 U' R'"
      }
    ],
    color: "bg-red-600", 
    border: "border-red-600" 
  },
];

export default function Learn() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    const nextStep = currentStep + newDirection;
    if (nextStep >= 0 && nextStep < steps.length) {
      setDirection(newDirection);
      setCurrentStep(nextStep);
      setCurrentSubStep(0); // Reset sub-step when moving to a new main step
    }
  };

  const handleSubStep = (newDirection: number) => {
    const nextSub = currentSubStep + newDirection;
    if (nextSub >= 0 && nextSub < steps[currentStep].subSteps.length) {
      setCurrentSubStep(nextSub);
    }
  };

  const step = steps[currentStep];
  const subStepData = step.subSteps[currentSubStep];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ... header and progress bar same as before ... */}
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

      {/* Progress Bar */}
      <div className="h-2 bg-slate-200 rounded-full mb-12 overflow-hidden">
        <motion.div 
          className="h-full bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative min-h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${currentStep}-${currentSubStep}`}
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
            <div className={`bg-white rounded-[32px] p-8 md:p-12 shadow-xl border-t-8 ${step.border} relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${step.color} opacity-5 -mr-16 -mt-16 rounded-full`} />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${step.color}`}>
                      Step {step.id}
                    </span>
                    {step.subSteps.length > 1 && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        Part {currentSubStep + 1}/{step.subSteps.length}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
                    {subStepData.title}
                  </h3>
                  
                  <p className="text-base text-slate-600 font-medium mb-8 leading-relaxed">
                    {subStepData.content}
                  </p>

                  {subStepData.formula && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Công thức</span>
                      <code className="text-lg font-mono font-black text-amber-600 break-words">
                        {subStepData.formula}
                      </code>
                    </div>
                  )}

                  {/* Sub-step navigation */}
                  {step.subSteps.length > 1 && (
                    <div className="flex gap-3 mt-8">
                      <button
                        onClick={() => handleSubStep(-1)}
                        disabled={currentSubStep === 0}
                        className={`p-2 rounded-xl border transition-all ${
                          currentSubStep === 0 ? 'border-slate-100 text-slate-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => handleSubStep(1)}
                        disabled={currentSubStep === step.subSteps.length - 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                          currentSubStep === step.subSteps.length - 1 
                          ? 'border-slate-100 text-slate-200' 
                          : 'border-slate-800 bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-sm font-bold">Tiếp Part {currentSubStep + 2}</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-[#1f2a44] rounded-[24px] h-[350px] shadow-inner relative overflow-hidden border border-slate-100 group">
                   <StaticCube stepId={step.id} subStep={currentSubStep} />
                   {/* Zoom Hint */}
                   <div className="absolute bottom-4 left-4 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/50 px-2 py-1 rounded">
                     Sử dụng chuột/cảm ứng để xoay & zoom
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => paginate(-1)}
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
          {steps.map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-8 bg-slate-800' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => paginate(1)}
          disabled={currentStep === steps.length - 1}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${
            currentStep === steps.length - 1 
            ? 'text-slate-300 cursor-not-allowed' 
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg active:scale-95'
          }`}
        >
          {currentStep === steps.length - 1 ? 'Hoàn tất' : 'Tiếp theo'}
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
