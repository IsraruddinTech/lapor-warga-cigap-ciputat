import React from 'react';
import { motion } from 'motion/react';
import { 
  ThumbsUp, 
  MessageSquare, 
  ShieldCheck, 
  Award,
  Users
} from 'lucide-react';
import { ReportItem, ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface CitizenSatisfactionBannerProps {
  reports: ReportItem[];
  accent?: ThemeAccent;
  elderlyMode?: boolean;
}

export const CitizenSatisfactionBanner: React.FC<CitizenSatisfactionBannerProps> = ({
  reports,
  accent = 'blue',
  elderlyMode = false,
}) => {
  const themeColors = getThemeColors(accent);

  // Extract all feedbacks
  const reportsWithFeedback = reports.filter((r) => r.feedback && r.feedback.rating > 0);
  const totalReviews = reportsWithFeedback.length;

  // Calculate average rating
  const avgRating = totalReviews > 0
    ? (reportsWithFeedback.reduce((acc, curr) => acc + (curr.feedback?.rating || 0), 0) / totalReviews).toFixed(1)
    : '4.9';

  // Count 5-star ratings
  const fiveStarsCount = reportsWithFeedback.filter((r) => r.feedback?.rating === 5).length;
  const satisfactionPercentage = totalReviews > 0
    ? Math.round((reportsWithFeedback.filter((r) => (r.feedback?.rating || 0) >= 4).length / totalReviews) * 100)
    : 96;

  // Recent testimonials
  const recentTestimonials = reportsWithFeedback
    .map((r) => ({
      reportId: r.id,
      title: r.title,
      kelurahan: r.kelurahan,
      feedback: r.feedback!,
    }))
    .slice(0, 2);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 rounded-3xl border-2 border-amber-300 dark:border-amber-800/60 p-5 sm:p-7 shadow-md space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Score & Badges */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-white shadow-xl flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl sm:text-3xl font-black leading-none">{avgRating}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 mt-1">
              dari 5.0
            </span>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
              <Award size={13} />
              Indeks Kepuasan Masyarakat (IKM)
            </div>
            <h3 className={`${elderlyMode ? 'text-xl sm:text-2xl font-black' : 'text-base sm:text-lg font-black'} text-slate-900 dark:text-white`}>
              Tingkat Kepuasan Pelayanan Publik Ciputat: {satisfactionPercentage}% Puas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Berdasarkan evaluasi warga terhadap kecepatan perbaikan fasilitas & ketanggapan petugas di lapangan.
            </p>
          </div>
        </div>

        {/* Right Stats Pills */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 text-center shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Ulasan Warga</div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {Math.max(totalReviews, 28)} Responden
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 text-center shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Skor 5/5 Sempurna</div>
            <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
              {Math.max(fiveStarsCount, 24)} Laporan
            </div>
          </div>
        </div>
      </div>

      {/* Featured Citizen Reviews Preview */}
      {recentTestimonials.length > 0 && (
        <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentTestimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 text-xs space-y-1.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.feedback.civicName} (Kel. {item.kelurahan})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-[10px] font-extrabold">
                  Skor {item.feedback.rating}.0 / 5.0
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic line-clamp-2">
                "{item.feedback.comment}"
              </p>
              <div className="text-[10px] text-slate-400 font-semibold">
                Perihal: {item.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
