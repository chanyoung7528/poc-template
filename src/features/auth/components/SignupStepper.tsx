'use client';

import { ReactNode } from 'react';
import styles from './SignupStepper.module.scss';

interface Step {
  label: string;
  key: string;
}

interface SignupStepperProps {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
}

export function SignupStepper({ steps, currentStep, children }: SignupStepperProps) {
  return (
    <div className={styles.signupStepper}>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.key} className={styles.step}>
              <div
                className={`${styles.stepCircle} ${
                  isActive ? styles.active : isCompleted ? styles.completed : ''
                }`}
              >
                {isCompleted ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3,8 6,11 13,4" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  isActive ? styles.active : isCompleted ? styles.completed : ''
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
