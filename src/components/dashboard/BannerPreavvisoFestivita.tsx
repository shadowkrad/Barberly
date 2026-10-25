"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Calendar, Sparkles, ArrowRight, Clock } from "lucide-react";
import type { PreavvisoFestivita } from "@/lib/festivita-italiane";

interface Props {
  festivita: PreavvisoFestivita[];
}

export default function BannerPreavvisoFestivita({ festivita }: Props) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("barberly_dismissed_festivita");
      if (stored) {
        setDismissed(JSON.parse(stored));
      }
    } catch {
      // Ignora errori storage
    }
  }, []);

  const handleDismiss = (dataStr: string) => {
    const updated = { ...dismissed, [dataStr]: true };
    setDismissed(updated);
    try {
      sessionStorage.setItem("barberly_dismissed_festivita", JSON.stringify(updated));
    } catch {
      // Ignora errori storage
    }
  };

  const attive = festivita.filter((f) => !dismissed[f.data]);
  if (attive.length === 0) return null;

  return (
    <div className="space-y-3">
      {attive.map((item) => {
        const isChiuso = !item.isLavorativo;
        const giorniLabel =
          item.giorniMancanti === 0
            ? "Oggi"
            : item.giorniMancanti === 1
            ? "Domani"
            : `Tra ${item.giorniMancanti} giorni`;

        return (
          <div
            key={item.data}
            className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
              isChiuso
                ? "bg-slate-900/90 border-amber-500/40 text-white"
                : "bg-slate-900/90 border-emerald-500/40 text-white"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 pr-8 md:pr-0">
                {/* Badge Festività & Giorni Mancanti */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isChiuso
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    <span>{isChiuso ? "🎄 Festività in Arrivo" : "✨ Apertura Straordinaria Attiva"}</span>
                    <span>•</span>
                    <span className="font-bold">{giorniLabel}</span>
                  </span>

                  <span className="text-xs font-bold text-slate-300 capitalize flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {item.dataFormattata}
                  </span>
                </div>

                {/* Titolo e descrizione chiara */}
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{item.nome}</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {isChiuso ? (
                    <>
                      In questa data il salone risulterà <strong className="text-rose-400 font-bold">chiuso al pubblico</strong> e le prenotazioni online saranno bloccate. Desideri programmare un&apos;apertura straordinaria o orari speciali per le feste?
                    </>
                  ) : (
                    <>
                      Hai configurato un&apos;<strong>Apertura Straordinaria</strong>{" "}
                      {item.orario && <span className="font-mono text-emerald-400 font-bold">({item.orario})</span>}: i posti in poltrona online sono regolarmente prenotabili.
                    </>
                  )}
                </p>
              </div>

              {/* Azioni & CTA */}
              <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
                <Link
                  href="/dashboard/orari?tab=festivita"
                  className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 ${
                    isChiuso
                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black"
                  }`}
                >
                  {isChiuso ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Configura Orari Speciali</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Gestisci Orari</span>
                    </>
                  )}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDismiss(item.data)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  title="Nascondi promemoria"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
