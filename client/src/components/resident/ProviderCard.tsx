import React from 'react';
import { Star, MapPin, ShieldCheck, CheckCircle2, Clock, Phone, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { ProviderProfile } from '../../types';

interface ProviderCardProps {
  provider: ProviderProfile;
  isFavorited?: boolean;
  onToggleFavorite?: (providerId: string) => void;
  onViewDetails: (provider: ProviderProfile) => void;
  onBookNow: (provider: ProviderProfile) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isFavorited = false,
  onToggleFavorite,
  onViewDetails,
  onBookNow,
}) => {
  const isAvailable = provider.availabilityStatus === 'available';
  const isBusy = provider.availabilityStatus === 'busy';

  // Find lowest starting price among services
  const minPrice = provider.services && provider.services.length > 0
    ? Math.min(...provider.services.map(s => s.price))
    : 35;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Card Header & Badges */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              {/* Online/Available dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isAvailable ? 'bg-emerald-500' : isBusy ? 'bg-amber-500' : 'bg-slate-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                  {provider.businessName}
                </h4>
                {provider.isDemo && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {provider.contactName} • {provider.experienceYears} yrs experience
              </p>
            </div>
          </div>

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(provider.id)}
              className={`p-2 rounded-xl transition-all ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Ratings & Distance Row */}
        <div className="flex items-center justify-between text-xs mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
              <span>{provider.rating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400 font-normal">({provider.reviewCount} reviews)</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">{provider.completedJobs} jobs</span>
          </div>

          {/* Distance pill (Prompt Requirement) */}
          {provider.distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>{provider.distanceKm} km away</span>
            </div>
          )}
        </div>

        {/* Smart Match Pill & Verification Simulation (Prompt Req) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Smart match score */}
          {provider.matchPercentage && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{provider.matchPercentage}% Match</span>
            </div>
          )}

          {/* Availability badge */}
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                : isBusy
                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            ● {provider.availabilityStatus}
          </span>
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {provider.bio}
        </p>

        {/* Trust Badges Simulation (Prompt Requirement 12) */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {provider.phoneVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Phone Verified
            </span>
          )}
          {provider.profileComplete && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Profile Complete
            </span>
          )}
          {provider.servicesAdded && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
              Services Listed
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Starting Price & Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
          <span className="text-sm font-extrabold text-slate-900">${minPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(provider)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
          >
            Profile
          </button>
          <button
            onClick={() => onBookNow(provider)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
