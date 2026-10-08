import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Star,
  FileText,
  User,
  ShieldCheck,
  Zap,
  Truck,
  Wrench,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Booking, BookingStatus, ProviderProfile, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchBookings, fetchProviderById } from '../../lib/api';
import { ReviewModal } from './ReviewModal';

interface MyBookingsProps {
  onBookAgain: (provider: ProviderProfile, serviceName: string) => void;
  onExploreServices: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onBookAgain, onExploreServices }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const residentId = user?.id || 'resident-demo-1';

  const loadBookings = async () => {
    const data = await fetchBookings({ residentId });
    setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBookings();
    // Live polling every 3 seconds to reflect provider move updates in real time
    const interval = setInterval(() => {
      loadBookings();
    }, 3000);
    return () => clearInterval(interval);
  }, [residentId]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadBookings();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const statusSteps: BookingStatus[] = ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed'];

  const getStepIndex = (status: BookingStatus) => {
    return statusSteps.indexOf(status);
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'active') {
      return ['requested', 'accepted', 'on_the_way', 'in_progress'].includes(b.status);
    }
    if (filterStatus === 'completed') {
      return b.status === 'completed';
    }
    return true;
  });

  const handleRepeatBooking = async (b: Booking) => {
    const provRes = await fetchProviderById(b.providerId);
    if (provRes?.provider) {
      onBookAgain(provRes.provider, b.serviceName);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Service Bookings</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time technician move tracking: Accepted, On the Way, In Progress, Completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            title="Refresh Live Status"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'active' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'completed' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Calendar className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">No bookings found</h4>
          <p className="text-xs text-slate-500 mb-6">You have no active or completed service requests in this tab.</p>
          <button
            onClick={onExploreServices}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            Explore Services & Book Now
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((b) => {
            const currentStep = getStepIndex(b.status);
            const isAccepted = b.status === 'accepted';
            const isOnTheWay = b.status === 'on_the_way';
            const isInProgress = b.status === 'in_progress';
            const isCompleted = b.status === 'completed';
            const isCancelled = b.status === 'cancelled';
            const isAcceptedOrActive = ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(b.status);

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Provider & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-100 shadow-2xs">
                      {isOnTheWay ? '🚗' : isInProgress ? '🔧' : isCompleted ? '✅' : '🧰'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{b.providerName}</h4>
                        {b.isEmergency && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            🚨 Emergency
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold">{b.serviceName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">${b.estimatedPrice}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-600'
                          : isOnTheWay
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          : isInProgress
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* ================= LIVE MOVE BEACON BANNER ================= */}
                {/* 1. On The Way Banner */}
                {isOnTheWay && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30 flex-shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                          <h5 className="font-extrabold text-sm text-amber-950">
                            Technician is On the Way!
                          </h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                            Dispatched
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-0.5 font-medium">
                          {b.providerNotes || "Your service technician is currently en route to your address."}
                        </p>
                      </div>
                    </div>
                    {b.providerPhone && (
                      <a
                        href={`tel:${b.providerPhone}`}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all self-end sm:self-auto"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Technician</span>
                      </a>
                    )}
                  </div>
                )}

                {/* 2. In Progress Banner */}
                {isInProgress && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-indigo-400 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30 flex-shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                          <h5 className="font-extrabold text-sm text-indigo-950">
                            Service is In Progress!
                          </h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-200 text-indigo-900">
                            On-Site
                          </span>
                        </div>
                        <p className="text-xs text-indigo-900 mt-0.5 font-medium">
                          {b.providerNotes || "Technician is on-site actively performing the service work."}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs self-end sm:self-auto">
                      Servicing Now
                    </span>
                  </div>
                )}

                {/* 3. Completed Banner */}
                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-emerald-950">
                            Service Completed Successfully!
                          </h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            Finished
                          </span>
                        </div>
                        <p className="text-xs text-emerald-900 mt-0.5 font-medium">
                          {b.providerNotes || "All work has been completed by your technician. Please rate your experience!"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all self-end sm:self-auto"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Rate & Review</span>
                    </button>
                  </div>
                )}

                {/* Progress Stepper Timeline */}
                {!isCancelled && (
                  <div className="py-4">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting line */}
                      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 -z-0"></div>
                      <div
                        className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-0"
                        style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
                      ></div>

                      {statusSteps.map((step, idx) => {
                        const isPassed = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        const stepIcons: Record<string, string> = {
                          requested: '1',
                          accepted: '2',
                          on_the_way: '🚗',
                          in_progress: '🔧',
                          completed: '✓'
                        };

                        const stepLabels: Record<string, string> = {
                          requested: 'Requested',
                          accepted: 'Accepted',
                          on_the_way: 'On the Way',
                          in_progress: 'In Progress',
                          completed: 'Completed'
                        };

                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                isCurrent
                                  ? step === 'on_the_way'
                                    ? 'bg-amber-500 border-amber-600 text-white ring-4 ring-amber-100 shadow-md'
                                    : step === 'in_progress'
                                    ? 'bg-indigo-600 border-indigo-700 text-white ring-4 ring-indigo-100 shadow-md'
                                    : step === 'completed'
                                    ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-100 shadow-md'
                                    : 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100'
                                  : isPassed
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}
                            >
                              {isPassed && !isCurrent ? '✓' : stepIcons[step]}
                            </div>
                            <span
                              className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${
                                isCurrent
                                  ? 'text-indigo-950 font-bold text-[11px]'
                                  : isPassed
                                  ? 'text-indigo-900 font-semibold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stepLabels[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date: <strong>{b.preferredDate}</strong> ({b.preferredTime})</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    {isAcceptedOrActive ? (
                      <a
                        href={`tel:${b.providerPhone || '+15551234567'}`}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        {b.providerPhone || '+1 (555) 321-7890'}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Disclosed upon acceptance</span>
                    )}
                  </div>
                </div>

                {/* Problem Description & Attached Photo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-700 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Your Request Notes:</span>
                    <p className="text-slate-600">{b.problemDescription}</p>
                    {b.providerNotes && (
                      <p className="text-indigo-700 font-medium mt-1">
                        <strong>Technician Note:</strong> {b.providerNotes}
                      </p>
                    )}
                  </div>
                  {b.photoUrl && (
                    <img
                      src={b.photoUrl}
                      alt="Problem"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                    />
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    Booking Ref: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">{b.id}</code>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRepeatBooking(b)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Book Again</span>
                    </button>

                    {isCompleted && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Rate & Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        booking={reviewBooking}
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        onSuccess={() => {
          loadBookings();
        }}
      />
    </div>
  );
};
