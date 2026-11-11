"use client";

import { useTenantConfig } from "@/components/providers/TenantConfigProvider";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
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
  Scissors,
  Smartphone,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import EmailSettingsCard from "@/components/dashboard/EmailSettingsCard";
import RegisteredDevicesCard from "@/components/dashboard/RegisteredDevicesCard";
import ShowcaseVisualStudio from "@/components/dashboard/showcase/ShowcaseVisualStudio";
import TelegramHubCard, { TelegramHubData } from "@/components/dashboard/TelegramHubCard";
import FidelitySettingsPanel, { FidelitySettingsData } from "@/components/dashboard/FidelitySettingsPanel";
import EditorCartaGrafica from "@/components/carta-grafica/EditorCartaGrafica";
import { Send, Award, CreditCard } from "lucide-react";

type SettingsTab = "bottega" | "orari" | "email" | "whatsapp" | "telegram" | "fidelity" | "dispositivi" | "aspetto" | "carta-grafica";

interface TabItem {
  id: SettingsTab;
  label: string;
  shortLabel: string;
  iconComponent: React.ElementType;
  shortDescription: string;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: "bottega",
    label: "Bottega & Sede",
    shortLabel: "Bottega",
    iconComponent: Scissors,
    shortDescription: "Anagrafica, poltrone e sede",
    description: "Anagrafica salone, indirizzo, recapiti telefonici e poltrone",
  },
  {
    id: "orari",
    label: "Orari & Turni",
    shortLabel: "Orari",
    iconComponent: Clock,
    shortDescription: "Apertura, pause e turni",
    description: "Orari di apertura settimanali, pause pranzo e turni di lavoro",
  },
  {
    id: "email",
    label: "Email & Notifiche",
    shortLabel: "Email",
    iconComponent: Mail,
    shortDescription: "Taaaac Engine e ricevute",
    description: "Canale email Taaaac Mail Engine e conferme prenotazione",
  },
  {
    id: "whatsapp",
    label: "WhatsApp & SMS",
    shortLabel: "WhatsApp",
    iconComponent: MessageSquare,
    shortDescription: "Promemoria automatici 2h prima",
    description: "Promemoria automatici ai clienti 2 ore prima del taglio",
  },
  {
    id: "telegram",
    label: "Telegram Hub & Staff",
    shortLabel: "Telegram",
    iconComponent: Send,
    shortDescription: "Bot ed avvisi staff",
    description: "Notifiche appuntamenti staff su gruppo Telegram e One-Tap Connect a zero crediti",
  },
  {
    id: "fidelity",
    label: "Fidelity & Punti",
    shortLabel: "Fidelity",
    iconComponent: Award,
    shortDescription: "Raccolta punti e premi",
    description: "Fidelizzazione clienti con numero di telefono, accredito punti e catalogo premi",
  },
  {
    id: "dispositivi",
    label: "Dispositivi PWA",
    shortLabel: "Dispositivi",
    iconComponent: Smartphone,
    shortDescription: "FaceID e PIN biometrico",
    description: "Accesso rapido con FaceID/PIN e revoca smartphone da remoto",
  },
  {
    id: "aspetto",
    label: "Aspetto & Brand",
    shortLabel: "Aspetto",
    iconComponent: Palette,
    shortDescription: "Live Studio Vetrina",
    description: "Visual Showcase Customizer per editare in tempo reale testi, foto, cover e colori della vetrina",
  },
  {
    id: "carta-grafica",
    label: "Biglietti & Buoni",
    shortLabel: "Biglietti",
    iconComponent: CreditCard,
    shortDescription: "Grafica buoni e biglietto da visita",
    description: "Editor visivo per buoni regalo e biglietti da visita fronte/retro con sfondo personalizzato",
  },
];

