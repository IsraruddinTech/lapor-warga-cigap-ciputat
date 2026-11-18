import { useState, useEffect, useCallback, useRef } from 'react';
import { KelurahanCiputat } from '../types';
import { CIPUTAT_LANDMARKS } from '../data/cigapConstants';

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface UserLiveLocationState {
  permissionState: LocationPermissionState;
  userCoords: { lat: number; lng: number } | null;
  accuracy: number | null; // meters
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  isLoading: boolean;
  errorMessage: string | null;
  isInCiputat: boolean;
  nearestKelurahan: KelurahanCiputat;
  nearestLandmark: string;
  detectedKelurahan: KelurahanCiputat | null;
  detectedLandmark: string | null;
  isGpsEnabled: boolean;
  showPermissionBanner: boolean;
  requestLocation: () => Promise<boolean>;
  requestLocationCoords: () => Promise<{ lat: number; lng: number } | null>;
  disableLocation: () => void;
  stopWatching: () => void;
  dismissBanner: () => void;
}

// Approximate bounds for Kecamatan Ciputat
const CIPUTAT_BOUNDS = {
  minLat: -6.345,
  maxLat: -6.285,
  minLng: 106.705,
  maxLng: 106.775,
};

// Kelurahan center coordinates
const KELURAHAN_CENTERS: Record<KelurahanCiputat, { lat: number; lng: number }> = {
  Ciputat: { lat: -6.3138, lng: 106.7431 },
  Cipayung: { lat: -6.3056, lng: 106.7584 },
  Serua: { lat: -6.3150, lng: 106.7210 },
  'Serua Indah': { lat: -6.3198, lng: 106.7291 },
  'Sawah Baru': { lat: -6.3021, lng: 106.7329 },
  Sawah: { lat: -6.3080, lng: 106.7380 },
  Jombang: { lat: -6.2991, lng: 106.7121 },
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestKelurahan(lat: number, lng: number): KelurahanCiputat {
  let minDistance = Infinity;
  let nearest: KelurahanCiputat = 'Ciputat';

  (Object.keys(KELURAHAN_CENTERS) as KelurahanCiputat[]).forEach((kel) => {
    const center = KELURAHAN_CENTERS[kel];
    const dist = getDistanceKm(lat, lng, center.lat, center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = kel;
    }
  });

  return nearest;
}

export function findNearestLandmark(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearest = 'Kecamatan Ciputat';

  CIPUTAT_LANDMARKS.forEach((lm) => {
    const dist = getDistanceKm(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = `${lm.name} (Kel. ${lm.kelurahan})`;
    }
  });

  return nearest;
}

export function checkIsInCiputat(lat: number, lng: number): boolean {
  return (
    lat >= CIPUTAT_BOUNDS.minLat &&
    lat <= CIPUTAT_BOUNDS.maxLat &&
    lng >= CIPUTAT_BOUNDS.minLng &&
    lng <= CIPUTAT_BOUNDS.maxLng
  );
}

export function useUserLiveLocation(): UserLiveLocationState {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('prompt');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGpsEnabled, setIsGpsEnabled] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);

  const watchIdRef = useRef<number | null>(null);
  const isGpsEnabledRef = useRef(false);

  // Check initial permission status if available
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      setErrorMessage('Browser Anda tidak mendukung fitur geolokasi GPS.');
      return;
    }

    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            setPermissionState('granted');
            setIsGpsEnabled(true);
            isGpsEnabledRef.current = true;
            // Auto start watching if already granted
            startWatching();
          } else if (result.state === 'denied') {
            setPermissionState('denied');
            setIsGpsEnabled(false);
            isGpsEnabledRef.current = false;
          } else {
            setPermissionState('prompt');
          }

          result.onchange = () => {
            if (result.state === 'granted') {
              setPermissionState('granted');
              setErrorMessage(null);
              if (isGpsEnabledRef.current) {
                startWatching();
              }
            } else if (result.state === 'denied') {
              setPermissionState('denied');
              setIsGpsEnabled(false);
              isGpsEnabledRef.current = false;
              setUserCoords(null);
              setAccuracy(null);
              stopWatching();
            } else {
              setPermissionState('prompt');
            }
          };
        })
        .catch(() => {
          // Permissions API might throw on unsupported names
        });
    }

    return () => {
      stopWatching();
    };
  }, []);

  const handlePositionSuccess = (position: GeolocationPosition) => {
    if (!isGpsEnabledRef.current) return;
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setUserCoords({ lat, lng });
    setAccuracy(Math.round(position.coords.accuracy));
    setHeading(position.coords.heading);
    setSpeed(position.coords.speed);
    setTimestamp(position.timestamp);
    setPermissionState('granted');
    setIsGpsEnabled(true);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handlePositionError = (error: GeolocationPositionError) => {
    setIsLoading(false);
    if (error.code === error.PERMISSION_DENIED) {
      setPermissionState('denied');
      setErrorMessage(
        'Akses lokasi GPS ditolak oleh pengguna atau diblokir browser. Anda dapat memilih lokasi manual di peta Ciputat.'
      );
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      setErrorMessage('Sinyal GPS tidak tersedia saat ini. Silakan tentukan lokasi secara manual di peta.');
    } else if (error.code === error.TIMEOUT) {
      setErrorMessage('Pencarian koordinat GPS melebihi batas waktu (timeout). Silakan coba lagi.');
    } else {
      setErrorMessage('Terjadi gangguan saat mengambil data lokasi GPS perangkat.');
    }
  };

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (e) {
      // fallback
    }
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestLocationCoords = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      setIsGpsEnabled(false);
      isGpsEnabledRef.current = false;
      setErrorMessage('Browser tidak mendukung pendeteksian lokasi GPS.');
      return null;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsGpsEnabled(true);
    isGpsEnabledRef.current = true;
    setShowPermissionBanner(true);

    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionSuccess(pos);
          startWatching();
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setIsGpsEnabled(false);
            isGpsEnabledRef.current = false;
            setUserCoords(null);
            setAccuracy(null);
          }
          handlePositionError(err);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  }, [startWatching]);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    const coords = await requestLocationCoords();
    return Boolean(coords);
  }, [requestLocationCoords]);

  const disableLocation = useCallback(() => {
    stopWatching();
    isGpsEnabledRef.current = false;
    setIsGpsEnabled(false);
    setIsLoading(false);
    setUserCoords(null);
    setAccuracy(null);
    setHeading(null);
    setSpeed(null);
    setTimestamp(null);
    setErrorMessage(null);
  }, [stopWatching]);

  const dismissBanner = useCallback(() => {
    setShowPermissionBanner(false);
  }, []);

  const currentLat = userCoords?.lat ?? -6.3115;
  const currentLng = userCoords?.lng ?? 106.7452;

  const isInCiputat = userCoords ? checkIsInCiputat(userCoords.lat, userCoords.lng) : false;
  const nearestKelurahan = findNearestKelurahan(currentLat, currentLng);
  const nearestLandmark = findNearestLandmark(currentLat, currentLng);
  const detectedKelurahan = userCoords ? findNearestKelurahan(userCoords.lat, userCoords.lng) : null;
  const detectedLandmark = userCoords ? findNearestLandmark(userCoords.lat, userCoords.lng) : null;

  return {
    permissionState,
    userCoords,
    accuracy,
    heading,
    speed,
    timestamp,
    isLoading,
    errorMessage,
    isInCiputat,
    nearestKelurahan,
    nearestLandmark,
    detectedKelurahan,
    detectedLandmark,
    isGpsEnabled,
    showPermissionBanner,
    requestLocation,
    requestLocationCoords,
    disableLocation,
    stopWatching,
    dismissBanner,
  };
}
