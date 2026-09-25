import React from 'react';
import { 
  PlusCircle, 
  Layers, 
  FileText, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  TrendingUp, 
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { AssessmentRecord, Language, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface DashboardProps {
  assessments: AssessmentRecord[];
  onNavigate: (view: ViewMode) => void;
  onSelectAssessment: (record: AssessmentRecord) => void;
  onDeleteAssessment: (reportId: string) => void;
  language: Language;
  onLoadDemoBatch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  assessments,
  onNavigate,
  onSelectAssessment,
  onDeleteAssessment,
  language,
  onLoadDemoBatch,
}) => {
  const t = translations[language];

  // Calculate high level stats from stored assessments
  const totalBatches = assessments.length;
  const reportsGenerated = assessments.filter(a => a.status === 'Completed').length;
  const avgGradeA = totalBatches > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.gradeA, 0) / totalBatches)
    : 70;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Actions Bar with KisanQ Mandi Officer Styling */}
      <div className="bg-[#122e1d] text-[#f4f1e4] p-6 sm:p-7 rounded-3xl border-2 border-[#0a1f12] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              {t.dashboard}
            </h1>
            <span className="text-[11px] font-extrabold bg-[#f2c14e] text-[#122e1d] px-2.5 py-0.5 rounded-full font-heading uppercase">
              {t.demoMode}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a9bfa9]">
            Smart India Hackathon 2026 • SIH26031 Automated Quality Control Center
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onLoadDemoBatch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#d9bf85] bg-[#f6ecd4] text-[#4d3504] hover:bg-[#f0e2c2] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Load standard demo batch ONION-DEMO-001"
          >
            <Sparkles className="w-4 h-4 text-[#8a5f12]" />
            <span>{t.loadDemoBatchCTA}</span>
          </button>

          <button
            onClick={() => onNavigate('create-batch')}
            className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#237342] text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newBatchCTA}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Batches */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#55665b] uppercase tracking-wider">
              {t.totalBatches}
            </p>
            <h3 className="text-3xl font-extrabold text-[#174327] font-heading mt-1">
              {totalBatches}
            </h3>
            <p className="text-[11px] text-[#55665b] mt-0.5">
              Logged in local browser state
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f1f6f0] text-[#1c5a35] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Reports Generated */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#55665b] uppercase tracking-wider">
              {t.reportsGenerated}
            </p>
            <h3 className="text-3xl font-extrabold text-[#174327] font-heading mt-1">
              {reportsGenerated}
            </h3>
            <p className="text-[11px] text-[#1c5a35] font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Digital verification ready
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#e0eee2] text-[#1c5a35] flex items-center justify-center border border-[#bcd6c0]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Average Quality */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#55665b] uppercase tracking-wider">
              {t.avgQuality}
            </p>
            <h3 className="text-3xl font-extrabold text-[#174327] font-heading mt-1">
              {avgGradeA}%
            </h3>
            <p className="text-[11px] text-[#55665b] mt-0.5">
              Across assessed consignments
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f6ecd4] text-[#8a5f12] flex items-center justify-center border border-[#d9bf85]">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Assessments Section */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e4e1d3] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#174327] font-heading">
              {t.recentAssessments}
            </h2>
            <p className="text-xs text-[#55665b]">
              Review and inspect batch quality certificates
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-[#1c5a35] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.history}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assessments.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#f1f6f0] text-[#55665b] flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-[#55665b] max-w-sm mx-auto">
              {t.noAssessmentsYet}
            </p>
            <button
              onClick={() => onNavigate('create-batch')}
              className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.newBatchCTA}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f6f0]">
            {assessments.slice(0, 5).map((record) => (
              <div 
                key={record.reportId}
                className="p-4 sm:p-5 hover:bg-[#f1f6f0]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-[#f1f6f0] text-[#174327] px-2 py-0.5 rounded border border-[#cfcbb8]">
                      {record.batch.batchId}
                    </span>
                    <span className="text-xs font-bold text-[#1c2a20] font-heading">
                      {record.batch.onionVariety}
                    </span>
                    {record.isDemoData && (
                      <span className="text-[10px] font-bold bg-[#f6ecd4] text-[#8a5f12] border border-[#d9bf85] px-1.5 py-0.2 rounded font-heading">
                        Demo Data
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#55665b] flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1c5a35]" />
                      {record.batch.procurementCentre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#55665b]" />
                      {record.batch.date}
                    </span>
                    <span>
                      Qty: {record.batch.approxQuantity}
                    </span>
                  </div>
                </div>

                {/* Grade and Action */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#1c2a20]">
                      {t.gradeA}: <span className="text-[#1c5a35] font-extrabold">{record.gradeA}%</span>
                    </div>
                    <div className="text-[11px] text-[#55665b] font-medium">
                      {t.gradeURS}: <span className="text-[#a93b2e] font-bold">{record.gradeURS}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectAssessment(record)}
                      className="px-3 py-1.5 text-[#1c5a35] hover:bg-[#e0eee2] rounded-xl text-xs font-bold flex items-center gap-1 border border-[#bcd6c0] transition cursor-pointer"
                      title="View Digital Quality Report"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.viewReport}</span>
                    </button>
                    <button
                      onClick={() => onDeleteAssessment(record.reportId)}
                      className="p-1.5 text-[#55665b] hover:text-[#a93b2e] hover:bg-[#f6e5e1] rounded-xl transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful Procurement Center Guide */}
      <div className="bg-[#f6ecd4] border border-[#d9bf85] rounded-3xl p-5 text-[#4d3504] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#8a5f12] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8a5f12] font-heading">
              Procurement Center Note (SIH Prototype)
            </h4>
            <p className="text-xs text-[#55665b] mt-0.5 max-w-2xl leading-relaxed">
              In real deployment, high-resolution cameras installed above sorting conveyor belts feed images into the computer vision pipeline. In this demo, sample trays and custom image uploads simulate that inspection process.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('procurement-centre')}
          className="shrink-0 text-xs font-bold bg-[#1c5a35] hover:bg-[#174327] text-white px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
        >
          {t.procurementCentre} →
        </button>
      </div>
    </div>
  );
};
