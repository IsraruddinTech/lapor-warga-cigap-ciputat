import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Truck, 
  Hammer, 
  MapPin, 
  User, 
  Building, 
  Upload, 
  FileText, 
  Filter, 
  Send,
  Eye,
  Check,
  ChevronRight,
  ShieldAlert,
  Info,
  PhoneCall,
  HelpCircle,
  Edit3,
  Trash2,
  RotateCcw,
  Lock,
  LogOut,
  Printer,
  Flag,
  History
} from 'lucide-react';
import { ReportItem, ReportStatus, ThemeAccent, UrgencyLevel } from '../types';
import { STATUS_LABELS, CATEGORY_LABELS } from '../data/cigapConstants';
import { handleImageFallback } from '../utils/imageFallback';
import { uploadAdminPhoto, isAdminAuthError } from '../utils/cigapApi';
import { AntiFraudInfoModal } from './AntiFraudInfoModal';
import { EditReportModal } from './EditReportModal';
import { DeleteReportModal } from './DeleteReportModal';
import { DispositionLetterModal } from './DispositionLetterModal';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { ReportPhotoGallery } from './ReportPhotoGallery';
import { ReportEstimationCard } from './ReportEstimationCard';
import { generateAdminWhatsAppUrl } from '../utils/whatsappNotification';
import { verifyReportAuthenticity } from '../utils/fakeReportVerifier';
import { getThemeColors } from '../utils/themeColors';

export interface AdminStatusUpdateExtras {
  officerName?: string;
  estimatedCompletionDate?: string;
  isDelayed?: boolean;
  delayReason?: string;
  rejectionReason?: string;
  urgency?: UrgencyLevel | null;
  priorityReason?: string;
}

