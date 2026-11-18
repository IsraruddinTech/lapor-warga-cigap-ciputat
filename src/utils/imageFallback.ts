import type { SyntheticEvent } from 'react';
import { ReportCategory } from '../types';

// Local static image assets generated for CIGAP
export const LOCAL_CATEGORY_IMAGES: Record<ReportCategory, string> = {
  infrastruktur_fasilitas: '/assets/images/pothole.jpg',
  lingkungan: '/assets/images/waste.jpg',
  pelayanan_publik: '/assets/images/min_ci.jpg',
  ketertiban_keamanan: '/assets/images/min_ci.jpg',
  jalan_rusak: '/assets/images/pothole.jpg',
  lampu_mati: '/assets/images/streetlight.jpg',
  sampah_menumpuk: '/assets/images/waste.jpg',
  drainase_tersumbat: '/assets/images/drainage.jpg',
  fasilitas_rusak: '/assets/images/pothole.jpg',
};

// SVG data URI generator as 100% reliable offline fallback
export function getSvgPlaceholder(category?: string, label?: string): string {
  const text = label || (category ? category.replace(/_/g, ' ').toUpperCase() : 'DOKUMENTASI CIGAP');
  const bg = '#0f172a';
  const accent = '#10b981';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="50%" stop-color="${bg}" />
        <stop offset="100%" stop-color="#042f2e" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="400" cy="250" r="70" fill="#047857" opacity="0.4" />
    <circle cx="400" cy="250" r="50" fill="${accent}" opacity="0.8" />
    <path d="M375 250 L400 220 L425 250 Z" fill="#ffffff" />
    <rect x="390" y="250" width="20" height="25" fill="#ffffff" />
    <text x="400" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      LaporWarga CIGAP Ciputat
    </text>
    <text x="400" y="410" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#34d399" text-anchor="middle" letter-spacing="2">
      ${text}
    </text>
    <text x="400" y="445" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">
      Dokumentasi Lapangan Terverifikasi Pemkot Tangsel
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Fallback helper for onError
export function handleImageFallback(
  event: SyntheticEvent<HTMLImageElement, Event>,
  category?: ReportCategory | string,
  customLabel?: string
) {
  const target = event.currentTarget;
  // If local image fails too, fallback to pure SVG
  if (category && LOCAL_CATEGORY_IMAGES[category as ReportCategory] && !target.src.includes('data:image/svg+xml') && target.src !== LOCAL_CATEGORY_IMAGES[category as ReportCategory]) {
    target.src = LOCAL_CATEGORY_IMAGES[category as ReportCategory];
  } else {
    target.src = getSvgPlaceholder(category, customLabel);
  }
}
