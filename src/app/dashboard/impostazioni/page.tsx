"use client";

import { useState, useEffect, useRef } from "react";
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
    logoUrl: "",
    faviconUrl: "",
  });

  // Brand Assets State & Refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActiveLogo, setDragActiveLogo] = useState(false);
  const [dragActiveFavicon, setDragActiveFavicon] = useState(false);
  const [imageProcessing, setImageProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/impostazioni")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setForm((f) => ({
            ...f,
            nomeBottega: data.brandName || f.nomeBottega,
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            colorePrimario: data.primaryColor || f.colorePrimario,
            coloreAccento: data.accentColor || f.coloreAccento,
            emailBottega: data.contactEmail || f.emailBottega,
            telefono: data.phone || f.telefono,
          }));
        }
      })
      .catch((err) => console.error("Errore caricamento impostazioni:", err));
  }, []);

  const processImageFile = (
    file: File,
    maxSize: number,
    format: "image/webp" | "image/png",
    callback: (dataUrl: string) => void
  ) => {
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", text: "Il file selezionato non è un'immagine valida." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: "error", text: "L'immagine supera gli 8MB. Seleziona un file più leggero." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(format, format === "image/webp" ? 0.9 : undefined);
        callback(dataUrl);
      };
      img.onerror = () => {
        setFeedback({ type: "error", text: "Impossibile elaborare l'immagine caricata." });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/impostazioni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: form.nomeBottega,
          logoUrl: form.logoUrl || null,
          faviconUrl: form.faviconUrl || null,
          primaryColor: form.colorePrimario,
          accentColor: form.coloreAccento,
          contactEmail: form.emailBottega,
          phone: form.telefono,
        }),
      });

      if (res.ok) {
        setFeedback({ type: "success", text: "Impostazioni della bottega salvate con successo!" });
      } else {
        setFeedback({ type: "error", text: "Errore durante il salvataggio." });
      }
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
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <span>🎨</span> Colori Bottega
            </h3>
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

          {/* Brand & Identità Visiva (Logo & Favicon) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>✨</span> Brand & Identità Visiva (Logo & Favicon)
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Novità v1.0.2
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LOGO */}
              <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🖼️</span> Logo Bottega
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Visibile nella barra di navigazione del sito pubblico e comunicazioni.
                    </p>
                  </div>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: "" })}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-md hover:bg-rose-950/30 transition border border-rose-800"
                    >
                      Rimuovi Logo
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageProcessing("logo");
                      processImageFile(file, 512, "image/webp", (dataUrl) => {
                        setForm((f) => ({ ...f, logoUrl: dataUrl }));
                        setImageProcessing(null);
                      });
                    }
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActiveLogo(true);
                  }}
                  onDragLeave={() => setDragActiveLogo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActiveLogo(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setImageProcessing("logo");
                      processImageFile(file, 512, "image/webp", (dataUrl) => {
                        setForm((f) => ({ ...f, logoUrl: dataUrl }));
                        setImageProcessing(null);
                      });
                    }
                  }}
                  onClick={() => logoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragActiveLogo
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                      : "border-slate-700 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">📁</span>
                    <div className="text-xs text-slate-200 font-medium">
                      <span className="text-amber-400 font-bold underline">Clicca per caricare</span> o trascina qui il file
                    </div>
                    <p className="text-[10px] text-slate-400">
                      PNG, SVG, JPG o WebP (ottimizzato automaticamente a max 512px WebP)
                    </p>
                    {imageProcessing === "logo" && (
                      <span className="text-xs font-semibold text-amber-400 animate-pulse">
                        Elaborazione immagine in corso...
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Oppure inserisci URL Logo
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-700 rounded-xl px-3 py-2 text-xs bg-slate-900 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="https://tuosito.it/logo.png"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  />
                </div>

                {/* Anteprima Live Header */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Anteprima Navbar Sito</span>
                    <span className="text-[10px] text-slate-400 font-normal">Live Preview</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-white p-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {form.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={form.logoUrl}
                            alt="Logo"
                            className="h-8 max-w-[140px] object-contain rounded"
                            onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <span className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-[10px] text-amber-400">✂️</span>
                            <span className="truncate">{form.nomeBottega}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 hidden sm:inline">Servizi</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">Barbieri</span>
                        <span
                          style={{ backgroundColor: form.coloreAccento }}
                          className="text-[10px] text-slate-950 font-bold px-2.5 py-1 rounded-full shadow-xs"
                        >
                          Prenota
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAVICON */}
              <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🌐</span> Favicon & Icona Browser
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Icona visibile nella scheda del browser, nei preferiti e nella barra indirizzi.
                    </p>
                  </div>
                  {form.faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, faviconUrl: "" })}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-md hover:bg-rose-950/30 transition border border-rose-800"
                    >
                      Rimuovi Favicon
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={faviconInputRef}
                  accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageProcessing("favicon");
                      processImageFile(file, 128, "image/png", (dataUrl) => {
                        setForm((f) => ({ ...f, faviconUrl: dataUrl }));
                        setImageProcessing(null);
                      });
                    }
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActiveFavicon(true);
                  }}
                  onDragLeave={() => setDragActiveFavicon(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActiveFavicon(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setImageProcessing("favicon");
                      processImageFile(file, 128, "image/png", (dataUrl) => {
                        setForm((f) => ({ ...f, faviconUrl: dataUrl }));
                        setImageProcessing(null);
                      });
                    }
                  }}
                  onClick={() => faviconInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragActiveFavicon
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                      : "border-slate-700 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🔖</span>
                    <div className="text-xs text-slate-200 font-medium">
                      <span className="text-amber-400 font-bold underline">Carica icona</span> o trascina qui
                    </div>
                    <p className="text-[10px] text-slate-400">
                      PNG, ICO o SVG quadrata (ottimizzata automaticamente a 128x128 PNG)
                    </p>
                    {imageProcessing === "favicon" && (
                      <span className="text-xs font-semibold text-amber-400 animate-pulse">
                        Elaborazione icona in corso...
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Oppure inserisci URL Favicon
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-700 rounded-xl px-3 py-2 text-xs bg-slate-900 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="https://tuosito.it/favicon.ico o /icon.svg"
                    value={form.faviconUrl}
                    onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                  />
                </div>

                {/* Anteprima Live Scheda Browser */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Anteprima Scheda Browser</span>
                    <span className="text-[10px] text-slate-400 font-normal">Live Preview</span>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 shadow-xs">
                    <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-700 shadow-xs max-w-[260px]">
                      {form.faviconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.faviconUrl}
                          alt="Favicon"
                          className="w-4 h-4 rounded-xs object-contain shrink-0"
                          onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                        />
                      ) : (
                        <span className="text-xs shrink-0">💈</span>
                      )}
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {form.nomeBottega} — Barberly
                      </span>
                      <span className="text-[10px] text-slate-400 hover:text-slate-200 ml-1 shrink-0 cursor-default">
                        ✕
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
