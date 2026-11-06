import React from 'react';
import { Lock, ArrowLeft, LogIn, ShieldAlert, UserCheck } from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { DEMO_PROFILES } from '../lib/demoUsers';
import { ADMIN_EMAIL } from '../lib/firebase';

interface AccessRestrictedProps {
  requiredRole: 'admin' | 'company' | 'distributor' | 'pharmacy';
  onOpenAuth: (mode: 'login' | 'signup', role?: any) => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  requiredRole,
  onOpenAuth,
}) => {
  const { firebaseUser, setFirebaseUser, setActiveView } = useLedgerStore();

  const roleTitles: Record<'admin' | 'company' | 'distributor' | 'pharmacy', { title: string; desc: string }> = {
    admin: {
      title: 'Central Administrative Console',
      desc: `Restricted to Central Admin (${ADMIN_EMAIL}). Provides oversight over all registered companies, pharmacies, licenses, and national QR ledger.`,
    },
    company: {
      title: 'Company / Manufacturer Dashboard',
      desc: 'Restricted to registered pharmaceutical manufacturers. Used to generate unique serialized QR codes, configure batches, and issue shipping invoices.',
    },
    distributor: {
      title: 'Distributor & Stockist Hub',
      desc: 'Restricted to certified wholesale distributors. Used to verify incoming serialized QR batches, check cold-chain compliance, and confirm invoices.',
    },
    pharmacy: {
      title: 'Retail Pharmacy & Chemist Portal',
      desc: 'Restricted to licensed retail pharmacies and chemists. Used to scan inbound medicine strips, verify authenticity, and confirm stock receipt.',
    },
  };

  const currentRoleInfo = roleTitles[requiredRole];

  const handleQuickSignIn = () => {
    const profile = DEMO_PROFILES[requiredRole];
    setFirebaseUser(profile);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
          <Lock className="h-7 w-7" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            Restricted Dashboard
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            {currentRoleInfo.title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {currentRoleInfo.desc}
          </p>
        </div>

        {firebaseUser ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center justify-center gap-1.5 text-rose-900">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Insufficient Permissions</span>
            </div>
            <p>
              You are currently logged in as <strong>{firebaseUser.displayName || firebaseUser.email}</strong> with role{' '}
              <strong className="uppercase">{firebaseUser.role}</strong>. Please switch to an authorized{' '}
              <strong className="uppercase">{requiredRole}</strong> account.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p>
              Please log in with your authorized credentials or use a 1-click test persona to access this dashboard.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleQuickSignIn}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            <span>1-Click Log In as {requiredRole.toUpperCase()}</span>
          </button>

          <button
            onClick={() => onOpenAuth('login', requiredRole)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LogIn className="h-4 w-4 text-slate-500" />
            <span>Sign In with Credentials</span>
          </button>

          <button
            onClick={() => setActiveView('public_scan')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Public Scanner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
