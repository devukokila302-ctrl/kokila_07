import React from 'react';
import { Heart, Search } from 'lucide-react';
import { ProviderProfile } from '../../types';
import { ProviderCard } from './ProviderCard';

interface FavoritesListProps {
  favorites: string[];
  providers: ProviderProfile[];
  onToggleFavorite: (providerId: string) => void;
  onViewDetails: (provider: ProviderProfile) => void;
  onBookNow: (provider: ProviderProfile) => void;
  onExploreServices: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  providers,
  onToggleFavorite,
  onViewDetails,
  onBookNow,
  onExploreServices
}) => {
  const favoriteProviders = providers.filter(p => favorites.includes(p.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Providers</h2>
        <p className="text-xs text-slate-500 mt-0.5">Quick access to your preferred neighborhood specialists</p>
      </div>

      {favoriteProviders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">No Saved Providers Yet</h4>
          <p className="text-xs text-slate-500 mb-6">
            Click the heart icon on any provider profile to bookmark them for easy repeat booking.
          </p>
          <button
            onClick={onExploreServices}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            Find Nearby Providers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isFavorited={true}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
              onBookNow={onBookNow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
