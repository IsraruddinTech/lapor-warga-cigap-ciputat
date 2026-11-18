import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  CheckCircle2, 
  MapPin, 
  Glasses, 
  MessageSquare, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface QuickTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  elderlyMode?: boolean;
}

export const QuickTutorialModal: React.FC<QuickTutorialModalProps> = ({
  isOpen,
  onClose,
  elderlyMode,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Selamat Datang di LaporWarga (CIGAP)',
      subtitle: 'Sistem Cepat Tanggap Pengaduan Warga Ciputat',
      badge: 'Langkah 1 dari 5',
      icon: ShieldCheck,
      color: 'from-blue-900 via-blue-800 to-sky-700',
      description: 'LaporWarga CIGAP dibuat khusus untuk seluruh lapisan masyarakat Ciputat—mulai dari remaja, mahasiswa, hingga kakek dan nenek (lansia). Anda tidak perlu membuat akun atau login rumit untuk melapor!',
      tips: [
        'Langsung lapor tanpa syarat kata sandi',
        'Bisa lapor nama asli atau opsi Anonim untuk menjaga privasi Anda',
        'Terhubung langsung ke dinas terkait di Pemkot Tangsel',
      ],
    },
    {
      title: 'Cara Mengirimkan Laporan Masalah',
      subtitle: 'Hanya butuh waktu kurang dari 1 menit!',
      badge: 'Langkah 2 dari 5',
      icon: Camera,
      color: 'from-amber-500 to-orange-600',
      description: 'Ambil foto bukti masalah yang Anda temukan di lingkungan sekitar, seperti lubang jalan aspal, sampah berserakan, atau lampu jalan padam.',
      tips: [
        'Klik tombol "Lapor Sekarang" di menu atas',
        'Pilih kategori keluhan (Jalan, Sampah, Lampu, Drainase, dll)',
        'Unggah foto bukti & tentukan titik kelurahan di Ciputat',
        'Laporan langsung diteruskan ke petugas posko',
      ],
    },
    {
      title: 'Alur Tracking Transparan 4 Langkah',
      subtitle: 'Pantau kemajuan perbaikan secara real-time',
      badge: 'Langkah 3 dari 5',
      icon: CheckCircle2,
      color: 'from-blue-500 to-cyan-600',
      description: 'Setiap laporan diberikan nomor tiket unik (contoh: #CPT-2026-001) yang bisa Anda pantau perkembangannya kapan saja:',
      tips: [
        '1. Diterima: Laporan masuk ke sistem antrean',
        '2. Diverifikasi: Petugas dinas mengecek kebenaran di lapangan',
        '3. Ditindaklanjuti: Tim satgas & alat berat dikerahkan memperbaiki',
        '4. Selesai: Pekerjaan tuntas 100% dan Anda bisa memberi bintang kepuasan',
      ],
    },
    {
      title: 'Fitur Ramah Lansia & Pembaruan Cuaca',
      subtitle: 'Nyaman dibaca oleh orang tua & ada radar banjir',
      badge: 'Langkah 4 dari 5',
      icon: Glasses,
      color: 'from-purple-500 to-pink-600',
      description: 'Kami merancang tampilan dengan kenyamanan visual maksimal untuk mata warga senior serta informasi cuaca lokal Ciputat:',
      tips: [
        'Klik tombol "Mode Lansia" untuk huruf lebih besar dan warna kontras',
        'Mode Gelap untuk kenyamanan melihat di malam hari',
        'Notifikasi pintar cuaca mengingatkan potensi genangan di Flyover Ciputat & Situ Gintung',
      ],
    },
    {
      title: 'Layanan Customer Service & Template Chat',
      subtitle: 'Butuh bantuan cepat? CS siap menjawab',
      badge: 'Langkah 5 dari 5',
      icon: MessageSquare,
      color: 'from-blue-700 via-sky-700 to-cyan-700',
      description: 'Ada pertanyaan atau butuh nomor darurat Damkar/Ambulans? Buka fitur Chat Customer Service yang dilengkapi pilihan pesan cepat otomatis.',
      tips: [
        'Klik ikon chat di pojok kanan bawah atau tombol CS di atas',
        'Pilih template pertanyaan siap pakai tanpa perlu mengetik panjang',
        'Dapatkan nomor kontak dinas siaga 24 jam Ciputat',
      ],
    },
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        {/* Header with gradient banner */}
        <div className={`p-6 bg-gradient-to-r ${current.color} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Tutup panduan"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
              <StepIcon size={32} />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/25 text-white mb-1">
                {current.badge}
              </span>
              <h2 className={`${elderlyMode ? 'text-2xl' : 'text-xl'} font-extrabold leading-tight`}>
                {current.title}
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          <p className={`${elderlyMode ? 'text-lg' : 'text-sm sm:text-base'} text-slate-700 dark:text-slate-300 leading-relaxed font-normal`}>
            {current.description}
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Poin Penting untuk Anda:
            </h4>
            <ul className="space-y-2">
              {current.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span className={elderlyMode ? 'text-base font-medium' : ''}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 pl-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-7 bg-sky-600 dark:bg-sky-400' 
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label={`Ke panduan langkah ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? 'Mengerti & Mulai' : 'Lanjut'}</span>
              {currentStep < steps.length - 1 ? <ChevronRight size={16} /> : <Zap size={16} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
