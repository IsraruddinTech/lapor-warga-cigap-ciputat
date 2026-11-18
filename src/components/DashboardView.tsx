import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Hammer, 
  Lightbulb, 
  Trash2, 
  Waves, 
  Building2, 
  Users, 
  ArrowRight, 
  Phone, 
  Compass, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ThumbsUp,
  FileText,
  Sliders,
  Layers,
  HelpCircle,
  X,
  CameraOff
} from 'lucide-react';
import { ReportItem, ReportCategory, KelurahanCiputat, ThemeAccent, ReportNotification } from '../types';
import { 
  CATEGORY_LABELS, 
  STATUS_LABELS, 
  REPORT_CATEGORIES_HIERARCHY, 
  CategoryHierarchyItem 
} from '../data/mockReports';
import { CiputatInteractiveMap } from './CiputatInteractiveMap';
import { TicketLookupWidget } from './TicketLookupWidget';
import { DispositionLetterModal } from './DispositionLetterModal';
import { getReportPhotos } from '../utils/reportHelpers';
import { getThemeColors } from '../utils/themeColors';

interface DashboardProps {
  reports: ReportItem[];
  notifications?: ReportNotification[];
  selectedKelurahan?: KelurahanCiputat;
  onSelectKelurahan?: (k: KelurahanCiputat) => void;
  onOpenCreateReport: (category?: ReportCategory, subtype?: string) => void;
  onSelectReport: (report: ReportItem) => void;
  onViewAllReports: () => void;
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const DashboardView: React.FC<DashboardProps> = ({
  reports,
  notifications = [],
  onOpenCreateReport,
  onSelectReport,
  onViewAllReports,
  elderlyMode,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);
  const [dispositionReport, setDispositionReport] = useState<ReportItem | null>(null);

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

  const recentReports = reports.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 1. Hero Quick Action Card (Friendly for young and elderly) featuring Min Ci */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-sky-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden border border-sky-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left max-w-2xl">
          {/* Min Ci Avatar Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/90 shadow-2xl bg-white p-1 ring-4 ring-white/20 flex items-center justify-center">
              <img
                src="/min_ci_knight_mascot.jpg"
                alt="Min Ci Maskot CIGAP"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/min_ci_mascot.jpg';
                }}
              />
            </div>
            <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow">
              Min Ci
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-white/20 text-white backdrop-blur-md">
              Maskot Min Ci Siap Mengawal Laporan Warga
            </div>
            <h1 className={`${elderlyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-black text-white leading-tight`}>
              Lihat Masalah di Lingkungan Anda? Laporkan Sekarang!
            </h1>
            <p className={`${elderlyMode ? 'text-lg' : 'text-sm sm:text-base'} text-sky-100/90 leading-relaxed`}>
              Foto jalan berlubang, sampah berserakan, atau lampu mati di Ciputat. Tanpa perlu registrasi akun, tiket laporan langsung sampai ke dinas terkait.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => onOpenCreateReport()}
          className={`${
            elderlyMode ? 'px-8 py-5 text-xl' : 'px-7 py-4 text-base'
          } rounded-2xl font-black bg-white text-slate-900 shadow-2xl hover:bg-slate-100 transition-all flex items-center gap-2.5 shrink-0`}
        >
          <PlusCircle size={elderlyMode ? 26 : 22} className={themeColors.textAccent} />
          <span>Buat Laporan Baru</span>
        </motion.button>
      </div>

      {/* 2. Cek Tiket Laporan Mandiri (Fitur 2) */}
      <TicketLookupWidget
        reports={reports}
        onSelectReport={onSelectReport}
        onOpenDisposition={(r) => setDispositionReport(r)}
        accent={accent}
        elderlyMode={elderlyMode}
      />

      {/* 3. Kategori Pengaduan */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 dark:text-white flex items-center gap-2`}>
              <span>Kategori Pengaduan</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Klik salah satu kategori di bawah untuk langsung membuka formulir pengaduan:
            </p>
          </div>
        </div>

        {/* 4 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {REPORT_CATEGORIES_HIERARCHY.map((cat) => {
            const Icon = getCategoryIcon(cat.id);

            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => onOpenCreateReport(cat.id)}
                className={`relative p-4 rounded-2xl text-left flex flex-col justify-between gap-3 transition-all cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${themeColors.hoverBorder} shadow-xs hover:shadow-lg group`}
              >
                <div className={`w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}>
                  <Icon size={22} />
                </div>

                <div>
                  <h3 className={`${elderlyMode ? 'text-base font-bold' : 'text-xs sm:text-sm font-bold'} text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors`}>
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-1 line-clamp-2">
                    {cat.desc}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Lapor Langsung</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Digital Map of Ciputat (Integrasi Peta Digital) */}
      <div className="space-y-3">
        <CiputatInteractiveMap
          reports={reports}
          notifications={notifications}
          onSelectReport={onSelectReport}
          elderlyMode={elderlyMode}
        />
      </div>

