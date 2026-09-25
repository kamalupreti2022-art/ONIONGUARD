import React, { useState } from 'react';
import { 
  Globe2, 
  Sliders, 
  Trash2, 
  RotateCcw, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  Layers,
  Sparkles,
  Cpu,
  UploadCloud,
  Check,
  AlertCircle
} from 'lucide-react';
import { Language, ModelEngineType, ViewMode } from '../types';
import { translations } from '../utils/translations';
import { GradingRules, saveStoredRules, resetDemoAssessments } from '../utils/storage';

interface SettingsViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  rules: GradingRules;
  onRulesChange: (rules: GradingRules) => void;
  onResetData: () => void;
  onNavigate: (view: ViewMode) => void;
  modelEngine: ModelEngineType;
  onModelEngineChange: (engine: ModelEngineType) => void;
  customModelConnected: boolean;
  onCustomModelConnectedChange: (connected: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  rules,
  onRulesChange,
  onResetData,
  onNavigate,
  modelEngine,
  onModelEngineChange,
  customModelConnected,
  onCustomModelConnectedChange,
}) => {
  const t = translations[language];

  const [minHealthy, setMinHealthy] = useState(rules.minHealthyGradeA);
  const [maxDamage, setMaxDamage] = useState(rules.maxDamageAllowed);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customModelFileName, setCustomModelFileName] = useState<string | null>(
    customModelConnected ? 'onion_mobilenet_v2.json' : null
  );

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GradingRules = {
      minHealthyGradeA: Number(minHealthy),
      maxDamageAllowed: Number(maxDamage),
    };
    saveStoredRules(updated);
    onRulesChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults: GradingRules = {
      minHealthyGradeA: 70,
      maxDamageAllowed: 10,
    };
    setMinHealthy(70);
    setMaxDamage(10);
    saveStoredRules(defaults);
    onRulesChange(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleModelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomModelFileName(file.name);
      onCustomModelConnectedChange(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#e4e1d3] shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#55665b] mt-1">
          Customize interface language, AI computer vision engines, and grading thresholds.
        </p>
      </div>

      {/* Model Architecture & Connection Section */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#1c5a35]" />
          <h2 className="text-base font-bold text-[#174327] font-heading">
            {t.modelArchitectureTitle}
          </h2>
        </div>
        <p className="text-xs text-[#55665b] leading-relaxed">
          Select the active vision analysis engine. The prototype strictly distinguishes real model analysis from missing weights, and never generates random numbers.
        </p>

        <div className="space-y-3 pt-1">
          {/* Option 1: TensorFlow.js Locally Hosted Model */}
          <div 
            onClick={() => onModelEngineChange('tfjs_local')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              modelEngine === 'tfjs_local'
                ? 'bg-[#e0eee2] border-[#1c5a35] text-[#174327] shadow-xs ring-2 ring-[#1c5a35]/20'
                : 'border-[#cfcbb8] hover:border-[#1c5a35]/40 hover:bg-[#f1f6f0] text-[#1c2a20]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 flex-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm font-heading">TensorFlow.js Neural Network (Local Host)</span>
                  <span className="text-[10px] font-mono font-bold bg-[#1c5a35] text-white px-2 py-0.5 rounded-full">
                    PRIMARY SIH26031 MODEL
                  </span>
                </div>
                <p className="text-xs text-[#55665b]">
                  Loads directly from <code>/models/onion-quality/model.json</code>. Evaluates 5 classes: <strong>healthy, damaged, rotten, sprouted, other</strong> with real confidence percentages.
                </p>
                <div className="text-[11px] font-mono text-[#55665b] bg-[#f8fafc] p-2.5 rounded-xl border border-[#cfcbb8] mt-1">
                  Required: <code>public/models/onion-quality/model.json</code> &amp; <code>*.bin</code>
                </div>
              </div>
              <input
                type="radio"
                checked={modelEngine === 'tfjs_local'}
                onChange={() => onModelEngineChange('tfjs_local')}
                className="mt-1 accent-[#1c5a35] cursor-pointer"
              />
            </div>
          </div>

          {/* Option 2: Direct Computer Vision Engine */}
          <div 
            onClick={() => onModelEngineChange('direct_cv')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              modelEngine === 'direct_cv'
                ? 'bg-[#e0eee2] border-[#1c5a35] text-[#174327] shadow-xs ring-2 ring-[#1c5a35]/20'
                : 'border-[#cfcbb8] hover:border-[#1c5a35]/40 hover:bg-[#f1f6f0] text-[#1c2a20]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-heading">{t.engineDirectCv}</span>
                  <span className="text-[10px] font-mono font-bold bg-[#8a5f12] text-white px-2 py-0.5 rounded-full">
                    STANDALONE CANVAS ENGINE
                  </span>
                </div>
                <p className="text-xs text-[#55665b] mt-1">
                  Processes raw image pixels in real-time. Detects tunic color, apical green neck shoots, necrotic dark rot patches, and checks for reference calibration scale.
                </p>
              </div>
              <input
                type="radio"
                checked={modelEngine === 'direct_cv'}
                onChange={() => onModelEngineChange('direct_cv')}
                className="mt-1 accent-[#1c5a35] cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Language Section */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-[#1c5a35]" />
          <h2 className="text-base font-bold text-[#174327] font-heading">
            {t.languageSetting}
          </h2>
        </div>
        <p className="text-xs text-[#55665b]">
          Switch the system language between English and Hindi (हिन्दी).
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
          <button
            onClick={() => onLanguageChange('en')}
            className={`p-4 rounded-2xl border-2 text-center font-bold text-sm transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#e0eee2] border-[#1c5a35] text-[#174327] shadow-xs ring-2 ring-[#1c5a35]/20'
                : 'border-[#cfcbb8] hover:border-[#1c5a35]/40 hover:bg-[#f1f6f0] text-[#1c2a20]'
            }`}
          >
            <div className="text-lg font-heading mb-0.5">English</div>
            <div className="text-[11px] font-normal text-[#55665b]">Standard English</div>
          </button>

          <button
            onClick={() => onLanguageChange('hi')}
            className={`p-4 rounded-2xl border-2 text-center font-bold text-sm transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-[#e0eee2] border-[#1c5a35] text-[#174327] shadow-xs ring-2 ring-[#1c5a35]/20'
                : 'border-[#cfcbb8] hover:border-[#1c5a35]/40 hover:bg-[#f1f6f0] text-[#1c2a20]'
            }`}
          >
            <div className="text-lg font-heading mb-0.5">हिन्दी</div>
            <div className="text-[11px] font-normal text-[#55665b]">Devanagari Hindi</div>
          </button>
        </div>
      </div>

      {/* Demo Grading Rules Configuration */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#8a5f12]" />
            <h2 className="text-base font-bold text-[#174327] font-heading">
              {t.gradingRulesTitle}
            </h2>
          </div>
          <button
            onClick={handleResetDefaults}
            type="button"
            className="text-xs font-semibold text-[#55665b] hover:text-[#1c2a20] flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDefaults}</span>
          </button>
        </div>

        <p className="text-xs text-[#55665b] leading-relaxed">
          Configure rule-based cutoffs for Grade A allocation and maximum permissible tolerance.
        </p>

        <form onSubmit={handleSaveRules} className="space-y-4 pt-2">
          {savedSuccess && (
            <div className="p-3.5 bg-[#e0eee2] border border-[#bcd6c0] rounded-2xl text-[#1c5a35] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1c5a35] shrink-0" />
              <span>Configuration successfully applied!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] mb-1">
                {t.gradeAMinHealthy} ({minHealthy}%)
              </label>
              <input
                type="range"
                min="50"
                max="90"
                value={minHealthy}
                onChange={(e) => setMinHealthy(Number(e.target.value))}
                className="w-full accent-[#1c5a35] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#55665b] mt-1 font-mono">
                <span>50%</span>
                <span>Default: 70%</span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1c2a20] mb-1">
                {t.maxPermissibleDamage} ({maxDamage}%)
              </label>
              <input
                type="range"
                min="0"
                max="25"
                value={maxDamage}
                onChange={(e) => setMaxDamage(Number(e.target.value))}
                className="w-full accent-[#c28f2c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#55665b] mt-1 font-mono">
                <span>0%</span>
                <span>Default: 10%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#174327] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reset Local Demo Storage */}
      <div className="bg-white rounded-3xl border-2 border-[#e5c1ba] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#a93b2e]">
          <Trash2 className="w-5 h-5 text-[#a93b2e]" />
          <h2 className="text-base font-bold font-heading">
            Demo Storage Management
          </h2>
        </div>
        <p className="text-xs text-[#55665b] leading-relaxed">
          {t.clearDataWarning}. This removes user-uploaded batches and re-populates the initial demo consignment (ONION-DEMO-001).
        </p>

        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all stored demo data in localStorage?")) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-2 bg-[#f6e5e1] hover:bg-[#f0d4cf] text-[#a93b2e] border border-[#e5c1ba] font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#a93b2e]" />
            <span>{t.clearDataButton}</span>
          </button>
        </div>
      </div>

      {/* SIH Problem Statement Reference Card */}
      <div className="bg-[#122e1d] text-[#f4f1e4] rounded-3xl p-6 space-y-3 border-2 border-[#0a1f12] shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-[#f2c14e] uppercase tracking-wider font-heading">
          <ShieldCheck className="w-4 h-4" />
          <span>Smart India Hackathon 2026 Reference</span>
        </div>
        <h3 className="text-base font-bold font-heading text-white">
          Problem Statement ID: SIH26031
        </h3>
        <p className="text-xs text-[#a9bfa9] leading-relaxed">
          "Quality assessment and grading of onions are often subjective and vary across procurement centers, resulting in disputes and inconsistencies."
        </p>
        <div className="text-[11px] text-[#8fa68f] pt-2 border-t border-[#24462f] flex items-center justify-between">
          <span>Developed with React 19 + Tailwind CSS</span>
          <span>100% Client-Side In-Browser Prototype</span>
        </div>
      </div>
    </div>
  );
};
