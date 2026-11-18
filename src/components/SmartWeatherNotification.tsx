import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  AlertTriangle, 
  MapPin, 
  X, 
  Navigation, 
  ChevronRight, 
  Bell, 
  SunMedium, 
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { KelurahanCiputat, WeatherInfo } from '../types';
import { CIPUTAT_KELURAHAN_LIST } from '../data/mockReports';

interface SmartWeatherNotificationProps {
  weather: WeatherInfo;
  selectedKelurahan: KelurahanCiputat;
  onSelectKelurahan: (k: KelurahanCiputat) => void;
  onQuickReportDrainase: () => void;
  elderlyMode?: boolean;
}

export const SmartWeatherNotification: React.FC<SmartWeatherNotificationProps> = ({
  weather,
  selectedKelurahan,
  onSelectKelurahan,
  onQuickReportDrainase,
  elderlyMode,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Micro-location alert logic based on kelurahan
  const getMicroAlert = (kel: KelurahanCiputat) => {
    switch (kel) {
      case 'Ciputat':
        return {
          spot: 'Kolong Flyover Ciputat & Pasar Dewi Sartika',
          risk: 'Tinggi (Potensi Genangan 20-30 cm jika hujan deras > 30 menit)',
          status: 'Siaga Pompa Air Portable',
          roadAlternative: 'Gunakan Jl. Menjangan atau Jl. Ki Hajar Dewantara',
        };
      case 'Cipayung':
        return {
          spot: 'Bantaran Danau Situ Gintung & Jl. Pisangan',
          risk: 'Sedang (Debit air danau dipantau pintu air DSDABMBK)',
          status: 'Pintu Air Normal - Siaga 3',
          roadAlternative: 'Arus Jl. Juanda lancar terkendali',
        };
      case 'Serua Indah':
        return {
          spot: 'Simpang Jl. Merpati Raya & Saluran Kali Serua',
          risk: 'Sedang (Drainase sedang pengerukan sedimen lumpur)',
          status: 'Petugas Satgas Siaga di Lokasi',
          roadAlternative: 'Lewat jalur Cendrawasih arah Bintaro',
        };
      default:
        return {
          spot: `Wilayah Kelurahan ${kel} & Akses Penghubung`,
          risk: 'Kondusif (Drainase mengalir lancar)',
          status: 'Sensor Ketinggian Air Normal',
          roadAlternative: 'Lalu lintas terpantau lancar',
        };
    }
  };

  const microAlert = getMicroAlert(selectedKelurahan);

  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all"
        >
          <Bell size={13} className="text-amber-500 animate-bounce" />
          <span>Buka Peringatan Cuaca {selectedKelurahan}</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border transition-all ${
        weather.level === 'waspada' || weather.level === 'siaga'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200 dark:bg-amber-950/20'
          : 'bg-sky-500/10 border-sky-500/20 text-sky-950 dark:text-sky-200 dark:bg-sky-950/20'
      } p-3.5 sm:p-4 shadow-sm`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Micro-location details */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
            weather.level === 'waspada' || weather.level === 'siaga'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'bg-sky-600 text-white'
          }`}>
            {weather.condition === 'hujan_lebat' || weather.condition === 'badai' ? (
              <CloudRain size={20} className="animate-pulse" />
            ) : (
              <SunMedium size={20} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                Peringatan Cuaca & Lokasi CIGAP
              </span>

              {/* Location badge with interactive change */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs hover:border-sky-500 transition-colors"
                >
                  <MapPin size={12} className="text-rose-500" />
                  <span>Kel. {selectedKelurahan}</span>
                  <RotateCw size={10} className="text-slate-400 ml-0.5" />
                </button>

                {showLocationPicker && (
                  <div className="absolute left-0 mt-1 z-30 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs">
                    <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase">
                      Pilih Kelurahan Anda:
                    </div>
                    {CIPUTAT_KELURAHAN_LIST.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          onSelectKelurahan(k);
                          setShowLocationPicker(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-semibold flex items-center justify-between ${
                          k === selectedKelurahan ? 'text-sky-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>Kelurahan {k}</span>
                        {k === selectedKelurahan && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {weather.temp}°C | Kelembaban {weather.humidity}%
              </span>
            </div>

            <p className={`${elderlyMode ? 'text-base font-semibold' : 'text-xs sm:text-sm font-medium'} leading-snug`}>
              Titik Pantauan: <strong>{microAlert.spot}</strong>. Risiko: {microAlert.risk}.
            </p>

            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Navigation size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
              Saran Jalur: {microAlert.roadAlternative}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action & Dismiss */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={onQuickReportDrainase}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center gap-1"
          >
            <span>Lapor Banjir / Drainase</span>
            <ChevronRight size={14} />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 transition-colors"
            title="Sembunyikan peringatan"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
