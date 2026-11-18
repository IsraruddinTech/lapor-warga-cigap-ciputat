import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  KeyRound, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Delete,
  Loader2
} from 'lucide-react';
import { ThemeAccent } from '../types';
import { getThemeColors } from '../utils/themeColors';
import { ApiHttpError, loginAdminOnServer } from '../utils/cigapApi';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accent?: ThemeAccent;
  elderlyMode?: boolean;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accent = 'blue',
  elderlyMode = false,
}) => {
  const themeColors = getThemeColors(accent);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setIsSuccess(false);
      setIsVerifying(false);
      // Auto focus first input after slight delay for animation
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  if (!isOpen) return null;

  const currentPin = digits.join('');

  // Verifikasi PIN ke server backend (HttpOnly Session Cookie)
  const verifyPasscode = async (pinToTest: string) => {
    if (cooldownSeconds > 0 || isVerifying || isSuccess) return;
    if (pinToTest.length !== 6) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      await loginAdminOnServer(pinToTest);
      setIsSuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } catch (err) {
      setIsShaking(true);
      if (err instanceof ApiHttpError && err.status === 429) {
        const waitSeconds =
          err.retryAfterSeconds && err.retryAfterSeconds > 0 ? err.retryAfterSeconds : 300;
        setCooldownSeconds(waitSeconds);
        setErrorMessage(
          err.message || `Terlalu banyak percobaan gagal. Tunggu ${waitSeconds} detik demi keamanan.`
        );
      } else if (err instanceof ApiHttpError) {
        setErrorMessage(err.message || 'PIN petugas tidak valid.');
      } else {
        setErrorMessage('Gagal terhubung ke server autentikasi. Coba beberapa saat lagi.');
      }

      setTimeout(() => {
        setIsShaking(false);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 550);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (cooldownSeconds > 0 || isVerifying || isSuccess) return;

    // Ambil hanya angka
    const cleanVal = value.replace(/\D/g, '');
    
    // Jika paste kode 6 digit
    if (cleanVal.length >= 6) {
      const newDigits = cleanVal.slice(0, 6).split('');
      setDigits(newDigits);
      verifyPasscode(newDigits.join(''));
      return;
    }

    const digitChar = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digitChar;
    setDigits(newDigits);
    setErrorMessage('');

    if (digitChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit jika 6 digit terisi
    if (index === 5 && digitChar) {
      const fullPin = newDigits.join('');
      if (fullPin.length === 6) {
        verifyPasscode(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentPin.length === 6) {
        verifyPasscode(currentPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (cooldownSeconds > 0 || isVerifying || isSuccess) return;
    const pastedText = e.clipboardData.getData('text') || '';
    const cleanVal = pastedText.replace(/\D/g, '');
    if (!cleanVal) return;

    e.preventDefault();
    const sliced = cleanVal.slice(0, 6).split('');
    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < sliced.length; i++) {
      newDigits[i] = sliced[i];
    }
    setDigits(newDigits);
    setErrorMessage('');

    if (sliced.length === 6) {
      verifyPasscode(newDigits.join(''));
    } else {
      inputRefs.current[Math.min(sliced.length, 5)]?.focus();
    }
  };

  // Numpad klik
  const handleNumpadPress = (num: string) => {
    if (cooldownSeconds > 0 || isVerifying || isSuccess) return;

    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = num;
      setDigits(newDigits);
      setErrorMessage('');

      if (firstEmptyIndex < 5) {
        inputRefs.current[firstEmptyIndex + 1]?.focus();
      }

      if (firstEmptyIndex === 5) {
        const full = newDigits.join('');
        verifyPasscode(full);
      }
    }
  };

  const handleNumpadBackspace = () => {
    if (cooldownSeconds > 0 || isVerifying || isSuccess) return;

    // Cari digit terakhir yang terisi
    for (let i = 5; i >= 0; i--) {
      if (digits[i] !== '') {
        const newDigits = [...digits];
        newDigits[i] = '';
        setDigits(newDigits);
        inputRefs.current[i]?.focus();
        break;
      }
    }
  };

  const handleNumpadClear = () => {
    if (cooldownSeconds > 0 || isVerifying || isSuccess) return;
    setDigits(['', '', '', '', '', '']);
    setErrorMessage('');
    inputRefs.current[0]?.focus();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passcode-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: isShaking ? [-10, 10, -8, 8, -4, 4, 0] : 0 
          }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Banner Petugas */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              aria-label="Tutup gerbang keamanan"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 flex items-center gap-1 shadow-sm">
                <Lock size={12} /> Gerbang Keamanan Petugas
              </span>
              <span className="text-[11px] text-purple-200 font-semibold">
                Posko CIGAP Ciputat
              </span>
            </div>

            <h2 id="passcode-modal-title" className={`${elderlyMode ? 'text-2xl' : 'text-xl'} font-black text-white leading-tight flex items-center gap-2`}>
              <KeyRound className="text-yellow-400" size={22} />
              Masukkan PIN Petugas
            </h2>
            <p className="text-xs text-purple-200 mt-1">
              Khusus Satgas Dinas & Administrator Posko Wilayah Ciputat. Warga umum tidak memiliki akses ke kontrol verifikasi dan penghapusan data.
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* PIN Inputs Container */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShieldCheck size={14} className={themeColors.textAccent} />
                  6 Digit PIN Dinas
                </span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
                >
                  {showPin ? (
                    <>
                      <EyeOff size={14} /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Lihat Digit
                    </>
                  )}
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={cooldownSeconds > 0 || isVerifying || isSuccess}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 transition-all outline-none ${
                      isSuccess
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : errorMessage
                        ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : digit
                        ? `border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 ring-2 ring-purple-600/20`
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                    }`}
                  />
                ))}
              </div>

              {/* Status Message */}
              <div className="min-h-[22px]">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 size={15} />
                    PIN Terverifikasi! Membuka Dasbor Verifikasi Satgas...
                  </motion.div>
                ) : isVerifying ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <Loader2 size={15} className="animate-spin" />
                    Memverifikasi PIN petugas ke server...
                  </div>
                ) : errorMessage ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400"
                  >
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                ) : cooldownSeconds > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={15} />
                    Sistem dikunci sementara: {cooldownSeconds} detik
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Masukkan PIN dinas menggunakan keyboard atau numpad di bawah.
                  </p>
                )}
              </div>
            </div>

            {/* Virtual Numpad (Mobile / Touch Friendly) */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={cooldownSeconds > 0 || isVerifying || isSuccess}
                    onClick={() => handleNumpadPress(num)}
                    className="h-11 sm:h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-lg hover:bg-purple-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-xs border border-slate-200/80 dark:border-slate-700/60 disabled:opacity-40"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={cooldownSeconds > 0 || isVerifying || isSuccess}
                  onClick={handleNumpadClear}
                  className="h-11 sm:h-12 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 active:scale-95 transition-all shadow-xs disabled:opacity-40"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={cooldownSeconds > 0 || isVerifying || isSuccess}
                  onClick={() => handleNumpadPress('0')}
                  className="h-11 sm:h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-lg hover:bg-purple-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-xs border border-slate-200/80 dark:border-slate-700/60 disabled:opacity-40"
                >
                  0
                </button>
                <button
                  type="button"
                  disabled={cooldownSeconds > 0 || isVerifying || isSuccess}
                  onClick={handleNumpadBackspace}
                  className="h-11 sm:h-12 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center hover:bg-slate-300 active:scale-95 transition-all shadow-xs disabled:opacity-40"
                  title="Hapus Digit Terakhir"
                >
                  <Delete size={18} />
                </button>
              </div>
            </div>

            {/* Catatan Kerahasiaan Akses Petugas */}
            <div className="bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                PIN verifikasi bersifat rahasia dan hanya dimiliki oleh Petugas Satgas Posko Siaga CIGAP Ciputat.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Kembali ke Mode Warga
              </button>

              <button
                type="button"
                disabled={currentPin.length !== 6 || cooldownSeconds > 0 || isVerifying || isSuccess}
                onClick={() => verifyPasscode(currentPin)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all min-h-[44px]"
              >
                {isVerifying ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                <span>{isVerifying ? 'Memverifikasi...' : 'Buka Dasbor Admin'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
