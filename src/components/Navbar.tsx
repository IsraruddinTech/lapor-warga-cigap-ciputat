import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlusCircle,
  LayoutDashboard,
  History,
  BarChart3,
  Info,
  HelpCircle,
  ShieldCheck,
  Sun,
  Moon,
  BookOpen,
  Menu,
  X,
  Glasses,
  Palette,
  Lock,
  LogOut,
  KeyRound,
  Bell,
  ChevronDown,
  Accessibility,
  Type,
  Check,
} from 'lucide-react';
import { AppTab, ThemeAccent, ReportNotification } from '../types';
import { CigapLogo } from './CigapLogo';
import { getThemeColors } from '../utils/themeColors';
import { NotificationCenterPopover } from './NotificationCenterPopover';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onLockAdmin?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTutorial: () => void;
  elderlyFriendlyMode: boolean;
  onToggleElderly: () => void;
  accent?: ThemeAccent;
  onOpenThemeModal?: () => void;
  notifications?: ReportNotification[];
  onMarkNotificationRead?: (notificationId: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onSelectReportById?: (reportId: string) => void;
}

type DesktopDropdown = 'bantuan' | 'accessibility' | null;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  onToggleAdmin,
  onLockAdmin,
  isDarkMode,
  onToggleDarkMode,
  onOpenTutorial,
  elderlyFriendlyMode,
  onToggleElderly,
  accent = 'blue',
  onOpenThemeModal,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectReportById,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DesktopDropdown>(null);
  const [mobileBantuanOpen, setMobileBantuanOpen] = useState(false);
  const [mobileAccessibilityOpen, setMobileAccessibilityOpen] = useState(false);

  const bantuanContainerRef = useRef<HTMLDivElement | null>(null);
  const bantuanTriggerRef = useRef<HTMLButtonElement | null>(null);
  const accessibilityContainerRef = useRef<HTMLDivElement | null>(null);
  const accessibilityTriggerRef = useRef<HTMLButtonElement | null>(null);

  const themeColors = getThemeColors(accent);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isBantuanActive = activeTab === 'tentang' || activeTab === 'faq';

  // Close desktop dropdowns on outside click or Escape key
  useEffect(() => {
    if (!openDropdown) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const clickedInsideBantuan = bantuanContainerRef.current?.contains(target);
      const clickedInsideAccessibility = accessibilityContainerRef.current?.contains(target);

      if (!clickedInsideBantuan && !clickedInsideAccessibility) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const current = openDropdown;
        setOpenDropdown(null);
        if (current === 'bantuan') {
          bantuanTriggerRef.current?.focus();
        } else if (current === 'accessibility') {
          accessibilityTriggerRef.current?.focus();
        }
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  // Keyboard arrow navigation helper for dropdown menus
  const handleDropdownKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    triggerRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemcheckbox"]')
    );
    if (items.length === 0) return;

    const activeIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      setOpenDropdown(null);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpenDropdown(null);
      triggerRef.current?.focus();
    }
  };

  const handleNavClick = (tab: AppTab) => {
    onTabChange(tab);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (name: Exclude<DesktopDropdown, null>) => {
    setNotifOpen(false);
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const darkModeTooltip = isDarkMode ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode';

  return (
    <header className="sticky top-0 z-40 w-full overflow-x-clip backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[72px] gap-2 sm:gap-3">
          {/* LEFT: Official CiGap Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center cursor-pointer group shrink-0 min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-150"
            id="nav-brand"
            title="Beranda LaporWarga CiGap (Ciputat Sigap)"
            aria-label="Beranda CiGap Ciputat Sigap"
          >
            <CigapLogo
              variant="horizontal"
              size="sm"
              showSubtitle={true}
              className="[&>div:first-child]:w-9 [&>div:first-child]:h-9 lg:[&>div:first-child]:w-10 lg:[&>div:first-child]:h-10"
            />
          </button>

          {/* CENTER (Desktop): 5 Main Navigation Items */}
          <nav
            aria-label="Navigasi Utama CiGap"
            className="hidden lg:flex items-center justify-center gap-1 min-w-0"
          >
            {/* 1. Beranda */}
            <button
              type="button"
              id="nav-link-dashboard"
              onClick={() => handleNavClick('dashboard')}
              className={`h-9 px-3 rounded-xl text-[13px] font-semibold transition-all duration-150 relative flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                activeTab === 'dashboard'
                  ? `${themeColors.textAccent} font-bold ${themeColors.subtleBg}`
                  : `text-slate-600 dark:text-slate-300 ${themeColors.hoverText} hover:bg-slate-100/90 dark:hover:bg-slate-800/80`
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Beranda</span>
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className={`absolute bottom-0 left-2.5 right-2.5 h-0.5 ${themeColors.indicatorBg} rounded-full`}
                />
              )}
            </button>

            {/* 2. Lapor Sekarang (Primary CTA) */}
            <motion.button
              type="button"
              id="nav-link-lapor"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick('lapor')}
              className={`mx-1 h-9 px-3.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5 ${themeColors.primaryBtn} transition-all duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900 ${
                activeTab === 'lapor' ? 'ring-2 ring-sky-400/70' : ''
              }`}
            >
              <PlusCircle size={16} />
              <span>Lapor Sekarang</span>
            </motion.button>

            {/* 3. Lacak Laporan */}
            <button
              type="button"
              id="nav-link-riwayat"
              onClick={() => handleNavClick('riwayat')}
              className={`h-9 px-3 rounded-xl text-[13px] font-semibold transition-all duration-150 relative flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                activeTab === 'riwayat'
                  ? `${themeColors.textAccent} font-bold ${themeColors.subtleBg}`
                  : `text-slate-600 dark:text-slate-300 ${themeColors.hoverText} hover:bg-slate-100/90 dark:hover:bg-slate-800/80`
              }`}
            >
              <History size={16} />
              <span>Lacak Laporan</span>
              {activeTab === 'riwayat' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className={`absolute bottom-0 left-2.5 right-2.5 h-0.5 ${themeColors.indicatorBg} rounded-full`}
                />
              )}
            </button>

            {/* 4. Statistik */}
            <button
              type="button"
              id="nav-link-statistik"
              onClick={() => handleNavClick('statistik')}
              className={`h-9 px-3 rounded-xl text-[13px] font-semibold transition-all duration-150 relative flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                activeTab === 'statistik'
                  ? `${themeColors.textAccent} font-bold ${themeColors.subtleBg}`
                  : `text-slate-600 dark:text-slate-300 ${themeColors.hoverText} hover:bg-slate-100/90 dark:hover:bg-slate-800/80`
              }`}
            >
              <BarChart3 size={16} />
              <span>Statistik</span>
              {activeTab === 'statistik' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className={`absolute bottom-0 left-2.5 right-2.5 h-0.5 ${themeColors.indicatorBg} rounded-full`}
                />
              )}
            </button>

            {/* 5. Bantuan Dropdown (Tentang CiGap, FAQ, Tutorial Penggunaan) */}
            <div ref={bantuanContainerRef} className="relative">
              <button
                ref={bantuanTriggerRef}
                type="button"
                id="nav-link-bantuan"
                aria-haspopup="menu"
                aria-expanded={openDropdown === 'bantuan'}
                aria-controls="nav-dropdown-bantuan"
                onClick={() => toggleDropdown('bantuan')}
                className={`h-9 px-3 rounded-xl text-[13px] font-semibold transition-all duration-150 relative flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isBantuanActive || openDropdown === 'bantuan'
                    ? `${themeColors.textAccent} font-bold ${themeColors.subtleBg}`
                    : `text-slate-600 dark:text-slate-300 ${themeColors.hoverText} hover:bg-slate-100/90 dark:hover:bg-slate-800/80`
                }`}
              >
                <HelpCircle size={16} />
                <span>Bantuan</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-150 ${
                    openDropdown === 'bantuan' ? 'rotate-180' : ''
                  }`}
                />
                {isBantuanActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className={`absolute bottom-0 left-2.5 right-2.5 h-0.5 ${themeColors.indicatorBg} rounded-full`}
                  />
                )}
              </button>

              <AnimatePresence>
                {openDropdown === 'bantuan' && (
                  <motion.div
                    id="nav-dropdown-bantuan"
                    role="menu"
                    aria-label="Menu Bantuan"
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    onKeyDown={(e) => handleDropdownKeyDown(e, bantuanTriggerRef)}
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-1.5 space-y-1 z-50"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      id="nav-link-tentang"
                      onClick={() => handleNavClick('tentang')}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        activeTab === 'tentang'
                          ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Info size={15} className={activeTab === 'tentang' ? themeColors.textAccent : 'text-slate-400'} />
                        <span className="truncate">Tentang CiGap</span>
                      </span>
                      {activeTab === 'tentang' && <Check size={14} className={themeColors.textAccent} />}
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      id="nav-link-faq"
                      onClick={() => handleNavClick('faq')}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        activeTab === 'faq'
                          ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <HelpCircle size={15} className={activeTab === 'faq' ? themeColors.textAccent : 'text-slate-400'} />
                        <span className="truncate">FAQ</span>
                      </span>
                      {activeTab === 'faq' && <Check size={14} className={themeColors.textAccent} />}
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      type="button"
                      role="menuitem"
                      id="btn-nav-tutorial"
                      onClick={() => {
                        setOpenDropdown(null);
                        onOpenTutorial();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <BookOpen size={15} className={themeColors.textAccent} />
                      <span>Tutorial Penggunaan</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* RIGHT: Utility Menu (Notifikasi, Aksesibilitas, Dark Mode) + Visual Divider + Akses Petugas + Mobile Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tablet & Mobile Prominent CTA: Lapor Sekarang */}
            <button
              type="button"
              id="nav-mobile-lapor-cta"
              onClick={() => handleNavClick('lapor')}
              className={`lg:hidden h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${themeColors.primaryBtn} transition-all duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500`}
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">Lapor Sekarang</span>
              <span className="sm:hidden">Lapor</span>
            </button>

            {/* 1. Notifikasi (Bell + unread badge + tooltip) */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  setNotifOpen((prev) => !prev);
                }}
                title={
                  unreadCount > 0
                    ? `Notifikasi (${unreadCount} belum dibaca)`
                    : 'Notifikasi Perkembangan Pengaduan'
                }
                id="btn-nav-notifications"
                aria-label="Notifikasi perkembangan pengaduan"
                aria-expanded={notifOpen}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  notifOpen
                    ? `${themeColors.subtleBg} ${themeColors.textAccent}`
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                <Bell size={16} className={unreadCount > 0 ? 'text-rose-500' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {!notifOpen && (
                <div
                  role="tooltip"
                  className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 hidden lg:block absolute top-full right-0 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg border border-slate-700/80 z-50"
                >
                  {unreadCount > 0 ? `Notifikasi (${unreadCount} belum dibaca)` : 'Notifikasi'}
                </div>
              )}
            </div>

            {/* 2. Aksesibilitas Dropdown (Desktop + tooltip) */}
            <div ref={accessibilityContainerRef} className="relative hidden lg:block group">
              <button
                ref={accessibilityTriggerRef}
                type="button"
                id="btn-nav-accessibility"
                aria-haspopup="menu"
                aria-expanded={openDropdown === 'accessibility'}
                aria-controls="nav-dropdown-accessibility"
                title="Aksesibilitas (Mode Lansia & Keterbacaan)"
                aria-label="Pengaturan Aksesibilitas"
                onClick={() => toggleDropdown('accessibility')}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  elderlyFriendlyMode
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700'
                    : openDropdown === 'accessibility'
                    ? `${themeColors.subtleBg} ${themeColors.textAccent}`
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                <Accessibility size={16} />
                {elderlyFriendlyMode && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
              {openDropdown !== 'accessibility' && (
                <div
                  role="tooltip"
                  className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute top-full right-0 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg border border-slate-700/80 z-50"
                >
                  Aksesibilitas{elderlyFriendlyMode ? ' (Mode Lansia Aktif)' : ''}
                </div>
              )}

              <AnimatePresence>
                {openDropdown === 'accessibility' && (
                  <motion.div
                    id="nav-dropdown-accessibility"
                    role="menu"
                    aria-label="Menu Aksesibilitas"
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    onKeyDown={(e) => handleDropdownKeyDown(e, accessibilityTriggerRef)}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-2 space-y-1.5 z-50"
                  >
                    <div className="px-2.5 pt-1 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Aksesibilitas
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Sesuaikan kenyamanan tampilan & keterbacaan
                      </div>
                    </div>

                    {/* Mode Lansia (Real working toggle) */}
                    <button
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={elderlyFriendlyMode}
                      id="btn-nav-elderly"
                      onClick={onToggleElderly}
                      className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        elderlyFriendlyMode
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            elderlyFriendlyMode
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Glasses size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Mode Lansia
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            Teks lebih besar & kontras tinggi
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          elderlyFriendlyMode
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {elderlyFriendlyMode ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </button>

                    {/* Text Size Information (No fake button: reflects real Mode Lansia text scaling behavior) */}
                    <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                      <Type size={15} className="text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          Ukuran Teks ({elderlyFriendlyMode ? 'Besar (+25%)' : 'Standar'})
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                          Ukuran teks otomatis membesar saat Mode Lansia aktif. Kontrol ukuran teks terpisah belum tersedia.
                        </p>
                      </div>
                    </div>

                    {/* Optional Theme Customizer if handler provided */}
                    {onOpenThemeModal && (
                      <button
                        type="button"
                        role="menuitem"
                        id="btn-nav-theme-customizer"
                        onClick={() => {
                          setOpenDropdown(null);
                          onOpenThemeModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        <Palette size={15} className={themeColors.textAccent} />
                        <span>Personalisasi Warna Tampilan</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Dark Mode Icon Toggle (Desktop + tooltip) */}
            <div className="relative hidden lg:block group">
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={darkModeTooltip}
                id="btn-nav-darkmode-toggle"
                aria-label={darkModeTooltip}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {isDarkMode ? (
                  <Sun size={16} className="text-amber-400" />
                ) : (
                  <Moon size={16} className="text-slate-600" />
                )}
              </button>
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute top-full right-0 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg border border-slate-700/80 z-50"
              >
                {darkModeTooltip}
              </div>
            </div>

            {/* Visual Divider separating public tools from officer access */}
            <div
              className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700/80 mx-1"
              aria-hidden="true"
            />

            {/* 4. Akses Petugas (Desktop Far Right) */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleAdmin}
                id="btn-nav-role-switcher"
                title={
                  isAdmin
                    ? 'Sesi Petugas Aktif. Klik untuk membuka Dasbor Verifikasi'
                    : 'Akses Khusus Petugas & Satgas Posko (Perlu PIN)'
                }
                className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isAdmin
                    ? activeTab === 'admin'
                      ? 'bg-purple-700 text-white border-purple-500 ring-2 ring-purple-400/50 shadow-sm'
                      : 'bg-purple-700 hover:bg-purple-800 text-white border-purple-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck size={15} className="text-yellow-300" />
                    <span>Petugas (Aktif)</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} className="text-slate-500 dark:text-slate-400" />
                    <span>Akses Petugas</span>
                  </>
                )}
              </button>

              {isAdmin && onLockAdmin && (
                <button
                  type="button"
                  onClick={onLockAdmin}
                  title="Kunci sesi petugas dan kembali ke Mode Warga"
                  aria-label="Kunci sesi petugas"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>

            {/* Mobile & Tablet Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => {
                setNotifOpen(false);
                setMobileMenuOpen((prev) => !prev);
              }}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              id="btn-mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tablet & Mobile Navigation Drawer (< lg) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            {/* Primary CTA */}
            <button
              type="button"
              onClick={() => handleNavClick('lapor')}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white ${themeColors.primaryBtn} mb-2 cursor-pointer`}
            >
              <PlusCircle size={17} />
              <span>Lapor Sekarang</span>
            </button>

            {/* Main Links */}
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                activeTab === 'dashboard'
                  ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={17} />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('riwayat')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                activeTab === 'riwayat'
                  ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History size={17} />
              <span>Lacak Laporan</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('statistik')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                activeTab === 'statistik'
                  ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 size={17} />
              <span>Statistik</span>
            </button>

            {/* Touch-friendly Bantuan Dropdown Accordion */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                aria-expanded={mobileBantuanOpen}
                onClick={() => setMobileBantuanOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                  isBantuanActive
                    ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={17} />
                  <span>Bantuan</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-150 ${mobileBantuanOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {mobileBantuanOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2 pb-2 pt-1 space-y-1 bg-slate-50/70 dark:bg-slate-800/40"
                  >
                    <button
                      type="button"
                      onClick={() => handleNavClick('tentang')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeTab === 'tentang'
                          ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Info size={15} />
                      <span>Tentang CiGap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('faq')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeTab === 'faq'
                          ? `${themeColors.subtleBg} ${themeColors.textAccent} font-bold`
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <HelpCircle size={15} />
                      <span>FAQ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenTutorial();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <BookOpen size={15} className={themeColors.textAccent} />
                      <span>Tutorial Penggunaan</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Utilities Section: Aksesibilitas, Dark Mode, & Akses Petugas */}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {/* Touch-friendly Aksesibilitas Accordion */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={mobileAccessibilityOpen}
                  onClick={() => setMobileAccessibilityOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                    elderlyFriendlyMode
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Accessibility size={17} />
                    <span>Aksesibilitas</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-150 ${
                      mobileAccessibilityOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {mobileAccessibilityOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-2.5 space-y-2 bg-slate-50/70 dark:bg-slate-800/40"
                    >
                      <button
                        type="button"
                        onClick={onToggleElderly}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          elderlyFriendlyMode
                            ? 'bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Glasses size={16} className={elderlyFriendlyMode ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'} />
                          <span>
                            <span className="block text-xs font-bold text-slate-900 dark:text-white">
                              Mode Lansia
                            </span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                              Teks lebih besar & kontras tinggi
                            </span>
                          </span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            elderlyFriendlyMode
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {elderlyFriendlyMode ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>

                      <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                        <Type size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Ukuran teks ({elderlyFriendlyMode ? 'Besar +25%' : 'Standar'}) mengikuti Mode Lansia.
                        </span>
                      </div>

                      {onOpenThemeModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenThemeModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Palette size={15} className={themeColors.textAccent} />
                          <span>Personalisasi Warna Tampilan</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle Row */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {isDarkMode ? (
                    <Sun size={16} className="text-amber-400" />
                  ) : (
                    <Moon size={16} className="text-slate-600" />
                  )}
                  <span>{darkModeTooltip}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Visual Divider & Akses Petugas */}
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAdmin
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isAdmin ? <ShieldCheck size={16} /> : <Lock size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {isAdmin ? 'Sesi Petugas Aktif' : 'Akses Petugas'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isAdmin ? 'Hak akses verifikasi aktif' : 'Khusus Satgas (Perlu PIN)'}
                    </div>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleNavClick('admin')}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                    >
                      Buka
                    </button>
                    {onLockAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onLockAdmin();
                          setMobileMenuOpen(false);
                        }}
                        className="px-2 py-1.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer"
                        title="Kunci sesi petugas"
                      >
                        <LogOut size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <KeyRound size={12} />
                    <span>Input PIN</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Center Popover */}
      <NotificationCenterPopover
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => onMarkNotificationRead?.(id)}
        onMarkAllAsRead={() => onMarkAllNotificationsRead?.()}
        onSelectReportById={(reportId) => onSelectReportById?.(reportId)}
      />
    </header>
  );
};
