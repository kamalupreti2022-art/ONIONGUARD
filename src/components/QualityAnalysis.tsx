import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  FileText, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  RefreshCw,
  Cpu,
  AlertCircle,
  Check,
  XCircle,
  BarChart3,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { AssessmentRecord, BoundingBox, ImageAnalysisItem, Language, OnionDefectType } from '../types';
import { translations } from '../utils/translations';

interface QualityAnalysisProps {
  record: AssessmentRecord;
  onGenerateReport: () => void;
  onReanalyze: () => void;
  language: Language;
}

export const QualityAnalysis: React.FC<QualityAnalysisProps> = ({
  record,
  onGenerateReport,
  onReanalyze,
  language,
}) => {
  const t = translations[language];
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [selectedItem, setSelectedItem] = useState<ImageAnalysisItem | null>(
    record.imageItems && record.imageItems.length > 0 ? record.imageItems[0] : null
  );

  const defectColors: Record<OnionDefectType, { border: string; bg: string; text: string; dot: string; fill: string; badge: string }> = {
    healthy: { border: 'border-[#10b981]', bg: 'bg-[#e0eee2]', text: 'text-[#1c5a35]', dot: 'bg-[#10b981]', fill: '#10b981', badge: 'bg-[#1c5a35] text-white' },
    damaged: { border: 'border-[#f59e0b]', bg: 'bg-[#f6ecd4]', text: 'text-[#8a5f12]', dot: 'bg-[#f59e0b]', fill: '#f59e0b', badge: 'bg-[#8a5f12] text-white' },
    rotten: { border: 'border-[#a93b2e]', bg: 'bg-[#f6e5e1]', text: 'text-[#a93b2e]', dot: 'bg-[#a93b2e]', fill: '#a93b2e', badge: 'bg-[#a93b2e] text-white' },
    sprouted: { border: 'border-[#9333ea]', bg: 'bg-[#f3e8ff]', text: 'text-[#7e22ce]', dot: 'bg-[#9333ea]', fill: '#9333ea', badge: 'bg-[#7e22ce] text-white' },
    other: { border: 'border-[#64748b]', bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', dot: 'bg-[#64748b]', fill: '#64748b', badge: 'bg-[#475569] text-white' },
    undersized: { border: 'border-[#0891b2]', bg: 'bg-[#ecfeff]', text: 'text-[#0e7490]', dot: 'bg-[#0891b2]', fill: '#0891b2', badge: 'bg-[#0891b2] text-white' },
    unable_to_determine: { border: 'border-[#64748b]', bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', dot: 'bg-[#64748b]', fill: '#64748b', badge: 'bg-[#475569] text-white' },
  };

  const boundingBoxes = record.boundingBoxes || [];
  const hasTrayOverlay = boundingBoxes.length > 0;
  const isMultiItem = record.imageItems && record.imageItems.length > 0;

  // 1. CHECK IF MODEL IS MISSING / NOT AVAILABLE
  // Requirement: "If the model is not available, clearly show: "AI model is not available. Please add the trained model files." Do not generate a prediction."
  if (record.modelAvailable === false) {
    return (
      <div className="space-y-6 pb-16 max-w-3xl mx-auto">
        <div className="bg-[#f6e5e1] border-2 border-[#e5c1ba] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#a93b2e] text-white flex items-center justify-center shadow-md">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-[#a93b2e] text-white tracking-widest font-heading">
              MODEL NOT AVAILABLE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#882216] mt-3 font-heading">
              Roboflow analysis could not be completed.
            </h2>
            <p className="text-sm font-semibold text-[#a93b2e] max-w-xl mx-auto mt-2 leading-relaxed">
              {record.modelNotice || 'Check the backend connection and Roboflow configuration, then try again.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onReanalyze}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry / Back to Upload</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Specimen for Deep-Dive view (primary image or selected image)
  const activeSpecimen = selectedItem || (record.imageItems && record.imageItems[0]);

  return (
    <div className="space-y-6 pb-16">
      {/* Real Model Analysis Top Banner */}
      <div className="bg-[#e0eee2] border-2 border-[#bcd6c0] text-[#174327] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl shrink-0 shadow-xs text-white bg-[#1c5a35]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-3 py-1 rounded-full font-heading tracking-wider bg-[#1c5a35] text-white shadow-2xs">
                {record.isDemoData ? 'DEMONSTRATION DATA' : 'REAL MODEL ANALYSIS'}
              </span>
              <span className="text-xs font-mono font-bold bg-white text-[#174327] px-2.5 py-0.5 rounded-lg border border-[#bcd6c0]">
                Roboflow YOLO11n (Server-Side Inference)
              </span>
              <span className="text-[11px] font-bold bg-[#174327] text-[#f2c14e] px-2.5 py-0.5 rounded-md font-heading">
                Batch: {record.batch.batchId}
              </span>
            </div>
            <p className="text-xs text-[#55665b] mt-1.5 font-medium">
              {record.isDemoData
                ? 'Demonstration figures only; no Roboflow inference was run for this record.'
                : 'Object detections and confidence scores are returned by the configured Roboflow model.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={onReanalyze}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-[#f1f6f0] text-[#1c2a20] px-3.5 py-2 rounded-xl border border-[#cfcbb8] transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#55665b]" />
            <span>Re-analyze</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1c5a35] hover:bg-[#174327] text-white px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.generateReportCTA}</span>
          </button>
        </div>
      </div>

      {/* PRIMARY PREDICTION CARD (Detailed Single Specimen Breakdown) */}
      {activeSpecimen && (
        <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#e4e1d3] pb-3">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#1c5a35] font-heading">
                AI Analysis Results
              </div>
              <h3 className="text-xl font-bold text-[#174327] font-heading">
                Specimen #{activeSpecimen.imageIndex} Classification
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-[#f1f6f0] text-[#174327] px-2.5 py-1 rounded-lg border border-[#bcd6c0]">
              Visual AI Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Preview */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-[#0b2013] aspect-square flex items-center justify-center border-2 border-[#cfcbb8]">
              <img
                src={activeSpecimen.imageSrc}
                alt={`Onion specimen ${activeSpecimen.imageIndex}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-[#122e1d]/90 text-white text-xs font-mono px-2.5 py-1 rounded-lg font-bold">
                Image {activeSpecimen.imageIndex}
              </div>
              <div className={`absolute bottom-3 left-3 right-3 text-xs font-bold px-3 py-1.5 rounded-xl text-center shadow-md ${defectColors[activeSpecimen.prediction].badge}`}>
                Prediction: {activeSpecimen.label}
              </div>
            </div>

            {/* AI Prediction Details */}
            <div className="md:col-span-7 space-y-4">
              {/* Predicted Class & Confidence Percentage */}
              <div className="p-4 rounded-2xl bg-[#f7f5ee] border border-[#cfcbb8] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#55665b]">
                      Detected Class
                    </span>
                    <div className="text-2xl font-black text-[#174327] font-heading">
                      {activeSpecimen.label}
                    </div>
                  </div>
                  {activeSpecimen.confidence !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#55665b] block">
                        Roboflow Confidence
                      </span>
                      <span className="text-2xl font-black font-mono text-[#1c5a35]">
                        {activeSpecimen.confidence.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Real Confidence Bar */}
                {activeSpecimen.confidence !== undefined && (
                  <div className="space-y-1">
                    <div className="w-full bg-[#e2e8f0] rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          activeSpecimen.prediction === 'healthy' ? 'bg-[#10b981]' :
                          activeSpecimen.prediction === 'sprouted' ? 'bg-[#9333ea]' :
                          activeSpecimen.prediction === 'rotten' ? 'bg-[#a93b2e]' :
                          activeSpecimen.prediction === 'damaged' ? 'bg-[#f59e0b]' : 'bg-[#64748b]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, activeSpecimen.confidence))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#55665b]">
                      <span>0%</span>
                      <span>Real Confidence Score</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Low Confidence Warning (< 50%) */}
              {activeSpecimen.isLowConfidence && (
                <div className="p-3.5 bg-[#fef3c7] border border-[#f59e0b] rounded-2xl text-[#92400e] text-xs font-semibold flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#d97706]" />
                  <div>
                    <span className="font-bold block">Low Confidence Warning:</span>
                    <span>Low confidence — please capture a clearer image of a single onion.</span>
                  </div>
                </div>
              )}

              {/* Quality Interpretation */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1c2a20] uppercase tracking-wider font-heading block">
                  Quality:
                </span>
                <p className="text-sm font-semibold text-[#174327] bg-[#f1f6f0] p-3 rounded-xl border border-[#bcd6c0]">
                  {activeSpecimen.qualityInterpretation || activeSpecimen.reason}
                </p>
              </div>

              {/* Recommendation */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1c2a20] uppercase tracking-wider font-heading block">
                  Recommendation:
                </span>
                <p className="text-sm text-[#55665b] bg-[#f7f5ee] p-3 rounded-xl border border-[#cfcbb8]">
                  {activeSpecimen.recommendation || 'Inspect produce batch and store in dry, well-ventilated crates.'}
                </p>
              </div>

              {activeSpecimen.rawClassName && (
                <p className="text-xs text-[#55665b]">Raw Roboflow class: <strong>{activeSpecimen.rawClassName}</strong></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MULTI-IMAGE BREAKDOWN THUMBNAIL SELECTOR (If multiple images uploaded) */}
      {isMultiItem && record.imageItems && record.imageItems.length > 1 && (
        <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e4e1d3] pb-3">
            <div>
              <h4 className="font-bold text-[#174327] text-base font-heading flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1c5a35]" />
                <span>Uploaded Batch Images ({record.imageItems.length} Onions)</span>
              </h4>
              <p className="text-xs text-[#55665b]">
                Click any specimen to inspect its individual 5-class distribution:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {record.imageItems.map((item) => {
              const isSelected = activeSpecimen?.id === item.id;
              const colors = defectColors[item.prediction];

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-2 rounded-2xl border-2 transition-all cursor-pointer text-center space-y-1 bg-white ${
                    isSelected
                      ? `${colors.border} ring-2 ring-[#1c5a35]/20 shadow-md`
                      : 'border-[#cfcbb8] hover:border-[#1c5a35]/40 hover:shadow-xs'
                  }`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#0b2013] flex items-center justify-center border border-[#cfcbb8]">
                    <img
                      src={item.imageSrc}
                      alt={`Specimen ${item.imageIndex}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-[#1c2a20] truncate">
                    Image {item.imageIndex}
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded block truncate ${colors.bg} ${colors.text}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGGREGATE SUMMARY & COMMERCIAL ESTIMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Defect Counts breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e4e1d3] pb-3">
            <div>
              <h3 className="font-extrabold text-[#174327] text-base font-heading">
                Batch Class Distribution
              </h3>
              <p className="text-[11px] text-[#55665b]">
                Aggregated strictly from model predictions ({record.totalAnalyzed} analyzed)
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#f1f6f0] text-[#174327] px-2.5 py-1 rounded-lg border border-[#bcd6c0]">
              Total: {record.totalAnalyzed}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#e0eee2] text-[#1c5a35] font-bold">
              <span>Healthy:</span>
              <span className="font-mono">{record.counts.healthy} ({record.percentages.healthy}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#f6ecd4] text-[#8a5f12] font-semibold">
              <span>Damaged:</span>
              <span className="font-mono">{record.counts.damaged} ({record.percentages.damaged}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#f6e5e1] text-[#a93b2e] font-semibold">
              <span>Rotten:</span>
              <span className="font-mono">{record.counts.rotten} ({record.percentages.rotten}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#f3e8ff] text-[#7e22ce] font-semibold">
              <span>Sprouted:</span>
              <span className="font-mono">{record.counts.sprouted} ({record.percentages.sprouted}%)</span>
            </div>
            {record.counts.other !== undefined && record.counts.other > 0 && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f1f5f9] text-[#475569] font-semibold">
                <span>Other / Non-Onion:</span>
                <span className="font-mono">{record.counts.other} ({record.percentages.other || 0}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Grade A and URS Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#e0eee2] border-2 border-[#bcd6c0] p-4.5 rounded-3xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1c5a35] font-heading">
                  Application-derived Grade A indicator
                </span>
                <Award className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-2xl font-black text-[#174327] font-mono">
                {record.gradeA}%
              </div>
              <p className="text-[11px] text-[#55665b]">
                Application-derived estimate; not an official government procurement grade.
              </p>
            </div>

            <div className="bg-[#f6ecd4] border-2 border-[#d9bf85] p-4.5 rounded-3xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8a5f12] font-heading">
                  Application-derived URS indicator
                </span>
                <AlertTriangle className="w-4 h-4 text-[#d97706]" />
              </div>
              <div className="text-2xl font-black text-[#8a5f12] font-mono">
                {record.gradeURS}%
              </div>
              <p className="text-[11px] text-[#55665b]">
                Application-derived estimate; not an official government procurement grade.
              </p>
            </div>
          </div>

          {/* Assessment Summary Box */}
          <div className="bg-[#f7f5ee] border border-[#cfcbb8] rounded-3xl p-5 space-y-2 text-xs">
            <div className="font-extrabold text-[#174327] font-heading flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1c5a35]" />
              <span>Inspection Summary Note:</span>
            </div>
            <p className="text-[#55665b] leading-relaxed">
              {record.qualitySummary}
            </p>
          </div>
        </div>
      </div>

      {/* SIH HONESTY & TRANSPARENCY NOTICE */}
      <div className="bg-[#122e1d] text-[#f4f1e4] rounded-3xl p-6 space-y-3 border-2 border-[#0a1f12] shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-[#f2c14e] uppercase tracking-wider font-heading">
          <ShieldCheck className="w-4 h-4" />
          <span>SIH Prototype Honesty & Transparency Notice</span>
        </div>
        <p className="text-xs text-[#d1e0d2] leading-relaxed">
          "Visual AI classification based on the trained onion image dataset."
        </p>
        <p className="text-[11px] text-[#a9bfa9] leading-relaxed">
          This system performs surface computer-vision image classification. It does not claim to detect internal rot hidden beneath outer skins, chemical/pesticide residue, exact shelf life, or market prices.
        </p>
      </div>
    </div>
  );
};
