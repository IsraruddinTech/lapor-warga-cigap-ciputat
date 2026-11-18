// server.ts
import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// src/data/mockReports.ts
var INITIAL_REPORTS = [
  {
    id: "CPT-2026-001",
    title: "Lubang Aspal Menganga Dekat Pasar Ciputat",
    description: "Terdapat 2 lubang aspal yang cukup dalam (sekitar 15 cm) tepat di lajur kiri arah Pasar Ciputat menuju Jl. Dewi Sartika. Sangat membahayakan pengendara motor saat malam atau hujan tergenang air.",
    category: "jalan_rusak",
    status: "tindak_lanjut",
    urgency: "tinggi",
    kelurahan: "Ciputat",
    locationName: "Jl. Dewi Sartika No. 12, sebelum perempatan Pasar Ciputat",
    coordinates: { lat: -6.3115, lng: 106.7452 },
    reporterName: "Bambang Sudarsono",
    isAnonymous: false,
    photoUrl: "/assets/images/pothole.jpg",
    photos: [
      {
        id: "ph-001-1",
        url: "/assets/images/pothole.jpg",
        caption: "Kondisi lubang aspal berdiameter \xB180cm di lajur kiri arah Pasar Ciputat.",
        uploadedAt: "15 Nov 2026, 08:30 WIB"
      },
      {
        id: "ph-001-2",
        url: "/assets/images/road_pothole_evidence_1789879667430.jpg",
        caption: "Tampak dekat kedalaman lubang tergenang air pasca hujan.",
        uploadedAt: "15 Nov 2026, 08:31 WIB"
      }
    ],
    createdAt: "15 Nov 2026, 08:30 WIB",
    createdAtIso: "2026-11-15T08:30:00+07:00",
    updatedAt: "17 Nov 2026, 09:00 WIB",
    estimatedCompletion: "20 November 2026",
    estimatedCompletionDate: "2026-11-20",
    estimatedUpdatedAt: "17 Nov 2026, 09:00 WIB",
    assignedDepartment: "Dinas Sumber Daya Air, Bina Marga & Bina Konstruksi (DSDABMBK Tangsel)",
    officerName: "Budi Santoso (Koordinator Satgas Jalan)",
    adminNotes: "Laporan diverifikasi prioritas tinggi. Material aspal hotmix dan tim satgas jalan sudah dikerahkan ke lokasi untuk penambalan.",
    upvotes: 42,
    verification: {
      trustScore: 94,
      isSuspectedFake: false,
      verdict: "valid",
      reasons: ["Koordinat GPS valid di Jl. Dewi Sartika Ciputat", "Foto bukti otentik", "Narasi detail & bebas spam"],
      checks: {
        gpsRadiusValid: true,
        photoAuthenticity: true,
        antiSpamScore: 95,
        contactVerified: true,
        duplicateClusterRisk: "rendah"
      }
    },
    timeline: [
      {
        id: "t1",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Laporan tercatat dengan ID tiket #CPT-2026-001 dan masuk ke antrean sistem CiGap.",
        timestamp: "15 Nov 2026, 08:30 WIB",
        actor: "Sistem Otomatis CIGAP"
      },
      {
        id: "t2",
        status: "diverifikasi",
        title: "Sedang Diverifikasi",
        description: "Laporan divalidasi oleh petugas posko wilayah Ciputat. Kelengkapan bukti dan titik koordinat dinyatakan valid.",
        timestamp: "15 Nov 2026, 10:15 WIB",
        actor: "Budi Santoso (Pengawas Lapangan)"
      },
      {
        id: "t2b",
        status: "dalam_peninjauan",
        title: "Dalam Peninjauan",
        description: "Tim survei teknis menilai kerusakan membutuhkan perbaikan aspal hotmix segera.",
        timestamp: "15 Nov 2026, 14:20 WIB",
        actor: "Tim Survei DSDABMBK"
      },
      {
        id: "t2c",
        status: "diteruskan_ke_dinas",
        title: "Diteruskan ke Dinas",
        description: "Pengaduan resmi didisposisikan ke Dinas Sumber Daya Air, Bina Marga & Bina Konstruksi (DSDABMBK Tangsel).",
        timestamp: "16 Nov 2026, 08:00 WIB",
        actor: "Posko Terpadu CiGap"
      },
      {
        id: "t3",
        status: "tindak_lanjut",
        title: "Dalam Penanganan",
        description: "Tim satgas DSDABMBK telah membawa mesin stamper dan aspal hotmix ke lokasi. Area sudah diberi safety cone.",
        timestamp: "17 Nov 2026, 09:00 WIB",
        actor: "Satgas Jalan Tangsel Regu 2"
      }
    ]
  },
  {
    id: "CPT-2026-002",
    title: "Lampu PJU Mati Total Sepanjang Jalur Situ Gintung",
    description: "Lampu penerangan jalan umum (PJU) padam sebanyak 4 titik berturut-turut di sekitar tikungan jalan akses Danau Situ Gintung. Kondisi gelap gulita rawan kecelakaan dan kejahatan jalanan.",
    category: "lampu_mati",
    status: "selesai",
    urgency: "sedang",
    kelurahan: "Cipayung",
    locationName: "Jl. Pisangan Raya arah Situ Gintung RW 04",
    coordinates: { lat: -6.3056, lng: 106.7584 },
    reporterName: "Warga Peduli Situ Gintung",
    isAnonymous: true,
    photoUrl: "/assets/images/streetlight.jpg",
    photos: [
      {
        id: "ph-002-1",
        url: "/assets/images/streetlight.jpg",
        caption: "Tiang lampu PJU padam total di tikungan Jl. Pisangan Raya.",
        uploadedAt: "10 Nov 2026, 19:40 WIB"
      },
      {
        id: "ph-002-2",
        url: "/assets/images/streetlight_pju_evidence_1789879679606.jpg",
        caption: "Kondisi jalur gelap saat malam hari membahayakan pengendara.",
        uploadedAt: "10 Nov 2026, 19:42 WIB"
      }
    ],
    resolvedPhotoUrl: "/assets/images/streetlight_pju_evidence_1789879679606.jpg",
    createdAt: "10 Nov 2026, 19:40 WIB",
    createdAtIso: "2026-11-10T19:40:00+07:00",
    updatedAt: "12 Nov 2026, 18:00 WIB",
    estimatedCompletion: "Selesai 12 November 2026",
    estimatedCompletionDate: "2026-11-12",
    assignedDepartment: "Dinas Perhubungan (Dishub) Seksi Penerangan Jalan Tangsel",
    officerName: "Hendra Wijaya (Teknisi PJU Tim 1)",
    adminNotes: "Penggantian modul trafo dan lampu LED hemat energi 120W telah rampung dikerjakan.",
    upvotes: 28,
    feedback: {
      rating: 5,
      comment: "Luar biasa respons cepat dari tim Dishub! Kemarin malam lapor, sorenya mobil tangga sudah datang dan malam ini langsung terang benderang. Terima kasih Pemkot Tangsel & CIGAP!",
      createdAt: "12 Nov 2026, 21:10 WIB",
      civicName: "Warga RW 04 Cipayung",
      upvotes: 19
    },
    timeline: [
      {
        id: "t10",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Keluhan PJU padam diterima melalui portal warga CiGap.",
        timestamp: "10 Nov 2026, 19:40 WIB",
        actor: "Portal LaporWarga"
      },
      {
        id: "t11",
        status: "diverifikasi",
        title: "Sedang Diverifikasi",
        description: "Nomor tiang PJU teridentifikasi pada sistem GIS Dishub (Tiang CPT-PJU-889).",
        timestamp: "11 Nov 2026, 08:30 WIB",
        actor: "Admin Dishub Tangsel"
      },
      {
        id: "t11b",
        status: "diteruskan_ke_dinas",
        title: "Diteruskan ke Dinas",
        description: "Diteruskan kepada Dinas Perhubungan Seksi Penerangan Jalan Umum.",
        timestamp: "11 Nov 2026, 10:00 WIB",
        actor: "Posko CiGap"
      },
      {
        id: "t12",
        status: "tindak_lanjut",
        title: "Dalam Penanganan",
        description: "Teknisi dengan armada mobil skylift melakukan penggantian armature LED dan kabel konektor.",
        timestamp: "12 Nov 2026, 14:20 WIB",
        actor: "Hendra Wijaya (Teknisi PJU Tim 1)"
      },
      {
        id: "t13",
        status: "selesai",
        title: "Selesai",
        description: "PJU telah menyala terang kembali dan dilakukan uji nyala kelistrikan.",
        timestamp: "12 Nov 2026, 18:00 WIB",
        actor: "Dishub Tangsel"
      }
    ]
  },
  {
    id: "CPT-2026-003",
    title: "Tumpukan Sampah Liar Mengotori Bahu Jalan Flyover Ciputat",
    description: "Banyak kantong sampah plastik dan limbah sayur basah menumpuk di bawah flyover Ciputat samping halte angkot. Baunya sangat menyengat dan mencemari pemandangan kota.",
    category: "sampah_menumpuk",
    status: "selesai",
    urgency: "sedang",
    kelurahan: "Ciputat",
    locationName: "Kolong Flyover Ciputat, dekat halte angkot D01",
    coordinates: { lat: -6.3138, lng: 106.7431 },
    reporterName: "Siti Rahmawati",
    isAnonymous: false,
    photoUrl: "/assets/images/waste.jpg",
    photos: [
      {
        id: "ph-003-1",
        url: "/assets/images/waste.jpg",
        caption: "Tumpukan kantong sampah di bahu jalan kolong Flyover Ciputat.",
        uploadedAt: "13 Nov 2026, 07:15 WIB"
      },
      {
        id: "ph-003-2",
        url: "/assets/images/waste_cleanup_evidence_1789879692850.jpg",
        caption: "Sisi halte angkot yang terdampak bau dan ceceran limbah.",
        uploadedAt: "13 Nov 2026, 07:16 WIB"
      }
    ],
    resolvedPhotoUrl: "/assets/images/waste_cleanup_evidence_1789879692850.jpg",
    createdAt: "13 Nov 2026, 07:15 WIB",
    createdAtIso: "2026-11-13T07:15:00+07:00",
    updatedAt: "13 Nov 2026, 13:45 WIB",
    estimatedCompletion: "Selesai 13 November 2026",
    estimatedCompletionDate: "2026-11-13",
    assignedDepartment: "Dinas Lingkungan Hidup (DLH) Kota Tangerang Selatan",
    officerName: "Agus Salim (Pengawas DLH Ciputat)",
    adminNotes: "Armada dump truck compactor DLH telah mengangkut seluruh sampah ke TPA Cipeucang, dipasang spanduk larangan membuang sampah liar.",
    upvotes: 35,
    feedback: {
      rating: 5,
      comment: "Cepat sekali diangkut bersih, sekarang tidak bau lagi pas nunggu angkot. Semoga ada patroli Satpol PP biar ga buang sampah sembarangan lagi.",
      createdAt: "13 Nov 2026, 16:30 WIB",
      civicName: "Siti Rahmawati",
      upvotes: 14
    },
    timeline: [
      {
        id: "t20",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Laporan kebersihan lingkungan diterima oleh sistem CiGap.",
        timestamp: "13 Nov 2026, 07:15 WIB",
        actor: "Sistem CIGAP"
      },
      {
        id: "t21",
        status: "diverifikasi",
        title: "Sedang Diverifikasi",
        description: "Pengawas kebersihan memverifikasi volume sampah kurang lebih 1.5 ton.",
        timestamp: "13 Nov 2026, 09:00 WIB",
        actor: "Agus Salim (Pengawas DLH)"
      },
      {
        id: "t22",
        status: "tindak_lanjut",
        title: "Dalam Penanganan",
        description: "Armada truk sampah DLH dan 5 petugas pesapon melakukan pembersihan dan penyemprotan desinfektan.",
        timestamp: "13 Nov 2026, 11:30 WIB",
        actor: "Pesapon & Armada DLH Tangsel"
      },
      {
        id: "t23",
        status: "selesai",
        title: "Selesai",
        description: "Bahu jalan steril dari sampah dan dipasang plang sanksi Perda No. 3 Th 2019.",
        timestamp: "13 Nov 2026, 13:45 WIB",
        actor: "DLH Kota Tangerang Selatan"
      }
    ]
  },
  {
    id: "CPT-2026-004",
    title: "Saluran Drainase Tersumbat Sampah & Sedimen Lumpur di Serua Indah",
    description: "Gorong-gorong tersumbat pekat lumpur dan botol plastik. Setiap kali hujan lebih dari 30 menit, air langsung meluap ke badan jalan setinggi betis orang dewasa.",
    category: "drainase_tersumbat",
    status: "diteruskan_ke_dinas",
    urgency: "darurat",
    kelurahan: "Serua Indah",
    locationName: "Jl. Merpati Raya No. 88, depan SDN Serua Indah 01",
    coordinates: { lat: -6.3198, lng: 106.7291 },
    reporterName: "H. Suwandi (Ketua RT 03)",
    isAnonymous: false,
    photoUrl: "/assets/images/drainage.jpg",
    photos: [
      {
        id: "ph-004-1",
        url: "/assets/images/drainage.jpg",
        caption: "Mulut gorong-gorong tertutup sedimen lumpur dan sampah plastik.",
        uploadedAt: "16 Nov 2026, 06:10 WIB"
      },
      {
        id: "ph-004-2",
        url: "/assets/images/drainage_canal_evidence_1789879710573.jpg",
        caption: "Air saluran meluap hingga ke bahu jalan depan sekolah.",
        uploadedAt: "16 Nov 2026, 06:12 WIB"
      }
    ],
    createdAt: "16 Nov 2026, 06:10 WIB",
    createdAtIso: "2026-11-16T06:10:00+07:00",
    updatedAt: "17 Nov 2026, 07:45 WIB",
    estimatedCompletion: "21 November 2026",
    estimatedCompletionDate: "2026-11-21",
    estimatedUpdatedAt: "17 Nov 2026, 07:45 WIB",
    assignedDepartment: "Tim Drainase & Pengendalian Banjir (DSDABMBK Tangsel)",
    officerName: "Dedi Kurniawan (Satgas SDA Wilayah Selatan)",
    adminNotes: "Laporan telah diteruskan ke dinas teknis. Menunggu penurunan unit mobil pompa lumpur (vacuum sediment) dan koordinasi lalu lintas.",
    upvotes: 51,
    timeline: [
      {
        id: "t30",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Laporan keluhan drainase warga RT 03 Serua Indah masuk ke sistem CiGap.",
        timestamp: "16 Nov 2026, 06:10 WIB",
        actor: "Sistem CIGAP"
      },
      {
        id: "t31",
        status: "diverifikasi",
        title: "Sedang Diverifikasi",
        description: "Telah ditinjau kelengkapan foto dan validitas lokasi di depan SDN Serua Indah 01.",
        timestamp: "16 Nov 2026, 07:45 WIB",
        actor: "Posko Siaga Ciputat"
      },
      {
        id: "t32",
        status: "dalam_peninjauan",
        title: "Dalam Peninjauan",
        description: "Lurah dan pengawas SDA meninjau titik sumbatan saluran air sepanjang 35 meter.",
        timestamp: "16 Nov 2026, 13:20 WIB",
        actor: "Satuan Reaksi Cepat SDA"
      },
      {
        id: "t33",
        status: "diteruskan_ke_dinas",
        title: "Diteruskan ke Dinas",
        description: "Diteruskan ke Tim Drainase & Pengendalian Banjir DSDABMBK Tangsel untuk pengerukan.",
        timestamp: "17 Nov 2026, 07:45 WIB",
        actor: "Dedi Kurniawan (Satgas SDA)"
      }
    ]
  },
  {
    id: "CPT-2026-005",
    title: "Tutup Saluran Trotoar Bolong Rawan Terperosok di Jl. Juanda",
    description: "Grating besi tutup drainase trotoar pejalan kaki hilang dicuri/rusak di depan halte kampus UIN Syarif Hidayatullah. Pejalan kaki dan mahasiswa bisa terperosok ke dalam lubang 1.5 meter.",
    category: "fasilitas_rusak",
    status: "diterima",
    urgency: "tinggi",
    kelurahan: "Cipayung",
    locationName: "Trotoar pejalan kaki Jl. Ir. H. Juanda seberang Kampus UIN Ciputat",
    coordinates: { lat: -6.3087, lng: 106.7533 },
    reporterName: "Ananda Putri (Mahasiswi)",
    isAnonymous: false,
    photoUrl: "/assets/images/pothole.jpg",
    photos: [
      {
        id: "ph-005-1",
        url: "/assets/images/pothole.jpg",
        caption: "Lubang tutup saluran trotoar di depan halte seberang UIN.",
        uploadedAt: "17 Nov 2026, 09:20 WIB"
      }
    ],
    createdAt: "17 Nov 2026, 09:20 WIB",
    createdAtIso: "2026-11-17T09:20:00+07:00",
    updatedAt: "17 Nov 2026, 09:20 WIB",
    assignedDepartment: "Seksi Pemeliharaan Sarana Prasarana Umum",
    adminNotes: "Baru diterima. Menunggu petugas menetapkan jadwal survei dan estimasi penyelesaian.",
    upvotes: 19,
    timeline: [
      {
        id: "t40",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Keluhan fasilitas trotoar rusak tercatat dengan baik di sistem CiGap.",
        timestamp: "17 Nov 2026, 09:20 WIB",
        actor: "Portal LaporWarga CIGAP"
      }
    ]
  },
  {
    id: "CPT-2026-006",
    title: "Pelayanan Antrean e-KTP Kelurahan Sawah Terlalu Lambat & Server Sering Down",
    description: "Warga lansia sudah mengantre sejak pukul 07.30 pagi namun sistem jaringan offline selama lebih dari 3 jam tanpa kejelasan dari petugas loket.",
    category: "pelayanan_publik",
    status: "menunggu_tindak_lanjut",
    urgency: "sedang",
    kelurahan: "Sawah",
    locationName: "Kantor Kelurahan Sawah, Jl. Cendrawasih",
    coordinates: { lat: -6.3021, lng: 106.7329 },
    reporterName: "Drs. Supardi",
    isAnonymous: false,
    photoUrl: "",
    photos: [],
    createdAt: "14 Nov 2026, 11:00 WIB",
    createdAtIso: "2026-11-14T11:00:00+07:00",
    updatedAt: "16 Nov 2026, 16:30 WIB",
    estimatedCompletion: "22 November 2026",
    estimatedCompletionDate: "2026-11-22",
    estimatedUpdatedAt: "16 Nov 2026, 16:30 WIB",
    isDelayed: true,
    delayReason: "Menunggu penggantian perangkat router fiber optic dari penyedia jaringan pusat Disdukcapil.",
    assignedDepartment: "Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil) Kota Tangsel",
    officerName: "Rina Marlina (Tim IT Disdukcapil)",
    adminNotes: "Loket darurat sudah beroperasi sementara, namun penggantian modul jaringan permanen menunggu pengiriman perangkat dari pusat.",
    upvotes: 64,
    timeline: [
      {
        id: "t50",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Keluhan layanan loket kelurahan masuk ke sistem CiGap.",
        timestamp: "14 Nov 2026, 11:00 WIB",
        actor: "Sistem CIGAP"
      },
      {
        id: "t51",
        status: "diverifikasi",
        title: "Sedang Diverifikasi",
        description: "Tim supervisi memverifikasi gangguan konektivitas SIAK di Kelurahan Sawah.",
        timestamp: "14 Nov 2026, 12:30 WIB",
        actor: "Tim IT & Pelayanan Publik Tangsel"
      },
      {
        id: "t52",
        status: "dalam_peninjauan",
        title: "Dalam Peninjauan",
        description: "Audit perangkat jaringan menemukan kerusakan pada switch utama loket.",
        timestamp: "15 Nov 2026, 10:15 WIB",
        actor: "Rina Marlina (IT Disdukcapil)"
      },
      {
        id: "t53",
        status: "menunggu_tindak_lanjut",
        title: "Menunggu Tindak Lanjut",
        description: "Penanganan membutuhkan waktu tambahan menunggu kedatangan modul router fiber optic cadangan.",
        timestamp: "16 Nov 2026, 16:30 WIB",
        actor: "Disdukcapil Tangsel"
      }
    ]
  },
  {
    id: "CPT-2026-007",
    title: "Jalanan hancur parah coba benerin segera wkwk",
    description: "asdfghjkl tolong benerin cepet jangan lelet woy jalanannya ancur parah test testing asdf",
    category: "jalan_rusak",
    status: "ditolak",
    urgency: "tinggi",
    kelurahan: "Ciputat",
    locationName: "Lokasi Acak (Titik Koordinat Terdeteksi di Luar Ciputat)",
    coordinates: { lat: -6.326, lng: 106.716 },
    reporterName: "User_Troll_99",
    isAnonymous: true,
    photoUrl: "",
    photos: [],
    createdAt: "17 Nov 2026, 08:00 WIB",
    createdAtIso: "2026-11-17T08:00:00+07:00",
    updatedAt: "17 Nov 2026, 08:02 WIB",
    estimatedCompletion: "Tidak Diproses (Ditolak)",
    rejectionReason: 'Laporan terindikasi tidak valid/spam: deskripsi berisi kata acak ("asdfghjkl", "test testing") dan tidak melampirkan bukti lokasi yang sesuai.',
    assignedDepartment: "Tim Verifikasi Anti-Fraud Posko CIGAP",
    adminNotes: "DITOLAK OLEH SISTEM & PETUGAS: Deskripsi teridentifikasi spam (gibberish) dan tidak memenuhi kelengkapan informasi lapangan.",
    upvotes: 0,
    verification: {
      trustScore: 28,
      isSuspectedFake: true,
      verdict: "terindikasi_palsu",
      reasons: [
        'Terdeteksi pola kata acak/spam ("asdfghjkl", "test testing") pada deskripsi laporan.',
        "Format judul tidak memenuhi standar deskripsi fasilitas publik."
      ],
      checks: {
        gpsRadiusValid: false,
        photoAuthenticity: false,
        antiSpamScore: 15,
        contactVerified: false,
        duplicateClusterRisk: "rendah"
      },
      rejectionReason: "Laporan Palsu: Teks spam & tidak ada bukti valid.",
      fraudAction: "ditolak_hoaks",
      reviewedByAdmin: true
    },
    timeline: [
      {
        id: "t70",
        status: "diterima",
        title: "Laporan Diterima",
        description: "Laporan masuk ke gerbang validasi awal CiGap.",
        timestamp: "17 Nov 2026, 08:00 WIB",
        actor: "Gerbang API CIGAP"
      },
      {
        id: "t71",
        status: "ditolak",
        title: "Ditolak",
        description: "Laporan ditolak karena terindikasi spam (Trust Score 28%) dan tidak memuat keterangan lokasi atau bukti yang valid.",
        timestamp: "17 Nov 2026, 08:02 WIB",
        actor: "Sistem Deteksi Anti-Hoaks CIGAP"
      }
    ]
  }
];
var INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    reportId: "CPT-2026-001",
    reportTitle: "Lubang Aspal Menganga Dekat Pasar Ciputat",
    status: "tindak_lanjut",
    title: "Petugas di Lokasi Penanganan",
    message: "Petugas sedang melakukan penanganan di lokasi.",
    timestamp: "17 Nov 2026, 09:00 WIB",
    createdAtIso: "2026-11-17T09:00:00+07:00",
    isRead: false,
    type: "status_update"
  },
  {
    id: "notif-002",
    reportId: "CPT-2026-004",
    reportTitle: "Saluran Drainase Tersumbat Sampah & Sedimen Lumpur di Serua Indah",
    status: "diteruskan_ke_dinas",
    title: "Diteruskan ke Dinas Teknis",
    message: "Laporan telah diteruskan kepada Tim Drainase & Pengendalian Banjir (DSDABMBK Tangsel).",
    timestamp: "17 Nov 2026, 07:45 WIB",
    createdAtIso: "2026-11-17T07:45:00+07:00",
    isRead: false,
    type: "status_update"
  },
  {
    id: "notif-003",
    reportId: "CPT-2026-006",
    reportTitle: "Pelayanan Antrean e-KTP Kelurahan Sawah Terlalu Lambat & Server Sering Down",
    status: "menunggu_tindak_lanjut",
    title: "Pembaruan Estimasi Penanganan",
    message: "Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.",
    timestamp: "16 Nov 2026, 16:30 WIB",
    createdAtIso: "2026-11-16T16:30:00+07:00",
    isRead: false,
    type: "delay"
  },
  {
    id: "notif-004",
    reportId: "CPT-2026-005",
    reportTitle: "Tutup Saluran Trotoar Bolong Rawan Terperosok di Jl. Juanda",
    status: "diterima",
    title: "Pengaduan Diterima",
    message: "Pengaduan Anda berhasil diterima oleh sistem CiGap.",
    timestamp: "17 Nov 2026, 09:20 WIB",
    createdAtIso: "2026-11-17T09:20:00+07:00",
    isRead: true,
    type: "created"
  },
  {
    id: "notif-005",
    reportId: "CPT-2026-002",
    reportTitle: "Lampu PJU Mati Total Sepanjang Jalur Situ Gintung",
    status: "selesai",
    title: "Penanganan Selesai",
    message: "Penanganan laporan telah selesai. Silakan periksa hasil tindak lanjut.",
    timestamp: "12 Nov 2026, 18:00 WIB",
    createdAtIso: "2026-11-12T18:00:00+07:00",
    isRead: true,
    type: "resolved"
  }
];
var STATUS_LABELS = {
  diterima: {
    label: "Laporan Diterima",
    shortLabel: "Diterima",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    markerGroup: "blue",
    stepIndex: 1,
    description: "Pengaduan berhasil dikirim dan tercatat di sistem CiGap.",
    defaultNotifMessage: "Pengaduan Anda berhasil diterima oleh sistem CiGap."
  },
  diverifikasi: {
    label: "Sedang Diverifikasi",
    shortLabel: "Verifikasi",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    markerGroup: "purple",
    stepIndex: 2,
    description: "Petugas sedang memeriksa kelengkapan dan kebenaran laporan.",
    defaultNotifMessage: "Laporan Anda sedang dalam proses verifikasi oleh petugas."
  },
  dalam_peninjauan: {
    label: "Dalam Peninjauan",
    shortLabel: "Peninjauan",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    markerGroup: "purple",
    stepIndex: 3,
    description: "Laporan sedang ditinjau oleh petugas atau dinas terkait.",
    defaultNotifMessage: "Laporan Anda sedang ditinjau oleh Dinas terkait."
  },
  diteruskan_ke_dinas: {
    label: "Diteruskan ke Dinas",
    shortLabel: "Ke Dinas",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    markerGroup: "orange",
    stepIndex: 4,
    description: "Pengaduan telah diteruskan kepada instansi yang berwenang.",
    defaultNotifMessage: "Laporan telah diteruskan kepada dinas teknis terkait."
  },
  tindak_lanjut: {
    label: "Dalam Penanganan",
    shortLabel: "Penanganan",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    markerGroup: "orange",
    stepIndex: 5,
    description: "Petugas sedang melakukan tindakan atau perbaikan di lapangan.",
    defaultNotifMessage: "Petugas sedang melakukan penanganan di lokasi."
  },
  menunggu_tindak_lanjut: {
    label: "Menunggu Tindak Lanjut",
    shortLabel: "Tindak Lanjut",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
    markerGroup: "orange",
    stepIndex: 6,
    description: "Pengaduan membutuhkan koordinasi, material, atau proses lanjutan.",
    defaultNotifMessage: "Pengaduan membutuhkan koordinasi atau material lanjutan dari dinas."
  },
  selesai: {
    label: "Selesai",
    shortLabel: "Selesai",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    markerGroup: "green",
    stepIndex: 7,
    description: "Permasalahan telah ditangani dan bukti penyelesaian telah dilampirkan.",
    defaultNotifMessage: "Penanganan laporan telah selesai. Silakan periksa hasil tindak lanjut."
  },
  ditolak: {
    label: "Ditolak",
    shortLabel: "Ditolak",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    markerGroup: "red",
    stepIndex: 0,
    description: "Laporan tidak dapat diproses karena alasan yang ditetapkan petugas.",
    defaultNotifMessage: "Laporan Anda tidak dapat diproses lebih lanjut. Silakan periksa alasan penolakan."
  }
};

