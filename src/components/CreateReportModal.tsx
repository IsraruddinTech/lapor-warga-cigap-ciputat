import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Upload, 
  MapPin, 
  Camera, 
  CameraOff,
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Image as ImageIcon,
  Compass,
  FileText,
  User,
  Phone,
  EyeOff,
  Hammer,
  Trash2,
  Waves,
  Building2,
  Users,
  ShieldCheck,
  Info,
  HelpCircle,
  Lock,
  FlipHorizontal,
  RefreshCw,
  AlertCircle,
  Check,
  Layers,
  Lightbulb
} from 'lucide-react';
import { ReportItem, ReportCategory, KelurahanCiputat, ThemeAccent, ReportPhoto } from '../types';
import { REPORT_CATEGORIES_HIERARCHY } from '../data/mockReports';
import { verifyReportAuthenticity } from '../utils/fakeReportVerifier';
import { uploadReportPhoto, CreateReportPayload } from '../utils/cigapApi';
import { formatWibNow } from '../utils/reportHelpers';
import { AntiFraudInfoModal } from './AntiFraudInfoModal';
import { CiputatLiveLocationPicker } from './CiputatLiveLocationPicker';
import { getThemeColors } from '../utils/themeColors';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: CreateReportPayload) => Promise<ReportItem>;
  initialCategory?: ReportCategory;
  initialSubtype?: string;
  elderlyMode?: boolean;
  existingReports?: ReportItem[];
  accent?: ThemeAccent;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  initialCategory,
  initialSubtype,
  elderlyMode,
  existingReports = [],
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);
  const [category, setCategory] = useState<ReportCategory>(initialCategory || 'infrastruktur_fasilitas');
  const [subtype, setSubtype] = useState<string>(initialSubtype || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kelurahan, setKelurahan] = useState<KelurahanCiputat>('Ciputat');
  const [locationName, setLocationName] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Multi-photo states (stored on backend /uploads/)
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [photoMethod, setPhotoMethod] = useState<'file' | 'camera'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const photoUrl = photos[0]?.url || '';

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isHonestyChecked, setIsHonestyChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAntiFraudModalOpen, setIsAntiFraudModalOpen] = useState(false);
  const [isChangingCategory, setIsChangingCategory] = useState<boolean>(!initialCategory);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.3115,
    lng: 106.7452,
  });

  // Sync initialCategory & initialSubtype when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setIsSubmitting(false);
      if (initialCategory) {
        setCategory(initialCategory);
        setIsChangingCategory(false);
      } else {
        setIsChangingCategory(true);
      }
      if (initialSubtype) {
        setSubtype(initialSubtype);
        const isOther = initialSubtype.includes('selain itu') || initialSubtype.toLowerCase().includes('lainnya');
        if (!isOther && (!title.trim() || title.includes(' di '))) {
          setTitle(`${initialSubtype} di `);
        }
      }
    }
  }, [isOpen, initialCategory, initialSubtype]);

  const getCategoryIcon = (id: ReportCategory) => {
    switch (id) {
      case 'infrastruktur_fasilitas':
      case 'jalan_rusak':
      case 'fasilitas_rusak':
        return Building2;
      case 'lingkungan':
      case 'sampah_menumpuk':
      case 'drainase_tersumbat':
        return Trash2;
      case 'pelayanan_publik':
        return Users;
      case 'ketertiban_keamanan':
        return ShieldAlert;
      case 'lampu_mati':
        return Lightbulb;
      default:
        return AlertTriangle;
    }
  };

  const handleSelectCategory = (catId: ReportCategory) => {
    setCategory(catId);
    setIsChangingCategory(false);
    const catData = REPORT_CATEGORIES_HIERARCHY.find((c) => c.id === catId);
    if (catData && (!subtype || !catData.subtypes.includes(subtype))) {
      setSubtype('');
    }
  };

  const handleSelectSubtype = (sub: string) => {
    setSubtype(sub);
    const isOther = sub.includes('selain itu') || sub.toLowerCase().includes('lainnya');
    if (isOther) {
      // Clear title if it was an auto-generated prefix
      const matchesAnySubtypePrefix = REPORT_CATEGORIES_HIERARCHY.some((c) =>
        c.subtypes.some((s) => title.startsWith(s))
      );
      if (matchesAnySubtypePrefix) {
        setTitle('');
      }
    } else {
      const matchesAnySubtypePrefix = REPORT_CATEGORIES_HIERARCHY.some((c) =>
        c.subtypes.some((s) => title.startsWith(s))
      );
      if (!title.trim() || matchesAnySubtypePrefix) {
        setTitle(`${sub} di `);
      }
    }
  };

  // Stop camera media tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
    }
  }, [isOpen, stopCameraStream]);

  const handleCloseModal = () => {
    stopCameraStream();
    onClose();
  };

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraLoading(true);
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('NOT_SUPPORTED');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => {
            console.warn('Video play error:', e);
          });
          setCameraLoading(false);
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraLoading(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera belum diberikan. Aktifkan izin kamera pada browser Anda, atau gunakan opsi Unggah File Foto.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak terdeteksi pada perangkat ini. Silakan gunakan opsi unggah file foto dari galeri/penyimpanan.');
      } else {
        setCameraError('Tidak dapat membuka kamera langsung. Anda dapat menggunakan opsi "Unggah File Foto" dari galeri/penyimpanan.');
      }
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    if (photos.length >= 5) {
      setPhotoError('Maksimal 5 foto bukti per laporan.');
      stopCameraStream();
      return;
    }
    
    // Trigger visual shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 220);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCameraStream();
      setIsUploading(true);
      setPhotoError(null);
      try {
        const uploaded = await uploadReportPhoto(dataUrl, 'Foto langsung dari kamera pelapor');
        setPhotos((prev) => [...prev, uploaded]);
      } catch {
        setPhotos((prev) => [
          ...prev,
          {
            id: `ph-cam-${Date.now()}`,
            url: dataUrl,
            caption: 'Foto langsung dari kamera pelapor',
            uploadedAt: formatWibNow(),
          },
        ]);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const liveVerification = React.useMemo(() => {
    return verifyReportAuthenticity({
      title,
      description,
      category,
      kelurahan,
      coordinates: selectedCoords,
      photoUrl,
      reporterPhone,
      isAnonymous,
      existingReports,
    });
  }, [title, description, category, kelurahan, selectedCoords, photoUrl, reporterPhone, isAnonymous, existingReports]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      processSelectedFile(file);
    });
    e.target.value = '';
  };

  const processSelectedFile = (file?: File) => {
    if (!file) return;

    if (photos.length >= 5) {
      setPhotoError('Maksimal 5 foto bukti per laporan.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('File yang dipilih harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setPhotoError('Ukuran file foto maksimal 12MB. Silakan pilih foto dengan ukuran lebih kecil.');
      return;
    }

    setIsUploading(true);
    setPhotoError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        const uploaded = await uploadReportPhoto(dataUrl);
        setPhotos((prev) => [...prev.slice(0, 4), uploaded]);
      } catch {
        setPhotos((prev) => [
          ...prev.slice(0, 4),
          {
            id: `ph-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url: dataUrl,
            uploadedAt: formatWibNow(),
          },
        ]);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      setPhotoError('Gagal memproses file foto. Silakan coba file lain.');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePhotoCaption = (photoId: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((f) => processSelectedFile(f));
    }
  };

  const submitReportToServer = async () => {
    if (isSubmitting) return;

    if (!title.trim() || !locationName.trim()) {
      setPhotoError('Mohon lengkapi judul laporan dan lokasi kejadian di Ciputat.');
      return;
    }

    if (!isHonestyChecked) {
      setPhotoError('Mohon centang pernyataan komitmen kebenaran laporan sebelum mengirim.');
      return;
    }

    const finalPhotos = photos;
    const finalPrimaryPhoto = finalPhotos[0]?.url || '';
    const isFlagged = liveVerification.isSuspectedFake;
    const nowWib = formatWibNow();
    const nowIso = new Date().toISOString();

    const reportPayload: CreateReportPayload = {
      title: title.trim(),
      description:
        description.trim() ||
        `Laporan keluhan warga terkait masalah ${category.replace('_', ' ')} (${subtype || 'Umum'}) di wilayah ${locationName}, Ciputat.`,
      category,
      subtype: subtype.trim() || undefined,
      status: isFlagged ? 'ditolak' : 'diterima',
      kelurahan,
      locationName: locationName.trim(),
      coordinates: selectedCoords,
      reporterName: isAnonymous ? 'Warga Anonim' : (reporterName.trim() || 'Warga Ciputat'),
      reporterPhone: isAnonymous ? undefined : reporterPhone.trim() || undefined,
      isAnonymous,
      photoUrl: finalPrimaryPhoto,
      photos: finalPhotos,
      createdAt: nowWib,
      createdAtIso: nowIso,
      updatedAt: nowWib,
      estimatedCompletion: isFlagged ? 'Dibatalkan (Karantina Hoaks)' : undefined,
      rejectionReason: isFlagged ? liveVerification.reasons.join('; ') : undefined,
      assignedDepartment: isFlagged ? 'Tim Audit Anti-Fraud Posko CIGAP' : 'Posko Pelayanan Cepat Tanggap Ciputat',
      adminNotes: isFlagged
        ? `PERINGATAN SISTEM: Terdeteksi skor validitas rendah (${liveVerification.trustScore}%). Laporan dikarantina untuk audit posko. Alasan: ${liveVerification.reasons.join('; ')}`
        : `Laporan baru diterima dari kanal warga. Terverifikasi sistem validitas awal (Skor Keaslian: ${liveVerification.trustScore}%).`,
      upvotes: 1,
      verification: liveVerification,
      timeline: [
        {
          id: 't-init-' + Date.now(),
          status: isFlagged ? 'ditolak' : 'diterima',
          title: isFlagged ? 'Laporan Ditolak (Karantina Audit)' : 'Laporan Diterima',
          description: isFlagged
            ? 'Laporan dikarantina karena indikasi ketidaksesuaian data (Skor Validitas: ' + liveVerification.trustScore + '%).'
            : 'Laporan Anda sedang didaftarkan ke basis data CIGAP dengan nomor tiket resmi dari server.',
          timestamp: nowWib,
          createdAtIso: nowIso,
          actor: 'Sistem Portal CIGAP',
        },
      ],
    };

    setIsSubmitting(true);
    setSubmitError(null);
    setPhotoError(null);

    try {
      await onSubmitReport(reportPayload);

      // Confetti effect only after server confirms official report ID
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#f59e0b', '#1e3a8a'],
        });
      } catch {
        // ignore in environments without canvas
      }

      setPhotos([]);
      setTitle('');
      setDescription('');
      setLocationName('');
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Server CIGAP tidak dapat dijangkau saat mengirim laporan.';
      setSubmitError(
        `${msg} Data formulir Anda tetap aman dan tidak hilang—silakan periksa koneksi lalu tekan "Coba Kirim Ulang".`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitReportToServer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto sm:my-6 flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 shrink-0">
              <Camera size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-300 border border-amber-400/40">
                Tanpa Perlu Login
              </span>
              <h2 className={`${elderlyMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl'} font-bold text-white leading-tight`}>
                Buat Laporan Pengaduan Baru
              </h2>
              <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1">
                Sampaikan masalah fasilitas lingkungan di Ciputat secara langsung
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* 1. Pilih Kategori Masalah (Supertype: Kategori Laporan) */}
          <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            {isChangingCategory ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className={`${elderlyMode ? 'text-base font-bold' : 'text-xs font-bold uppercase tracking-wider'} text-slate-800 dark:text-slate-200 flex items-center gap-1.5`}>
                    <AlertTriangle size={15} className={themeColors.textAccent} />
                    <span>1. Kategori Pengaduan</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih salah satu dari 4 kategori
                  </span>
                </div>

                {/* 4 Category Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {REPORT_CATEGORIES_HIERARCHY.map((cat) => {
                    const Icon = getCategoryIcon(cat.id);
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? `${themeColors.cardBorderActive} ${themeColors.subtleBg} ${themeColors.textAccent} shadow-sm ring-2 ring-sky-500/20`
                            : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? `${themeColors.primaryBtn} text-white shadow-sm` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            <Icon size={16} />
                          </div>
                        </div>
                        <span className={`text-xs font-bold leading-tight ${elderlyMode ? 'text-sm' : ''}`}>
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (() => {
              const currentCatHierarchy = REPORT_CATEGORIES_HIERARCHY.find((c) => c.id === category);
              if (!currentCatHierarchy) return null;
              const CatIcon = getCategoryIcon(currentCatHierarchy.id);

              return (
                <div className="space-y-3">
                  {/* Category Confirmed Header - No Repetition */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${currentCatHierarchy.color} flex items-center justify-center text-white shadow shrink-0`}>
                        <CatIcon size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          Kategori: {currentCatHierarchy.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsChangingCategory(true)}
                      className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors shrink-0 cursor-pointer"
                    >
                      Ganti Kategori
                    </button>
                  </div>

                  {/* Immediate Subtype Selection */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Layers size={14} className={themeColors.textAccent} />
                        <span>Pilih Subtype Keluhan ({currentCatHierarchy.name}):</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </span>
                      {subtype && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check size={12} /> Terpilih
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentCatHierarchy.subtypes.map((sub, idx) => {
                        const isSubSelected = subtype === sub;
                        const isOther = sub.includes('selain itu') || sub.toLowerCase().includes('lainnya');

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSubtype(sub)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isSubSelected
                                ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-bold ring-2 ring-sky-400'
                                : isOther
                                ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                                : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                isSubSelected ? 'bg-white text-sky-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                {isOther ? '?' : idx + 1}
                              </span>
                              <span className="text-xs leading-snug line-clamp-2">{sub}</span>
                            </div>
                            {isSubSelected && <Check size={14} className="shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2. Judul & Rincian Laporan */}
          <div className="space-y-3">
            <div>
              <label className={`${elderlyMode ? 'text-base font-bold' : 'text-xs font-bold uppercase tracking-wider'} text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1`}>
                <FileText size={15} className={themeColors.textAccent} />
                2. Judul Laporan *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Lubang Aspal Dalam 20cm di depan Pasar Ciputat"
                className={`w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${elderlyMode ? 'text-base' : 'text-sm'} focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                Penjelasan Detail / Kondisi:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan kondisi masalah, apakah mengganggu lalu lintas, membahayakan anak sekolah, atau berbau menyengat..."
                className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${elderlyMode ? 'text-base' : 'text-sm'} focus:outline-none`}
              />
            </div>
          </div>

          {/* 3. Lampirkan Foto Bukti (Multi-Photo + Captions) */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <label className={`${elderlyMode ? 'text-base font-bold' : 'text-xs font-bold uppercase tracking-wider'} text-slate-700 dark:text-slate-300 flex items-center gap-1.5`}>
                <ImageIcon size={15} className={themeColors.textAccent} />
                <span>3. Foto Bukti Masalah di Lapangan (Maks. 5 Foto)</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Opsional namun sangat membantu verifikasi petugas
              </span>
            </div>

            {/* Error Message Alert */}
            {photoError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span className="flex-1 font-semibold">{photoError}</span>
              </div>
            )}

            {/* Uploaded Photos Grid + Caption Editor */}
            {photos.length > 0 && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{photos.length} Foto Bukti Terpasang & Tersimpan di Server</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{photos.length}/5 foto</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 space-y-2 relative"
                    >
                      <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Foto bukti ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                          Foto #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition-colors cursor-pointer"
                          title="Hapus foto ini"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => handleUpdatePhotoCaption(photo.id, e.target.value)}
                        placeholder="Keterangan foto (opsional, misal: Tampak dekat)..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Photos (if < 5) */}
            {photos.length < 5 && (
              <div className="space-y-3">
                {/* Method selector tabs */}
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setPhotoMethod('file');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      photoMethod === 'file'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Upload size={14} />
                    <span>Unggah File / Galeri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoMethod('camera');
                      startCamera('environment');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      photoMethod === 'camera'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Camera size={14} />
                    <span>Kamera Langsung</span>
                  </button>
                </div>

                {/* Tab 1: File Upload / Drag & Drop */}
                {photoMethod === 'file' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                      isDragOver
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 scale-[0.99]'
                        : `border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 ${themeColors.hoverBorder}`
                    }`}
                  >
                    {isUploading ? (
                      <div className="py-6 space-y-2 text-center">
                        <RefreshCw size={24} className={`mx-auto animate-spin ${themeColors.textAccent}`} />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Sedang membaca & memproses file foto...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={`mx-auto w-12 h-12 rounded-2xl ${themeColors.badge} flex items-center justify-center shadow-inner`}>
                          <Upload size={22} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Tarik & letakkan file foto di sini
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            atau pilih langsung dari memori ponsel / komputer Anda
                          </div>
                        </div>

                        <div className="flex items-center justify-center pt-1">
                          <label className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer text-white shadow-md transition-all flex items-center gap-1.5 ${themeColors.primaryBtn}`}>
                            <Upload size={14} />
                            <span>Pilih File dari Perangkat</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileUpload}
                              className="hidden"
                              id="input-file-laporan"
                            />
                          </label>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-1">
                          Format didukung: JPG, JPEG, PNG, WEBP (Maksimal 12MB/foto, hingga 5 foto)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Live Camera Viewfinder */}
                {photoMethod === 'camera' && (
                  <div className="border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-900 text-white shadow-inner">
                    {isCameraActive ? (
                      <div className="relative w-full aspect-video sm:aspect-4/3 max-h-[340px] bg-black flex items-center justify-center overflow-hidden">
                        {/* Shutter visual flash overlay */}
                        {shutterFlash && (
                          <div className="absolute inset-0 z-30 bg-white/95 transition-opacity duration-200 pointer-events-none" />
                        )}

                        {/* Live Video Element */}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Viewfinder UI Overlays */}
                        {/* Corner guides */}
                        <div className="absolute inset-4 pointer-events-none border-2 border-white/20 rounded-xl flex flex-col justify-between p-2">
                          <div className="flex justify-between">
                            <div className="w-5 h-5 border-t-2 border-l-2 border-sky-400 rounded-tl-sm" />
                            <div className="w-5 h-5 border-t-2 border-r-2 border-sky-400 rounded-tr-sm" />
                          </div>
                          <div className="flex justify-between">
                            <div className="w-5 h-5 border-b-2 border-l-2 border-sky-400 rounded-bl-sm" />
                            <div className="w-5 h-5 border-b-2 border-r-2 border-sky-400 rounded-br-sm" />
                          </div>
                        </div>

                        {/* Top bar controls */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-600/90 text-white flex items-center gap-1.5 shadow-md backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Kamera Siaga Aktif
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={toggleFacingMode}
                              className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold border border-white/20 backdrop-blur-md flex items-center gap-1 transition-all"
                              title="Ganti kamera depan atau belakang"
                            >
                              <FlipHorizontal size={13} />
                              <span className="hidden sm:inline">Balik Kamera</span>
                            </button>
                            <button
                              type="button"
                              onClick={stopCameraStream}
                              className="p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all"
                              title="Tutup kamera"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Bar: Big Shutter Capture Button */}
                        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4 z-20 pointer-events-auto">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={capturePhoto}
                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm shadow-xl flex items-center gap-2 border-2 border-white cursor-pointer hover:shadow-rose-500/50"
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-white" />
                            <span>Jepret Foto Bukti</span>
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      /* Camera is not active yet */
                      <div className="p-6 text-center space-y-4">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-900/60 border border-sky-400/40 text-sky-300 flex items-center justify-center">
                          <Camera size={28} />
                        </div>
                        <div className="space-y-1 max-w-md mx-auto">
                          <div className="text-sm font-bold text-white">
                            Ambil Foto Bukti Langsung di Lokasi
                          </div>
                          <p className="text-xs text-slate-300">
                            Arahkan kamera ke titik kerusakan jalan, lampu mati, tumpukan sampah, atau fasilitas terkait di Ciputat.
                          </p>
                        </div>

                        {cameraLoading && (
                          <div className="flex items-center justify-center gap-2 text-xs text-sky-400 font-semibold py-2">
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Sedang menginisialisasi kamera perangkat...</span>
                          </div>
                        )}

                        {cameraError && (
                          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs text-left flex items-start gap-2 max-w-md mx-auto">
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                            <div className="space-y-1">
                              <span className="font-bold block">Pemberitahuan Kamera:</span>
                              <span>{cameraError}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-center pt-1">
                          <button
                            type="button"
                            onClick={() => startCamera('environment')}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Camera size={15} />
                            <span>Nyalakan Kamera Sekarang</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Titik Lokasi Kejadian di Ciputat (Real-Time Map & Live GPS) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <CiputatLiveLocationPicker
              selectedCoords={selectedCoords}
              onCoordsChange={setSelectedCoords}
              kelurahan={kelurahan}
              onKelurahanChange={setKelurahan}
              locationName={locationName}
              onLocationNameChange={setLocationName}
              elderlyMode={elderlyMode}
              accent={accent}
            />
          </div>

          {/* 5. Identitas Pelapor (Bisa Anonim - Tanpa Login!) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-sky-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  5. Identitas Pelapor (Opsional)
                </span>
              </div>

              {/* Anonymous Toggle */}
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <EyeOff size={14} className="text-slate-500" />
                <span>Lapor Secara Anonim</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="No. WhatsApp / HP (Opsional)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                🔒 Mode Anonim Aktif: Nama dan nomor Anda tidak akan ditampilkan ke publik atau pihak mana pun.
              </p>
            )}
          </div>

          {/* 6. Sistem Verifikasi Keaslian & Anti-Laporan Palsu CIGAP */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-600 text-white">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                    Indikator Skor Keaslian (Trust Index CIGAP)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sistem otomatis memverifikasi GPS, integritas foto, dan anti-spam
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                  liveVerification.trustScore >= 80
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                    : liveVerification.trustScore >= 50
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                }`}>
                  {liveVerification.trustScore}% • {liveVerification.trustScore >= 80 ? 'Sangat Kredibel' : liveVerification.trustScore >= 50 ? 'Cukup Kredibel' : 'Peringatan Hoaks'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAntiFraudModalOpen(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  title="Pelajari Protokol Anti-Laporan Palsu"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  liveVerification.trustScore >= 80
                    ? 'bg-gradient-to-r from-blue-700 to-sky-500'
                    : liveVerification.trustScore >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${liveVerification.trustScore}%` }}
              />
            </div>

            {/* Micro checks pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
              <div className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${
                liveVerification.checks.gpsRadiusValid
                  ? themeColors.badge
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200'
              }`}>
                {liveVerification.checks.gpsRadiusValid ? '✓' : '✗'} GPS Ciputat
              </div>

              <div className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${
                liveVerification.checks.photoAuthenticity
                  ? themeColors.badge
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200'
              }`}>
                {liveVerification.checks.photoAuthenticity ? '✓' : '!'} Bukti Foto
              </div>

              <div className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${
                liveVerification.checks.antiSpamScore >= 60
                  ? themeColors.badge
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200'
              }`}>
                {liveVerification.checks.antiSpamScore >= 60 ? '✓' : '✗'} Kualitas Narasi
              </div>

              <div className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${
                liveVerification.checks.duplicateClusterRisk === 'rendah'
                  ? themeColors.badge
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200'
              }`}>
                {liveVerification.checks.duplicateClusterRisk === 'rendah' ? '✓' : '⚠'} Duplikasi
              </div>
            </div>

            {/* Warning / Notice when duplicate or low score */}
            {liveVerification.checks.duplicateClusterRisk !== 'rendah' && liveVerification.duplicateClusterReportId && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Deteksi Duplikasi Cerdas:</strong> Ada laporan sejenis di radius dekat (#{liveVerification.duplicateClusterReportId}). Pengaduan Anda akan otomatis digabung sebagai penguat prioritas penanganan dinas!
                </span>
              </div>
            )}

            {liveVerification.isSuspectedFake && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                <ShieldAlert size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span>
                  <strong>Peringatan Verifikasi:</strong> Skor validitas berada di bawah 50%. Laporan dengan data tidak sinkron akan otomatis masuk ke karantina audit anti-hoaks sebelum ditindaklanjuti.
                </span>
              </div>
            )}

            {/* Checkbox Deklarasi Kejujuran */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="honesty-declaration"
                checked={isHonestyChecked}
                onChange={(e) => setIsHonestyChecked(e.target.checked)}
                className="mt-0.5 rounded w-4 h-4 cursor-pointer"
              />
              <label htmlFor="honesty-declaration" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none leading-relaxed">
                Saya menyatakan bahwa laporan ini adalah <strong>kejadian nyata di Ciputat</strong> dan bersedia mematuhi Perda Ketertiban Umum & UU ITE (Bebas Laporan Palsu / Hoaks).
              </label>
            </div>
          </div>

          {/* Submission Error Alert with Retry */}
          {submitError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-rose-900 dark:text-rose-100">
                    Pengiriman Laporan Gagal
                  </div>
                  <p className="mt-0.5 leading-relaxed">{submitError}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void submitReportToServer()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
              >
                <RefreshCw size={14} className={isSubmitting ? 'animate-spin' : ''} />
                <span>Coba Kirim Ulang</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAntiFraudModalOpen(true)}
              className={`text-xs ${themeColors.textAccent} hover:underline flex items-center justify-center sm:justify-start gap-1 font-semibold py-1`}
            >
              <Info size={13} />
              Bagaimana CIGAP mencegah laporan palsu?
            </button>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                Batal
              </button>
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                type="submit"
                disabled={!isHonestyChecked || isSubmitting}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                  isHonestyChecked && !isSubmitting
                    ? `${themeColors.primaryBtn} text-white shadow-lg cursor-pointer`
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Mengirim ke Server CIGAP...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim Laporan ke Posko CIGAP</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Modal Edukasi Anti-Fraud */}
      <AntiFraudInfoModal
        isOpen={isAntiFraudModalOpen}
        onClose={() => setIsAntiFraudModalOpen(false)}
        elderlyMode={elderlyMode}
      />
    </div>
  );
};
