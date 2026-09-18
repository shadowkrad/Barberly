"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Lock,
  LogOut,
  Store,
} from "lucide-react";
import { TenantConfigResponse } from "@/types/taaaac";

interface AdminHeaderProps {
  config: TenantConfigResponse;
}

export function AdminHeader({ config }: AdminHeaderProps) {
  const { licenseStatus, theme, domain } = config;
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const licenseBadge = {
    ATTIVO: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck,
      text: "Licenza: Attiva",
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
        {/* Brand & Ruolo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Scissors className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                {theme.brandName}
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                AREA GESTIONALE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <span>{domain}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">Taaaac Node v0.2.0</span>
            </p>
          </div>
        </div>

        {/* Azioni Destra */}
        <div className="flex items-center gap-3">
          {/* Licenza Taaaac */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${licenseBadge.bg}`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{licenseBadge.text}</span>
          </div>

          {/* Link Vetrina Pubblica */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
            title="Apri la vetrina pubblica per i clienti"
          >
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Vetrina Clienti</span>
          </Link>

          {/* Blocca Schermo / Logout PIN */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-colors cursor-pointer"
            title="Blocca la cassa e richiedi di nuovo il PIN"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Blocca Cassa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
