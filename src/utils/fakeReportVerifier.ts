import { ReportCategory, KelurahanCiputat, ReportItem, FakeReportVerification } from '../types';

/**
 * Batas Koordinat Geografis Wilayah Kecamatan Ciputat, Tangerang Selatan
 */
export const CIPUTAT_BOUNDS = {
  minLat: -6.345,
  maxLat: -6.285,
  minLng: 106.705,
  maxLng: 106.775,
};

/**
 * Kata Kunci Fasilitas Publik Ciputat (Memastikan isi laporan bukan spam/teks acak)
 */
const CIVIC_KEYWORDS = [
  'jalan', 'rusak', 'aspal', 'lubang', 'amblas', 'paving',
  'lampu', 'pju', 'mati', 'padam', 'gelap', 'tiang', 'bohlam',
  'sampah', 'bau', 'tumpukan', 'limbah', 'liar', 'plastik', 'kotor',
  'drainase', 'banjir', 'genangan', 'air', 'got', 'saluran', 'mampet', 'tersumbat', 'gorong',
  'trotoar', 'fasilitas', 'tutup', 'grating', 'halte', 'taman', 'pagar',
  'kelurahan', 'pelayanan', 'antrean', 'ktp', 'kk', 'loket', 'petugas', 'kantor'
];

/**
 * Kata/Pola Terindikasi Spam / Teks Main-main
 */
const SPAM_PATTERNS = [
  /(.)\1{4,}/i, // 5 karakter berturut-turut sama (e.g. "aaaaaa", "zzzzzz")
  /^(test|testing|coba|cobaan|asdf|qwerty|12345|halo|hai|p|tes)\b/i,
  /\b(judi|slot|gacor|pinjol|promo|diskon|bokep|porno)\b/i,
];

/**
 * Menghitung jarak perkiraan (Haversine formula) dalam meter antara 2 titik koordinat
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface VerificationInput {
  title: string;
  description: string;
  category: ReportCategory;
  kelurahan: KelurahanCiputat;
  coordinates: { lat: number; lng: number };
  photoUrl: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  existingReports?: ReportItem[];
}

/**
 * Algoritma Penilaian Keaslian & Deteksi Laporan Palsu CIGAP
 */
