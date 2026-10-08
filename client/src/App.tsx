import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLocation } from './context/LocationContext';
import { useToast } from './context/ToastContext';
import {
  ServiceCategory,
  ProviderProfile,
  ProviderServiceItem,
  Booking,
  BookingStatus,
  Review,
  AvailabilityStatus
} from './types';
import {
  fetchCategories,
  fetchProviders,
  fetchBookings,
  fetchFavorites,
  toggleFavorite,
  fetchReviews,
  updateBookingStatus,
  saveProviderProfile
} from './lib/api';

// Components
import { RoleSelectHero } from './components/auth/RoleSelectHero';
import { Navbar } from './components/common/Navbar';
import { SchemaModal } from './components/common/SchemaModal';
import { ProfileView } from './components/common/ProfileView';

// Resident Components
import { ResidentDashboard } from './components/resident/ResidentDashboard';
import { ServiceBrowser } from './components/resident/ServiceBrowser';
import { MyBookings } from './components/resident/MyBookings';
import { FavoritesList } from './components/resident/FavoritesList';
import { ProviderDetailModal } from './components/resident/ProviderDetailModal';
import { BookingModal } from './components/resident/BookingModal';
import { AIAssistantModal } from './components/resident/AIAssistantModal';
import { LeafletMap } from './components/map/LeafletMap';

// Provider Components
import { ProviderDashboard } from './components/provider/ProviderDashboard';
import { ProfileEditor } from './components/provider/ProfileEditor';
import { ServicesManager } from './components/provider/ServicesManager';
import { LocationRadiusPicker } from './components/provider/LocationRadiusPicker';
import { BookingRequestsManager } from './components/provider/BookingRequestsManager';
import { ProviderReviewsList } from './components/provider/ProviderReviewsList';

