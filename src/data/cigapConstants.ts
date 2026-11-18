import type {
  KelurahanCiputat,
  ReportCategory,
  ReportItem,
  ReportNotification,
  ReportStatus,
  WeatherInfo,
} from '../types.ts';

export const CIPUTAT_KELURAHAN_LIST: KelurahanCiputat[] = [
  'Ciputat',
  'Cipayung',
  'Serua',
  'Serua Indah',
  'Sawah Baru',
  'Sawah',
  'Jombang',
];

export interface CiputatLandmarkItem {
  name: string;
  kelurahan: KelurahanCiputat;
  lat: number;
  lng: number;
}

export const CIPUTAT_LANDMARKS: CiputatLandmarkItem[] = [
  { name: 'Pasar Ciputat & Jl. Dewi Sartika', kelurahan: 'Ciputat', lat: -6.3115, lng: 106.7452 },
  { name: 'Kolong Flyover Ciputat', kelurahan: 'Ciputat', lat: -6.3138, lng: 106.7431 },
  { name: 'Kampus UIN Syarif Hidayatullah (Jl. Juanda)', kelurahan: 'Cipayung', lat: -6.3087, lng: 106.7533 },
  { name: 'Danau Situ Gintung', kelurahan: 'Cipayung', lat: -6.3056, lng: 106.7584 },
  { name: 'Stasiun Sudimara & Pasar Jombang', kelurahan: 'Jombang', lat: -6.2966, lng: 106.7165 },
  { name: 'Stasiun Jurang Mangu & BXchange', kelurahan: 'Sawah Baru', lat: -6.2896, lng: 106.7278 },
  { name: 'Kantor Kelurahan Sawah (Jl. Cendrawasih)', kelurahan: 'Sawah', lat: -6.3021, lng: 106.7329 },
  { name: 'SDN Serua Indah 01 (Jl. Merpati Raya)', kelurahan: 'Serua Indah', lat: -6.3198, lng: 106.7291 },
  { name: 'Bukit Nusa Indah & Serua', kelurahan: 'Serua', lat: -6.3264, lng: 106.7192 },
];

export interface CategoryHierarchyItem {
  id: ReportCategory;
  name: string;
  desc: string;
  color: string;
  subtypes: string[];
}

export const REPORT_CATEGORIES_HIERARCHY: CategoryHierarchyItem[] = [
  {
    id: 'infrastruktur_fasilitas',
    name: 'Infrastruktur & Fasilitas Umum',
    desc: 'Jalan berlubang, trotoar rusak, lampu PJU padam, halte & fasilitas publik.',
    color: 'bg-sky-600 text-white',
    subtypes: [
      'Jalan berlubang / aspal rusak parah',
      'Lampu PJU jalan padam total / redup',
      'Trotoar atau tutup saluran pejalan kaki bolong',
      'Halte, rambu lalu lintas, atau taman kota rusak',
      'Masalah infrastruktur selain itu (Lainnya)',
    ],
  },
  {
    id: 'lingkungan',
    name: 'Lingkungan & Kebersihan',
    desc: 'Tumpukan sampah liar, drainase mampet, genangan banjir, pohon tumbang.',
    color: 'bg-emerald-600 text-white',
    subtypes: [
      'Tumpukan sampah liar di bahu jalan / TPS penuh',
      'Saluran drainase / gorong-gorong tersumbat banjir',
      'Bau menyengat atau pencemaran limbah selokan',
      'Pohon rawan tumbang / dahan mengganggu kabel',
      'Masalah lingkungan selain itu (Lainnya)',
    ],
  },
  {
    id: 'pelayanan_publik',
    name: 'Pelayanan Publik & Administrasi',
    desc: 'Antrean layanan kelurahan, kependudukan e-KTP/KK, respons petugas loket.',
    color: 'bg-indigo-600 text-white',
    subtypes: [
      'Antrean loket kelurahan terlalu lambat / menumpuk',
      'Gangguan sistem / server layanan administrasi kependudukan',
      'Kejelasan informasi & prosedur layanan warga',
      'Pelayanan publik selain itu (Lainnya)',
    ],
  },
  {
    id: 'ketertiban_keamanan',
    name: 'Ketertiban & Keamanan Wilayah',
    desc: 'Parkir liar, gangguan ketenteraman umum, penerangan titik rawan malam.',
    color: 'bg-amber-600 text-white',
    subtypes: [
      'Parkir liar atau PKL menutup badan jalan / trotoar',
      'Titik rawan gelap & gangguan ketertiban malam hari',
      'Bangunan liar / pelanggaran ketertiban ruang publik',
      'Ketertiban umum selain itu (Lainnya)',
    ],
  },
];

export const CATEGORY_LABELS: Record<
  ReportCategory,
  { label: string; color: string }
