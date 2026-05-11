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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <StepHeader currentStep={currentStep} />
      
      <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

      <StepCard 
        step={step} 
        currentSubStep={currentSubStep} 
        direction={direction} 
        onSubStep={handleSubStep} 
      />

      <StepNavigation 
        currentStep={currentStep} 
        totalSteps={STEPS.length} 
        onPaginate={paginate} 
      />
    </div>
  );
}