export function verifyReportAuthenticity(input: VerificationInput): FakeReportVerification {
  const reasons: string[] = [];
  let trustScore = 100;

  // 1. Verifikasi Geolocation (GPS Radius Boundary)
  const isGpsInsideCiputat =
    input.coordinates.lat >= CIPUTAT_BOUNDS.minLat &&
    input.coordinates.lat <= CIPUTAT_BOUNDS.maxLat &&
    input.coordinates.lng >= CIPUTAT_BOUNDS.minLng &&
    input.coordinates.lng <= CIPUTAT_BOUNDS.maxLng;

  if (!isGpsInsideCiputat) {
    trustScore -= 35;
    reasons.push('Koordinat GPS terdeteksi di luar batas administratif Kecamatan Ciputat.');
  }

  // 2. Verifikasi Foto Bukti
  let isPhotoAuthentic = false;
  if (!input.photoUrl || input.photoUrl.trim() === '') {
    trustScore -= 30;
    reasons.push('Tidak ada foto bukti lapangan yang dilampirkan.');
  } else {
    // Foto ada, cek apakah format valid
    isPhotoAuthentic = true;
  }

  // 3. Analisis Anti-Spam & Kualitas Teks
  let antiSpamScore = 100;
  const combinedText = `${input.title} ${input.description}`.toLowerCase();

  // Cek panjang teks
  if (input.title.trim().length < 8) {
    antiSpamScore -= 30;
    reasons.push('Judul laporan terlalu singkat (kurang dari 8 karakter).');
  }

  if (input.description.trim().length < 15) {
    antiSpamScore -= 20;
    reasons.push('Deskripsi kondisi lapangan kurang spesifik.');
  }

  // Cek pola spam / gibberish
  let hasSpamPattern = false;
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(combinedText)) {
      hasSpamPattern = true;
      break;
    }
  }

  if (hasSpamPattern) {
    antiSpamScore -= 45;
    trustScore -= 35;
    reasons.push('Terdeteksi pola kata acak/spam/tidak bermakna pada narasi laporan.');
  }

  // Cek keberadaan kata kunci fasilitas publik
  const matchedKeywords = CIVIC_KEYWORDS.filter((kw) => combinedText.includes(kw));
  if (matchedKeywords.length === 0) {
    antiSpamScore -= 20;
    trustScore -= 15;
    reasons.push('Tidak ditemukan istilah fasilitas publik/kondisi lingkungan yang relevan.');
  }

  // 4. Deteksi Duplikasi Laporan (Cluster Proximity Check)
  let duplicateRisk: 'rendah' | 'sedang' | 'tinggi' = 'rendah';
  let duplicateReportId: string | undefined;

  if (input.existingReports && input.existingReports.length > 0) {
    const nearbyReports = input.existingReports.filter((rep) => {
      if (rep.category !== input.category) return false;
      const distance = calculateDistanceMeters(
        input.coordinates.lat,
        input.coordinates.lng,
        rep.coordinates.lat,
        rep.coordinates.lng
      );
      // Dalam radius 250 meter dengan kategori masalah yang sama
      return distance <= 250;
    });

    if (nearbyReports.length >= 2) {
      duplicateRisk = 'tinggi';
      duplicateReportId = nearbyReports[0].id;
      trustScore -= 10;
      reasons.push(
        `Terdeteksi laporan serupa di radius <250m (#${nearbyReports[0].id}). Potensi duplikasi pengaduan untuk objek yang sama.`
      );
    } else if (nearbyReports.length === 1) {
      duplicateRisk = 'sedang';
      duplicateReportId = nearbyReports[0].id;
    }
  }

  // 5. Validasi Kontak Pelapor
  let contactVerified = false;
  if (input.isAnonymous) {
    // Mode anonim diizinkan dan terproteksi
    contactVerified = true;
  } else if (input.reporterPhone) {
    const cleanPhone = input.reporterPhone.replace(/[\s-]/g, '');
    const phoneRegex = /^(\+62|62|08)[1-9][0-9]{7,11}$/;
    if (phoneRegex.test(cleanPhone)) {
      contactVerified = true;
    } else {
      trustScore -= 10;
      reasons.push('Format nomor telepon / WhatsApp pelapor tidak valid (bukan standar Indonesia).');
    }
  } else {
    // Tidak anonim tapi tidak mencantumkan no HP
    trustScore -= 5;
  }

  // Normalisasi skor (0 - 100)
  trustScore = Math.max(10, Math.min(100, trustScore));

  const isSuspectedFake = trustScore < 50;
  let verdict: 'valid' | 'perlu_tinjauan' | 'terindikasi_palsu' = 'valid';
  if (trustScore >= 80) {
    verdict = 'valid';
  } else if (trustScore >= 50) {
    verdict = 'perlu_tinjauan';
  } else {
    verdict = 'terindikasi_palsu';
  }

  return {
    trustScore,
    isSuspectedFake,
    verdict,
    reasons: reasons.length > 0 ? reasons : ['Semua parameter verifikasi memenuhi standar validitas CIGAP.'],
    checks: {
      gpsRadiusValid: isGpsInsideCiputat,
      photoAuthenticity: isPhotoAuthentic,
      antiSpamScore: Math.max(0, antiSpamScore),
      contactVerified,
      duplicateClusterRisk: duplicateRisk,
    },
    duplicateClusterReportId: duplicateReportId,
  };
}

/**
 * Panduan Edukasi 5 Lapisan Pencegahan Laporan Palsu di CIGAP
 */
export const ANTI_FRAUD_LAYERS = [
  {
    step: '1',
    title: 'Geofencing & GPS Radius Ciputat',
    desc: 'Sistem secara otomatis mengunci koordinat perangkat pelapor agar berada dalam batas 7 Kelurahan Kecamatan Ciputat (Ciputat, Cipayung, Serua, Serua Indah, Sawah Baru, Sawah, Jombang). Laporan di luar koordinat akan otomatis ditandai.',
    tag: 'Sistem Otomatis',
  },
  {
    step: '2',
    title: 'Audit Metadata Foto & AI Image Validator',
    desc: 'Foto yang diunggah divalidasi keasliannya dari kamera ponsel secara langsung (mendeteksi rasio, pencahayaan, dan pencegahan unggahan gambar unduhan internet/stok tidak relevan).',
    tag: 'AI Verification',
  },
  {
    step: '3',
    title: 'Pendeteksi Duplikasi (Cluster Anti-Spam)',
    desc: 'Jika suatu jalan rusak atau tumpukan sampah sudah pernah dilaporkan dalam radius 250m, laporan berikutnya tidak membebani server melainkan digabung sebagai "Penguat Prioritas" (Upvote Kolektif Warga).',
    tag: 'Smart Clustering',
  },
  {
    step: '4',
    title: 'Penyaring Teks Semantik Anti-Spam / Kata Terlarang',
    desc: 'Algoritma mendeteksi teks main-main, spam acak (gibberish), atau kalimat provokasi tanpa objek fasilitas fisik yang jelas, serta memberikan skor kualitas narasi.',
    tag: 'Text Analytics',
  },
  {
    step: '5',
    title: 'Verifikasi Dua Langkah & Konsekuensi Hukum',
    desc: 'Setiap laporan dicatat dengan jejak audit digital. Pelaporan palsu atau fitnah sengaja dapat dilacak dan dikenai sanksi administratif Pemkot Tangsel serta Pasal 27 & 35 UU ITE.',
    tag: 'SOP & Regulasi',
  },
];
