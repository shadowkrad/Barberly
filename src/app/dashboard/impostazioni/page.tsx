import { Settings, Clock, MessageSquare, Shield, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BarberlyImpostazioniPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Impostazioni Salone Barberly
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configurazione bottega, orari di apertura, promemoria automatici e parametri Taaaac.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orari Bottega */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-700/60">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-white">Orari di Apertura & Turni</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            {[
              { day: "Lunedì", hours: "Chiuso (Giorno di riposo)" },
              { day: "Martedì - Venerdì", hours: "09:00 - 13:00 / 14:30 - 19:30" },
              { day: "Sabato", hours: "08:30 - 19:00 (Orario continuato)" },
              { day: "Domenica", hours: "Chiuso" },
            ].map((o) => (
              <div key={o.day} className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="font-semibold text-slate-300">{o.day}</span>
                <span className="text-slate-400 font-mono">{o.hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifiche WhatsApp */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-700/60">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-white">Promemoria Automatici WhatsApp</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            I clienti ricevono un messaggio di promemoria 2 ore prima del taglio con link per confermare o disdire.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-emerald-400 font-mono">
            🟢 Canale Notifiche Taaaac Attivo & Connesso
          </div>
        </div>
      </div>
    </div>
  );
}
