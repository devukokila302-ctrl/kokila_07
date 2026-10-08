import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Booking, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { submitReview } from '../../lib/api';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast({ type: 'warning', title: 'Please provide feedback in your review' });
      return;
    }

    setIsSubmitting(true);
    const reviewData: Partial<Review> = {
      bookingId: booking.id,
      residentId: user?.id || booking.residentId,
      residentName: user?.fullName || booking.residentName || 'Resident',
      providerId: booking.providerId,
      rating,
      comment
    };

    const created = await submitReview(reviewData);
    setIsSubmitting(false);

    if (created) {
      showToast({
        type: 'success',
        title: 'Review Submitted!',
        message: 'Thank you for rating your service provider.'
      });
      onSuccess(created);
      onClose();
    } else {
      showToast({ type: 'error', title: 'Failed to submit review' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Rate & Review Provider</h3>
            <p className="text-xs text-slate-500">{booking.providerName} • {booking.serviceName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">How was your service experience?</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 mt-2 block">
              {rating === 5 ? 'Excellent (5 Stars)' : rating === 4 ? 'Good (4 Stars)' : `${rating} Stars`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about the punctuality, cleanliness, quality of repair, and pricing..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Post Verified Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
