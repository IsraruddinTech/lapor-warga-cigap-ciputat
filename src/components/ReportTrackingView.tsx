import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ThumbsUp, 
  MessageSquare, 
  ShieldCheck, 
  Share2, 
  Send,
  Building,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ShieldAlert,
  HelpCircle,
  ArrowLeft,
  List,
  PlusCircle,
  Printer,
  PhoneCall,
  Bell
} from 'lucide-react';
import { ReportItem, ReportStatus, KelurahanCiputat, UserFeedback, ThemeAccent, ReportNotification } from '../types';
import { STATUS_LABELS, CATEGORY_LABELS, CIPUTAT_KELURAHAN_LIST } from '../data/cigapConstants';
import { AntiFraudInfoModal } from './AntiFraudInfoModal';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { DispositionLetterModal } from './DispositionLetterModal';
import { ReportPhotoGallery } from './ReportPhotoGallery';
import { ReportStatusTimeline } from './ReportStatusTimeline';
import { ReportEstimationCard } from './ReportEstimationCard';
import { getReportPhotos, getNotificationsForReport } from '../utils/reportHelpers';
import { generateCitizenShareWhatsAppUrl } from '../utils/whatsappNotification';
import { getThemeColors } from '../utils/themeColors';

interface ReportTrackingProps {
  reports: ReportItem[];
  notifications?: ReportNotification[];
  onUpvoteReport: (reportId: string) => void;
  onSubmitFeedback: (reportId: string, feedback: UserFeedback) => void;
  onOpenCreateReport: () => void;
  selectedReportId?: string | null;
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const ReportTrackingView: React.FC<ReportTrackingProps> = ({
  reports,
  notifications = [],
  onUpvoteReport,
  onSubmitFeedback,
  onOpenCreateReport,
  selectedReportId,
  elderlyMode,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kelurahanFilter, setKelurahanFilter] = useState<string>('all');
  const [activeReportId, setActiveReportId] = useState<string | null>(selectedReportId || (reports[0]?.id ?? null));
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');
  const [isAntiFraudModalOpen, setIsAntiFraudModalOpen] = useState(false);
  const [isDispositionModalOpen, setIsDispositionModalOpen] = useState(false);

  // Sync active report whenever parent navigates to a specific report ID
  useEffect(() => {
    if (selectedReportId) {
      setActiveReportId(selectedReportId);
      setMobileTab('detail');
    }
  }, [selectedReportId]);

  // Feedback form state for active report
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesKelurahan = kelurahanFilter === 'all' || r.kelurahan === kelurahanFilter;

    return matchesSearch && matchesStatus && matchesKelurahan;
  });

  const activeReport = reports.find((r) => r.id === activeReportId) || filteredReports[0] || reports[0];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    const newFeedback: UserFeedback = {
      rating: ratingVal,
      comment: commentVal.trim() || 'Pelayanan sangat memuaskan dan fasilitas telah diperbaiki dengan rapi.',
      createdAt: 'Baru saja',
      civicName: reviewerName.trim() || 'Warga Ciputat',
      upvotes: 0,
    };

    onSubmitFeedback(activeReport.id, newFeedback);
    setCommentVal('');
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-sky-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Transparansi Pelayanan Publik Ciputat
          </span>
          <h1 className={`${elderlyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-black tracking-tight text-white`}>
            Lacak Status & Riwayat Pengaduan
          </h1>
          <p className={`${elderlyMode ? 'text-lg' : 'text-sm sm:text-base'} text-slate-300 leading-relaxed`}>
            Pantau setiap tahapan pekerjaan perbaikan secara real-time. Dari mulai laporan diterima, verifikasi lapangan, tindak lanjut armada, hingga tuntas pengerjaan.
          </p>

          {/* Search bar within banner */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nomor tiket (#CPT-...) atau nama jalan..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1 mr-1">
            <Filter size={14} /> Filter Status:
          </span>
          {[
            'all',
            'diterima',
            'diverifikasi',
            'dalam_peninjauan',
            'diteruskan_ke_dinas',
            'tindak_lanjut',
            'menunggu_tindak_lanjut',
            'selesai',
            'ditolak',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                statusFilter === st
                  ? `${themeColors.primaryBtn} shadow-sm`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'all' ? 'Semua Status' : STATUS_LABELS[st]?.shortLabel || STATUS_LABELS[st]?.label || st}
            </button>
          ))}
        </div>

        {/* Filter Kelurahan & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Wilayah:</span>
            <select
              value={kelurahanFilter}
              onChange={(e) => setKelurahanFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Kelurahan (7)</option>
              {CIPUTAT_KELURAHAN_LIST.map((k) => (
                <option key={k} value={k}>
                  Kelurahan {k}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenCreateReport}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${themeColors.primaryBtn} text-white flex items-center gap-1.5 shadow-xs`}
          >
            <PlusCircle size={14} />
            <span>Lapor Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible only on lg:hidden) */}
      <div className="lg:hidden flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'list'
              ? `bg-white dark:bg-slate-900 ${themeColors.textAccent} shadow-xs`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <List size={14} />
          <span>Daftar Aduan ({filteredReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'detail'
              ? `bg-white dark:bg-slate-900 ${themeColors.textAccent} shadow-xs`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock size={14} />
          <span>Detail #{activeReport?.id || 'Pilih'}</span>
        </button>
      </div>

      {/* 2-Column Layout: Left List, Right Tracking Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Report Cards List */}
        <div className={`lg:col-span-5 space-y-3.5 ${mobileTab === 'detail' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Ditemukan {filteredReports.length} Laporan Warga
            </span>
            <button
              onClick={onOpenCreateReport}
              className={`text-xs font-bold ${themeColors.textAccent} hover:underline`}
            >
              + Buat Laporan Baru
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              Tidak ada laporan yang sesuai dengan filter pencarian Anda.
            </div>
          ) : (
            filteredReports.map((item) => {
              const isSelected = activeReport?.id === item.id;
              const statusInfo = STATUS_LABELS[item.status];
              const categoryInfo = CATEGORY_LABELS[item.category];

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    setActiveReportId(item.id);
                    setMobileTab('detail');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? `bg-white dark:bg-slate-900 ${themeColors.cardBorderActive}`
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-mono text-xs font-bold ${themeColors.textAccent}`}>
                        #{item.id}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                      {item.verification && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                          item.verification.isSuspectedFake
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : item.verification.trustScore >= 80
                            ? themeColors.badge
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {item.verification.trustScore}% Trust
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.createdAt.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className={`${elderlyMode ? 'text-base font-bold' : 'text-sm font-bold'} text-slate-900 dark:text-white mt-1.5 line-clamp-2`}>
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                    <MapPin size={12} className="text-rose-500 shrink-0" />
                    <span className="truncate">{item.locationName}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Pelapor: {item.reporterName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvoteReport(item.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ${themeColors.hoverSubtleBg} text-slate-600 dark:text-slate-300 ${themeColors.hoverText} text-xs font-semibold`}
                    >
                      <ThumbsUp size={12} />
                      <span>{item.upvotes} Dukungan</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right Side: Active Detailed Tracking Inspector */}
        <div className={`lg:col-span-7 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          {activeReport ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7 space-y-6 sticky top-24">
              {/* Mobile Back Button to list */}
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                className={`lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${themeColors.badge} mb-1`}
              >
                <ArrowLeft size={14} />
                <span>← Kembali ke Daftar Laporan</span>
              </button>

              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-mono text-sm font-black ${themeColors.badge} px-2.5 py-1 rounded-lg`}>
                      Tiket: #{activeReport.id}
                    </span>
                    <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-full border ${STATUS_LABELS[activeReport.status].badgeClass}`}>
                      {STATUS_LABELS[activeReport.status].label}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CATEGORY_LABELS[activeReport.category]?.color || 'bg-slate-100'}`}>
                      {CATEGORY_LABELS[activeReport.category]?.label || activeReport.category}
                    </span>
                    {activeReport.subtype && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        Subtype: {activeReport.subtype}
                      </span>
                    )}
                  </div>
                  <h2 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 dark:text-white leading-snug`}>
                    {activeReport.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className="text-rose-500 shrink-0" />
                    <span>{activeReport.locationName} (Kelurahan {activeReport.kelurahan})</span>
                  </p>

                  {/* Trust Score & Authenticity Badge */}
                  {activeReport.verification && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
                        activeReport.verification.isSuspectedFake
                          ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200'
                          : activeReport.verification.trustScore >= 80
                          ? themeColors.badge
                          : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                      }`}>
                        {activeReport.verification.isSuspectedFake ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
                        <span>
                          Indeks Keaslian: {activeReport.verification.trustScore}% ({activeReport.verification.verdict === 'valid' ? 'Terverifikasi Asli' : activeReport.verification.verdict === 'perlu_tinjauan' ? 'Tinjauan Lapangan' : 'Karantina Hoaks'})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAntiFraudModalOpen(true)}
                        className={`text-[11px] ${themeColors.textAccent} hover:underline flex items-center gap-1 font-semibold`}
                      >
                        <HelpCircle size={12} />
                        Bagaimana CIGAP memverifikasi laporan?
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                  <a
                    href={generateCitizenShareWhatsAppUrl(activeReport)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Bagikan progres laporan ini ke WhatsApp Grup Warga/RT"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Kirim ke WA</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsDispositionModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Cetak Berita Acara & Lembar Disposisi Resmi"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">Cetak Disposisi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpvoteReport(activeReport.id)}
                    className={`px-3.5 py-2 rounded-xl ${themeColors.badge} hover:opacity-90 font-bold text-xs flex items-center gap-1.5`}
                    title="Dukung keluhan warga ini"
                  >
                    <ThumbsUp size={14} />
                    <span>Dukung ({activeReport.upvotes})</span>
                  </button>
                </div>
              </div>

              {/* Authentic Reporter Photos Gallery & Before/After Comparison */}
              {(() => {
                const reporterPhotos = getReportPhotos(activeReport);
                return (
                  <div className="space-y-4">
                    {activeReport.resolvedPhotoUrl && reporterPhotos.length > 0 ? (
                      <>
                        <BeforeAfterComparison
                          beforeUrl={reporterPhotos[0].url}
                          afterUrl={activeReport.resolvedPhotoUrl}
                          category={activeReport.category}
                          title={activeReport.title}
                          accent={accent}
                          elderlyMode={elderlyMode}
                        />
                        {reporterPhotos.length > 1 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Seluruh Foto Bukti Pelapor ({reporterPhotos.length})
                            </h4>
                            <ReportPhotoGallery report={activeReport} />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <ReportPhotoGallery report={activeReport} />
                        {activeReport.resolvedPhotoUrl && (
                          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                            <div className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-300">
                              Dokumentasi Hasil Penyelesaian Petugas
                            </div>
                            <img
                              src={activeReport.resolvedPhotoUrl}
                              alt="Hasil penanganan petugas"
                              className="w-full h-48 object-cover rounded-xl border border-emerald-200 dark:border-emerald-800"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Estimation & Responsible Agency */}
              <ReportEstimationCard report={activeReport} />

              {/* Full Description & Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Deskripsi Pengaduan Warga
                </div>
                <p className={`${elderlyMode ? 'text-base font-normal' : 'text-xs sm:text-sm'} text-slate-700 dark:text-slate-300 leading-relaxed`}>
                  {activeReport.description}
                </p>
                {activeReport.adminNotes && (
                  <div className={`mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs ${themeColors.textAccent} font-medium`}>
                    <strong>Catatan Petugas:</strong> {activeReport.adminNotes}
                  </div>
                )}
              </div>

              {/* Step Progression Timeline (8 Stages) */}
              <ReportStatusTimeline report={activeReport} />

              {/* Notification History for this Report */}
              {(() => {
                const reportNotifs = getNotificationsForReport(notifications, activeReport.id);
                return (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Bell size={14} className={themeColors.textAccent} />
                      <span>Riwayat Notifikasi Pengaduan ({reportNotifs.length})</span>
                    </h4>
                    {reportNotifs.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        Belum ada notifikasi pembaruan untuk laporan ini.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {reportNotifs.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-2 ${
                              !n.isRead
                                ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                )}
                                <span>{n.message}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {n.timestamp}
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                                STATUS_LABELS[n.status]?.badgeClass || ''
                              }`}
                            >
                              {STATUS_LABELS[n.status]?.shortLabel || n.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* User Feedback & Rating Section (User Feedback Sistem) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ThumbsUp size={14} className="text-amber-500" />
                  Ulasan & Feedback Kepuasan Warga
                </h4>

                {/* Existing Feedback Display */}
                {activeReport.feedback ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-xs font-bold text-amber-900 dark:text-amber-300">
                        Skor Kepuasan: {activeReport.feedback.rating}.0 / 5.0
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {activeReport.feedback.createdAt}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic">
                      "{activeReport.feedback.comment}"
                    </p>
                    <div className="text-[11px] font-semibold text-slate-500">
                      Oleh: {activeReport.feedback.civicName}
                    </div>
                  </div>
                ) : (
                  /* Form to leave feedback */
                  <form onSubmit={handleSendFeedback} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Bagaimana kepuasan Anda terhadap kecepatan & kualitas pengerjaan laporan ini?
                    </div>

                    {/* Numeric rating selector */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setRatingVal(score)}
                          className={`w-8 h-8 rounded-xl text-xs font-black border transition-all ${
                            score <= ratingVal
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-amber-400'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-2">
                        Skor {ratingVal}/5 ({ratingVal === 5 ? 'Sangat Puas' : ratingVal >= 4 ? 'Puas' : 'Cukup'})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Nama Anda (contoh: Warga Ciputat)"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={commentVal}
                        onChange={(e) => setCommentVal(e.target.value)}
                        placeholder="Tulis ulasan/saran perbaikan..."
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${themeColors.primaryBtn} text-white flex items-center gap-1.5 transition-colors shadow-sm`}
                    >
                      <Send size={13} />
                      <span>Kirim Ulasan Warga</span>
                    </button>

                    {feedbackSubmitted && (
                      <span className={`text-xs ${themeColors.textAccent} font-bold block`}>
                        ✓ Terima kasih atas ulasan Anda! Masukan Anda sangat berharga bagi peningkatan pelayanan.
                      </span>
                    )}
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              Pilih salah satu laporan di sebelah kiri untuk melihat tracking lengkap.
            </div>
          )}
        </div>
      </div>

      {/* Modal Edukasi Anti-Laporan Palsu */}
      <AntiFraudInfoModal
        isOpen={isAntiFraudModalOpen}
        onClose={() => setIsAntiFraudModalOpen(false)}
        elderlyMode={elderlyMode}
      />

      {/* Modal Cetak Berita Acara & Lembar Disposisi Resmi */}
      <DispositionLetterModal
        isOpen={isDispositionModalOpen}
        report={activeReport}
        onClose={() => setIsDispositionModalOpen(false)}
        accent={accent}
      />
    </div>
  );
};
