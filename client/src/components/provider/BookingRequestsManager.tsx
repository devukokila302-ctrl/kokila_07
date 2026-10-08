import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Truck,
  Wrench,
  Check,
  X,
  FileText,
  User,
  DollarSign,
  ArrowRight,
  Send,
  Zap
} from 'lucide-react';
import { Booking, BookingStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { updateBookingStatus } from '../../lib/api';

interface BookingRequestsManagerProps {
  bookings: Booking[];
  onRefreshBookings: () => void;
}

export const BookingRequestsManager: React.FC<BookingRequestsManagerProps> = ({
  bookings,
  onRefreshBookings
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'requested' | 'active' | 'completed'>('requested');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'requested') return b.status === 'requested';
    if (activeTab === 'active') return ['accepted', 'on_the_way', 'in_progress'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'completed';
    return true;
  });

  const handleStatusTransition = async (bookingId: string, nextStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    const note = noteInputs[bookingId] || '';
    const updated = await updateBookingStatus(bookingId, nextStatus, note);
    setUpdatingId(null);

    if (updated) {
      const statusTitle = nextStatus === 'on_the_way'
        ? 'Technician On the Way'
        : nextStatus === 'in_progress'
        ? 'Work In Progress'
        : nextStatus === 'completed'
        ? 'Job Marked Completed'
        : nextStatus.replace(/_/g, ' ');

      showToast({
        type: 'success',
        title: `Move Updated: ${statusTitle}`,
        message: 'This update is now broadcast live to the resident portal.'
      });
      setNoteInputs(prev => ({ ...prev, [bookingId]: '' }));
      onRefreshBookings();
    } else {
      showToast({ type: 'error', title: 'Failed to update status' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Booking Requests & Job Moves</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept bookings and update live moves (On the Way, In Progress, Completed) for residents
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('requested')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'requested' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Pending ({bookings.filter(b => b.status === 'requested').length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'active' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Active Jobs ({bookings.filter(b => ['accepted', 'on_the_way', 'in_progress'].includes(b.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'completed' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No bookings found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isPending = b.status === 'requested';
            const isAccepted = b.status === 'accepted';
            const isOnTheWay = b.status === 'on_the_way';
            const isInProgress = b.status === 'in_progress';
            const isCompleted = b.status === 'completed';
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Resident Info & Current Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{b.residentName}</h4>
                      {b.isEmergency && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          🚨 URGENT EMERGENCY
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">{b.serviceName}</span>
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
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isInProgress
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Requested: <strong>{b.preferredDate}</strong> at {b.preferredTime}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <a href={`tel:${b.residentPhone}`} className="text-indigo-600 font-bold hover:underline">
                      {b.residentPhone || '+1 (555) 789-0123'}
                    </a>
                  </div>
                </div>

                {/* Problem Description & Attached Image */}
                <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">Problem Notes from Resident:</span>
                    <p className="text-slate-600">{b.problemDescription}</p>
                    {b.providerNotes && (
                      <p className="text-indigo-700 font-medium pt-1">
                        <strong>Last update to customer:</strong> "{b.providerNotes}"
                      </p>
                    )}
                  </div>
                  {b.photoUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={b.photoUrl}
                        alt="Problem attached"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                {/* ================= MOVE UPDATE OPTIONS ================= */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {/* Pending Request Action: Accept or Decline */}
                  {isPending && (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium">
                        New request pending. Accept to start dispatching moves.
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusTransition(b.id, 'cancelled')}
                          disabled={updatingId === b.id}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleStatusTransition(b.id, 'accepted')}
                          disabled={updatingId === b.id}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20"
                        >
                          Accept Booking
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active / Accepted Move Controls: On the Way, In Progress, Completed */}
                  {!isPending && !isCancelled && (
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Update Job Move (Broadcasts live to resident):</span>
                        </span>

                        {/* Optional customer update note input */}
                        <div className="flex items-center gap-2 w-full sm:w-auto sm:max-w-xs">
                          <input
                            type="text"
                            placeholder="Add note (e.g. Arriving in 10 mins)..."
                            value={noteInputs[b.id] || ''}
                            onChange={(e) => setNoteInputs({ ...noteInputs, [b.id]: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* The 3 Explicit Move Buttons: On the Way, In Progress, Completed */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Move 1: On the Way */}
                        <button
                          type="button"
                          onClick={() => handleStatusTransition(b.id, 'on_the_way')}
                          disabled={updatingId === b.id}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                            isOnTheWay
                              ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-300'
                              : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                          <span>On the Way</span>
                          {isOnTheWay && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                        </button>

                        {/* Move 2: In Progress */}
                        <button
                          type="button"
                          onClick={() => handleStatusTransition(b.id, 'in_progress')}
                          disabled={updatingId === b.id}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                            isInProgress
                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-300'
                              : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
                          }`}
                        >
                          <Wrench className="w-4 h-4" />
                          <span>In Progress</span>
                          {isInProgress && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                        </button>

                        {/* Move 3: Completed */}
                        <button
                          type="button"
                          onClick={() => handleStatusTransition(b.id, 'completed')}
                          disabled={updatingId === b.id}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                          {isCompleted && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="text-xs text-slate-400 italic">
                      This booking was declined or cancelled.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