      {/* 6. Recent Reports Feed & Tracking Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`${elderlyMode ? 'text-2xl' : 'text-lg sm:text-xl'} font-bold text-slate-900 dark:text-white`}>
              Laporan Warga Terbaru di Ciputat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perkembangan penanganan masalah di lapangan secara real-time
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAllReports}
            className={`text-xs sm:text-sm font-bold ${themeColors.textAccent} hover:underline flex items-center gap-1`}
          >
            <span>Lihat Semua Riwayat ({reports.length})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentReports.map((item) => {
            const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.diterima;
            const itemPhotos = getReportPhotos(item);
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectReport(item)}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row gap-4"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative flex items-center justify-center">
                  {itemPhotos.length > 0 ? (
                    <img
                      src={itemPhotos[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="p-3 text-center space-y-1 text-slate-400 dark:text-slate-500">
                      <CameraOff size={20} className="mx-auto" />
                      <div className="text-[10px] font-bold leading-tight">
                        Pelapor tidak melampirkan foto
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-black/60 text-white backdrop-blur-xs">
                    Kel. {item.kelurahan}
                  </div>
                  {itemPhotos.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white">
                      {itemPhotos.length} Foto
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-xs font-bold ${themeColors.textAccent}`}>
                        #{item.id}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className={`${elderlyMode ? 'text-base font-bold' : 'text-sm font-bold'} text-slate-900 dark:text-white mt-1 line-clamp-2`}>
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin size={12} className="text-rose-500 shrink-0" />
                      {item.locationName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{item.createdAt.split(' ')[0]}</span>
                    <span className={`font-bold ${themeColors.textAccent} flex items-center gap-1`}>
                      Lacak Progres <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 7. Emergency Direct Hotline Cards for Ciputat */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Phone size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Kontak Darurat Siaga 24 Jam - Ciputat & Tangsel
              </h3>
              <p className="text-xs text-slate-400">
                Hubungi segera jika terjadi kebakaran, musibah pohon tumbang, atau kecelakaan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <a
            href="tel:112"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors block"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Panggilan Bebas Pulsa</div>
            <div className="text-lg font-black text-sky-400 mt-0.5">112 Tangsel</div>
            <div className="text-[11px] text-slate-300">Darurat Terpadu</div>
          </a>

          <a
            href="tel:02174708888"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors block"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Pemadam Kebakaran</div>
            <div className="text-sm sm:text-base font-black text-rose-400 mt-0.5">(021) 7470-8888</div>
            <div className="text-[11px] text-slate-300">Damkar Ciputat</div>
          </a>

          <a
            href="tel:0217401010"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors block"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Polsek Sektor</div>
            <div className="text-sm sm:text-base font-black text-cyan-400 mt-0.5">(021) 740-1010</div>
            <div className="text-[11px] text-slate-300">Polsek Ciputat Timur</div>
          </a>

          <a
            href="tel:119"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors block"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ambulans Gawat Darurat</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">119</div>
            <div className="text-[11px] text-slate-300">Dinkes Tangsel</div>
          </a>
        </div>
      </div>

      {/* Modal Cetak Berita Acara Disposisi & Hasil Penanganan */}
      <DispositionLetterModal
        isOpen={!!dispositionReport}
        report={dispositionReport}
        onClose={() => setDispositionReport(null)}
        accent={accent}
      />
    </div>
  );
};
