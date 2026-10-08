import {
  ServiceCategory,
  ProviderProfile,
  ProviderServiceItem,
  Booking,
  BookingStatus,
  Review,
  AIAnalysisResult
} from '../types';

const API_BASE = '/api';

export async function fetchCategories(): Promise<ServiceCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.error('Failed to load categories', err);
    return [];
  }
}

export async function fetchProviders(params?: {
  categoryId?: string;
  search?: string;
  availability?: string;
  emergencyOnly?: boolean;
  residentLat?: number;
  residentLng?: number;
  sortBy?: string;
}): Promise<ProviderProfile[]> {
  try {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.search) query.set('search', params.search);
    if (params?.availability) query.set('availability', params.availability);
    if (params?.emergencyOnly) query.set('emergencyOnly', 'true');
    if (params?.residentLat) query.set('residentLat', params.residentLat.toString());
    if (params?.residentLng) query.set('residentLng', params.residentLng.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/providers?${query.toString()}`);
    const data = await res.json();
    return data.providers || [];
  } catch (err) {
    console.error('Failed to load providers', err);
    return [];
  }
}

export async function fetchProviderById(id: string): Promise<{ provider: ProviderProfile; reviews: Review[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/providers/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { provider: data.provider, reviews: data.reviews || [] };
  } catch (err) {
    console.error('Failed to fetch provider detail', err);
    return null;
  }
}

export async function saveProviderProfile(profile: Partial<ProviderProfile>): Promise<ProviderProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    return data.provider || null;
  } catch (err) {
    console.error('Failed to save provider profile', err);
    return null;
  }
}

export async function addProviderService(providerId: string, service: Partial<ProviderServiceItem>): Promise<ProviderServiceItem | null> {
  try {
    const res = await fetch(`${API_BASE}/providers/${providerId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    const data = await res.json();
    return data.service || null;
  } catch (err) {
    console.error('Failed to add provider service', err);
    return null;
  }
}

export async function deleteProviderService(providerId: string, serviceId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/providers/${providerId}/services/${serviceId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Failed to delete provider service', err);
    return false;
  }
}

export async function fetchBookings(params?: { residentId?: string; providerId?: string }): Promise<Booking[]> {
  try {
    const query = new URLSearchParams();
    if (params?.residentId) query.set('residentId', params.residentId);
    if (params?.providerId) query.set('providerId', params.providerId);

    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`);
    const data = await res.json();
    return data.bookings || [];
  } catch (err) {
    console.error('Failed to fetch bookings', err);
    return [];
  }
}

export async function createBooking(bookingData: Partial<Booking>): Promise<Booking | null> {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    return data.booking || null;
  } catch (err) {
    console.error('Failed to create booking', err);
    return null;
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus, notes?: string): Promise<Booking | null> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    const data = await res.json();
    return data.booking || null;
  } catch (err) {
    console.error('Failed to update booking status', err);
    return null;
  }
}

export async function fetchReviews(providerId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews/${providerId}`);
    const data = await res.json();
    return data.reviews || [];
  } catch (err) {
    console.error('Failed to fetch reviews', err);
    return [];
  }
}

export async function submitReview(reviewData: Partial<Review>): Promise<Review | null> {
  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    return data.review || null;
  } catch (err) {
    console.error('Failed to submit review', err);
    return null;
  }
}

export async function fetchFavorites(residentId: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/favorites/${residentId}`);
    const data = await res.json();
    return data.favorites || [];
  } catch (err) {
    console.error('Failed to fetch favorites', err);
    return [];
  }
}

export async function toggleFavorite(residentId: string, providerId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ residentId, providerId })
    });
    const data = await res.json();
    return !!data.isFavorited;
  } catch (err) {
    console.error('Failed to toggle favorite', err);
    return false;
  }
}

export async function analyzeAIRequest(
  text: string,
  residentLat?: number,
  residentLng?: number
): Promise<{ analysis: AIAnalysisResult; suggestedProviders: ProviderProfile[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/ai/analyze-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, residentLat, residentLng })
    });
    const data = await res.json();
    if (data.success) {
      return { analysis: data.analysis, suggestedProviders: data.suggestedProviders || [] };
    }
    return null;
  } catch (err) {
    console.error('AI analysis request failed', err);
    return null;
  }
}

export async function analyzeAIImage(
  imageBase64: string,
  mimeType: string,
  notes?: string,
  residentLat?: number,
  residentLng?: number
): Promise<{ analysis: AIAnalysisResult; suggestedProviders: ProviderProfile[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/ai/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType, notes, residentLat, residentLng })
    });
    const data = await res.json();
    if (data.success) {
      return { analysis: data.analysis, suggestedProviders: data.suggestedProviders || [] };
    }
    return null;
  } catch (err) {
    console.error('AI image analysis failed', err);
    return null;
  }
}
