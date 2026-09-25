import React from 'react';
import { 
  Layers, 
  PlusCircle, 
  Camera, 
  Award, 
  History, 
  Building2, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck,
  Scale
} from 'lucide-react';
import { ViewMode, Language, BatchData } from '../types';
import { translations } from '../utils/translations';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  language: Language;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeBatch: BatchData;
  onLoadDemoBatch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  language,
  isMobileOpen,
  onCloseMobile,
  activeBatch,
  onLoadDemoBatch,
}) => {
  const t = translations[language];

  const navItems: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; highlight?: boolean }[] = [
    { id: 'dashboard', label: t.dashboard, icon: Layers, badge: 'Live' },
    { id: 'create-batch', label: t.newAssessment, icon: PlusCircle, highlight: true },
    { id: 'image-upload', label: 'Scan & Camera', icon: Camera },
    { id: 'analysis-results', label: 'Quality Analysis', icon: Award },
    { id: 'history', label: t.history, icon: History },
    { id: 'procurement-centre', label: t.procurementCentre, icon: Building2 },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const handleSelect = (view: ViewMode) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#122e1d]/75 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#cfcbb8] flex flex-col justify-between transition-transform duration-200 ease-in-out flex-shrink-0 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User / Inspector Profile Card */}
          <div className="p-3.5 bg-[#f1f6f0] border border-[#bcd6c0] rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1c5a35] text-[#f2c14e] flex items-center justify-center font-bold text-base font-heading shadow-xs flex-shrink-0">
              OG
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-[#1c2a20] truncate font-heading">
                  {activeBatch.inspectorName.split('(')[0].trim()}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1c5a35] flex-shrink-0" />
              </div>
              <p className="text-xs text-[#55665b] truncate">
                {activeBatch.procurementCentre.split('(')[0].trim()}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#55665b] px-3 mb-2 font-heading">
              Quality Inspection Roster
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1c5a35] text-white shadow-sm ring-1 ring-[#174327]'
                      : item.highlight
                      ? 'text-[#4d3504] bg-[#f6ecd4] hover:bg-[#f0e2c2] border border-[#d9bf85]'
                      : 'text-[#1c2a20] hover:bg-[#f1f6f0] hover:text-[#174327]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive 
                        ? 'text-white' 
                        : item.highlight 
                        ? 'text-[#8a5f12]' 
                        : 'text-[#55665b]'
                    }`} />
                    <span className="font-heading truncate text-sm">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#e0eee2] text-[#1c5a35]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Mandi Quality Helpline & Quick Actions */}
        <div className="p-4 border-t border-[#e4e1d3] bg-[#f7f5ee] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174327] font-heading">
            <Scale className="w-3.5 h-3.5 text-[#c28f2c]" />
            <span>Mandi Quality Standards Helpline</span>
          </div>
          <p className="text-[11px] text-[#55665b] leading-tight">
            Objective computer vision eliminates dispute over Grade A vs URS deductions.
          </p>

          <button
            type="button"
            onClick={() => {
              onLoadDemoBatch();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#1c5a35] hover:bg-[#174327] text-[#f2c14e] text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Benchmark Lot (100)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
