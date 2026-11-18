import React from 'react';

interface CigapLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon' | 'image';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
  lightModeOnly?: boolean;
}

/**
 * Official Logo Component for CiGAP (Ciputat Sigap)
 * Design specifications based on official brand identity:
 * - Navy Blue (#0F4C81 / #1A365D) megaphone & typography
 * - Cyan / Teal (#00B4D8 / #06B6D4) sound waves & lowercase 'i' dot
 * - Upward dynamic growth arrow
 * - Subtitle: "Ciputat Sigap"
 */
export const CigapLogo: React.FC<CigapLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  subtitle = 'Ciputat Sigap',
  lightModeOnly = false,
}) => {
  // Dimension mappings
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base',
  };

  // Dedicated Vector Icon for CiGAP Megaphone + Cyan Waves + Upward Arrow
  const VectorIcon = ({ customClass = '' }: { customClass?: string }) => (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${customClass} select-none drop-shadow-sm`}
    >
      <defs>
        <linearGradient id="cigapNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F4C81" />
        </linearGradient>
        <linearGradient id="cigapCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Upward dynamic swoosh / arrow base */}
      <path
        d="M68 152 C92 170, 130 165, 156 128 L170 142 L172 96 L126 102 L140 116 C120 144, 90 148, 72 134 Z"
        fill="url(#cigapNavy)"
      />

      {/* Megaphone Body */}
      {/* Handle */}
      <path
        d="M72 118 L86 138 C88 141, 85 145, 81 147 L73 151 C69 153, 65 151, 63 147 L53 128 Z"
        fill="#0D3B66"
      />
      {/* Rear casing */}
      <rect
        x="42"
        y="86"
        width="28"
        height="38"
        rx="8"
        transform="rotate(-35 56 105)"
        fill="url(#cigapNavy)"
      />
      {/* Horn cone */}
      <path
        d="M68 93 L126 56 C134 51, 144 57, 144 67 L144 122 C144 132, 133 138, 125 132 L68 107 Z"
        fill="url(#cigapNavy)"
      />
      {/* Horn bell inner rim & cyan core */}
      <ellipse
        cx="140"
        cy="94"
        rx="10"
        ry="32"
        fill="#0A2F54"
      />
      <circle
        cx="136"
        cy="94"
        r="12"
        fill="url(#cigapCyan)"
      />

      {/* Cyan Sound Waves (Concentric arcs) */}
      {/* Inner wave */}
      <path
        d="M152 76 C160 81, 164 88, 164 96 C164 104, 160 111, 152 116"
        stroke="url(#cigapCyan)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Middle wave */}
      <path
        d="M164 66 C176 74, 182 85, 182 96 C182 107, 176 118, 164 126"
        stroke="url(#cigapCyan)"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Outer wave */}
      <path
        d="M176 56 C192 67, 200 81, 200 96 C200 111, 192 125, 176 136"
        stroke="url(#cigapCyan)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );

  // If pure image variant is requested
  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/cigap_logo.jpg"
          alt="Logo Resmi CIGAP - Sistem Pengaduan Kerusakan Fasilitas Umum"
          className="max-h-16 w-auto object-contain rounded-xl"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback to SVG if image not loaded
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 p-1.5 ${iconSizes[size]} ${className}`}
        title="Logo CIGAP"
      >
        <VectorIcon customClass="w-full h-full" />
      </div>
    );
  }

  // Horizontal variant (Ideal for Navbar & headers)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
        <div
          className={`flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 p-1.5 ${iconSizes[size]} shrink-0 transition-transform group-hover:scale-105`}
        >
          <VectorIcon customClass="w-full h-full" />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-baseline leading-none">
            {/* CiGAP Typography with cyan dot on the 'i' */}
            <span
              className={`font-black tracking-tight ${titleSizes[size]} ${
                lightModeOnly
                  ? 'text-[#0F4C81]'
                  : 'text-[#0F4C81] dark:text-sky-300'
              }`}
            >
              C
            </span>
            <span
              className={`font-black tracking-tight text-[#00B4D8] dark:text-[#38BDF8] ${titleSizes[size]}`}
            >
              i
            </span>
            <span
              className={`font-black tracking-tight ${titleSizes[size]} ${
                lightModeOnly
                  ? 'text-[#0F4C81]'
                  : 'text-[#0F4C81] dark:text-sky-300'
              }`}
            >
              GAP
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`hidden sm:block font-bold tracking-tight text-slate-500 dark:text-slate-400 mt-0.5 leading-none line-clamp-1 ${subtitleSizes[size]}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Stacked variant (Ideal for Hero, About page, Modals)
  return (
    <div className={`flex flex-col items-center text-center p-4 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-3xl bg-white dark:bg-slate-900 shadow-md border border-slate-200/80 dark:border-slate-800 p-3 ${iconSizes[size]} mb-3`}
      >
        <VectorIcon customClass="w-full h-full" />
      </div>

      <div className="flex items-baseline leading-none justify-center">
        <span
          className={`font-black tracking-tight ${titleSizes[size]} ${
            lightModeOnly
              ? 'text-[#0F4C81]'
              : 'text-[#0F4C81] dark:text-sky-300'
          }`}
        >
          C
        </span>
        <span
          className={`font-black tracking-tight text-[#00B4D8] dark:text-[#38BDF8] ${titleSizes[size]}`}
        >
          i
        </span>
        <span
          className={`font-black tracking-tight ${titleSizes[size]} ${
            lightModeOnly
              ? 'text-[#0F4C81]'
              : 'text-[#0F4C81] dark:text-sky-300'
          }`}
        >
          GAP
        </span>
      </div>

      {showSubtitle && (
        <p
          className={`font-bold tracking-tight text-slate-600 dark:text-slate-400 mt-2 max-w-sm ${subtitleSizes[size]}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
