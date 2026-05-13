"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectFade } from 'swiper/modules';
import { STEPS } from './constants';
import { ProgressBar } from './ProgressBar';
import { StaticCube } from '../simulator/StaticCube';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Learn() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [activeSubStepIdx, setActiveSubStepIdx] = useState(0);
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainSwiperRef = useRef<any>(null);
  const subSwiperRefs = useRef<any[]>([]);
  const caseSwiperRef = useRef<any>(null);

  const activeStep = STEPS[activeStepIdx];
  const activeSubStep = activeStep.subSteps[activeSubStepIdx];

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setIsPaused(true);
  };

  // Responsive FOV adjustment
  const [fov, setFov] = useState(80);
  useEffect(() => {
    const handleResize = () => {
      setFov(window.innerWidth < 768 ? 80 : 65);
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasAnimation = (activeStep.id === 1 && activeSubStepIdx === 1) || (activeStep.id === 2 && activeSubStep.cases);

  const handleNext = () => {
    const currentSubSwiper = subSwiperRefs.current[activeStepIdx];
    if (currentSubSwiper && activeSubStepIdx < activeStep.subSteps.length - 1) {
      currentSubSwiper.slideNext();
    } else if (activeStepIdx < STEPS.length - 1) {
      mainSwiperRef.current?.slideNext();
    }
  };

  const handlePrev = () => {
    const currentSubSwiper = subSwiperRefs.current[activeStepIdx];
    if (currentSubSwiper && activeSubStepIdx > 0) {
      currentSubSwiper.slidePrev();
    } else if (activeStepIdx > 0) {
      mainSwiperRef.current?.slidePrev();
    }
  };

  return (
    <div ref={containerRef} className="min-h-[calc(100vh-64px)] flex flex-col relative overflow-hidden bg-[#FFFBF0]">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Top Navigation Bar */}
      <div className="z-30 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-4 mb-2">
              <span className={`px-3 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider ${activeStep.color}`}>
                Bước {activeStep.id}
              </span>
              <div className="flex-1">
                <ProgressBar currentStep={activeStepIdx} totalSteps={STEPS.length} />
              </div>
            </div>
            <h1 className="text-sm md:text-base font-bold text-slate-800 line-clamp-1">
              {activeStep.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 ml-6">
            <button 
              onClick={handlePrev}
              disabled={activeStepIdx === 0 && activeSubStepIdx === 0}
              className={`p-2.5 rounded-xl transition-all ${
                (activeStepIdx === 0 && activeSubStepIdx === 0) ? 'bg-slate-100 text-slate-300' : 'bg-white text-slate-700 shadow-md hover:bg-slate-50 active:scale-95'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black min-w-[70px] text-center shadow-lg">
              {activeStepIdx + 1} / {STEPS.length}
            </div>
            <button 
              onClick={handleNext}
              disabled={activeStepIdx === STEPS.length - 1 && activeSubStepIdx === activeStep.subSteps.length - 1}
              className={`p-2.5 rounded-xl transition-all ${
                (activeStepIdx === STEPS.length - 1 && activeSubStepIdx === activeStep.subSteps.length - 1) ? 'bg-slate-100 text-slate-300' : 'bg-amber-400 text-slate-900 shadow-md hover:bg-amber-300 active:scale-95'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 p-4 md:p-8 lg:p-12 relative z-10 items-start">
        
        {/* Content Slider */}
        <div className="lg:col-span-7 flex flex-col order-1">
          <Swiper
            modules={[EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoHeight={true}
            onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
            onSlideChange={(swiper) => {
              setActiveStepIdx(swiper.activeIndex);
              setActiveSubStepIdx(0);
              setIsPaused(true);
              // Reset nested swiper to first slide when step changes
              subSwiperRefs.current[swiper.activeIndex]?.slideTo(0);
            }}
            className="w-full"
          >
            {STEPS.map((step, stepIdx) => (
              <SwiperSlide key={stepIdx}>
                <Swiper
                  modules={[Pagination]}
                  pagination={{ clickable: true }}
                  nested={true}
                  autoHeight={true}
                  onSwiper={(swiper) => (subSwiperRefs.current[stepIdx] = swiper)}
                  onSlideChange={(swiper) => {
                    setActiveSubStepIdx(swiper.activeIndex);
                    setActiveCaseIdx(0);
                    setIsPaused(true);
                    // Update main swiper height when nested slide changes
                    mainSwiperRef.current?.updateAutoHeight(300);
                  }}
                  className="w-full pb-10"
                >
                  {step.subSteps.map((sub, subIdx) => (
                    <SwiperSlide key={subIdx}>
                      <div className="flex flex-col">
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                               Phần {subIdx + 1} / {step.subSteps.length}
                             </span>
                             <div className="h-px flex-1 bg-slate-200" />
                          </div>
                          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-4">
                            {sub.title}
                          </h2>
                          <p className="text-base md:text-xl text-slate-600 font-medium leading-relaxed mb-6">
                            {sub.content}
                          </p>

                          {sub.cases && (
                            <div className="mt-8">
                                <Swiper
                                  modules={[Pagination]}
                                  pagination={{ clickable: true }}
                                  onSwiper={(swiper) => (caseSwiperRef.current = swiper)}
                                  onSlideChange={(swiper) => {
                                    setActiveCaseIdx(swiper.activeIndex);
                                    setResetKey(prev => prev + 1);
                                    setIsPaused(true);
                                  }}
                                  className="w-full pb-10"
                                >
                                  {sub.cases.map((c, cIdx) => (
                                    <SwiperSlide key={cIdx}>
                                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-xl font-black text-slate-800 mb-3">{c.title}</h3>
                                            <p className="text-slate-600 mb-6">{c.content}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {c.formula.split(' ').map((move, mIdx) => (
                                                    <code key={mIdx} className="px-3 py-2 bg-slate-900 text-amber-400 rounded-lg font-mono font-black">
                                                        {move}
                                                    </code>
                                                ))}
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                  ))}
                                </Swiper>
                            </div>
                          )}

                          {sub.formula && (
                            <div className="mb-6">
                              <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden group/formula">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full -mr-16 -mt-16 transition-transform group-hover/formula:scale-150 duration-700" />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] block mb-4">Công thức tối ưu</span>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                  {sub.formula.split(' ').map((move, mIdx) => (
                                    <div key={mIdx} className="flex flex-col items-center gap-1">
                                      <code className="min-w-[40px] md:min-w-[48px] h-10 md:h-12 flex items-center justify-center bg-slate-900 text-amber-400 rounded-lg md:rounded-xl text-lg md:text-xl font-mono font-black shadow-lg">
                                        {move}
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* 3D Canvas area */}
        <div className="lg:col-span-5 relative group perspective-1000 h-[400px] lg:h-[500px] mb-8 lg:mb-0 order-2">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[32px] md:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10">
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <StaticCube 
              stepId={activeStep.id} 
              subStep={activeSubStepIdx} 
              caseId={activeStep.id === 2 ? activeCaseIdx + 1 : undefined}
              isPaused={isPaused} 
              resetKey={resetKey} 
            />

            {/* Float Controls */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 transition-opacity">
                <MousePointer2 size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Tương tác 3D</span>
              </div>

              {hasAnimation && (
                <div className="flex gap-3 pointer-events-auto">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="w-12 h-12 flex items-center justify-center bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all group/btn"
                  >
                    {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Shared Canvas */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <Canvas
          eventSource={containerRef as React.RefObject<HTMLElement>}
          className="w-full h-full"
          camera={{ position: [4, 4, 4], fov }}
          gl={{ 
            antialias: true, 
            powerPreference: 'high-performance',
            alpha: true
          }}
          dpr={[1, 2]}
        >
          <View.Port />
          <Preload all />
        </Canvas>
      </div>
    </div>
  );
}
