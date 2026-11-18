import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck 
} from 'lucide-react';
import { ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface FaqProps {
  onOpenCS: () => void;
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const FaqView: React.FC<FaqProps> = ({ onOpenCS, elderlyMode, accent = 'blue' }) => {
  const themeColors = getThemeColors(accent);
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah saya wajib mendaftar akun atau login untuk membuat laporan?',
      a: 'Tidak perlu sama sekali! Sistem LaporWarga CIGAP sengaja dirancang tanpa kewajiban pendaftaran atau kata sandi agar memudahkan seluruh warga Ciputat (terutama lansia dan orang tua) yang ingin melapor cepat tanpa kesulitan mengingat password.',
      cat: 'Akses & Akun',
    },
    {
      q: 'Bagaimana cara melacak perkembangan status laporan saya?',
      a: 'Setiap kali Anda mengirim laporan, sistem otomatis menerbitkan nomor tiket unik (contoh: #CPT-2026-001). Anda bisa memasukkan nomor tiket atau nama jalan tersebut di menu "Tracking & Riwayat" untuk melihat tahapan pengerjaan dan foto hasil perbaikan secara langsung.',
      cat: 'Tracking Status',
    },
    {
      q: 'Berapa lama waktu yang dibutuhkan hingga jalan berlubang atau lampu padam selesai diperbaiki?',
      a: 'Sesuai Standar Pelayanan Minimal (SPM) Pemkot Tangsel:\n• Verifikasi dan pengecekan lapangan: Maksimal 2–4 jam setelah laporan masuk.\n• Tindakan kedaruratan (pohon tumbang, genangan air): 30–60 menit.\n• Penambalan jalan aspal (hotmix) dan perbaikan lampu PJU: 1 hingga 3 hari kerja tergantung cuaca dan material.',
      cat: 'Waktu Pengerjaan',
    },
    {
      q: 'Apakah identitas dan nomor telepon saya aman jika melaporkan sampah liar atau pungli?',
      a: 'Sangat aman! Anda cukup mencentang opsi "Lapor Secara Anonim" saat mengisi formulir. Nama Anda akan ditampilkan sebagai "Warga Anonim", dan data nomor telepon tidak akan pernah dipublikasikan di kanal publik maupun ke pihak terlapor.',
      cat: 'Keamanan & Privasi',
    },
    {
      q: 'Apa itu Mode Ramah Lansia dan bagaimana cara mengaktifkannya?',
      a: 'Mode Ramah Lansia adalah fitur aksesibilitas yang memperbesar ukuran font tulisan hingga 125%, mempertebal kontras warna, dan memperluas area sentuh tombol agar kakek, nenek, dan warga senior dapat membaca laporan dengan santai tanpa kacamata plus. Anda dapat mengaktifkannya melalui tombol "Mode Lansia" di bagian atas navbar.',
      cat: 'Aksesibilitas Lansia',
    },
    {
      q: 'Bagaimana sistem notifikasi pintar cuaca bekerja di wilayah Ciputat?',
      a: 'Sistem CIGAP terintegrasi dengan sensor pengukur curah hujan dan data satelit cuaca lokal Ciputat. Apabila terdeteksi potensi hujan lebat, sistem otomatis memunculkan peringatan titik rawan genangan seperti Kolong Flyover Ciputat dan Situ Gintung serta memberikan rute jalan alternatif yang lebih aman.',
      cat: 'Cuaca & Banjir',
    },
    {
      q: 'Apakah saya bisa memberikan ulasan atau bintang kepuasan setelah jalan selesai diperbaiki?',
      a: 'Bisa! Setelah status laporan dinyatakan "Selesai Dikerjakan", pada halaman rincian laporan akan muncul formulir penilaian bintang 1–5 serta kolom komentar. Penilaian Anda menjadi tolok ukur evaluasi kinerja dinas terkait oleh Camat dan Walikota.',
      cat: 'Feedback Kepuasan',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* FAQ Header Banner */}
      <div className={`bg-gradient-to-r ${themeColors.navBg} text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeColors.badge}`}>
            Pusat Informasi & Panduan Warga
          </span>
          <h1 className={`${elderlyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-black text-white`}>
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className={`${elderlyMode ? 'text-lg' : 'text-sm sm:text-base'} text-slate-300 leading-relaxed`}>
            Temukan jawaban cepat seputar cara pelaporan, privasi data, waktu penanganan dinas, hingga fitur ramah lansia CIGAP Ciputat.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kata kunci (contoh: anonim, waktu, login, banjir)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
            Tidak menemukan jawaban yang sesuai. Silakan hubungi Customer Service kami di bawah.
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${themeColors.textAccent}`}>
                      {faq.cat}
                    </span>
                    <h3 className={`${elderlyMode ? 'text-lg sm:text-xl font-bold' : 'text-sm sm:text-base font-bold'} text-slate-900 dark:text-white leading-snug`}>
                      {faq.q}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="p-5 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className={`${elderlyMode ? 'text-base sm:text-lg font-medium' : 'text-xs sm:text-sm'} text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line`}>
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Still need help callout */}
      <div className={`p-6 rounded-3xl ${themeColors.subtleBg} border ${themeColors.borderAccent} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${themeColors.primaryGrad} text-white shrink-0 shadow-sm`}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Belum Menemukan Jawaban atas Masalah Anda?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Customer Service CIGAP dan petugas posko siap membantu Anda secara langsung.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onOpenCS}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold ${themeColors.primaryBtn} text-white shrink-0`}
        >
          Chat dengan Layanan CS
        </motion.button>
      </div>
    </div>
  );
};
