import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
  ServiceCategory,
  ProviderProfile,
  ProviderServiceItem,
  Booking,
  Review,
  Favorite,
  BookingStatus
} from '../types.js';
import { SEED_CATEGORIES, SEED_PROVIDERS, SEED_REVIEWS } from '../data/seedData.js';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kkpqfbelzwwlmhljdcbf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_YiD_M5F9HxuSHbOJfw4Cwg_kYCtXKVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false
  }
});

// In-memory persistent fallback store with full seed data
class DataStore {
  private categories: ServiceCategory[] = [...SEED_CATEGORIES];
  private providers: ProviderProfile[] = JSON.parse(JSON.stringify(SEED_PROVIDERS));
  private bookings: Booking[] = [
    {
      id: 'book-demo-1',
      residentId: 'resident-demo-1',
      residentName: 'Ayesha Khan',
      residentPhone: '+1 (555) 789-0123',
      providerId: 'prov-plumb-1',
      providerName: 'Apex Hydro Plumbing & Drain Solutions',
      providerPhone: '+1 (555) 321-7890',
      categoryId: 'plumbing',
      serviceName: 'Emergency Pipe Leak & Tap Repair',
      problemDescription: 'Water pipe leaking under kitchen counter, spreading onto tiles.',
      address: 'Flat 402, Green Glen Apartments, Outer Ring Rd',
      latitude: 12.9750,
      longitude: 77.6010,
      preferredDate: new Date().toISOString().split('T')[0],
      preferredTime: '11:00 AM',
      isEmergency: true,
      status: 'in_progress',
      estimatedPrice: 35,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'book-demo-2',
      residentId: 'resident-demo-1',
      residentName: 'Ayesha Khan',
      residentPhone: '+1 (555) 789-0123',
      providerId: 'prov-elec-1',
      providerName: 'SparkSafe Electrical Solutions',
      providerPhone: '+1 (555) 543-9876',
      categoryId: 'electrical',
      serviceName: 'Emergency Short Circuit & MCB Trip Fix',
      problemDescription: 'Main MCB keeps tripping whenever geyser or microwave turns on.',
      address: 'Flat 402, Green Glen Apartments, Outer Ring Rd',
      latitude: 12.9750,
      longitude: 77.6010,
      preferredDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      preferredTime: '02:00 PM',
      isEmergency: false,
      status: 'completed',
      estimatedPrice: 45,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(),
    }
  ];
  private reviews: Review[] = [...SEED_REVIEWS];
  private favorites: Favorite[] = [
    {
      id: 'fav-1',
      residentId: 'resident-demo-1',
      providerId: 'prov-plumb-1',
      createdAt: new Date().toISOString()
    }
  ];

