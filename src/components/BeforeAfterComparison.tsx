import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Columns, 
  Maximize2, 
  X,
  ArrowLeftRight
} from 'lucide-react';
import { ThemeAccent, ReportCategory } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface BeforeAfterComparisonProps {
  beforeUrl: string;
  afterUrl?: string;
  category: ReportCategory;
  title: string;
  accent?: ThemeAccent;
  elderlyMode?: boolean;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeUrl,
  afterUrl,
  category,
  title,
  accent = 'blue',
  elderlyMode = false,
}) => {
  const themeColors = getThemeColors(accent);
  const [viewMode, setViewMode] = useState<'side' | 'slider'>('side');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<'before' | 'after'>('before');

  if (!afterUrl) {
    // If only before photo exists
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-500" />
            Dokumentasi Bukti Lapangan
          </span>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
          <img
            src={beforeUrl}
            alt="Foto Kondisi Awal Masalah"
            className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            referrerPolicy="no-referrer"
            onClick={() => {
              setZoomTarget('before');
              setIsZoomOpen(true);
            }}
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-black uppercase bg-rose-600/90 text-white backdrop-blur-md shadow-md">
            Kondisi Awal (Aduan Warga)
          </div>
          <button
            type="button"
            onClick={() => {
              setZoomTarget('before');
              setIsZoomOpen(true);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            title="Perbesar Foto"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Both Before & After photos are available!
  return (
    <div className="space-y-3">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            Bukti Komparasi: Sebelum & Sesudah
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('side')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'side'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Columns size={13} />
            <span>Berdampingan</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'slider'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Slider Belah</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Side-by-Side View */}
      {viewMode === 'side' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sebelum */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                SEBELUM PERBAIKAN
              </span>
              <span className="text-[10px] text-slate-400">Foto Aduan Warga</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group h-48 sm:h-56">
              <img
                src={beforeUrl}
                alt="Kondisi Awal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                referrerPolicy="no-referrer"
                onClick={() => {
                  setZoomTarget('before');
                  setIsZoomOpen(true);
                }}
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-rose-600 text-white shadow-md">
                Kondisi Rusak
              </div>
              <button
                type="button"
                onClick={() => {
                  setZoomTarget('before');
                  setIsZoomOpen(true);
                }}
                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md"
                title="Perbesar"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Sesudah */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                SESUDAH PERBAIKAN
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Hasil Tuntas Satgas</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-slate-100 dark:bg-slate-800 group h-48 sm:h-56 ring-2 ring-emerald-500/20">
              <img
                src={afterUrl}
                alt="Hasil Selesai"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                referrerPolicy="no-referrer"
                onClick={() => {
                  setZoomTarget('after');
                  setIsZoomOpen(true);
                }}
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-600 text-white shadow-md flex items-center gap-1">
                <CheckCircle2 size={12} /> Tuntas Diperbaiki
              </div>
              <button
                type="button"
                onClick={() => {
                  setZoomTarget('after');
                  setIsZoomOpen(true);
                }}
                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md"
                title="Perbesar"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Interactive Split Slider */}
      {viewMode === 'slider' && (
        <div className="space-y-2">
          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-slate-900 select-none cursor-ew-resize">
            {/* Background: After (Sesudah) */}
            <img
              src={afterUrl}
              alt="Sesudah Perbaikan"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-xs font-black uppercase bg-emerald-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1 pointer-events-none">
              <CheckCircle2 size={12} /> SESUDAH
            </div>

            {/* Foreground: Before (Sebelum) with clip-path */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeUrl}
                alt="Sebelum Perbaikan"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{
                  width: '100%',
                  height: '100%',
                }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-xs font-black uppercase bg-rose-600/90 text-white backdrop-blur-md shadow-md pointer-events-none">
                SEBELUM
              </div>
            </div>

            {/* Split Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-9 h-9 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-sky-500">
                <ArrowLeftRight size={16} />
              </div>
            </div>

            {/* Range Input Overlay for Dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Geser untuk membandingkan foto sebelum dan sesudah"
            />
          </div>

          {/* Slider Helper caption */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
            <span>← Geser ke kiri untuk melihat Hasil Sesudah</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">
              Posisi Belah: {sliderPosition}%
            </span>
            <span>Geser ke kanan untuk melihat Kondisi Awal →</span>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-white pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${zoomTarget === 'before' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                  {zoomTarget === 'before' ? 'FOTO SEBELUM PERBAIKAN' : 'FOTO SESUDAH PENANGANAN'}
                </span>
                <span className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                  {title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={zoomTarget === 'before' ? beforeUrl : afterUrl}
              alt="Preview Zoom"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setZoomTarget('before')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  zoomTarget === 'before'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Lihat Foto Sebelum
              </button>
              <button
                type="button"
                onClick={() => setZoomTarget('after')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  zoomTarget === 'after'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Lihat Foto Sesudah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
