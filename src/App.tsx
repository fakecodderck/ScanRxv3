import React, { useState } from 'react';
import { useLedgerStore } from './store/useLedgerStore';
import { Sidebar } from './components/Sidebar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { PublicScanner } from './components/PublicScanner';
import { ManufacturerPortal } from './components/ManufacturerPortal';
import { DistributorPortal } from './components/DistributorPortal';
import { PharmacyPortal } from './components/PharmacyPortal';
import { SecurityAnomalyCenter } from './components/SecurityAnomalyCenter';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  const { activeView, setActiveView, isOfflineMode, offlineQueueCount, syncOfflineQueue } = useLedgerStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-emerald-600 selection:text-white antialiased">
      {/* Enterprise SaaS Sidebar (Unslop Layout) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Header Bar adhering to Top Bar Contract */}
        <WorkspaceHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAuth={handleOpenAuth}
        />

        {/* Viewport Content */}
        <main className="flex-1 pb-12">
          {activeView === 'public_scan' && <PublicScanner />}
          {activeView === 'admin' && <AdminPortal />}
          {activeView === 'manufacturer' && <ManufacturerPortal />}
          {activeView === 'distributor' && <DistributorPortal />}
          {activeView === 'pharmacy' && <PharmacyPortal />}
          {activeView === 'security_center' && <SecurityAnomalyCenter />}
        </main>

        {/* Low-Connectivity / Rural Offline Banner */}
        {isOfflineMode && (
          <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border border-amber-300 bg-amber-50 p-3.5 shadow-lg text-xs text-amber-950 flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <span>Rural Offline Verification Active</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Medicine strips verified locally via cached CDSCO Merkle manifests. {offlineQueueCount} scan(s) queued for national sync.
              </p>
              <button
                onClick={syncOfflineQueue}
                className="mt-1 flex items-center gap-1 font-semibold text-amber-900 underline hover:text-amber-700"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Sync with National Blockchain</span>
              </button>
            </div>
          </div>
        )}

        {/* Quiet Clean Unslop Footer */}
        <footer className="mt-auto border-t border-slate-200/90 bg-white py-5 text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>AushadhLedger India · CDSCO & MoHFW Pharmaceutical Traceability Network</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Drugs & Cosmetics Rules 1945</span>
              <span aria-hidden="true">·</span>
              <span>Indian Pharmacopoeia (IP)</span>
              <span aria-hidden="true">·</span>
              <span>Impossible Travel Velocity Radar</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setActiveView('public_scan')}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Scan Strip
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}
