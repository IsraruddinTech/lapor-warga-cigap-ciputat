import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  PhoneCall, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  Phone,
  ShieldCheck,
  Minimize2
} from 'lucide-react';
import { ChatMessage, ThemeAccent } from '../types';
import { CS_TEMPLATES, MIN_CI_MASCOT_INFO } from '../data/mockReports';
import { getThemeColors } from '../utils/themeColors';

interface CSWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: () => void;
  elderlyMode?: boolean;
  accent?: ThemeAccent;
}

export const CustomerServiceWidget: React.FC<CSWidgetProps> = ({
  isOpen,
  onClose,
  onOpenReport,
  elderlyMode,
  accent = 'blue',
}) => {
  const themeColors = getThemeColors(accent);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Halo Warga Ciputat! Saya Min Ci, maskot siaga CIGAP (Ciputat SiGap) siap membantu Anda! 🛡️👍\n\nAda keluhan seputar jalan berlubang, lampu PJU padam, sampah liar, atau genangan air yang ingin Min Ci bantu teruskan ke posko dinas?',
      timestamp: 'Baru saja',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate intelligent civic response by Min Ci
    setTimeout(() => {
      // Find matching template or intelligent fallback
      const lower = textToSend.toLowerCase();
      const match = CS_TEMPLATES.find((t) =>
        lower.includes(t.title.toLowerCase()) ||
        ((lower.includes('palsu') || lower.includes('hoaks') || lower.includes('bohong') || lower.includes('verifikasi') || lower.includes('fake') || lower.includes('saring') || lower.includes('sanksi')) && t.title.includes('Palsu')) ||
        (lower.includes('jalan') && t.title.includes('Jalan')) ||
        (lower.includes('darurat') && t.title.includes('Darurat')) ||
        (lower.includes('lama') && t.title.includes('Lama')) ||
        ((lower.includes('aman') || lower.includes('anonim') || lower.includes('rahasia')) && t.title.includes('Aman')) ||
        ((lower.includes('banjir') || lower.includes('cuaca') || lower.includes('hujan')) && t.title.includes('Banjir')) ||
        (lower.includes('min ci') && t.title.includes('Jalan'))
      );

      let botReply = '';
      if (match) {
        botReply = match.reply;
      } else {
        botReply = `Halo! Min Ci sudah mencatat pertanyaan Anda: "${textToSend}".\n\nUntuk penanganan resmi di lapangan, Anda bisa langsung klik tombol "Buat Laporan Baru" tanpa perlu login. Jika keadaan darurat menyangkut keselamatan, hubungi Call Center 112 Bebas Pulsa (Siaga 24 Jam Tangsel). Min Ci dan tim posko siap mengawal! 🛡️`;
      }

      const replyMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: botReply,
        timestamp: 'Baru saja',
      };

      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleSelectTemplate = (template: typeof CS_TEMPLATES[0]) => {
    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: template.query,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: template.reply,
        timestamp: 'Baru saja',
      };
      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-4 sm:right-4 z-50 sm:w-[420px] max-w-md animate-slideUp">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] sm:h-[590px] max-h-[90vh] sm:max-h-[85vh]"
      >
        {/* CS Header with Min Ci Mascot */}
        <div className={`p-4 bg-gradient-to-r ${themeColors.navBg} text-white flex items-center justify-between shadow-md shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-white/90 shadow-md bg-white p-0.5 shrink-0 ring-2 ring-amber-400/70 flex items-center justify-center">
                <img
                  src={MIN_CI_MASCOT_INFO.avatarUrl}
                  alt="Min Ci Maskot CIGAP Ciputat"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/min_ci_mascot.jpg';
                  }}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-blue-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  Min Ci (Maskot CIGAP)
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Siaga
                </span>
              </div>
              <p className="text-xs text-white/80">
                Asisten Sigap Pengaduan Warga Ciputat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Tutup jendela chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mascot Mini Greeting Badge */}
        <div className={`px-3.5 py-1.5 ${themeColors.subtleBg} border-b ${themeColors.borderAccent} flex items-center justify-between text-xs`}>
          <span className={`font-semibold flex items-center gap-1 ${themeColors.textAccent}`}>
            <ShieldCheck size={14} className={themeColors.textAccent} />
            Ksatria Pelindung Pelayanan Publik Ciputat
          </span>
          <button
            type="button"
            onClick={onOpenReport}
            className={`text-[11px] font-bold ${themeColors.textAccent} underline hover:opacity-80`}
          >
            + Buat Laporan
          </button>
        </div>

        {/* Templates Banner Header */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 pl-1">
              Tanya Cepat ke Min Ci:
            </span>
            {CS_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 ${themeColors.hoverText} transition-all shrink-0`}
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-100/50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className={`w-9 h-9 rounded-xl overflow-hidden border ${themeColors.borderAccent} shadow-sm shrink-0 mt-0.5 bg-white p-0.5 flex items-center justify-center`}>
                  <img
                    src={MIN_CI_MASCOT_INFO.avatarUrl}
                    alt="Min Ci"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/min_ci_mascot.jpg';
                    }}
                  />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? `${themeColors.solidBg} text-white rounded-tr-none`
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className={`text-[10px] font-black uppercase ${themeColors.textAccent} mb-1 tracking-wider`}>
                    Min Ci
                  </div>
                )}
                <p className={elderlyMode ? 'text-base leading-relaxed' : ''}>
                  {msg.text}
                </p>
                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-white/80 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-400 shrink-0">
                <img
                  src={MIN_CI_MASCOT_INFO.avatarUrl}
                  alt="Min Ci"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/min_ci_mascot.jpg';
                  }}
                />
              </div>
              <span className={`font-semibold ${themeColors.textAccent} animate-pulse`}>
                Min Ci sedang menyiapkan tanggapan...
              </span>
            </div>
          )}
        </div>

        {/* Emergency Quick Action Footer */}
        <div className="px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs">
          <span className="text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5">
            <Phone size={13} className="text-rose-500 animate-pulse" />
            Butuh Bantuan Darurat Segera?
          </span>
          <a
            href="tel:112"
            className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center gap-1"
          >
            Hubungi 112 (Bebas Pulsa)
          </a>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendText(inputVal);
            }}
            placeholder={elderlyMode ? 'Tanya Min Ci di sini...' : 'Tanya Min Ci tentang jalan, sampah, atau dinas...'}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleSendText(inputVal)}
            disabled={!inputVal.trim()}
            className={`p-2.5 rounded-xl ${themeColors.primaryBtn} text-white disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-md`}
            aria-label="Kirim pesan ke Min Ci"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
