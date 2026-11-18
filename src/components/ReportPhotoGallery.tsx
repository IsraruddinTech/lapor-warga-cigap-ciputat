import React, { useState, useEffect } from 'react';
import {
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertCircle,
  X,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { ReportItem, ReportPhoto } from '../types';
import { getReportPhotos } from '../utils/reportHelpers';

interface ReportPhotoGalleryProps {
  report: ReportItem;
  compact?: boolean;
}

export const ReportPhotoGallery: React.FC<ReportPhotoGalleryProps> = ({
  report,
  compact = false,
}) => {
  const photos: ReportPhoto[] = getReportPhotos(report);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});

  useEffect(() => {
    setActiveIndex(0);
    setFailedIds({});
    setIsLightboxOpen(false);
  }, [report.id]);

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
          <CameraOff size={20} />
        </div>
        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Pelapor tidak melampirkan foto
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Laporan #{report.id} dikirim tanpa lampiran gambar kondisi lapangan.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, photos.length - 1);
  const currentPhoto = photos[safeIndex];
  const isCurrentFailed = Boolean(failedIds[currentPhoto.id]);

  const handleRetryPhoto = (photoId: string) => {
    setFailedIds((prev) => ({ ...prev, [photoId]: false }));
    setReloadKeys((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 }));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="w-full max-w-[660px] space-y-2.5">
      {/* Main Image / Carousel Frame (Soft neutral background, natural aspect ratio, max ~660x340) */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 group ${
          compact
            ? 'min-h-[210px] sm:min-h-[240px] max-h-[320px] sm:max-h-[340px]'
            : 'min-h-[230px] sm:min-h-[260px] max-h-[340px] sm:max-h-[360px]'
        } flex items-center justify-center p-3 sm:p-4`}
      >
        {isCurrentFailed ? (
          <div className="p-4 text-center space-y-2 text-slate-600 dark:text-slate-300">
            <AlertCircle size={24} className="mx-auto text-rose-500" />
            <div className="text-xs font-bold text-slate-800 dark:text-white">
              Gagal memuat foto bukti pelapor
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              File foto untuk laporan #{report.id} tidak dapat ditampilkan saat ini.
            </p>
            <button
              type="button"
              onClick={() => handleRetryPhoto(currentPhoto.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Muat Ulang Foto</span>
            </button>
          </div>
        ) : (
          <img
            key={`${currentPhoto.id}-${reloadKeys[currentPhoto.id] || 0}`}
            src={currentPhoto.url}
            alt={currentPhoto.caption || `Foto bukti laporan #${report.id}`}
            onClick={() => setIsLightboxOpen(true)}
            onError={() =>
              setFailedIds((prev) => ({ ...prev, [currentPhoto.id]: true }))
            }
            className="max-w-full max-h-[280px] sm:max-h-[316px] w-auto h-auto object-contain rounded-xl shadow-xs cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
          />
        )}

        {/* Top Badges: Photo order "Foto X dari Y" + Zoom Button */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/92 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur-sm flex items-center gap-1.5 border border-slate-200/90 dark:border-slate-700 shadow-xs">
            <ImageIcon size={12} className="text-sky-600 dark:text-sky-400" />
            <span>
              Foto {safeIndex + 1} dari {photos.length}
            </span>
          </span>

          {!isCurrentFailed && (
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="pointer-events-auto px-2.5 py-1 rounded-lg bg-white/92 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-100 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Perbesar foto bukti"
            >
              <Maximize2 size={12} className="text-sky-600 dark:text-sky-400" />
              <span>Perbesar</span>
            </button>
          )}
        </div>

        {/* Carousel Prev / Next Controls */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-800 dark:text-white backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-md transition-all cursor-pointer"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-800 dark:text-white backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-md transition-all cursor-pointer"
              aria-label="Foto berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Caption & Upload Timestamp */}
      {(currentPhoto.caption || currentPhoto.uploadedAt) && (
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-start justify-between gap-3">
          <span className="leading-relaxed">
            {currentPhoto.caption || 'Foto bukti kondisi lapangan'}
          </span>
          {currentPhoto.uploadedAt && (
            <span className="text-[11px] text-slate-400 shrink-0 font-mono">
              {currentPhoto.uploadedAt}
            </span>
          )}
        </div>
      )}

      {/* Thumbnail Strip when multiple photos exist */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pt-0.5 pb-1">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${
                idx === safeIndex
                  ? 'border-sky-500 ring-2 ring-sky-400/35'
                  : 'border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
              }`}
              title={`Lihat Foto ${idx + 1} dari ${photos.length}`}
            >
              {failedIds[photo.id] ? (
                <div className="w-full h-full flex items-center justify-center text-rose-400">
                  <AlertCircle size={14} />
                </div>
              ) : (
                <img
                  src={photo.url}
                  alt={photo.caption || `Foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={() =>
                    setFailedIds((prev) => ({ ...prev, [photo.id]: true }))
                  }
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between gap-3 text-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-sky-600 text-white">
                    #{report.id}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Foto {safeIndex + 1} dari {photos.length}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                  {report.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tutup tampilan penuh"
              >
                <X size={20} />
              </button>
            </div>

            {/* Full Image */}
            <div className="relative w-full flex items-center justify-center bg-slate-900/90 rounded-2xl border border-white/15 overflow-hidden max-h-[72vh] p-2">
              {isCurrentFailed ? (
                <div className="p-10 text-center space-y-2 text-white">
                  <AlertCircle size={32} className="mx-auto text-rose-400" />
                  <p className="text-sm font-bold">Gagal memuat foto bukti pelapor</p>
                </div>
              ) : (
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || report.title}
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
                  onError={() =>
                    setFailedIds((prev) => ({ ...prev, [currentPhoto.id]: true }))
                  }
                />
              )}

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/25 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/25 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Caption */}
            {currentPhoto.caption && (
              <div className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs sm:text-sm text-center max-w-2xl">
                {currentPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