  // Categories
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (!error && data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          name: d.name,
          icon: d.icon,
          description: d.description || '',
          popularKeywords: d.popular_keywords || [],
          displayOrder: d.display_order || 0
        }));
      }
    } catch {
      // Fallback
    }
    return this.categories;
  }

  // Providers
  async getProviders(filter?: {
    categoryId?: string;
    search?: string;
    availability?: string;
    emergencyOnly?: boolean;
  }): Promise<ProviderProfile[]> {
    let result = [...this.providers];

    if (filter?.categoryId) {
      result = result.filter(
        p => p.primaryCategoryId === filter.categoryId || p.services.some(s => s.categoryId === filter.categoryId)
      );
    }

    if (filter?.availability && filter.availability !== 'all') {
      result = result.filter(p => p.availabilityStatus === filter.availability);
    }

    if (filter?.emergencyOnly) {
      result = result.filter(
        p => p.availabilityStatus === 'available' && p.services.some(s => s.isEmergencyAvailable)
      );
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p =>
        p.businessName.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.services.some(s => s.serviceName.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      );
    }

    return result;
  }

  async getProviderById(id: string): Promise<ProviderProfile | null> {
    const prov = this.providers.find(p => p.id === id || p.userId === id);
    return prov || null;
  }

  async createOrUpdateProvider(data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    const existingIndex = this.providers.findIndex(p => p.id === data.id || p.userId === data.userId);
    
    if (existingIndex >= 0) {
      const existing = this.providers[existingIndex];
      const updated: ProviderProfile = {
        ...existing,
        ...data,
        services: data.services || existing.services,
        id: existing.id,
        updatedAt: new Date().toISOString()
      } as ProviderProfile;
      this.providers[existingIndex] = updated;
      return updated;
    }

    const newProvider: ProviderProfile = {
      id: data.id || `prov-${uuidv4().slice(0, 8)}`,
      userId: data.userId || `user-${uuidv4().slice(0, 8)}`,
      businessName: data.businessName || 'Local Service Professional',
      contactName: data.contactName || 'Provider',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      phone: data.phone || '+1 (555) 000-0000',
      bio: data.bio || 'Verified service professional on ServiceNear.',
      primaryCategoryId: data.primaryCategoryId || 'plumbing',
      experienceYears: Number(data.experienceYears) || 3,
      latitude: Number(data.latitude) || 12.9716,
      longitude: Number(data.longitude) || 77.5946,
      address: data.address || 'Central District',
      serviceRadiusKm: Number(data.serviceRadiusKm) || 10,
      availabilityStatus: data.availabilityStatus || 'available',
      workingDays: data.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHoursStart: data.workingHoursStart || '08:00',
      workingHoursEnd: data.workingHoursEnd || '19:00',
      phoneVerified: true,
      profileComplete: true,
      servicesAdded: (data.services && data.services.length > 0) || false,
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      isDemo: false,
      createdAt: new Date().toISOString(),
      services: data.services || [
        {
          id: `srv-${uuidv4().slice(0, 6)}`,
          providerId: data.id || '',
          categoryId: data.primaryCategoryId || 'plumbing',
          serviceName: 'General Consultation & Repair',
          description: 'Standard inspection and repair service.',
          price: 35,
          priceUnit: 'fixed',
          estimatedDuration: '1 hour',
          isEmergencyAvailable: true
        }
      ]
    };

    // Set correct providerId on child services
    newProvider.services.forEach(s => { s.providerId = newProvider.id; });
    this.providers.unshift(newProvider);
    return newProvider;
  }

  async addProviderService(providerId: string, service: Omit<ProviderServiceItem, 'id' | 'providerId'>): Promise<ProviderServiceItem> {
    const prov = await this.getProviderById(providerId);
    if (!prov) throw new Error('Provider not found');

    const newService: ProviderServiceItem = {
      id: `srv-${uuidv4().slice(0, 8)}`,
      providerId: prov.id,
      ...service
    };

    prov.services.push(newService);
    prov.servicesAdded = true;
    return newService;
  }

  async deleteProviderService(providerId: string, serviceId: string): Promise<boolean> {
    const prov = await this.getProviderById(providerId);
    if (!prov) return false;
    prov.services = prov.services.filter(s => s.id !== serviceId);
    return true;
  }

  // Bookings
  async getBookings(filter?: { residentId?: string; providerId?: string }): Promise<Booking[]> {
    let result = [...this.bookings];
    if (filter?.residentId) {
      result = result.filter(b => b.residentId === filter.residentId);
    }
    if (filter?.providerId) {
      result = result.filter(b => b.providerId === filter.providerId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    const prov = await this.getProviderById(data.providerId);
    const newBooking: Booking = {
      id: `book-${uuidv4().slice(0, 8)}`,
      ...data,
      status: data.status || 'requested',
      providerPhone: prov ? prov.phone : '+1 (555) 123-4567',
      providerName: prov ? prov.businessName : data.providerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bookings.unshift(newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: string, status: BookingStatus, notes?: string): Promise<Booking | null> {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return null;

    booking.status = status;
    if (notes) booking.providerNotes = notes;
    booking.updatedAt = new Date().toISOString();

    // If marked completed, update provider completed jobs counter
    if (status === 'completed') {
      const prov = this.providers.find(p => p.id === booking.providerId);
      if (prov) {
        prov.completedJobs += 1;
      }
    }

    return booking;
  }

  // Reviews
  async getReviews(providerId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.providerId === providerId);
  }

  async createReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const newReview: Review = {
      id: `rev-${uuidv4().slice(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(newReview);

    // Update provider rating & reviewCount
    const prov = this.providers.find(p => p.id === data.providerId);
    if (prov) {
      const provReviews = this.reviews.filter(r => r.providerId === data.providerId);
      const totalStars = provReviews.reduce((sum, r) => sum + r.rating, 0);
      prov.reviewCount = provReviews.length;
      prov.rating = Math.round((totalStars / provReviews.length) * 10) / 10;
    }

    return newReview;
  }

  // Favorites
  async getFavorites(residentId: string): Promise<string[]> {
    return this.favorites.filter(f => f.residentId === residentId).map(f => f.providerId);
  }

  async toggleFavorite(residentId: string, providerId: string): Promise<{ isFavorited: boolean }> {
    const index = this.favorites.findIndex(f => f.residentId === residentId && f.providerId === providerId);
    if (index >= 0) {
      this.favorites.splice(index, 1);
      return { isFavorited: false };
    } else {
      this.favorites.push({
        id: `fav-${uuidv4().slice(0, 8)}`,
        residentId,
        providerId,
        createdAt: new Date().toISOString()
      });
      return { isFavorited: true };
    }
  }
}

export const db = new DataStore();