interface AdminDashboardProps {
  reports: ReportItem[];
  onUpdateStatus: (
    reportId: string,
    newStatus: ReportStatus,
    adminNote: string,
    assignedDept?: string,
    resolvedPhotoUrl?: string,
    extras?: AdminStatusUpdateExtras
  ) => void;
  onUpdateReport?: (report: ReportItem) => void;
  onDeleteReport?: (reportId: string, reason?: string) => void;
  onResetReports?: () => void;
  onLockAdmin?: () => void;
  onAuthError?: (message?: string) => void;
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const AdminVerificationDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onUpdateStatus,
  onUpdateReport,
  onDeleteReport,
  onResetReports,
  onLockAdmin,
  onAuthError,
  elderlyMode,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(reports[0]?.id ?? null);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('diverifikasi');
  const [adminNote, setAdminNote] = useState('');
  const [assignedDept, setAssignedDept] = useState('Dinas SDA, Bina Marga & Bina Konstruksi (DSDABMBK) Tangsel');
  const [officerName, setOfficerName] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [isDelayed, setIsDelayed] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetPriority, setTargetPriority] = useState<UrgencyLevel | ''>(reports[0]?.urgency || '');
  const [priorityReason, setPriorityReason] = useState('');
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState('');
  const [resolvedUploadError, setResolvedUploadError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [successToast, setSuccessToast] = useState('');
  const [isAntiFraudModalOpen, setIsAntiFraudModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'queue' | 'action'>('queue');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDispositionModalOpen, setIsDispositionModalOpen] = useState(false);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'hoaks') return r.verification?.isSuspectedFake || r.status === 'ditolak';
    return r.status === statusFilter;
  });

  const activeReport = reports.find((r) => r.id === selectedReportId) || filteredReports[0];

  const syncFormWithReport = (r: ReportItem) => {
    const nextStatusMap: Record<ReportStatus, ReportStatus> = {
      diterima: 'diverifikasi',
      diverifikasi: 'dalam_peninjauan',
      dalam_peninjauan: 'diteruskan_ke_dinas',
      diteruskan_ke_dinas: 'tindak_lanjut',
      tindak_lanjut: 'selesai',
      menunggu_tindak_lanjut: 'tindak_lanjut',
      selesai: 'selesai',
      ditolak: 'ditolak',
    };
    setTargetStatus(nextStatusMap[r.status] || 'diverifikasi');
    setAssignedDept(
      r.assignedDepartment || 'Dinas SDA, Bina Marga & Bina Konstruksi (DSDABMBK) Tangsel'
    );
    setOfficerName(r.officerName || '');
    setEstimatedCompletionDate(r.estimatedCompletionDate || '');
    setIsDelayed(Boolean(r.isDelayed));
    setDelayReason(r.delayReason || '');
    setRejectionReason(r.rejectionReason || '');
    setTargetPriority(r.urgency || '');
    setPriorityReason('');
    setResolvedPhotoUrl(r.resolvedPhotoUrl || '');
    setAdminNote('');
  };

  const activeVerification = activeReport?.verification || (activeReport ? verifyReportAuthenticity({
    title: activeReport.title,
    description: activeReport.description,
    category: activeReport.category,
    kelurahan: activeReport.kelurahan,
    coordinates: activeReport.coordinates,
    photoUrl: activeReport.photoUrl,
    reporterPhone: activeReport.reporterPhone,
    isAnonymous: activeReport.isAnonymous,
    existingReports: reports.filter(item => item.id !== activeReport.id),
  }) : null);

  const handleApplyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    if (targetStatus === 'ditolak' && !rejectionReason.trim() && !adminNote.trim()) {
      setSuccessToast('Mohon sertakan alasan penolakan yang jelas sebelum menolak laporan.');
      return;
    }

    onUpdateStatus(
      activeReport.id,
      targetStatus,
      adminNote.trim() || `Status diperbarui menjadi ${STATUS_LABELS[targetStatus]?.label || targetStatus} oleh Petugas Posko CIGAP.`,
      assignedDept,
      resolvedPhotoUrl || undefined,
      {
        officerName: officerName.trim() || undefined,
        estimatedCompletionDate: estimatedCompletionDate || undefined,
        isDelayed,
        delayReason: delayReason.trim() || undefined,
        rejectionReason: targetStatus === 'ditolak' ? (rejectionReason.trim() || adminNote.trim()) : undefined,
        urgency: targetPriority === '' ? null : targetPriority,
        priorityReason: priorityReason.trim() || undefined,
      }
    );

    setSuccessToast(
      `Laporan #${activeReport.id} diperbarui ke "${STATUS_LABELS[targetStatus]?.label || targetStatus}" & notifikasi in-app terkirim.`
    );
    setAdminNote('');
    setPriorityReason('');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const departmentsList = [
    'Dinas SDA, Bina Marga & Bina Konstruksi (DSDABMBK) Tangsel',
    'Dinas Lingkungan Hidup (DLH) Kota Tangsel',
    'Dinas Perhubungan (Dishub) Seksi PJU',
    'Satuan Polisi Pamong Praja (Satpol PP) Tangsel',
    'Dinas Kependudukan & Pencatatan Sipil (Disdukcapil)',
    'Badan Penanggulangan Bencana Daerah (BPBD) Tangsel',
  ];

  return (
    <div className="space-y-6">
      {/* Admin Mode Alert Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800/60">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <ShieldCheck size={14} /> Portal Operasional Dinas & Kecamatan
            </span>
            <span className="text-xs text-purple-200">
              Posko Siaga CIGAP Ciputat
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sesi Terverifikasi (PIN Aktif)
            </span>
          </div>
          <h1 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-white`}>
            Verifikasi & Penugasan Satgas Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-purple-200">
            Dinas berwenang dapat memvalidasi laporan warga, menugaskan unit armada lapangan, dan mengunggah foto bukti penanganan selesai.
          </p>
        </div>

        {/* Quick stat chips & Lock action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-center flex-1 sm:flex-initial">
              <div className="text-lg font-black text-yellow-300">
                {reports.filter((r) => r.status === 'diterima').length}
              </div>
              <div className="text-[10px] text-purple-200 uppercase font-semibold">Perlu Verifikasi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-center flex-1 sm:flex-initial">
              <div className="text-lg font-black text-cyan-300">
                {reports.filter((r) => r.status === 'tindak_lanjut').length}
              </div>
              <div className="text-[10px] text-purple-200 uppercase font-semibold">Sedang Dikerjakan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-center flex-1 sm:flex-initial">
              <div className="text-lg font-black text-sky-300">
                {reports.filter((r) => r.status === 'selesai').length}
              </div>
              <div className="text-[10px] text-purple-200 uppercase font-semibold">Telah Tuntas</div>
            </div>
          </div>

          {onLockAdmin && (
            <button
              type="button"
              onClick={onLockAdmin}
              className="px-3.5 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              title="Kunci Dasbor & Keluar ke Mode Warga"
            >
              <Lock size={13} />
              <span>Kunci / Keluar Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl ${themeColors.solidBg} text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-white/80 hover:text-white">✕</button>
        </motion.div>
      )}

      {/* Mobile Tab Switcher for Admin (lg:hidden) */}
      <div className="lg:hidden flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMobileTab('queue')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
            mobileTab === 'queue'
              ? `bg-white dark:bg-slate-900 ${themeColors.textAccent} shadow-xs`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText size={14} />
          <span>Antrean Laporan ({filteredReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('action')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
            mobileTab === 'action'
              ? `bg-white dark:bg-slate-900 ${themeColors.textAccent} shadow-xs`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Hammer size={14} />
          <span>Panel Validasi {activeReport ? `(#${activeReport.id})` : ''}</span>
        </button>
      </div>

      {/* Main Grid: Queue on left, Action Panel on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Verification Queue */}
        <div className={`lg:col-span-5 space-y-3 ${mobileTab === 'action' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-slate-500">Antrean Keluhan:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="diterima">Laporan Diterima</option>
                <option value="diverifikasi">Sedang Diverifikasi</option>
                <option value="dalam_peninjauan">Dalam Peninjauan</option>
                <option value="diteruskan_ke_dinas">Diteruskan ke Dinas</option>
                <option value="tindak_lanjut">Dalam Penanganan</option>
                <option value="menunggu_tindak_lanjut">Menunggu Tindak Lanjut</option>
                <option value="selesai">Selesai</option>
                <option value="hoaks">🚨 Karantina / Ditolak</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              {onResetReports && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Muat ulang seluruh data pengaduan ke sampel standar awal Ciputat?')) {
                      onResetReports();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                  title="Reset data ke sampel standar sistem"
                >
                  <RotateCcw size={12} />
                  <span>Reset Sampel</span>
                </button>
              )}
              <span className="text-xs text-slate-400 font-semibold">
                Total: {filteredReports.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {filteredReports.map((r) => {
              const isSelected = activeReport?.id === r.id;
              const statusInfo = STATUS_LABELS[r.status];
              const isSuspected = r.verification?.isSuspectedFake || r.status === 'ditolak';
              const trustScore = r.verification?.trustScore;

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setMobileTab('action');
                    syncFormWithReport(r);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? `${themeColors.cardBorderActive} ${themeColors.subtleBg} shadow-md ring-2 ring-opacity-20`
                      : isSuspected
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 hover:border-rose-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-xs font-bold ${themeColors.textAccent}`}>
                        #{r.id}
                      </span>
                      {trustScore !== undefined && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                          trustScore >= 80
                            ? themeColors.badge
                            : trustScore >= 50
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                        }`}>
                          {trustScore}% Trust
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        r.urgency === 'darurat'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : r.urgency === 'tinggi'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : r.urgency === 'sedang'
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          : r.urgency === 'rendah'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {r.urgency ? `Prioritas: ${r.urgency.toUpperCase()}` : 'Belum Ada Prioritas'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusInfo?.badgeClass || 'bg-slate-100'}`}>
                      {statusInfo?.label || r.status}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                    {r.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin size={11} className="text-rose-500 shrink-0" />
                    {r.locationName}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{r.createdAt}</span>
                    <span className={`font-semibold ${themeColors.textAccent} flex items-center gap-0.5`}>
                      Kelola <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Admin Action Form */}
        <div className={`lg:col-span-7 ${mobileTab === 'queue' ? 'hidden lg:block' : 'block'}`}>
          {/* Back button for mobile */}
          <div className="lg:hidden mb-3">
            <button
              type="button"
              onClick={() => setMobileTab('queue')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            >
              <span>← Kembali ke Daftar Antrean</span>
            </button>
          </div>

          {activeReport ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7 space-y-5">
              {/* Selected Report Header with CRUD Actions */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-mono font-black ${themeColors.textAccent} ${themeColors.subtleBg} px-2.5 py-1 rounded-lg`}>
                      #{activeReport.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      activeReport.urgency === 'darurat'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : activeReport.urgency === 'tinggi'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : activeReport.urgency === 'sedang'
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        : activeReport.urgency === 'rendah'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {activeReport.urgency
                        ? `Prioritas Penanganan: ${activeReport.urgency.toUpperCase()}`
                        : 'Prioritas: Belum Ditentukan Petugas'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Pelapor: {activeReport.reporterName} ({activeReport.isAnonymous ? 'Anonim' : 'Terverifikasi'})
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                    {activeReport.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lokasi: {activeReport.locationName}, Kelurahan {activeReport.kelurahan}
                  </p>
                </div>

                {/* Admin Action Buttons (CRUD, WhatsApp, Disposisi) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={generateAdminWhatsAppUrl(activeReport)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    title="Kirim notifikasi status resmi langsung ke nomor WhatsApp pelapor"
                  >
                    <PhoneCall size={13} />
                    <span>Update WA Pelapor</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsDispositionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Cetak Berita Acara & Lembar Disposisi Pemerintahan"
                  >
                    <Printer size={13} />
                    <span>Cetak Disposisi</span>
                  </button>

                  {onUpdateReport && (
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Ubah rincian pengaduan ini"
                    >
                      <Edit3 size={13} className={themeColors.textAccent} />
                      <span>Edit</span>
                    </button>
                  )}

                  {onDeleteReport && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/60 transition-colors"
                      title="Hapus aduan ini"
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Evidence Preview (Sebelum / Sesudah Komparasi + Multi-foto Pelapor) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Dokumentasi Foto Bukti Pelapor:
                </label>
                {activeReport.resolvedPhotoUrl && activeReport.photoUrl ? (
                  <BeforeAfterComparison
                    beforeUrl={activeReport.photoUrl}
                    afterUrl={activeReport.resolvedPhotoUrl}
                    category={activeReport.category}
                    title={activeReport.title}
                    accent={accent}
                    elderlyMode={elderlyMode}
                  />
                ) : (
                  <ReportPhotoGallery report={activeReport} compact />
                )}
              </div>

              {/* Estimasi Saat Ini */}
              <ReportEstimationCard report={activeReport} />

              {/* Anti-Fake Report Verification & Integrity Audit Card */}
              {activeVerification && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  activeVerification.isSuspectedFake
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60'
                    : activeVerification.trustScore >= 80
                    ? `${themeColors.subtleBg} ${themeColors.borderAccent}`
                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl text-white ${
                        activeVerification.isSuspectedFake
                          ? 'bg-rose-600'
                          : activeVerification.trustScore >= 80
                          ? themeColors.solidBg
                          : 'bg-amber-600'
                      }`}>
                        {activeVerification.isSuspectedFake ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Audit Integritas & Anti-Laporan Palsu CIGAP
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {activeVerification.isSuspectedFake
                            ? 'PERINGATAN: Sistem mendeteksi anomali tinggi pada laporan ini'
                            : 'Analisis otomatis geofencing GPS, anti-spam, dan rekam jejak bukti'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                        activeVerification.isSuspectedFake
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200'
                          : activeVerification.trustScore >= 80
                          ? themeColors.badge
                          : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200'
                      }`}>
                        Trust Index: {activeVerification.trustScore}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAntiFraudModalOpen(true)}
                        className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 ${themeColors.hoverText} border border-slate-200 dark:border-slate-700 transition-colors`}
                        title="Pelajari SOP Pencegahan Laporan Palsu"
                      >
                        <HelpCircle size={15} />
                      </button>
                    </div>
                  </div>

                  {/* 5 Layer Micro-Audit Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Geofencing GPS</span>
                      <span className={`font-bold flex items-center gap-1 ${activeVerification.checks.gpsRadiusValid ? themeColors.textAccent : 'text-rose-600'}`}>
                        {activeVerification.checks.gpsRadiusValid ? '✓ Sesuai Batas Ciputat' : '✗ Di Luar Wilayah Ciputat'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Integritas Foto</span>
                      <span className={`font-bold flex items-center gap-1 ${activeVerification.checks.photoAuthenticity ? themeColors.textAccent : 'text-amber-600'}`}>
                        {activeVerification.checks.photoAuthenticity ? '✓ Foto Otentik' : '⚠ Perlu Verifikasi Visual'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Deteksi Spam Teks</span>
                      <span className={`font-bold flex items-center gap-1 ${activeVerification.checks.antiSpamScore >= 60 ? themeColors.textAccent : 'text-rose-600'}`}>
                        {activeVerification.checks.antiSpamScore >= 60 ? '✓ Bebas Spam' : '✗ Terindikasi Kata Acak'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">4. Klaster Duplikasi</span>
                      <span className={`font-bold flex items-center gap-1 ${activeVerification.checks.duplicateClusterRisk === 'rendah' ? themeColors.textAccent : 'text-amber-600'}`}>
                        {activeVerification.checks.duplicateClusterRisk === 'rendah' ? '✓ Unik / Tunggal' : '⚠ Klaster Laporan Mirip'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5 col-span-2 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">5. Kontak & Akuntabilitas</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        {activeReport.isAnonymous ? '🔒 Anonim (Dilindungi Sistem)' : `👤 ${activeReport.reporterName} ${activeReport.reporterPhone ? `(${activeReport.reporterPhone})` : ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Detected Reasons */}
                  {activeVerification.reasons.length > 0 && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Catatan Diagnostik Sistem:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {activeVerification.reasons.map((rs, idx) => (
                          <li key={idx}>{rs}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Audit Action Buttons */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetStatus('diverifikasi');
                        setAdminNote('Laporan lolos audit integritas lapangan oleh Satgas CIGAP. Dinyatakan valid untuk ditindaklanjuti.');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${themeColors.primaryBtn} text-white flex items-center gap-1.5 transition-colors shadow-sm`}
                    >
                      <CheckCircle2 size={14} />
                      Loloskan & Nyatakan Valid
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTargetStatus('ditolak');
                        setAdminNote('Ditolak: Terindikasi laporan palsu / tidak valid berdasarkan verifikasi koordinat lapangan dan SOP anti-hoaks Pemkot Tangsel.');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <XCircle size={14} />
                      Tolak (Karantina Laporan Palsu)
                    </button>

                    {activeReport.reporterPhone && (
                      <a
                        href={`https://wa.me/${activeReport.reporterPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${activeReport.reporterName}, kami dari Posko Siaga CIGAP Ciputat ingin konfirmasi laporan #${activeReport.id} terkait ${activeReport.title}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <PhoneCall size={14} />
                        Klarifikasi via WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleApplyUpdate} className="space-y-4 pt-2">
                {/* 1. Pilih Status Baru (8 Tahapan Lengkap) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} className={themeColors.textAccent} />
                    Pembaruan Status Penanganan (8 Tahap):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        'diterima',
                        'diverifikasi',
                        'dalam_peninjauan',
                        'diteruskan_ke_dinas',
                        'tindak_lanjut',
                        'menunggu_tindak_lanjut',
                        'selesai',
                        'ditolak',
                      ] as ReportStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTargetStatus(st)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                          targetStatus === st
                            ? st === 'selesai'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : st === 'ditolak'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : `${themeColors.solidBg} text-white shadow-sm`
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {STATUS_LABELS[st]?.label || st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alasan Penolakan (Jika Ditolak) */}
                {targetStatus === 'ditolak' && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1.5">
                    <label className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                      Alasan Penolakan Resmi (Wajib diisi):
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Contoh: Lokasi berada di luar wilayah Kecamatan Ciputat / laporan duplikat..."
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                )}

                {/* 1b. Penetapan Prioritas Penanganan (Wewenang Petugas) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Flag size={14} className={themeColors.textAccent} />
                      <span>Penetapan Prioritas Penanganan (Wewenang Petugas):</span>
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Berdasarkan kategori, isi laporan, lokasi &amp; hasil verifikasi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { value: '', label: 'Belum Ditentukan' },
                        { value: 'rendah', label: 'Rendah' },
                        { value: 'sedang', label: 'Sedang' },
                        { value: 'tinggi', label: 'Tinggi' },
                        { value: 'darurat', label: 'Darurat' },
                      ] as { value: UrgencyLevel | ''; label: string }[]
                    ).map((opt) => {
                      const isSelected = targetPriority === opt.value;
                      return (
                        <button
                          key={opt.value || 'none'}
                          type="button"
                          onClick={() => setTargetPriority(opt.value)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                            isSelected
                              ? opt.value === 'darurat'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : opt.value === 'tinggi'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : opt.value === ''
                                ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                                : `${themeColors.solidBg} text-white border-transparent shadow-sm`
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {targetPriority !== (activeReport.urgency || '') && (
                    <input
                      type="text"
                      value={priorityReason}
                      onChange={(e) => setPriorityReason(e.target.value)}
                      placeholder="Dasar / alasan penetapan prioritas (opsional, misal: dekat sekolah & rawan kecelakaan)..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  )}

                  {activeReport.priorityHistory && activeReport.priorityHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <History size={12} className={themeColors.textAccent} />
                        <span>Riwayat Perubahan Prioritas ({activeReport.priorityHistory.length})</span>
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {[...activeReport.priorityHistory].reverse().map((entry) => (
                          <div
                            key={entry.id}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {(entry.previousPriority ? entry.previousPriority.toUpperCase() : 'BELUM DITENTUKAN')} → {(entry.newPriority ? entry.newPriority.toUpperCase() : 'BELUM DITENTUKAN')}
                              </span>
                              <span className="text-[10px] text-slate-400">{entry.timestamp}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              Oleh: {entry.actor}{entry.reason ? ` • Alasan: ${entry.reason}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Tugaskan Dinas & Nama Petugas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building size={14} className={themeColors.textAccent} />
                      Dinas / Satgas Pelaksana:
                    </label>
                    <select
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold"
                    >
                      {departmentsList.map((dept, i) => (
                        <option key={i} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User size={14} className={themeColors.textAccent} />
                      Nama Petugas Lapangan (Opsional):
                    </label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      placeholder="Contoh: Budi Santoso (Koordinator Regu 2)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* 2b. Penetapan / Pembaruan Estimasi Penyelesaian */}
                <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Clock size={14} className="text-sky-600" />
                        <span>Estimasi Tanggal Penyelesaian:</span>
                      </label>
                      <input
                        type="date"
                        value={estimatedCompletionDate}
                        onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                      />
                    </div>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 cursor-pointer text-xs font-bold text-amber-800 dark:text-amber-300">
                      <input
                        type="checkbox"
                        checked={isDelayed}
                        onChange={(e) => setIsDelayed(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <span>Butuh Waktu Tambahan (Perpanjangan Estimasi)</span>
                    </label>
                  </div>

                  {isDelayed && (
                    <input
                      type="text"
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      placeholder="Alasan penyesuaian estimasi (misal: menunggu material aspal / cuaca hujan deras)..."
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  )}
                </div>

                {/* 3. Catatan Dinas / Tanggapan Resmi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText size={14} className={themeColors.textAccent} />
                    Catatan Verifikasi / Keterangan Progres Pengerjaan:
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Contoh: Tim satgas jalan telah membawa material aspal hotmix dan stamper. Estimasi pengerjaan 4 jam."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                  />
                </div>

                {/* 4. Foto Hasil Perbaikan (Jika Selesai) */}
                {targetStatus === 'selesai' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <Upload size={14} />
                        Bukti Foto Hasil Penyelesaian (Sesudah):
                      </div>
                      {resolvedPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setResolvedPhotoUrl('')}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="flex-1 px-3 py-2 rounded-xl border border-dashed border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                        <Upload size={14} className="text-emerald-600" />
                        <span>{resolvedPhotoUrl ? 'Ganti Foto dari Perangkat' : 'Unggah Foto Hasil Perbaikan'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setResolvedUploadError('');
                              const reader = new FileReader();
                              reader.onload = async () => {
                                if (typeof reader.result === 'string') {
                                  try {
                                    const uploaded = await uploadAdminPhoto(
                                      reader.result,
                                      'Bukti penyelesaian petugas'
                                    );
                                    setResolvedPhotoUrl(uploaded.url);
                                  } catch (err) {
                                    const msg =
                                      err instanceof Error
                                        ? err.message
                                        : 'Gagal mengunggah foto hasil ke server.';
                                    setResolvedUploadError(msg);
                                    if (isAdminAuthError(err)) {
                                      onAuthError?.(msg);
                                    }
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <input
                        type="text"
                        value={resolvedPhotoUrl}
                        onChange={(e) => setResolvedPhotoUrl(e.target.value)}
                        placeholder="Atau tempel tautan/URL foto..."
                        className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>

                    {resolvedUploadError && (
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        {resolvedUploadError}
                      </p>
                    )}

                    {/* Quick presets for common CIPUTAT categories */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        Foto Sampel Selesai:
                      </span>
                      <button
                        type="button"
                        onClick={() => setResolvedPhotoUrl('https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80')}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      >
                        Aspal Mulus
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolvedPhotoUrl('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80')}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      >
                        PJU Menyala
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolvedPhotoUrl('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80')}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      >
                        TPS Bersih
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolvedPhotoUrl('https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80')}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      >
                        Saluran Normal
                      </button>
                    </div>

                    {resolvedPhotoUrl && (
                      <div className="relative rounded-xl overflow-hidden h-28 w-full border border-emerald-300 dark:border-emerald-700 bg-slate-100">
                        <img
                          src={resolvedPhotoUrl}
                          alt="Pratinjau Hasil"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageFallback(e, activeReport.category, 'HASIL PERBAIKAN')}
                        />
                        <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-600 text-white">
                          ✓ Pratinjau Foto Sesudah
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold ${themeColors.primaryBtn} text-white shadow-lg flex items-center gap-2 transition-all`}
                  >
                    <Send size={15} />
                    <span>Simpan Pembaruan & Kirim Notifikasi Warga</span>
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              Pilih laporan di antrean untuk melakukan verifikasi.
            </div>
          )}
        </div>
      </div>

      {/* Modal Edukasi & Audit Anti-Laporan Palsu */}
      <AntiFraudInfoModal
        isOpen={isAntiFraudModalOpen}
        onClose={() => setIsAntiFraudModalOpen(false)}
        elderlyMode={elderlyMode}
      />

      {/* Modal Edit Laporan */}
      <EditReportModal
        isOpen={isEditModalOpen}
        report={activeReport}
        onClose={() => setIsEditModalOpen(false)}
        onSaveReport={(updated) => {
          if (onUpdateReport) {
            onUpdateReport(updated);
          }
        }}
        onAuthError={onAuthError}
        accent={accent}
        elderlyMode={elderlyMode}
      />

      {/* Modal Hapus Laporan */}
      <DeleteReportModal
        isOpen={isDeleteModalOpen}
        report={activeReport}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={(reportId, reason) => {
          if (onDeleteReport) {
            onDeleteReport(reportId, reason);
            const remaining = reports.filter((r) => r.id !== reportId);
            setSelectedReportId(remaining[0]?.id || null);
          }
        }}
        accent={accent}
        elderlyMode={elderlyMode}
      />

      {/* Modal Cetak Berita Acara Disposisi Resmi */}
      <DispositionLetterModal
        isOpen={isDispositionModalOpen}
        report={activeReport}
        onClose={() => setIsDispositionModalOpen(false)}
        accent={accent}
      />
    </div>
  );
};
