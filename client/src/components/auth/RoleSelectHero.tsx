import React, { useState } from 'react';
import { Home, Wrench, Sparkles, MapPin, ShieldCheck, ArrowRight, Zap, CheckCircle2, Database, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserRole } from '../../types';

interface RoleSelectHeroProps {
  onSelectRole: (role: UserRole) => void;
  onOpenSchemaModal?: () => void;
}

export const RoleSelectHero: React.FC<RoleSelectHeroProps> = ({ onSelectRole, onOpenSchemaModal }) => {
  const { user, loginAsDemoResident, loginAsDemoProvider } = useAuth();
  const [modalRole, setModalRole] = useState<UserRole>('resident');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleCardClick = (targetRole: UserRole) => {
    setModalRole(targetRole);
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Service<span className="text-indigo-600">Near</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">
              HC8 Hackathon Edition
            </span>
          </div>
        </div>

        {/* Quick Auth Actions */}
        <div className="flex items-center gap-3">
          {onOpenSchemaModal && (
            <button
              onClick={onOpenSchemaModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supabase Schema</span>
            </button>
          )}

          <button
            onClick={() => {
              setModalRole('resident');
              setAuthMode('signin');
              setIsAuthModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setModalRole('resident');
              setAuthMode('signup');
              setIsAuthModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-5xl mx-auto px-4 py-10 sm:py-16 text-center">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-6 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
          <span>Local Service Provider Marketplace • OpenStreetMap + Gemini AI</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
          How would you like to use <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
            ServiceNear?
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          The verified neighborhood network connecting residents directly with certified plumbers, electricians, cleaners, and local technicians. No middlemen, transparent distances, and smart matching.
        </p>

        {/* The Two Large Cards (Core Requirement) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto text-left">
          {/* Card 1: Resident */}
          <div
            onClick={() => handleCardClick('resident')}
            className="group relative bg-white rounded-3xl p-8 border-2 border-slate-200/80 hover:border-indigo-500 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Badge */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                🏠
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Resident
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Find Services
                </span>
              </div>

              <p className="text-sm text-slate-600 font-medium mb-6">
                Find and book verified local services in your neighborhood.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Explore 12 categories of nearby verified providers</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Interactive OpenStreetMap with distance in kilometers</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>AI Service Assistant: Diagnose problems & match instantly</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>🚨 Emergency Priority Dispatch for urgent issues</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                Sign In to Resident Portal <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Find & Book</span>
            </div>
          </div>

          {/* Card 2: Service Provider */}
          <div
            onClick={() => handleCardClick('provider')}
            className="group relative bg-white rounded-3xl p-8 border-2 border-slate-200/80 hover:border-violet-500 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Badge */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div>
              <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-sm">
                🧰
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                  Service Provider
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/60">
                  Offer Services
                </span>
              </div>

              <p className="text-sm text-slate-600 font-medium mb-6">
                Offer your professional services and receive local bookings.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span>Receive direct booking requests from nearby residents</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span>Set custom service radius (5km, 10km, 20km) on map</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span>Toggle Availability status (Available / Busy / Offline)</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span>Full job workflow: Accepted → On the Way → Completed</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-violet-600 group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                Sign In to Provider Portal <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Accept Jobs</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Test Bar */}
        <div className="mt-12 p-4 max-w-3xl mx-auto rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Direct Role Login</p>
              <p className="text-[11px] text-slate-500">Click to sign in or create an account for each portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCardClick('resident')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🏠</span> Resident Login
            </button>
            <button
              onClick={() => handleCardClick('provider')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🧰</span> Provider Login
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-6 border-t border-slate-200/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 ServiceNear • Local Service Provider Marketplace</p>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span>Leaflet + OpenStreetMap</span>
          <span>•</span>
          <span>Google Gemini AI</span>
          <span>•</span>
          <span>Supabase Postgres</span>
        </div>
      </footer>

      {/* Login / Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={modalRole}
        initialMode={authMode}
        onSuccess={(authenticatedRole) => {
          setIsAuthModalOpen(false);
          onSelectRole(authenticatedRole);
        }}
      />
    </div>
  );
};
