import React from 'react';
import { 
  Printer, 
  X, 
  Building, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  FileText, 
  Download,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { ReportItem, ThemeAccent } from '../types';
import { STATUS_LABELS, CATEGORY_LABELS } from '../data/mockReports';
import { getThemeColors } from '../utils/themeColors';
import { getReportPhotos } from '../utils/reportHelpers';

interface DispositionLetterModalProps {
  isOpen: boolean;
  report: ReportItem | null;
  onClose: () => void;
  accent?: ThemeAccent;
}

export const DispositionLetterModal: React.FC<DispositionLetterModalProps> = ({
  isOpen,
  report,
  onClose,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dispositionNumber = `045.2/DISP-CIGAP/${report.kelurahan.toUpperCase().replace(/\s+/g, '')}/${new Date().getFullYear()}/${report.id}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      {/* Modal Container */}
      <div 
        className="relative bg-white text-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen Header Controls (Hidden in Print) */}
        <div className="print:hidden p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Lembar Disposisi & Berita Acara Resmi
              </h3>
              <p className="text-[11px] text-slate-400">
                Format resmi penugasan lapangan Pemerintah Kecamatan Ciputat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${themeColors.primaryBtn} text-white flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer`}
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Letter Body */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-6 text-slate-800 text-xs sm:text-sm leading-normal font-serif">
          {/* 1. Official Government Header (KOP SURAT) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-between gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center p-1">
                <img
                  src="/cigap_logo.jpg"
                  alt="Lambang CIGAP Tangsel"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center font-sans">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                  Pemerintah Kota Tangerang Selatan
                </div>
                <div className="text-base sm:text-xl font-black uppercase text-slate-950 tracking-tight">
                  Kecamatan Ciputat
                </div>
                <div className="text-xs sm:text-sm font-extrabold uppercase text-sky-800">
                  Posko Siaga Cepat Tanggap Pengaduan Warga (CIGAP)
                </div>
                <div className="text-[10px] text-slate-600 font-normal mt-0.5">
                  Jl. Ir. H. Juanda No. 1, Ciputat, Kota Tangerang Selatan, Banten 15411 | Hotline: (021) 740-1010 / 112
                </div>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 hidden sm:flex items-center justify-center p-1">
                <img
                  src="/min_ci_mascot.jpg"
                  alt="Maskot Min Ci"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* 2. Document Title & Registry Number */}
          <div className="text-center space-y-1 font-sans">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950 underline decoration-2">
              Lembar Disposisi & Berita Acara Pengaduan Warga
            </h2>
            <div className="text-xs font-mono font-bold text-slate-600">
              Nomor Registrasi: {dispositionNumber}
            </div>
          </div>

          {/* 3. Main Specification Table */}
          <div className="border border-slate-400 rounded-xl overflow-hidden font-sans">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2.5 font-bold w-1/3 text-slate-700 border-r border-slate-300">
                    ID Laporan / Tiket
                  </td>
                  <td className="p-2.5 font-mono font-black text-sky-800">
                    #{report.id}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Tanggal Masuk Aduan
                  </td>
                  <td className="p-2.5">
                    {report.createdAt} WIB
                  </td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Kategori & Urgensi
                  </td>
                  <td className="p-2.5">
                    <span className="font-bold">{CATEGORY_LABELS[report.category]?.label || report.category}</span>
                    <span className="ml-2 font-mono uppercase font-bold text-rose-700">
                      [Tingkat: {report.urgency ? report.urgency.toUpperCase() : 'BELUM DITENTUKAN PETUGAS'}]
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Nama Pelapor / Kontak
                  </td>
                  <td className="p-2.5 font-semibold">
                    {report.isAnonymous ? 'Anonim (Privasi Dilindungi Undang-Undang)' : report.reporterName}
                    {report.reporterPhone && ` • Telp: ${report.reporterPhone}`}
                  </td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Wilayah & Patokan Lokasi
                  </td>
                  <td className="p-2.5">
                    <div className="font-bold">Kelurahan {report.kelurahan}, Kecamatan Ciputat</div>
                    <div className="text-slate-600">{report.locationName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Koordinat GPS: {report.coordinates.lat.toFixed(5)}, {report.coordinates.lng.toFixed(5)}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Uraian Masalah Warga
                  </td>
                  <td className="p-2.5 italic text-slate-800">
                    "{report.description}"
                  </td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Status Penanganan Terkini
                  </td>
                  <td className="p-2.5 font-bold uppercase text-emerald-800">
                    {STATUS_LABELS[report.status]?.label || report.status}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">
                    Instansi / Satgas Pelaksana
                  </td>
                  <td className="p-2.5 font-black text-slate-900">
                    {report.assignedDepartment || 'Dinas SDA, Bina Marga & Bina Konstruksi (DSDABMBK) Tangsel'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Evidence Documentation (Sebelum & Sesudah) */}
          <div className="space-y-2 font-sans">
            <div className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
              <span>Lampiran Dokumentasi Visual Lapangan:</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-2 text-center bg-slate-50">
                <div className="text-[10px] font-black uppercase text-rose-700 mb-1">
                  1. Kondisi Awal (Bukti Pelapor)
                </div>
                <div className="h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                  {(() => {
                    const photos = getReportPhotos(report);
                    if (photos.length === 0) {
                      return (
                        <span className="text-[11px] text-slate-400 italic p-2">
                          Pelapor tidak melampirkan foto
                        </span>
                      );
                    }
                    return (
                      <img
                        src={photos[0].url}
                        alt="Foto Masalah Awal"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    );
                  })()}
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-2 text-center bg-slate-50">
                <div className="text-[10px] font-black uppercase text-emerald-700 mb-1">
                  2. Hasil Penanganan (Sesudah)
                </div>
                <div className="h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                  {report.resolvedPhotoUrl ? (
                    <img
                      src={report.resolvedPhotoUrl}
                      alt="Foto Hasil Selesai"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 italic p-2">
                      Dokumentasi fisik sedang diselesaikan tim satgas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Disposition Instruction Box */}
          <div className="border-2 border-slate-800 rounded-xl p-3.5 space-y-1 font-sans bg-slate-50">
            <div className="text-xs font-black uppercase text-slate-900">
              Instruksi / Arahan Pimpinan Posko CIGAP:
            </div>
            <p className="text-xs text-slate-800 italic">
              {report.adminNotes || 'Segera laksanakan perbaikan/penanganan di titik lokasi sesuai SOP tanggap darurat Kecamatan Ciputat. Laporkan dokumentasi hasil perbaikan setelah tuntas.'}
            </p>
          </div>

          {/* 6. Signature Grid (Pengesahan Resmi) */}
          <div className="pt-4 font-sans text-xs">
            <div className="flex justify-end mb-4">
              <span className="text-slate-700">Ciputat, {todayDate}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-14">
                <div className="font-semibold text-slate-700">Petugas Verifikator:</div>
                <div>
                  <div className="font-bold underline text-slate-900">SATGAS CIGAP CIPUTAT</div>
                  <div className="text-[10px] text-slate-500">NIP. 19850412 201001 1 014</div>
                </div>
              </div>

              <div className="space-y-14">
                <div className="font-semibold text-slate-700">Pelaksana Teknis Lapangan:</div>
                <div>
                  <div className="font-bold underline text-slate-900">PENGAWAS SKPD TERKAIT</div>
                  <div className="text-[10px] text-slate-500">Dinas / Instansi Pelaksana</div>
                </div>
              </div>

              <div className="space-y-14">
                <div className="font-semibold text-slate-700">Mengetahui, Koordinator:</div>
                <div>
                  <div className="font-bold underline text-slate-900">CAMAT KECAMATAN CIPUTAT</div>
                  <div className="text-[10px] text-slate-500">Pemerintah Kota Tangerang Selatan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
