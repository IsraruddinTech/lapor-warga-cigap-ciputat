import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AppTab, 
  ReportItem, 
  ReportCategory, 
  ReportStatus, 
  WeatherInfo, 
  KelurahanCiputat, 
  AppThemeSettings,
  UserFeedback,
  ReportNotification
} from './types';
import { INITIAL_REPORTS, INITIAL_NOTIFICATIONS, INITIAL_WEATHER_INFO } from './data/cigapConstants';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CreateReportModal } from './components/CreateReportModal';
import { ReportTrackingView } from './components/ReportTrackingView';
import { AdminVerificationDashboard, AdminStatusUpdateExtras } from './components/AdminVerificationDashboard';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { StatisticsView } from './components/StatisticsView';
import { AboutCigapView } from './components/AboutCigapView';
import { FaqView } from './components/FaqView';
import { QuickTutorialModal } from './components/QuickTutorialModal';
import { CustomerServiceWidget } from './components/CustomerServiceWidget';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CigapLogo } from './components/CigapLogo';
import { CrudToast, ToastMessage } from './components/CrudToast';
import { getThemeColors } from './utils/themeColors';
import {
  CreateReportPayload,
  fetchAllReportsAndNotifications,
  fetchAdminSession,
  logoutAdminOnServer,
  clearAdminCsrfToken,
  isAdminAuthError,
  createReportOnServer,
  updateReportOnServer,
  updateReportStatusOnServer,
  deleteReportOnServer,
  upvoteReportOnServer,
  submitFeedbackOnServer,
  resetReportsOnServer,
  markNotificationReadOnServer,
  markAllNotificationsReadOnServer,
} from './utils/cigapApi';
import { Lock, KeyRound } from 'lucide-react';

const CITIZEN_READ_NOTIFS_KEY = 'cigap_read_notif_ids';

function upsertReportById(list: ReportItem[], incoming: ReportItem): ReportItem[] {
  const exists = list.some((r) => r.id === incoming.id);
  return exists
    ? list.map((r) => (r.id === incoming.id ? incoming : r))
    : [incoming, ...list];
}

