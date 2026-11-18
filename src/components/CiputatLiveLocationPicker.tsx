import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Info, 
  RefreshCw, 
  Maximize2,
  Minimize2,
  Building,
  Globe
} from 'lucide-react';
import { KelurahanCiputat, ThemeAccent } from '../types';
import { CIPUTAT_KELURAHAN_LIST, CIPUTAT_LANDMARKS } from '../data/mockReports';
import { 
  useUserLiveLocation, 
  findNearestKelurahan, 
  findNearestLandmark
} from '../hooks/useUserLiveLocation';
import { getThemeColors } from '../utils/themeColors';

interface CiputatLiveLocationPickerProps {
  selectedCoords: { lat: number; lng: number };
  onCoordsChange: (coords: { lat: number; lng: number }) => void;
  kelurahan: KelurahanCiputat;
  onKelurahanChange: (k: KelurahanCiputat) => void;
  locationName: string;
  onLocationNameChange: (name: string) => void;
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

// Center of Ciputat, Tangerang Selatan
const DEFAULT_CIPUTAT_CENTER: [number, number] = [-6.3138, 106.7431];

// Tile Layer URLs
const TILE_LAYERS = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

export const CiputatLiveLocationPicker: React.FC<CiputatLiveLocationPickerProps> = ({
  selectedCoords,
  onCoordsChange,
  kelurahan,
  onKelurahanChange,
  locationName,
  onLocationNameChange,
  elderlyMode,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);
  const liveLocation = useUserLiveLocation();
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [isSyncingWithUser, setIsSyncingWithUser] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const incidentMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);

  // Latest prop/state refs for Leaflet event listeners initialized once
  const locationNameRef = useRef(locationName);
  locationNameRef.current = locationName;
  const onCoordsChangeRef = useRef(onCoordsChange);
  onCoordsChangeRef.current = onCoordsChange;
  const onKelurahanChangeRef = useRef(onKelurahanChange);
  onKelurahanChangeRef.current = onKelurahanChange;
  const onLocationNameChangeRef = useRef(onLocationNameChange);
  onLocationNameChangeRef.current = onLocationNameChange;

