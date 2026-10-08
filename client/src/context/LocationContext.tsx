import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

export interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: LocationPreset[] = [
  { name: 'Central Tech Hub (Indiranagar / MG Rd)', lat: 12.9716, lng: 77.5946 },
  { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield Tech Corridor', lat: 12.9698, lng: 77.7500 },
  { name: 'San Francisco, Downtown', lat: 37.7749, lng: -122.4194 },
  { name: 'New York (Manhattan)', lat: 40.7128, lng: -74.0060 },
  { name: 'London (City Center)', lat: 51.5074, lng: -0.1278 }
];

interface LocationContextType {
  latitude: number;
  longitude: number;
  addressName: string;
  isLocating: boolean;
  detectCurrentLocation: () => void;
  setManualLocation: (lat: number, lng: number, addressName: string) => void;
  selectPreset: (preset: LocationPreset) => void;
  calculateDistance: (destLat: number, destLng: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  // Default to central seed coordinate
  const [latitude, setLatitude] = useState<number>(() => {
    const saved = localStorage.getItem('sn_user_lat');
    return saved ? parseFloat(saved) : 12.9716;
  });
  const [longitude, setLongitude] = useState<number>(() => {
    const saved = localStorage.getItem('sn_user_lng');
    return saved ? parseFloat(saved) : 77.5946;
  });
  const [addressName, setAddressName] = useState<string>(() => {
    return localStorage.getItem('sn_user_address') || 'Central Tech Hub, Metro Area';
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sn_user_lat', latitude.toString());
    localStorage.setItem('sn_user_lng', longitude.toString());
    localStorage.setItem('sn_user_address', addressName);
  }, [latitude, longitude, addressName]);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast({
        type: 'warning',
        title: 'Geolocation not supported',
        message: 'Your browser does not support automatic location detection. Please select a city manually.'
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setLatitude(lat);
        setLongitude(lng);
        setAddressName(`My Current GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        setIsLocating(false);
        showToast({
          type: 'success',
          title: 'Location Updated',
          message: `Accurate GPS coordinates set to (${lat}, ${lng}).`
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        showToast({
          type: 'info',
          title: 'Using Preset Location',
          message: 'Could not access GPS. We kept your active city location active.'
        });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const setManualLocation = (lat: number, lng: number, address: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddressName(address);
    showToast({
      type: 'info',
      title: 'Location Changed',
      message: `Updated to ${address}`
    });
  };

  const selectPreset = (preset: LocationPreset) => {
    setManualLocation(preset.lat, preset.lng, preset.name);
  };

  const calculateDistance = (destLat: number, destLng: number): number => {
    const R = 6371; // km
    const dLat = (destLat - latitude) * (Math.PI / 180);
    const dLon = (destLng - longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latitude * (Math.PI / 180)) * Math.cos(destLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  return (
    <LocationContext.Provider
      value={{
        latitude,
        longitude,
        addressName,
        isLocating,
        detectCurrentLocation,
        setManualLocation,
        selectPreset,
        calculateDistance
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
