import React from "react";
import Link from "next/link";
import { Scissors, MapPin, Phone, Clock, Lock, Sparkles } from "lucide-react";
import { TenantConfigResponse } from "@/types/taaaac";

interface PublicFooterProps {
  config: TenantConfigResponse;
}

export function PublicFooter({ config }: PublicFooterProps) {
  const { theme, contact } = config;

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
          {/* Colonna 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Scissors className="w-4 h-4" />
              </div>
              <span>{theme.brandName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Il punto di riferimento per il grooming maschile e la rasatura tradizionale con panni caldi e prodotti esclusivi.
            </p>
          </div>

          {/* Colonna 2: Orari */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Orari di Apertura
            </h4>
            <p className="text-slate-400">Lunedì – Sabato: 09:00 – 19:30</p>
            <p className="text-slate-400">Domenica: Chiuso</p>
            <p className="text-amber-400 font-semibold pt-1">
              Si riceve su appuntamento
            </p>
          </div>

          {/* Colonna 3: Indirizzo e Contatti */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Dove Siamo
            </h4>
            <p className="text-slate-400">Via Roma, 42 — Milano (MI)</p>
            {contact?.phone && (
              <p className="text-slate-400 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>Tel / WhatsApp: {contact.phone}</span>
              </p>
            )}
          </div>

          {/* Colonna 4: Modulo Taaaac Core */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Taaaac Ecosystem
            </h4>
            <p className="text-slate-400">
              Powered by <strong>Taaaac Core</strong> (taaaac.eu) — Modulo gestionale Barberly con database isolato.
            </p>
          </div>
        </div>

        {/* Bottom Bar con link discreto admin */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <span>
            © {new Date().getFullYear()} {theme.brandName} — Tutti i diritti riservati.
          </span>

          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-600">v0.2.0 • Schedly Pattern</span>

            {/* Link Discreto per l'esercente */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
              title="Accesso pannello di controllo barbiere"
            >
              <Lock className="w-3 h-3" />
              <span>Area Riservata Staff</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
