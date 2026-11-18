import { ThemeAccent } from '../types';

export interface ThemeColorConfig {
  id: ThemeAccent;
  label: string;
  sublabel: string;
  dotColor: string;
  primaryBtn: string;
  primaryGrad: string;
  activeTab: string;
  indicatorBg: string;
  textAccent: string;
  hoverText: string;
  hoverBorder: string;
  cardBorderActive: string;
  badge: string;
  borderAccent: string;
  ringAccent: string;
  subtleBg: string;
  iconBg: string;
  solidBg: string;
  navBg: string;
  hoverSubtleBg: string;
}

export const THEME_COLOR_MAP: Record<ThemeAccent, ThemeColorConfig> = {
  blue: {
    id: 'blue',
    label: 'Biru Pelayanan (Default)',
    sublabel: 'Identitas resmi Pemkot Tangsel & CIGAP',
    dotColor: 'bg-blue-600',
    primaryBtn: 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white shadow-md shadow-sky-600/20',
    primaryGrad: 'from-blue-700 to-sky-600',
    activeTab: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-b-2 border-sky-600',
    indicatorBg: 'bg-sky-600 dark:bg-sky-400',
    textAccent: 'text-sky-600 dark:text-sky-400',
    hoverText: 'hover:text-sky-600 dark:hover:text-sky-400',
    hoverBorder: 'hover:border-sky-500 dark:hover:border-sky-500',
    cardBorderActive: 'border-sky-500 shadow-md ring-2 ring-sky-500/20',
    badge: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    borderAccent: 'border-sky-500',
    ringAccent: 'focus:ring-sky-500 focus:border-sky-500 ring-sky-500/20',
    subtleBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/50',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400',
    solidBg: 'bg-sky-600 text-white hover:bg-sky-700',
    navBg: 'from-slate-900 via-blue-900 to-sky-800',
    hoverSubtleBg: 'hover:bg-sky-50 dark:hover:bg-sky-950/50',
  },
  emerald: {
    id: 'emerald',
    label: 'Hijau Tangsel Sejuk',
    sublabel: 'Nuansa lingkungan bersih & Situ Gintung Ciputat',
    dotColor: 'bg-emerald-600',
    primaryBtn: 'bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20',
    primaryGrad: 'from-emerald-700 to-teal-600',
    activeTab: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600',
    indicatorBg: 'bg-emerald-600 dark:bg-emerald-400',
    textAccent: 'text-emerald-600 dark:text-emerald-400',
    hoverText: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-500',
    cardBorderActive: 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    borderAccent: 'border-emerald-500',
    ringAccent: 'focus:ring-emerald-500 focus:border-emerald-500 ring-emerald-500/20',
    subtleBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400',
    solidBg: 'bg-emerald-600 text-white hover:bg-emerald-700',
    navBg: 'from-slate-900 via-emerald-950 to-teal-900',
    hoverSubtleBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
  },
  amber: {
    id: 'amber',
    label: 'Jingga Siaga Tanggap',
    sublabel: 'Semangat satgas cepat tanggap & responsif',
    dotColor: 'bg-amber-600',
    primaryBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-600/20',
    primaryGrad: 'from-amber-600 to-orange-600',
    activeTab: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-b-2 border-amber-600',
    indicatorBg: 'bg-amber-600 dark:bg-amber-400',
    textAccent: 'text-amber-600 dark:text-amber-400',
    hoverText: 'hover:text-amber-600 dark:hover:text-amber-400',
    hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-500',
    cardBorderActive: 'border-amber-500 shadow-md ring-2 ring-amber-500/20',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    borderAccent: 'border-amber-500',
    ringAccent: 'focus:ring-amber-500 focus:border-amber-500 ring-amber-500/20',
    subtleBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400',
    solidBg: 'bg-amber-600 text-white hover:bg-amber-700',
    navBg: 'from-slate-900 via-amber-950 to-orange-900',
    hoverSubtleBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/50',
  },
  violet: {
    id: 'violet',
    label: 'Ungu Inovasi Modern',
    sublabel: 'Tata kelola digital cerdas & transparan',
    dotColor: 'bg-violet-600',
    primaryBtn: 'bg-gradient-to-r from-violet-700 to-indigo-600 hover:from-violet-800 hover:to-indigo-700 text-white shadow-md shadow-violet-600/20',
    primaryGrad: 'from-violet-700 to-indigo-600',
    activeTab: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-b-2 border-violet-600',
    indicatorBg: 'bg-violet-600 dark:bg-violet-400',
    textAccent: 'text-violet-600 dark:text-violet-400',
    hoverText: 'hover:text-violet-600 dark:hover:text-violet-400',
    hoverBorder: 'hover:border-violet-500 dark:hover:border-violet-500',
    cardBorderActive: 'border-violet-500 shadow-md ring-2 ring-violet-500/20',
    badge: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
    borderAccent: 'border-violet-500',
    ringAccent: 'focus:ring-violet-500 focus:border-violet-500 ring-violet-500/20',
    subtleBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/80 dark:text-violet-400',
    solidBg: 'bg-violet-600 text-white hover:bg-violet-700',
    navBg: 'from-slate-900 via-purple-950 to-violet-900',
    hoverSubtleBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/50',
  },
};

export const getThemeColors = (accent?: string): ThemeColorConfig => {
  const key = (accent as ThemeAccent) || 'blue';
  return THEME_COLOR_MAP[key] || THEME_COLOR_MAP.blue;
};
