import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Palette, 
  Sun, 
  Moon, 
  Glasses, 
  Volume2, 
  VolumeX, 
  Check, 
  Smartphone,
  Eye
} from 'lucide-react';
import { AppThemeSettings, ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppThemeSettings;
  onUpdateSettings: (newSettings: Partial<AppThemeSettings>) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const themeColors = getThemeColors(settings.accent);

  const accentOptions: { id: ThemeAccent; name: string; desc: string; bgClass: string; ringClass: string }[] = [
    {
      id: 'blue',
      name: 'Biru Pelayanan Publik',
      desc: 'Warna resmi Pemkot Tangsel & CIGAP',
      bgClass: 'bg-blue-600',
      ringClass: 'ring-blue-500',
    },
    {
      id: 'emerald',
      name: 'Hijau Tangsel Sejuk',
      desc: 'Warna identitas lingkungan bersih & asri',
      bgClass: 'bg-emerald-600',
      ringClass: 'ring-emerald-500',
    },
    {
      id: 'amber',
      name: 'Jingga Siaga Tanggap',
      desc: 'Kontras tinggi & respon cepat satgas',
      bgClass: 'bg-amber-600',
      ringClass: 'ring-amber-500',
    },
    {
      id: 'violet',
      name: 'Ungu Inovasi Modern',
      desc: 'Gaya modern digital smart city',
      bgClass: 'bg-violet-600',
      ringClass: 'ring-violet-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${themeColors.iconBg}`}>
              <Palette size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Personalisasi & Tampilan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur tema warna aksen & kenyamanan visual Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Accent Color Selection (Top Priority) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette size={14} className={themeColors.textAccent} />
                Aksen Warna Sistem ({accentOptions.find(a => a.id === settings.accent)?.name})
              </label>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${themeColors.badge}`}>
                Aktif
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {accentOptions.map((opt) => {
                const isSelected = settings.accent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateSettings({ accent: opt.id })}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      isSelected
                        ? `${themeColors.cardBorderActive} bg-slate-50 dark:bg-slate-800/80`
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${opt.bgClass} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      {isSelected && <Check size={16} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {opt.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Tampilan (Light / Dark) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Eye size={14} />
              Mode Tampilan Layar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateSettings({ darkMode: false })}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all text-center ${
                  !settings.darkMode
                    ? `${themeColors.cardBorderActive} ${themeColors.subtleBg} font-bold shadow-sm`
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <Sun size={24} />
                </div>
                <div>
                  <div className="font-bold text-sm">Mode Terang (Siang)</div>
                  <div className="text-[11px] text-slate-500">Cerah & kontras optimal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ darkMode: true })}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all text-center ${
                  settings.darkMode
                    ? `${themeColors.cardBorderActive} ${themeColors.subtleBg} font-bold shadow-sm`
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="p-3 rounded-full bg-indigo-950 text-indigo-400">
                  <Moon size={24} />
                </div>
                <div>
                  <div className="font-bold text-sm">Mode Gelap (Malam)</div>
                  <div className="text-[11px] text-slate-500">Meredam silau & hemat baterai</div>
                </div>
              </button>
            </div>
          </div>

          {/* Mode Ramah Lansia (Teks Besar & Aksesibilitas) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                  <Glasses size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Mode Ramah Lansia & Senior
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Memperbesar ukuran tulisan hingga 125%, mengoptimalkan kontras, dan memperlebar bidang klik tombol agar nyaman untuk kakek/nenek.
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ elderlyFriendlyMode: !settings.elderlyFriendlyMode })}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.elderlyFriendlyMode ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.elderlyFriendlyMode}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.elderlyFriendlyMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sound Feedback toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Efek Suara Notifikasi & Tombol
                </div>
                <div className="text-[11px] text-slate-500">
                  Bunyi konfirmasi saat laporan terkirim & alert cuaca
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                settings.soundEnabled ? themeColors.dotColor : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold ${themeColors.primaryBtn}`}
          >
            Terapkan & Simpan
          </button>
        </div>
      </motion.div>
    </div>
  );
};
