import React from "react";

interface TaaaacIconProps {
  className?: string;
  size?: number;
  variant?: "light" | "dark";
}

export function TaaaacIcon({
  className = "w-8 h-8",
  size,
  variant = "dark",
}: TaaaacIconProps) {
  const isDark = variant === "dark";

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 block ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Scintilla / Schiocco energetico (Verde Smeraldo ad alto contrasto) */}
      <g
        stroke={isDark ? "#34d399" : "#059669"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 64 6 L 64 14" />
        <path d="M 78 12 L 72 18" />
        <path d="M 83 25 L 75 25" />
        <path d="M 79 36 L 72 31" />
        <path d="M 50 10 L 55 17" />
        <path d="M 43 20 L 50 23" />

        {/* Stella centrale dello schiocco con riempimento solido visibile */}
        <path
          d="M 64 17 L 66 22 L 71 20 L 68 25 L 73 28 L 67 29 L 69 35 L 64 31 L 60 36 L 61 30 L 55 30 L 60 26 L 57 20 L 62 23 Z"
          fill={isDark ? "#10b981" : "#059669"}
          fillOpacity={isDark ? "0.85" : "0.75"}
        />
      </g>

      {/* Mano a tratto continuo (Blu Cobalto brillante / Sky Blue per contrasto) */}
      <g
        stroke={isDark ? "#60a5fa" : "#2563eb"}
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Dito Indice alzato */}
        <path d="M 28 48 L 19 25 C 18 21 21 17 25 18 C 28 19 30 22 32 26 L 43 45" />

        {/* Pollice che va verso lo schiocco e polso */}
        <path d="M 49 53 C 51 46 54 38 58 29 C 59.5 25.5 63 26 63 29 C 63 35 60 48 57 58 C 55 64 57 70 59 76 L 56 86 C 53 88 47 87 43 78 C 38 68 31 60 21 54 C 18 52 19 47 23 48 C 27 49 32 53 36 57" />

        {/* Dita piegate nel palmo */}
        <path d="M 43 45 C 47 42 53 44 51 49 C 50 52 46 54 41 53" />
        <path d="M 37 53 C 41 51 46 53 45 57 C 44 60 40 61 35 60" />
      </g>
    </svg>
  );
}

interface TaaaacLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showBadge?: boolean;
  badgeText?: string;
  variant?: "light" | "dark";
}

export function TaaaacLogo({
  className = "",
  iconSize = 24,
  textSize = "text-base",
  showBadge = true,
  badgeText = "Barberly",
  variant = "dark",
}: TaaaacLogoProps) {
  const isDark = variant === "dark";

  return (
    <div className={`inline-flex items-center gap-2.5 min-w-0 select-none ${className}`}>
      {/* Icon Container con contrasto rinforzato */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-xl p-1.5 transition-colors ${
          isDark
            ? "bg-slate-900 border border-slate-700/90 shadow-xs"
            : "bg-blue-50 border border-blue-200/80 shadow-2xs"
        }`}
      >
        <TaaaacIcon size={iconSize} variant={variant} />
      </div>

      {/* Testo Logo: SEMPRE ad alto contrasto (bianco su sfondi scuri, scuro su sfondi chiari) */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-black tracking-tight shrink-0 ${textSize} ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          taaaac
          <span className={isDark ? "text-emerald-400 font-black" : "text-emerald-600 font-black"}>
            .eu
          </span>
        </span>

        {/* Badge personalizzato */}
        {showBadge && badgeText && (
          <span
            className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md shrink-0 tracking-wider border ${
              isDark
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-amber-50 text-amber-900 border-amber-300"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