> = {
  infrastruktur_fasilitas: {
    label: 'Infrastruktur & Fasilitas',
    color: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  },
  lingkungan: {
    label: 'Lingkungan & Drainase',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  pelayanan_publik: {
    label: 'Pelayanan Publik',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  ketertiban_keamanan: {
    label: 'Ketertiban & Keamanan',
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  jalan_rusak: {
    label: 'Jalan Rusak / Berlubang',
    color: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  },
  lampu_mati: {
    label: 'Lampu PJU Padam',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800',
  },
  sampah_menumpuk: {
    label: 'Sampah Menumpuk',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  drainase_tersumbat: {
    label: 'Drainase Tersumbat',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
  },
  fasilitas_rusak: {
    label: 'Fasilitas Umum Rusak',
    color: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
  },
};

export const STATUS_WORKFLOW_ORDER: ReportStatus[] = [
  'diterima',
  'diverifikasi',
  'dalam_peninjauan',
  'diteruskan_ke_dinas',
  'tindak_lanjut',
  'menunggu_tindak_lanjut',
  'selesai',
];

export interface StatusLabelMeta {
  label: string;
  shortLabel: string;
  badgeClass: string;
  markerGroup: 'blue' | 'purple' | 'orange' | 'green' | 'red';
  stepIndex: number;
  defaultNotifMessage: string;
}

export const STATUS_LABELS: Record<ReportStatus, StatusLabelMeta> = {
  diterima: {
    label: 'Laporan Diterima',
    shortLabel: 'Diterima',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    markerGroup: 'blue',
    stepIndex: 1,
    defaultNotifMessage: 'Pengaduan Anda berhasil diterima oleh sistem CiGap.',
  },
  diverifikasi: {
    label: 'Sedang Diverifikasi',
    shortLabel: 'Verifikasi',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    markerGroup: 'purple',
    stepIndex: 2,
    defaultNotifMessage: 'Laporan Anda sedang dalam proses verifikasi oleh petugas.',
  },
  dalam_peninjauan: {
    label: 'Dalam Peninjauan',
    shortLabel: 'Peninjauan',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    markerGroup: 'purple',
    stepIndex: 3,
    defaultNotifMessage: 'Laporan Anda sedang ditinjau oleh dinas teknis terkait.',
  },
  diteruskan_ke_dinas: {
    label: 'Diteruskan ke Dinas',
    shortLabel: 'Disposisi',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    markerGroup: 'orange',
    stepIndex: 4,
    defaultNotifMessage: 'Laporan telah didisposisikan ke dinas teknis pelaksana.',
  },
  tindak_lanjut: {
    label: 'Dalam Penanganan',
    shortLabel: 'Ditangani',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    markerGroup: 'orange',
    stepIndex: 5,
    defaultNotifMessage: 'Tim petugas lapangan sedang melakukan penanganan di lokasi.',
  },
  menunggu_tindak_lanjut: {
    label: 'Menunggu Tindak Lanjut',
    shortLabel: 'Menunggu',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800',
    markerGroup: 'orange',
    stepIndex: 6,
    defaultNotifMessage: 'Pengaduan menunggu koordinasi atau material lanjutan dari dinas.',
  },
  selesai: {
    label: 'Selesai Ditangani',
    shortLabel: 'Selesai',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    markerGroup: 'green',
    stepIndex: 7,
    defaultNotifMessage: 'Penanganan laporan telah selesai. Silakan periksa hasil tindak lanjut.',
  },
  ditolak: {
    label: 'Laporan Ditolak',
    shortLabel: 'Ditolak',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    markerGroup: 'red',
    stepIndex: 0,
    defaultNotifMessage: 'Laporan tidak dapat diproses oleh petugas verifikasi.',
  },
};

export const MIN_CI_MASCOT_INFO = {
  name: 'Min Ci',
  avatarUrl: '/min_ci_knight_mascot.jpg',
  role: 'Maskot Siaga Posko CIGAP Ciputat',
};

export const CS_TEMPLATES = [
  {
    title: 'Cara Lapor Jalan Rusak',
    query: 'Bagaimana cara melaporkan jalan rusak di Ciputat?',
    reply:
      'Klik tombol "Lapor Sekarang" di menu atas, pilih kategori Infrastruktur & Fasilitas, tandai titik lokasi pada peta Ciputat, unggah foto kondisi jalan, lalu kirim. Sistem akan menerbitkan nomor tiket resmi CPT-YYYY-NNN tanpa perlu login!',
  },
  {
    title: 'Keadaan Darurat (112)',
    query: 'Bagaimana jika ada kondisi darurat yang membahayakan keselamatan?',
    reply:
      'Untuk kondisi darurat yang mengancam keselamatan jiwa (kebakaran, kabel listrik putus, banjir besar, kecelakaan), segera hubungi Call Center Darurat Tangsel 112 (Bebas Pulsa 24 Jam) dan tetap kirimkan laporan lokasi di CIGAP agar satgas dapat langsung bergerak.',
  },
  {
    title: 'Penanganan Terlalu Lama',
    query: 'Mengapa status laporan saya belum berubah atau terasa lama?',
    reply:
      'Setiap laporan melewati verifikasi posko dan disposisi ke dinas terkait (DSDABMBK, Dishub, DLH, atau Satpol PP). Anda bisa memantau estimasi tanggal selesai dan catatan progres petugas pada menu "Lacak Laporan". Jika ada kendala material/jaringan, status akan diperbarui dengan keterangan resmi.',
  },
  {
    title: 'Apakah Pelapor Aman & Anonim?',
    query: 'Apakah identitas dan nomor telepon pelapor aman jika saya melapor secara anonim?',
    reply:
      'Ya! Jika Anda memilih opsi "Sembunyikan Identitas (Anonim)", nama Anda ditampilkan sebagai "Warga Anonim" di portal publik, dan nomor kontak pelapor tidak pernah diekspos ke halaman publik.',
  },
  {
    title: 'Info Banjir & Cuaca Ciputat',
    query: 'Bagaimana memantau titik genangan banjir dan cuaca Ciputat?',
    reply:
      'Anda dapat memantau laporan drainase tersumbat dan genangan air secara langsung melalui Peta Digital Titik Pengaduan Ciputat di Beranda, serta melihat info peringatan cuaca lokal pada panel informasi wilayah.',
  },
  {
    title: 'Sanksi Laporan Palsu / Hoaks',
    query: 'Bagaimana sistem menyaring laporan palsu atau spam?',
    reply:
      'CIGAP menerapkan penyaringan keaslian multi-lapis: pemeriksaan batas koordinat Kecamatan Ciputat, kelengkapan bukti foto, deteksi teks spam/gibberish, dan peninjauan oleh petugas posko. Laporan terindikasi spam otomatis dikarantina.',
  },
];

export const INITIAL_WEATHER_INFO: WeatherInfo = {
  condition: 'hujan_lebat',
  temp: 26,
  humidity: 88,
  windSpeed: 18,
  alertTitle: 'Peringatan Siaga Genangan Air - Ciputat',
  alertDetail:
    'Hujan intensitas sedang hingga lebat terpantau di Ciputat & Ciputat Timur. Waspadai genangan 15-30cm di kolong Flyover Ciputat dan simpang Jl. Juanda - Jl. Dewi Sartika.',
  level: 'waspada',
  location: 'Kecamatan Ciputat, Kota Tangerang Selatan',
  updatedAt: '15 Menit Lalu (Update BMKG & BPBD Tangsel)',
};

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'CPT-2026-001',
    title: 'Lubang Aspal Menganga Dekat Pasar Ciputat',
    description:
      'Terdapat 2 lubang aspal yang cukup dalam (sekitar 15 cm) tepat di lajur kiri arah Pasar Ciputat menuju Jl. Dewi Sartika. Sangat membahayakan pengendara motor saat malam atau hujan tergenang air.',
    category: 'jalan_rusak',
    status: 'tindak_lanjut',
    urgency: 'tinggi',
    kelurahan: 'Ciputat',
    locationName: 'Jl. Dewi Sartika No. 12, sebelum perempatan Pasar Ciputat',
    coordinates: { lat: -6.3115, lng: 106.7452 },
    reporterName: 'Bambang Sudarsono',
    isAnonymous: false,
    photoUrl: '/assets/images/pothole.jpg',
    photos: [
      {
        id: 'ph-001-1',
        url: '/assets/images/pothole.jpg',
        caption: 'Kondisi lubang aspal berdiameter ±80cm di lajur kiri arah Pasar Ciputat.',
        uploadedAt: '15 Nov 2026, 08:30 WIB',
      },
      {
        id: 'ph-001-2',
        url: '/assets/images/road_pothole_evidence_1789879667430.jpg',
        caption: 'Tampak dekat kedalaman lubang tergenang air pasca hujan.',
        uploadedAt: '15 Nov 2026, 08:31 WIB',
      },
    ],
    createdAt: '15 Nov 2026, 08:30 WIB',
    createdAtIso: '2026-11-15T08:30:00+07:00',
    updatedAt: '17 Nov 2026, 09:00 WIB',
    estimatedCompletion: '20 November 2026',
    estimatedCompletionDate: '2026-11-20',
    estimatedUpdatedAt: '17 Nov 2026, 09:00 WIB',
    assignedDepartment: 'Dinas Sumber Daya Air, Bina Marga & Bina Konstruksi (DSDABMBK Tangsel)',
    officerName: 'Budi Santoso (Koordinator Satgas Jalan)',
    adminNotes:
      'Laporan diverifikasi prioritas tinggi. Material aspal hotmix dan tim satgas jalan sudah dikerahkan ke lokasi untuk penambalan.',
    upvotes: 42,
    verification: {
      trustScore: 94,
      isSuspectedFake: false,
      verdict: 'valid',
      reasons: [
        'Koordinat GPS valid di Jl. Dewi Sartika Ciputat',
        'Foto bukti otentik',
        'Narasi detail & bebas spam',
      ],
      checks: {
        gpsRadiusValid: true,
        photoAuthenticity: true,
        antiSpamScore: 95,
        contactVerified: true,
        duplicateClusterRisk: 'rendah',
      },
    },
    timeline: [
      {
        id: 't1',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Laporan tercatat dengan ID tiket #CPT-2026-001 dan masuk ke antrean sistem CiGap.',
        timestamp: '15 Nov 2026, 08:30 WIB',
        actor: 'Sistem Otomatis CIGAP',
      },
      {
        id: 't2',
        status: 'diverifikasi',
        title: 'Sedang Diverifikasi',
        description:
          'Laporan divalidasi oleh petugas posko wilayah Ciputat. Kelengkapan bukti dan titik koordinat dinyatakan valid.',
        timestamp: '15 Nov 2026, 10:15 WIB',
        actor: 'Budi Santoso (Pengawas Lapangan)',
      },
      {
        id: 't2b',
        status: 'dalam_peninjauan',
        title: 'Dalam Peninjauan',
        description: 'Tim survei teknis menilai kerusakan membutuhkan perbaikan aspal hotmix segera.',
        timestamp: '15 Nov 2026, 14:20 WIB',
        actor: 'Tim Survei DSDABMBK',
      },
      {
        id: 't2c',
        status: 'diteruskan_ke_dinas',
        title: 'Diteruskan ke Dinas',
        description:
          'Pengaduan resmi didisposisikan ke Dinas Sumber Daya Air, Bina Marga & Bina Konstruksi (DSDABMBK Tangsel).',
        timestamp: '16 Nov 2026, 08:00 WIB',
        actor: 'Posko Terpadu CiGap',
      },
      {
        id: 't3',
        status: 'tindak_lanjut',
        title: 'Dalam Penanganan',
        description:
          'Tim satgas DSDABMBK telah membawa mesin stamper dan aspal hotmix ke lokasi. Area sudah diberi safety cone.',
        timestamp: '17 Nov 2026, 09:00 WIB',
        actor: 'Satgas Jalan Tangsel Regu 2',
      },
    ],
  },
  {
    id: 'CPT-2026-002',
    title: 'Lampu PJU Mati Total Sepanjang Jalur Situ Gintung',
    description:
      'Lampu penerangan jalan umum (PJU) padam sebanyak 4 titik berturut-turut di sekitar tikungan jalan akses Danau Situ Gintung. Kondisi gelap gulita rawan kecelakaan dan kejahatan jalanan.',
    category: 'lampu_mati',
    status: 'selesai',
    urgency: 'sedang',
    kelurahan: 'Cipayung',
    locationName: 'Jl. Pisangan Raya arah Situ Gintung RW 04',
    coordinates: { lat: -6.3056, lng: 106.7584 },
    reporterName: 'Warga Peduli Situ Gintung',
    isAnonymous: true,
    photoUrl: '/assets/images/streetlight.jpg',
    photos: [
      {
        id: 'ph-002-1',
        url: '/assets/images/streetlight.jpg',
        caption: 'Tiang lampu PJU padam total di tikungan Jl. Pisangan Raya.',
        uploadedAt: '10 Nov 2026, 19:40 WIB',
      },
      {
        id: 'ph-002-2',
        url: '/assets/images/streetlight_pju_evidence_1789879679606.jpg',
        caption: 'Kondisi jalur gelap saat malam hari membahayakan pengendara.',
        uploadedAt: '10 Nov 2026, 19:42 WIB',
      },
    ],
    resolvedPhotoUrl: '/assets/images/streetlight_pju_evidence_1789879679606.jpg',
    createdAt: '10 Nov 2026, 19:40 WIB',
    createdAtIso: '2026-11-10T19:40:00+07:00',
    updatedAt: '12 Nov 2026, 18:00 WIB',
    estimatedCompletion: 'Selesai 12 November 2026',
    estimatedCompletionDate: '2026-11-12',
    assignedDepartment: 'Dinas Perhubungan (Dishub) Seksi Penerangan Jalan Tangsel',
    officerName: 'Hendra Wijaya (Teknisi PJU Tim 1)',
    adminNotes: 'Penggantian modul trafo dan lampu LED hemat energi 120W telah rampung dikerjakan.',
    upvotes: 28,
    feedback: {
      rating: 5,
      comment:
        'Luar biasa respons cepat dari tim Dishub! Kemarin malam lapor, sorenya mobil tangga sudah datang dan malam ini langsung terang benderang. Terima kasih Pemkot Tangsel & CIGAP!',
      createdAt: '12 Nov 2026, 21:10 WIB',
      civicName: 'Warga RW 04 Cipayung',
      upvotes: 19,
    },
    timeline: [
      {
        id: 't10',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Keluhan PJU padam diterima melalui portal warga CiGap.',
        timestamp: '10 Nov 2026, 19:40 WIB',
        actor: 'Portal LaporWarga',
      },
      {
        id: 't11',
        status: 'diverifikasi',
        title: 'Sedang Diverifikasi',
        description: 'Nomor tiang PJU teridentifikasi pada sistem GIS Dishub (Tiang CPT-PJU-889).',
        timestamp: '11 Nov 2026, 08:30 WIB',
        actor: 'Admin Dishub Tangsel',
      },
      {
        id: 't11b',
        status: 'diteruskan_ke_dinas',
        title: 'Diteruskan ke Dinas',
        description: 'Diteruskan kepada Dinas Perhubungan Seksi Penerangan Jalan Umum.',
        timestamp: '11 Nov 2026, 10:00 WIB',
        actor: 'Posko CiGap',
      },
      {
        id: 't12',
        status: 'tindak_lanjut',
        title: 'Dalam Penanganan',
        description: 'Teknisi dengan armada mobil skylift melakukan penggantian armature LED dan kabel konektor.',
        timestamp: '12 Nov 2026, 14:20 WIB',
        actor: 'Hendra Wijaya (Teknisi PJU Tim 1)',
      },
      {
        id: 't13',
        status: 'selesai',
        title: 'Selesai',
        description: 'PJU telah menyala terang kembali dan dilakukan uji nyala kelistrikan.',
        timestamp: '12 Nov 2026, 18:00 WIB',
        actor: 'Dishub Tangsel',
      },
    ],
  },
  {
    id: 'CPT-2026-003',
    title: 'Tumpukan Sampah Liar Mengotori Bahu Jalan Flyover Ciputat',
    description:
      'Banyak kantong sampah plastik dan limbah sayur basah menumpuk di bawah flyover Ciputat samping halte angkot. Baunya sangat menyengat dan mencemari pemandangan kota.',
    category: 'sampah_menumpuk',
    status: 'selesai',
    urgency: 'sedang',
    kelurahan: 'Ciputat',
    locationName: 'Kolong Flyover Ciputat, dekat halte angkot D01',
    coordinates: { lat: -6.3138, lng: 106.7431 },
    reporterName: 'Siti Rahmawati',
    isAnonymous: false,
    photoUrl: '/assets/images/waste.jpg',
    photos: [
      {
        id: 'ph-003-1',
        url: '/assets/images/waste.jpg',
        caption: 'Tumpukan kantong sampah di bahu jalan kolong Flyover Ciputat.',
        uploadedAt: '13 Nov 2026, 07:15 WIB',
      },
      {
        id: 'ph-003-2',
        url: '/assets/images/waste_cleanup_evidence_1789879692850.jpg',
        caption: 'Sisi halte angkot yang terdampak bau dan ceceran limbah.',
        uploadedAt: '13 Nov 2026, 07:16 WIB',
      },
    ],
    resolvedPhotoUrl: '/assets/images/waste_cleanup_evidence_1789879692850.jpg',
    createdAt: '13 Nov 2026, 07:15 WIB',
    createdAtIso: '2026-11-13T07:15:00+07:00',
    updatedAt: '13 Nov 2026, 13:45 WIB',
    estimatedCompletion: 'Selesai 13 November 2026',
    estimatedCompletionDate: '2026-11-13',
    assignedDepartment: 'Dinas Lingkungan Hidup (DLH) Kota Tangerang Selatan',
    officerName: 'Agus Salim (Pengawas DLH Ciputat)',
    adminNotes:
      'Armada dump truck compactor DLH telah mengangkut seluruh sampah ke TPA Cipeucang, dipasang spanduk larangan membuang sampah liar.',
    upvotes: 35,
    feedback: {
      rating: 5,
      comment:
        'Cepat sekali diangkut bersih, sekarang tidak bau lagi pas nunggu angkot. Semoga ada patroli Satpol PP biar ga buang sampah sembarangan lagi.',
      createdAt: '13 Nov 2026, 16:30 WIB',
      civicName: 'Siti Rahmawati',
      upvotes: 14,
    },
    timeline: [
      {
        id: 't20',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Laporan kebersihan lingkungan diterima oleh sistem CiGap.',
        timestamp: '13 Nov 2026, 07:15 WIB',
        actor: 'Sistem CIGAP',
      },
      {
        id: 't21',
        status: 'diverifikasi',
        title: 'Sedang Diverifikasi',
        description: 'Pengawas kebersihan memverifikasi volume sampah kurang lebih 1.5 ton.',
        timestamp: '13 Nov 2026, 09:00 WIB',
        actor: 'Agus Salim (Pengawas DLH)',
      },
      {
        id: 't22',
        status: 'tindak_lanjut',
        title: 'Dalam Penanganan',
        description: 'Armada truk sampah DLH dan 5 petugas pesapon melakukan pembersihan dan penyemprotan desinfektan.',
        timestamp: '13 Nov 2026, 11:30 WIB',
        actor: 'Pesapon & Armada DLH Tangsel',
      },
      {
        id: 't23',
        status: 'selesai',
        title: 'Selesai',
        description: 'Bahu jalan steril dari sampah dan dipasang plang sanksi Perda No. 3 Th 2019.',
        timestamp: '13 Nov 2026, 13:45 WIB',
        actor: 'DLH Kota Tangerang Selatan',
      },
    ],
  },
  {
    id: 'CPT-2026-004',
    title: 'Saluran Drainase Tersumbat Sampah & Sedimen Lumpur di Serua Indah',
    description:
      'Gorong-gorong tersumbat pekat lumpur dan botol plastik. Setiap kali hujan lebih dari 30 menit, air langsung meluap ke badan jalan setinggi betis orang dewasa.',
    category: 'drainase_tersumbat',
    status: 'diteruskan_ke_dinas',
    urgency: 'darurat',
    kelurahan: 'Serua Indah',
    locationName: 'Jl. Merpati Raya No. 88, depan SDN Serua Indah 01',
    coordinates: { lat: -6.3198, lng: 106.7291 },
    reporterName: 'H. Suwandi (Ketua RT 03)',
    isAnonymous: false,
    photoUrl: '/assets/images/drainage.jpg',
    photos: [
      {
        id: 'ph-004-1',
        url: '/assets/images/drainage.jpg',
        caption: 'Mulut gorong-gorong tertutup sedimen lumpur dan sampah plastik.',
        uploadedAt: '16 Nov 2026, 06:10 WIB',
      },
      {
        id: 'ph-004-2',
        url: '/assets/images/drainage_canal_evidence_1789879710573.jpg',
        caption: 'Air saluran meluap hingga ke bahu jalan depan sekolah.',
        uploadedAt: '16 Nov 2026, 06:12 WIB',
      },
    ],
    createdAt: '16 Nov 2026, 06:10 WIB',
    createdAtIso: '2026-11-16T06:10:00+07:00',
    updatedAt: '17 Nov 2026, 07:45 WIB',
    estimatedCompletion: '21 November 2026',
    estimatedCompletionDate: '2026-11-21',
    estimatedUpdatedAt: '17 Nov 2026, 07:45 WIB',
    assignedDepartment: 'Tim Drainase & Pengendalian Banjir (DSDABMBK Tangsel)',
    officerName: 'Dedi Kurniawan (Satgas SDA Wilayah Selatan)',
    adminNotes:
      'Laporan telah diteruskan ke dinas teknis. Menunggu penurunan unit mobil pompa lumpur (vacuum sediment) dan koordinasi lalu lintas.',
    upvotes: 51,
    timeline: [
      {
        id: 't30',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Laporan keluhan drainase warga RT 03 Serua Indah masuk ke sistem CiGap.',
        timestamp: '16 Nov 2026, 06:10 WIB',
        actor: 'Sistem CIGAP',
      },
      {
        id: 't31',
        status: 'diverifikasi',
        title: 'Sedang Diverifikasi',
        description: 'Telah ditinjau kelengkapan foto dan validitas lokasi di depan SDN Serua Indah 01.',
        timestamp: '16 Nov 2026, 07:45 WIB',
        actor: 'Posko Siaga Ciputat',
      },
      {
        id: 't32',
        status: 'dalam_peninjauan',
        title: 'Dalam Peninjauan',
        description: 'Lurah dan pengawas SDA meninjau titik sumbatan saluran air sepanjang 35 meter.',
        timestamp: '16 Nov 2026, 13:20 WIB',
        actor: 'Satuan Reaksi Cepat SDA',
      },
      {
        id: 't33',
        status: 'diteruskan_ke_dinas',
        title: 'Diteruskan ke Dinas',
        description: 'Diteruskan ke Tim Drainase & Pengendalian Banjir DSDABMBK Tangsel untuk pengerukan.',
        timestamp: '17 Nov 2026, 07:45 WIB',
        actor: 'Dedi Kurniawan (Satgas SDA)',
      },
    ],
  },
  {
    id: 'CPT-2026-005',
    title: 'Tutup Saluran Trotoar Bolong Rawan Terperosok di Jl. Juanda',
    description:
      'Grating besi tutup drainase trotoar pejalan kaki hilang dicuri/rusak di depan halte kampus UIN Syarif Hidayatullah. Pejalan kaki dan mahasiswa bisa terperosok ke dalam lubang 1.5 meter.',
    category: 'fasilitas_rusak',
    status: 'diterima',
    urgency: 'tinggi',
    kelurahan: 'Cipayung',
    locationName: 'Trotoar pejalan kaki Jl. Ir. H. Juanda seberang Kampus UIN Ciputat',
    coordinates: { lat: -6.3087, lng: 106.7533 },
    reporterName: 'Ananda Putri (Mahasiswi)',
    isAnonymous: false,
    photoUrl: '/assets/images/pothole.jpg',
    photos: [
      {
        id: 'ph-005-1',
        url: '/assets/images/pothole.jpg',
        caption: 'Lubang tutup saluran trotoar di depan halte seberang UIN.',
        uploadedAt: '17 Nov 2026, 09:20 WIB',
      },
    ],
    createdAt: '17 Nov 2026, 09:20 WIB',
    createdAtIso: '2026-11-17T09:20:00+07:00',
    updatedAt: '17 Nov 2026, 09:20 WIB',
    assignedDepartment: 'Seksi Pemeliharaan Sarana Prasarana Umum',
    adminNotes: 'Baru diterima. Menunggu petugas menetapkan jadwal survei dan estimasi penyelesaian.',
    upvotes: 19,
    timeline: [
      {
        id: 't40',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Keluhan fasilitas trotoar rusak tercatat dengan baik di sistem CiGap.',
        timestamp: '17 Nov 2026, 09:20 WIB',
        actor: 'Portal LaporWarga CIGAP',
      },
    ],
  },
  {
    id: 'CPT-2026-006',
    title: 'Pelayanan Antrean e-KTP Kelurahan Sawah Terlalu Lambat & Server Sering Down',
    description:
      'Warga lansia sudah mengantre sejak pukul 07.30 pagi namun sistem jaringan offline selama lebih dari 3 jam tanpa kejelasan dari petugas loket.',
    category: 'pelayanan_publik',
    status: 'menunggu_tindak_lanjut',
    urgency: 'sedang',
    kelurahan: 'Sawah',
    locationName: 'Kantor Kelurahan Sawah, Jl. Cendrawasih',
    coordinates: { lat: -6.3021, lng: 106.7329 },
    reporterName: 'Drs. Supardi',
    isAnonymous: false,
    photoUrl: '',
    photos: [],
    createdAt: '14 Nov 2026, 11:00 WIB',
    createdAtIso: '2026-11-14T11:00:00+07:00',
    updatedAt: '16 Nov 2026, 16:30 WIB',
    estimatedCompletion: '22 November 2026',
    estimatedCompletionDate: '2026-11-22',
    estimatedUpdatedAt: '16 Nov 2026, 16:30 WIB',
    isDelayed: true,
    delayReason:
      'Menunggu penggantian perangkat router fiber optic dari penyedia jaringan pusat Disdukcapil.',
    assignedDepartment: 'Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil) Kota Tangsel',
    officerName: 'Rina Marlina (Tim IT Disdukcapil)',
    adminNotes:
      'Loket darurat sudah beroperasi sementara, namun penggantian modul jaringan permanen menunggu pengiriman perangkat dari pusat.',
    upvotes: 64,
    timeline: [
      {
        id: 't50',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Keluhan layanan loket kelurahan masuk ke sistem CiGap.',
        timestamp: '14 Nov 2026, 11:00 WIB',
        actor: 'Sistem CIGAP',
      },
      {
        id: 't51',
        status: 'diverifikasi',
        title: 'Sedang Diverifikasi',
        description: 'Tim supervisi memverifikasi gangguan konektivitas SIAK di Kelurahan Sawah.',
        timestamp: '14 Nov 2026, 12:30 WIB',
        actor: 'Tim IT & Pelayanan Publik Tangsel',
      },
      {
        id: 't52',
        status: 'dalam_peninjauan',
        title: 'Dalam Peninjauan',
        description: 'Audit perangkat jaringan menemukan kerusakan pada switch utama loket.',
        timestamp: '15 Nov 2026, 10:15 WIB',
        actor: 'Rina Marlina (IT Disdukcapil)',
      },
      {
        id: 't53',
        status: 'menunggu_tindak_lanjut',
        title: 'Menunggu Tindak Lanjut',
        description: 'Penanganan membutuhkan waktu tambahan menunggu kedatangan modul router fiber optic cadangan.',
        timestamp: '16 Nov 2026, 16:30 WIB',
        actor: 'Disdukcapil Tangsel',
      },
    ],
  },
  {
    id: 'CPT-2026-007',
    title: 'Jalanan hancur parah coba benerin segera wkwk',
    description:
      'asdfghjkl tolong benerin cepet jangan lelet woy jalanannya ancur parah test testing asdf',
    category: 'jalan_rusak',
    status: 'ditolak',
    urgency: 'tinggi',
    kelurahan: 'Ciputat',
    locationName: 'Lokasi Acak (Titik Koordinat Terdeteksi di Luar Ciputat)',
    coordinates: { lat: -6.326, lng: 106.716 },
    reporterName: 'User_Troll_99',
    isAnonymous: true,
    photoUrl: '',
    photos: [],
    createdAt: '17 Nov 2026, 08:00 WIB',
    createdAtIso: '2026-11-17T08:00:00+07:00',
    updatedAt: '17 Nov 2026, 08:02 WIB',
    estimatedCompletion: 'Tidak Diproses (Ditolak)',
    rejectionReason:
      'Laporan terindikasi tidak valid/spam: deskripsi berisi kata acak ("asdfghjkl", "test testing") dan tidak melampirkan bukti lokasi yang sesuai.',
    assignedDepartment: 'Tim Verifikasi Anti-Fraud Posko CIGAP',
    adminNotes:
      'DITOLAK OLEH SISTEM & PETUGAS: Deskripsi teridentifikasi spam (gibberish) dan tidak memenuhi kelengkapan informasi lapangan.',
    upvotes: 0,
    verification: {
      trustScore: 28,
      isSuspectedFake: true,
      verdict: 'terindikasi_palsu',
      reasons: [
        'Terdeteksi pola kata acak/spam ("asdfghjkl", "test testing") pada deskripsi laporan.',
        'Format judul tidak memenuhi standar deskripsi fasilitas publik.',
      ],
      checks: {
        gpsRadiusValid: false,
        photoAuthenticity: false,
        antiSpamScore: 15,
        contactVerified: false,
        duplicateClusterRisk: 'rendah',
      },
      rejectionReason: 'Laporan Palsu: Teks spam & tidak ada bukti valid.',
      fraudAction: 'ditolak_hoaks',
      reviewedByAdmin: true,
    },
    timeline: [
      {
        id: 't70',
        status: 'diterima',
        title: 'Laporan Diterima',
        description: 'Laporan masuk ke gerbang validasi awal CiGap.',
        timestamp: '17 Nov 2026, 08:00 WIB',
        actor: 'Gerbang API CIGAP',
      },
      {
        id: 't71',
        status: 'ditolak',
        title: 'Ditolak',
        description:
          'Laporan ditolak karena terindikasi spam (Trust Score 28%) dan tidak memuat keterangan lokasi atau bukti yang valid.',
        timestamp: '17 Nov 2026, 08:02 WIB',
        actor: 'Sistem Deteksi Anti-Hoaks CIGAP',
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: ReportNotification[] = [
  {
    id: 'notif-001',
    reportId: 'CPT-2026-001',
    reportTitle: 'Lubang Aspal Menganga Dekat Pasar Ciputat',
    status: 'tindak_lanjut',
    title: 'Petugas di Lokasi Penanganan',
    message: 'Petugas sedang melakukan penanganan di lokasi.',
    timestamp: '17 Nov 2026, 09:00 WIB',
    createdAtIso: '2026-11-17T09:00:00+07:00',
    isRead: false,
    type: 'status_update',
  },
  {
    id: 'notif-002',
    reportId: 'CPT-2026-004',
    reportTitle: 'Saluran Drainase Tersumbat Sampah & Sedimen Lumpur di Serua Indah',
    status: 'diteruskan_ke_dinas',
    title: 'Diteruskan ke Dinas Teknis',
    message: 'Laporan telah diteruskan kepada Tim Drainase & Pengendalian Banjir (DSDABMBK Tangsel).',
    timestamp: '17 Nov 2026, 07:45 WIB',
    createdAtIso: '2026-11-17T07:45:00+07:00',
    isRead: false,
    type: 'status_update',
  },
  {
    id: 'notif-003',
    reportId: 'CPT-2026-006',
    reportTitle: 'Pelayanan Antrean e-KTP Kelurahan Sawah Terlalu Lambat & Server Sering Down',
    status: 'menunggu_tindak_lanjut',
    title: 'Pembaruan Estimasi Penanganan',
    message: 'Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.',
    timestamp: '16 Nov 2026, 16:30 WIB',
    createdAtIso: '2026-11-16T16:30:00+07:00',
    isRead: false,
    type: 'delay',
  },
  {
    id: 'notif-004',
    reportId: 'CPT-2026-005',
    reportTitle: 'Tutup Saluran Trotoar Bolong Rawan Terperosok di Jl. Juanda',
    status: 'diterima',
    title: 'Pengaduan Diterima',
    message: 'Pengaduan Anda berhasil diterima oleh sistem CiGap.',
    timestamp: '17 Nov 2026, 09:20 WIB',
    createdAtIso: '2026-11-17T09:20:00+07:00',
    isRead: true,
    type: 'created',
  },
  {
    id: 'notif-005',
    reportId: 'CPT-2026-002',
    reportTitle: 'Lampu PJU Mati Total Sepanjang Jalur Situ Gintung',
    status: 'selesai',
    title: 'Penanganan Selesai',
    message: 'Penanganan laporan telah selesai. Silakan periksa hasil tindak lanjut.',
    timestamp: '12 Nov 2026, 18:00 WIB',
    createdAtIso: '2026-11-12T18:00:00+07:00',
    isRead: true,
    type: 'resolved',
  },
];
