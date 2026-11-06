import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Store,
  UserCheck
} from 'lucide-react';
import {
  auth,
  googleProvider,
  syncUserProfile,
  ADMIN_EMAIL,
} from '../lib/firebase';
import { DEMO_PROFILES } from '../lib/demoUsers';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useLedgerStore } from '../store/useLedgerStore';
import { RoleType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  defaultRole?: 'company' | 'distributor' | 'pharmacy';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  defaultRole = 'company',
}) => {
  const { setFirebaseUser, setActiveView } = useLedgerStore();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'company' | 'distributor' | 'pharmacy'>(
    defaultRole
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(res.user, selectedRole, organization);
      setFirebaseUser(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const profile = await syncUserProfile(
        userCredential.user,
        selectedRole,
        organization || undefined
      );
      setFirebaseUser(profile);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. You can also sign up or use 1-click demo login.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please switch to Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Profiles for Seamless Testing
  const handleDemoSignIn = async (role: 'admin' | 'company' | 'distributor' | 'pharmacy') => {
    setIsLoading(true);
    setErrorMsg(null);

    const chosen = DEMO_PROFILES[role];
    setFirebaseUser(chosen);
    if (role === 'admin') {
      setActiveView('admin');
    } else if (role === 'company') {
      setActiveView('manufacturer');
    } else if (role === 'distributor') {
      setActiveView('distributor');
    } else if (role === 'pharmacy') {
      setActiveView('pharmacy');
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-4 sm:my-8 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-emerald-50/70 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {mode === 'login' ? 'Sign In to ScanRx' : 'Register New Organization'}
              </h3>
              <p className="text-xs text-slate-500">
                Firebase Authenticated Supply Chain Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] text-slate-400 uppercase">
              Or use credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('company')}
                      className={`rounded-lg border p-2 text-center transition-all ${
                        selectedRole === 'company'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="h-4 w-4 mx-auto mb-1 text-emerald-700" />
                      <span>Company (MFR)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('distributor')}
                      className={`rounded-lg border p-2 text-center transition-all ${
                        selectedRole === 'distributor'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="h-4 w-4 mx-auto mb-1 text-blue-700" />
                      <span>Distributor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('pharmacy')}
                      className={`rounded-lg border p-2 text-center transition-all ${
                        selectedRole === 'pharmacy'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="h-4 w-4 mx-auto mb-1 text-purple-700" />
                      <span>Pharmacy</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Cipla Pharma Ltd. / MedPlus Hub"
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pharma-org.in"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>{mode === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="text-center text-slate-500">
            {mode === 'login' ? (
              <span>
                New registered company or stockist?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

          {/* Instant 1-Click Demo Testing Buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1-Click Demo Personas (Instant Access)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => handleDemoSignIn('admin')}
                className="rounded-lg border border-amber-300 bg-amber-50/70 p-2 hover:bg-amber-100 font-semibold text-amber-950 text-left"
              >
                👑 Admin ({ADMIN_EMAIL})
                <div className="text-[10px] text-amber-800 font-normal">All companies, pharmacies & QRs</div>
              </button>

              <button
                onClick={() => handleDemoSignIn('company')}
                className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2 hover:bg-emerald-100/50 font-semibold text-emerald-950 text-left"
              >
                🏭 Company (Sun Pharma)
                <div className="text-[10px] text-slate-400 font-normal">QR & Invoices</div>
              </button>

              <button
                onClick={() => handleDemoSignIn('distributor')}
                className="rounded-lg border border-blue-200 bg-blue-50/50 p-2 hover:bg-blue-100/50 font-semibold text-blue-950 text-left"
              >
                🚚 Distributor (Coldex)
                <div className="text-[10px] text-slate-400 font-normal">Verify & Confirm</div>
              </button>

              <button
                onClick={() => handleDemoSignIn('pharmacy')}
                className="rounded-lg border border-purple-200 bg-purple-50/50 p-2 hover:bg-purple-100/50 font-semibold text-purple-950 text-left"
              >
                🏪 Pharmacy (Apollo)
                <div className="text-[10px] text-slate-400 font-normal">Verify QRs & Invoices</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
