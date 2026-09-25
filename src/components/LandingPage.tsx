import React from 'react';
import { 
  Camera, 
  Cpu, 
  AlertTriangle, 
  Award, 
  FileCheck2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  TrendingUp,
  Scale
} from 'lucide-react';
import { Language, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  language: Language;
  onLoadDemoBatch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  language,
  onLoadDemoBatch,
}) => {
  const t = translations[language];

  const workflowSteps = [
    {
      step: '01',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: <Camera className="w-5 h-5 text-[#1c5a35]" />,
      badge: 'bg-[#e0eee2] text-[#1c5a35] border border-[#bcd6c0]',
    },
    {
      step: '02',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: <Cpu className="w-5 h-5 text-[#8a5f12]" />,
      badge: 'bg-[#f6ecd4] text-[#4d3504] border border-[#d9bf85]',
    },
    {
      step: '03',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: <AlertTriangle className="w-5 h-5 text-[#a93b2e]" />,
      badge: 'bg-[#f6e5e1] text-[#a93b2e] border border-[#e5c1ba]',
    },
    {
      step: '04',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: <Award className="w-5 h-5 text-[#1c5a35]" />,
      badge: 'bg-[#e0eee2] text-[#1c5a35] border border-[#bcd6c0]',
    },
    {
      step: '05',
      title: t.step5Title,
      desc: t.step5Desc,
      icon: <FileCheck2 className="w-5 h-5 text-[#174327]" />,
      badge: 'bg-[#e0eee2] text-[#174327] border border-[#bcd6c0]',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* SIH Hero Banner with KisanQ Forest Green & Harvest Gold Theme */}
      <section className="bg-gradient-to-r from-[#174327] to-[#1c5a35] text-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-[#0a1f12] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-[#f2c14e]" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#f2c14e] text-[#122e1d] text-xs font-extrabold font-heading px-3 py-1 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#122e1d] animate-pulse" />
            <span>{t.sihBadge} • Prototype</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
            {t.heroHeading}
          </h1>

          <p className="text-[#d1e0d2] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            {t.heroSubheading}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('create-batch')}
              className="inline-flex items-center gap-2 bg-[#f2c14e] hover:bg-[#e0b03d] text-[#122e1d] font-extrabold font-heading px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-sm sm:text-base active:scale-95"
            >
              <span>{t.startAssessment}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={onLoadDemoBatch}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-xl border border-white/20 transition-all cursor-pointer text-sm shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#f2c14e]" />
              <span>{t.viewDemo} (100 Onions)</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-white/10 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>
          </div>

          {/* Disclaimer Banner */}
          <div className="pt-4 mt-6 border-t border-white/15 text-xs text-[#d1e0d2] flex items-start gap-2 max-w-2xl">
            <HelpCircle className="w-4 h-4 shrink-0 text-[#f2c14e] mt-0.5" />
            <span>{t.disclaimerBanner}</span>
          </div>
        </div>
      </section>

      {/* Problem Context Section (SIH Problem Statement Focus) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e4e1d3] shadow-xs">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1c5a35] bg-[#e0eee2] px-2.5 py-1 rounded-md border border-[#bcd6c0]">
              <Scale className="w-3.5 h-3.5" />
              {t.problemStatementTitle}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#174327] font-heading">
              Transforming Subjective Visual Grading into Objective Digital Trust
            </h2>
            <p className="text-sm text-[#55665b] leading-relaxed">
              {t.problemStatementDesc}
            </p>
          </div>

          <div className="md:col-span-4 bg-[#f6ecd4] rounded-2xl p-5 border border-[#d9bf85] space-y-3 text-[#4d3504]">
            <div className="text-xs font-extrabold text-[#4d3504] uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <CheckCircle2 className="w-4 h-4 text-[#8a5f12]" />
              Key Prototype Innovations
            </div>
            <ul className="text-xs text-[#55665b] space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c5a35]" />
                Multi-defect classification (rotten, sprouted, cuts, undersized)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c5a35]" />
                Automatic Grade A vs URS ratio calculations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c5a35]" />
                Tamper-evident printable digital quality certificate
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c5a35]" />
                100% offline-ready in-browser execution
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visual Workflow Steps */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#174327] tracking-tight font-heading">
            {t.workflowHeading}
          </h2>
          <p className="text-xs sm:text-sm text-[#55665b]">
            A 5-step transparent pipeline engineered for Mandis and procurement centers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-5 border border-[#cfcbb8] hover:border-[#1c5a35] shadow-xs hover:shadow-sm transition group relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-[#f1f6f0] text-[#1c5a35]">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8fa68f]">
                    STEP {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-[#1c2a20] text-sm mb-1.5 group-hover:text-[#174327] transition font-heading">
                  {step.title}
                </h3>
                <p className="text-xs text-[#55665b] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-white border border-[#cfcbb8] text-[#55665b] flex items-center justify-center text-xs shadow-2xs">
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Defect Classification Overview with Dark Mandi Theme */}
      <section className="bg-[#122e1d] text-[#f4f1e4] rounded-3xl p-6 sm:p-8 space-y-6 border-2 border-[#0a1f12] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#f2c14e] uppercase tracking-wider mb-1 font-heading">
              Computer Vision Defect Taxonomy
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Five Standardized Inspection Dimensions
            </h3>
          </div>
          <button
            onClick={() => onNavigate('create-batch')}
            className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#237342] text-white px-4 py-2 rounded-xl text-xs font-bold transition self-start cursor-pointer shadow-sm active:scale-95"
          >
            <span>{t.startAssessment}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-[#0f2a19] border border-[#2c5a3e] rounded-2xl p-4">
            <div className="w-3 h-3 rounded-full bg-[#10b981] mb-2" />
            <div className="text-sm font-bold text-[#e0eee2] font-heading">{t.healthy}</div>
            <div className="text-xs text-[#a9bfa9] mt-1">Intact dry skin, firm neck, unblemished surface.</div>
          </div>

          <div className="bg-[#0f2a19] border border-[#2c5a3e] rounded-2xl p-4">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b] mb-2" />
            <div className="text-sm font-bold text-[#f2c14e] font-heading">{t.damaged}</div>
            <div className="text-xs text-[#a9bfa9] mt-1">Mechanical cuts, surface bruising, peeling skin.</div>
          </div>

          <div className="bg-[#0f2a19] border border-[#2c5a3e] rounded-2xl p-4">
            <div className="w-3 h-3 rounded-full bg-[#e05d4b] mb-2" />
            <div className="text-sm font-bold text-[#e05d4b] font-heading">{t.rotten}</div>
            <div className="text-xs text-[#a9bfa9] mt-1">Soft rot, black mold (Aspergillus), basal decay.</div>
          </div>

          <div className="bg-[#0f2a19] border border-[#2c5a3e] rounded-2xl p-4">
            <div className="w-3 h-3 rounded-full bg-[#a855f7] mb-2" />
            <div className="text-sm font-bold text-[#d8b4fe] font-heading">{t.sprouted}</div>
            <div className="text-xs text-[#a9bfa9] mt-1">Emergent green shoots &gt;5mm at neck apex.</div>
          </div>

          <div className="bg-[#0f2a19] border border-[#2c5a3e] rounded-2xl p-4">
            <div className="w-3 h-3 rounded-full bg-[#06b6d4] mb-2" />
            <div className="text-sm font-bold text-[#67e8f9] font-heading">{t.undersized}</div>
            <div className="text-xs text-[#a9bfa9] mt-1">Bulb diameter &lt;40mm below commercial grade.</div>
          </div>
        </div>
      </section>
    </div>
  );
};
