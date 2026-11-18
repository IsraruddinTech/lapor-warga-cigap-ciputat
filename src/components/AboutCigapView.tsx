import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Target, 
  Users, 
  CheckCircle2, 
  PhoneCall, 
  Clock, 
  Building2, 
  HeartHandshake,
  MapPin,
  Megaphone
} from 'lucide-react';
import { CigapLogo } from './CigapLogo';
import { ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface AboutProps {
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const AboutCigapView: React.FC<AboutProps> = ({ elderlyMode, accent = 'blue' }) => {
  const themeColors = getThemeColors(accent);
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Brand Card */}
      <div className={`bg-gradient-to-br ${themeColors.navBg} text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/30">
            <ShieldCheck size={14} className="text-amber-300" /> Inovasi Pelayanan Publik Kota Tangerang Selatan
          </div>
          <h1 className={`${elderlyMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'} font-black tracking-tight text-white leading-tight`}>
            Mengenal Sistem CIGAP (Ciputat Sigap)
          </h1>
          <p className={`${elderlyMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} text-sky-100/90 leading-relaxed`}>
            <strong>CIGAP (Ciputat Sigap)</strong> adalah kanal digital pelaporan aspirasi & pengaduan keluhan infrastruktur warga Kecamatan Ciputat yang dirancang inklusif, ramah bagi seluruh kalangan—baik generasi muda maupun para sesepuh (lansia).
          </p>
        </div>

        {/* Decorative watermark icon */}
        <ShieldCheck className="absolute -bottom-10 -right-10 text-white/5 w-80 h-80 pointer-events-none" />
      </div>

      {/* Alur Kerja 4 Langkah */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${themeColors.textAccent}`}>
            Standar Operasional Prosedur (SOP)
          </span>
          <h2 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 dark:text-white mt-1`}>
            Alur Penanganan Pengaduan Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Setiap aduan diproses dengan prinsip transparansi, kepastian waktu, dan akuntabilitas dinas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '1. Buat Laporan',
              desc: 'Warga memotret bukti fisik & menentukan lokasi jalan atau fasilitas di Ciputat tanpa perlu registrasi akun.',
              color: themeColors.primaryGrad,
            },
            {
              step: '2. Verifikasi Lapangan',
              desc: 'Pengawas wilayah posko Ciputat memeriksa keabsahan data & menetapkan dinas teknis yang menangani.',
              color: 'from-purple-500 to-indigo-600',
            },
            {
              step: '3. Tindak Lanjut',
              desc: 'Armada dinas (truk aspal, mobil skylift PJU, atau mobil tangki penyedot) dikerahkan ke lokasi.',
              color: 'from-amber-500 to-orange-600',
            },
            {
              step: '4. Selesai & Ulasan',
              desc: 'Pekerjaan perbaikan tuntas 100%, foto hasil diunggah, dan warga dapat memberikan penilaian kepuasan.',
              color: 'from-sky-500 to-blue-600',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 relative"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${item.color} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                {idx + 1}
              </div>
              <h3 className={`${elderlyMode ? 'text-lg font-bold' : 'text-sm font-bold'} text-slate-900 dark:text-white`}>
                {item.step}
              </h3>
              <p className={`${elderlyMode ? 'text-base' : 'text-xs'} text-slate-600 dark:text-slate-300 leading-relaxed`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nilai Utama & Inklusivitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className={`w-12 h-12 rounded-2xl ${themeColors.iconBg} flex items-center justify-center`}>
            <Users size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Ramah Segala Usia (Lansia & Remaja)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Dilengkapi Mode Huruf Besar (Mode Lansia), navigasi tanpa login rumit, dan bahasa yang santun serta mudah dipahami oleh kakek nenek.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className={`w-12 h-12 rounded-2xl ${themeColors.iconBg} flex items-center justify-center`}>
            <Target size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Terhubung Langsung ke 7 Kelurahan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Mencakup Kelurahan Ciputat, Cipayung, Serua, Serua Indah, Sawah Baru, Sawah, dan Jombang dengan pemetaan peta digital interaktif.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center">
            <HeartHandshake size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Privasi Terjamin & Opsi Anonim
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Warga memiliki kebebasan untuk menyembunyikan identitas saat melaporkan masalah sensitif seperti tumpukan sampah liar atau pungutan liar.
          </p>
        </div>
      </div>

      {/* 1. Identitas Logo Resmi Sistem: CIGAP */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 ${themeColors.borderAccent} ${themeColors.subtleBg} shadow-lg relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="relative shrink-0 flex flex-col items-center">
            <div className={`w-40 sm:w-48 p-3 rounded-3xl bg-white dark:bg-slate-800 border-2 ${themeColors.borderAccent} shadow-xl flex items-center justify-center`}>
              <img
                src="/cigap_logo.jpg"
                alt="Logo Resmi CiGAP - Sistem Pengaduan Kerusakan Fasilitas Umum"
                className="w-full h-auto object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className={`mt-2 px-3 py-1 rounded-full ${themeColors.solidBg} text-white text-[11px] font-black uppercase tracking-wider shadow-md`}>
              Logo Resmi CIGAP
            </span>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${themeColors.badge}`}>
              <Megaphone size={14} /> Identitas Brand Resmi Sistem
            </div>
            <h2 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 dark:text-white`}>
              Logo Baru <span className={themeColors.textAccent}>CiGAP</span> (Ciputat Sigap)
            </h2>
            <p className={`${elderlyMode ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-700 dark:text-slate-300 leading-relaxed`}>
              Logo resmi CiGAP memadukan <strong>Megafon Biru</strong> sebagai simbol amplifikasi suara aspirasi masyarakat, <strong>Gelombang Sinyal Cyan</strong> yang melambangkan kecepatan transmisi data digital pengaduan, serta <strong>Panah Dinamis Naik</strong> yang mencerminkan komitmen akselerasi perbaikan fasilitas umum di Kecamatan Ciputat.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                📢 Megafon: Aspirasi Terbuka
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                📡 Gelombang Cyan: Cepat & Digital
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                📈 Panah Naik: Perbaikan Nyata Fasilitas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Karakter Maskot Pelayanan: Min Ci */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 ${themeColors.borderAccent} bg-white dark:bg-slate-900 shadow-lg relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 p-2 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-800 ring-4 ring-amber-400/40 flex items-center justify-center">
              <img
                src="/min_ci_knight_mascot.jpg"
                alt="Min Ci - Maskot Pelayanan CIGAP Ciputat"
                className="w-full h-full object-contain select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/min_ci_mascot.jpg';
                }}
              />
            </div>
            <span className={`mt-2 px-3 py-1 rounded-full ${themeColors.primaryBtn} text-white text-[11px] font-black uppercase tracking-wider shadow-md`}>
              Karakter Maskot Resmi
            </span>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              Karakter Maskot Pelayanan Warga
            </div>
            <h2 className={`${elderlyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 dark:text-white`}>
              Kenalkan, <span className="text-sky-600 dark:text-sky-400">Min Ci</span>: Si Ksatria Sigap Ciputat!
            </h2>
            <p className={`${elderlyMode ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-700 dark:text-slate-300 leading-relaxed`}>
              <strong>Min Ci</strong> adalah karakter maskot pelayanan ramah warga Ciputat. Tampil anggun dan tangguh dengan <strong>helm ksatria emas</strong>, berhijab putih dengan tatapan mata ramah, mengenakan seragam jas biru muda berpin <strong>UIN</strong>, serta sigap duduk di meja pelayanan dengan tablet digital untuk mencatat dan memproses setiap aspirasi fasilitas umum Anda.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                🛡️ Helm Ksatria Emas: Pelindung Warga
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                📝 Meja & Tablet Digital: Sigap Mencatat Aduan
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                🎓 Pin UIN & Identitas Ciputat Tangsel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kontak Kantor Kecamatan & Darurat */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Pusat Pelayanan & Posko Siaga Kecamatan Ciputat
            </h3>
            <p className="text-xs text-slate-400">
              Jl. Cendrawasih No. 1, Sawah Baru, Kec. Ciputat, Kota Tangerang Selatan, Banten 15413
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block">Call Center Darurat:</span>
            <strong className="text-sky-400 text-base">112 (Bebas Pulsa)</strong>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block">Posko Pengaduan:</span>
            <strong className="text-white text-base">(021) 749-2114</strong>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block">Jam Pelayanan Kantor:</span>
            <strong className="text-white text-base">Senin - Jumat (08.00 - 16.00 WIB)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
