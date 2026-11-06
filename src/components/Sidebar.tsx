import React from 'react';
import { useLedgerStore } from '../store/useLedgerStore';
import {
  ShieldCheck,
  Camera,
  Activity,
  Building2,
  Truck,
  Store,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  LogIn,
  LogOut,
  User,
  ExternalLink,
  X,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { RoleType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    switchUserRole,
    firebaseUser,
    setFirebaseUser,
    isOfflineMode,
    toggleOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    securityAlerts,
    blocks,
  } = useLedgerStore();

  const activeAlertsCount = securityAlerts.filter((a) => !a.resolved).length;

  const navigateTo = (view: typeof activeView, role?: RoleType) => {
    if (role) switchUserRole(role);
    setActiveView(view);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white transition-transform duration-200 ease-out lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/90 px-5">
          <button
            onClick={() => navigateTo('public_scan')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
              <ShieldCheck className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                Aushadh<span className="text-emerald-700 font-semibold">Ledger</span>
              </div>
              <div className="text-[10px] font-medium text-slate-500 leading-none mt-0.5">
                CDSCO Supply Traceability
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 text-xs">
          {/* Group 1: Verification & Public Tools */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Public & Consumer
            </div>

            <button
              onClick={() => navigateTo('public_scan')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                activeView === 'public_scan'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Camera className="h-4 w-4 text-emerald-700" />
                <span>Verify Medicine Strip</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold">Open</span>
            </button>

            <button
              onClick={() => navigateTo('security_center')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                activeView === 'security_center'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-rose-600" />
                <span>Impossible Travel Radar</span>
              </div>
              {activeAlertsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white tabular-nums">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* Group 2: Regulated Supply Chain Roles */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Supply Chain Portals
            </div>

            <button
              onClick={() => navigateTo('admin', 'admin')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                activeView === 'admin'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>Admin Console (Me)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Govt</span>
            </button>

            <button
              onClick={() => navigateTo('manufacturer', 'company')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                activeView === 'manufacturer'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-emerald-700" />
                <span>Company (MFR)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Baddi</span>
            </button>

            <button
              onClick={() => navigateTo('distributor', 'distributor')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                activeView === 'distributor'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-blue-700" />
                <span>Distributor Hub</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Bhiwandi</span>
            </button>

            <button
              onClick={() => navigateTo('pharmacy', 'pharmacy')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                activeView === 'pharmacy'
                  ? 'bg-purple-50 text-purple-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="h-4 w-4 text-purple-700" />
                <span>Pharmacy / Chemist</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Retail</span>
            </button>
          </div>

          {/* Group 3: Network Integrity & Rural Cache */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-700" />
                <span>Blockchain Ledger</span>
              </span>
              <span className="font-mono text-[10px] tabular-nums text-slate-500">
                Block #{blocks.length}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Rural Offline Cache</span>
              <button
                onClick={toggleOfflineMode}
                className={`font-semibold transition-colors ${
                  isOfflineMode ? 'text-amber-700 underline' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOfflineMode ? 'Offline Enabled' : 'Online Mode'}
              </button>
            </div>

            {offlineQueueCount > 0 && (
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-amber-800 font-medium">
                  {offlineQueueCount} scan(s) pending
                </span>
                <button
                  onClick={syncOfflineQueue}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Sync Now</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer: User / Authentication Status */}
        <div className="border-t border-slate-200/90 p-3.5 bg-slate-50/50">
          {firebaseUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="truncate font-semibold text-xs text-slate-900">
                    {firebaseUser.displayName || firebaseUser.email}
                  </div>
                  <div className="truncate text-[10px] text-slate-500">
                    {firebaseUser.role.toUpperCase()} · {firebaseUser.organization}
                  </div>
                </div>

                <button
                  onClick={() => setFirebaseUser(null)}
                  title="Sign Out"
                  className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                <FileCheck2 className="h-3 w-3 text-emerald-700" />
                <span>Verified Participant Node</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500">
                Staff & Auditor Portal Sign-In
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex-1 rounded-lg bg-emerald-700 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
