import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Sparkles, Scan } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface AnalysisLoadingProps {
  onComplete: () => void;
  language: Language;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  onComplete,
  language,
}) => {
  const t = translations[language];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const steps = [
    "Loading AI model (/models/onion-quality/model.json)...",
    "AI model loaded & input shape verified",
    "Pre-processing input tensor (normalized image / 255.0)...",
    "Running model.predict() & extracting 5-class probabilities...",
  ];


  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgress(40);
    }, 600);

    const timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgress(68);
    }, 1300);

    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setProgress(92);
    }, 2000);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setTimeout(onComplete, 400);
    }, 2700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      <div className="bg-[#122e1d] text-[#f4f1e4] rounded-3xl border-2 border-[#0a1f12] shadow-2xl p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
        {/* Subtle background radar/scanner line */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c5a35]/10 via-transparent to-[#1c5a35]/10 pointer-events-none" />

        {/* Central Animated Scanner Graphic */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#1c5a35] animate-ping opacity-30" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#174327] to-[#1c5a35] border border-[#2c5a3e] flex items-center justify-center text-[#f2c14e] shadow-xl z-10">
            <Scan className="w-10 h-10 animate-pulse stroke-[2.2]" />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-extrabold bg-[#f2c14e] text-[#122e1d] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
            SIH Demo Pipeline Active
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 font-heading">
            {t.analyzingTitle}
          </h2>
          <p className="text-xs text-[#a9bfa9] mt-1">
            Running simulated convolutional feature extraction & defect classification
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#0b2013] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#24462f]">
            <div 
              className="bg-gradient-to-r from-[#1c5a35] to-[#f2c14e] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#a9bfa9]">
            <span>Scanning lot</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Step by step checklist */}
        <div className="space-y-2.5 text-left bg-[#0b2013] rounded-2xl p-4 border border-[#24462f]">
          {steps.map((text, idx) => {
            const isDone = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-opacity duration-200 ${
                  isDone
                    ? 'text-[#e0eee2] font-semibold'
                    : isCurrent
                    ? 'text-[#f2c14e] font-bold'
                    : 'text-[#55665b] opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#f2c14e] border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#2c5a3e] shrink-0" />
                )}
                <span>{text}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-[#8fa68f] italic">
          Runs 100% locally in browser without external API latency.
        </p>
      </div>
    </div>
  );
};
