import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Trash2, Edit3, PlusCircle, RotateCcw, X } from 'lucide-react';

export type ToastType = 'create' | 'update' | 'delete' | 'reset' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  reportId?: string;
}

interface CrudToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const CrudToast: React.FC<CrudToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const iconConfig = {
    create: {
      bg: 'bg-emerald-600',
      icon: <PlusCircle size={18} className="text-white" />,
    },
    update: {
      bg: 'bg-blue-600',
      icon: <Edit3 size={18} className="text-white" />,
    },
    delete: {
      bg: 'bg-rose-600',
      icon: <Trash2 size={18} className="text-white" />,
    },
    reset: {
      bg: 'bg-amber-600',
      icon: <RotateCcw size={18} className="text-white" />,
    },
    info: {
      bg: 'bg-indigo-600',
      icon: <CheckCircle2 size={18} className="text-white" />,
    },
  }[toast.type];

  return (
    <div className="fixed top-5 right-4 left-4 sm:left-auto sm:right-6 z-50 pointer-events-none flex justify-center sm:justify-end">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="pointer-events-auto flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full"
      >
        <div className={`p-2.5 rounded-xl ${iconConfig.bg} text-white shrink-0 shadow-sm`}>
          {iconConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {toast.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </motion.div>
    </div>
  );
};
