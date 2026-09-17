import React from "react";
import { Scissors, ShieldCheck, AlertTriangle, XCircle, Sparkles, ExternalLink } from "lucide-react";
import { TenantConfigResponse } from "@/types/taaaac";

interface HeaderProps {
  config: TenantConfigResponse;
}

export function Header({ config }: HeaderProps) {
  const { licenseStatus, theme, domain } = config;

  const licenseBadge = {
    ATTIVO: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck,
      text: "Licenza Taaaac: Attiva",
    },
    IN_SCADENZA: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
      text: "Licenza in Scadenza",
    },
    SOSPESO: {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
      text: "Licenza Sospesa",
    },
  }[licenseStatus] || {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: ShieldCheck,
    text: licenseStatus,
  };

  const IconComponent = licenseBadge.icon;

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                {theme.brandName}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium border border-slate-200">
                Barberly
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <span>{domain}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">Taaaac Node</span>
            </p>
          </div>
        </div>

        {/* Right Info: License & Core Link */}
        <div className="flex items-center gap-3">
          {/* Taaaac License Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${licenseBadge.bg}`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{licenseBadge.text}</span>
          </div>

          {/* Console Core Link */}
          <a
            href="https://taaaac.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Taaaac Core</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
