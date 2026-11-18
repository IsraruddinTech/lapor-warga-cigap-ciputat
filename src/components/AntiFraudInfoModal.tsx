import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Camera, 
  CopyCheck, 
  FileCheck, 
  AlertTriangle, 
  Scale, 
  CheckCircle2, 
  Lock,
  ChevronRight
} from 'lucide-react';
import { ANTI_FRAUD_LAYERS } from '../utils/fakeReportVerifier';

interface AntiFraudInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  elderlyMode?: boolean;
}

export const AntiFraudInfoModal: React.FC<AntiFraudInfoModalProps> = ({
  isOpen,
  onClose,
  elderlyMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md text-sky-300 border border-white/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30">
                Sistem Integritas CIGAP
              </span>
              <h2 className={`${elderlyMode ? 'text-2xl' : 'text-xl'} font-bold text-white mt-1`}>
                Protokol Pencegahan & Verifikasi Laporan Palsu
              </h2>
              <p className="text-xs text-white/80">
                Bagaimana Posko CIGAP memastikan setiap pengaduan warga akurat, nyata, dan bebas hoaks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Overview Banner */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div className="text-xs text-sky-900 dark:text-sky-200 space-y-1">
              <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                Komitmen Pengaduan Bersih & Bertanggung Jawab
              </strong>
              <p className="leading-relaxed">
                Untuk mencegah penyalahgunaan sistem pengaduan publik tanpa login, Posko CIGAP menerapkan <strong>sistem verifikasi berlapis otomatis</strong> dan <strong>audit kurasi petugas lapangan</strong>. Warga tetap dapat melapor dengan cepat dan aman, sementara bot, spam, dan laporan hoaks otomatis tersaring.
              </p>
            </div>
          </div>

          {/* 5 Lapisan Perlindungan */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-sky-600" />
              5 Lapisan Perlindungan Mencegah Laporan Palsu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ANTI_FRAUD_LAYERS.map((layer) => (
                <div
                  key={layer.step}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-sky-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-700 to-sky-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      {layer.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                      {layer.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {layer.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {layer.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Indikator Skor Keaslian (Trust Index) */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Standar Skor Keaslian Laporan (Trust Index)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center">
                <div className="font-extrabold text-sky-700 dark:text-sky-300 text-base">80% – 100%</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">Sangat Kredibel</div>
                <p className="text-[10px] text-slate-500 mt-1">
                  GPS cocok, foto bukti jelas, teks spesifik. Langsung diteruskan ke dinas terkait.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <div className="font-extrabold text-amber-700 dark:text-amber-300 text-base">50% – 79%</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">Perlu Tinjauan Lapangan</div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Ada potensi duplikasi atau foto kurang fokus. Petugas posko melakukan cek via WA/lapangan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                <div className="font-extrabold text-rose-700 dark:text-rose-300 text-base">&lt; 50%</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">Peringatan Hoaks</div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Koordinat di luar Ciputat, terdeteksi kata spam atau foto stok. Ditahan di karantina audit.
                </p>
              </div>
            </div>
          </div>

          {/* Landasan Hukum & Sanksi Laporan Palsu */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
              <Scale size={20} />
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1">
              <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                Dasar Hukum & Sanksi Tegas Laporan Palsu
              </strong>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                Penyampaian laporan palsu, aduan fitnah terhadap warga/petugas, atau sabotase kanal pelayanan publik melanggar:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                <li><strong>Perda Kota Tangerang Selatan No. 3 Tahun 2019</strong> tentang Ketertiban Umum dan Ketentraman Masyarakat.</li>
                <li><strong>Pasal 27 ayat (3) & Pasal 35 UU ITE</strong> mengenai manipulasi informasi elektronik dan pencemaran nama baik.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            SOP Terpadu Diskominfosandi & Posko CIGAP Ciputat
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Tutup & Mengerti
          </button>
        </div>
      </motion.div>
    </div>
  );
};
