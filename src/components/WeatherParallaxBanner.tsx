import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  Sun, 
  Cloud, 
  Moon, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  MapPin, 
  Truck, 
  Zap, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { WeatherInfo } from '../types';

interface WeatherParallaxProps {
  weather: WeatherInfo;
  onWeatherChange: (newWeather: WeatherInfo) => void;
  elderlyMode?: boolean;
}

export const WeatherParallaxBanner: React.FC<WeatherParallaxProps> = ({
  weather,
  onWeatherChange,
  elderlyMode,
}) => {
  const [expanded, setExpanded] = useState(false);

  const presetWeathers: Record<string, WeatherInfo> = {
    hujan_lebat: {
      condition: 'hujan_lebat',
      temp: 26,
      humidity: 90,
      windSpeed: 22,
      alertTitle: 'Peringatan Hujan Deras & Potensi Genangan Drainase',
      alertDetail: 'BMKG Tangsel merilis potensi hujan lebat di Ciputat, Cipayung, dan Serua. Hindari melintas di cekungan Kolong Flyover Ciputat.',
      level: 'waspada',
      location: 'Kecamatan Ciputat, Tangsel',
      updatedAt: 'Terbaru: Update Otomatis Satelit',
    },
    cerah: {
      condition: 'cerah',
      temp: 33,
      humidity: 58,
      windSpeed: 10,
      alertTitle: 'Cuaca Terik Siang Hari - Ciputat Bersih & Kering',
      alertDetail: 'Kondisi jalanan kering kondusif untuk pengerjaan perbaikan aspal hotmix dan pembersihan drainase di 7 kelurahan.',
      level: 'normal',
      location: 'Kecamatan Ciputat, Tangsel',
      updatedAt: 'Kondisi Cerah Stabil',
    },
    badai: {
      condition: 'badai',
      temp: 24,
      humidity: 95,
      windSpeed: 38,
      alertTitle: 'SIAGA DARURAT: Angin Kencang & Petir di Ciputat',
      alertDetail: 'Waspadai pohon rindang rawan tumbang di Jl. Ir. H. Juanda & gangguan jaringan tiang kabel. Satgas BPBD standby 24 jam.',
      level: 'siaga',
      location: 'Ciputat Timur & Sekitarnya',
      updatedAt: 'Status Darurat Aktif',
    },
    malam_cerah: {
      condition: 'malam_cerah',
      temp: 25,
      humidity: 78,
      windSpeed: 12,
      alertTitle: 'Malam Tenang - Pengawasan PJU & Lampu Jalan Aktif',
      alertDetail: 'Dishub Tangsel melakukan patroli berkala armada skylift untuk perbaikan lampu PJU di jalan penghubung Ciputat.',
      level: 'normal',
      location: 'Seluruh Ruas Jalan Ciputat',
      updatedAt: 'Operasional Malam',
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 text-white shadow-xl dark:border-slate-800 transition-all duration-300">
      {/* Background Animated Parallax Sky */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {weather.condition === 'hujan_lebat' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900">
            {/* Animated raindrops */}
            <div className="absolute inset-0 opacity-40">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[1.5px] bg-blue-300/80 rounded-full"
                  style={{
                    left: `${(i * 3.3) % 100}%`,
                    top: `-20px`,
                    height: `${18 + (i % 12)}px`,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: ['0px', '-20px'],
                  }}
                  transition={{
                    duration: 0.6 + (i % 5) * 0.1,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: (i * 0.05) % 0.8,
                  }}
                />
              ))}
            </div>
            {/* Drifting Clouds */}
            <motion.div
              className="absolute top-2 -left-20 text-slate-400/20"
              animate={{ x: [0, 400, 0] }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            >
              <Cloud size={140} />
            </motion.div>
          </div>
        )}

        {weather.condition === 'cerah' && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 via-orange-600/85 to-amber-700">
            {/* Sun flare rays */}
            <motion.div
              className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-yellow-300/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-4 right-16 text-yellow-300/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <Sun size={120} />
            </motion.div>
          </div>
        )}

        {weather.condition === 'badai' && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900">
            {/* Lightning flash simulation */}
            <motion.div
              className="absolute inset-0 bg-sky-200/15"
              animate={{ opacity: [0, 0, 0.8, 0, 0.4, 0] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.7, 0.72, 0.75, 0.77, 1] }}
            />
            <div className="absolute inset-0 opacity-60">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[2px] bg-cyan-200/90"
                  style={{
                    left: `${(i * 2.5) % 100}%`,
                    top: `-20px`,
                    height: `${24 + (i % 16)}px`,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: ['0px', '-45px'],
                  }}
                  transition={{
                    duration: 0.4 + (i % 4) * 0.08,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: (i * 0.04) % 0.6,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {weather.condition === 'malam_cerah' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900">
            {/* Twinkling stars */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${(i * 5.2) % 95 + 2}%`,
                  top: `${(i * 7.1) % 70 + 5}%`,
                }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i % 5) * 0.3 }}
              />
            ))}
            <div className="absolute top-4 right-12 text-indigo-200/30">
              <Moon size={90} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Info */}
      <div className="relative z-10 p-4 sm:p-6 backdrop-blur-[2px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Weather Status & Smart Alert */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/15 backdrop-blur-md text-white border border-white/20">
                <MapPin size={13} className="text-sky-300" />
                {weather.location}
              </span>

              {weather.level === 'siaga' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-rose-500/90 text-white shadow-lg shadow-rose-500/30 animate-pulse">
                  <ShieldAlert size={14} /> Peringatan Siaga Darurat
                </span>
              ) : weather.level === 'waspada' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/90 text-white shadow-md">
                  <AlertTriangle size={14} /> Peringatan Genangan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-600/90 text-white">
                  <Sun size={13} /> Cuaca Normal Kondusif
                </span>
              )}

              <span className="text-xs text-white/70 hidden sm:inline">
                • {weather.updatedAt}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md shrink-0">
                {weather.condition === 'hujan_lebat' && <CloudRain className="text-cyan-300" size={elderlyMode ? 36 : 28} />}
                {weather.condition === 'cerah' && <Sun className="text-yellow-300" size={elderlyMode ? 36 : 28} />}
                {weather.condition === 'badai' && <Zap className="text-yellow-200 animate-bounce" size={elderlyMode ? 36 : 28} />}
                {weather.condition === 'malam_cerah' && <Moon className="text-indigo-200" size={elderlyMode ? 36 : 28} />}
              </div>

              <div>
                <h2 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold tracking-tight text-white flex items-center gap-2`}>
                  {weather.alertTitle}
                  <span className="text-base font-normal text-white/80">({weather.temp}°C)</span>
                </h2>
                <p className={`${elderlyMode ? 'text-base sm:text-lg' : 'text-sm'} text-white/90 leading-relaxed mt-0.5`}>
                  {weather.alertDetail}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/80 pt-1">
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
                <Droplets size={14} className="text-cyan-300" />
                <span>Kelembaban: <strong>{weather.humidity}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
                <Wind size={14} className="text-slate-300" />
                <span>Kecepatan Angin: <strong>{weather.windSpeed} km/j</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Sensor IoT Drainase: <strong>Online</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Weather Simulator Selector */}
          <div className="flex flex-col gap-2 shrink-0 self-start lg:self-center">
            <span className="text-xs font-semibold text-white/75 flex items-center gap-1">
              Ubah Simulasi Cuaca & Fasilitas:
            </span>
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1.5">
              <button
                type="button"
                onClick={() => onWeatherChange(presetWeathers.hujan_lebat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  weather.condition === 'hujan_lebat'
                    ? 'bg-cyan-500 text-white shadow-lg ring-2 ring-white/50'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                <CloudRain size={13} />
                Hujan Ciputat
              </button>

              <button
                type="button"
                onClick={() => onWeatherChange(presetWeathers.cerah)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  weather.condition === 'cerah'
                    ? 'bg-amber-500 text-white shadow-lg ring-2 ring-white/50'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                <Sun size={13} />
                Cerah Terik
              </button>

              <button
                type="button"
                onClick={() => onWeatherChange(presetWeathers.badai)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  weather.condition === 'badai'
                    ? 'bg-rose-600 text-white shadow-lg ring-2 ring-white/50'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                <Zap size={13} />
                Siaga Badai
              </button>

              <button
                type="button"
                onClick={() => onWeatherChange(presetWeathers.malam_cerah)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  weather.condition === 'malam_cerah'
                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-white/50'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                <Moon size={13} />
                Malam Hari
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Animated Road Facility Track (Requested: "animasi seperti fasilitas jalan atau animasi parallax cuaca") */}
        <div className="mt-4 pt-3 border-t border-white/15 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Simulasi Operasional Armada Dinas Tangsel di Ciputat:
            </span>
            <span className="hidden sm:inline text-white/50">Jalur: Flyover Ciputat ⇄ Jl. Dewi Sartika ⇄ Situ Gintung</span>
          </div>

          {/* Roadbed */}
          <div className="relative h-8 rounded-lg bg-slate-950/80 border border-white/10 overflow-hidden flex items-center px-2">
            {/* Center Road Markings */}
            <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-amber-300/40" />

            {/* Street light posts positioned along road */}
            <div className="absolute inset-x-0 flex justify-around pointer-events-none">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${weather.condition === 'malam_cerah' || weather.condition === 'badai' ? 'bg-yellow-300 shadow-[0_0_8px_#fde047]' : 'bg-slate-500'}`} />
                  <div className="w-0.5 h-3 bg-slate-600" />
                </div>
              ))}
            </div>

            {/* Animated Dinas Maintenance Truck Driving Across */}
            <motion.div
              className="absolute z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-700 to-sky-600 text-[10px] font-bold text-white shadow-md border border-sky-400/40"
              animate={{ x: ['-100%', '850%'] }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Truck size={12} className="animate-pulse" />
              <span>Satgas Siaga DSDABMBK Ciputat</span>
            </motion.div>

            {/* Water Puddle Simulation during rain */}
            {(weather.condition === 'hujan_lebat' || weather.condition === 'badai') && (
              <motion.div
                className="absolute left-1/2 w-28 h-2.5 rounded-full bg-cyan-400/30 blur-[1px]"
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
