"use client";

import { useState, useEffect } from "react";
import { Clock, Save, Copy, Check, AlertCircle, Calendar } from "lucide-react";

const GIORNI_SETTIMANA = [
  { nome: "Lunedì", giorno: 1 },
  { nome: "Martedì", giorno: 2 },
  { nome: "Mercoledì", giorno: 3 },
  { nome: "Giovedì", giorno: 4 },
  { nome: "Venerdì", giorno: 5 },
  { nome: "Sabato", giorno: 6 },
  { nome: "Domenica", giorno: 0 },
];

interface Disponibilita {
  id?: string;
  giorno: number;
  oraInizio: string;
  oraFine: string;
  pausaInizio?: string | null;
  pausaFine?: string | null;
  attivo: boolean;
}

export default function BarberlyOrariPage() {
  const [orari, setOrari] = useState<Disponibilita[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/orari")
      .then((r) => r.json())
      .then((data: Disponibilita[]) => {
        const completo = Array.from({ length: 7 }, (_, i) => {
          const trovato = Array.isArray(data) ? data.find((d) => d.giorno === i) : null;
          return (
            trovato || {
              giorno: i,
              oraInizio: "09:00",
              oraFine: "19:30",
              pausaInizio: "13:00",
              pausaFine: "14:00",
              attivo: i >= 1 && i <= 6,
            }
          );
        });
        setOrari(completo);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Errore fetch orari:", err);
        setLoading(false);
      });
  }, []);

  const update = (giorno: number, field: keyof Disponibilita, value: any) => {
    setOrari((prev) =>
      prev.map((o) => (o.giorno === giorno ? { ...o, [field]: value } : o))
    );
    setFeedback(null);
  };

  const handleCopyMondayToWeek = () => {
    const lunedi = orari.find((o) => o.giorno === 1);
    if (!lunedi) return;
    setOrari((prev) =>
      prev.map((o) => {
        if (o.giorno >= 2 && o.giorno <= 6) {
          return {
            ...o,
            oraInizio: lunedi.oraInizio,
            oraFine: lunedi.oraFine,
            pausaInizio: lunedi.pausaInizio,
            pausaFine: lunedi.pausaFine,
            attivo: lunedi.attivo,
          };
        }
        return o;
      })
    );
    setFeedback({
      type: "success",
      text: "Orari del Lunedì duplicati su Martedì-Sabato!",
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/orari", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orari),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Impossibile salvare gli orari");
      }
      setFeedback({ type: "success", text: "Orari settimanali del salone salvati con successo!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Errore durante il salvataggio" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[350px]">
        <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Caricamento orari salone...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Orari & Apertura Salone
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Definisci gli orari di apertura della bottega, le pause pranzo e i giorni di chiusura.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMondayToWeek}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            Copia Lunedì su Mar-Sab
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salva Orari
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-300 border-rose-500/30"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Lista Giorni */}
      <div className="space-y-3">
        {GIORNI_SETTIMANA.map(({ nome, giorno }) => {
          const item = orari.find((o) => o.giorno === giorno) || {
            giorno,
            oraInizio: "09:00",
            oraFine: "19:30",
            pausaInizio: "13:00",
            pausaFine: "14:00",
            attivo: giorno >= 1 && giorno <= 6,
          };

          return (
            <div
              key={giorno}
              className={`p-4 rounded-2xl border transition-all ${
                item.attivo
                  ? "bg-slate-900/90 border-slate-800 shadow-xs"
                  : "bg-slate-950/60 border-slate-900 opacity-60"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Nome giorno + Toggle */}
                <div className="flex items-center justify-between sm:justify-start gap-4 min-w-44">
                  <span className="font-bold text-sm text-white w-24">{nome}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.attivo}
                      onChange={(e) => update(giorno, "attivo", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-300">
                      {item.attivo ? "Aperto" : "Chiuso"}
                    </span>
                  </label>
                </div>

                {/* Orari Apertura & Pausa */}
                {item.attivo ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Apertura
                      </label>
                      <input
                        type="time"
                        value={item.oraInizio}
                        onChange={(e) => update(giorno, "oraInizio", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Chiusura
                      </label>
                      <input
                        type="time"
                        value={item.oraFine}
                        onChange={(e) => update(giorno, "oraFine", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Pausa Inizio
                      </label>
                      <input
                        type="time"
                        value={item.pausaInizio || ""}
                        onChange={(e) => update(giorno, "pausaInizio", e.target.value || null)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Pausa Fine
                      </label>
                      <input
                        type="time"
                        value={item.pausaFine || ""}
                        onChange={(e) => update(giorno, "pausaFine", e.target.value || null)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-1">
                    Giorno di riposo / Salone chiuso al pubblico
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
