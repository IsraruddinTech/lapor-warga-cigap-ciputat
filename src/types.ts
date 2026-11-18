export type ReportCategory =
  | 'infrastruktur_fasilitas'
  | 'lingkungan'
  | 'pelayanan_publik'
  | 'ketertiban_keamanan'
  | 'jalan_rusak'
  | 'lampu_mati'
  | 'sampah_menumpuk'
  | 'drainase_tersumbat'
  | 'fasilitas_rusak';

export type ReportStatus =
  | 'diterima'
  | 'diverifikasi'
  | 'dalam_peninjauan'
  | 'diteruskan_ke_dinas'
  | 'tindak_lanjut'
  | 'menunggu_tindak_lanjut'
  | 'selesai'
  | 'ditolak';

export type UrgencyLevel = 'rendah' | 'sedang' | 'tinggi' | 'darurat';

export type KelurahanCiputat =
  | 'Ciputat'
  | 'Cipayung'
  | 'Serua'
  | 'Serua Indah'
  | 'Sawah Baru'
  | 'Sawah'
  | 'Jombang';

export interface ReportPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt?: string;
}

export interface PriorityHistoryEntry {
  id: string;
  previousPriority?: UrgencyLevel;
  newPriority?: UrgencyLevel;
  reason?: string;
  actor: string;
  timestamp: string;
  createdAtIso?: string;
}

export interface ReportTimelineStep {
  id: string;
  status: ReportStatus;
  title: string;
  description: string;
  timestamp: string;
  createdAtIso?: string;
  actor: string; // e.g. "Sistem CIGAP", "Dinas PUPR Tangsel", "Tim Reaksi Cepat DLH"
  photoUrl?: string;
}

export interface ReportNotification {
  id: string;
  reportId: string;
  reportTitle: string;
  status: ReportStatus;
  title: string;
  message: string;
  timestamp: string;
  createdAtIso: string;
  isRead: boolean;
  type?: 'status_update' | 'delay' | 'created' | 'resolved';
}

export interface UserFeedback {
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
  civicName: string;
  upvotes: number;
}

export interface FakeReportVerification {
  trustScore: number; // 0 to 100
  isSuspectedFake: boolean;
  verdict: 'valid' | 'perlu_tinjauan' | 'terindikasi_palsu';
  reasons: string[];
  checks: {
    gpsRadiusValid: boolean; // Device / report coords within Ciputat boundary
    photoAuthenticity: boolean; // Real photo, valid format & resolution
    antiSpamScore: number; // 0-100 (content quality, no gibberish/spam)
    contactVerified: boolean; // Valid phone number format or verified anonymous
    duplicateClusterRisk: 'rendah' | 'sedang' | 'tinggi'; // Cluster proximity check
  };
  duplicateClusterReportId?: string;
  reviewedByAdmin?: boolean;
  fraudAction?: 'lolos' | 'minta_klarifikasi' | 'ditolak_hoaks';
  rejectionReason?: string;
}

export interface ReportItem {
  id: string; // e.g. "CPT-2026-081"
  title: string;
  description: string;
  category: ReportCategory;
  subtype?: string;
  status: ReportStatus;
  urgency?: UrgencyLevel;
  priorityUpdatedAt?: string;
  priorityAssignedBy?: string;
  priorityHistory?: PriorityHistoryEntry[];
  kelurahan: KelurahanCiputat;
  locationName: string; // e.g. "Jl. Ir. H. Juanda No. 45, depan Polsek Ciputat"
  coordinates: {
    lat: number;
    lng: number;
  };
  reporterName: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  photoUrl: string; // Primary photo URL (empty string if no photo attached)
  photos?: ReportPhoto[]; // Multiple reporter evidence photos
  resolvedPhotoUrl?: string;
  createdAt: string;
  createdAtIso?: string;
  updatedAt?: string;
  estimatedCompletion?: string;
  estimatedCompletionDate?: string; // ISO YYYY-MM-DD set by officer/admin
  estimatedUpdatedAt?: string;
  isDelayed?: boolean;
  delayReason?: string;
  rejectionReason?: string;
  assignedDepartment?: string;
  officerName?: string; // Publicly displayable officer/coordinator name if available
  adminNotes?: string; // Public-facing status progress note
  internalNotes?: string; // Internal officer/audit notes (never exposed publicly)
  timeline: ReportTimelineStep[];
  feedback?: UserFeedback;
  upvotes: number;
  verification?: FakeReportVerification;
}

export type ThemeAccent = 'emerald' | 'blue' | 'amber' | 'violet';

export interface AppThemeSettings {
  darkMode: boolean;
  accent: ThemeAccent;
  elderlyFriendlyMode: boolean; // Large text, high contrast, extra padding
  soundEnabled: boolean;
}

export type AppTab =
  | 'dashboard'
  | 'lapor'
  | 'riwayat'
  | 'admin'
  | 'statistik'
  | 'tentang'
  | 'faq';

export interface WeatherInfo {
  condition: 'cerah' | 'hujan_lebat' | 'berawan' | 'malam_cerah' | 'badai';
  temp: number;
  humidity: number;
  windSpeed: number;
  alertTitle: string;
  alertDetail: string;
  level: 'normal' | 'waspada' | 'siaga';
  location: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  quickActions?: string[];
}
