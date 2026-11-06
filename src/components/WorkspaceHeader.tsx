import React from 'react';
import { useLedgerStore } from '../store/useLedgerStore';
import {
  Menu,
  ShieldCheck,
  Camera,
  Wifi,
  WifiOff,
  User,
  LogIn,
  ChevronRight
} from 'lucide-react';

interface WorkspaceHeaderProps {
  onToggleSidebar: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  onToggleSidebar,
  onOpenAuth,
}) => {
  const {
    activeView,
    setActiveView,
    firebaseUser,
    isOfflineMode,
    toggleOfflineMode,
    offlineQueueCount,
  } = useLedgerStore();

  const getViewTitle = () => {
    switch (activeView) {
      case 'public_scan':
        return 'Verify Medicine Strip (Public)';
      case 'admin':
        return 'Central Administrative Console (Me)';
      case 'manufacturer':
        return 'Company & Manufacturing Unit (MFR)';
      case 'distributor':
        return 'Distributor & Stockist Logistics Hub';
      case 'pharmacy':
        return 'Retail Pharmacy & Chemist Dispensation';
      case 'security_center':
        return 'Impossible Travel & Counterfeit Anomaly Radar';
      default:
        return 'National Medicine Traceability';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Zone 1: Mobile Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
          <span className="font-semibold text-slate-900 shrink-0">AushadhLedger</span>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate text-slate-700 font-medium">{getViewTitle()}</span>
        </div>
      </div>

      {/* Zone 2: Quiet unboxed system metadata (Clean unboxed text, no pills) */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
        <span>CDSCO & MoHFW Verified</span>
        <span aria-hidden="true">·</span>
        <span>Indian Pharmacopoeia (IP)</span>
        <span aria-hidden="true">·</span>
        <span>SHA-256 Merkle Ledger</span>
      </div>

      {/* Zone 3: Primary Action & Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Offline Switch */}
        <button
          onClick={toggleOfflineMode}
          title={isOfflineMode ? 'Rural Offline Mode Active' : 'Connected to National Blockchain'}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isOfflineMode
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isOfflineMode ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
              <span className="font-semibold">Offline ({offlineQueueCount})</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Online</span>
            </>
          )}
        </button>

        {/* Primary Scan Button */}
        {activeView !== 'public_scan' && (
          <button
            onClick={() => setActiveView('public_scan')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scan Strip</span>
          </button>
        )}

        {/* User / Sign In */}
        {!firebaseUser && (
          <button
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-500" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