export const AppContent: React.FC = () => {
  const { user, role, selectRole, providerProfile, refreshProviderProfile } = useAuth();
  const { latitude, longitude } = useLocation();
  const { showToast } = useToast();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Core Data State
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(true);

  // Search & Filter State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEmergencyOnly, setIsEmergencyOnly] = useState<boolean>(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('match');

  // Modals State
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState<ProviderProfile | null>(null);
  const [providerDetailReviews, setProviderDetailReviews] = useState<Review[]>([]);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<ProviderProfile | null>(null);
  const [bookingPreselectedService, setBookingPreselectedService] = useState<ProviderServiceItem | null>(null);

  // Load initial Categories
  useEffect(() => {
    async function loadInitial() {
      const cats = await fetchCategories();
      setCategories(cats);
    }
    loadInitial();
  }, []);

  // Load Providers with active filters & coordinates
  const loadProviders = async () => {
    setIsLoadingProviders(true);
    const data = await fetchProviders({
      categoryId: selectedCategoryId || undefined,
      search: searchQuery || undefined,
      availability: availabilityFilter !== 'all' ? availabilityFilter : undefined,
      emergencyOnly: isEmergencyOnly,
      residentLat: latitude,
      residentLng: longitude,
      sortBy
    });
    setProviders(data);
    setIsLoadingProviders(false);
  };

  useEffect(() => {
    loadProviders();
  }, [selectedCategoryId, searchQuery, isEmergencyOnly, availabilityFilter, sortBy, latitude, longitude]);

  // Load Bookings
  const loadBookingsData = async () => {
    if (role === 'resident') {
      const data = await fetchBookings({ residentId: user?.id || 'resident-demo-1' });
      setBookings(data);
    } else if (role === 'provider') {
      const provId = providerProfile?.id || user?.id || 'prov-plumb-1';
      const data = await fetchBookings({ providerId: provId });
      setBookings(data);
    }
  };

  useEffect(() => {
    loadBookingsData();
    const interval = setInterval(() => {
      loadBookingsData();
    }, 3000);
    return () => clearInterval(interval);
  }, [role, user, providerProfile]);

  // Load Favorites (Resident only)
  useEffect(() => {
    if (role === 'resident') {
      fetchFavorites(user?.id || 'resident-demo-1').then(setFavorites);
    }
  }, [role, user]);

  // Load Provider Reviews
  useEffect(() => {
    if (role === 'provider' && providerProfile) {
      fetchReviews(providerProfile.id).then(setReviews);
    }
  }, [role, providerProfile]);

  // Handlers
  const handleToggleFavorite = async (providerId: string) => {
    const res = await toggleFavorite(user?.id || 'resident-demo-1', providerId);
    if (res) {
      setFavorites(prev => [...prev, providerId]);
      showToast({ type: 'success', title: 'Added to Favorites' });
    } else {
      setFavorites(prev => prev.filter(id => id !== providerId));
      showToast({ type: 'info', title: 'Removed from Favorites' });
    }
  };

  const handleOpenProviderDetail = async (provider: ProviderProfile) => {
    setSelectedProviderForDetail(provider);
    const revs = await fetchReviews(provider.id);
    setProviderDetailReviews(revs);
  };

  const handleStartBooking = (provider: ProviderProfile, service?: ProviderServiceItem | null) => {
    setSelectedProviderForBooking(provider);
    setBookingPreselectedService(service || null);
  };

  const handleUpdateAvailability = async (newStatus: AvailabilityStatus) => {
    if (!providerProfile) return;
    const updated = await saveProviderProfile({
      ...providerProfile,
      availabilityStatus: newStatus
    });
    if (updated) {
      refreshProviderProfile();
      loadProviders();
      showToast({
        type: 'success',
        title: `Availability changed to ${newStatus}`,
        message: 'Your live status has been updated in resident search.'
      });
    }
  };

  const handleProviderAccept = async (bookingId: string) => {
    const updated = await updateBookingStatus(bookingId, 'accepted', 'Technician confirmed request');
    if (updated) {
      loadBookingsData();
      showToast({
        type: 'success',
        title: 'Booking Accepted',
        message: 'Customer has been notified in their dashboard.'
      });
    }
  };

  const handleProviderReject = async (bookingId: string) => {
    const updated = await updateBookingStatus(bookingId, 'cancelled', 'Technician is fully booked');
    if (updated) {
      loadBookingsData();
      showToast({ type: 'info', title: 'Booking Declined' });
    }
  };

  const handleProviderUpdateStatus = async (bookingId: string, status: BookingStatus, notes?: string) => {
    const updated = await updateBookingStatus(bookingId, status, notes);
    if (updated) {
      loadBookingsData();
      showToast({
        type: 'success',
        title: `Move Updated: ${status.replace(/_/g, ' ')}`,
        message: 'Status change broadcast live to resident.'
      });
    }
  };

  // 1. If no role chosen yet, display First Screen (Prompt Requirement 3)
  if (!role) {
    return (
      <>
        <RoleSelectHero
          onSelectRole={(r) => {
            selectRole(r);
            setCurrentTab('dashboard');
          }}
          onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        />
        <SchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
        />
      </>
    );
  }

  // 2. Render Portal (Resident or Provider)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* ================= RESIDENT PORTAL ================= */}
        {role === 'resident' && (
          <>
            {currentTab === 'dashboard' && (
              <ResidentDashboard
                categories={categories}
                providers={providers}
                favorites={favorites}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onToggleFavorite={handleToggleFavorite}
                onViewProviderDetails={handleOpenProviderDetail}
                onBookProvider={(p) => handleStartBooking(p)}
                onOpenAIModal={() => setIsAIModalOpen(true)}
                isLoading={isLoadingProviders}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isEmergencyOnly={isEmergencyOnly}
                onToggleEmergency={setIsEmergencyOnly}
                availabilityFilter={availabilityFilter}
                onAvailabilityChange={setAvailabilityFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
              />
            )}

            {currentTab === 'services' && (
              <ServiceBrowser
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(catId) => {
                  setSelectedCategoryId(catId);
                  setCurrentTab('dashboard');
                }}
              />
            )}

            {currentTab === 'map' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Service Map</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Explore nearby service providers across your city on OpenStreetMap
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    {providers.length} Local Providers Found
                  </span>
                </div>
                <div className="h-[650px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                  <LeafletMap
                    centerLat={latitude}
                    centerLng={longitude}
                    zoom={13}
                    userLat={latitude}
                    userLng={longitude}
                    userLabel="Your Current Location"
                    providers={providers}
                    onSelectProvider={handleOpenProviderDetail}
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}

            {currentTab === 'bookings' && (
              <MyBookings
                onBookAgain={(prov, sName) => {
                  const sObj = prov.services?.find(s => s.serviceName === sName);
                  handleStartBooking(prov, sObj);
                }}
                onExploreServices={() => setCurrentTab('dashboard')}
              />
            )}

            {currentTab === 'favorites' && (
              <FavoritesList
                favorites={favorites}
                providers={providers}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={handleOpenProviderDetail}
                onBookNow={(p) => handleStartBooking(p)}
                onExploreServices={() => setCurrentTab('dashboard')}
              />
            )}

            {currentTab === 'profile' && <ProfileView />}
          </>
        )}

        {/* ================= PROVIDER PORTAL ================= */}
        {role === 'provider' && (
          <>
            {currentTab === 'dashboard' && (
              <ProviderDashboard
                provider={providerProfile}
                bookings={bookings}
                onUpdateAvailability={handleUpdateAvailability}
                onAcceptBooking={handleProviderAccept}
                onRejectBooking={handleProviderReject}
                onUpdateStatus={handleProviderUpdateStatus}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileEditor
                categories={categories}
                provider={providerProfile}
                onProfileUpdated={() => {
                  refreshProviderProfile();
                  loadProviders();
                }}
              />
            )}

            {currentTab === 'services' && (
              <ServicesManager
                categories={categories}
                provider={providerProfile}
                onRefreshProvider={() => {
                  refreshProviderProfile();
                  loadProviders();
                }}
              />
            )}

            {currentTab === 'requests' && (
              <BookingRequestsManager
                bookings={bookings}
                onRefreshBookings={loadBookingsData}
              />
            )}

            {currentTab === 'schedule' && (
              <LocationRadiusPicker
                provider={providerProfile}
                onProfileUpdated={() => {
                  refreshProviderProfile();
                  loadProviders();
                }}
              />
            )}

            {currentTab === 'jobs' && (
              <BookingRequestsManager
                bookings={bookings}
                onRefreshBookings={loadBookingsData}
              />
            )}

            {currentTab === 'reviews' && (
              <ProviderReviewsList
                provider={providerProfile}
                reviews={reviews}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <ProviderDetailModal
        provider={selectedProviderForDetail}
        reviews={providerDetailReviews}
        isOpen={!!selectedProviderForDetail}
        onClose={() => setSelectedProviderForDetail(null)}
        onBookService={(prov, s) => {
          setSelectedProviderForDetail(null);
          handleStartBooking(prov, s);
        }}
      />

      <BookingModal
        provider={selectedProviderForBooking}
        selectedService={bookingPreselectedService}
        isOpen={!!selectedProviderForBooking}
        onClose={() => setSelectedProviderForBooking(null)}
        onSuccess={() => {
          loadBookingsData();
          setCurrentTab('bookings');
        }}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSelectProviderToBook={(prov, problemDesc, isEmerg) => {
          setSelectedProviderForBooking(prov);
        }}
      />

      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      {/* Modern Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ServiceNear • Local Service Provider Marketplace</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Powered by Leaflet + OpenStreetMap</span>
            <span>•</span>
            <span>Google Gemini AI</span>
            <span>•</span>
            <span>Supabase Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
