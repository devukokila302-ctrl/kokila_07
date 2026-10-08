import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  User,
  Wrench,
  MapPin,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Phone,
  Truck,
  Zap,
  Check
} from 'lucide-react';
import { ProviderProfile, Booking, AvailabilityStatus, BookingStatus } from '../../types';

interface ProviderDashboardProps {
  provider: ProviderProfile | null;
  bookings: Booking[];
  onUpdateAvailability: (status: AvailabilityStatus) => void;
  onAcceptBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onUpdateStatus?: (bookingId: string, status: BookingStatus, notes?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  provider,
  bookings,
  onUpdateAvailability,
  onAcceptBooking,
  onRejectBooking,
  onUpdateStatus,
  onNavigateTab,
}) => {
  const [quickNotes, setQuickNotes] = useState<Record<string, string>>({});

  if (!provider) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 text-base mb-1">Set Up Your Provider Profile</h3>
        <p className="text-xs text-slate-500 mb-6">
          Create your professional profile and list your services to start receiving neighborhood bookings.
        </p>
        <button
          onClick={() => onNavigateTab('profile')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20"
        >
          Create Profile Now
        </button>
      </div>
    );
  }

  const pendingRequests = bookings.filter(b => b.status === 'requested');
  const activeJobs = bookings.filter(b => ['accepted', 'on_the_way', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'completed');

  const handleMoveClick = (bookingId: string, nextStatus: BookingStatus) => {
    if (onUpdateStatus) {
      const note = quickNotes[bookingId] || '';
      onUpdateStatus(bookingId, nextStatus, note);
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Status Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={provider.avatarUrl}
              alt={provider.businessName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl sm:text-2xl font-black">{provider.businessName}</h2>
                {provider.isDemo && (
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                    Demo Provider
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200">
                {provider.contactName} • Category: <strong className="text-white capitalize">{provider.primaryCategoryId}</strong>
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                </span>
                <span>•</span>
                <span className="text-indigo-200">Radius: {provider.serviceRadiusKm} km</span>
              </div>
            </div>
          </div>

          {/* Availability Status Switch */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-full md:w-auto">
            <span className="text-[11px] font-bold text-indigo-200 block mb-2">Live Availability Status</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['available', 'busy', 'unavailable'] as AvailabilityStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateAvailability(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    provider.availabilityStatus === st
                      ? st === 'available'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : st === 'busy'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-600 text-white shadow-sm'
                      : 'bg-white/5 text-white/70 hover:bg-white/15'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{pendingRequests.length}</span>
          <span className="text-[11px] text-amber-600 block mt-1 font-semibold">Needs your response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{activeJobs.length}</span>
          <span className="text-[11px] text-indigo-600 block mt-1 font-semibold">In progress or on route</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{completedJobs.length}</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">Successfully serviced</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Services Listed</span>
            <Wrench className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{provider.services?.length || 0}</span>
          <span className="text-[11px] text-violet-600 block mt-1 font-semibold">Active in marketplace</span>
        </div>
      </div>

      {/* ================= ACTIVE JOBS & LIVE MOVE UPDATER ================= */}
      {activeJobs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Active Jobs & Live Move Tracker</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {activeJobs.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Click moves (On the Way, In Progress, Completed) to update the resident in real time
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeJobs.map((job) => {
              const isOnTheWay = job.status === 'on_the_way';
              const isInProgress = job.status === 'in_progress';
              const isAccepted = job.status === 'accepted';

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 space-y-3.5 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{job.residentName}</span>
                        {job.isEmergency && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            🚨 EMERGENCY
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOnTheWay
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isInProgress
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          Current Move: {job.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 mt-0.5">{job.serviceName}</p>
                      <p className="text-xs text-slate-600 line-clamp-1">{job.problemDescription}</p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-900 block">${job.estimatedPrice}</span>
                      <span className="text-[11px] text-slate-500">{job.preferredDate} ({job.preferredTime})</span>
                    </div>
                  </div>

                  {/* Move action buttons for this booking */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 max-w-xs">
                      <input
                        type="text"
                        placeholder="Optional note (e.g. Arriving in 15 mins)..."
                        value={quickNotes[job.id] || ''}
                        onChange={(e) => setQuickNotes({ ...quickNotes, [job.id]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveClick(job.id, 'on_the_way')}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          isOnTheWay
                            ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                            : 'bg-white hover:bg-amber-50 border-slate-200 text-amber-900'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>On the Way</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveClick(job.id, 'in_progress')}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          isInProgress
                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                            : 'bg-white hover:bg-indigo-50 border-slate-200 text-indigo-900'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>In Progress</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveClick(job.id, 'completed')}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border bg-white hover:bg-emerald-50 border-slate-200 text-emerald-800 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incoming Requests Action Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Incoming Booking Requests</h3>
            <p className="text-xs text-slate-500">Respond quickly to nearby customers to maintain high rating</p>
          </div>
          <button
            onClick={() => onNavigateTab('requests')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All ({bookings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            No pending requests at the moment. You'll see new bookings here as residents place requests!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{req.residentName}</span>
                    {req.isEmergency && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        🚨 EMERGENCY
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-indigo-600">{req.serviceName}</p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{req.problemDescription}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>Date: {req.preferredDate} ({req.preferredTime})</span>
                    <span>•</span>
                    <span>{req.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onRejectBooking(req.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onAcceptBooking(req.id)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20"
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('profile')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all"
        >
          <User className="w-5 h-5 text-indigo-600 mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Edit Business Profile & Photo</h4>
          <p className="text-xs text-slate-500 mt-0.5">Upload your own picture or pick an avatar</p>
        </div>

        <div
          onClick={() => onNavigateTab('services')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all"
        >
          <Wrench className="w-5 h-5 text-violet-600 mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Manage Services & Rates</h4>
          <p className="text-xs text-slate-500 mt-0.5">Add specialized services, pricing, and duration</p>
        </div>

        <div
          onClick={() => onNavigateTab('schedule')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all"
        >
          <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Service Radius & Hours</h4>
          <p className="text-xs text-slate-500 mt-0.5">Adjust map radius and working availability</p>
        </div>
      </div>
    </div>
  );
};
