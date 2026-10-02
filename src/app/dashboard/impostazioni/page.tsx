"use client";

import { useState } from "react";
import {
  Settings,
  Clock,
  MessageSquare,
  Building2,
  Mail,
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Globe,
  Bell,
  Sparkles,
} from "lucide-react";
import EmailSettingsCard from "@/components/dashboard/EmailSettingsCard";
import RegisteredDevicesCard from "@/components/dashboard/RegisteredDevicesCard";

type SettingsTab = "bottega" | "orari" | "email" | "whatsapp" | "dispositivi" | "aspetto";

interface TabItem {
  id: SettingsTab;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: "bottega",
    label: "Bottega & Sede",
    shortLabel: "Bottega",
    icon: "💈",
    description: "Anagrafica salone, indirizzo, recapiti telefonici e poltrone",
  },
  {
    id: "orari",
    label: "Orari & Turni",
    shortLabel: "Orari",
    icon: "⏰",
    description: "Orari di apertura settimanali, pause pranzo e turni di lavoro",
  },
  {
    id: "email",
    label: "Email & Notifiche",
    shortLabel: "Email",
    icon: "📧",
    description: "Canale email Taaaac Mail Engine e conferme prenotazione",
  },
  {
    id: "whatsapp",
    label: "WhatsApp & SMS",
    shortLabel: "WhatsApp",
    icon: "💬",
    description: "Promemoria automatici ai clienti 2 ore prima del taglio",
  },
  {
    id: "dispositivi",
    label: "Dispositivi PWA",
    shortLabel: "Dispositivi",
    icon: "📱",
    description: "Accesso rapido con FaceID/PIN e revoca smartphone da remoto",
  },
  {
    id: "aspetto",
    label: "Aspetto & Brand",
    shortLabel: "Aspetto",
    icon: "🎨",
    description: "Personalizzazione tema scuro, accento oro/ambra e logo",
  },
];

export default function BarberlyImpostazioniPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("bottega");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    nomeBottega: "Gentleman Barber Club",
    titolare: "Marco Guidelli",
    indirizzo: "Via Roma, 42 - 52100 Arezzo (AR)",
    telefono: "+39 0575 123456",
    emailBottega: "info@gentlemanbarber.it",
    sitoWeb: "https://barberly-one.vercel.app",
    numeroPoltrone: "3",
    anticipoMinimoOre: "1",
    disdettaMinimaOre: "2",
    whatsappPromemoriaOre: "2",
    whatsappAbilitato: true,
    colorePrimario: "#0f172a",
    coloreAccento: "#f59e0b",
  });

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setFeedback({ type: "success", text: "Impostazioni della bottega salvate con successo!" });
    } catch {
      setFeedback({ type: "error", text: "Errore durante il salvataggio." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Intestazione Principale */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <span>💈 Gestione Bottega</span>
            <span>•</span>
            <span>Configurazione Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-amber-500" />
            Impostazioni Barberly
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configura orari di apertura, promemoria WhatsApp, canale email e personalizzazione grafica.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-xs shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Salvataggio...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salva Modifiche</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
              : "bg-rose-950/80 text-rose-300 border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* SOTTOMENU / TABS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 sm:p-2 shadow-xs">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth" aria-label="Impostazioni Barberly">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-500/30"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Intestazione Sottomenu Corrente */}
      {currentTab && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{currentTab.icon}</span>
              <span>{currentTab.label}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{currentTab.description}</p>
          </div>
        </div>
      )}

      {/* CONTENUTO SCHEDE */}

      {/* TAB 1: BOTTEGA & SEDE */}
      {activeTab === "bottega" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Bottega / Salone</label>
              <input
                type="text"
                value={form.nomeBottega}
                onChange={(e) => setForm({ ...form, nomeBottega: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Titolare / Master Barber</label>
              <input
                type="text"
                value={form.titolare}
                onChange={(e) => setForm({ ...form, titolare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Indirizzo Completo</label>
              <input
                type="text"
                value={form.indirizzo}
                onChange={(e) => setForm({ ...form, indirizzo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Numero Poltrone da Lavoro</label>
              <input
                type="number"
                value={form.numeroPoltrone}
                onChange={(e) => setForm({ ...form, numeroPoltrone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Telefono Bottega / WhatsApp</label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Pubblica Salone</label>
              <input
                type="email"
                value={form.emailBottega}
                onChange={(e) => setForm({ ...form, emailBottega: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORARI & TURNI */}
      {activeTab === "orari" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
            {[
              { day: "Lunedì", hours: "Chiuso (Giorno di riposo)", active: false },
              { day: "Martedì - Venerdì", hours: "09:00 - 13:00 / 14:30 - 19:30", active: true },
              { day: "Sabato", hours: "08:30 - 19:00 (Orario Continuato)", active: true },
              { day: "Domenica", hours: "Chiuso", active: false },
            ].map((o) => (
              <div key={o.day} className={`p-4 rounded-xl border ${o.active ? "bg-slate-800/90 border-slate-700/80" : "bg-slate-950/60 border-slate-800 text-slate-500"}`}>
                <span className="font-bold text-white block text-sm">{o.day}</span>
                <span className={`font-mono text-xs block mt-1.5 ${o.active ? "text-amber-400" : "text-slate-500"}`}>{o.hours}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-3">
            <h3 className="font-bold text-white text-sm">Regole di Prenotazione Poltrona</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Anticipo Minimo di Prenotazione (ore)</label>
                <input
                  type="number"
                  value={form.anticipoMinimoOre}
                  onChange={(e) => setForm({ ...form, anticipoMinimoOre: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tempo Limite per Disdetta Gratuita (ore)</label>
                <input
                  type="number"
                  value={form.disdettaMinimaOre}
                  onChange={(e) => setForm({ ...form, disdettaMinimaOre: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL & NOTIFICHE */}
      {activeTab === "email" && (
        <div className="space-y-4">
          <EmailSettingsCard />
        </div>
      )}

      {/* TAB 4: WHATSAPP & SMS */}
      {activeTab === "whatsapp" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div>
              <p className="text-sm font-bold text-white">Promemoria Automatici WhatsApp</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Invia un messaggio WhatsApp al cliente 2 ore prima del taglio o modellatura barba.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.whatsappAbilitato}
              onChange={(e) => setForm({ ...form, whatsappAbilitato: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="text-amber-400 font-bold block text-sm">Template Promemoria:</span>
            <div className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-800">
              Ciao &#123;&#123;nome_cliente&#125;&#125;! Ti ricordiamo il tuo appuntamento per &#123;&#123;servizio&#125;&#125; da Gentleman Barber Club oggi alle &#123;&#123;orario&#125;&#125;. Per gestire la prenotazione: &#123;&#123;link_appuntamento&#125;&#125;
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISPOSITIVI PWA & BIOMETRIA */}
      {activeTab === "dispositivi" && (
        <div className="space-y-6">
          <RegisteredDevicesCard />
        </div>
      )}

      {/* TAB 5: ASPETTO & BRAND */}
      {activeTab === "aspetto" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Colore di Sfondo Primario</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.colorePrimario}
                  onChange={(e) => setForm({ ...form, colorePrimario: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-xs text-slate-300">{form.colorePrimario}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Colore Accento Poltrone / Bottega</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.coloreAccento}
                  onChange={(e) => setForm({ ...form, coloreAccento: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-xs text-amber-400 font-bold">{form.coloreAccento}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
