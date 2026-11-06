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
  LogIn,
  LogOut,
  X,
  Boxes,
  PlusCircle,
  QrCode,
  FileText,
  UserCheck,
  CheckCircle2,
  ScanLine,
  FileSpreadsheet,
  Building
} from 'lucide-react';
import { DEMO_PROFILES } from '../lib/demoUsers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const {
    activeView,
    setActiveView,
    companyTab,
    setCompanyTab,
    pharmacyTab,
    setPharmacyTab,
    firebaseUser,
    setFirebaseUser,
    isOfflineMode,
    toggleOfflineMode,
    offlineQueueCount,
    securityAlerts,
    blocks,
  } = useLedgerStore();

  const activeAlertsCount = securityAlerts.filter((a) => !a.resolved).length;

  const navigateTo = (view: typeof activeView) => {
    setActiveView(view);
    onClose();
  };

  const handleCompanyNavigation = (tab: typeof companyTab) => {
    setCompanyTab(tab);
    onClose();
  };

  const handlePharmacyNavigation = (tab: typeof pharmacyTab) => {
    setPharmacyTab(tab);
    onClose();
  };

  const handleSignOut = () => {
    setFirebaseUser(null);
    setActiveView('public_scan');
    onClose();
  };

  const handleQuickDemoSignIn = (role: 'company' | 'pharmacy') => {
    const profile = DEMO_PROFILES[role];
    setFirebaseUser(profile);
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
        {/* Brand Header */}
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
                Scan<span className="text-emerald-700 font-semibold">Rx</span>
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
          {/* Group 1: Public Tools */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Public Scanner
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
          </div>

          {/* Group 2: Role Dashboard (ONLY shown when logged in) */}
          {firebaseUser ? (
            <div className="space-y-4">
              {/* COMPANY ROLE NAVIGATION */}
              {firebaseUser.role === 'company' && (
                <div className="space-y-1">
                  <div className="px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Company Dashboard</span>
                    <span className="font-mono text-emerald-700">MFR</span>
                  </div>

                  <button
                    onClick={() => handleCompanyNavigation('overview')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer' && companyTab === 'overview'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-emerald-700" />
                    <span>Company Overview</span>
                  </button>

                  <button
                    onClick={() => handleCompanyNavigation('batches')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer' && companyTab === 'batches'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Boxes className="h-4 w-4 text-emerald-700" />
                    <span>Medicine Batches</span>
                  </button>

                  <button
                    onClick={() => handleCompanyNavigation('create')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer' && companyTab === 'create'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="h-4 w-4 text-emerald-700" />
                      <span>Generate Unique QRs</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      New
                    </span>
                  </button>

                  <button
                    onClick={() => handleCompanyNavigation('qrcodes')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer' && companyTab === 'qrcodes'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="h-4 w-4 text-emerald-700" />
                    <span>QR Matrix & Print</span>
                  </button>

                  <button
                    onClick={() => handleCompanyNavigation('invoices')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer' && companyTab === 'invoices'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="h-4 w-4 text-blue-700" />
                    <span>Shipping Invoices</span>
                  </button>

                  <button
                    onClick={() => handleCompanyNavigation('profile')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer' && companyTab === 'profile'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Building className="h-4 w-4 text-slate-500" />
                    <span>Company Profile & Licenses</span>
                  </button>
                </div>
              )}

              {/* PHARMACY ROLE NAVIGATION */}
              {firebaseUser.role === 'pharmacy' && (
                <div className="space-y-1">
                  <div className="px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Pharmacy Portal</span>
                    <span className="font-mono text-purple-700">RETAIL</span>
                  </div>

                  <button
                    onClick={() => handlePharmacyNavigation('overview')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'pharmacy' && pharmacyTab === 'overview'
                        ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Store className="h-4 w-4 text-purple-700" />
                    <span>Store Overview</span>
                  </button>

                  <button
                    onClick={() => handlePharmacyNavigation('inventory')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'pharmacy' && pharmacyTab === 'inventory'
                        ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Boxes className="h-4 w-4 text-purple-700" />
                    <span>Shelf Inventory & Stock</span>
                  </button>

                  <button
                    onClick={() => handlePharmacyNavigation('invoices')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'pharmacy' && pharmacyTab === 'invoices'
                        ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="h-4 w-4 text-blue-700" />
                      <span>Inbound Invoices</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      Confirm
                    </span>
                  </button>

                  <button
                    onClick={() => handlePharmacyNavigation('verify')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'pharmacy' && pharmacyTab === 'verify'
                        ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <ScanLine className="h-4 w-4 text-emerald-700" />
                    <span>Verify Inbound QRs</span>
                  </button>

                  <button
                    onClick={() => handlePharmacyNavigation('profile')}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'pharmacy' && pharmacyTab === 'profile'
                        ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <span>Store License (Form 20/21)</span>
                  </button>
                </div>
              )}

              {/* ADMIN ROLE NAVIGATION */}
              {firebaseUser.role === 'admin' && (
                <div className="space-y-1">
                  <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Admin Oversight
                  </div>

                  <button
                    onClick={() => navigateTo('admin')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'admin'
                        ? 'bg-amber-50 text-amber-950 font-semibold border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-amber-700" />
                      <span>Admin Console (Me)</span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-semibold font-mono">fakemailcloud09</span>
                  </button>

                  <button
                    onClick={() => navigateTo('manufacturer')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'manufacturer'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-emerald-700" />
                      <span>Company Dashboard</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold font-mono">MFR</span>
                  </button>

                  <button
                    onClick={() => navigateTo('pharmacy')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'pharmacy'
                        ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="h-4 w-4 text-purple-700" />
                      <span>Pharmacy Portal</span>
                    </div>
                    <span className="text-[10px] text-purple-800 font-semibold font-mono">Store</span>
                  </button>

                  <button
                    onClick={() => navigateTo('security_center')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'security_center'
                        ? 'bg-rose-50 text-rose-950 font-semibold border border-rose-200'
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
              )}

              {/* DISTRIBUTOR ROLE NAVIGATION */}
              {firebaseUser.role === 'distributor' && (
                <div className="space-y-1">
                  <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Distributor Hub
                  </div>

                  <button
                    onClick={() => navigateTo('distributor')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
                      activeView === 'distributor'
                        ? 'bg-blue-50 text-blue-950 font-semibold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="h-4 w-4 text-blue-700" />
                      <span>Distributor Hub</span>
                    </div>
                    <span className="text-[10px] text-blue-800 font-semibold font-mono">Invoices</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out quick test links to test dashboards instantly */
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Test Role Dashboards
              </div>
              <button
                onClick={() => handleQuickDemoSignIn('company')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Company Dashboard</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              </button>

              <button
                onClick={() => handleQuickDemoSignIn('pharmacy')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Store className="h-3.5 w-3.5 text-purple-700" />
                  <span>Pharmacy Dashboard</span>
                </div>
                <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              </button>
            </div>
          )}

          {/* Group 3: Ledger Status (Shown when logged in) */}
          {firebaseUser && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Blockchain Ledger</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Block #{blocks.length}
                </span>
              </div>

              <div className="text-slate-500 flex items-center justify-between">
                <span>Network State</span>
                <button
                  onClick={toggleOfflineMode}
                  className={`font-semibold ${
                    isOfflineMode ? 'text-amber-700 underline' : 'text-slate-600'
                  }`}
                >
                  {isOfflineMode ? `Offline (${offlineQueueCount})` : 'Online'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer: User Identity & Sign In / Out */}
        <div className="border-t border-slate-200/90 p-3.5 bg-slate-50/50">
          {firebaseUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="truncate font-bold text-xs text-slate-900">
                    {firebaseUser.displayName || firebaseUser.email}
                  </div>
                  <div className="truncate text-[10px] text-slate-500">
                    {firebaseUser.role.toUpperCase()} · {firebaseUser.organization}
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign Out to Public Scanner"
                  className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500">
                Staff Sign In
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
