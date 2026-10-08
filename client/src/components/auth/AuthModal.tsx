import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'resident',
  initialMode = 'signin',
  onSuccess
}) => {
  const { signIn, signUp, selectRole, loginAsDemoResident, loginAsDemoProvider } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setMode(initialMode);
      setErrorMsg('');
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
    }
  }, [isOpen, defaultRole, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password, role);
        if (res.success) {
          if (onSuccess) onSuccess(role);
          onClose();
        } else {
          setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials or sign up.');
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Full name is required.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password, role, fullName, phone);
        if (res.success) {
          if (onSuccess) onSuccess(role);
          onClose();
        } else {
          setErrorMsg(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    if (role === 'resident') {
      loginAsDemoResident();
      if (onSuccess) onSuccess('resident');
      onClose();
    } else {
      await loginAsDemoProvider('prov-plumb-1');
      if (onSuccess) onSuccess('provider');
      onClose();
    }
  };

  const handlePreFillDemo = () => {
    if (role === 'resident') {
      setEmail('ayesha.khan@example.com');
      setPassword('password123');
    } else {
      setEmail('vikram.plumbing@servicenear.io');
      setPassword('password123');
    }
  };

  const isResident = role === 'resident';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden relative">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{isResident ? '🏠' : '🧰'}</span>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isResident
                  ? mode === 'signin' ? 'Resident Portal Sign In' : 'Create Resident Account'
                  : mode === 'signin' ? 'Provider Portal Sign In' : 'Register as Service Provider'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {mode === 'signin'
                ? `Sign in to access the ${isResident ? 'Resident' : 'Service Provider'} Portal`
                : `Register to access the ${isResident ? 'Resident' : 'Service Provider'} Portal`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Role Tabs & Sign In / Sign Up Mode Switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100 space-y-3">
          {/* Role Selector Pill */}
          <div className="flex rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => {
                setRole('resident');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isResident
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏠</span>
              <span>Resident Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('provider');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isResident
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🧰</span>
              <span>Provider Portal</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-all ${
                mode === 'signin'
                  ? isResident ? 'border-indigo-600 text-indigo-600' : 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-all ${
                mode === 'signup'
                  ? isResident ? 'border-indigo-600 text-indigo-600' : 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Fast Test Mode Button */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                isResident
                  ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900'
                  : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isResident ? 'text-indigo-600 fill-indigo-600' : 'text-violet-600 fill-violet-600'}`} />
              <span>
                1-Click Test Login ({isResident ? 'Resident: Ayesha Khan' : 'Provider: Vikram Sharma'})
              </span>
            </button>
            <div className="text-right">
              <button
                type="button"
                onClick={handlePreFillDemo}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline font-medium"
              >
                Pre-fill demo email & password
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isResident ? 'e.g. Ayesha Khan' : 'e.g. Vikram Sharma'}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isResident ? 'resident@example.com' : 'provider@example.com'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              isResident
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
            }`}
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : mode === 'signin' ? (
              `Sign In to ${isResident ? 'Resident' : 'Provider'} Portal`
            ) : (
              `Create ${isResident ? 'Resident' : 'Provider'} Account`
            )}
          </button>

          {/* Toggle mode helper footer */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up here"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
