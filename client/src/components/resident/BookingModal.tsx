import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Upload,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  DollarSign,
  FileText
} from 'lucide-react';
import { ProviderProfile, ProviderServiceItem, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { createBooking, analyzeAIRequest } from '../../lib/api';

interface BookingModalProps {
  provider: ProviderProfile | null;
  selectedService?: ProviderServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBooking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  provider,
  selectedService,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { addressName, latitude, longitude } = useLocation();
  const { showToast } = useToast();

  const [serviceName, setServiceName] = useState<string>(
    selectedService?.serviceName || provider?.services?.[0]?.serviceName || 'Standard Diagnostic & Repair'
  );
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState(addressName);
  const [preferredDate, setPreferredDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [isEmergency, setIsEmergency] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !provider) return null;

  // Selected service object
  const currentServiceObj = provider.services?.find(s => s.serviceName === serviceName) || provider.services?.[0];
  const price = currentServiceObj ? currentServiceObj.price : 40;

  // Handle Photo Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Optional AI Helper
  const handleRunAIHelper = async () => {
    if (!problemDescription.trim()) {
      showToast({
        type: 'warning',
        title: 'Enter description first',
        message: 'Please write a sentence describing the problem for AI analysis.'
      });
      return;
    }

    setIsAnalyzingAI(true);
    const res = await analyzeAIRequest(problemDescription, latitude, longitude);
    setIsAnalyzingAI(false);

    if (res?.analysis) {
      if (res.analysis.urgency === 'emergency') {
        setIsEmergency(true);
      }
      setAiTip(res.analysis.safetyTip || res.analysis.explanation);
      showToast({
        type: 'success',
        title: `AI Analysis: ${res.analysis.problemType}`,
        message: res.analysis.urgency === 'emergency' ? '🚨 Marked as Emergency Request' : 'Standard priority recommended.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      showToast({ type: 'warning', title: 'Problem description required' });
      return;
    }

    setIsSubmitting(true);
    const residentId = user?.id || 'resident-demo-1';
    const residentName = user?.fullName || 'Resident Demo';
    const residentPhone = user?.phone || '+1 (555) 789-0123';

    const bookingPayload: Partial<Booking> = {
      residentId,
      residentName,
      residentPhone,
      providerId: provider.id,
      providerName: provider.businessName,
      providerPhone: provider.phone,
      categoryId: provider.primaryCategoryId,
      serviceName,
      problemDescription,
      photoUrl: photoPreview || undefined,
      address,
      latitude,
      longitude,
      preferredDate,
      preferredTime,
      isEmergency,
      estimatedPrice: isEmergency ? price + 15 : price,
      status: 'requested'
    };

    const created = await createBooking(bookingPayload);
    setIsSubmitting(false);

    if (created) {
      showToast({
        type: 'success',
        title: 'Booking Request Sent!',
        message: `Your booking request has been sent to ${provider.businessName}.`
      });
      onSuccess(created);
      onClose();
    } else {
      showToast({
        type: 'error',
        title: 'Failed to create booking',
        message: 'Please try again.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Book Service</h3>
            <p className="text-xs text-slate-500">
              Provider: <strong className="text-indigo-600">{provider.businessName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Service</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {provider.services?.map(s => (
                <option key={s.id} value={s.serviceName}>
                  {s.serviceName} (${s.price} / {s.priceUnit})
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Service Toggle (Requirement 11) */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            isEmergency
              ? 'bg-rose-50/80 border-rose-300 shadow-sm'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <span>🚨 Emergency Priority Dispatch</span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-semibold">
                    +$15 urgent fee
                  </span>
                </div>
                <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                  Technician prioritizes this request immediately and aims to arrive in 30-45 minutes.
                </p>
              </div>
            </label>
          </div>

          {/* Problem Description with AI assistant button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Describe the Problem</label>
              <button
                type="button"
                onClick={handleRunAIHelper}
                disabled={isAnalyzingAI}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{isAnalyzingAI ? 'Analyzing...' : 'AI Assist'}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="e.g. My bathroom tap is leaking under the basin and water is pooling on the tile floor."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
            {aiTip && (
              <div className="mt-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-[11px] text-indigo-800 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>AI Safety Note:</strong> {aiTip}</span>
              </div>
            )}
          </div>

          {/* Optional Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Problem Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-3 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all">
                <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-600 font-medium">Click to attach photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={photoPreview} alt="Problem Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Service Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Address / Apartment</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Preferred Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="09:00 AM">09:00 AM - Morning</option>
                  <option value="11:00 AM">11:00 AM - Midday</option>
                  <option value="02:00 PM">02:00 PM - Afternoon</option>
                  <option value="04:30 PM">04:30 PM - Evening</option>
                  <option value="07:00 PM">07:00 PM - Late</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price Summary (No Online Payment - direct settle upon completion) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Estimated Price</span>
              <span className="font-bold text-slate-800">
                ${isEmergency ? price + 15 : price}
                <span className="text-[11px] text-slate-400 font-normal"> (Pay directly to provider after job)</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              No Advance Payment
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
              isEmergency
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
            }`}
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isEmergency ? (
              '🚨 Dispatch Emergency Booking'
            ) : (
              'Confirm Booking Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
