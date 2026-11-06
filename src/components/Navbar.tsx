import React, { useState } from 'react';
import { useLedgerStore } from '../store/useLedgerStore';
import {
  ShieldCheck,
  Wifi,
  WifiOff,
  Camera,
  ChevronDown,
  Activity,
  Building2,
  Truck,
  Store,
  AlertTriangle,
  User,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import { RoleType } from '../types';
import { AuthModal } from './AuthModal';
import { auth, fbSignOut } from '../lib/firebase';

export const Navbar: React.FC = () => {
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
    securityAlerts,
  } = useLedgerStore();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const activeAlertsCount = securityAlerts.filter((a) => !a.resolved).length;

  const handleRoleSelect = (role: RoleType) => {
    switchUserRole(role);
    setRoleMenuOpen(false);
    if (role === 'admin') setActiveView('admin');
    else if (role === 'company' || role === 'manufacturer') setActiveView('manufacturer');
    else if (role === 'distributor') setActiveView('distributor');
    else if (role === 'pharmacy') setActiveView('pharmacy');
    else if (role === 'auditor') setActiveView('security_center');
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignored
    }
    setFirebaseUser(null);
    setRoleMenuOpen(false);
    setActiveView('public_scan');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('public_scan')}
              className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 font-sans">
                  Aushadh<span className="text-emerald-700 font-semibold">Ledger</span> <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 ml-1">India</span>
                </span>
                <p className="text-[11px] font-medium text-slate-500 leading-none">
                  CDSCO Blockchain Traceability
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('public_scan')}
              className={`transition-colors whitespace-nowrap pb-1 border-b-2 font-medium ${
                activeView === 'public_scan'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Verify Medicine (Public)
            </button>

            <button
              onClick={() => {
                switchUserRole('admin');
                setActiveView('admin');
              }}
              className={`transition-colors whitespace-nowrap pb-1 border-b-2 font-medium ${
                activeView === 'admin'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Admin (Me)
            </button>

            <button
              onClick={() => {
                switchUserRole('company');
                setActiveView('manufacturer');
              }}
              className={`transition-colors whitespace-nowrap pb-1 border-b-2 font-medium ${
                activeView === 'manufacturer'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Company (MFR)
            </button>

            <button
              onClick={() => {
                switchUserRole('distributor');
                setActiveView('distributor');
              }}
              className={`transition-colors whitespace-nowrap pb-1 border-b-2 font-medium ${
                activeView === 'distributor'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Distributor Hub
            </button>

            <button
              onClick={() => {
                switchUserRole('pharmacy');
                setActiveView('pharmacy');
              }}
              className={`transition-colors whitespace-nowrap pb-1 border-b-2 font-medium ${
                activeView === 'pharmacy'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Pharmacy / Chemist
            </button>

            <button
              onClick={() => setActiveView('security_center')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap pb-1 border-b-2 font-medium ${
                activeView === 'security_center'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>CDSCO Radar</span>
              {activeAlertsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions & Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Rural Offline Mode Toggle */}
            <button
              onClick={toggleOfflineMode}
              title={isOfflineMode ? 'Rural Offline Mode Active (Local CDSCO manifests)' : 'Connected to Indian National Blockchain'}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isOfflineMode
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                  <span>Offline ({offlineQueueCount})</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>

            {/* Quick Public Scan Button */}
            <button
              onClick={() => setActiveView('public_scan')}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span>Scan Medicine</span>
            </button>

            {/* Login / User Profile Dropdown */}
            {firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-100/50 transition-colors"
                >
                  <div className="text-left hidden sm:block">
                    <span className="block font-bold leading-tight">
                      {firebaseUser.displayName || firebaseUser.email}
                    </span>
                    <span className="block text-[10px] text-emerald-700 font-semibold uppercase">
                      {firebaseUser.role} · {firebaseUser.organization}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-emerald-700" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 text-[11px]">
                      <div className="font-bold text-slate-900">{firebaseUser.displayName}</div>
                      <div className="text-slate-500 truncate">{firebaseUser.email}</div>
                      <div className="mt-1 font-semibold text-emerald-800 uppercase text-[10px]">
                        Role: {firebaseUser.role}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          if (firebaseUser.role === 'admin') setActiveView('admin');
                          else if (firebaseUser.role === 'company') setActiveView('manufacturer');
                          else if (firebaseUser.role === 'distributor') setActiveView('distributor');
                          else setActiveView('pharmacy');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Go to My Dashboard
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-1.5"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-600" />
                  <span>Log In</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="hidden md:flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="flex lg:hidden overflow-x-auto border-t border-slate-200/80 bg-slate-50/90 px-4 py-2 gap-2 text-xs scrollbar-none">
          <button
            onClick={() => setActiveView('public_scan')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'public_scan'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Scan Strip (Public)
          </button>
          <button
            onClick={() => {
              switchUserRole('admin');
              setActiveView('admin');
            }}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'admin'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Admin (Me)
          </button>
          <button
            onClick={() => {
              switchUserRole('company');
              setActiveView('manufacturer');
            }}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'manufacturer'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Company (MFR)
          </button>
          <button
            onClick={() => {
              switchUserRole('distributor');
              setActiveView('distributor');
            }}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'distributor'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Distributor
          </button>
          <button
            onClick={() => {
              switchUserRole('pharmacy');
              setActiveView('pharmacy');
            }}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'pharmacy'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Pharmacy
          </button>
          <button
            onClick={() => setActiveView('security_center')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeView === 'security_center'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <span>CDSCO Radar</span>
            {activeAlertsCount > 0 && (
              <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
};
