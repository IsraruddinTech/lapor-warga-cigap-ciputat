import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  ShieldAlert,
  FileText
} from 'lucide-react';
import { ReportItem, ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';

interface DeleteReportModalProps {
  isOpen: boolean;
  report: ReportItem | null;
  onClose: () => void;
  onConfirmDelete: (reportId: string, reason: string) => void;
  accent?: ThemeAccent;
  elderlyMode?: boolean;
}

export const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onConfirmDelete,
  accent = 'blue',
  elderlyMode = false,
}) => {
  const themeColors = getThemeColors(accent);
  const [selectedReason, setSelectedReason] = useState('Laporan ganda / duplikat');
  const [customReason, setCustomReason] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);

  if (!isOpen || !report) return null;

  const reasons = [
    'Laporan ganda / duplikat pengaduan warga',
    'Masalah sudah terselesaikan secara mandiri oleh warga',
    'Kesalahan ketik atau informasi tidak akurat dari pelapor',
    'Pengaduan uji coba / demonstrasi sistem',
    'Lainnya (Tuliskan alasan di bawah)'
  ];

  const handleDelete = () => {
    if (!confirmChecked) return;
    const finalReason = selectedReason.startsWith('Lainnya') ? (customReason || 'Alasan lainnya') : selectedReason;
    onConfirmDelete(report.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Trash2 size={22} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Hapus Laporan #{report.id}
              </span>
              <h3 className={`${elderlyMode ? 'text-xl' : 'text-lg'} font-black text-white leading-tight`}>
                Konfirmasi Hapus Laporan
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Target Report Preview */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                #{report.id}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Kel. {report.kelurahan}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
              {report.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
              📍 {report.locationName}
            </p>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Tindakan ini akan menghapus data pengaduan secara permanen dari sistem dan pelacakan tiket warga.
            </span>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pilih Alasan Penghapusan:
            </label>
            <div className="space-y-1.5">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deleteReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason.startsWith('Lainnya') && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tuliskan alasan spesifik penghapusan laporan..."
                rows={2}
                className="w-full mt-2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            )}
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Saya memahami bahwa laporan ini akan dihapus dari basis data dan riwayat pelacakan.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[40px]"
          >
            Batalkan
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            disabled={!confirmChecked}
            onClick={handleDelete}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 min-h-[40px] transition-all ${
              confirmChecked
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 size={15} />
            <span>Hapus Permanen</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
