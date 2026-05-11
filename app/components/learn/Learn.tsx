"use client";
import React, { useState } from 'react';
import { STEPS } from './constants';
import { StepHeader } from './StepHeader';
import { ProgressBar } from './ProgressBar';
import { StepCard } from './StepCard';
import { StepNavigation } from './StepNavigation';

export default function Learn() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    const nextStep = currentStep + newDirection;
    if (nextStep >= 0 && nextStep < STEPS.length) {
      setDirection(newDirection);
      setCurrentStep(nextStep);
      setCurrentSubStep(0);
    }
  };

  const handleSubStep = (newDirection: number) => {
    const nextSub = currentSubStep + newDirection;
    if (nextSub >= 0 && nextSub < STEPS[currentStep].subSteps.length) {
      setCurrentSubStep(nextSub);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-6 py-4 md:py-8">
      {/* Header & Progress (Stay at top) */}
      <div className="px-4 sm:px-0 mb-6 md:mb-10">
        <StepHeader currentStep={currentStep} />
        <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
      </div>

      {/* Slide/Content */}
      <div className="space-y-6">
        <StepCard 
          step={step} 
          currentSubStep={currentSubStep} 
          direction={direction} 
          onSubStep={handleSubStep} 
        />

        <div className="px-4 sm:px-0">
          <StepNavigation 
            currentStep={currentStep} 
            totalSteps={STEPS.length} 
            onPaginate={paginate} 
          />
        </div>
      </div>
    </div>
  );
}
