"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";

export default function EmailSettingsCard() {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleTest() {
    if (!testEmail) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/impostazioni/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({ ok: true, message: data.message });
      } else {
        setResult({ ok: false, message: data.error || "Errore durante l'invio del test" });
      }
    } catch (err: any) {
      setResult({ ok: false, message: err?.message || "Errore di connessione" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-white">Canale Notifiche Email</h2>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
          Taaaac Engine
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Le conferme di appuntamento e i promemoria vengono inviati automaticamente tramite i server certificati Taaaac con reputazione SPF/DKIM e DMARC garantita al 100%.
      </p>

      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/60 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Mittente Certificato:</span>
          <span className="font-mono text-slate-200">notifiche@taaaac.eu</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Stato Consegna:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Attivo & Conforme
          </span>
        </div>
      </div>

      {/* Test invio rapido */}
      <div className="pt-1 space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Invia email di prova
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="latuaemail@esempio.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || !testEmail}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            {loading ? "Invio..." : <><Send className="w-3 h-3" /> Test</>}
          </button>
        </div>

        {result && (
          <div
            className={`p-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
              result.ok ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800" : "bg-rose-950/60 text-rose-300 border border-rose-800"
            }`}
          >
            {result.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span>{result.message}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Vuoi collegare il tuo dominio o SMTP?</span>
        <a
          href="https://taaaac.eu/portal#domain"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold inline-flex items-center gap-1"
        >
          Portale Taaaac <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