export default function App() {
  // Admin Session State (Diverifikasi melalui HttpOnly Cookie di server, bukan sessionStorage)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [citizenReadNotifIds, setCitizenReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CITIZEN_READ_NOTIFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((id) => typeof id === 'string');
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  // Main Data States synced with Express backend + localStorage cache
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('cigap_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: ReportItem) => Boolean(r?.id) && !r.id.startsWith('TMP-'));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_REPORTS;
  });

  const [notifications, setNotifications] = useState<ReportNotification[]>(() => {
    try {
      const saved = localStorage.getItem('cigap_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [weather] = useState<WeatherInfo>(INITIAL_WEATHER_INFO);
  const [selectedKelurahan, setSelectedKelurahan] = useState<KelurahanCiputat>('Ciputat');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const [selectedReportIdForTracking, setSelectedReportIdForTracking] = useState<string | null>(null);
  const [crudToast, setCrudToast] = useState<ToastMessage | null>(null);

  // Theme & Accessibility Settings
  const [themeSettings, setThemeSettings] = useState<AppThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('cigap_theme');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      darkMode: false,
      accent: 'blue',
      elderlyFriendlyMode: false,
      soundEnabled: true,
    };
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialCategoryForReport, setInitialCategoryForReport] = useState<ReportCategory | undefined>(undefined);
  const [initialSubtypeForReport, setInitialSubtypeForReport] = useState<string | undefined>(undefined);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isCSOpen, setIsCSOpen] = useState(false);

  // Check if first-time visitor to offer tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('cigap_tutorial_seen');
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
      localStorage.setItem('cigap_tutorial_seen', 'true');
    }
  }, []);

  // Sync dark mode class to HTML tag
  useEffect(() => {
    if (themeSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cigap_theme', JSON.stringify(themeSettings));
  }, [themeSettings]);

  // Sync initial admin session & data from backend server + subscribe to SSE live events
  useEffect(() => {
    let active = true;

    // Bersihkan sisa key sessionStorage lama jika ada
    try {
      sessionStorage.removeItem('cigap_admin_session');
      sessionStorage.removeItem('cigap_admin_key');
    } catch {
      // ignore storage access errors
    }

    (async () => {
      try {
        const session = await fetchAdminSession();
        if (!active) return;
        setIsAdmin(Boolean(session.authenticated));
      } catch {
        if (!active) return;
        setIsAdmin(false);
      }

      try {
        const data = await fetchAllReportsAndNotifications();
        if (!active) return;
        if (Array.isArray(data.reports) && data.reports.length > 0) {
          setReports(data.reports);
        }
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch {
        // Keep cached/initial data if backend unavailable
      }
    })();

    let eventSource: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      eventSource = new EventSource('/api/events');

      const handleReportCreated = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload.report?.id && !String(payload.report.id).startsWith('TMP-')) {
            setReports((prev) => upsertReportById(prev, payload.report));
          }
          if (payload.notification) {
            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === payload.notification.id);
              return exists ? prev : [payload.notification, ...prev];
            });
          }
        } catch {
          // ignore malformed SSE
        }
      };

      const handleReportUpdated = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload.report) {
            setReports((prev) =>
              prev.map((r) => (r.id === payload.report.id ? payload.report : r))
            );
          }
          if (Array.isArray(payload.notifications)) {
            setNotifications(payload.notifications);
          }
        } catch {
          // ignore malformed SSE
        }
      };

      const handleReportDeleted = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload.reportId) {
            setReports((prev) => prev.filter((r) => r.id !== payload.reportId));
            setNotifications((prev) => prev.filter((n) => n.reportId !== payload.reportId));
          }
        } catch {
          // ignore
        }
      };

      const handleReportsReset = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data);
          if (Array.isArray(payload.reports)) setReports(payload.reports);
          if (Array.isArray(payload.notifications)) setNotifications(payload.notifications);
        } catch {
          // ignore
        }
      };

      const handleNotifsUpdated = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data);
          if (Array.isArray(payload.notifications)) setNotifications(payload.notifications);
        } catch {
          // ignore
        }
      };

      eventSource.addEventListener('report_created', handleReportCreated);
      eventSource.addEventListener('report_updated', handleReportUpdated);
      eventSource.addEventListener('report_deleted', handleReportDeleted);
      eventSource.addEventListener('reports_reset', handleReportsReset);
      eventSource.addEventListener('notifications_updated', handleNotifsUpdated);
    }

    return () => {
      active = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Persist reports & notifications locally as offline cache (never save temporary IDs)
  useEffect(() => {
    try {
      const officialReports = reports.filter(
        (r) => Boolean(r?.id) && !r.id.startsWith('TMP-')
      );
      localStorage.setItem('cigap_reports', JSON.stringify(officialReports));
    } catch {
      // ignore storage quota errors
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('cigap_notifications', JSON.stringify(notifications));
    } catch {
      // ignore storage quota errors
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(CITIZEN_READ_NOTIFS_KEY, JSON.stringify(citizenReadNotifIds));
    } catch {
      // ignore storage quota errors
    }
  }, [citizenReadNotifIds]);

  const effectiveNotifications = React.useMemo(
    () =>
      notifications.map((n) =>
        n.isRead || citizenReadNotifIds.includes(n.id) ? { ...n, isRead: true } : n
      ),
    [notifications, citizenReadNotifIds]
  );

  const handleAdminAuthFailure = (reason?: string) => {
    clearAdminCsrfToken();
    setIsAdmin(false);
    setIsPasscodeModalOpen(true);
    fetchAllReportsAndNotifications()
      .then((data) => {
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      })
      .catch(() => {
        // ignore transient refresh failure
      });
    setCrudToast({
      id: 'toast-' + Date.now(),
      type: 'info',
      title: 'Autentikasi Petugas Diperlukan',
      message:
        reason ||
        'Sesi petugas tidak valid atau telah berakhir. Silakan masukkan PIN petugas kembali.',
    });
  };

  // Handlers
  const handleOpenCreateReport = (category?: ReportCategory, subtype?: string) => {
    setInitialCategoryForReport(category);
    setInitialSubtypeForReport(subtype);
    setIsCreateModalOpen(true);
  };

  const handleSubmitNewReport = async (
    newReportPayload: CreateReportPayload
  ): Promise<ReportItem> => {
    const saved = await createReportOnServer(newReportPayload);

    setReports((prev) => upsertReportById(prev, saved.report));
    if (saved.notification) {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === saved.notification.id);
        return exists ? prev : [saved.notification, ...prev];
      });
    }

    setSelectedReportIdForTracking(saved.report.id);
    setActiveTab('riwayat');
    setCrudToast({
      id: 'toast-' + Date.now(),
      type: 'create',
      title: 'Laporan Baru Diterbitkan',
      message: `Aduan #${saved.report.id} "${saved.report.title}" berhasil diterima oleh sistem CIGAP.`,
      reportId: saved.report.id,
    });

    return saved.report;
  };

  const handleUpdateReport = async (updatedReport: ReportItem) => {
    try {
      const saved = await updateReportOnServer(updatedReport);
      setReports((prev) => prev.map((r) => (r.id === saved.report.id ? saved.report : r)));
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'update',
        title: 'Laporan Diperbarui',
        message: `Informasi aduan #${saved.report.id} "${saved.report.title}" berhasil diperbarui.`,
        reportId: saved.report.id,
      });
    } catch (err) {
      if (isAdminAuthError(err)) {
        handleAdminAuthFailure(err instanceof Error ? err.message : undefined);
        return;
      }
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'info',
        title: 'Gagal Memperbarui Laporan',
        message:
          err instanceof Error
            ? err.message
            : 'Perubahan tidak dapat disimpan oleh server.',
        reportId: updatedReport.id,
      });
    }
  };

  const handleDeleteReport = async (reportId: string, reason?: string) => {
    try {
      await deleteReportOnServer(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setNotifications((prev) => prev.filter((n) => n.reportId !== reportId));
      if (selectedReportIdForTracking === reportId) {
        setSelectedReportIdForTracking(null);
      }
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'delete',
        title: 'Laporan Dihapus',
        message: `Laporan #${reportId} telah dihapus dari sistem.${reason ? ` Alasan: ${reason}` : ''}`,
        reportId: reportId,
      });
    } catch (err) {
      if (isAdminAuthError(err)) {
        handleAdminAuthFailure(err instanceof Error ? err.message : undefined);
        return;
      }
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'info',
        title: 'Gagal Menghapus Laporan',
        message:
          err instanceof Error
            ? err.message
            : 'Penghapusan laporan ditolak oleh server.',
        reportId,
      });
    }
  };

  const handleResetReports = async () => {
    try {
      const data = await resetReportsOnServer();
      setReports(data.reports);
      setNotifications(data.notifications);
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'reset',
        title: 'Data Direset',
        message: 'Seluruh laporan pengaduan warga telah dikembalikan ke sampel standar Ciputat.',
      });
    } catch (err) {
      if (isAdminAuthError(err)) {
        handleAdminAuthFailure(err instanceof Error ? err.message : undefined);
        return;
      }
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'info',
        title: 'Reset Data Ditolak',
        message:
          err instanceof Error
            ? err.message
            : 'Gagal mereset data laporan pada server.',
      });
    }
  };

  const handleSelectReport = (report: ReportItem) => {
    setSelectedReportIdForTracking(report.id);
    setActiveTab('riwayat');
  };

  const handleSelectReportById = (reportId: string) => {
    setSelectedReportIdForTracking(reportId);
    setActiveTab('riwayat');
  };

  const handleUpvoteReport = async (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    try {
      await upvoteReportOnServer(reportId);
    } catch {
      // ignore
    }
  };

  const handleSubmitFeedback = async (reportId: string, feedback: UserFeedback) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, feedback } : r))
    );
    try {
      await submitFeedbackOnServer(reportId, feedback);
    } catch {
      // ignore
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    setCitizenReadNotifIds((prev) =>
      prev.includes(notificationId) ? prev : [...prev, notificationId]
    );
    if (!isAdmin) return;
    try {
      const res = await markNotificationReadOnServer(notificationId);
      setNotifications(res.notifications);
    } catch (err) {
      if (isAdminAuthError(err)) {
        handleAdminAuthFailure(err instanceof Error ? err.message : undefined);
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const allIds = notifications.map((n) => n.id);
    setCitizenReadNotifIds((prev) => Array.from(new Set([...prev, ...allIds])));
    if (!isAdmin) return;
    try {
      const res = await markAllNotificationsReadOnServer();
      setNotifications(res.notifications);
    } catch (err) {
      if (isAdminAuthError(err)) {
        handleAdminAuthFailure(err instanceof Error ? err.message : undefined);
      }
    }
  };

  const handleAdminUpdateStatus = async (
    reportId: string,
    newStatus: ReportStatus,
    adminNote: string,
    assignedDept?: string,
    resolvedPhotoUrl?: string,
    extras?: AdminStatusUpdateExtras
  ) => {
    try {
      const res = await updateReportStatusOnServer(reportId, {
        status: newStatus,
        adminNote,
        assignedDepartment: assignedDept,
        officerName: extras?.officerName,
        resolvedPhotoUrl,
        estimatedCompletionDate: extras?.estimatedCompletionDate,
        isDelayed: extras?.isDelayed,
        delayReason: extras?.delayReason,
        rejectionReason: extras?.rejectionReason,
        urgency: extras?.urgency,
        priorityReason: extras?.priorityReason,
      });
      setReports((prev) => prev.map((r) => (r.id === res.report.id ? res.report : r)));
      if (Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'update',
        title: 'Status & Progres Diperbarui',
        message: `Laporan #${reportId} diperbarui dan notifikasi in-app telah diterbitkan.`,
        reportId,
      });
    } catch (err) {
      if (isAdminAuthError(err)) {
        handleAdminAuthFailure(err instanceof Error ? err.message : undefined);
        return;
      }
      setCrudToast({
        id: 'toast-' + Date.now(),
        type: 'info',
        title: 'Gagal Memperbarui Status',
        message:
          err instanceof Error
            ? err.message
            : 'Pembaruan status tidak dapat disimpan oleh server.',
        reportId,
      });
    }
  };

  // Handler Keamanan Akses Petugas (Passcode Gate)
  const handleRequestAdmin = () => {
    if (isAdmin) {
      setActiveTab('admin');
    } else {
      setIsPasscodeModalOpen(true);
    }
  };

  const handlePasscodeSuccess = () => {
    setIsAdmin(true);
    setActiveTab('admin');
    fetchAllReportsAndNotifications()
      .then((data) => {
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      })
      .catch(() => {
        // ignore transient refresh failure
      });
    setCrudToast({
      id: 'toast-' + Date.now(),
      type: 'update',
      title: 'Akses Petugas Diberikan',
      message: 'Sesi terverifikasi. Selamat datang di Dasbor Verifikasi Satgas Posko CIGAP.',
    });
  };

  const handleLockAdmin = async () => {
    try {
      await logoutAdminOnServer();
    } catch {
      // tetap kunci sesi lokal bila server logout gagal sementara
    }
    clearAdminCsrfToken();
    setIsAdmin(false);
    if (activeTab === 'admin') {
      setActiveTab('dashboard');
    }
    fetchAllReportsAndNotifications()
      .then((data) => {
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      })
      .catch(() => {
        // ignore transient refresh failure
      });
    setCrudToast({
      id: 'toast-' + Date.now(),
      type: 'reset',
      title: 'Sesi Petugas Dikunci',
      message: 'Sesi petugas telah diakhiri dan sistem dikembalikan ke Mode Warga umum.',
    });
  };

  const handleTabChange = (tab: AppTab) => {
    if (tab === 'admin' && !isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    if (tab === 'lapor') {
      setIsCreateModalOpen(true);
    }
    setActiveTab(tab);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      themeSettings.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } ${themeSettings.elderlyFriendlyMode ? 'text-lg leading-relaxed' : 'text-sm sm:text-base'}`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        onToggleAdmin={handleRequestAdmin}
        onLockAdmin={handleLockAdmin}
        isDarkMode={themeSettings.darkMode}
        onToggleDarkMode={() =>
          setThemeSettings((prev) => ({
            ...prev,
            darkMode: !prev.darkMode,
          }))
        }
        onOpenTutorial={() => setIsTutorialOpen(true)}
        elderlyFriendlyMode={themeSettings.elderlyFriendlyMode}
        onToggleElderly={() =>
          setThemeSettings((prev) => ({
            ...prev,
            elderlyFriendlyMode: !prev.elderlyFriendlyMode,
          }))
        }
        notifications={effectiveNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onSelectReportById={handleSelectReportById}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <DashboardView
                reports={reports}
                notifications={effectiveNotifications}
                selectedKelurahan={selectedKelurahan}
                onSelectKelurahan={setSelectedKelurahan}
                onOpenCreateReport={handleOpenCreateReport}
                onSelectReport={handleSelectReport}
                onViewAllReports={() => setActiveTab('riwayat')}
                elderlyMode={themeSettings.elderlyFriendlyMode}
                accent={themeSettings.accent}
              />
            </motion.div>
          )}

          {activeTab === 'lapor' && (
            <motion.div
              key="lapor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {/* If user clicks navbar Lapor, open modal and show tracking or dashboard */}
              <div className="text-center py-12 space-y-4">
                <h2 className="text-2xl font-bold">Formulir Pelaporan Warga Sedang Dibuka</h2>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className={`px-6 py-3 rounded-2xl ${getThemeColors(themeSettings.accent).primaryBtn} text-white font-bold shadow-md`}
                >
                  Buka Formulir Lapor Sekarang
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'riwayat' && (
            <motion.div
              key="riwayat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <ReportTrackingView
                reports={reports}
                notifications={effectiveNotifications}
                onUpvoteReport={handleUpvoteReport}
                onSubmitFeedback={handleSubmitFeedback}
                onOpenCreateReport={() => handleOpenCreateReport()}
                selectedReportId={selectedReportIdForTracking}
                elderlyMode={themeSettings.elderlyFriendlyMode}
                accent={themeSettings.accent}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {isAdmin ? (
                <AdminVerificationDashboard
                  reports={reports}
                  onUpdateStatus={handleAdminUpdateStatus}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onResetReports={handleResetReports}
                  onLockAdmin={handleLockAdmin}
                  onAuthError={handleAdminAuthFailure}
                  elderlyMode={themeSettings.elderlyFriendlyMode}
                  accent={themeSettings.accent}
                />
              ) : (
                <div className="max-w-lg mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                    <Lock size={32} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      Akses Khusus Petugas Posko CIGAP
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Halaman verifikasi, disposisi dinas, dan pengelolaan laporan warga dilindungi oleh Sistem PIN Petugas (Passcode Gate). Warga umum diarahkan ke portal pengaduan publik.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Kembali ke Beranda Warga
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPasscodeModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all min-h-[44px]"
                    >
                      <KeyRound size={15} />
                      <span>Masukkan PIN Petugas</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'statistik' && (
            <motion.div
              key="statistik"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <StatisticsView
                reports={reports}
                elderlyMode={themeSettings.elderlyFriendlyMode}
                accent={themeSettings.accent}
              />
            </motion.div>
          )}

          {activeTab === 'tentang' && (
            <motion.div
              key="tentang"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <AboutCigapView 
                elderlyMode={themeSettings.elderlyFriendlyMode} 
                accent={themeSettings.accent}
              />
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <FaqView
                onOpenCS={() => setIsCSOpen(true)}
                elderlyMode={themeSettings.elderlyFriendlyMode}
                accent={themeSettings.accent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center">
            <CigapLogo variant="horizontal" size="md" showSubtitle={true} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 text-[#0F4C81] dark:bg-sky-950 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
              Kecamatan Ciputat • Pemerintah Kota Tangerang Selatan
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Sistem pengaduan keluhan masyarakat cepat tanggap untuk perbaikan jalan rusak, lampu penerangan jalan umum, sampah lingkungan, saluran drainase, dan fasilitas umum.
          </p>
          <div className="text-[11px] text-slate-400">
            © 2026 Pemerintah Kota Tangerang Selatan • Bebas Akses untuk Seluruh Warga
          </div>
        </div>
      </footer>

      {/* Modals & Floating Widgets */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setInitialCategoryForReport(undefined);
          setInitialSubtypeForReport(undefined);
        }}
        onSubmitReport={handleSubmitNewReport}
        initialCategory={initialCategoryForReport}
        initialSubtype={initialSubtypeForReport}
        elderlyMode={themeSettings.elderlyFriendlyMode}
        existingReports={reports}
        accent={themeSettings.accent}
      />

      <QuickTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        elderlyMode={themeSettings.elderlyFriendlyMode}
      />

      <CustomerServiceWidget
        isOpen={isCSOpen}
        onClose={() => setIsCSOpen(false)}
        onOpenReport={() => {
          setIsCSOpen(false);
          setIsCreateModalOpen(true);
        }}
        elderlyMode={themeSettings.elderlyFriendlyMode}
        accent={themeSettings.accent}
      />

      {/* Passcode Gate Modal for Admin Access */}
      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={handlePasscodeSuccess}
        accent={themeSettings.accent}
        elderlyMode={themeSettings.elderlyFriendlyMode}
      />

      {/* Floating Action Button for Min Ci Mascot CS */}
      {!isCSOpen && (
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCSOpen(true)}
          className={`fixed bottom-20 right-3 sm:bottom-5 sm:right-5 z-30 pl-2 pr-3.5 sm:pr-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${getThemeColors(themeSettings.accent).navBg} text-white shadow-2xl flex items-center gap-2 sm:gap-2.5 font-extrabold text-xs sm:text-sm border-2 border-white/30 backdrop-blur-md`}
          id="btn-floating-cs"
          title="Tanya Min Ci (Maskot Siaga CIGAP)"
        >
          <div className="relative">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white p-0.5 shrink-0 flex items-center justify-center">
              <img
                src="/min_ci_knight_mascot.jpg"
                alt="Min Ci - Maskot CIGAP"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/min_ci_mascot.jpg';
                }}
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-amber-400 border border-blue-950"></span>
            </span>
          </div>
          <div className="text-left leading-tight">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-300">Maskot CIGAP</div>
            <div className="text-xs sm:text-sm font-black text-white">Tanya Min Ci</div>
          </div>
        </motion.button>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent on screens < md) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          handleTabChange(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateReport={() => handleOpenCreateReport()}
        onOpenCS={() => setIsCSOpen(true)}
        accent={themeSettings.accent}
      />

      {/* Real-time CRUD Feedback Notification Toast */}
      <CrudToast toast={crudToast} onClose={() => setCrudToast(null)} />
    </div>
  );
}
