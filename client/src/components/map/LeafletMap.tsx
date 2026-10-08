import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ProviderProfile } from '../../types';

// Fix Leaflet's default icon path issues with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  providers?: ProviderProfile[];
  userLat?: number;
  userLng?: number;
  userLabel?: string;
  selectedProviderId?: string;
  onSelectProvider?: (provider: ProviderProfile) => void;
  onLocationPick?: (lat: number, lng: number) => void;
  radiusKm?: number;
  showRadius?: boolean;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  centerLat,
  centerLng,
  zoom = 13,
  providers = [],
  userLat,
  userLng,
  userLabel = 'Your Location',
  selectedProviderId,
  onSelectProvider,
  onLocationPick,
  radiusKm,
  showRadius = false,
  className = 'h-96 w-full rounded-2xl'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([centerLat, centerLng], zoom);

      // OpenStreetMap tile layer (Strictly Leaflet + OSM, No Google Maps)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Markers Layer
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map clicks if picking location
      if (onLocationPick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const lat = Math.round(e.latlng.lat * 10000) / 10000;
          const lng = Math.round(e.latlng.lng * 10000) / 10000;
          onLocationPick(lat, lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center update
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom, { animate: true });
    }
  }, [centerLat, centerLng, zoom]);

  // Update Markers & Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. User Marker (Resident or Center Pin)
    if (userLat !== undefined && userLng !== undefined) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            background: #4f46e5;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">
            🏠
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const userMarker = L.marker([userLat, userLng], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <p style="font-weight: 700; color: #1e1b4b; margin: 0 0 4px;">${userLabel}</p>
          <span style="font-size: 11px; color: #64748b;">Latitude: ${userLat.toFixed(4)}, Longitude: ${userLng.toFixed(4)}</span>
        </div>
      `);
      markersLayer.addLayer(userMarker);
    }

    // 2. Service Radius Circle if requested
    if (showRadius && radiusKm && centerLat && centerLng) {
      if (circleRef.current) {
        markersLayer.removeLayer(circleRef.current);
      }
      circleRef.current = L.circle([centerLat, centerLng], {
        color: '#6366f1',
        fillColor: '#818cf8',
        fillOpacity: 0.15,
        radius: radiusKm * 1000 // meters
      });
      markersLayer.addLayer(circleRef.current);
    }

    // 3. Provider Markers
    providers.forEach(p => {
      const isSelected = p.id === selectedProviderId;
      const isAvailable = p.availabilityStatus === 'available';

      const providerIcon = L.divIcon({
        className: 'custom-provider-marker',
        html: `
          <div style="
            background: ${isSelected ? '#e11d48' : isAvailable ? '#10b981' : '#64748b'};
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            border: 2px solid white;
            font-weight: 700;
            font-size: 11px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.2s;
          ">
            <span>🧰</span>
            <span>${p.businessName.slice(0, 15)}</span>
            <span style="background: rgba(0,0,0,0.25); padding: 1px 4px; border-radius: 10px;">★ ${p.rating}</span>
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: providerIcon });

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'Inter, system-ui, sans-serif';
      popupContent.style.padding = '8px';
      popupContent.style.minWidth = '200px';

      popupContent.innerHTML = `
        <div style="margin-bottom: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <strong style="font-size: 13px; color: #0f172a;">${p.businessName}</strong>
            <span style="font-size: 11px; font-weight: 700; color: #eab308;">★ ${p.rating}</span>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0 6px;">${p.contactName} • ${p.experienceYears} yrs exp</p>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
            <span style="
              background: ${isAvailable ? '#dcfce7' : '#f1f5f9'};
              color: ${isAvailable ? '#15803d' : '#475569'};
              padding: 2px 6px;
              border-radius: 999px;
              font-weight: 600;
              text-transform: capitalize;
            ">● ${p.availabilityStatus}</span>
            ${p.distanceKm !== undefined ? `<span style="color: #6366f1; font-weight: 600;">${p.distanceKm} km away</span>` : ''}
          </div>
        </div>
      `;

      if (onSelectProvider) {
        const btn = document.createElement('button');
        btn.innerText = 'Select / View Services';
        btn.style.width = '100%';
        btn.style.marginTop = '6px';
        btn.style.padding = '6px 10px';
        btn.style.background = '#4f46e5';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
        btn.style.borderRadius = '8px';
        btn.style.fontSize = '12px';
        btn.style.fontWeight = '600';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
          onSelectProvider(p);
        };
        popupContent.appendChild(btn);
      }

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectProvider) onSelectProvider(p);
      });

      markersLayer.addLayer(marker);
    });

  }, [providers, userLat, userLng, userLabel, selectedProviderId, showRadius, radiusKm, centerLat, centerLng]);

  return (
    <div className={`relative overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      {/* Map watermark badge */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-600 shadow border border-slate-200/80 pointer-events-none flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Leaflet + OpenStreetMap</span>
      </div>
    </div>
  );
};