  // Custom SVG DivIcon for Incident Target Pin (Draggable)
  const createIncidentIcon = () => {
    return L.divIcon({
      className: 'custom-incident-pin',
      html: `
        <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="background: #e11d48; color: white; padding: 4px 9px; border-radius: 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(225,29,72,0.45); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>Titik Kejadian</span>
          </div>
          <div style="width: 12px; height: 12px; background: #e11d48; transform: rotate(45deg); margin-top: -6px; border-right: 2px solid white; border-bottom: 2px solid white;"></div>
          <div style="width: 10px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; filter: blur(1.5px); margin-top: 1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });
  };

  // Custom SVG DivIcon for User Real-Time Live Location Pin (Blue Pulse)
  const createUserLiveIcon = () => {
    return L.divIcon({
      className: 'custom-user-live-pin',
      html: `
        <div style="transform: translate(-50%, -50%); position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(2, 132, 199, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #0284c7; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.4);"></div>
          <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1px solid #38bdf8; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            Posisi Anda
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialLat = selectedCoords.lat || DEFAULT_CIPUTAT_CENTER[0];
    const initialLng = selectedCoords.lng || DEFAULT_CIPUTAT_CENTER[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
    });

    // Add Tile Layer
    const tileConfig = TILE_LAYERS[mapType];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Incident Marker (Draggable)
    const incidentMarker = L.marker([initialLat, initialLng], {
      icon: createIncidentIcon(),
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);

    incidentMarker.on('dragend', (event) => {
      const marker = event.target;
      const position = marker.getLatLng();
      const newLat = Number(position.lat.toFixed(5));
      const newLng = Number(position.lng.toFixed(5));
      onCoordsChangeRef.current({ lat: newLat, lng: newLng });

      // Auto update nearest Kelurahan & Landmark suggestion if not customized
      const nearestKel = findNearestKelurahan(newLat, newLng);
      onKelurahanChangeRef.current(nearestKel);
      const nearestLm = findNearestLandmark(newLat, newLng);
      const currentName = locationNameRef.current;
      if (
        !currentName.trim() ||
        currentName.startsWith('Dekat ') ||
        currentName.startsWith('Posisi Saya:')
      ) {
        onLocationNameChangeRef.current(`Dekat ${nearestLm}`);
      }
    });

    incidentMarkerRef.current = incidentMarker;

    // Handle Map Click to place incident marker manually
    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickLat = Number(e.latlng.lat.toFixed(5));
      const clickLng = Number(e.latlng.lng.toFixed(5));

      incidentMarker.setLatLng([clickLat, clickLng]);
      onCoordsChangeRef.current({ lat: clickLat, lng: clickLng });

      const nearestKel = findNearestKelurahan(clickLat, clickLng);
      onKelurahanChangeRef.current(nearestKel);
      const nearestLm = findNearestLandmark(clickLat, clickLng);
      const currentName = locationNameRef.current;
      if (
        !currentName.trim() ||
        currentName.startsWith('Dekat ') ||
        currentName.startsWith('Posisi Saya:')
      ) {
        onLocationNameChangeRef.current(`Dekat ${nearestLm}`);
      }
    });

    mapRef.current = map;

    // Force map to recalculate size in case container rendered with transitions
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Map Type (Street vs Satellite) Switch
  useEffect(() => {
    if (!mapRef.current) return;
    if (currentTileLayerRef.current) {
      mapRef.current.removeLayer(currentTileLayerRef.current);
    }
    const tileConfig = TILE_LAYERS[mapType];
    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(mapRef.current);
    currentTileLayerRef.current = newLayer;
  }, [mapType]);

  // 3. Update Incident Marker if coordinates change from outside (e.g. landmark click or kelurahan change)
  useEffect(() => {
    if (!incidentMarkerRef.current) return;
    const currentPos = incidentMarkerRef.current.getLatLng();
    if (
      Math.abs(currentPos.lat - selectedCoords.lat) > 0.00005 ||
      Math.abs(currentPos.lng - selectedCoords.lng) > 0.00005
    ) {
      incidentMarkerRef.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
    }
  }, [selectedCoords]);

  // 4. Update or render Live User GPS Location on Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (liveLocation.userCoords && liveLocation.permissionState === 'granted') {
      const userLat = liveLocation.userCoords.lat;
      const userLng = liveLocation.userCoords.lng;

      // Update or create user marker
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLat, userLng], {
          icon: createUserLiveIcon(),
          zIndexOffset: 500,
          interactive: false,
        }).addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLatLng([userLat, userLng]);
      }

      // Update or create accuracy circle
      if (liveLocation.accuracy) {
        if (!userAccuracyCircleRef.current) {
          userAccuracyCircleRef.current = L.circle([userLat, userLng], {
            radius: Math.min(liveLocation.accuracy, 200),
            color: '#0284c7',
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(mapRef.current);
        } else {
          userAccuracyCircleRef.current.setLatLng([userLat, userLng]);
          userAccuracyCircleRef.current.setRadius(Math.min(liveLocation.accuracy, 200));
        }
      }
    } else {
      // Remove user marker if permission removed
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current && mapRef.current) {
        mapRef.current.removeLayer(userAccuracyCircleRef.current);
        userAccuracyCircleRef.current = null;
      }
    }
  }, [liveLocation.userCoords, liveLocation.permissionState, liveLocation.accuracy]);

  // Re-invalidate map size when expanding
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    }
  }, [isExpanded]);

  // Single GPS Action: Request browser GPS, center map, and place initial incident pin
  const handleUseMyCurrentLocation = async () => {
    setIsSyncingWithUser(true);
    const freshCoords = await liveLocation.requestLocationCoords();
    const coords = freshCoords || liveLocation.userCoords;

    if (!coords) {
      setIsSyncingWithUser(false);
      return;
    }

    const initialLat = Number(coords.lat.toFixed(5));
    const initialLng = Number(coords.lng.toFixed(5));

    onCoordsChange({ lat: initialLat, lng: initialLng });

    if (mapRef.current) {
      mapRef.current.flyTo([initialLat, initialLng], 17, {
        duration: 1.1,
      });
    }

    if (incidentMarkerRef.current) {
      incidentMarkerRef.current.setLatLng([initialLat, initialLng]);
    }

    const nearestKel = findNearestKelurahan(initialLat, initialLng);
    onKelurahanChange(nearestKel);
    const nearestLm = findNearestLandmark(initialLat, initialLng);
    if (
      !locationName.trim() ||
      locationName.startsWith('Dekat ') ||
      locationName.startsWith('Posisi Saya:')
    ) {
      onLocationNameChange(`Dekat ${nearestLm}`);
    }
    setIsSyncingWithUser(false);
  };

  // Center to Ciputat
  const handleCenterToCiputat = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(DEFAULT_CIPUTAT_CENTER, 15, {
        duration: 1,
      });
    }
  };

  // Quick landmark fly-to
  const handleSelectLandmarkFlyTo = (lm: typeof CIPUTAT_LANDMARKS[0]) => {
    onCoordsChange({ lat: lm.lat, lng: lm.lng });
    onKelurahanChange(lm.kelurahan as KelurahanCiputat);
    onLocationNameChange(lm.name);

    if (mapRef.current) {
      mapRef.current.flyTo([lm.lat, lm.lng], 16, {
        duration: 1,
      });
    }
    if (incidentMarkerRef.current) {
      incidentMarkerRef.current.setLatLng([lm.lat, lm.lng]);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Header with Title, Description & Single GPS Action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="space-y-0.5">
          <label className={`${elderlyMode ? 'text-base font-bold' : 'text-xs font-bold uppercase tracking-wider'} text-slate-800 dark:text-slate-200 flex items-center gap-1.5`}>
            <MapPin size={16} className="text-rose-500 shrink-0" />
            <span>Titik Lokasi Kejadian</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tentukan titik lokasi permasalahan yang ingin dilaporkan pada peta.
          </p>
        </div>

        {/* Single Primary GPS Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleUseMyCurrentLocation}
          disabled={liveLocation.isLoading || isSyncingWithUser}
          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-75 disabled:cursor-wait self-start sm:self-center"
        >
          {liveLocation.isLoading || isSyncingWithUser ? (
            <>
              <RefreshCw size={13} className="animate-spin text-white" />
              <span>Mendeteksi Lokasi...</span>
            </>
          ) : (
            <>
              <Navigation size={13} className="text-white" />
              <span>Gunakan Lokasi Saya</span>
            </>
          )}
        </motion.button>
      </div>

      {/* 2. INFORMATIVE-ONLY GPS STATUS BANNER */}
      <AnimatePresence mode="wait">
        {liveLocation.permissionState === 'denied' ||
        liveLocation.permissionState === 'unsupported' ||
        liveLocation.errorMessage ? (
          <motion.div
            key="gps-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 text-xs shadow-xs flex items-start gap-2.5"
          >
            <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {liveLocation.permissionState === 'denied'
                ? 'Izin lokasi belum diberikan. Anda tetap dapat menentukan lokasi kejadian secara manual melalui peta.'
                : liveLocation.errorMessage ||
                  'Lokasi GPS gagal dideteksi. Anda tetap dapat menentukan lokasi kejadian secara manual melalui peta.'}
            </p>
          </motion.div>
        ) : liveLocation.isLoading || isSyncingWithUser ? (
          <motion.div
            key="gps-loading"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-sky-900 dark:text-sky-200 text-xs shadow-xs flex items-center gap-2.5"
          >
            <RefreshCw size={14} className="animate-spin text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Sedang mendeteksi koordinat GPS perangkat Anda...
            </span>
          </motion.div>
        ) : liveLocation.permissionState === 'granted' && liveLocation.userCoords ? (
          <motion.div
            key="gps-granted"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs shadow-xs flex items-center gap-2.5"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200">
              Lokasi Anda berhasil terdeteksi: sekitar{' '}
              <strong>Kel. {liveLocation.nearestKelurahan}</strong>
              {liveLocation.accuracy ? ` (Akurasi GPS ±${liveLocation.accuracy} m)` : ''}.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="gps-idle"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs shadow-xs flex items-center gap-2.5"
          >
            <Info size={15} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <p className="text-[11px] sm:text-xs">
              Lokasi belum terdeteksi. Gunakan tombol <strong>Gunakan Lokasi Saya</strong> untuk mengambil posisi Anda.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. INTERACTIVE LEAFLET MAP FOR MANUAL & GPS INCIDENT PIN PLACEMENT */}
      <div className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-md">
        {/* Map Top Bar Controls */}
        <div className="p-2 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs z-10 relative">
          {/* Map Layer Switcher: Street vs Satellite */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMapType('streets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                mapType === 'streets'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building size={12} />
              <span>Peta Jalan</span>
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Globe size={12} />
              <span>Citra Satelit</span>
            </button>
          </div>

          {/* Quick Coordinate Indicator & Expand toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
              {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={isExpanded ? 'Perkecil peta' : 'Perbesar peta'}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div
          className={`w-full transition-all duration-300 relative ${
            isExpanded ? 'h-[440px]' : 'h-[280px] sm:h-[320px]'
          }`}
        >
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Overlay Map Action: Pusat Ciputat */}
          <div className="absolute top-2.5 left-2.5 z-[500] pointer-events-auto">
            <button
              type="button"
              onClick={handleCenterToCiputat}
              className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-md text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Kembalikan tampilan peta ke wilayah pusat Ciputat"
            >
              <Compass size={14} className="text-amber-500" />
              <span>Pusat Ciputat</span>
            </button>
          </div>

          {/* Draggable hint at bottom center */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-[500] pointer-events-none w-max max-w-[92%]">
            <div className="px-3 py-1 rounded-full bg-slate-900/85 text-white text-[10px] font-bold shadow-lg border border-slate-700 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
              <span className="truncate">Geser pin merah atau klik peta untuk menentukan lokasi kejadian yang benar.</span>
            </div>
          </div>
        </div>

        {/* Map Footer Bar with Nearest Info */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <Info size={13} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="truncate">
              Titik kejadian: <strong>Kel. {kelurahan}</strong> ({findNearestLandmark(selectedCoords.lat, selectedCoords.lng)})
            </span>
          </div>

          {liveLocation.userCoords && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              GPS Aktif
            </span>
          )}
        </div>
      </div>

      {/* 4. Form inputs: Kelurahan & Patokan Jalan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Kelurahan di Ciputat:
          </label>
          <select
            value={kelurahan}
            onChange={(e) => {
              const k = e.target.value as KelurahanCiputat;
              onKelurahanChange(k);
              // Snap coordinates and pan map to selected kelurahan landmark
              const landmark = CIPUTAT_LANDMARKS.find((lm) => lm.kelurahan === k);
              if (landmark) {
                onCoordsChange({ lat: landmark.lat, lng: landmark.lng });
                if (mapRef.current) {
                  mapRef.current.flyTo([landmark.lat, landmark.lng], 16);
                }
                if (incidentMarkerRef.current) {
                  incidentMarkerRef.current.setLatLng([landmark.lat, landmark.lng]);
                }
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
          >
            {CIPUTAT_KELURAHAN_LIST.map((k) => (
              <option key={k} value={k}>
                Kelurahan {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Nama Jalan / Patokan Terdekat:
          </label>
          <input
            type="text"
            required
            value={locationName}
            onChange={(e) => onLocationNameChange(e.target.value)}
            placeholder="Contoh: Jl. Dewi Sartika samping Pasar Ciputat"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 5. Quick Landmark Buttons with Map Fly-To */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
          Pilih Lokasi & Patokan Populer di Ciputat:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CIPUTAT_LANDMARKS.map((lm, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectLandmarkFlyTo(lm)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1"
            >
              <span>📍</span>
              <span>{lm.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
