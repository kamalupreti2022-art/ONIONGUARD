import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Calendar, 
  Tag, 
  Scale, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  FileCheck,
  ChevronLeft
} from 'lucide-react';
import { BatchData, Language, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface CreateBatchProps {
  initialBatch?: BatchData;
  onSubmit: (batch: BatchData) => void;
  onCancel: () => void;
  language: Language;
}

const SAMPLE_CENTRES = [
  "Demo Procurement Centre 01 (Nashik APMC, Maharashtra)",
  "Demo Procurement Centre 02 (Lasalgaon Mandi, Maharashtra)",
  "Demo Procurement Centre 03 (Solapur Market Yard, Maharashtra)",
  "Demo Procurement Centre 04 (Kurnool Mandi, Andhra Pradesh)",
  "Demo Procurement Centre 05 (Alwar Mandi, Rajasthan)",
];

const SAMPLE_VARIETIES = [
  "Demo Onion Batch (Nashik Red)",
  "Garwa (Late Kharif Onion)",
  "Bhima Kiran (Rabi Onion)",
  "Agrifound Dark Red",
  "Pusa Red",
  "Local Mandi Mixed Grade",
];

export const CreateBatch: React.FC<CreateBatchProps> = ({
  initialBatch,
  onSubmit,
  onCancel,
  language,
}) => {
  const t = translations[language];

  const today = new Date().toISOString().split('T')[0];

  const [batchId, setBatchId] = useState(initialBatch?.batchId || `ONION-B-${Math.floor(1000 + Math.random() * 9000)}`);
  const [procurementCentre, setProcurementCentre] = useState(initialBatch?.procurementCentre || SAMPLE_CENTRES[0]);
  const [inspectorName, setInspectorName] = useState(initialBatch?.inspectorName || 'R. K. Sharma (Demo Inspector)');
  const [date, setDate] = useState(initialBatch?.date || today);
  const [onionVariety, setOnionVariety] = useState(initialBatch?.onionVariety || SAMPLE_VARIETIES[0]);
  const [approxQuantity, setApproxQuantity] = useState(initialBatch?.approxQuantity || '50 Quintals (500 Bags)');
  const [notes, setNotes] = useState(initialBatch?.notes || 'Farmer Lot from Niphad Taluka. Uniform crate spread for camera inspection.');
  const [error, setError] = useState<string | null>(null);

  const handleFillDemoData = () => {
    setBatchId('ONION-DEMO-001');
    setProcurementCentre(SAMPLE_CENTRES[0]);
    setInspectorName('R. K. Sharma (Demo Inspector)');
    setDate(today);
    setOnionVariety('Demo Onion Batch (Nashik Red)');
    setApproxQuantity('50 Quintals (500 Bags)');
    setNotes('Standard sample consignment for SIH 2026 quality assessment demo.');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim() || !procurementCentre.trim()) {
      setError(t.errorEmptyBatch);
      return;
    }
    setError(null);
    onSubmit({
      batchId: batchId.trim(),
      procurementCentre,
      inspectorName: inspectorName.trim() || 'Demo Inspector',
      date,
      onionVariety,
      approxQuantity: approxQuantity.trim() || '50 Quintals',
      notes,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c2a20] bg-white px-3.5 py-2 rounded-xl border border-[#cfcbb8] hover:bg-[#f1f6f0] transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.dashboard}</span>
        </button>

        <button
          onClick={handleFillDemoData}
          type="button"
          className="inline-flex items-center gap-1.5 bg-[#f6ecd4] hover:bg-[#f0e2c2] text-[#4d3504] border border-[#d9bf85] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8a5f12]" />
          <span>{t.autoFillDemo}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#1c5a35]/25 shadow-xl overflow-hidden">
        {/* Step indicator banner */}
        <div className="bg-[#122e1d] text-[#f4f1e4] px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24462f]">
          <div>
            <div className="text-[11px] font-extrabold text-[#f2c14e] uppercase tracking-wider font-heading">
              Step 1 of 3 — Consignment Setup
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5 font-heading text-white">{t.createBatchTitle}</h2>
          </div>
          <span className="text-[11px] bg-[#1c5a35] text-[#d1e0d2] px-2.5 py-1 rounded-md border border-[#2c5a3e] self-start sm:self-auto font-mono">
            SIH26031 Prototype
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-[#f6e5e1] border border-[#e5c1ba] rounded-2xl text-[#a93b2e] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Batch ID */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.batchId} <span className="text-[#a93b2e]">*</span>
              </label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#cfcbb8] rounded-xl text-sm font-mono font-bold text-[#1c2a20] focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
                placeholder="e.g. ONION-DEMO-001"
                required
              />
              <p className="text-[11px] text-[#55665b] mt-1">Unique consignment or gate-pass identifier</p>
            </div>

            {/* Procurement Centre */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.procurementCentreLabel} (Demo Data) <span className="text-[#a93b2e]">*</span>
              </label>
              <select
                value={procurementCentre}
                onChange={(e) => setProcurementCentre(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#cfcbb8] rounded-xl text-xs sm:text-sm text-[#1c2a20] font-medium focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
              >
                {SAMPLE_CENTRES.map((centre) => (
                  <option key={centre} value={centre}>
                    {centre}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#55665b] mt-1">Clearly labelled sample procurement centres</p>
            </div>

            {/* Inspector Name */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.inspectorName}
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#cfcbb8] rounded-xl text-sm text-[#1c2a20] font-medium focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
                placeholder="Inspector full name"
              />
              <p className="text-[11px] text-[#55665b] mt-1">Authorized grading officer</p>
            </div>

            {/* Inspection Date */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.inspectionDate}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#cfcbb8] rounded-xl text-sm text-[#1c2a20] font-medium focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
              />
              <p className="text-[11px] text-[#55665b] mt-1">Consignment intake timestamp</p>
            </div>

            {/* Onion Variety */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.onionVariety}
              </label>
              <select
                value={onionVariety}
                onChange={(e) => setOnionVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#cfcbb8] rounded-xl text-xs sm:text-sm text-[#1c2a20] font-medium focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
              >
                {SAMPLE_VARIETIES.map((variety) => (
                  <option key={variety} value={variety}>
                    {variety}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#55665b] mt-1">Cultivar classification</p>
            </div>

            {/* Approximate Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.approxQuantity}
              </label>
              <input
                type="text"
                value={approxQuantity}
                onChange={(e) => setApproxQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#cfcbb8] rounded-xl text-sm text-[#1c2a20] font-medium focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
                placeholder={t.quantityHint}
              />
              <p className="text-[11px] text-[#55665b] mt-1">Total consignment load</p>
            </div>
          </div>

          {/* Notes / Special remarks */}
          <div>
            <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
              Consignment Notes & Intake Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-white border-2 border-[#cfcbb8] rounded-xl text-xs sm:text-sm text-[#1c2a20] focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
              placeholder="Any visible damage, storage conditions, or farmer remarks..."
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#e4e1d3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#55665b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1c5a35]" />
              <span>Next step: Capture or upload sample onion photos</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-95 text-sm"
            >
              <span>{t.proceedToImage}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
