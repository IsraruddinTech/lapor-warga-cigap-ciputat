import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  History, 
  PlusCircle, 
  BarChart3, 
  MessageSquare,
  Info
} from 'lucide-react';
import { AppTab, ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenCreateReport: () => void;
  onOpenCS: () => void;
  accent?: ThemeAccent;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateReport,
  onOpenCS,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);

  return (
    <nav 
      aria-label="Navigasi Bawah Ponsel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] transition-colors"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        
        {/* Beranda */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          id="m-nav-beranda"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'dashboard'
              ? `${themeColors.textAccent} font-bold`
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard size={20} />
            {activeTab === 'dashboard' && (
              <motion.span
                layoutId="mNavIndicator"
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${themeColors.indicatorBg}`}
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Beranda</span>
        </button>

        {/* Tracking */}
        <button
          type="button"
          onClick={() => onTabChange('riwayat')}
          id="m-nav-tracking"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'riwayat'
              ? `${themeColors.textAccent} font-bold`
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <History size={20} />
            {activeTab === 'riwayat' && (
              <motion.span
                layoutId="mNavIndicator"
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${themeColors.indicatorBg}`}
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Tracking</span>
        </button>

        {/* Action Button: Lapor Cepat (Elevated Center Button) */}
        <div className="flex flex-col items-center -mt-4 relative px-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onOpenCreateReport}
            id="m-nav-lapor-utama"
            aria-label="Buat Laporan Baru"
            className={`w-13 h-13 rounded-full ${themeColors.primaryBtn} text-white flex items-center justify-center shadow-lg shadow-sky-600/30 border-4 border-white dark:border-slate-900 transition-transform`}
          >
            <PlusCircle size={26} className="stroke-[2.2]" />
          </motion.button>
          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
            Lapor
          </span>
        </div>

        {/* Statistik */}
        <button
          type="button"
          onClick={() => onTabChange('statistik')}
          id="m-nav-statistik"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'statistik'
              ? `${themeColors.textAccent} font-bold`
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BarChart3 size={20} />
            {activeTab === 'statistik' && (
              <motion.span
                layoutId="mNavIndicator"
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${themeColors.indicatorBg}`}
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Statistik</span>
        </button>

        {/* Tentang / Layanan CS */}
        <button
          type="button"
          onClick={() => onTabChange('tentang')}
          id="m-nav-tentang"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'tentang' || activeTab === 'faq'
              ? `${themeColors.textAccent} font-bold`
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Info size={20} />
            {(activeTab === 'tentang' || activeTab === 'faq') && (
              <motion.span
                layoutId="mNavIndicator"
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${themeColors.indicatorBg}`}
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Tentang</span>
        </button>

      </div>
    </nav>
  );
};
