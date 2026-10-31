"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShowcaseConfig,
  DEFAULT_BARBERLY_SHOWCASE_CONFIG,
  DEFAULT_BARBERLY_CONTACT_INFO,
  GalleryPhotoItem,
} from "@/lib/showcase-defaults";
import {
  Sparkles,
  Smartphone,
  Monitor,
  Save,
  RotateCcw,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Type,
  Palette,
  Eye,
  Sliders,
  Plus,
  Trash2,
  Upload,
  Star,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  Phone,
  Scissors,
  ArrowRight,
  Quote,
} from "lucide-react";

type ControlTab = "hero" | "media" | "colori" | "chisiamo" | "contatti" | "sezioni" | "badges";

export default function ShowcaseVisualStudio() {
  const [config, setConfig] = useState<ShowcaseConfig>(DEFAULT_BARBERLY_SHOWCASE_CONFIG);
  const [activeControlTab, setActiveControlTab] = useState<ControlTab>("hero");
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imageProcessing, setImageProcessing] = useState<string | null>(null);

  // File Inputs Refs
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const aboutImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/impostazioni/vetrina")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setConfig(data);
        }
      })
      .catch((err) => console.error("Errore fetch vetrina:", err))
      .finally(() => setLoading(false));
  }, []);

  // Utility di compressione WebP lato client
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
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: "error", text: "L'immagine supera i 10MB. Seleziona un file più leggero." });
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
        const dataUrl = canvas.toDataURL(format, format === "image/webp" ? 0.88 : undefined);
        callback(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/impostazioni/vetrina", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setFeedback({ type: "success", text: "Vetrina pubblica aggiornata con successo!" });
      } else {
        setFeedback({ type: "error", text: "Errore durante il salvataggio della vetrina." });
      }
    } catch {
      setFeedback({ type: "error", text: "Errore di connessione." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Vuoi ripristinare i testi e la grafica predefinita di Barberly?")) {
      setConfig({ ...DEFAULT_BARBERLY_SHOWCASE_CONFIG });
      setFeedback({ type: "success", text: "Valori predefiniti ripristinati. Clicca Salva per confermare." });
    }
  };

  const addGalleryImage = (dataUrl: string) => {
    const newImg: GalleryPhotoItem = {
      id: `img_${Date.now()}`,
      url: dataUrl,
      caption: "Nuova foto della bottega",
    };
    setConfig((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: [...prev.gallery.images, newImg],
      },
    }));
  };

  const removeGalleryImage = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: prev.gallery.images.filter((img) => img.id !== id),
      },
    }));
  };

  const updateGalleryCaption = (id: string, caption: string) => {
    setConfig((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: prev.gallery.images.map((img) => (img.id === id ? { ...img, caption } : img)),
      },
    }));
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Caricamento Showcase Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra Azioni & Toolbar Superiore */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-0.5">
            <span>✨ Showcase Visual Studio</span>
            <span>•</span>
            <span>Live Customizer</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>Editor Vetrina Interattivo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modifica testi, banner fotografico, galleria e sezioni con anteprima in tempo reale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selettore Device Desktop / Mobile */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === "mobile"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Visualizza formato Smartphone (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === "desktop"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Visualizza formato Desktop a tutto schermo"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>

          {/* Reset ai Default */}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Ripristina testi e immagini di fabbrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Default</span>
          </button>

          {/* Link Esterno Vetrina Reale */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5"
            title="Apri la vetrina reale in una nuova scheda"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vedi Sito</span>
          </a>

          {/* Salva Modifiche */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salva Vetrina</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
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
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* STRUTTURA SPLIT-SCREEN (CONTROLLI A SINISTRA / LIVE SIMULATOR A DESTRA) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* PANNELLO SINISTRO: CONTROLLI DELL'ESERCENTE */}
        <div className="xl:col-span-5 space-y-4">
          {/* Schede Categorie Controlli */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1.5 shadow-xs">
            {[
              { id: "hero", label: "Hero & Copy", icon: Type },
              { id: "media", label: "Media & Foto", icon: ImageIcon },
              { id: "colori", label: "Colori", icon: Palette },
              { id: "chisiamo", label: "Chi Siamo", icon: Quote },
              { id: "contatti", label: "Orari & Bottega", icon: MapPin },
              { id: "sezioni", label: "Sezioni", icon: Eye },
              { id: "badges", label: "Badges", icon: Award },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeControlTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveControlTab(tab.id as ControlTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* CONTENUTO SCHEDA CONTROLLI ATTIVA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            {/* 1. HERO & COPY */}
            {activeControlTab === "hero" && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-amber-400" />
                    <span>Testi & Call-to-Action Hero</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    La prima schermata vista dai clienti all&apos;apertura della vetrina.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Badge Promozionale Top</label>
                  <input
                    type="text"
                    value={config.hero.badgeText}
                    onChange={(e) =>
                      setConfig({ ...config, hero: { ...config.hero, badgeText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    placeholder="es. Grooming Club Tradizionale • Dal 2018"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Titolo Principale Hero</label>
                  <textarea
                    rows={2}
                    value={config.hero.title}
                    onChange={(e) =>
                      setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                    placeholder="es. Tagli Sartoriali & Rasatura a Regola d'Arte"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Sottotitolo / Descrizione Claim</label>
                  <textarea
                    rows={3}
                    value={config.hero.subtitle}
                    onChange={(e) =>
                      setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                    placeholder="Descrivi brevemente l'atmosfera o il valore unico del tuo salone..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Pulsante Principale (CTA 1)</label>
                    <input
                      type="text"
                      value={config.hero.ctaPrimaryText}
                      onChange={(e) =>
                        setConfig({ ...config, hero: { ...config.hero, ctaPrimaryText: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="es. Prenota il Tuo Taglio"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Pulsante Secondario (CTA 2)</label>
                    <input
                      type="text"
                      value={config.hero.ctaSecondaryText}
                      onChange={(e) =>
                        setConfig({ ...config, hero: { ...config.hero, ctaSecondaryText: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="es. I Nostri Servizi"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. MEDIA & IMMAGINI (COVER HERO & GALLERIA) */}
            {activeControlTab === "media" && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Banner Copertina & Galleria Vetrina</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Immagini compresse automaticamente in formato WebP ultraleggero.
                  </p>
                </div>

                {/* FOTO COPERTINA HERO */}
                <div className="space-y-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Foto Copertina Hero (Banner)</h4>
                      <p className="text-[10px] text-slate-400">Sfondo d&apos;impatto della schermata iniziale.</p>
                    </div>
                    {config.hero.coverImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfig({ ...config, hero: { ...config.hero, coverImageUrl: null } })
                        }
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded border border-rose-800"
                      >
                        Rimuovi Cover
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageProcessing("cover");
                        processImageFile(file, 1280, "image/webp", (dataUrl) => {
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, coverImageUrl: dataUrl },
                          }));
                          setImageProcessing(null);
                        });
                      }
                    }}
                  />

                  {config.hero.coverImageUrl ? (
                    <div className="relative rounded-xl overflow-hidden h-28 border border-slate-700 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.hero.coverImageUrl}
                        alt="Hero Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/70 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Cambia Copertina</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition"
                    >
                      <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <div className="text-xs text-slate-300 font-semibold">Carica Foto Copertina Hero</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG o WebP (max 1280px)</p>
                    </button>
                  )}

                  {imageProcessing === "cover" && (
                    <div className="text-xs text-amber-400 animate-pulse text-center">
                      Ottimizzazione immagine cover in corso...
                    </div>
                  )}

                  {/* Slider Opacità Overlay */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Opacità Scurimento Sfondo</span>
                      <span className="text-amber-400 font-mono">{config.hero.overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={config.hero.overlayOpacity}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          hero: { ...config.hero, overlayOpacity: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Aumenta l&apos;opacità per rendere il testo bianco perfettamente leggibile sopra la foto.
                    </p>
                  </div>
                </div>

                {/* GALLERIA FOTOGRAFICA BOTTEGA */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Galleria Fotografica Salone</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {config.gallery.images.length} foto
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Scatti dei tagli, poltrone e atmosfera.</p>
                    </div>

                    <input
                      type="file"
                      ref={galleryInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageProcessing("gallery");
                          processImageFile(file, 800, "image/webp", (dataUrl) => {
                            addGalleryImage(dataUrl);
                            setImageProcessing(null);
                          });
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Aggiungi Foto</span>
                    </button>
                  </div>

                  {imageProcessing === "gallery" && (
                    <div className="text-xs text-amber-400 animate-pulse text-center">
                      Compressione foto galleria in corso...
                    </div>
                  )}

                  {/* Griglia Foto Esistenti */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {config.gallery.images.map((img) => (
                      <div
                        key={img.id}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 relative group space-y-1.5"
                      >
                        <div className="h-20 rounded-lg overflow-hidden bg-slate-900 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.caption || "Foto"} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(img.id)}
                            className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white hover:bg-rose-600 transition"
                            title="Rimuovi foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={img.caption || ""}
                          onChange={(e) => updateGalleryCaption(img.id, e.target.value)}
                          placeholder="Didascalia foto..."
                          className="w-full px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. COLORI & BRAND */}
            {activeControlTab === "colori" && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Palette & Colori Vetrina</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Personalizza il colore primario e l&apos;accento luminoso di bottega.
                  </p>
                </div>

                {/* LOGO BOTTEGA & FAVICON PWA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                  {/* LOGO */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Logo Ufficiale Bottega
                      </label>
                      {config.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logoUrl: null })}
                          className="text-[11px] text-rose-400 hover:underline font-semibold cursor-pointer"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageProcessing("logo");
                          processImageFile(file, 512, "image/webp", (dataUrl) => {
                            setConfig((prev) => ({ ...prev, logoUrl: dataUrl }));
                            setImageProcessing(null);
                          });
                        }
                      }}
                    />
                    {config.logoUrl ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-14 h-14 rounded-lg bg-slate-950 flex items-center justify-center p-1 border border-slate-800 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={config.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">Logo Personalizzato</div>
                          <p className="text-[10px] text-amber-400 font-medium">Attivo su vetrina e navbar</p>
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="mt-1 text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Cambia Logo</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900 hover:bg-slate-850 transition"
                      >
                        <Upload className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <div className="text-xs text-slate-200 font-semibold">Carica Logo Bottega</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">PNG o WebP trasparente (max 512px)</p>
                      </button>
                    )}
                    {imageProcessing === "logo" && (
                      <div className="text-xs text-amber-400 animate-pulse text-center">Ottimizzazione logo in corso...</div>
                    )}
                  </div>

                  {/* FAVICON & ICONA PWA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Favicon &amp; Icona App (PWA)
                      </label>
                      {config.faviconUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, faviconUrl: null })}
                          className="text-[11px] text-rose-400 hover:underline font-semibold cursor-pointer"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageProcessing("favicon");
                          processImageFile(file, 128, "image/png", (dataUrl) => {
                            setConfig((prev) => ({ ...prev, faviconUrl: dataUrl }));
                            setImageProcessing(null);
                          });
                        }
                      }}
                    />
                    {config.faviconUrl ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center p-1 border border-slate-800 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={config.faviconUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">Icona Browser &amp; PWA</div>
                          <p className="text-[10px] text-amber-400 font-medium">Formato 128x128 PNG HD</p>
                          <button
                            type="button"
                            onClick={() => faviconInputRef.current?.click()}
                            className="mt-1 text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Cambia Favicon</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900 hover:bg-slate-850 transition"
                      >
                        <Upload className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <div className="text-xs text-slate-200 font-semibold">Carica Favicon / Icona App</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Quadrata, PNG o ICO (128x128 px)</p>
                      </button>
                    )}
                    {imageProcessing === "favicon" && (
                      <div className="text-xs text-amber-400 animate-pulse text-center">Ottimizzazione favicon in corso...</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Colore Sfondo Primario</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-xs text-slate-300 font-bold">{config.primaryColor}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Colore Accento (Tasti & Badge)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-xs text-amber-400 font-bold">{config.accentColor}</span>
                    </div>
                  </div>
                </div>

                {/* Presets Colori Consigliati per Barber Shop */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Palette Consigliate per Barber Shop
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: "Oro & Ardesia", primary: "#0f172a", accent: "#d97706" },
                      { name: "Ambra Notte", primary: "#020617", accent: "#f59e0b" },
                      { name: "Bronzo Sartoriale", primary: "#18181b", accent: "#b45309" },
                      { name: "Smeraldo Vintage", primary: "#0f172a", accent: "#10b981" },
                      { name: "Blu Reale", primary: "#0b132b", accent: "#3b82f6" },
                      { name: "Rosso Barber Pole", primary: "#1c1917", accent: "#ef4444" },
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            primaryColor: p.primary,
                            accentColor: p.accent,
                          })
                        }
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center -space-x-1 shrink-0">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900"
                            style={{ backgroundColor: p.accent }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-200 font-medium truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. CHI SIAMO & STORIA */}
            {activeControlTab === "chisiamo" && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-4 h-4 text-amber-400" />
                    <span>Sezione Chi Siamo & Bottega</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Racconta la filosofia, l&apos;esperienza e la storia del tuo salone.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Titolo Sezione</label>
                  <input
                    type="text"
                    value={config.about.title}
                    onChange={(e) =>
                      setConfig({ ...config, about: { ...config.about, title: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    placeholder="es. La Nostra Bottega"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Sottotitolo / Filosofia</label>
                  <input
                    type="text"
                    value={config.about.subtitle}
                    onChange={(e) =>
                      setConfig({ ...config, about: { ...config.about, subtitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    placeholder="es. Tradizione, Passione & Cura Artigianale"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Storia e Descrizione</label>
                  <textarea
                    rows={4}
                    value={config.about.description}
                    onChange={(e) =>
                      setConfig({ ...config, about: { ...config.about, description: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                    placeholder="Racconta ai clienti la storia del locale..."
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Citazione Master Barber</label>
                    <input
                      type="text"
                      value={config.about.quoteText || ""}
                      onChange={(e) =>
                        setConfig({ ...config, about: { ...config.about, quoteText: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="es. Il taglio perfetto non è quello che segue una moda..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Autore Citazione</label>
                    <input
                      type="text"
                      value={config.about.quoteAuthor || ""}
                      onChange={(e) =>
                        setConfig({ ...config, about: { ...config.about, quoteAuthor: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="es. Marco Guidelli — Master Barber"
                    />
                  </div>
                </div>
              </div>
            )}

                        {/* CONTATTI, ORARI & BOTTEGA */}
            {activeControlTab === "contatti" && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Orari di Bottega, Posizione & Recapiti</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modifica tutti i dati di contatto, orari e claim visibili nel footer e nella vetrina pubblica.
                  </p>
                </div>

                {/* Claim e Garanzia */}
                <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Descrizioni & Claim Footer
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Claim Principale di Bottega</label>
                      <textarea
                        rows={2}
                        value={config.contactInfo?.brandClaim || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), brandClaim: e.target.value },
                          })
                        }
                        placeholder="Il punto di riferimento per il grooming maschile..."
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Testo Garanzia & Qualità</label>
                      <textarea
                        rows={2}
                        value={config.contactInfo?.guaranteeText || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), guaranteeText: e.target.value },
                          })
                        }
                        placeholder="Tagli su misura, cura della barba e rituali di benessere..."
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Orari di Bottega */}
                <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Orari di Apertura</span>
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Orari Feriali (Mar - Ven)</label>
                      <input
                        type="text"
                        value={config.contactInfo?.hoursWeekday || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), hoursWeekday: e.target.value },
                          })
                        }
                        placeholder="Martedì – Venerdì: 09:00 – 13:00 / 14:30 – 19:30"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Orari Weekend (Sabato)</label>
                      <input
                        type="text"
                        value={config.contactInfo?.hoursWeekend || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), hoursWeekend: e.target.value },
                          })
                        }
                        placeholder="Sabato: 08:30 – 19:00 (Continuato)"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Note Chiusura & Appuntamenti</label>
                      <input
                        type="text"
                        value={config.contactInfo?.hoursNote || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), hoursNote: e.target.value },
                          })
                        }
                        placeholder="Lunedì e Domenica: Chiuso • Si riceve su appuntamento"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Posizione & Indirizzo */}
                <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sede & Recapiti</span>
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Indirizzo Completo</label>
                      <input
                        type="text"
                        value={config.contactInfo?.address || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), address: e.target.value },
                          })
                        }
                        placeholder="Via Roma, 42 — Milano (MI)"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Telefono / WhatsApp</label>
                      <input
                        type="text"
                        value={config.contactInfo?.phone || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), phone: e.target.value },
                          })
                        }
                        placeholder="+39 02 1234567"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Email di Contatto</label>
                      <input
                        type="email"
                        value={config.contactInfo?.email || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            contactInfo: { ...(config.contactInfo || DEFAULT_BARBERLY_CONTACT_INFO), email: e.target.value },
                          })
                        }
                        placeholder="info@gentlemanbarber.it"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. VISIBILITÀ SEZIONI */}
            {activeControlTab === "sezioni" && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Visibilità Sezioni Vetrina</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Attiva o disattiva i singoli blocchi della homepage pubblica.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { key: "showHero", label: "Schermata Hero Principale", desc: "Copertina, claim e tasto di prenotazione" },
                    { key: "showTrustBadges", label: "Badges di Affidabilità", desc: "Voti recensioni, prodotti premium, master" },
                    { key: "showServices", label: "Listino Servizi & Prezzi", desc: "Griglia trattamenti attivi dal DB" },
                    { key: "showBarbers", label: "Maestri Barbieri", desc: "Staff e poltrone della bottega" },
                    { key: "showGallery", label: "Galleria Fotografica", desc: "Foto e atmosfera del salone" },
                    { key: "showAbout", label: "Chi Siamo & Storia", desc: "Filosofia e citazione del fondatore" },
                    { key: "showHours", label: "Orari di Apertura", desc: "Fasce orarie e turni di lavoro" },
                    { key: "showContact", label: "Dove Trovarci & Mappa", desc: "Indirizzo, telefono e mappa bottega" },
                  ].map((sec) => (
                    <div
                      key={sec.key}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{sec.label}</span>
                        <span className="text-[10px] text-slate-400">{sec.desc}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.sections[sec.key as keyof typeof config.sections]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              sections: {
                                ...config.sections,
                                [sec.key]: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TRUST BADGES */}
            {activeControlTab === "badges" && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Badges di Fiducia (Trust Signals)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Punti di forza mostrati subito sotto la schermata Hero.
                  </p>
                </div>

                <div className="space-y-3">
                  {config.trustBadges.map((badge, idx) => (
                    <div key={badge.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">Badge #{idx + 1}</span>
                        <select
                          value={badge.icon}
                          onChange={(e) => {
                            const newBadges = [...config.trustBadges];
                            newBadges[idx] = { ...badge, icon: e.target.value as any };
                            setConfig({ ...config, trustBadges: newBadges });
                          }}
                          className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1"
                        >
                          <option value="star">⭐ Stella Recensioni</option>
                          <option value="shield">🛡️ Scudo / Garanzia</option>
                          <option value="award">🏆 Premio / Master</option>
                          <option value="clock">⏱️ Orologio / Puntualità</option>
                          <option value="check">✔️ Check / Certificato</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={badge.text}
                        onChange={(e) => {
                          const newBadges = [...config.trustBadges];
                          newBadges[idx] = { ...badge, text: e.target.value };
                          setConfig({ ...config, trustBadges: newBadges });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        placeholder="Testo del badge..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANNELLO DESTRO: LIVE DEVICE SIMULATOR IN TEMPO REALE */}
        <div className="xl:col-span-7 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>📱 Simulatore Live Vetrina Pubblica</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                In Tempo Reale
              </span>
            </span>
            <span className="text-[11px] text-slate-500">
              {deviceMode === "mobile" ? "Formato iPhone / Pixel (390px)" : "Formato Schermo Intero"}
            </span>
          </div>

          {/* SIMULATORE DISPOSITIVO */}
          <div
            className={`mx-auto transition-all duration-300 ${
              deviceMode === "mobile"
                ? "max-w-[400px] rounded-[44px] p-3 bg-slate-950 border-[6px] border-slate-800 shadow-2xl shadow-black/80 ring-1 ring-slate-700/60"
                : "w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden"
            }`}
          >
            {/* Dynamic Island / Notch su Mobile */}
            {deviceMode === "mobile" && (
              <div className="h-6 flex items-center justify-between px-6 mb-1 text-[10px] text-slate-400 select-none">
                <span className="font-bold text-white">09:41</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full border border-slate-800/80 mx-auto" />
                <span className="font-mono">5G 100%</span>
              </div>
            )}

            {/* CORPO DELLA VETRINA PUBBLICA DINAMICA (SCROLLABILE) */}
            <div
              className={`bg-slate-950 text-slate-100 overflow-y-auto no-scrollbar rounded-[32px] font-sans ${
                deviceMode === "mobile" ? "max-h-[700px] min-h-[580px]" : "max-h-[760px] min-h-[580px]"
              }`}
            >
              {/* Header / Navbar Live */}
              <nav className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {config.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.logoUrl} alt="Logo" className="h-7 max-w-[120px] object-contain rounded" />
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black text-slate-950"
                        style={{ backgroundColor: config.accentColor }}
                      >
                        ✂️
                      </span>
                      <span className="truncate">{config.brandName}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: config.accentColor }}
                    className="text-[11px] font-bold text-slate-950 px-3 py-1 rounded-full shadow-xs cursor-default"
                  >
                    Prenota
                  </span>
                </div>
              </nav>

              {/* 1. SEZIONE HERO */}
              {config.sections.showHero && (
                <section className="relative overflow-hidden py-10 sm:py-14 px-4 text-center space-y-4">
                  {/* Foto Copertina & Overlay */}
                  {config.hero.coverImageUrl ? (
                    <div className="absolute inset-0 z-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.hero.coverImageUrl}
                        alt="Hero Cover"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-slate-950"
                        style={{ opacity: config.hero.overlayOpacity / 100 }}
                      />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        background: `radial-gradient(circle at top, ${config.accentColor}22 0%, #0f172a 100%)`,
                      }}
                    />
                  )}

                  <div className="relative z-10 space-y-3 max-w-lg mx-auto">
                    {config.hero.badgeText && (
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: `${config.accentColor}18`,
                          borderColor: `${config.accentColor}40`,
                          color: config.accentColor,
                        }}
                      >
                        <Flame className="w-3 h-3" />
                        <span>{config.hero.badgeText}</span>
                      </div>
                    )}

                    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                      {config.hero.title}
                    </h1>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                      {config.hero.subtitle}
                    </p>

                    {/* Bottoni CTA */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <span
                        style={{ backgroundColor: config.accentColor }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 shadow-md inline-flex items-center justify-center gap-1.5 cursor-default"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>{config.hero.ctaPrimaryText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      {config.hero.ctaSecondaryText && (
                        <span className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 inline-flex items-center justify-center cursor-default">
                          {config.hero.ctaSecondaryText}
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* 2. TRUST BADGES */}
              {config.sections.showTrustBadges && (
                <div className="bg-slate-900/90 border-y border-slate-800 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-300">
                    {config.trustBadges.map((tb) => (
                      <span
                        key={tb.id}
                        className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        {tb.icon === "star" && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                        {tb.icon === "shield" && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                        {tb.icon === "award" && <Award className="w-3 h-3 text-amber-400" />}
                        {tb.icon === "clock" && <Clock className="w-3 h-3 text-blue-400" />}
                        {tb.icon === "check" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>{tb.text}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. LISTINO SERVIZI ANTEPRIMA */}
              {config.sections.showServices && (
                <section className="p-4 space-y-3 border-b border-slate-900">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-bold text-white">{config.customLabels.servicesTitle}</h3>
                    <p className="text-[10px] text-slate-400">{config.customLabels.servicesSubtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Taglio Sartoriale & Styling", time: "35 min", price: "€28.00" },
                      { name: "Rituale Barba Tradizionale", time: "25 min", price: "€20.00" },
                      { name: "Combo VIP (Taglio + Barba)", time: "60 min", price: "€44.00" },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {s.time}
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-md text-slate-950"
                          style={{ backgroundColor: config.accentColor }}
                        >
                          {s.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. GALLERIA FOTOGRAFICA VETRINA */}
              {config.sections.showGallery && config.gallery.images.length > 0 && (
                <section className="p-4 space-y-3 bg-slate-900/50 border-b border-slate-900">
                  <div className="text-center space-y-0.5">
                    <h3 className="text-sm font-bold text-white">{config.gallery.title}</h3>
                    <p className="text-[10px] text-slate-400">{config.gallery.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {config.gallery.images.slice(0, 4).map((img) => (
                      <div key={img.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.caption || "Salone"} className="w-full h-24 object-cover" />
                        {img.caption && (
                          <div className="p-1.5 text-[9px] text-slate-400 truncate bg-slate-950/90">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. CHI SIAMO & BOTTEGA */}
              {config.sections.showAbout && (
                <section className="p-5 text-center space-y-3 bg-slate-900 border-b border-slate-800">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: config.accentColor }}
                  >
                    {config.about.subtitle}
                  </span>
                  <h3 className="text-sm font-black text-white">{config.about.title}</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed max-w-sm mx-auto">
                    {config.about.description}
                  </p>
                  {config.about.quoteText && (
                    <blockquote className="p-3 rounded-xl bg-slate-950 border border-slate-800 italic text-[10px] text-slate-400 space-y-1">
                      <p>&ldquo;{config.about.quoteText}&rdquo;</p>
                      {config.about.quoteAuthor && (
                        <footer className="text-amber-400 font-bold not-italic text-[9px]">
                          — {config.about.quoteAuthor}
                        </footer>
                      )}
                    </blockquote>
                  )}
                </section>
              )}

              {/* 6. ORARI & DOVE SIAMO */}
              {config.sections.showHours && (
                <footer className="p-4 bg-slate-950 text-center space-y-2 text-[10px] text-slate-400">
                  <div className="flex items-center justify-center gap-1 text-slate-300 font-semibold">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{config.contactInfo?.address || "Via Roma, 42 — Milano (MI)"} • Tel. {config.contactInfo?.phone || "+39 02 1234567"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{config.contactInfo?.hoursWeekday || "Mar - Ven: 09:00 - 19:30"} • {config.contactInfo?.hoursWeekend || "Sab: 08:30 - 19:00"}</span>
                  </div>
                  <p className="text-[9px] text-slate-600 pt-2 border-t border-slate-900">
                    Powered by Taaaac Suite • Barberly Grooming
                  </p>
                </footer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
