import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ExternalLink,
  Hammer,
  Trash2,
  Lightbulb,
  Waves,
  Building2,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldAlert,
  Users,
  Clock,
  Camera,
  Bell,
  History,
  Filter,
  Loader2,
  AlertCircle,
  UserCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ReportItem, ReportNotification, ReportStatus } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../data/cigapConstants';
import { useUserLiveLocation } from '../hooks/useUserLiveLocation';
import { fetchReportDetailById } from '../utils/cigapApi';
import { getNotificationsForReport } from '../utils/reportHelpers';
import { ReportPhotoGallery } from './ReportPhotoGallery';
import { ReportEstimationCard } from './ReportEstimationCard';
import { ReportStatusTimeline, getStatusIcon } from './ReportStatusTimeline';

interface CiputatMapProps {
  reports: ReportItem[];
  notifications?: ReportNotification[];
  onSelectReport: (report: ReportItem) => void;
  elderlyMode?: boolean;
}

export const CiputatInteractiveMap: React.FC<CiputatMapProps> = ({
  reports,
  notifications = [],
  onSelectReport,
  elderlyMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string>('all');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [fetchedReportDetail, setFetchedReportDetail] = useState<ReportItem | null>(null);
  const [fetchedReportNotifications, setFetchedReportNotifications] = useState<ReportNotification[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [resolvedZoomUrl, setResolvedZoomUrl] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [openClusterId, setOpenClusterId] = useState<string | null>(null);

  const historySectionRef = useRef<HTMLDivElement | null>(null);
  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  const detailSectionTopRef = useRef<HTMLDivElement | null>(null);
  const liveLocation = useUserLiveLocation();

  // Filter reports by category (preserving legacy category support) AND status filter
  const filteredReports = reports.filter((r) => {
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (r.category === selectedCategory) {
      matchesCategory = true;
    } else if (
      selectedCategory === 'infrastruktur_fasilitas' &&
      (r.category === 'jalan_rusak' || r.category === 'lampu_mati' || r.category === 'fasilitas_rusak')
    ) {
      matchesCategory = true;
    } else if (
      selectedCategory === 'lingkungan' &&
      (r.category === 'sampah_menumpuk' || r.category === 'drainase_tersumbat')
    ) {
      matchesCategory = true;
    }

    if (!matchesCategory) return false;

    if (selectedStatusGroup === 'all') return true;
    const markerGroup = STATUS_LABELS[r.status]?.markerGroup;
    if (selectedStatusGroup === 'blue') return markerGroup === 'blue';
    if (selectedStatusGroup === 'purple') return markerGroup === 'purple';
    if (selectedStatusGroup === 'orange') return markerGroup === 'orange';
    if (selectedStatusGroup === 'green') return markerGroup === 'green';
    if (selectedStatusGroup === 'red') return markerGroup === 'red';
    return r.status === selectedStatusGroup;
  });

  // Load fresh report details from backend whenever a marker is clicked or reports list updates
  const loadMarkerDetail = async (reportId: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const data = await fetchReportDetailById(reportId);
      setFetchedReportDetail(data.report);
      setFetchedReportNotifications(data.notifications || []);
    } catch (err) {
      // Keep local fallback report data if available, while showing clear non-blocking error notice
      setDetailError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil pembaruan detail pengaduan dari server.'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (!activeReportId) {
      setFetchedReportDetail(null);
      setFetchedReportNotifications([]);
      setDetailError(null);
      return;
    }
    loadMarkerDetail(activeReportId);
  }, [activeReportId]);

  // Keep detail synced in real-time if reports prop updates from SSE/admin
  const liveReportFromProps = reports.find((r) => r.id === activeReportId) || null;
  const activeReport = liveReportFromProps || fetchedReportDetail;
  const activeReportNotifs = activeReport
    ? getNotificationsForReport(
        notifications.length > 0 ? notifications : fetchedReportNotifications,
        activeReport.id
      )
    : [];

  // Landmark reference points mapped onto a 600x400 SVG coordinate system for Ciputat
  const minLat = -6.335;
  const maxLat = -6.285;
  const minLng = 106.705;
  const maxLng = 106.765;

  const toMapCoords = (lat: number, lng: number) => {
    const x = 50 + ((lng - minLng) / (maxLng - minLng)) * 500;
    const y = 40 + ((maxLat - lat) / (maxLat - minLat)) * 320;
    return {
      x: Math.max(30, Math.min(570, x)),
      y: Math.max(30, Math.min(370, y)),
    };
  };

  // Consistent Marker Color Mapping:
  // Biru: Laporan Diterima
  // Ungu: Dalam Verifikasi / Peninjauan
  // Oranye: Dalam Tindak Lanjut / Penanganan
  // Hijau: Selesai
  // Merah: Ditolak / Perhatian Khusus
  const getMarkerColor = (status: ReportStatus) => {
    const group = STATUS_LABELS[status]?.markerGroup;
    switch (group) {
      case 'blue':
        return 'bg-blue-600 text-white ring-blue-300';
      case 'purple':
        return 'bg-purple-600 text-white ring-purple-300';
      case 'orange':
        return 'bg-amber-500 text-white ring-amber-300';
      case 'green':
        return 'bg-emerald-600 text-white ring-emerald-300';
      case 'red':
        return 'bg-rose-600 text-white ring-rose-300';
      default:
        return 'bg-blue-600 text-white ring-blue-300';
    }
  };

  const handleMarkerClick = (reportId: string) => {
    setOpenClusterId(null);
    setActiveReportId(reportId);
    setResolvedZoomUrl(null);
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (detailSectionTopRef.current) {
      const rect = detailSectionTopRef.current.getBoundingClientRect();
      if (rect.top < 72) {
        detailSectionTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Close cluster popover when filters change so stale clusters never remain
  useEffect(() => {
    setOpenClusterId(null);
  }, [selectedCategory, selectedStatusGroup]);

  const handleScrollToHistory = () => {
    historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const userSvgCoords =
    liveLocation.isGpsEnabled && liveLocation.userCoords
      ? toMapCoords(liveLocation.userCoords.lat, liveLocation.userCoords.lng)
      : null;

  const handleGpsToggle = () => {
    if (liveLocation.isLoading) return;
    if (liveLocation.isGpsEnabled && liveLocation.permissionState === 'granted') {
      liveLocation.disableLocation();
    } else {
      setIsBannerDismissed(false);
      liveLocation.requestLocation();
    }
  };

  const getGpsButtonMeta = () => {
    if (liveLocation.isLoading) {
      return {
        label: 'Mencari GPS...',
        title: 'Sedang mengambil koordinat lokasi perangkat Anda',
        dotClass: 'bg-sky-500 animate-pulse',
        btnClass:
          'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
      };
    }
    if (liveLocation.isGpsEnabled && liveLocation.permissionState === 'granted') {
      return {
        label: 'GPS Aktif',
        title: 'Izin lokasi aktif — Klik untuk menonaktifkan penggunaan lokasi',
        dotClass: 'bg-emerald-500',
        btnClass:
          'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700 hover:bg-sky-200/70 dark:hover:bg-sky-900',
      };
    }
    if (liveLocation.permissionState === 'denied') {
      return {
        label: 'Izin GPS Ditolak',
        title: 'Izin lokasi ditolak browser — Klik untuk meminta izin kembali',
        dotClass: 'bg-rose-500',
        btnClass:
          'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100',
      };
    }
    if (liveLocation.permissionState === 'unsupported') {
      return {
        label: 'GPS N/A',
        title: 'Perangkat atau browser tidak mendukung geolokasi GPS',
        dotClass: 'bg-slate-400',
        btnClass:
          'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      };
    }
    if (liveLocation.permissionState === 'granted') {
      return {
        label: 'Aktifkan GPS',
        title: 'Izin lokasi tersedia (sedang nonaktif) — Klik untuk mengaktifkan lokasi Anda',
        dotClass: 'bg-slate-400',
        btnClass:
          'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700',
      };
    }
    return {
      label: 'Aktifkan GPS',
      title: 'Izin lokasi belum diberikan — Klik untuk mengaktifkan GPS',
      dotClass: 'bg-amber-500',
      btnClass:
        'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700',
    };
  };

  // Group closely located markers into clusters without shifting original report coordinates
  const buildMarkerClusters = (items: ReportItem[], radiusSvg: number) => {
    interface MarkerCluster {
      id: string;
      x: number;
      y: number;
      reports: ReportItem[];
    }

    const clusters: MarkerCluster[] = [];

    items.forEach((report) => {
      const coords = toMapCoords(report.coordinates.lat, report.coordinates.lng);
      let matchedCluster: MarkerCluster | null = null;
      let minDistance = Infinity;

      for (const cluster of clusters) {
        const dx = cluster.x - coords.x;
        const dy = cluster.y - coords.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= radiusSvg && dist < minDistance) {
          minDistance = dist;
          matchedCluster = cluster;
        }
      }

      if (matchedCluster) {
        const count = matchedCluster.reports.length;
        matchedCluster.x = (matchedCluster.x * count + coords.x) / (count + 1);
        matchedCluster.y = (matchedCluster.y * count + coords.y) / (count + 1);
        matchedCluster.reports.push(report);
      } else {
        clusters.push({
          id: `cluster-${report.id}`,
          x: coords.x,
          y: coords.y,
          reports: [report],
        });
      }
    });

    return clusters;
  };

  // Shared vector map + interactive markers stage (keeps coordinates & click targets 100% synced at any size)
  const renderInteractiveMapStage = (sizeVariant: 'inline' | 'split' | 'expanded') => {
    const clusterRadius = sizeVariant === 'expanded' ? 22 : sizeVariant === 'split' ? 36 : 30;
    const clusters = buildMarkerClusters(filteredReports, clusterRadius);

    return (
      <div
        onClick={() => setOpenClusterId(null)}
        className={
          sizeVariant === 'expanded'
            ? 'relative w-full max-w-[900px] aspect-[3/2] mx-auto select-none'
            : sizeVariant === 'split'
            ? 'relative w-full aspect-[3/2] mx-auto select-none'
            : 'relative w-full max-w-[390px] sm:max-w-[465px] md:max-w-[525px] aspect-[3/2] mx-auto select-none'
        }
      >
        <svg
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.04))' }}
        >
          <defs>
            <pattern id={`grid-${sizeVariant}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-300/25 dark:text-slate-800/35"
              />
            </pattern>
            <radialGradient id={`waterGrad-${sizeVariant}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          <rect width="600" height="400" fill={`url(#grid-${sizeVariant})`} />

          {/* District boundary polygon outline of Ciputat area (light blue geographic fill) */}
          <path
            d="M 60 120 Q 180 40 320 60 T 540 100 T 560 280 T 420 370 T 140 360 T 50 240 Z"
            fill="currentColor"
            className="text-sky-400/10 dark:text-sky-400/10 stroke-sky-600/45 dark:stroke-sky-400/35"
            strokeWidth="2.2"
            strokeDasharray="5 4"
          />

          {/* Primary Arterial Road: Jl. Ir. H. Juanda */}
          <path
            d="M 380 20 L 370 120 L 330 230 L 300 390"
            fill="none"
            stroke="currentColor"
            strokeWidth="13"
            strokeLinecap="round"
            className="text-amber-500/22 dark:text-amber-400/20"
          />
          <path
            d="M 380 20 L 370 120 L 330 230 L 300 390"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-amber-600/75 dark:text-amber-400/65"
            strokeDasharray="6 4"
          />

          {/* Flyover Ciputat & Jl. Dewi Sartika */}
          <path
            d="M 160 210 L 330 230 L 480 260"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            className="text-slate-400/50 dark:text-slate-600/60"
          />
          <path
            d="M 160 210 L 330 230 L 480 260"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-500/55 dark:text-slate-400/45"
            strokeDasharray="4 4"
          />
          <rect x="279" y="216" width="102" height="19" rx="4" fill="#334155" opacity="0.92" />
          <text x="330" y="229" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            FLYOVER CIPUTAT
          </text>

          {/* Danau Situ Gintung Water Body */}
          <ellipse cx="440" cy="140" rx="45" ry="32" fill={`url(#waterGrad-${sizeVariant})`} />
          <text
            x="440"
            y="143"
            fill="#0369a1"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            className="dark:fill-cyan-200"
          >
            Situ Gintung
          </text>

          {/* Stasiun Kereta Sudimara Area */}
          <rect x="70" y="88" width="56" height="20" rx="4" fill="#475569" opacity="0.72" />
          <text x="98" y="101" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
            KA SUDIMARA
          </text>

          {/* Area Kelurahan Labels (enlarged with crisp halo for instant readability) */}
          <text
            x="306"
            y="268"
            fill="currentColor"
            fontSize="13"
            fontWeight="700"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-slate-700 dark:text-slate-200 stroke-white/85 dark:stroke-slate-950/85"
          >
            Kel. Ciputat
          </text>
          <text
            x="426"
            y="194"
            fill="currentColor"
            fontSize="13"
            fontWeight="700"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-slate-700 dark:text-slate-200 stroke-white/85 dark:stroke-slate-950/85"
          >
            Kel. Cipayung
          </text>
          <text
            x="198"
            y="324"
            fill="currentColor"
            fontSize="13"
            fontWeight="700"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-slate-700 dark:text-slate-200 stroke-white/85 dark:stroke-slate-950/85"
          >
            Kel. Serua Indah
          </text>
          <text
            x="120"
            y="178"
            fill="currentColor"
            fontSize="13"
            fontWeight="700"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-slate-700 dark:text-slate-200 stroke-white/85 dark:stroke-slate-950/85"
          >
            Kel. Jombang
          </text>
        </svg>

        {/* OVERLAY: LIVE USER LOCATION PIN (Real-time GPS, shown only when GPS enabled & detected) */}
        {userSvgCoords && (
          <div
            className="absolute z-25 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${(userSvgCoords.x / 600) * 100}%`,
              top: `${(userSvgCoords.y / 400) * 100}%`,
            }}
          >
            <span className="absolute -inset-3.5 rounded-full bg-sky-400/40 animate-ping" />
            <span className="absolute -inset-1.5 rounded-full bg-sky-500/50 animate-pulse" />

            <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-sky-500 border-2 border-white shadow-2xl flex items-center justify-center text-white ring-4 ring-sky-400/30">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-sky-900/90 text-white text-[9px] sm:text-[10px] font-bold border border-sky-400/70 shadow-lg flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Lokasi Anda</span>
            </div>
          </div>
        )}

        {/* Interactive Clustered & Single Overlay Markers for Reports */}
        {clusters.map((cluster) => {
          const isCluster = cluster.reports.length > 1;
          const isClusterOpen = openClusterId === cluster.id;
          const activeMember = cluster.reports.find((r) => r.id === activeReportId) || null;

          if (isCluster) {
            const hasInProgress = cluster.reports.some(
              (r) => STATUS_LABELS[r.status]?.markerGroup === 'orange'
            );
            const hasReceived = cluster.reports.some(
              (r) => STATUS_LABELS[r.status]?.markerGroup === 'blue'
            );
            const clusterColor = hasInProgress
              ? 'bg-amber-500 text-white ring-amber-300'
              : hasReceived
              ? 'bg-blue-600 text-white ring-blue-300'
              : 'bg-sky-700 text-white ring-sky-300';

            const alignRight = cluster.x > 360;
            const alignTop = cluster.y > 220;

            return (
              <div
                key={cluster.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group ${
                  isClusterOpen ? 'z-50' : activeMember ? 'z-30 hover:z-40' : 'z-20 hover:z-40'
                }`}
                style={{ left: `${(cluster.x / 600) * 100}%`, top: `${(cluster.y / 400) * 100}%` }}
                onClick={(e) => e.stopPropagation()}
              >
                {activeMember && (
                  <>
                    <span className="absolute -inset-2.5 rounded-full bg-sky-400/45 animate-ping pointer-events-none" />
                    <span className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-sky-300 shadow-lg pointer-events-none" />
                  </>
                )}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.15 }}
                  onClick={() =>
                    setOpenClusterId((prev) => (prev === cluster.id ? null : cluster.id))
                  }
                  aria-label={`Cluster ${cluster.reports.length} laporan pengaduan berdekatan`}
                  aria-expanded={isClusterOpen}
                  className={`${
                    sizeVariant === 'split' ? 'w-8 h-8 text-xs' : 'w-8 h-8 sm:w-9 sm:h-9 text-xs'
                  } rounded-full flex items-center justify-center font-black shadow-lg ring-2 cursor-pointer transition-all duration-150 ${clusterColor} ${
                    activeMember || isClusterOpen
                      ? 'scale-115 ring-4 ring-white dark:ring-slate-900 border-2 border-white'
                      : ''
                  }`}
                >
                  <span>{cluster.reports.length}</span>
                </motion.button>

                {activeMember && !isClusterOpen && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold shadow border border-sky-400 pointer-events-none">
                    #{activeMember.id}
                  </div>
                )}

                {/* Hover tooltip when cluster selector is closed */}
                {!isClusterOpen && (
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] rounded-xl p-2 shadow-xl z-40 transition-opacity duration-150 whitespace-normal text-center border border-slate-700">
                    <div className="font-bold text-sky-400">
                      {cluster.reports.length} Pengaduan Berdekatan
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      Klik cluster untuk memilih salah satu titik laporan
                    </div>
                  </div>
                )}

                {/* Interactive Cluster Selector Popover */}
                <AnimatePresence>
                  {isClusterOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute ${alignTop ? 'bottom-10' : 'top-10'} ${
                        alignRight ? 'right-0' : 'left-0'
                      } w-64 max-w-[82vw] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-left`}
                    >
                      <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                          {cluster.reports.length} Laporan di Titik Ini
                        </span>
                        <button
                          type="button"
                          onClick={() => setOpenClusterId(null)}
                          className="p-0.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          aria-label="Tutup daftar cluster"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {cluster.reports.map((rep) => {
                          const repSelected = activeReportId === rep.id;
                          return (
                            <button
                              key={rep.id}
                              type="button"
                              onClick={() => handleMarkerClick(rep.id)}
                              className={`w-full text-left px-2 py-1.5 rounded-xl transition-colors duration-150 flex items-start gap-2 cursor-pointer ${
                                repSelected
                                  ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getMarkerColor(
                                  rep.status
                                )}`}
                              >
                                <MapPin size={10} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-black text-sky-600 dark:text-sky-400">
                                    #{rep.id}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                    {STATUS_LABELS[rep.status]?.shortLabel || rep.status}
                                  </span>
                                </span>
                                <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                  {rep.title}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const report = cluster.reports[0];
          const coords = toMapCoords(report.coordinates.lat, report.coordinates.lng);
          const isSelected = activeReportId === report.id;
          const statusGroup = STATUS_LABELS[report.status]?.markerGroup;

          return (
            <div
              key={report.id}
              role="button"
              tabIndex={0}
              aria-label={`Lihat detail laporan ${report.id}: ${report.title}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
                isSelected ? 'z-30 hover:z-40' : 'z-20 hover:z-40 focus-within:z-40'
              }`}
              style={{ left: `${(coords.x / 600) * 100}%`, top: `${(coords.y / 400) * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(report.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMarkerClick(report.id);
                }
              }}
            >
              {/* Selected highlight halo */}
              {isSelected && (
                <>
                  <span className="absolute -inset-2.5 rounded-full bg-sky-400/45 animate-ping pointer-events-none" />
                  <span className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-sky-300 shadow-lg pointer-events-none" />
                </>
              )}

              {/* Active pulse for urgent or in-progress */}
              {!isSelected && report.urgency === 'darurat' && report.status !== 'selesai' && (
                <span className="absolute -inset-1.5 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
              )}
              {!isSelected && statusGroup === 'orange' && (
                <span className="absolute -inset-1.5 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
              )}

              <motion.div
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.15 }}
                className={`${
                  sizeVariant === 'split' ? 'w-7 h-7' : 'w-7 h-7 sm:w-8 sm:h-8'
                } rounded-full flex items-center justify-center font-bold text-xs shadow-lg ring-2 transition-transform duration-150 ${getMarkerColor(
                  report.status
                )} ${
                  isSelected
                    ? 'scale-120 ring-4 ring-white dark:ring-slate-900 shadow-2xl border-2 border-white'
                    : ''
                }`}
              >
                {report.category === 'infrastruktur_fasilitas' && <Building2 size={13} />}
                {report.category === 'lingkungan' && <Trash2 size={13} />}
                {report.category === 'pelayanan_publik' && <Users size={13} />}
                {report.category === 'ketertiban_keamanan' && <ShieldAlert size={13} />}
                {report.category === 'jalan_rusak' && <Hammer size={13} />}
                {report.category === 'lampu_mati' && <Lightbulb size={13} />}
                {report.category === 'sampah_menumpuk' && <Trash2 size={13} />}
                {report.category === 'drainase_tersumbat' && <Waves size={13} />}
                {report.category === 'fasilitas_rusak' && <Building2 size={13} />}
              </motion.div>

              {/* Selected ticket badge */}
              {isSelected && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold shadow border border-sky-400 pointer-events-none">
                  #{report.id}
                </div>
              )}

              {/* Tooltip on hover */}
              {!isSelected && (
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 w-44 bg-slate-900 text-white text-[11px] rounded-xl p-2 shadow-xl z-40 transition-opacity duration-150 whitespace-normal text-center border border-slate-700">
                  <div className="font-bold text-sky-400 font-mono">#{report.id}</div>
                  <div className="truncate font-semibold">{report.title}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    {STATUS_LABELS[report.status]?.label || report.status}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailPanelContent = (isMobileSheet = false) => {
    if (!activeReport && isLoadingDetail) {
      return (
        <div className="px-6 sm:px-7 py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 size={28} className="animate-spin text-sky-600" />
          <p className="text-xs font-semibold">Memuat detail pengaduan & bukti foto...</p>
        </div>
      );
    }

    if (!activeReport) return null;

    const statusInfo = STATUS_LABELS[activeReport.status];
    const categoryInfo = CATEGORY_LABELS[activeReport.category];
    const doneStep = [...(activeReport.timeline || [])]
      .reverse()
      .find((s) => s.status === 'selesai');
    const showResolutionSection =
      activeReport.status === 'selesai' || Boolean(activeReport.resolvedPhotoUrl);

    return (
      <div
        ref={detailSectionTopRef}
        className={`flex flex-col ${isMobileSheet ? 'h-full min-h-0' : ''}`}
      >
        {/* A. HEADER PENGADUAN (Sticky on top so header & close/nav actions stay reachable) */}
        <div
          className={`px-6 sm:px-7 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-start justify-between gap-4 shrink-0 ${
            isMobileSheet ? 'z-20' : 'md:sticky md:top-16 sm:md:top-20 z-20'
          }`}
        >
          <div className="space-y-1.5 min-w-0 max-w-[680px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                #{activeReport.id}
              </span>
              <span
                className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${statusInfo?.badgeClass || ''}`}
              >
                {getStatusIcon(activeReport.status, 11)}
                <span>{statusInfo?.label || activeReport.status}</span>
              </span>
              {isLoadingDetail && (
                <span title="Menyinkronkan data terbaru..." className="inline-flex items-center">
                  <Loader2 size={13} className="animate-spin text-sky-500" />
                </span>
              )}
            </div>
            <h4
              className={`${
                elderlyMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              } font-black text-slate-900 dark:text-white leading-snug`}
            >
              {activeReport.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectReport(activeReport)}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Detail Lengkap</span>
              <ExternalLink size={12} />
            </button>
            <button
              type="button"
              onClick={() => setActiveReportId(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Tutup panel detail"
              aria-label="Tutup panel detail"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* BODY KONTEN (Satu area scroll utama: sheet scroll di mobile, page scroll di desktop) */}
        <div
          ref={isMobileSheet ? detailScrollRef : undefined}
          className={`px-6 sm:px-7 py-6 space-y-6 ${
            isMobileSheet ? 'flex-1 overflow-y-auto' : ''
          }`}
        >
          <div className="max-w-[700px] space-y-6">
            {detailError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{detailError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => loadMarkerDetail(activeReport.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* B. INFORMASI LAPORAN */}
            <section className="space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Informasi Laporan
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    categoryInfo?.color || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {categoryInfo?.label || activeReport.category}
                </span>
                {activeReport.subtype && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {activeReport.subtype}
                  </span>
                )}
              </div>

              <p
                className={`${
                  elderlyMode ? 'text-base leading-8' : 'text-sm leading-7'
                } text-slate-700 dark:text-slate-300 max-w-[66ch]`}
              >
                {activeReport.description}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs sm:text-[13px]">
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                  <MapPin size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>{activeReport.locationName}</strong> • Kel. {activeReport.kelurahan}, Kec. Ciputat
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs">
                  <Clock size={14} className="shrink-0" />
                  <span>Tanggal pelaporan: {activeReport.createdAt}</span>
                </div>
              </div>
            </section>

            {/* C. BUKTI FOTO PELAPOR */}
            <section className="space-y-3 pt-5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Camera size={13} />
                <span>Bukti Foto Pelapor</span>
              </div>
              <ReportPhotoGallery report={activeReport} compact />
            </section>

            {/* D. STATUS PENANGANAN */}
            <section
              ref={historySectionRef}
              className="scroll-mt-36 space-y-4 pt-5 border-t border-slate-200/80 dark:border-slate-800"
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <History size={13} />
                <span>Status Penanganan & Riwayat</span>
              </div>

              {/* Ringkasan Status Terkini, Dinas, Petugas & Catatan Petugas */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Dinas Penanggung Jawab
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {activeReport.assignedDepartment || 'Posko Terpadu CIGAP Kecamatan Ciputat'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border inline-flex items-center gap-1 shrink-0 ${statusInfo?.badgeClass || ''}`}
                  >
                    {getStatusIcon(activeReport.status, 11)}
                    <span>{statusInfo?.label || activeReport.status}</span>
                  </span>
                </div>

                {activeReport.officerName && (
                  <div className="flex items-center gap-2 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 text-xs">
                    <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">Petugas:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {activeReport.officerName}
                    </span>
                  </div>
                )}

                {activeReport.adminNotes && (
                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white">Catatan Petugas: </span>
                    {activeReport.adminNotes}
                  </div>
                )}
              </div>

              <ReportStatusTimeline report={activeReport} compact />
            </section>

            {/* E. ESTIMASI PENYELESAIAN (atau PENYELESAIAN AKTUAL jika Selesai) */}
            <section className="space-y-3 pt-5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {activeReport.status === 'selesai'
                  ? 'Penyelesaian Aktual'
                  : 'Estimasi Penyelesaian'}
              </div>
              <ReportEstimationCard report={activeReport} showAgencyBox={false} />
            </section>

            {/* F. BUKTI PENYELESAIAN (jika Selesai atau memiliki foto hasil penanganan) */}
            {showResolutionSection && (
              <section className="space-y-3 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Bukti Penyelesaian</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/70 space-y-3">
                  {activeReport.resolvedPhotoUrl ? (
                    <div className="w-full max-w-[660px] space-y-2">
                      <div className="relative rounded-2xl overflow-hidden border border-emerald-200/90 dark:border-emerald-800/80 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center p-3 min-h-[200px] max-h-[340px]">
                        <img
                          src={activeReport.resolvedPhotoUrl}
                          alt={`Bukti penyelesaian laporan #${activeReport.id}`}
                          onClick={() => setResolvedZoomUrl(activeReport.resolvedPhotoUrl || null)}
                          className="max-w-full max-h-[300px] w-auto h-auto object-contain rounded-xl shadow-xs cursor-zoom-in"
                        />
                        <button
                          type="button"
                          onClick={() => setResolvedZoomUrl(activeReport.resolvedPhotoUrl || null)}
                          className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/92 hover:bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Maximize2 size={12} className="text-emerald-600" />
                          <span>Perbesar</span>
                        </button>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                        Dokumentasi kondisi sesudah penanganan oleh petugas.
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      Penanganan telah dinyatakan selesai oleh petugas. Belum ada foto hasil penanganan yang dilampirkan.
                    </div>
                  )}

                  {(doneStep?.description || activeReport.adminNotes) && (
                    <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-800/70 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">
                        Catatan Hasil Penyelesaian:{' '}
                      </span>
                      {doneStep?.description || activeReport.adminNotes}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Riwayat Notifikasi In-App terkait laporan ini */}
            <section className="space-y-2.5 pt-5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bell size={12} className="text-sky-500" />
                <span>Riwayat Notifikasi Laporan ({activeReportNotifs.length})</span>
              </div>

              {activeReportNotifs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Belum ada log notifikasi tambahan untuk laporan ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeReportNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-0.5 ${
                        !n.isRead
                          ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Sticky Footer Action Buttons */}
        <div
          className={`px-6 sm:px-7 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/95 flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isMobileSheet ? 'sticky bottom-0 z-20' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleScrollToHistory}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History size={13} />
              <span>Lihat Riwayat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveReportId(null)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSelectReport(activeReport)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Lihat Detail Lengkap</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-clip">
      {/* Compact Map Header Controls */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-t-3xl border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2 bg-slate-50/60 dark:bg-slate-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
              <Compass size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap leading-tight">
                <span>Peta Digital Titik Pengaduan Ciputat (Real-Time)</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {filteredReports.length} Titik Terpantau
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Klik marker pengaduan untuk melihat foto bukti lapangan, status penanganan, dan estimasi penyelesaian
              </p>
            </div>
          </div>

          {/* Action Controls: Live GPS toggle button, Status filter & Perbesar Peta */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* GPS Live Locator Toggle Button (separated from banner) */}
            {(() => {
              const gpsMeta = getGpsButtonMeta();
              return (
                <button
                  type="button"
                  id="btn-map-gps-toggle"
                  onClick={handleGpsToggle}
                  disabled={liveLocation.isLoading || liveLocation.permissionState === 'unsupported'}
                  aria-pressed={liveLocation.isGpsEnabled && liveLocation.permissionState === 'granted'}
                  className={`h-8 px-2.5 rounded-xl text-[11px] font-bold transition-all duration-150 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${gpsMeta.btnClass}`}
                  title={gpsMeta.title}
                >
                  {liveLocation.isLoading ? (
                    <RefreshCw size={12} className="animate-spin text-sky-600 dark:text-sky-400" />
                  ) : (
                    <Navigation size={12} className="text-sky-600 dark:text-sky-400" />
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gpsMeta.dotClass}`} />
                  <span>{gpsMeta.label}</span>
                </button>
              );
            })()}

            {/* Status Filter Dropdown */}
            <div className="h-8 flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5">
              <Filter size={12} className="text-slate-400 shrink-0" />
              <select
                value={selectedStatusGroup}
                onChange={(e) => setSelectedStatusGroup(e.target.value)}
                aria-label="Filter status pengaduan pada peta"
                className="text-[11px] font-semibold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="blue">Biru: Laporan Diterima</option>
                <option value="purple">Ungu: Verifikasi / Peninjauan</option>
                <option value="orange">Oranye: Tindak Lanjut / Penanganan</option>
                <option value="green">Hijau: Selesai</option>
                <option value="red">Merah: Ditolak</option>
              </select>
            </div>

            {/* Perbesar Peta Button */}
            <button
              type="button"
              id="btn-expand-map"
              onClick={() => setIsMapExpanded(true)}
              className="h-8 px-2.5 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Buka peta dalam tampilan lebih besar"
            >
              <Maximize2 size={12} />
              <span>Perbesar Peta</span>
            </button>
          </div>
        </div>

        {/* Category Pills Filter (Height 32px / h-8, clean spacing) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`h-8 px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Semua ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('infrastruktur_fasilitas')}
            className={`h-8 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center ${
              selectedCategory === 'infrastruktur_fasilitas'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Infrastruktur & Fasilitas
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('lingkungan')}
            className={`h-8 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center ${
              selectedCategory === 'lingkungan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Lingkungan
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('pelayanan_publik')}
            className={`h-8 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center ${
              selectedCategory === 'pelayanan_publik'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Pelayanan Publik
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('ketertiban_keamanan')}
            className={`h-8 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center ${
              selectedCategory === 'ketertiban_keamanan'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Ketertiban & Keamanan
          </button>
        </div>
      </div>

      {/* COMPACT GPS LOCATION BANNER (only real detected location or honest unavailable state, no fictive locations) */}
      <AnimatePresence>
        {!isBannerDismissed && (
          <div>
            {liveLocation.isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 min-h-[32px] py-1 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-[11px] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <RefreshCw size={13} className="text-sky-600 dark:text-sky-400 shrink-0 animate-spin" />
                  <span className="truncate">
                    <strong>Mengambil Lokasi GPS:</strong> Menunggu koordinat akurat dari perangkat Anda...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBannerDismissed(true)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                  title="Tutup banner"
                  aria-label="Tutup banner lokasi"
                >
                  <X size={13} />
                </button>
              </motion.div>
            )}

            {!liveLocation.isLoading &&
              liveLocation.isGpsEnabled &&
              liveLocation.permissionState === 'granted' &&
              liveLocation.userCoords && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 min-h-[32px] py-1 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">
                      <strong>Lokasi Terdeteksi:</strong>{' '}
                      {liveLocation.isInCiputat && liveLocation.detectedKelurahan ? (
                        <>
                          Sekitar <strong>Kel. {liveLocation.detectedKelurahan}</strong> (
                          {liveLocation.userCoords.lat.toFixed(4)},{' '}
                          {liveLocation.userCoords.lng.toFixed(4)})
                        </>
                      ) : (
                        <>
                          Koordinat {liveLocation.userCoords.lat.toFixed(4)},{' '}
                          {liveLocation.userCoords.lng.toFixed(4)} (di luar batas Ciputat)
                        </>
                      )}
                      {liveLocation.accuracy ? ` • Akurasi: ±${liveLocation.accuracy}m` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBannerDismissed(true)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                    title="Tutup banner"
                    aria-label="Tutup banner lokasi"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              )}

            {!liveLocation.isLoading &&
              liveLocation.permissionState === 'granted' &&
              !liveLocation.isGpsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 min-h-[32px] py-1 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <Navigation size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate">
                      <strong>Lokasi Belum Ditampilkan:</strong> Pelacakan GPS sedang dinonaktifkan oleh Anda.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBannerDismissed(true)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                    title="Tutup banner"
                    aria-label="Tutup banner lokasi"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              )}

            {!liveLocation.isLoading && liveLocation.permissionState === 'prompt' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 min-h-[32px] py-1 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <Navigation size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">
                    <strong>Lokasi Belum Tersedia:</strong> Izin lokasi belum diberikan. Aktifkan GPS melalui tombol di atas untuk menampilkan posisi Anda.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBannerDismissed(true)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                  title="Tutup banner"
                  aria-label="Tutup banner lokasi"
                >
                  <X size={13} />
                </button>
              </motion.div>
            )}

            {!liveLocation.isLoading &&
              (liveLocation.permissionState === 'denied' ||
                liveLocation.permissionState === 'unsupported') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 min-h-[32px] py-1 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-[11px] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <AlertTriangle size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="truncate">
                      <strong>Lokasi Belum Tersedia:</strong>{' '}
                      {liveLocation.errorMessage ||
                        'Akses lokasi GPS tidak diizinkan atau tidak tersedia. Anda tetap dapat melihat seluruh titik aduan di peta.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBannerDismissed(true)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                    title="Tutup banner"
                    aria-label="Tutup banner lokasi"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              )}
          </div>
        )}
      </AnimatePresence>

      {/* Main Map (30%) + Desktop Side Detail (70%) Split Area */}
      <div className="flex flex-col md:flex-row md:items-start relative">
        {/* Left Column: Compact SVG GIS Simulation Canvas (+ Docked Legend when detail is open) */}
        <div
          className={
            activeReportId
              ? 'w-full md:w-[34%] lg:w-[30%] md:min-w-[320px] xl:min-w-[350px] shrink-0 md:sticky md:top-20 bg-slate-50/60 dark:bg-slate-950/70 md:border-r border-slate-200 dark:border-slate-800 flex flex-col'
              : 'w-full flex flex-col'
          }
        >
          <div
            className={`relative w-full bg-slate-100/80 dark:bg-slate-950 overflow-hidden flex items-center justify-center ${
              activeReportId
                ? 'h-[260px] sm:h-[300px] md:h-auto md:p-2'
                : 'h-[250px] sm:h-[310px] md:h-[350px]'
            }`}
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          >
            {renderInteractiveMapStage(activeReportId ? 'split' : 'inline')}

            {/* Floating Legend Overlay at Top Right (visible on desktop full-width where margin keeps markers clear) */}
            {!activeReportId && (
              <div className="absolute top-2.5 right-2.5 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md rounded-2xl p-2 shadow-md border border-slate-200 dark:border-slate-800 text-[10px] space-y-0.5 hidden lg:block z-10">
                <div className="font-bold text-slate-700 dark:text-slate-200 pb-0.5 border-b border-slate-200/70 dark:border-slate-700/70">
                  Legenda Status:
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-sky-300 shrink-0" />
                  <span>Posisi Anda (GPS)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Laporan Diterima</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                  <span>Verifikasi / Peninjauan</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>Tindak Lanjut / Penanganan</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Selesai</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>Ditolak / Perhatian Khusus</span>
                </div>
              </div>
            )}

            {/* Empty hint & quick expand shortcut on compact full-width map */}
            {!activeReportId && filteredReports.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 absolute bottom-2.5 left-3 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-[11px] font-semibold text-slate-600 dark:text-slate-300 pointer-events-none z-10">
                <span>Klik titik marker untuk melihat detail & foto bukti</span>
              </div>
            )}
          </div>

          {/* Docked Status Legend & Quick Expand under the 30% map on desktop when detail panel is open */}
          {activeReportId && (
            <div className="hidden md:block p-3.5 space-y-2.5 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                <span>Legenda Status Peta</span>
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                  {filteredReports.length} Titik Aktif
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-sky-300 shrink-0" />
                  <span>Posisi Anda (GPS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Laporan Diterima</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                  <span>Verifikasi / Peninjauan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Tindak Lanjut / Penanganan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Selesai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>Ditolak / Perhatian Khusus</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug pt-1 border-t border-slate-200/70 dark:border-slate-800">
                Pilih marker lain pada peta untuk mengganti detail pengaduan.
              </p>
            </div>
          )}
        </div>

        {/* DESKTOP SIDE DETAIL PANEL (~70% width, uses single page scrollbar cleanly) */}
        <AnimatePresence>
          {activeReportId && (
            <motion.aside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex md:flex-1 md:min-w-0 bg-white dark:bg-slate-900 flex-col rounded-br-3xl"
            >
              {renderDetailPanelContent(false)}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* COMPACT LEGEND BAR (< lg when full-width, or < md when detail sheet is open) */}
      <div
        className={`${
          activeReportId ? 'md:hidden' : 'lg:hidden'
        } px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600 dark:text-slate-300`}
      >
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500 ring-1 ring-sky-300" /> Posisi Anda (GPS)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" /> Laporan Diterima
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-600" /> Verifikasi / Peninjauan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Tindak Lanjut / Penanganan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600" /> Selesai
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-600" /> Ditolak / Perhatian Khusus
        </span>
      </div>

      {/* MOBILE BOTTOM SHEET DETAIL PANEL (< md) */}
      <AnimatePresence>
        {activeReportId && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReportId(null)}
              className="absolute inset-0 bg-black/55 backdrop-blur-xs"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {renderDetailPanelContent(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox for Resolution Proof Photo (Section F) */}
      {resolvedZoomUrl && (
        <div
          className="fixed inset-0 z-[85] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setResolvedZoomUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-emerald-600 text-white">
                  Bukti Penyelesaian #{activeReport?.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setResolvedZoomUrl(null)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
                aria-label="Tutup tampilan penuh"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={resolvedZoomUrl}
              alt="Bukti Penyelesaian Petugas"
              className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl border border-white/15"
            />
          </div>
        </div>
      )}

      {/* EXPANDED FULL MAP MODAL ("Perbesar Peta") — Preserves filters, GPS, and selected marker */}
      <AnimatePresence>
        {isMapExpanded && (
          <div
            className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setIsMapExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Expanded Map Top Controls */}
              <div className="px-4 py-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col gap-2.5 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                        <span>Peta Digital Ciputat — Tampilan Lengkap</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {filteredReports.length} Titik Terpantau
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const gpsMeta = getGpsButtonMeta();
                      return (
                        <button
                          type="button"
                          onClick={handleGpsToggle}
                          disabled={liveLocation.isLoading || liveLocation.permissionState === 'unsupported'}
                          aria-pressed={liveLocation.isGpsEnabled && liveLocation.permissionState === 'granted'}
                          title={gpsMeta.title}
                          className={`h-8 px-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-70 transition-colors ${gpsMeta.btnClass}`}
                        >
                          {liveLocation.isLoading ? (
                            <RefreshCw size={12} className="animate-spin text-sky-600" />
                          ) : (
                            <Navigation size={12} className="text-sky-600 dark:text-sky-400" />
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gpsMeta.dotClass}`} />
                          <span>{gpsMeta.label}</span>
                        </button>
                      );
                    })()}

                    <select
                      value={selectedStatusGroup}
                      onChange={(e) => setSelectedStatusGroup(e.target.value)}
                      aria-label="Filter status pada peta lengkap"
                      className="h-8 px-2.5 rounded-xl text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="all">Semua Status</option>
                      <option value="blue">Biru: Laporan Diterima</option>
                      <option value="purple">Ungu: Verifikasi / Peninjauan</option>
                      <option value="orange">Oranye: Tindak Lanjut / Penanganan</option>
                      <option value="green">Hijau: Selesai</option>
                      <option value="red">Merah: Ditolak</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsMapExpanded(false)}
                      className="h-8 px-3 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Minimize2 size={12} />
                      <span>Kembali ke Halaman</span>
                    </button>
                  </div>
                </div>

                {/* Shared Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    { id: 'all', label: `Semua (${reports.length})`, activeClass: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
                    { id: 'infrastruktur_fasilitas', label: 'Infrastruktur & Fasilitas', activeClass: 'bg-amber-600 text-white' },
                    { id: 'lingkungan', label: 'Lingkungan', activeClass: 'bg-emerald-600 text-white' },
                    { id: 'pelayanan_publik', label: 'Pelayanan Publik', activeClass: 'bg-blue-600 text-white' },
                    { id: 'ketertiban_keamanan', label: 'Ketertiban & Keamanan', activeClass: 'bg-rose-600 text-white' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`h-8 px-3 rounded-xl text-[11px] font-bold transition-colors shrink-0 cursor-pointer flex items-center ${
                        selectedCategory === cat.id
                          ? cat.activeClass
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expanded Map Viewport */}
              <div
                className="relative flex-1 min-h-[340px] bg-slate-100/80 dark:bg-slate-950 overflow-auto flex items-center justify-center p-3 sm:p-6"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              >
                {renderInteractiveMapStage('expanded')}

                {/* Floating Legend */}
                <div className="absolute top-3 right-3 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 hidden md:block z-10">
                  <div className="font-bold text-slate-700 dark:text-slate-200 pb-0.5 border-b border-slate-200/70 dark:border-slate-700/70">
                    Legenda Status:
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-300 shrink-0" />
                    <span>Posisi Anda (GPS)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span>Laporan Diterima</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span>Verifikasi / Peninjauan</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Tindak Lanjut / Penanganan</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Selesai</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                    <span>Ditolak / Perhatian Khusus</span>
                  </div>
                </div>
              </div>

              {/* Selected Marker Quick Preview Strip inside Expanded Map */}
              {activeReport && (
                <div className="px-4 py-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                        #{activeReport.id}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${STATUS_LABELS[activeReport.status]?.badgeClass || ''}`}>
                        {STATUS_LABELS[activeReport.status]?.label || activeReport.status}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {activeReport.locationName}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeReport.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMapExpanded(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 cursor-pointer"
                    >
                      Buka Panel Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMapExpanded(false);
                        onSelectReport(activeReport);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-700 to-sky-600 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Lihat Detail Lengkap</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
