import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProviderProfile, ProviderServiceItem, Review } from '../../types';
import { LeafletMap } from '../map/LeafletMap';

interface ProviderDetailModalProps {
  provider: ProviderProfile | null;
  reviews?: Review[];
  isOpen: boolean;
  onClose: () => void;
  onBookService: (provider: ProviderProfile, service?: ProviderServiceItem) => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  reviews = [],
  isOpen,
  onClose,
  onBookService
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'map'>('services');

  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        {/* Header Hero */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 sm:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={provider.avatarUrl}
              alt={provider.businessName}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-xl sm:text-2xl font-extrabold">{provider.businessName}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-400 text-emerald-950">
                  ● {provider.availabilityStatus}
                </span>
              </div>
              <p className="text-indigo-100 text-sm font-medium">
                {provider.contactName} • {provider.experienceYears} Years Professional Experience
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 font-bold bg-white/20 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>{provider.completedJobs} Completed Jobs</span>
                {provider.distanceKm !== undefined && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-emerald-200">{provider.distanceKm} km away</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Strip */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Phone Verified
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Background Checked
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Service Area {provider.serviceRadiusKm} km
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Hours: {provider.workingHoursStart} - {provider.workingHoursEnd}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'services'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Services Offered ({provider.services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'map'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Service Area Map
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'services' && (
            <div className="space-y-3">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About the Provider</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{provider.bio}</p>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bookable Services</h4>
              {provider.services?.map(service => (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-sm">{service.serviceName}</h5>
                      {service.isEmergencyAvailable && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          🚨 Emergency Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Est. Duration: {service.estimatedDuration}</p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-base font-extrabold text-slate-900">
                      ${service.price}
                      <span className="text-xs text-slate-500 font-normal"> / {service.priceUnit}</span>
                    </span>
                    <button
                      onClick={() => onBookService(provider, service)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No written reviews yet. Be the first to review after your service!
                </div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800">{rev.residentName}</span>
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Service center located at {provider.address}. Provider covers a <strong>{provider.serviceRadiusKm} km radius</strong> from their workshop.
              </p>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200">
                <LeafletMap
                  centerLat={provider.latitude}
                  centerLng={provider.longitude}
                  zoom={12}
                  radiusKm={provider.serviceRadiusKm}
                  showRadius={true}
                  providers={[provider]}
                  className="h-full w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500">Need immediate help?</span>
            <p className="text-xs font-bold text-slate-800">Dispatch directly with no upfront payment</p>
          </div>
          <button
            onClick={() => onBookService(provider)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Proceed to Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
