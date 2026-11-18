import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building, 
  ChevronRight, 
  Share2, 
  Printer, 
  AlertCircle,
  X,
  XCircle,
  Hourglass
} from 'lucide-react';
import { ReportItem, ThemeAccent } from '../types';
import { STATUS_LABELS, STATUS_WORKFLOW_ORDER } from '../data/mockReports';
import { getThemeColors } from '../utils/themeColors';
import { getEstimationSummary } from '../utils/reportHelpers';
import { generateCitizenShareWhatsAppUrl } from '../utils/whatsappNotification';

interface TicketLookupWidgetProps {
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
  onOpenDisposition?: (report: ReportItem) => void;
  accent?: ThemeAccent;
  elderlyMode?: boolean;
}

export const TicketLookupWidget: React.FC<TicketLookupWidgetProps> = ({
  reports,
  onSelectReport,
  onOpenDisposition,
  accent = 'blue',
  elderlyMode = false,
}) => {
  const themeColors = getThemeColors(accent);
  const [ticketQuery, setTicketQuery] = useState('');
  const [searchedReport, setSearchedReport] = useState<ReportItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = ticketQuery.trim().toLowerCase().replace('#', '');
    if (!cleanQuery) return;

    // Find report matching ID, e.g. "CPT-2026-081" or "081"
    const match = reports.find((r) => {
      const idLower = r.id.toLowerCase();
      return idLower === cleanQuery || idLower.endsWith(cleanQuery) || idLower.includes(cleanQuery);
    });

    setSearchedReport(match || null);
    setHasSearched(true);
  };

  const handleQuickSample = (id: string) => {
    setTicketQuery(id);
    const match = reports.find((r) => r.id === id);
    setSearchedReport(match || null);
    setHasSearched(true);
  };

  const clearSearch = () => {
    setTicketQuery('');
    setSearchedReport(null);
    setHasSearched(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-sky-500/30 dark:border-sky-500/20 p-5 sm:p-7 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-2xl ${themeColors.badge} shadow-xs`}>
            <Ticket size={22} className={themeColors.textAccent} />
          </div>
          <div>
            <h3 className={`${elderlyMode ? 'text-xl sm:text-2xl font-black' : 'text-base sm:text-lg font-black'} text-slate-900 dark:text-white flex items-center gap-2`}>
              <span>Lacak Tiket Aduan Mandiri</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Resi Cepat
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ketik nomor tiket laporan Anda untuk memeriksa tahapan & foto hasil di lapangan
            </p>
          </div>
        </div>

        {/* Preset quick test pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold">Contoh Tiket:</span>
          {reports.slice(0, 3).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleQuickSample(r.id)}
              className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-100 hover:text-sky-800 dark:hover:bg-slate-700 transition-colors"
            >
              #{r.id}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={ticketQuery}
            onChange={(e) => {
              setTicketQuery(e.target.value);
              if (hasSearched) setHasSearched(false);
            }}
            placeholder="Masukkan nomor tiket Anda (contoh: CPT-2026-081 atau 081)..."
            className={`${
              elderlyMode ? 'text-base py-3.5 pl-11 pr-10' : 'text-xs sm:text-sm py-3 pl-11 pr-10'
            } w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-medium transition-all`}
          />
          {ticketQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className={`${
            elderlyMode ? 'px-8 py-3.5 text-base' : 'px-6 py-3 text-xs sm:text-sm'
          } rounded-2xl font-black ${themeColors.primaryBtn} text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0`}
        >
          <Search size={16} />
          <span>Cek Status Laporan</span>
        </button>
      </form>

      {/* Search Result Card */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pt-2"
          >
            {searchedReport ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border-2 border-sky-300 dark:border-sky-800 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-black bg-sky-600 text-white px-2.5 py-0.5 rounded-lg">
                        #{searchedReport.id}
                      </span>
                      <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${STATUS_LABELS[searchedReport.status]?.badgeClass}`}>
                        {STATUS_LABELS[searchedReport.status]?.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {searchedReport.createdAt}
                      </span>
                    </div>

                    <h4 className={`${elderlyMode ? 'text-xl font-black' : 'text-base font-bold'} text-slate-900 dark:text-white`}>
                      {searchedReport.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span>{searchedReport.locationName} (Kel. {searchedReport.kelurahan})</span>
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectReport(searchedReport)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${themeColors.primaryBtn} text-white shadow-sm flex items-center gap-1.5 hover:opacity-95 transition-all`}
                    >
                      <span>Buka Linimasa Lengkap</span>
                      <ChevronRight size={14} />
                    </button>

                    <a
                      href={generateCitizenShareWhatsAppUrl(searchedReport)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                      title="Kirim info laporan ke WhatsApp"
                    >
                      <Share2 size={13} />
                      <span>Bagikan ke WhatsApp</span>
                    </a>

                    {onOpenDisposition && (
                      <button
                        type="button"
                        onClick={() => onOpenDisposition(searchedReport)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                        title="Cetak Berita Acara Disposisi"
                      >
                        <Printer size={13} />
                        <span>Cetak Disposisi</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar 7-Steps Indicator or Rejection Notice */}
                <div className="pt-2 border-t border-sky-200 dark:border-sky-900 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>Tahapan Penanganan:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-extrabold">
                      Dinas: {searchedReport.assignedDepartment || 'Posko CIGAP Ciputat'}
                    </span>
                  </div>

                  {searchedReport.status === 'ditolak' ? (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                      <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold">Laporan Ditolak</div>
                        <p className="text-[11px] mt-0.5">
                          {searchedReport.rejectionReason ||
                            searchedReport.adminNotes ||
                            'Laporan tidak dapat diproses lebih lanjut setelah verifikasi petugas.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 text-center">
                      {STATUS_WORKFLOW_ORDER.map((st, idx) => {
                        const info = STATUS_LABELS[st];
                        const currentStep = STATUS_LABELS[searchedReport.status]?.stepIndex ?? 1;
                        const stepNum = idx + 1;
                        const isReached = currentStep > stepNum || searchedReport.status === 'selesai';
                        const isCurrent = searchedReport.status === st;

                        return (
                          <div
                            key={st}
                            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                              isCurrent
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : isReached
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {stepNum}. {info.shortLabel}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Compact Estimation Strip */}
                  {(() => {
                    const est = getEstimationSummary(searchedReport);
                    return (
                      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-sky-200/70 dark:border-sky-800/60 text-[11px]">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                          <Hourglass size={13} className="text-sky-600 dark:text-sky-400 shrink-0" />
                          <span>
                            Estimasi:{' '}
                            {est.formattedTargetDate ? `${est.formattedTargetDate} • ` : ''}
                            {est.remainingText}
                          </span>
                        </span>
                        {est.isDelayed && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            (Estimasi Diperbarui)
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    Nomor Tiket "#{ticketQuery}" Tidak Ditemukan
                  </div>
                  <p className="text-amber-800 dark:text-amber-400">
                    Pastikan nomor tiket Anda sesuai dengan bukti yang didapat saat membuat laporan (contoh: <code>CPT-2026-081</code>). Jika Anda membutuhkan bantuan, hubungi Call Center Posko Ciputat di 112 atau via Customer Service di pojok kanan bawah.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
