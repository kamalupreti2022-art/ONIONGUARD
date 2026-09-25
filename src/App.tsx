/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewMode, Language, BatchData, AssessmentRecord, ModelEngineType } from './types';
import { 
  getStoredAssessments, 
  saveAssessment, 
  deleteAssessment, 
  resetDemoAssessments, 
  getStoredLanguage, 
  saveStoredLanguage, 
  getStoredRules, 
  GradingRules,
  getStoredModelEngine,
  saveStoredModelEngine,
  getStoredCustomModelConnected,
  saveStoredCustomModelConnected
} from './utils/storage';
import { calculatePercentages, calculateGrades, generateSampleTraySvg } from './utils/sampleData';
import { analyzeImagesWithRoboflow } from './utils/roboflowService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CreateBatch } from './components/CreateBatch';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisLoading } from './components/AnalysisLoading';
import { QualityAnalysis } from './components/QualityAnalysis';
import { DigitalReport } from './components/DigitalReport';
import { HistoryPage } from './components/HistoryPage';
import { ProcurementCentreDashboard } from './components/ProcurementCentreDashboard';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [rules, setRules] = useState<GradingRules>(getStoredRules());
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [modelEngine, setModelEngine] = useState<ModelEngineType>(getStoredModelEngine());
  const [customModelConnected, setCustomModelConnected] = useState<boolean>(getStoredCustomModelConnected());

  // Active batch creation workflow state
  const [activeBatch, setActiveBatch] = useState<BatchData>({
    batchId: 'ONION-DEMO-001',
    procurementCentre: 'Demo Procurement Centre 01 (Nashik APMC, Maharashtra)',
    inspectorName: 'R. K. Sharma (Demo Inspector)',
    date: new Date().toISOString().split('T')[0],
    onionVariety: 'Demo Onion Batch (Nashik Red)',
    approxQuantity: '50 Quintals (500 Bags)',
    notes: 'Standard sample consignment for SIH 2026 quality assessment demo.'
  });

  const [activeRecord, setActiveRecord] = useState<AssessmentRecord | null>(null);

  // Initialize stored assessments
  useEffect(() => {
    const loaded = getStoredAssessments();
    setAssessments(loaded);
    if (loaded.length > 0 && !activeRecord) {
      setActiveRecord(loaded[0]);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveStoredLanguage(lang);
  };

  const handleModelEngineChange = (engine: ModelEngineType) => {
    setModelEngine(engine);
    saveStoredModelEngine(engine);
  };

  const handleCustomModelConnectedChange = (connected: boolean) => {
    setCustomModelConnected(connected);
    saveStoredCustomModelConnected(connected);
  };

  // Quick Action: "Load Demo Batch"
  const handleLoadDemoBatch = () => {
    const demoBatch: BatchData = {
      batchId: 'ONION-DEMO-001',
      procurementCentre: 'Demo Procurement Centre 01 (Nashik APMC, Maharashtra)',
      inspectorName: 'R. K. Sharma (Demo Inspector)',
      date: new Date().toISOString().split('T')[0],
      onionVariety: 'Demo Onion Batch (Nashik Red)',
      approxQuantity: '50 Quintals (500 Bags)',
      notes: 'Standard SIH 2026 Hackathon Demo Consignment (100 bulbs analyzed)'
    };

    setActiveBatch(demoBatch);
    const sampleImage = generateSampleTraySvg('standard');

    // Create the standardized benchmark assessment record
    const counts = {
      healthy: 72,
      damaged: 8,
      rotten: 5,
      sprouted: 5,
      undersized: 10,
      unableToDetermine: 0,
    };
    const percentages = calculatePercentages(counts);
    const { gradeA, gradeURS } = calculateGrades(counts);

    const record: AssessmentRecord = {
      reportId: `REP-${demoBatch.batchId}-DEMO`,
      batch: demoBatch,
      timestamp: new Date().toISOString(),
      images: [sampleImage],
      totalAnalyzed: 100,
      counts,
      percentages,
      gradeA,
      gradeURS,
      qualitySummary: "Most analyzed onions show no detected visible defect in this demonstration.",
      status: 'Completed',
      isDemoData: true,
      isRealScan: false,
      modelAvailable: true,
      modelNotice: 'Demonstration data only; no model inference was run.',
    };

    saveAssessment(record);
    setAssessments(getStoredAssessments());
    setActiveRecord(record);
    setCurrentView('analysis-results');
  };

  // Batch Form Submit
  const handleBatchSubmit = (batch: BatchData) => {
    setActiveBatch(batch);
    setCurrentView('image-upload');
  };

  // Image Upload -> Start Real Computer Vision Analysis
  const handleStartAnalysis = async (images: string[]) => {
  if (images.length === 0) {
    return;
  }

  setCurrentView('analyzing');

  try {
    const result = await analyzeImagesWithRoboflow(images);

    const newRecord: AssessmentRecord = {
      reportId: `REP-${activeBatch.batchId}-${Date.now().toString().slice(-4)}`,
      batch: activeBatch,
      timestamp: new Date().toISOString(),
      images,
      imageItems: result.items,
      totalAnalyzed: result.totalAnalyzed,
      counts: result.counts,
      percentages: result.percentages,
      gradeA: result.gradeA,
      gradeURS: result.gradeURS,
      qualitySummary: result.qualitySummary,
      boundingBoxes: result.boundingBoxes,
      status: 'Completed',
      isDemoData: false,
      isRealScan: true,
      modelEngineUsed: result.modelEngine,
      modelAvailable: true,
      modelNotice: result.modelNotice,
    };

    saveAssessment(newRecord);
    setAssessments(getStoredAssessments());
    setActiveRecord(newRecord);
    setCurrentView('analysis-results');

  } catch (error) {
    console.error('Roboflow analysis error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to connect to the real onion AI model.';

    const failedRecord: AssessmentRecord = {
      reportId: `REP-${activeBatch.batchId}-${Date.now().toString().slice(-4)}`,
      batch: activeBatch,
      timestamp: new Date().toISOString(),
      images,
      totalAnalyzed: images.length,
      counts: {
        healthy: 0,
        damaged: 0,
        rotten: 0,
        sprouted: 0,
        other: 0,
        undersized: 0,
        unableToDetermine: images.length,
      },
      percentages: {
        healthy: 0,
        damaged: 0,
        rotten: 0,
        sprouted: 0,
        other: 0,
        undersized: 0,
        unableToDetermine: 100,
      },
      gradeA: 0,
      gradeURS: 0,
      qualitySummary: `The real AI service could not complete the analysis: ${message}`,
      boundingBoxes: [],
      status: 'Flagged',
      isDemoData: false,
      isRealScan: false,
      modelEngineUsed: 'roboflow_api',
      modelAvailable: false,
      modelNotice: `Real Roboflow analysis failed: ${message}`,
    };

    setActiveRecord(failedRecord);
    setCurrentView('analysis-results');
  }
};
  // When AI Loading completes
  const handleAnalysisComplete = () => {
  // Roboflow analysis is now performed directly inside handleStartAnalysis.
  // This callback is intentionally kept so AnalysisLoading remains compatible.
  };

  // Delete an assessment record
  const handleDeleteAssessment = (reportId: string) => {
    const updated = deleteAssessment(reportId);
    setAssessments(updated);
    if (activeRecord?.reportId === reportId) {
      setActiveRecord(updated[0] || null);
    }
  };

  // Reset demo data in storage
  const handleResetData = () => {
    const reset = resetDemoAssessments();
    setAssessments(reset);
    setActiveRecord(reset[0] || null);
    setCurrentView('dashboard');
  };

  // Select an assessment from history / dashboard to view report
  const handleSelectAssessment = (record: AssessmentRecord) => {
    setActiveRecord(record);
    setCurrentView('report');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5ee] text-[#1c2a20] antialiased selection:bg-[#c28f2c]/20 selection:text-[#1c2a20]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        onLanguageChange={handleLanguageChange}
        onLoadDemoBatch={handleLoadDemoBatch}
        onToggleSidebarMobile={() => setSidebarMobileOpen(prev => !prev)}
      />

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto items-start">
        {/* Persistent KisanQ-Style Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          language={language}
          isMobileOpen={sidebarMobileOpen}
          onCloseMobile={() => setSidebarMobileOpen(false)}
          activeBatch={activeBatch}
          onLoadDemoBatch={handleLoadDemoBatch}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'landing' && (
            <LandingPage
              onNavigate={setCurrentView}
              language={language}
              onLoadDemoBatch={handleLoadDemoBatch}
            />
          )}

          {currentView === 'dashboard' && (
            <Dashboard
              assessments={assessments}
              onNavigate={setCurrentView}
              onSelectAssessment={handleSelectAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              language={language}
              onLoadDemoBatch={handleLoadDemoBatch}
            />
          )}

          {currentView === 'create-batch' && (
            <CreateBatch
              initialBatch={activeBatch}
              onSubmit={handleBatchSubmit}
              onCancel={() => setCurrentView('dashboard')}
              language={language}
            />
          )}

          {currentView === 'image-upload' && (
            <ImageUpload
              batch={activeBatch}
              onAnalyze={handleStartAnalysis}
              onBack={() => setCurrentView('create-batch')}
              language={language}
            />
          )}

          {currentView === 'analyzing' && (
            <AnalysisLoading
              onComplete={handleAnalysisComplete}
              language={language}
            />
          )}

          {currentView === 'analysis-results' && activeRecord && (
            <QualityAnalysis
              record={activeRecord}
              onGenerateReport={() => setCurrentView('report')}
              onReanalyze={() => setCurrentView('image-upload')}
              language={language}
            />
          )}

          {currentView === 'report' && activeRecord && (
            <DigitalReport
              record={activeRecord}
              onBackToDashboard={() => setCurrentView('dashboard')}
              language={language}
            />
          )}

          {currentView === 'history' && (
            <HistoryPage
              assessments={assessments}
              onSelectAssessment={handleSelectAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onNavigate={setCurrentView}
              onClearAll={handleResetData}
              language={language}
            />
          )}

          {currentView === 'procurement-centre' && (
            <ProcurementCentreDashboard
              assessments={assessments}
              onSelectAssessment={handleSelectAssessment}
              onNavigate={setCurrentView}
              language={language}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              language={language}
              onLanguageChange={handleLanguageChange}
              rules={rules}
              onRulesChange={setRules}
              onResetData={handleResetData}
              onNavigate={setCurrentView}
              modelEngine={modelEngine}
              onModelEngineChange={handleModelEngineChange}
              customModelConnected={customModelConnected}
              onCustomModelConnectedChange={handleCustomModelConnectedChange}
            />
          )}
        </main>
      </div>

      {/* Footer (hidden in print) */}
      <footer className="no-print bg-[#ffffff] border-t border-[#cfcbb8] py-6 text-xs text-[#55665b] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-[#174327] font-heading">OnionGuard AI</span> — Smart India Hackathon 2026 (SIH26031 Prototype)
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#55665b]">
            <span>Roboflow server-side inference</span>
            <span>•</span>
            <span>Upload real onion photos for analysis</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
      />
    </div>
  );
}
