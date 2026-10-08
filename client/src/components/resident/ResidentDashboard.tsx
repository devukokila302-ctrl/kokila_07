import React, { useState } from 'react';
import {
  Search,
  MapPin,
  List,
  Map as MapIcon,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ProviderProfile, ServiceCategory } from '../../types';
import { useLocation } from '../../context/LocationContext';
import { ProviderCard } from './ProviderCard';
import { LeafletMap } from '../map/LeafletMap';

interface ResidentDashboardProps {
  categories: ServiceCategory[];
  providers: ProviderProfile[];
  favorites: string[];
  selectedCategoryId?: string;
  onSelectCategory: (catId: string) => void;
  onToggleFavorite: (provId: string) => void;
  onViewProviderDetails: (provider: ProviderProfile) => void;
  onBookProvider: (provider: ProviderProfile) => void;
  onOpenAIModal: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isEmergencyOnly: boolean;
  onToggleEmergency: (active: boolean) => void;
  availabilityFilter: string;
  onAvailabilityChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  categories,
  providers,
  favorites,
  selectedCategoryId,
  onSelectCategory,
  onToggleFavorite,
  onViewProviderDetails,
  onBookProvider,
  onOpenAIModal,
  isLoading,
  searchQuery,
  onSearchChange,
  isEmergencyOnly,
  onToggleEmergency,
  availabilityFilter,
  onAvailabilityChange,
  sortBy,
  onSortByChange,
}) => {
  const { latitude, longitude, addressName } = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="space-y-6">
      {/* AI Assistant Banner (Requirement 9 & 10) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10 border border-indigo-700/50">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart AI Service Assistant</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">
              Unsure what kind of technician you need?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Describe your issue or snap a photo of a leak, circuit break, or appliance. Gemini AI diagnoses the problem and automatically finds the best-matched local providers.
            </p>
          </div>

          <button
            onClick={onOpenAIModal}
            className="px-6 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 transition-all flex items-center gap-2 flex-shrink-0 group"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
            <span>Launch AI Assistant</span>
            <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Emergency Service Banner (Requirement 11) */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isEmergencyOnly
          ? 'bg-rose-50 border-rose-300 shadow-md shadow-rose-500/10'
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
            isEmergencyOnly ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
          }`}>
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Emergency Dispatch Mode</h3>
              {isEmergencyOnly && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Only show providers available right now for rapid 30-45 minute dispatch.
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleEmergency(!isEmergencyOnly)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isEmergencyOnly
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30'
              : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200'
          }`}
        >
          <span>{isEmergencyOnly ? 'Turn Off Emergency Filter' : '🚨 Activate Emergency Mode'}</span>
        </button>
      </div>

      {/* Search & Category Pills Strip */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by service name, technician name, or problem keyword..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Category Filter Pills (All 12) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              !selectedCategoryId
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Services ({categories.length})
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategoryId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: Sort By, Availability & Map/List Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Availability filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="p-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Availability: All</option>
            <option value="available">Available Now</option>
            <option value="busy">Busy</option>
          </select>

          {/* Sort By (Prompt Requirement: service match + distance + availability + rating + experience) */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="p-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="match">Sort: Best Smart Match</option>
            <option value="distance">Sort: Nearest Distance</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="experience">Sort: Most Experience</option>
          </select>

          <span className="text-xs text-slate-500 font-medium ml-2">
            Showing <strong>{providers.length}</strong> providers near {addressName.split(',')[0]}
          </span>
        </div>

        {/* Map / List View Toggle (Requirement 4) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Main Content: Map or Provider Cards */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <div>Loading neighborhood service providers...</div>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">No providers found</h4>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search terms, changing the category, or turning off the emergency filter.
          </p>
          <button
            onClick={() => {
              onSelectCategory('');
              onSearchChange('');
              onToggleEmergency(false);
              onAvailabilityChange('all');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        /* Leaflet + OpenStreetMap Map View */
        <div className="space-y-3">
          <div className="h-[550px] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            <LeafletMap
              centerLat={latitude}
              centerLng={longitude}
              zoom={13}
              userLat={latitude}
              userLng={longitude}
              userLabel="Your Home Location"
              providers={providers}
              onSelectProvider={onViewProviderDetails}
              className="h-full w-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Click on any provider marker to view distance, rating, and directly book service.
          </p>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              isFavorited={favorites.includes(p.id)}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewProviderDetails}
              onBookNow={onBookProvider}
            />
          ))}
        </div>
      )}
    </div>
  );
};
