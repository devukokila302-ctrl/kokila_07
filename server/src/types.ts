export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  popularKeywords: string[];
  displayOrder: number;
}

export interface ProviderServiceItem {
  id: string;
  providerId: string;
  categoryId: string;
  serviceName: string;
  description: string;
  price: number;
  priceUnit: 'fixed' | 'hourly' | 'quote';
  estimatedDuration: string;
  isEmergencyAvailable: boolean;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  contactName: string;
  avatarUrl: string;
  phone: string;
  bio: string;
  primaryCategoryId: string;
  experienceYears: number;
  latitude: number;
  longitude: number;
  address: string;
  serviceRadiusKm: number;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  phoneVerified: boolean;
  profileComplete: boolean;
  servicesAdded: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  isDemo: boolean;
  services: ProviderServiceItem[];
  createdAt: string;
}

export type BookingStatus = 'requested' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  categoryId: string;
  serviceName: string;
  problemDescription: string;
  photoUrl?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  preferredDate: string;
  preferredTime: string;
  isEmergency: boolean;
  status: BookingStatus;
  estimatedPrice: number;
  providerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  residentId: string;
  residentName: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  residentId: string;
  providerId: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  recommendedCategoryId: string;
  categoryName: string;
  problemType: string;
  urgency: 'normal' | 'emergency';
  explanation: string;
  suggestedActions: string[];
  safetyTip?: string;
}
