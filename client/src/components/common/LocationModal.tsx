import React, { useState } from 'react';
import { X, MapPin, Navigation, Check } from 'lucide-react';
import { useLocation, PRESET_LOCATIONS, LocationPreset } from '../../context/LocationContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { addressName, detectCurrentLocation, isLocating, selectPreset, setManualLocation, latitude, longitude } = useLocation();
  const [customLat, setCustomLat] = useState(latitude.toString());
  const [customLng, setCustomLng] = useState(longitude.toString());
  const [customAddress, setCustomAddress] = useState(addressName);

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setManualLocation(lat, lng, customAddress || `Coordinates (${lat}, ${lng})`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Select Your Location</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Automatic GPS button */}
          <button
            onClick={() => {
              detectCurrentLocation();
              onClose();
            }}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200/80 flex items-center justify-center gap-2 transition-all"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : 'Use Current GPS Device Location'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase">Or Select Neighborhood</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Preset list */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {PRESET_LOCATIONS.map((preset) => {
              const isSelected = Math.abs(preset.lat - latitude) < 0.005 && Math.abs(preset.lng - longitude) < 0.005;
              return (
                <button
                  key={preset.name}
                  onClick={() => {
                    selectPreset(preset);
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{preset.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              );
            })}
          </div>

          {/* Custom coordinate entry */}
          <details className="text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-700 hover:text-indigo-600 mb-2">
              Advanced: Enter Custom Latitude / Longitude
            </summary>
            <form onSubmit={handleApplyCustom} className="space-y-2 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-medium text-slate-500">Address Label</label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs"
              >
                Apply Custom Coordinates
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
};