// server.ts
var IS_VERCEL = Boolean(process.env.VERCEL);
var PORT = Number(process.env.PORT) || 3e3;
var ROOT_DIR = process.cwd();
var DATA_DIR = process.env.CIGAP_DATA_DIR || (IS_VERCEL ? path.join("/tmp", "cigap-data") : path.join(ROOT_DIR, "data"));
var UPLOADS_DIR = path.join(DATA_DIR, "uploads");
var DB_FILE = path.join(DATA_DIR, "cigap-db.json");
var SESSIONS_FILE = path.join(DATA_DIR, "cigap-sessions.json");
var ADMIN_SESSION_COOKIE = "cigap_admin_session";
var SESSION_TTL_MS = 4 * 60 * 60 * 1e3;
var LOGIN_MAX_FAILURES = 5;
var LOGIN_WINDOW_MS = 5 * 60 * 1e3;
var LOGIN_LOCKOUT_MS = 5 * 60 * 1e3;
var BULAN_SHORT_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
function formatWibNow(date = /* @__PURE__ */ new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(date);
    const get = (t) => parts.find((p) => p.type === t)?.value || "";
    const day = get("day");
    const monthIdx = Math.max(0, Number(get("month")) - 1);
    const year = get("year");
    const hour = get("hour");
    const minute = get("minute");
    return `${day} ${BULAN_SHORT_ID[monthIdx]} ${year}, ${hour}:${minute} WIB`;
  } catch {
    return `${date.getDate()} ${BULAN_SHORT_ID[date.getMonth()]} ${date.getFullYear()} WIB`;
  }
}
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
function normalizeReport(r) {
  const photos = Array.isArray(r.photos) && r.photos.length > 0 ? r.photos : r.photoUrl && r.photoUrl.trim() !== "" ? [{ id: `ph-${r.id}`, url: r.photoUrl, uploadedAt: r.createdAt }] : [];
  return {
    ...r,
    photos,
    photoUrl: photos[0]?.url || r.photoUrl || "",
    updatedAt: r.updatedAt || r.createdAt
  };
}
function getWibYear(date = /* @__PURE__ */ new Date()) {
  try {
    const yearStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric"
    }).format(date);
    const parsed = Number(yearStr);
    if (Number.isInteger(parsed) && parsed >= 2020) {
      return String(parsed);
    }
  } catch {
  }
  return String(date.getFullYear());
}
function computeMaxSequenceByYear(reports, existingMap) {
  const result = { ...existingMap || {} };
  for (const r of reports) {
    if (!r?.id) continue;
    const match = r.id.match(/^CPT-(\d{4})-(\d+)$/);
    if (match) {
      const yr = match[1];
      const seq = Number(match[2]);
      if (Number.isFinite(seq) && seq > (result[yr] || 0)) {
        result[yr] = seq;
      }
    }
  }
  return result;
}
function generateUniqueReportId(database, now = /* @__PURE__ */ new Date()) {
  const year = getWibYear(now);
  const seqMap = computeMaxSequenceByYear(database.reports, database.lastSequenceByYear);
  let nextSeq = (seqMap[year] || 0) + 1;
  const existingIds = new Set(database.reports.map((r) => r.id));
  let candidate = `CPT-${year}-${String(nextSeq).padStart(3, "0")}`;
  while (existingIds.has(candidate)) {
    nextSeq += 1;
    candidate = `CPT-${year}-${String(nextSeq).padStart(3, "0")}`;
  }
  database.lastSequenceByYear = {
    ...seqMap,
    [year]: nextSeq
  };
  return candidate;
}
var dbWriteQueue = Promise.resolve();
function withDatabaseWriteLock(task) {
  const run = dbWriteQueue.then(() => task());
  dbWriteQueue = run.then(
    () => void 0,
    () => void 0
  );
  return run;
}
function hashSecretToken(raw) {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}
function timingSafeMatchString(candidate, expected) {
  const candidateDigest = crypto.createHash("sha256").update(candidate, "utf8").digest();
  const expectedDigest = crypto.createHash("sha256").update(expected, "utf8").digest();
  return crypto.timingSafeEqual(candidateDigest, expectedDigest);
}
function getConfiguredAdminPasscodes() {
  const list = [
    process.env.CIGAP_ADMIN_PASSCODE,
    process.env.CIGAP_ADMIN_BACKUP_PASSCODE
  ].map((v) => typeof v === "string" ? v.trim() : "").filter((v) => v.length > 0);
  return list;
}
function verifyAdminPasscode(inputPasscode) {
  const configuredPasscodes = getConfiguredAdminPasscodes();
  if (configuredPasscodes.length === 0) {
    return { configured: false, valid: false };
  }
  let matched = false;
  for (const expected of configuredPasscodes) {
    if (timingSafeMatchString(inputPasscode, expected)) {
      matched = true;
    }
  }
  return { configured: true, valid: matched };
}
function loadSessionsFromDisk() {
  ensureDirectories();
  const now = Date.now();
  const map = /* @__PURE__ */ new Map();
  if (!fs.existsSync(SESSIONS_FILE)) {
    return map;
  }
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.sessions)) {
      for (const s of parsed.sessions) {
        if (s && typeof s.sessionIdHash === "string" && typeof s.csrfTokenHash === "string" && typeof s.expiresAtMs === "number" && s.expiresAtMs > now) {
          map.set(s.sessionIdHash, s);
        }
      }
    }
  } catch {
  }
  return map;
}
function saveSessionsAtomic(sessionsMap) {
  ensureDirectories();
  const now = Date.now();
  const activeSessions = [];
  for (const [key, session] of sessionsMap.entries()) {
    if (session.expiresAtMs > now) {
      activeSessions.push(session);
    } else {
      sessionsMap.delete(key);
    }
  }
  const serialized = JSON.stringify({ sessions: activeSessions }, null, 2);
  const tmpFile = path.join(
    DATA_DIR,
    `cigap-sessions.json.tmp-${process.pid}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  );
  let fd = null;
  try {
    fd = fs.openSync(tmpFile, "w");
    fs.writeFileSync(fd, serialized, "utf-8");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;
    fs.renameSync(tmpFile, SESSIONS_FILE);
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
      }
    }
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch {
    }
    throw err;
  }
}
function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header || typeof header !== "string") return {};
  const cookies = {};
  for (const part of header.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const rawVal = part.slice(eqIdx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(rawVal);
    } catch {
      cookies[key] = rawVal;
    }
  }
  return cookies;
}
function isHttpsRequest(req) {
  if (req.secure) return true;
  const xfProto = req.header("x-forwarded-proto");
  if (typeof xfProto === "string") {
    const firstProto = xfProto.split(",")[0].trim().toLowerCase();
    if (firstProto === "https") return true;
  }
  return false;
}
function buildAdminSessionCookieHeader(rawSessionId, isHttps, clear = false) {
  const maxAge = clear ? 0 : Math.floor(SESSION_TTL_MS / 1e3);
  const attrs = ["HttpOnly", "Path=/", `Max-Age=${maxAge}`];
  if (isHttps) {
    if (IS_VERCEL) {
      attrs.push("Secure", "SameSite=Lax");
    } else {
      attrs.push("Secure", "SameSite=None", "Partitioned");
    }
  } else {
    attrs.push("SameSite=Lax");
  }
  const encodedVal = clear ? "" : encodeURIComponent(rawSessionId);
  return `${ADMIN_SESSION_COOKIE}=${encodedVal}; ${attrs.join("; ")}`;
}
function getAllowedOrigins(req) {
  const allowed = /* @__PURE__ */ new Set();
  const proto = isHttpsRequest(req) ? "https" : "http";
  const host = req.get("host");
  if (host) {
    allowed.add(`${proto}://${host.trim()}`);
  }
  const xfHost = req.header("x-forwarded-host");
  if (typeof xfHost === "string" && xfHost.trim() !== "") {
    const firstHost = xfHost.split(",")[0].trim();
    if (firstHost) {
      allowed.add(`${proto}://${firstHost}`);
    }
  }
  for (const vercelHost of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ]) {
    const trimmed = typeof vercelHost === "string" ? vercelHost.trim() : "";
    if (!trimmed) continue;
    const candidate = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    try {
      allowed.add(new URL(candidate).origin);
    } catch {
    }
  }
  const extra = [process.env.APP_URL, ...(process.env.CIGAP_ALLOWED_ORIGINS || "").split(",")];
  for (const item of extra) {
    const trimmed = typeof item === "string" ? item.trim() : "";
    if (!trimmed) continue;
    try {
      allowed.add(new URL(trimmed).origin);
    } catch {
    }
  }
  return allowed;
}
function isAllowedOrigin(req) {
  const allowedOrigins = getAllowedOrigins(req);
  const originHeader = req.header("origin");
  if (typeof originHeader === "string" && originHeader.trim() !== "") {
    return allowedOrigins.has(originHeader.trim());
  }
  const refererHeader = req.header("referer");
  if (typeof refererHeader === "string" && refererHeader.trim() !== "") {
    try {
      const refOrigin = new URL(refererHeader).origin;
      return allowedOrigins.has(refOrigin);
    } catch {
      return false;
    }
  }
  return true;
}
function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}
function maskPublicReporterName(name, isAnonymous) {
  if (isAnonymous) return "Warga Anonim";
  const cleaned = (name || "").trim();
  if (!cleaned || cleaned.toLowerCase().includes("warga")) {
    return cleaned || "Warga Ciputat";
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    return word.length <= 2 ? `${word[0]}*` : `${word[0]}${"*".repeat(Math.min(word.length - 1, 4))}`;
  }
  return parts.map(
    (word) => word.length <= 2 ? `${word[0]}*` : `${word[0]}${"*".repeat(Math.min(word.length - 1, 3))}`
  ).join(" ");
}
function sanitizePublicAdminNotes(note, status) {
  if (!note) return void 0;
  const trimmed = note.trim();
  if (!trimmed) return void 0;
  const isInternalAuditText = trimmed.startsWith("PERINGATAN SISTEM:") || trimmed.includes("Skor Keaslian") || trimmed.includes("Skor Validitas") || trimmed.includes("audit posko") || trimmed.includes("DITOLAK OLEH SISTEM & PETUGAS");
  if (isInternalAuditText) {
    return status === "ditolak" ? "Laporan tidak memenuhi ketentuan verifikasi dan tidak dapat diproses." : "Laporan telah diterima dan sedang dalam antrean verifikasi petugas Posko CIGAP.";
  }
  return trimmed;
}
function sanitizePublicReport(r) {
  return {
    ...r,
    reporterName: maskPublicReporterName(r.reporterName, r.isAnonymous),
    reporterPhone: void 0,
    adminNotes: sanitizePublicAdminNotes(r.adminNotes, r.status),
    internalNotes: void 0,
    priorityUpdatedAt: void 0,
    priorityAssignedBy: void 0,
    priorityHistory: void 0,
    verification: void 0
  };
}
function loadDatabase() {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE)) {
    const initialReports = INITIAL_REPORTS.map(normalizeReport);
    const initial = {
      reports: initialReports,
      notifications: INITIAL_NOTIFICATIONS,
      lastSequenceByYear: computeMaxSequenceByYear(initialReports),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveDatabase(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const reports = Array.isArray(parsed.reports) ? parsed.reports.map(normalizeReport) : INITIAL_REPORTS.map(normalizeReport);
    const notifications = Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS;
    const lastSequenceByYear = computeMaxSequenceByYear(reports, parsed.lastSequenceByYear);
    return {
      reports,
      notifications,
      lastSequenceByYear,
      updatedAt: parsed.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (err) {
    console.error("Failed to parse cigap-db.json, preserving recovery fallback:", err);
    const fallbackReports = INITIAL_REPORTS.map(normalizeReport);
    const fallback = {
      reports: fallbackReports,
      notifications: INITIAL_NOTIFICATIONS,
      lastSequenceByYear: computeMaxSequenceByYear(fallbackReports),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveDatabase(fallback);
    return fallback;
  }
}
function saveDatabase(database) {
  ensureDirectories();
  database.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  database.lastSequenceByYear = computeMaxSequenceByYear(
    database.reports,
    database.lastSequenceByYear
  );
  const serialized = JSON.stringify(database, null, 2);
  const tmpFile = path.join(
    DATA_DIR,
    `cigap-db.json.tmp-${process.pid}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  );
  let fd = null;
  try {
    fd = fs.openSync(tmpFile, "w");
    fs.writeFileSync(fd, serialized, "utf-8");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
      }
    }
    try {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    } catch {
    }
    throw err;
  }
}
function saveBase64ImageToDisk(dataUrl, prefix = "evidence") {
  ensureDirectories();
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return dataUrl;
  }
  const mime = match[1].toLowerCase();
  const base64Data = match[2];
  let ext = "jpg";
  if (mime.includes("png")) ext = "png";
  else if (mime.includes("webp")) ext = "webp";
  else if (mime.includes("gif")) ext = "gif";
  const fileName = `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${fileName}`;
}
function persistInlineReportPhotos(report) {
  let primaryPhotoUrl = report.photoUrl || "";
  if (primaryPhotoUrl.startsWith("data:image/")) {
    primaryPhotoUrl = saveBase64ImageToDisk(primaryPhotoUrl, `rep-${report.id}`);
  }
  let photos = Array.isArray(report.photos) ? [...report.photos] : [];
  photos = photos.map((p, idx) => {
    if (p.url && p.url.startsWith("data:image/")) {
      return {
        ...p,
        url: saveBase64ImageToDisk(p.url, `rep-${report.id}-${idx + 1}`)
      };
    }
    return p;
  });
  if (photos.length === 0 && primaryPhotoUrl) {
    photos = [
      {
        id: `ph-${report.id}-1`,
        url: primaryPhotoUrl,
        uploadedAt: report.createdAt
      }
    ];
  } else if (photos.length > 0 && !primaryPhotoUrl) {
    primaryPhotoUrl = photos[0].url;
  }
  let resolvedPhotoUrl = report.resolvedPhotoUrl;
  if (resolvedPhotoUrl && resolvedPhotoUrl.startsWith("data:image/")) {
    resolvedPhotoUrl = saveBase64ImageToDisk(resolvedPhotoUrl, `resolved-${report.id}`);
  }
  return {
    ...report,
    photoUrl: primaryPhotoUrl,
    photos,
    resolvedPhotoUrl
  };
}
function buildStatusNotificationMessage(status, assignedDept, rejectionReason, isDelayed) {
  if (isDelayed && status !== "selesai" && status !== "ditolak") {
    return {
      title: "Pembaruan Estimasi Penanganan",
      message: "Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.",
      type: "delay"
    };
  }
  switch (status) {
    case "diterima":
      return {
        title: "Pengaduan Diterima",
        message: "Pengaduan Anda berhasil diterima oleh sistem CiGap.",
        type: "created"
      };
    case "diverifikasi":
      return {
        title: "Sedang Diverifikasi",
        message: "Laporan Anda sedang dalam proses verifikasi oleh petugas.",
        type: "status_update"
      };
    case "dalam_peninjauan":
      return {
        title: "Dalam Peninjauan Dinas",
        message: "Laporan Anda sedang ditinjau oleh Dinas terkait.",
        type: "status_update"
      };
    case "diteruskan_ke_dinas":
      return {
        title: "Diteruskan ke Dinas",
        message: `Laporan telah diteruskan kepada ${assignedDept || "Dinas Teknis Terkait"}.`,
        type: "status_update"
      };
    case "tindak_lanjut":
      return {
        title: "Petugas di Lokasi",
        message: "Petugas sedang melakukan penanganan di lokasi.",
        type: "status_update"
      };
    case "menunggu_tindak_lanjut":
      return {
        title: "Menunggu Tindak Lanjut",
        message: "Pengaduan membutuhkan koordinasi atau material lanjutan dari dinas.",
        type: "status_update"
      };
    case "selesai":
      return {
        title: "Penanganan Selesai",
        message: "Penanganan laporan telah selesai. Silakan periksa hasil tindak lanjut.",
        type: "resolved"
      };
    case "ditolak":
      return {
        title: "Laporan Ditolak",
        message: rejectionReason ? `Laporan tidak dapat diproses: ${rejectionReason}` : "Laporan tidak dapat diproses oleh petugas verifikasi.",
        type: "status_update"
      };
    default:
      return {
        title: "Pembaruan Status Laporan",
        message: STATUS_LABELS[status]?.defaultNotifMessage || "Status laporan Anda telah diperbarui.",
        type: "status_update"
      };
  }
}
function createCigapServerApp() {
  ensureDirectories();
  let db = loadDatabase();
  const adminSessions = loadSessionsFromDisk();
  const loginAttempts = /* @__PURE__ */ new Map();
  if (!IS_VERCEL) {
    setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [hash, sess] of adminSessions.entries()) {
        if (sess.expiresAtMs <= now) {
          adminSessions.delete(hash);
          changed = true;
        }
      }
      if (changed) {
        try {
          saveSessionsAtomic(adminSessions);
        } catch {
        }
      }
      for (const [ip, rec] of loginAttempts.entries()) {
        if (rec.lockedUntilMs <= now && now - rec.windowStartMs > LOGIN_WINDOW_MS) {
          loginAttempts.delete(ip);
        }
      }
    }, 10 * 60 * 1e3).unref();
  }
  const app2 = express();
  app2.set("trust proxy", 1);
  app2.use(express.json({ limit: "30mb" }));
  const getValidAdminSession = (req) => {
    const cookies = parseCookies(req);
    const rawSessionId = cookies[ADMIN_SESSION_COOKIE];
    if (!rawSessionId) return null;
    const sessionHash = hashSecretToken(rawSessionId);
    let existing = adminSessions.get(sessionHash);
    if (!existing) {
      const diskSessions = loadSessionsFromDisk();
      const fromDisk = diskSessions.get(sessionHash);
      if (fromDisk) {
        adminSessions.set(sessionHash, fromDisk);
        existing = fromDisk;
      }
    }
    if (!existing) return null;
    if (existing.expiresAtMs <= Date.now()) {
      adminSessions.delete(sessionHash);
      try {
        saveSessionsAtomic(adminSessions);
      } catch {
      }
      return null;
    }
    return existing;
  };
  const requireAdminAuth = (req, res, next) => {
    const session = getValidAdminSession(req);
    if (!session) {
      const cookies = parseCookies(req);
      if (cookies[ADMIN_SESSION_COOKIE]) {
        res.setHeader(
          "Set-Cookie",
          buildAdminSessionCookieHeader("", isHttpsRequest(req), true)
        );
      }
      res.status(401).json({
        error: "Sesi petugas tidak valid atau telah kedaluwarsa. Silakan masukkan PIN petugas kembali."
      });
      return;
    }
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase());
    if (isMutating) {
      if (!isAllowedOrigin(req)) {
        res.status(403).json({ error: "Origin permintaan tidak diizinkan." });
        return;
      }
      const csrfHeader = req.header("x-csrf-token");
      if (typeof csrfHeader !== "string" || !csrfHeader.trim() || !timingSafeMatchString(hashSecretToken(csrfHeader.trim()), session.csrfTokenHash)) {
        res.status(403).json({
          error: "Token keamanan CSRF tidak valid. Muat ulang halaman dan coba lagi."
        });
        return;
      }
    }
    next();
  };
  app2.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
  const sseClients = /* @__PURE__ */ new Set();
  const broadcastEvent = (eventName, payload) => {
    const data = `event: ${eventName}
data: ${JSON.stringify(payload)}

`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch {
        sseClients.delete(client);
      }
    }
  };
  app2.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`event: connected
data: ${JSON.stringify({ ok: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() })}

`);
    sseClients.add(res);
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat

`);
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 25e3);
    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });
  app2.post("/api/admin/login", (req, res) => {
    if (!isAllowedOrigin(req)) {
      res.status(403).json({ error: "Origin permintaan login tidak diizinkan." });
      return;
    }
    const clientIp = getClientIp(req);
    const now = Date.now();
    const existingAttempt = loginAttempts.get(clientIp);
    if (existingAttempt && existingAttempt.lockedUntilMs > now) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existingAttempt.lockedUntilMs - now) / 1e3)
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: `Terlalu banyak percobaan login gagal. Tunggu ${retryAfterSeconds} detik sebelum mencoba lagi.`,
        retryAfterSeconds
      });
      return;
    }
    const body = req.body;
    const passcode = typeof body?.passcode === "string" ? body.passcode.trim() : "";
    const verification = verifyAdminPasscode(passcode);
    if (!verification.configured) {
      console.error("Admin login rejected: CIGAP_ADMIN_PASSCODE environment variable is not configured.");
      res.status(503).json({
        error: "Layanan autentikasi petugas belum dikonfigurasi pada server (CIGAP_ADMIN_PASSCODE belum diset)."
      });
      return;
    }
    if (!/^\d{6}$/.test(passcode)) {
      res.status(400).json({
        error: "Format PIN petugas harus berupa 6 digit angka."
      });
      return;
    }
    if (!verification.valid) {
      let failures = 1;
      let windowStartMs = now;
      if (existingAttempt && now - existingAttempt.windowStartMs <= LOGIN_WINDOW_MS) {
        failures = existingAttempt.failures + 1;
        windowStartMs = existingAttempt.windowStartMs;
      }
      if (failures >= LOGIN_MAX_FAILURES) {
        const lockedUntilMs = now + LOGIN_LOCKOUT_MS;
        loginAttempts.set(clientIp, { failures, windowStartMs, lockedUntilMs });
        const retryAfterSeconds = Math.ceil(LOGIN_LOCKOUT_MS / 1e3);
        res.setHeader("Retry-After", String(retryAfterSeconds));
        res.status(429).json({
          error: `Terlalu banyak percobaan login gagal. Sistem dikunci selama ${retryAfterSeconds} detik.`,
          retryAfterSeconds
        });
        return;
      }
      loginAttempts.set(clientIp, { failures, windowStartMs, lockedUntilMs: 0 });
      const remainingAttempts = LOGIN_MAX_FAILURES - failures;
      res.status(401).json({
        error: `PIN petugas tidak valid (${remainingAttempts} kesempatan tersisa).`,
        remainingAttempts
      });
      return;
    }
    loginAttempts.delete(clientIp);
    const rawSessionId = crypto.randomBytes(32).toString("hex");
    const rawCsrfToken = crypto.randomBytes(32).toString("hex");
    const expiresAtMs = now + SESSION_TTL_MS;
    const sessionRecord = {
      sessionIdHash: hashSecretToken(rawSessionId),
      csrfTokenHash: hashSecretToken(rawCsrfToken),
      createdAtMs: now,
      expiresAtMs
    };
    adminSessions.set(sessionRecord.sessionIdHash, sessionRecord);
    try {
      saveSessionsAtomic(adminSessions);
    } catch (err) {
      console.error("Failed to persist admin session:", err);
      res.status(500).json({ error: "Gagal membuat sesi petugas." });
      return;
    }
    res.setHeader(
      "Set-Cookie",
      buildAdminSessionCookieHeader(rawSessionId, isHttpsRequest(req), false)
    );
    res.json({
      authenticated: true,
      expiresAt: new Date(expiresAtMs).toISOString(),
      csrfToken: rawCsrfToken
    });
  });
  app2.get("/api/admin/session", (req, res) => {
    const session = getValidAdminSession(req);
    if (!session) {
      const cookies = parseCookies(req);
      if (cookies[ADMIN_SESSION_COOKIE]) {
        res.setHeader(
          "Set-Cookie",
          buildAdminSessionCookieHeader("", isHttpsRequest(req), true)
        );
      }
      res.json({ authenticated: false });
      return;
    }
    const freshCsrfToken = crypto.randomBytes(32).toString("hex");
    session.csrfTokenHash = hashSecretToken(freshCsrfToken);
    adminSessions.set(session.sessionIdHash, session);
    try {
      saveSessionsAtomic(adminSessions);
    } catch {
    }
    res.json({
      authenticated: true,
      expiresAt: new Date(session.expiresAtMs).toISOString(),
      csrfToken: freshCsrfToken
    });
  });
  app2.post("/api/admin/logout", (req, res) => {
    if (!isAllowedOrigin(req)) {
      res.status(403).json({ error: "Origin permintaan logout tidak diizinkan." });
      return;
    }
    const cookies = parseCookies(req);
    const rawSessionId = cookies[ADMIN_SESSION_COOKIE];
    const activeSession = getValidAdminSession(req);
    if (activeSession) {
      const csrfHeader = req.header("x-csrf-token");
      if (typeof csrfHeader !== "string" || !csrfHeader.trim() || !timingSafeMatchString(hashSecretToken(csrfHeader.trim()), activeSession.csrfTokenHash)) {
        res.status(403).json({ error: "Token keamanan CSRF logout tidak valid." });
        return;
      }
    }
    if (rawSessionId) {
      const sessionHash = hashSecretToken(rawSessionId);
      if (adminSessions.delete(sessionHash)) {
        try {
          saveSessionsAtomic(adminSessions);
        } catch {
        }
      }
    }
    res.setHeader(
      "Set-Cookie",
      buildAdminSessionCookieHeader("", isHttpsRequest(req), true)
    );
    res.json({ ok: true });
  });
  app2.post("/api/uploads", (req, res) => {
    try {
      const { dataUrl, caption } = req.body;
      if (!dataUrl || typeof dataUrl !== "string" || !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(dataUrl)) {
        res.status(400).json({ error: "Format gambar tidak valid. Gunakan file JPG, PNG, WEBP, atau GIF." });
        return;
      }
      const url = saveBase64ImageToDisk(dataUrl, "citizen-evidence");
      res.status(201).json({
        id: `ph-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        url,
        caption: caption?.trim() || void 0,
        uploadedAt: formatWibNow()
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Gagal menyimpan foto bukti ke server." });
    }
  });
  app2.post("/api/admin/uploads", requireAdminAuth, (req, res) => {
    try {
      const { dataUrl, caption } = req.body;
      if (!dataUrl || typeof dataUrl !== "string" || !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(dataUrl)) {
        res.status(400).json({ error: "Format gambar tidak valid. Gunakan file JPG, PNG, WEBP, atau GIF." });
        return;
      }
      const url = saveBase64ImageToDisk(dataUrl, "officer-resolved");
      res.status(201).json({
        id: `ph-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        url,
        caption: caption?.trim() || void 0,
        uploadedAt: formatWibNow()
      });
    } catch (err) {
      console.error("Admin upload error:", err);
      res.status(500).json({ error: "Gagal menyimpan foto hasil petugas ke server." });
    }
  });
  app2.get("/api/reports", (req, res) => {
    db = loadDatabase();
    const admin = Boolean(getValidAdminSession(req));
    res.json({
      reports: admin ? db.reports : db.reports.map(sanitizePublicReport),
      notifications: db.notifications,
      updatedAt: db.updatedAt
    });
  });
  app2.get("/api/reports/:id", (req, res) => {
    db = loadDatabase();
    const report = db.reports.find((r) => r.id === req.params.id);
    if (!report) {
      res.status(404).json({ error: `Laporan #${req.params.id} tidak ditemukan.` });
      return;
    }
    const admin = Boolean(getValidAdminSession(req));
    const reportNotifications = db.notifications.filter((n) => n.reportId === report.id);
    res.json({
      report: admin ? report : sanitizePublicReport(report),
      notifications: reportNotifications
    });
  });
  app2.post("/api/reports", async (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || !incoming.title?.trim() || !incoming.locationName?.trim()) {
        res.status(400).json({ error: "Judul laporan dan lokasi kejadian wajib diisi." });
        return;
      }
      const result = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const now = /* @__PURE__ */ new Date();
        const nowWib = formatWibNow(now);
        const nowIso = now.toISOString();
        const officialId = generateUniqueReportId(currentDb, now);
        if (currentDb.reports.some((r) => r.id === officialId)) {
          return { conflict: true, officialId };
        }
        const isFlagged = Boolean(incoming.verification?.isSuspectedFake) || incoming.status === "ditolak";
        const initialStatus = isFlagged ? "ditolak" : "diterima";
        const createdAtValue = incoming.createdAt && incoming.createdAt !== "Baru saja (Hari Ini)" ? incoming.createdAt : nowWib;
        const baseTimeline = Array.isArray(incoming.timeline) && incoming.timeline.length > 0 ? incoming.timeline.map(
          (step, index) => index === 0 ? {
            ...step,
            id: step.id || `t-init-${Date.now()}`,
            status: initialStatus,
            description: isFlagged ? step.description : `Laporan Anda telah berhasil masuk ke basis data CIGAP dengan tiket resmi #${officialId}.`,
            timestamp: step.timestamp || createdAtValue,
            createdAtIso: step.createdAtIso || nowIso
          } : step
        ) : [
          {
            id: `t-init-${Date.now()}`,
            status: initialStatus,
            title: isFlagged ? "Laporan Ditolak (Karantina Audit)" : "Laporan Diterima",
            description: isFlagged ? "Laporan dikarantina karena indikasi ketidaksesuaian data." : `Laporan Anda telah berhasil masuk ke basis data CIGAP dengan tiket resmi #${officialId}.`,
            timestamp: createdAtValue,
            createdAtIso: nowIso,
            actor: "Sistem Portal CIGAP"
          }
        ];
        const incomingInternalNote = typeof incoming.internalNotes === "string" && incoming.internalNotes.trim() ? incoming.internalNotes.trim() : typeof incoming.adminNotes === "string" && (incoming.adminNotes.startsWith("PERINGATAN SISTEM:") || incoming.adminNotes.includes("Skor Keaslian")) ? incoming.adminNotes.trim() : void 0;
        const cleanPublicAdminNote = isFlagged ? "Laporan tidak memenuhi ketentuan verifikasi dan sedang dalam pemeriksaan petugas." : "Laporan baru telah diterima dari kanal warga dan sedang menunggu verifikasi petugas.";
        const prepared = persistInlineReportPhotos({
          ...incoming,
          id: officialId,
          status: initialStatus,
          urgency: void 0,
          priorityUpdatedAt: void 0,
          priorityAssignedBy: void 0,
          priorityHistory: void 0,
          assignedDepartment: void 0,
          officerName: void 0,
          resolvedPhotoUrl: void 0,
          adminNotes: cleanPublicAdminNote,
          internalNotes: incomingInternalNote,
          createdAt: createdAtValue,
          createdAtIso: incoming.createdAtIso || nowIso,
          updatedAt: nowWib,
          timeline: baseTimeline
        });
        if (currentDb.reports.some((r) => r.id === prepared.id)) {
          return { conflict: true, officialId: prepared.id };
        }
        const notifMeta = buildStatusNotificationMessage(
          prepared.status,
          prepared.assignedDepartment,
          prepared.rejectionReason,
          false
        );
        const newNotification = {
          id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
          reportId: prepared.id,
          reportTitle: prepared.title,
          status: prepared.status,
          title: notifMeta.title,
          message: notifMeta.message,
          timestamp: nowWib,
          createdAtIso: nowIso,
          isRead: false,
          type: notifMeta.type
        };
        currentDb.reports = [prepared, ...currentDb.reports];
        currentDb.notifications = [newNotification, ...currentDb.notifications];
        saveDatabase(currentDb);
        db = currentDb;
        return { conflict: false, prepared, newNotification };
      });
      if (result.conflict) {
        res.status(409).json({
          error: `Konflik ID laporan #${result.officialId} terdeteksi. Silakan kirim ulang laporan Anda.`
        });
        return;
      }
      const publicReport = sanitizePublicReport(result.prepared);
      broadcastEvent("report_created", {
        report: publicReport,
        notification: result.newNotification
      });
      res.status(201).json({
        report: getValidAdminSession(req) ? result.prepared : publicReport,
        notification: result.newNotification
      });
    } catch (err) {
      console.error("Create report error:", err);
      res.status(500).json({ error: "Gagal menyimpan laporan baru ke basis data." });
    }
  });
  app2.patch("/api/reports/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const reportId = req.params.id;
      const {
        status,
        adminNote,
        assignedDepartment,
        officerName,
        resolvedPhotoUrl,
        estimatedCompletionDate,
        isDelayed,
        delayReason,
        rejectionReason,
        urgency,
        priorityReason
      } = req.body;
      const outcome = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) {
          return { notFound: true };
        }
        const existing = currentDb.reports[idx];
        const now = /* @__PURE__ */ new Date();
        const nowWib = formatWibNow(now);
        const nowIso = now.toISOString();
        let finalResolvedPhoto = resolvedPhotoUrl || existing.resolvedPhotoUrl;
        if (finalResolvedPhoto && finalResolvedPhoto.startsWith("data:image/")) {
          finalResolvedPhoto = saveBase64ImageToDisk(finalResolvedPhoto, `resolved-${reportId}`);
        }
        const statusInfo = STATUS_LABELS[status];
        const noteText = adminNote?.trim() || (status === "ditolak" && rejectionReason ? `Laporan ditolak: ${rejectionReason}` : statusInfo?.description || `Status diperbarui menjadi ${statusInfo?.label || status}.`);
        const actorLabel = officerName?.trim() ? `${officerName.trim()} (${assignedDepartment || existing.assignedDepartment || "Posko CiGap"})` : assignedDepartment || existing.assignedDepartment || "Petugas Posko CiGap";
        const newStep = {
          id: `t-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
          status,
          title: statusInfo?.label || status,
          description: noteText,
          timestamp: nowWib,
          createdAtIso: nowIso,
          actor: actorLabel,
          photoUrl: finalResolvedPhoto && status === "selesai" ? finalResolvedPhoto : void 0
        };
        const validUrgencies = ["rendah", "sedang", "tinggi", "darurat"];
        const hasPriorityPayload = urgency !== void 0;
        const normalizedNextUrgency = urgency === null || urgency === "" ? void 0 : validUrgencies.includes(urgency) ? urgency : existing.urgency;
        const priorityChanged = hasPriorityPayload && normalizedNextUrgency !== existing.urgency;
        const nextPriorityHistory = Array.isArray(existing.priorityHistory) ? [...existing.priorityHistory] : [];
        if (priorityChanged) {
          nextPriorityHistory.push({
            id: `prio-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
            previousPriority: existing.urgency,
            newPriority: normalizedNextUrgency,
            reason: priorityReason?.trim() || void 0,
            actor: actorLabel,
            timestamp: nowWib,
            createdAtIso: nowIso
          });
        }
        const estimateChanged = Boolean(estimatedCompletionDate) && estimatedCompletionDate !== existing.estimatedCompletionDate;
        const delayTriggered = Boolean(isDelayed) || estimateChanged && Boolean(existing.estimatedCompletionDate);
        const updated = {
          ...existing,
          status,
          urgency: hasPriorityPayload ? normalizedNextUrgency : existing.urgency,
          priorityUpdatedAt: priorityChanged ? nowWib : existing.priorityUpdatedAt,
          priorityAssignedBy: priorityChanged ? actorLabel : existing.priorityAssignedBy,
          priorityHistory: nextPriorityHistory.length > 0 ? nextPriorityHistory : existing.priorityHistory,
          adminNotes: noteText,
          assignedDepartment: assignedDepartment || existing.assignedDepartment,
          officerName: officerName !== void 0 ? officerName.trim() || void 0 : existing.officerName,
          resolvedPhotoUrl: finalResolvedPhoto,
          estimatedCompletionDate: estimatedCompletionDate !== void 0 ? estimatedCompletionDate || void 0 : existing.estimatedCompletionDate,
          estimatedUpdatedAt: estimatedCompletionDate !== void 0 || delayTriggered ? nowWib : existing.estimatedUpdatedAt,
          isDelayed: isDelayed !== void 0 ? isDelayed : existing.isDelayed,
          delayReason: delayReason !== void 0 ? delayReason.trim() || void 0 : existing.delayReason,
          rejectionReason: status === "ditolak" ? rejectionReason?.trim() || noteText : existing.rejectionReason,
          updatedAt: nowWib,
          timeline: [...existing.timeline, newStep]
        };
        currentDb.reports[idx] = updated;
        const notifMeta = buildStatusNotificationMessage(
          status,
          updated.assignedDepartment,
          updated.rejectionReason,
          delayTriggered && status === existing.status
        );
        const createdNotifications = [];
        const mainNotif = {
          id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
          reportId: updated.id,
          reportTitle: updated.title,
          status: updated.status,
          title: notifMeta.title,
          message: notifMeta.message,
          timestamp: nowWib,
          createdAtIso: nowIso,
          isRead: false,
          type: notifMeta.type
        };
        createdNotifications.push(mainNotif);
        if (delayTriggered && status !== existing.status) {
          createdNotifications.push({
            id: `notif-delay-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
            reportId: updated.id,
            reportTitle: updated.title,
            status: updated.status,
            title: "Pembaruan Estimasi Penanganan",
            message: "Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.",
            timestamp: nowWib,
            createdAtIso: nowIso,
            isRead: false,
            type: "delay"
          });
        }
        currentDb.notifications = [...createdNotifications, ...currentDb.notifications];
        saveDatabase(currentDb);
        db = currentDb;
        return { notFound: false, updated, createdNotifications };
      });
      if (outcome.notFound) {
        res.status(404).json({ error: `Laporan #${reportId} tidak ditemukan.` });
        return;
      }
      const publicReport = sanitizePublicReport(outcome.updated);
      broadcastEvent("report_updated", {
        report: publicReport,
        notifications: outcome.createdNotifications
      });
      res.json({
        report: outcome.updated,
        notifications: outcome.createdNotifications
      });
    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ error: "Gagal memperbarui status laporan." });
    }
  });
  app2.put("/api/reports/:id", requireAdminAuth, async (req, res) => {
    try {
      const reportId = req.params.id;
      const outcome = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) {
          return { notFound: true };
        }
        const prepared = persistInlineReportPhotos({
          ...req.body,
          id: reportId,
          updatedAt: formatWibNow()
        });
        currentDb.reports[idx] = prepared;
        saveDatabase(currentDb);
        db = currentDb;
        return { notFound: false, prepared };
      });
      if (outcome.notFound) {
        res.status(404).json({ error: `Laporan #${reportId} tidak ditemukan.` });
        return;
      }
      const publicReport = sanitizePublicReport(outcome.prepared);
      broadcastEvent("report_updated", { report: publicReport, notifications: [] });
      res.json({ report: outcome.prepared });
    } catch (err) {
      console.error("Update report error:", err);
      res.status(500).json({ error: "Gagal memperbarui data laporan." });
    }
  });
  app2.delete("/api/reports/:id", requireAdminAuth, async (req, res) => {
    try {
      const reportId = req.params.id;
      const found = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const beforeLen = currentDb.reports.length;
        currentDb.reports = currentDb.reports.filter((r) => r.id !== reportId);
        if (currentDb.reports.length === beforeLen) {
          return false;
        }
        currentDb.notifications = currentDb.notifications.filter((n) => n.reportId !== reportId);
        saveDatabase(currentDb);
        db = currentDb;
        return true;
      });
      if (!found) {
        res.status(404).json({ error: `Laporan #${reportId} tidak ditemukan.` });
        return;
      }
      broadcastEvent("report_deleted", { reportId });
      res.json({ ok: true, reportId });
    } catch (err) {
      console.error("Delete report error:", err);
      res.status(500).json({ error: "Gagal menghapus laporan." });
    }
  });
  app2.post("/api/reports/:id/upvote", async (req, res) => {
    try {
      const reportId = req.params.id;
      const updated = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) return null;
        currentDb.reports[idx] = {
          ...currentDb.reports[idx],
          upvotes: (currentDb.reports[idx].upvotes || 0) + 1
        };
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.reports[idx];
      });
      if (!updated) {
        res.status(404).json({ error: "Laporan tidak ditemukan." });
        return;
      }
      const publicReport = sanitizePublicReport(updated);
      broadcastEvent("report_updated", { report: publicReport, notifications: [] });
      res.json({ report: getValidAdminSession(req) ? updated : publicReport });
    } catch (err) {
      console.error("Upvote report error:", err);
      res.status(500).json({ error: "Gagal memberikan dukungan." });
    }
  });
  app2.post("/api/reports/:id/feedback", async (req, res) => {
    try {
      const reportId = req.params.id;
      const feedback = req.body;
      const updated = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) return null;
        currentDb.reports[idx] = {
          ...currentDb.reports[idx],
          feedback
        };
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.reports[idx];
      });
      if (!updated) {
        res.status(404).json({ error: "Laporan tidak ditemukan." });
        return;
      }
      const publicReport = sanitizePublicReport(updated);
      broadcastEvent("report_updated", { report: publicReport, notifications: [] });
      res.json({ report: getValidAdminSession(req) ? updated : publicReport });
    } catch (err) {
      console.error("Feedback error:", err);
      res.status(500).json({ error: "Gagal mengirim ulasan." });
    }
  });
  app2.post("/api/reports/reset", requireAdminAuth, async (_req, res) => {
    try {
      const nextDb = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const seededReports = INITIAL_REPORTS.map(normalizeReport);
        const preservedSeq = computeMaxSequenceByYear(
          seededReports,
          currentDb.lastSequenceByYear
        );
        const resetDb = {
          reports: seededReports,
          notifications: INITIAL_NOTIFICATIONS,
          lastSequenceByYear: preservedSeq,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        saveDatabase(resetDb);
        db = resetDb;
        return resetDb;
      });
      const publicReports = nextDb.reports.map(sanitizePublicReport);
      broadcastEvent("reports_reset", {
        reports: publicReports,
        notifications: nextDb.notifications
      });
      res.json({
        reports: nextDb.reports,
        notifications: nextDb.notifications
      });
    } catch (err) {
      console.error("Reset error:", err);
      res.status(500).json({ error: "Gagal mereset data." });
    }
  });
  app2.get("/api/notifications", (_req, res) => {
    db = loadDatabase();
    res.json({ notifications: db.notifications });
  });
  app2.patch("/api/notifications/:id/read", requireAdminAuth, async (req, res) => {
    try {
      const notifId = req.params.id;
      const notifications = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        currentDb.notifications = currentDb.notifications.map(
          (n) => n.id === notifId ? { ...n, isRead: true } : n
        );
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.notifications;
      });
      res.json({ notifications });
    } catch (err) {
      console.error("Mark notification read error:", err);
      res.status(500).json({ error: "Gagal menandai notifikasi." });
    }
  });
  app2.patch("/api/notifications/read-all", requireAdminAuth, async (_req, res) => {
    try {
      const notifications = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        currentDb.notifications = currentDb.notifications.map((n) => ({ ...n, isRead: true }));
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.notifications;
      });
      res.json({ notifications });
    } catch (err) {
      console.error("Mark all notifications read error:", err);
      res.status(500).json({ error: "Gagal menandai semua notifikasi." });
    }
  });
  app2.all("/api/*", (req, res) => {
    res.status(404).json({
      error: `Endpoint API ${req.method} ${req.path} tidak ditemukan.`
    });
  });
  app2.use((err, req, res, next) => {
    if (!req.path.startsWith("/api")) {
      next(err);
      return;
    }
    const status = typeof err?.status === "number" ? err.status : 500;
    if (err instanceof SyntaxError && status === 400) {
      res.status(400).json({ error: "Format JSON permintaan tidak valid." });
      return;
    }
    if (err?.type === "entity.too.large") {
      res.status(413).json({ error: "Ukuran payload melebihi batas server." });
      return;
    }
    console.error("Unhandled API error:", err);
    res.status(status >= 400 ? status : 500).json({
      error: "Terjadi kesalahan internal pada server API."
    });
  });
  return app2;
}
async function startServer() {
  const app2 = createCigapServerApp();
  if (!IS_VERCEL && process.env.NODE_ENV !== "production") {
    const viteModuleName = "vite";
    const { createServer: createViteServer } = await import(viteModuleName);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, "dist");
    app2.use(express.static(distPath));
    app2.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`CIGAP Server running at http://0.0.0.0:${PORT}`);
  });
}
var isMainModule = (() => {
  try {
    return path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (!IS_VERCEL && isMainModule) {
  startServer().catch((err) => {
    console.error("Failed to start CIGAP server:", err);
    process.exit(1);
  });
}

// api/_entry.ts
var app = createCigapServerApp();
var entry_default = app;
export {
  entry_default as default
};
