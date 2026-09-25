import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Layers, 
  PlusCircle, 
  History, 
  Building2, 
  Settings as SettingsIcon, 
  Home, 
  Globe2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Language, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoadDemoBatch: () => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  onLoadDemoBatch,
  onToggleSidebarMobile,
}) => {
  const t = translations[language];

  const navItems: { view: ViewMode; label: string; icon: React.ReactNode }[] = [
    { view: 'landing', label: t.home, icon: <Home className="w-4 h-4" /> },
    { view: 'dashboard', label: t.dashboard, icon: <Layers className="w-4 h-4" /> },
    { view: 'create-batch', label: t.newAssessment, icon: <PlusCircle className="w-4 h-4" /> },
    { view: 'history', label: t.history, icon: <History className="w-4 h-4" /> },
    { view: 'procurement-centre', label: t.procurementCentre, icon: <Building2 className="w-4 h-4" /> },
    { view: 'settings', label: t.settings, icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#cfcbb8] shadow-xs">
      {/* Top Demo Banner */}
      <div className="bg-[#122e1d] text-[#f4f1e4] px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-[#24462f]">
        <div className="flex items-center gap-2 truncate">
          <span className="bg-[#f2c14e] text-[#122e1d] text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase font-heading">
            {t.demoMode}
          </span>
          <span className="truncate text-[#d1e0d2] text-[11px] sm:text-xs">{t.prototypeNotice}</span>
        </div>
        <button
          onClick={onLoadDemoBatch}
          className="ml-2 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg border border-[#d9bf85] bg-[#f6ecd4] text-[#4d3504] hover:bg-[#f0e2c2] text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          title="Quick load ONION-DEMO-001 (100 onions: 72 healthy, 8 damaged, 5 rotten, 5 sprouted, 10 undersized)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8a5f12]" />
          <span>{t.loadDemoBatchCTA}</span>
        </button>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#174327] border border-[#0e2f1c] flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg text-[#f2c14e] font-heading">OG</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#174327] font-heading">
                  Onion<span className="text-[#c28f2c]">Guard</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e0eee2] text-[#1c5a35] uppercase tracking-wider border border-[#bcd6c0]">
                  SIH26031
                </span>
              </div>
              <p className="text-[11px] text-[#55665b] hidden md:block leading-none mt-0.5 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view || 
                (item.view === 'create-batch' && (currentView === 'image-upload' || currentView === 'analyzing' || currentView === 'analysis-results' || currentView === 'report'));
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1c5a35] text-white shadow-sm ring-1 ring-[#174327]'
                      : 'text-[#1c2a20] hover:bg-[#f1f6f0] hover:text-[#174327]'
                  }`}
                >
                  {item.icon}
                  <span className="font-heading text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Area: Language switcher & CTA */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#f1f6f0] p-0.5 rounded-xl border border-[#cfcbb8] text-xs">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-[#174327] shadow-xs'
                    : 'text-[#55665b] hover:text-[#1c2a20]'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-lg font-bold font-heading transition cursor-pointer ${
                  language === 'hi'
                    ? 'bg-white text-[#174327] shadow-xs'
                    : 'text-[#55665b] hover:text-[#1c2a20]'
                }`}
                title="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => onNavigate('create-batch')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#174327] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.newBatchCTA}</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={onToggleSidebarMobile}
              className="lg:hidden p-2 rounded-xl border border-[#cfcbb8] text-[#1c2a20] hover:bg-[#f1f6f0] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
