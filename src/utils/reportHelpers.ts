import { ReportItem, ReportNotification, ReportPhoto } from '../types';

const BULAN_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const BULAN_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function formatWibNow(date: Date = new Date()): string {
  // Format in WIB (Asia/Jakarta)
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
    const day = get('day');
    const monthIdx = Math.max(0, Number(get('month')) - 1);
    const year = get('year');
    const hour = get('hour');
    const minute = get('minute');
    return `${day} ${BULAN_SHORT_ID[monthIdx]} ${year}, ${hour}:${minute} WIB`;
  } catch {
    return `${date.getDate()} ${BULAN_SHORT_ID[date.getMonth()]} ${date.getFullYear()} WIB`;
  }
}

export function formatIndonesianDate(isoDate?: string): string | null {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return isoDate;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIdx < 0 || monthIdx > 11) return isoDate;
  return `${day} ${BULAN_ID[monthIdx]} ${year}`;
}

export interface EstimationSummary {
  hasEstimate: boolean;
  formattedTargetDate: string | null;
  remainingText: string;
  isDelayed: boolean;
  delayNotice: string | null;
  disclaimer: string;
}

export function getEstimationSummary(report: ReportItem): EstimationSummary {
  const disclaimer = 'Perkiraan ini merupakan estimasi petugas dan dapat berubah sesuai kondisi lapangan.';

  if (report.status === 'ditolak') {
    return {
      hasEstimate: false,
      formattedTargetDate: null,
      remainingText: 'Laporan tidak diproses lebih lanjut (Ditolak).',
      isDelayed: false,
      delayNotice: null,
      disclaimer: report.rejectionReason || 'Laporan ditolak setelah verifikasi petugas.',
    };
  }

  if (report.status === 'selesai') {
    const doneStep = [...(report.timeline || [])]
      .reverse()
      .find((step) => step.status === 'selesai');
    const actualDate =
      doneStep?.timestamp ||
      report.updatedAt ||
      formatIndonesianDate(report.estimatedCompletionDate) ||
      report.createdAt;
    return {
      hasEstimate: Boolean(actualDate),
      formattedTargetDate: actualDate,
      remainingText: 'Penanganan telah selesai dilaksanakan.',
      isDelayed: false,
      delayNotice: null,
      disclaimer: 'Permasalahan telah ditangani dan diselesaikan oleh instansi terkait.',
    };
  }

  if (!report.estimatedCompletionDate) {
    return {
      hasEstimate: false,
      formattedTargetDate: null,
      remainingText: 'Estimasi penyelesaian sedang ditentukan oleh petugas.',
      isDelayed: Boolean(report.isDelayed),
      delayNotice: report.isDelayed
        ? 'Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.'
        : null,
      disclaimer,
    };
  }

  const formattedDate = formatIndonesianDate(report.estimatedCompletionDate);

  // Compute day difference against local date (YYYY-MM-DD)
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const parts = report.estimatedCompletionDate.split('-').map(Number);
  const targetUtc =
    parts.length === 3 ? Date.UTC(parts[0], parts[1] - 1, parts[2]) : todayUtc;
  const diffDays = Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));

  let remainingText = '';
  if (diffDays > 1) {
    remainingText = `Diperkirakan selesai dalam ${diffDays} hari`;
  } else if (diffDays === 1) {
    remainingText = 'Diperkirakan selesai besok (1 hari lagi)';
  } else if (diffDays === 0) {
    remainingText = 'Diperkirakan selesai hari ini';
  } else {
    remainingText = `Melewati perkiraan awal ${Math.abs(diffDays)} hari — menunggu pembaruan petugas`;
  }

  const isDelayed = Boolean(report.isDelayed) || diffDays < 0;

  return {
    hasEstimate: true,
    formattedTargetDate: formattedDate,
    remainingText,
    isDelayed,
    delayNotice: report.isDelayed
      ? `Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.${report.delayReason ? ` (${report.delayReason})` : ''}`
      : diffDays < 0
      ? 'Penanganan membutuhkan waktu tambahan. Menunggu pembaruan estimasi dari petugas.'
      : null,
    disclaimer,
  };
}

/**
 * Returns ONLY real reporter-attached photos for a report.
 * Never returns stock/random/auto-generated photos.
 */
export function getReportPhotos(report: ReportItem): ReportPhoto[] {
  if (Array.isArray(report.photos) && report.photos.length > 0) {
    return report.photos.filter((p) => Boolean(p && p.url && p.url.trim() !== ''));
  }
  if (report.photoUrl && report.photoUrl.trim() !== '') {
    return [
      {
        id: `primary-${report.id}`,
        url: report.photoUrl,
        caption: 'Foto bukti kondisi di lapangan yang dilampirkan pelapor',
        uploadedAt: report.createdAt,
      },
    ];
  }
  return [];
}

/**
 * Formats reporter display name safely for public map views (hides phone/email/address).
 */
export function getPublicReporterDisplay(report: ReportItem): string {
  if (report.isAnonymous) return 'Warga Ciputat (Anonim)';
  const name = (report.reporterName || 'Warga Ciputat').trim();
  return name;
}

export function getNotificationsForReport(
  notifications: ReportNotification[],
  reportId: string
): ReportNotification[] {
  return notifications
    .filter((n) => n.reportId === reportId)
    .sort((a, b) => (b.createdAtIso || '').localeCompare(a.createdAtIso || ''));
}
