import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PieChart, 
  ShieldCheck, 
  ArrowUpRight,
  Award,
  Zap
} from 'lucide-react';
import { ReportItem, ThemeAccent } from '../types';
import { CATEGORY_LABELS, REPORT_CATEGORIES_HIERARCHY } from '../data/cigapConstants';
import { getThemeColors } from '../utils/themeColors';

interface StatsProps {
  reports: ReportItem[];
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const StatisticsView: React.FC<StatsProps> = ({ reports, elderlyMode, accent = 'blue' }) => {
  const themeColors = getThemeColors(accent);
  const total = reports.length;
  const selesai = reports.filter((r) => r.status === 'selesai').length;
  const proses = reports.filter(
    (r) =>
      r.status === 'tindak_lanjut' ||
      r.status === 'diverifikasi' ||
      r.status === 'dalam_peninjauan' ||
      r.status === 'diteruskan_ke_dinas' ||
      r.status === 'menunggu_tindak_lanjut'
  ).length;
  const pending = reports.filter((r) => r.status === 'diterima').length;

  const completionRate = total > 0 ? Math.round((selesai / total) * 100) : 0;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  // Calculate average rating from feedback
  const feedbackList = reports.filter((r) => r.feedback).map((r) => r.feedback!.rating);
  const avgRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((a, b) => a + b, 0) / feedbackList.length).toFixed(1)
      : '4.9';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${themeColors.navBg} text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
            Kinerja Pelayanan Publik Ciputat
          </span>
          <h1 className={`${elderlyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-black text-white`}>
            Statistik & Transparansi Kinerja Pengaduan
          </h1>
          <p className={`${elderlyMode ? 'text-lg' : 'text-sm sm:text-base'} text-slate-100 leading-relaxed`}>
            Data berkala laporan warga yang masuk, diverifikasi, dan diselesaikan oleh dinas teknis di lingkungan Kecamatan Ciputat.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Laporan */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Laporan</span>
            <BarChart3 size={18} className={themeColors.textAccent} />
          </div>
          <div className={`${elderlyMode ? 'text-3xl' : 'text-2xl sm:text-3xl'} font-black text-slate-900 dark:text-white`}>
            {total}
          </div>
          <div className={`text-[11px] ${themeColors.textAccent} font-semibold flex items-center gap-1`}>
            <TrendingUp size={13} />
            <span>100% Tercatat Resmi</span>
          </div>
        </div>

        {/* Tingkat Penyelesaian */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tingkat Tuntas</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className={`${elderlyMode ? 'text-3xl' : 'text-2xl sm:text-3xl'} font-black text-slate-900 dark:text-white`}>
            {completionRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {selesai} dari {total} aduan rampung
          </div>
        </div>

        {/* Rata-rata Waktu Respon */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Waktu Respon</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className={`${elderlyMode ? 'text-3xl' : 'text-2xl sm:text-3xl'} font-black text-slate-900 dark:text-white`}>
            2.4 Jam
          </div>
          <div className="text-[11px] text-amber-600 font-medium">
            Kecepatan verifikasi lapangan
          </div>
        </div>

        {/* Indeks Kepuasan Masyarakat */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Indeks Kepuasan</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <div className={`${elderlyMode ? 'text-3xl' : 'text-2xl sm:text-3xl'} font-black text-slate-900 dark:text-white flex items-center gap-1.5`}>
            {avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className={`text-[11px] ${themeColors.textAccent} font-medium`}>
            Kategori: "Sangat Baik"
          </div>
        </div>
      </div>

      {/* Main Charts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Distribution Bars */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Sebaran Kategori Keluhan Warga Ciputat
              </h3>
              <p className="text-xs text-slate-500">
                Data real-time berdasarkan laporan yang diajukan masyarakat
              </p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <PieChart size={18} />
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {REPORT_CATEGORIES_HIERARCHY.map((cat) => {
              const count = reports.filter((r) => {
                if (r.category === cat.id) return true;
                if (cat.id === 'infrastruktur_fasilitas' && (r.category === 'jalan_rusak' || r.category === 'lampu_mati' || r.category === 'fasilitas_rusak')) return true;
                if (cat.id === 'lingkungan' && (r.category === 'sampah_menumpuk' || r.category === 'drainase_tersumbat')) return true;
                return false;
              }).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {cat.name}
                    </span>
                    <span className="font-semibold text-slate-500">
                      {count} Laporan ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${themeColors.solidBg} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Service Speed by Agency & Top Kelurahan */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dinas Response Leaderboard */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Kinerja Respon Dinas Tercepat
                </h3>
                <p className="text-[11px] text-slate-400">Penyelesaian di bawah standar SOP 48 jam</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Dishub Tangsel (Lampu PJU)', speed: '14 Jam', score: '98%' },
                { name: 'Dinas Lingkungan Hidup (Sampah)', speed: '18 Jam', score: '95%' },
                { name: 'DSDABMBK (Jalan & Drainase)', speed: '26 Jam', score: '92%' },
                { name: 'Satpol PP (Ketertiban Umum)', speed: '4 Jam', score: '99%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${themeColors.badge}`}>
                      {item.speed}
                    </span>
                    <span className="text-slate-400 font-medium">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kelurahan Paling Aktif */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin size={16} className="text-rose-500" />
              Kelurahan dengan Partisipasi Tertinggi:
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold">
                1. Ciputat (Flyover & Pasar)
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                2. Cipayung (Situ Gintung)
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                3. Serua Indah
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                4. Sawah Baru
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