// Le sezioni delle impostazioni sono raccolte in pochi gruppi: meno voci, tutto più vicino
interface GruppoImpostazioni {
  id: string;
  label: string;
  shortDescription: string;
  iconComponent: React.ElementType;
  tabs: SettingsTab[];
}

const GRUPPI_BASE: { id: string; label: string; shortDescription: string; tabs: SettingsTab[] }[] = [
  { id: "attivita", label: "Attività", shortDescription: "Sede, orari e turni", tabs: ["bottega", "orari"] },
  { id: "notifiche", label: "Notifiche", shortDescription: "Email, WhatsApp e Telegram", tabs: ["email", "whatsapp", "telegram"] },
  { id: "fidelity", label: "Fidelity e buoni", shortDescription: "Punti, buoni e biglietti", tabs: ["fidelity", "carta-grafica"] },
  { id: "aspetto", label: "Aspetto", shortDescription: "Logo, colori e vetrina", tabs: ["aspetto"] },
  { id: "dispositivi", label: "Dispositivi", shortDescription: "Smartphone e accessi", tabs: ["dispositivi"] },
];

// Fidelity e buoni compaiono solo se almeno una di queste espansioni e' attiva dal Portale; altrimenti
// l'editor dei biglietti da visita resta sotto "Aspetto".
function costruisciGruppi(isAddonActive: (id: any) => boolean): GruppoImpostazioni[] {
  const loyalty = isAddonActive(TAAAAC_ADDONS.LOYALTY_CARD);
  const buoni = isAddonActive(TAAAAC_ADDONS.GIFT_CARDS);
  const fidelityAttivo = loyalty || buoni;
  const risultato: GruppoImpostazioni[] = [];
  for (const g of GRUPPI_BASE) {
    let tabs = [...g.tabs];
    let label = g.label;
    if (g.id === "fidelity") {
      if (!fidelityAttivo) continue;
      tabs = tabs.filter((t) => (t === "fidelity" ? loyalty : true));
      label = loyalty && buoni ? "Fidelity e buoni" : loyalty ? "Fidelity" : "Buoni e biglietti";
    }
    if (g.id === "aspetto" && !fidelityAttivo) tabs.push("carta-grafica");
    const prima = TABS.find((t) => t.id === tabs[0]);
    risultato.push({
      id: g.id,
      label,
      shortDescription: g.shortDescription,
      iconComponent: prima?.iconComponent || Settings,
      tabs,
    });
  }
  return risultato;
}

