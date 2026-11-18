import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Edit3, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  User, 
  Phone, 
  EyeOff, 
  Save,
  Building,
  Image as ImageIcon,
  CameraOff,
  Loader2,
  Trash2
} from 'lucide-react';
import { ReportItem, ReportCategory, KelurahanCiputat, UrgencyLevel, ThemeAccent, ReportPhoto } from '../types';
import { CIPUTAT_KELURAHAN_LIST, CATEGORY_LABELS, STATUS_LABELS } from '../data/mockReports';
import { getThemeColors } from '../utils/themeColors';
import { uploadAdminPhoto, isAdminAuthError } from '../utils/cigapApi';
import { formatWibNow, getReportPhotos } from '../utils/reportHelpers';

interface EditReportModalProps {
  isOpen: boolean;
  report: ReportItem | null;
  onClose: () => void;
  onSaveReport: (updatedReport: ReportItem) => void;
  onAuthError?: (message?: string) => void;
  accent?: ThemeAccent;
  elderlyMode?: boolean;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onSaveReport,
  onAuthError,
  accent = 'blue',
  elderlyMode = false,
}) => {
  const themeColors = getThemeColors(accent);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('jalan_rusak');
  const [kelurahan, setKelurahan] = useState<KelurahanCiputat>('Ciputat');
  const [locationName, setLocationName] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Sync state whenever report changes
  useEffect(() => {
    if (report) {
      setTitle(report.title || '');
      setDescription(report.description || '');
      setCategory(report.category || 'jalan_rusak');
      setKelurahan(report.kelurahan || 'Ciputat');
      setLocationName(report.locationName || '');
      setUrgency(report.urgency || '');
      setReporterName(report.reporterName || '');
      setReporterPhone(report.reporterPhone || '');
      setIsAnonymous(report.isAnonymous || false);
      const existingPhotos = getReportPhotos(report);
      setPhotos(existingPhotos);
      setPhotoUrl(existingPhotos[0]?.url || '');
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
        reader.readAsDataURL(file);
      });
      const uploaded = await uploadAdminPhoto(dataUrl, `Foto diperbarui (${file.name})`);
      setPhotoUrl(uploaded.url);
      setPhotos((prev) => [uploaded, ...prev.slice(1)]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto ke server.';
      setUploadError(msg);
      if (isAdminAuthError(err)) {
        onClose();
        onAuthError?.(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
    setPhotos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      return;
    }

    const nextUrgency = urgency || undefined;
    const priorityChanged = nextUrgency !== report.urgency;
    const nowWib = formatWibNow();
    const nextPriorityHistory = priorityChanged
      ? [
          ...(report.priorityHistory || []),
          {
            id: 'prio-edit-' + Date.now(),
            previousPriority: report.urgency,
            newPriority: nextUrgency,
            reason: 'Penyesuaian melalui menu Edit Laporan petugas',
            actor: 'Administrator CIGAP',
            timestamp: nowWib,
          },
        ]
      : report.priorityHistory;

    const updatedTimeline = [
      ...report.timeline,
      {
        id: 't-edit-' + Date.now(),
        status: report.status,
        title: 'Informasi Laporan Diperbarui',
        description: 'Perubahan data laporan disimpan oleh Administrator Posko CIGAP.',
        timestamp: nowWib,
        actor: 'Administrator CIGAP',
      }
    ];

    const updated: ReportItem = {
      ...report,
      title: title.trim(),
      description: description.trim(),
      category,
      kelurahan,
      locationName: locationName.trim(),
      urgency: nextUrgency,
      priorityUpdatedAt: priorityChanged ? nowWib : report.priorityUpdatedAt,
      priorityAssignedBy: priorityChanged ? 'Administrator CIGAP' : report.priorityAssignedBy,
      priorityHistory: nextPriorityHistory,
      reporterName: isAnonymous ? 'Warga Ciputat (Anonim)' : (reporterName.trim() || 'Warga Ciputat'),
      reporterPhone: isAnonymous ? undefined : reporterPhone.trim(),
      isAnonymous,
      photoUrl: photoUrl,
      photos,
      timeline: updatedTimeline,
    };

    onSaveReport(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto sm:my-6 flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${themeColors.navBg} text-white flex items-center justify-between shrink-0 shadow-md`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 shrink-0">
              <Edit3 size={22} />
            </div>
            <div>
              <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${themeColors.badge}`}>
                Edit Laporan #{report.id}
              </span>
              <h2 className={`${elderlyMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl'} font-bold text-white leading-tight`}>
                Perbarui Data Laporan
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Status Badge Info */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Status Tiket Saat Ini:</span>
            <span className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-[10px] ${
              report.status === 'selesai' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              report.status === 'tindak_lanjut' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
              report.status === 'diverifikasi' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {STATUS_LABELS[report.status]?.label || report.status}
            </span>
          </div>

          {/* 1. Judul Laporan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Judul Singkat Keluhan</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Aspal Rusak Berlubang di Dekat Pasar Ciputat"
              className={`w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${themeColors.ringAccent}`}
            />
          </div>

          {/* 2. Kategori & Tingkat Urgensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kategori Masalah
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className={`w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${themeColors.ringAccent}`}
              >
                {Object.entries(CATEGORY_LABELS).map(([catKey, catObj]) => (
                  <option key={catKey} value={catKey}>
                    {catObj.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Prioritas Penanganan (Petugas)
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel | '')}
                className={`w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${themeColors.ringAccent}`}
              >
                <option value="">Belum Ditentukan Petugas</option>
                <option value="rendah">Rendah (Penanganan Reguler)</option>
                <option value="sedang">Sedang (Perlu Dijadwalkan)</option>
                <option value="tinggi">Tinggi (Macet / Bahaya Ringan)</option>
                <option value="darurat">Darurat (Ancaman Keselamatan Jiwa)</option>
              </select>
            </div>
          </div>

          {/* 3. Kelurahan & Patokan Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kelurahan di Ciputat
              </label>
              <select
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value as KelurahanCiputat)}
                className={`w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${themeColors.ringAccent}`}
              >
                {CIPUTAT_KELURAHAN_LIST.map((kel) => (
                  <option key={kel} value={kel}>
                    Kelurahan {kel}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detail Patokan Lokasi
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Contoh: Jl. Ki Hajar Dewantara, depan SDN Ciputat 01"
                className={`w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${themeColors.ringAccent}`}
              />
            </div>
          </div>

          {/* 4. Deskripsi Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Deskripsi Lengkap Kondisi di Lapangan</span>
              <span className="text-[11px] font-normal text-slate-400">Minimal 15 karakter</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan detail kerusakan, dampak bagi warga, dan kondisi saat hujan/malam..."
              className={`w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${themeColors.ringAccent}`}
            />
          </div>

          {/* 5. Foto Dokumentasi */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera size={14} />
              <span>Foto Bukti Masalah</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Preview Laporan"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="p-2 text-center text-[10px] font-semibold text-slate-400 space-y-1">
                    <CameraOff size={16} className="mx-auto" />
                    <div>Pelapor tidak melampirkan foto</div>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{isUploading ? 'Mengunggah foto...' : 'Unggah Foto Asli dari Perangkat'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Hapus Foto Lampiran</span>
                  </button>
                )}

                {uploadError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 6. Informasi Kontak / Pelapor */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Data Identitas Pelapor
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <EyeOff size={13} />
                <span>Kirim Sebagai Anonim</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Nama Warga Pelapor
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Batalkan
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 ${themeColors.primaryBtn} text-white shadow-md min-h-[44px]`}
            >
              <Save size={16} />
              <span>Simpan Perubahan</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
