import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { ProviderProfile, Review } from '../../types';

interface ProviderReviewsListProps {
  provider: ProviderProfile | null;
  reviews: Review[];
}

export const ProviderReviewsList: React.FC<ProviderReviewsListProps> = ({
  provider,
  reviews
}) => {
  if (!provider) {
    return <div className="text-center py-12 text-slate-500 text-xs">Profile not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Ratings & Reviews</h2>
        <p className="text-xs text-slate-500 mt-0.5">Feedback from verified completed bookings</p>
      </div>

      {/* Rating Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-amber-600">{provider.rating.toFixed(1)}</span>
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{provider.businessName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on {provider.reviewCount} customer reviews • {provider.completedJobs} completed jobs
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <span>✓ 100% Verified Neighborhood Residents</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No customer reviews yet. Once you complete service jobs, resident reviews will appear here.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{rev.residentName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-amber-500 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
