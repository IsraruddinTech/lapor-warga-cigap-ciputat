import React from 'react';
import {
  Building2,
  Calendar,
  Clock,
  Hourglass,
  AlertTriangle,
  UserCheck,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { ReportItem } from '../types';
import { getEstimationSummary } from '../utils/reportHelpers';
import { STATUS_LABELS } from '../data/cigapConstants';

interface ReportEstimationCardProps {
  report: ReportItem;
  showAgencyBox?: boolean;
}

export const ReportEstimationCard: React.FC<ReportEstimationCardProps> = ({
  report,
  showAgencyBox = true,
}) => {
  const est = getEstimationSummary(report);
  const statusInfo = STATUS_LABELS[report.status];
  const isCompleted = report.status === 'selesai';

  return (
    <div className="space-y-3">
      {/* Dinas & Petugas */}
      {showAgencyBox && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
              <Building2 size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dinas Penanggung Jawab
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {report.assignedDepartment || 'Posko Terpadu CIGAP Kecamatan Ciputat'}
              </div>
            </div>
          </div>

          {report.officerName && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-xs">
              <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Petugas:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {report.officerName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status Terkini:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo?.badgeClass || ''}`}>
              {statusInfo?.label || report.status}
            </span>
          </div>
        </div>
      )}

      {/* Estimasi Penyelesaian (atau Tanggal Penyelesaian Aktual bila sudah Selesai) */}
      <div
        className={`p-4 rounded-2xl border space-y-2.5 ${
          est.isDelayed
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
            : isCompleted
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80'
            : 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/70'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            {isCompleted ? (
              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Hourglass size={14} className="text-sky-600 dark:text-sky-400" />
            )}
            <span>{isCompleted ? 'Informasi Penyelesaian Aktual' : 'Estimasi Penyelesaian'}</span>
          </div>
          {est.hasEstimate && !isCompleted && report.status !== 'ditolak' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Perkiraan
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
              Tuntas
            </span>
          )}
        </div>

        {/* Delay Alert Banner */}
        {est.delayNotice && (
          <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 font-semibold">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{est.delayNotice}</span>
          </div>
        )}

        {/* Main Estimate or Actual Completion Values */}
        {est.hasEstimate && est.formattedTargetDate ? (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Calendar
                size={14}
                className={`${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'} shrink-0`}
              />
              <span>
                {isCompleted ? 'Tanggal penyelesaian aktual: ' : 'Perkiraan selesai: '}
                {est.formattedTargetDate}
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
              <Clock
                size={14}
                className={`${isCompleted ? 'text-emerald-500' : 'text-amber-500'} shrink-0`}
              />
              <span>{est.remainingText}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-start gap-2">
            <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>{est.remainingText}</span>
          </div>
        )}

        {/* Dates metadata */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-semibold">Diterima:</span> {report.createdAt}
          </div>
          <div>
            <span className="font-semibold">Diperbarui:</span>{' '}
            {report.updatedAt || report.estimatedUpdatedAt || report.createdAt}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
          <span>{est.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
