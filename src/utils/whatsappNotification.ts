import { ReportItem } from '../types';
import { STATUS_LABELS } from '../data/mockReports';

/**
 * Generates an official WhatsApp notification link from the CIGAP officer to the citizen reporter.
 */
export function generateAdminWhatsAppUrl(report: ReportItem, customNote?: string): string {
  const phone = (report.reporterPhone || '').replace(/[^0-9]/g, '');
  // Format to international 62 if starts with 0
  let formattedPhone = phone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }

  const statusLabel = STATUS_LABELS[report.status]?.label || report.status;
  const dept = report.assignedDepartment || 'Posko Terpadu CIGAP Kecamatan Ciputat';
  const notes = customNote || report.adminNotes || 'Laporan telah diverifikasi dan sedang dalam penanganan petugas teknis lapangan.';

  const message = 
`*PEMBERITAHUAN RESMI SISTEM CIGAP CIPUTAT*
_Pemerintah Kota Tangerang Selatan - Kecamatan Ciputat_

Yth. Bpk/Ibu *${report.isAnonymous ? 'Warga Ciputat' : report.reporterName}*,

Berikut informasi terkini mengenai laporan pengaduan Anda:
━━━━━━━━━━━━━━━━━━━━
📌 *No. Tiket*: #${report.id}
🏷️ *Perihal*: ${report.title}
📍 *Lokasi*: ${report.locationName} (Kel. ${report.kelurahan})
⚡ *Status Terkini*: *${statusLabel.toUpperCase()}*
🏢 *Instansi Pelaksana*: ${dept}
📝 *Catatan Petugas*:
"${notes}"
━━━━━━━━━━━━━━━━━━━━

Anda dapat memantau linimasa pengerjaan dan bukti foto penanganan secara transparan melalui sistem LaporWarga Ciputat (CIGAP).

Terima kasih atas kepedulian Anda dalam menjaga fasilitas dan kenyamanan wilayah Ciputat.

_Salam Tanggap, Posko Siaga CIGAP Ciputat_`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a public share WhatsApp link for citizens to share their report status to RT/RW or family groups.
 */
export function generateCitizenShareWhatsAppUrl(report: ReportItem): string {
  const statusLabel = STATUS_LABELS[report.status]?.label || report.status;
  const message =
`📢 *INFO LAPORAN WARGA CIPUTAT (CIGAP)*

Halo tetangga & warga sekalian, keluhan fasilitas lingkungan berikut telah didaftarkan ke Posko CIGAP:

📌 *Tiket*: #${report.id}
🏷️ *Masalah*: ${report.title}
📍 *Lokasi*: ${report.locationName} (Kel. ${report.kelurahan})
⚡ *Status*: *${statusLabel.toUpperCase()}*
${report.resolvedPhotoUrl ? '✅ *Kondisi*: Telah selesai diperbaiki oleh dinas terkait!' : '⏳ *Kondisi*: Sedang dalam proses penanganan.'}

Mari pantau bersama perbaikan lingkungan kita di aplikasi LaporWarga Ciputat (CIGAP).`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
