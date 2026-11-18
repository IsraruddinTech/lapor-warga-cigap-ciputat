import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  X,
  AlertTriangle,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { ReportNotification } from '../types';
import { STATUS_LABELS } from '../data/mockReports';

interface NotificationCenterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ReportNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onSelectReportById: (reportId: string) => void;
}

export const NotificationCenterPopover: React.FC<NotificationCenterPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectReportById,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* Popover Drawer */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 sm:top-20 right-3 left-3 sm:left-auto sm:right-6 z-50 sm:w-[400px] max-h-[75vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Notifikasi Perkembangan</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                        {unreadCount} Baru
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pembaruan status laporan secara real-time di dalam aplikasi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                aria-label="Tutup notifikasi"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-header Mark All Read */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={13} />
                  <span>Tandai semua telah dibaca</span>
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-slate-500">
                  <Inbox size={28} className="mx-auto text-slate-400" />
                  <p className="text-xs font-semibold">
                    Belum ada notifikasi perkembangan pengaduan.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const statusMeta = STATUS_LABELS[notif.status];
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) {
                          onMarkAsRead(notif.id);
                        }
                        onSelectReportById(notif.reportId);
                        onClose();
                      }}
                      className={`p-3.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 ${
                        !notif.isRead ? 'bg-sky-50/60 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          notif.type === 'delay'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : notif.type === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                        }`}
                      >
                        {notif.type === 'delay' ? (
                          <AlertTriangle size={15} />
                        ) : notif.type === 'resolved' ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Bell size={15} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            )}
                            <span className="font-mono text-[10px] font-black text-sky-600 dark:text-sky-400">
                              #{notif.reportId}
                            </span>
                            {statusMeta && (
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.shortLabel}
                              </span>
                            )}
                          </div>
                          <ExternalLink size={12} className="text-slate-400 shrink-0" />
                        </div>

                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {notif.message}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {notif.reportTitle}
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          <span>{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
