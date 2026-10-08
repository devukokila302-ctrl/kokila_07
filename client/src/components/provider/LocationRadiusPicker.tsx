import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Calendar, Check, Save } from 'lucide-react';
import { ProviderProfile } from '../../types';
import { LeafletMap } from '../map/LeafletMap';
import { useToast } from '../../context/ToastContext';
import { saveProviderProfile } from '../../lib/api';

interface LocationRadiusPickerProps {
  provider: ProviderProfile | null;
  onProfileUpdated: (updated: ProviderProfile) => void;
}

export const LocationRadiusPicker: React.FC<LocationRadiusPickerProps> = ({
  provider,
  onProfileUpdated
}) => {
  const { showToast } = useToast();

  const [lat, setLat] = useState(provider?.latitude || 12.9716);
  const [lng, setLng] = useState(provider?.longitude || 77.5946);
  const [radiusKm, setRadiusKm] = useState(provider?.serviceRadiusKm || 10);
  const [address, setAddress] = useState(provider?.address || 'Central Workshop, Metro Area');
  const [workingDays, setWorkingDays] = useState<string[]>(
    provider?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [hoursStart, setHoursStart] = useState(provider?.workingHoursStart || '08:00');
  const [hoursEnd, setHoursEnd] = useState(provider?.workingHoursEnd || '19:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const radiusOptions = [3, 5, 10, 15, 20, 30];
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter(d => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Math.round(pos.coords.latitude * 10000) / 10000;
          const newLng = Math.round(pos.coords.longitude * 10000) / 10000;
          setLat(newLat);
          setLng(newLng);
          setAddress(`Current Workshop Pin (${newLat}, ${newLng})`);
          showToast({
            type: 'success',
            title: 'GPS Coordinates Applied',
            message: `Updated to (${newLat}, ${newLng})`
          });
        },
        () => {
          showToast({ type: 'warning', title: 'Could not access GPS' });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setIsSubmitting(true);
    const updated = await saveProviderProfile({
      ...provider,
      latitude: lat,
      longitude: lng,
      serviceRadiusKm: radiusKm,
      address,
      workingDays,
      workingHoursStart: hoursStart,
      workingHoursEnd: hoursEnd
    });
    setIsSubmitting(false);

    if (updated) {
      showToast({
        type: 'success',
        title: 'Service Area & Schedule Saved!',
        message: `Your service radius of ${radiusKm} km is now applied across resident searches.`
      });
      onProfileUpdated(updated);
    } else {
      showToast({ type: 'error', title: 'Failed to update location' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Service Location, Radius & Schedule</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Residents within your radius can discover and book your services
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interactive Map Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Service Center Pin & Coverage Radius</h3>
              <p className="text-xs text-slate-500">
                Click anywhere on the map to set your base center. The blue circle shows your reach.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentGPS}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Device GPS</span>
            </button>
          </div>

          {/* Leaflet Map with Radius Circle */}
          <div className="h-80 rounded-2xl overflow-hidden border border-slate-200">
            <LeafletMap
              centerLat={lat}
              centerLng={lng}
              zoom={12}
              userLat={lat}
              userLng={lng}
              userLabel="Your Workshop Center"
              radiusKm={radiusKm}
              showRadius={true}
              onLocationPick={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
                showToast({
                  type: 'info',
                  title: 'Pin Placed',
                  message: `New center set to (${newLat}, ${newLng})`
                });
              }}
              className="h-full w-full"
            />
          </div>

          {/* Radius Selector Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Choose Service Radius</label>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Currently: {radiusKm} km
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {radiusOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    radiusKm === r
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Address and coordinates summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Address Label</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Center Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Center Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Working Hours */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm">Working Days & Hours</h3>

          {/* Days */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Working Days</label>
            <div className="flex items-center gap-2 flex-wrap">
              {allDays.map((d) => {
                const active = workingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-11 h-11 rounded-xl text-xs font-bold transition-all border ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Shift Start Time</label>
              <input
                type="time"
                value={hoursStart}
                onChange={(e) => setHoursStart(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Shift End Time</label>
              <input
                type="time"
                value={hoursEnd}
                onChange={(e) => setHoursEnd(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Coverage & Schedule</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
