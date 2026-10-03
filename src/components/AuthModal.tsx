import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onSuccessRedirect?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessRedirect }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openLoginModal,
    openRegisterModal,
    login,
    register,
  } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(loginEmail, loginPassword);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid email or password.');
      } else {
        closeAuthModal();
        if (onSuccessRedirect) onSuccessRedirect();
      }
    }, 250);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = register({
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
      } else {
        setSuccessMessage('Account created successfully.');
        setTimeout(() => {
          closeAuthModal();
          if (onSuccessRedirect) onSuccessRedirect();
        }, 600);
      }
    }, 250);
  };

  const handleQuickDemoFill = () => {
    setLoginEmail('engineer@smartiot.industrial');
    setLoginPassword('IndustrialPass2026');
    setErrorMessage('');
  };

  const handleOneClickDemoLogin = () => {
    setLoginEmail('engineer@smartiot.industrial');
    setLoginPassword('IndustrialPass2026');
    setErrorMessage('');
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login('engineer@smartiot.industrial', 'IndustrialPass2026');
      setIsSubmitting(false);
      if (res.success) {
        closeAuthModal();
        if (onSuccessRedirect) onSuccessRedirect();
      } else {
        setErrorMessage(res.error || 'Failed to authenticate demo user.');
      }
    }, 200);
  };

  // Password requirement checks
  const hasMinLength = regPassword.length >= 8;
  const hasNumber = /[0-9]/.test(regPassword);
  const hasLetter = /[a-zA-Z]/.test(regPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-1">
            SMART IoT Platform
          </div>
          {authModalMode === 'LOGIN' ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-white">Sign In Required</h2>
              <p className="text-sm text-slate-400 mt-1">
                Authentication is mandatory to access the live Industrial Monitoring Console, telemetry streams, and anomaly alerts.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-white">Create Operator Account</h2>
              <p className="text-sm text-slate-400 mt-1">Register credentials to monitor industrial fleet assets.</p>
            </>
          )}
        </div>

        {/* Error message notification */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 text-sm text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success message notification */}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {authModalMode === 'LOGIN' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="engineer@company.industrial"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setErrorMessage('Password reset notice: Please use the official demo operator credentials below or register a new account.')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-lg shadow-lg shadow-cyan-400/20 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Demo Quick Sign-in for immediate evaluation */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleOneClickDemoLogin}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡ 1-Click Demo Sign In (Operations Lead)</span>
              </button>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-slate-300 font-semibold font-sans">Mandatory Operator Credentials:</div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-cyan-300">engineer@smartiot.industrial</span>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <span className="text-cyan-300">IndustrialPass2026</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-3 text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={openRegisterModal}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors ml-1"
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="engineer@plant.industrial"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements hint - shown when user interacts */}
              {isPasswordFocused && (
                <div className="mt-2 p-2 bg-slate-900/90 rounded border border-slate-800 text-[11px] space-y-1">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>One letter</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center pt-3 text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={openLoginModal}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
