import React from 'react';
import {
  Check,
  Clock,
  FileCheck2,
  SearchCheck,
  Forward,
  Wrench,
  Hourglass,
  CheckCircle2,
  XCircle,
  Inbox,
} from 'lucide-react';
import { ReportItem, ReportStatus } from '../types';
import { STATUS_LABELS, STATUS_WORKFLOW_ORDER } from '../data/mockReports';

interface ReportStatusTimelineProps {
  report: ReportItem;
  compact?: boolean;
}

export function getStatusIcon(status: ReportStatus, size = 14) {
  switch (status) {
    case 'diterima':
      return <Inbox size={size} />;
    case 'diverifikasi':
      return <FileCheck2 size={size} />;
    case 'dalam_peninjauan':
      return <SearchCheck size={size} />;
    case 'diteruskan_ke_dinas':
      return <Forward size={size} />;
    case 'tindak_lanjut':
      return <Wrench size={size} />;
    case 'menunggu_tindak_lanjut':
      return <Hourglass size={size} />;
    case 'selesai':
      return <CheckCircle2 size={size} />;
    case 'ditolak':
      return <XCircle size={size} />;
    default:
      return <Clock size={size} />;
  }
}

export function getStatusDotBg(status: ReportStatus): string {
  const group = STATUS_LABELS[status]?.markerGroup || 'blue';
  switch (group) {
    case 'blue':
      return 'bg-blue-600 text-white ring-blue-200 dark:ring-blue-900';
    case 'purple':
      return 'bg-purple-600 text-white ring-purple-200 dark:ring-purple-900';
    case 'orange':
      return 'bg-amber-500 text-white ring-amber-200 dark:ring-amber-900';
    case 'green':
      return 'bg-emerald-600 text-white ring-emerald-200 dark:ring-emerald-900';
    case 'red':
      return 'bg-rose-600 text-white ring-rose-200 dark:ring-rose-900';
  }
}

export const ReportStatusTimeline: React.FC<ReportStatusTimelineProps> = ({
  report,
  compact = false,
}) => {
  const currentStepIndex = STATUS_LABELS[report.status]?.stepIndex ?? 1;
  const isRejected = report.status === 'ditolak';

  return (
    <div className="space-y-4">
      {/* 1. Visual Progress Stepper */}
      {isRejected ? (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-700 dark:text-rose-300 uppercase">
            <XCircle size={15} />
            <span>Status: Laporan Ditolak</span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
            <strong>Alasan Penolakan:</strong>{' '}
            {report.rejectionReason ||
              report.verification?.rejectionReason ||
              report.adminNotes ||
              'Laporan tidak dapat diproses karena data tidak memenuhi ketentuan verifikasi.'}
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span>Tahapan Penanganan CiGap</span>
            <span className="text-sky-600 dark:text-sky-400">
              Tahap {currentStepIndex} / {STATUS_WORKFLOW_ORDER.length}
            </span>
          </div>

          <div className={`grid ${compact ? 'grid-cols-7 gap-1' : 'grid-cols-7 gap-1.5'}`}>
            {STATUS_WORKFLOW_ORDER.map((st, idx) => {
              const stepNum = idx + 1;
              const isCompleted = currentStepIndex > stepNum || report.status === 'selesai';
              const isCurrent = report.status === st;
              const info = STATUS_LABELS[st];

              return (
                <div key={st} className="flex flex-col items-center text-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                      isCurrent
                        ? `${getStatusDotBg(st)} border-white ring-4 shadow-md scale-110`
                        : isCompleted
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-600'
                    }`}
                    title={info.label}
                  >
                    {isCompleted && !isCurrent ? <Check size={12} strokeWidth={3} /> : getStatusIcon(st, 12)}
                  </div>
                  <span
                    className={`text-[9px] leading-tight font-bold line-clamp-2 ${
                      isCurrent
                        ? 'text-slate-900 dark:text-white'
                        : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {info.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Detailed Chronological History */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Clock size={12} />
          <span>Riwayat Perubahan Status ({report.timeline.length})</span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {report.timeline.map((step, idx) => {
            const isLatest = idx === report.timeline.length - 1;
            const statusMeta = STATUS_LABELS[step.status];

            return (
              <div key={step.id} className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    isLatest
                      ? `${getStatusDotBg(step.status)} ring-4 shadow-sm`
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {getStatusIcon(step.status, 11)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {step.title || statusMeta?.label || step.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                    Oleh: {step.actor}
                  </div>
                  {step.photoUrl && (
                    <div className="mt-1.5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-[200px]">
                      <img
                        src={step.photoUrl}
                        alt="Lampiran tindak lanjut"
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