export default function BarberlyImpostazioniPage() {
  const { isAddonActive } = useTenantConfig();
  const gruppi = costruisciGruppi(isAddonActive);
  const [activeGroup, setActiveGroup] = useState<string>("attivita");
  const gruppoAttivo = gruppi.find((g) => g.id === activeGroup) || gruppi[0];
  const inGruppo = (t: SettingsTab) => gruppoAttivo.tabs.includes(t);
  const titoloSezione = (t: SettingsTab) =>
    gruppoAttivo.tabs.length > 1 ? (
      <h2 className="text-base font-semibold text-slate-900 pt-2">{TABS.find((x) => x.id === t)?.label}</h2>
    ) : null;
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // Telegram & Fidelity State
  const [telegramHub, setTelegramHub] = useState<TelegramHubData | null>(null);

  const [fidelitySettings, setFidelitySettings] = useState<FidelitySettingsData>({
    enabled: false,
    pointsPerEuro: 1,
    welcomeBonusPoints: 10,
    minPointsToRedeem: 40,
    rewards: [],
  });

  // Form State
  const [form, setForm] = useState({
    nomeBottega: "Gentleman Barber Club",
    titolare: "Marco Guidelli",
    indirizzo: "Via Roma, 42 - 52100 Arezzo (AR)",
    descrizione: "",
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

  // Orari ufficiali (sola lettura: si modificano nella pagina Orari)
  const [orariVeri, setOrariVeri] = useState<
    Array<{ giorno: number; oraInizio: string; oraFine: string; pausaInizio: string | null; pausaFine: string | null; attivo: boolean }>
  >([]);
  useEffect(() => {
    fetch("/api/orari")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setOrariVeri(d);
      })
      .catch(() => {});
  }, []);

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
            indirizzo: data.address || f.indirizzo,
            descrizione: data.descrizione !== undefined ? data.descrizione : f.descrizione,
          }));
          if (data?.telegramHub) setTelegramHub(data.telegramHub);
          if (data.fidelitySettings) setFidelitySettings(data.fidelitySettings);
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
          // Dati dell'attivita' (colori e logo si gestiscono solo in Aspetto & Brand)
          brandName: form.nomeBottega,
          contactEmail: form.emailBottega,
          phone: form.telefono,
          address: form.indirizzo,
          descrizione: form.descrizione,
          fidelitySettings,
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

  const ActiveIcon = gruppoAttivo.iconComponent;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 lg:pb-12">
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

        {!gruppoAttivo.tabs.every((t) => t === "aspetto") && (
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="hidden lg:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-xs shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
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
        )}
      </div>

      {!gruppoAttivo.tabs.every((t) => t === "aspetto") && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-slate-950/95 border-t border-slate-800">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl disabled:opacity-60"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </div>
      )}

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

      {/* LAYOUT A 2 COLONNE: NAVIGAZIONE VERTICALE A SINISTRA + CONTENUTI A DESTRA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNA SINISTRA: MENU SEZIONI IMPOSTAZIONI */}
        <aside className="lg:col-span-4 xl:col-span-3 sticky top-14 lg:top-6 z-30 space-y-3">
          {/* Selettore Dropdown Compatto per Mobile (< lg) */}
          <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-sm">
            <label htmlFor="settings-tab-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
              Sezione Attiva
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                <ActiveIcon className="w-4 h-4" />
              </div>
              <select
                id="settings-tab-select"
                value={gruppoAttivo.id}
                onChange={(e) => setActiveGroup(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
              >
                {gruppi.map((tab) => (
                  <option key={tab.id} value={tab.id} className="bg-slate-900 text-white py-1">
                    {tab.label} — {tab.shortDescription}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Barra di Navigazione Verticale Completa per Desktop (>= lg) */}
          <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xs">
            <div className="px-3 py-2 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Sezioni Impostazioni
              </span>
            </div>

            <nav
              className="flex flex-col gap-1.5 pt-2"
              aria-label="Sezioni Impostazioni Barberly"
            >
              {gruppi.map((tab) => {
                const isActive = gruppoAttivo.id === tab.id;
                const IconComp = tab.iconComponent;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveGroup(tab.id)}
                    className={`group flex items-center justify-between w-full p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/40 shadow-xs"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/30"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                          <span>{tab.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal truncate">
                          {tab.shortDescription}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? "text-amber-400 translate-x-0.5"
                          : "text-slate-600 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* COLONNA DESTRA: PANNELLO CONTENUTI */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">

      {/* CONTENUTO SCHEDE */}

      {/* TAB 1: BOTTEGA & SEDE */}
      {inGruppo("bottega") && titoloSezione("bottega")}
      {inGruppo("bottega") && (
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

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Descrizione dell&apos;attività</label>
            <textarea
              rows={4}
              value={form.descrizione}
              onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
              placeholder="Racconta in poche righe chi siete e cosa vi rende speciali"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nome, indirizzo, telefono, email e descrizione si modificano solo qui: la vetrina li legge da questa scheda
              (in &quot;Aspetto &amp; Brand&quot; scegli quali mostrare). Gli orari si impostano nella pagina Orari; colori e logo in &quot;Aspetto &amp; Brand&quot;.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: ORARI & TURNI */}
      {inGruppo("orari") && titoloSezione("orari")}
      {inGruppo("orari") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="text-xs text-slate-300 space-y-3">
            <p className="leading-relaxed">
              Questi sono gli <strong className="text-white">orari ufficiali</strong> della bottega: li trovi nella vetrina, nel piè di pagina e
              vengono inviati a Google, Facebook e Instagram. Per modificarli vai alla pagina{" "}
              <a href="/dashboard/orari" className="text-amber-400 font-semibold underline">Orari</a>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 0].map((g) => {
                const o = orariVeri.find((x) => x.giorno === g);
                const nome = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"][g];
                const attivo = Boolean(o?.attivo);
                const testo = !o
                  ? "…"
                  : !attivo
                  ? "Chiuso"
                  : o.pausaInizio && o.pausaFine && o.pausaInizio < o.pausaFine
                  ? `${o.oraInizio} - ${o.pausaInizio} / ${o.pausaFine} - ${o.oraFine}`
                  : `${o.oraInizio} - ${o.oraFine}`;
                return (
                  <div key={g} className={`p-4 rounded-xl border ${attivo ? "bg-slate-800/90 border-slate-700/80" : "bg-slate-950/60 border-slate-800 text-slate-500"}`}>
                    <span className="font-bold text-white block text-sm">{nome}</span>
                    <span className={`font-mono text-xs block mt-1.5 ${attivo ? "text-amber-400" : "text-slate-500"}`}>{testo}</span>
                  </div>
                );
              })}
            </div>
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
      {inGruppo("email") && titoloSezione("email")}
      {inGruppo("email") && (
        <div className="space-y-4">
          <EmailSettingsCard />
        </div>
      )}

      {/* TAB 4: WHATSAPP & SMS */}
      {inGruppo("whatsapp") && titoloSezione("whatsapp")}
      {inGruppo("whatsapp") && (
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
              onChange={(e) => {
                const nextVal = e.target.checked;
                setForm({ ...form, whatsappAbilitato: nextVal });
                fetch("/api/impostazioni", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ whatsappAbilitato: nextVal }),
                }).catch(() => {});
              }}
              className="shrink-0 w-5 h-5 accent-amber-500 rounded cursor-pointer"
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

      {/* TAB: TELEGRAM HUB & STAFF */}
      {inGruppo("telegram") && titoloSezione("telegram")}
      {inGruppo("telegram") && (
        <div className="space-y-6">
          <TelegramHubCard hub={telegramHub} />
        </div>
      )}

      {/* TAB: FIDELITY & PUNTI */}
      {inGruppo("fidelity") && titoloSezione("fidelity")}
      {inGruppo("fidelity") && (
        <div className="space-y-6">
          <FidelitySettingsPanel
            data={fidelitySettings}
            onChange={(updated) => {
              const toggled =
                updated.enabled !== fidelitySettings.enabled ||
                Boolean(updated.compleanno?.enabled) !== Boolean(fidelitySettings.compleanno?.enabled) ||
                (updated.rewards?.length || 0) !== (fidelitySettings.rewards?.length || 0);
              setFidelitySettings(updated);
              if (toggled) {
                fetch("/api/impostazioni", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fidelitySettings: updated }),
                }).catch(() => {});
              }
            }}
          />
        </div>
      )}

      {/* TAB: DISPOSITIVI PWA & BIOMETRIA */}
      {inGruppo("dispositivi") && titoloSezione("dispositivi")}
      {inGruppo("dispositivi") && (
        <div className="space-y-6">
          <RegisteredDevicesCard />
        </div>
      )}

      {/* TAB 5: ASPETTO & BRAND (SHOWCASE VISUAL STUDIO) */}
      {inGruppo("aspetto") && titoloSezione("aspetto")}
      {inGruppo("aspetto") && (
        <ShowcaseVisualStudio />
      )}
      {inGruppo("carta-grafica") && titoloSezione("carta-grafica")}
      {inGruppo("carta-grafica") && (
        <div className="space-y-6">
          <EditorCartaGrafica />
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
