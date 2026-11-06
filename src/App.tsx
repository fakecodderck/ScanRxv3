import React, { useState, useEffect } from 'react';
import { useLedgerStore, initFirestoreSync } from './store/useLedgerStore';
import { Sidebar } from './components/Sidebar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { PublicScanner } from './components/PublicScanner';
import { ManufacturerPortal } from './components/ManufacturerPortal';
import { DistributorPortal } from './components/DistributorPortal';
import { PharmacyPortal } from './components/PharmacyPortal';
import { SecurityAnomalyCenter } from './components/SecurityAnomalyCenter';
import { AdminPortal } from './components/AdminPortal';
import { AccessRestricted } from './components/AccessRestricted';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  useEffect(() => {
    initFirestoreSync();
  }, []);

  const {
    activeView,
    setActiveView,
    firebaseUser,
    isOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
  } = useLedgerStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<'company' | 'distributor' | 'pharmacy'>('company');

  const handleOpenAuth = (
    mode: 'login' | 'signup',
    role?: 'admin' | 'company' | 'distributor' | 'pharmacy'
  ) => {
    setAuthModalMode(mode);
    if (role && role !== 'admin') {
      setAuthModalDefaultRole(role);
    }
    setAuthModalOpen(true);
  };

  // Role permissions checking
  const isAdmin = firebaseUser !== null && firebaseUser.role === 'admin';
  const isCompany = firebaseUser !== null && (firebaseUser.role === 'company' || isAdmin);
  const isDistributor = firebaseUser !== null && (firebaseUser.role === 'distributor' || isAdmin);
  const isPharmacy = firebaseUser !== null && (firebaseUser.role === 'pharmacy' || isAdmin);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-emerald-600 selection:text-white antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Header */}
        <WorkspaceHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAuth={handleOpenAuth}
        />

        {/* Viewport Content with Strict RBAC Isolation */}
        <main className="flex-1 pb-12">
          {/* 1. Public Scanner (Always accessible to all) */}
          {activeView === 'public_scan' && (
            <PublicScanner onOpenAuth={handleOpenAuth} />
          )}

          {/* 2. Admin Portal (Restricted to Central Admin: fakemailcloud09@gmail.com) */}
          {activeView === 'admin' && (
            isAdmin ? (
              <AdminPortal />
            ) : (
              <AccessRestricted requiredRole="admin" onOpenAuth={handleOpenAuth} />
            )
          )}

          {/* 3. Company Dashboard (Restricted to Company/Manufacturer) */}
          {activeView === 'manufacturer' && (
            isCompany ? (
              <ManufacturerPortal />
            ) : (
              <AccessRestricted requiredRole="company" onOpenAuth={handleOpenAuth} />
            )
          )}

          {/* 4. Distributor Hub (Restricted to Distributor) */}
          {activeView === 'distributor' && (
            isDistributor ? (
              <DistributorPortal />
            ) : (
              <AccessRestricted requiredRole="distributor" onOpenAuth={handleOpenAuth} />
            )
          )}

          {/* 5. Pharmacy Portal (Restricted to Pharmacy) */}
          {activeView === 'pharmacy' && (
            isPharmacy ? (
              <PharmacyPortal />
            ) : (
              <AccessRestricted requiredRole="pharmacy" onOpenAuth={handleOpenAuth} />
            )
          )}

          {/* 6. Security Center (Restricted to Admin) */}
          {activeView === 'security_center' && (
            isAdmin ? (
              <SecurityAnomalyCenter />
            ) : (
              <AccessRestricted requiredRole="admin" onOpenAuth={handleOpenAuth} />
            )
          )}
        </main>

        {/* Low-Connectivity / Rural Offline Notification */}
        {isOfflineMode && (
          <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border border-amber-300 bg-amber-50 p-3.5 shadow-lg text-xs text-amber-950 flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-900">
                Rural Offline Verification Active
              </div>
              <p className="text-[11px] text-amber-800">
                Medicine strips verified locally via cached CDSCO Merkle manifests. {offlineQueueCount} scan(s) queued for sync.
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

        {/* Clean Unslop Footer */}
        <footer className="mt-auto border-t border-slate-200/90 bg-white py-5 text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>ScanRx · CDSCO Medicine Traceability Network</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <button
                onClick={() => setActiveView('public_scan')}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Verify Medicine Strip
              </button>
              <span aria-hidden="true">·</span>
              {firebaseUser ? (
                <span>Logged in: {firebaseUser.role.toUpperCase()}</span>
              ) : (
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="text-slate-700 font-semibold hover:underline"
                >
                  Staff Sign In
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
        defaultRole={authModalDefaultRole}
      />
    </div>
  );
}
