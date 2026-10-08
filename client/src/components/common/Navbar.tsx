import React, { useState } from 'react';
import {
  MapPin,
  Home,
  Wrench,
  Calendar,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Map as MapIcon,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { LocationModal } from './LocationModal';
import { UserRole } from '../../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSchemaModal?: () => void;
  onOpenAIModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSchemaModal,
  onOpenAIModal
}) => {
  const { user, role, signOut, loginAsDemoResident, loginAsDemoProvider } = useAuth();
  const { addressName } = useLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const residentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const providerTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'services', label: 'My Services', icon: Wrench },
    { id: 'requests', label: 'Requests', icon: Clock },
    { id: 'schedule', label: 'Schedule', icon: MapPin },
    { id: 'jobs', label: 'Jobs', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  const activeTabs = role === 'provider' ? providerTabs : residentTabs;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Top Row */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Role Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2 group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                    Service<span className="text-indigo-600">Near</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {role === 'provider' ? 'Provider Portal' : 'Resident Portal'}
                  </span>
                </div>
              </button>

              {/* Role Indicator Pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span>{role === 'provider' ? '🧰' : '🏠'}</span>
                <span className="capitalize">{role}</span>
              </div>
            </div>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 transition-all max-w-xs truncate"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="truncate">{addressName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </button>

            {/* Right Action Icons & Controls */}
            <div className="flex items-center gap-2.5">
              {/* AI Assistant button (Resident only) */}
              {role === 'resident' && onOpenAIModal && (
                <button
                  onClick={onOpenAIModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Assistant</span>
                </button>
              )}

              {/* Demo Account Dropdown (Strictly scoped to current role) */}
              <div className="relative">
                <button
                  onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-[11px] font-bold text-amber-800 transition-all flex items-center gap-1"
                >
                  <span>⚡ Demo</span>
                  <ChevronDown className="w-3 h-3 text-amber-700" />
                </button>

                {isDemoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs">
                    <p className="px-2 py-1 font-bold text-slate-400 text-[10px] uppercase">
                      {role === 'resident' ? 'Resident Account' : 'Provider Accounts'}
                    </p>

                    {role === 'resident' ? (
                      <button
                        onClick={() => {
                          loginAsDemoResident();
                          setIsDemoMenuOpen(false);
                          onSelectTab('dashboard');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-indigo-50 text-slate-800 font-semibold flex items-center gap-2"
                      >
                        <span>🏠</span>
                        <div>
                          <div>Ayesha Khan</div>
                          <div className="text-[10px] text-slate-500 font-normal">Active Resident Profile</div>
                        </div>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            loginAsDemoProvider('prov-plumb-1');
                            setIsDemoMenuOpen(false);
                            onSelectTab('dashboard');
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-violet-50 text-slate-800 font-semibold flex items-center gap-2"
                        >
                          <span>🧰</span>
                          <div>
                            <div>Apex Hydro (Vikram)</div>
                            <div className="text-[10px] text-slate-500 font-normal">Plumbing Provider</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            loginAsDemoProvider('prov-elec-1');
                            setIsDemoMenuOpen(false);
                            onSelectTab('dashboard');
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-violet-50 text-slate-800 font-semibold flex items-center gap-2"
                        >
                          <span>⚡</span>
                          <div>
                            <div>SparkSafe (Arjun)</div>
                            <div className="text-[10px] text-slate-500 font-normal">Electrical Provider</div>
                          </div>
                        </button>
                      </>
                    )}

                    {onOpenSchemaModal && (
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsDemoMenuOpen(false);
                            onOpenSchemaModal();
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 text-indigo-600 font-semibold flex items-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>View Supabase SQL</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
                    {user?.fullName?.charAt(0) || (role === 'provider' ? 'P' : 'R')}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.fullName || 'Active User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Logged in'}</p>
                    </div>
                    <button
                      onClick={() => {
                        onSelectTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2 mt-1"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Desktop Sign Out Button */}
              <button
                onClick={() => signOut()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                title="Sign out and return to role selection"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-100">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};
