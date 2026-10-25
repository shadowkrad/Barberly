"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Save,
  Copy,
  Check,
  AlertCircle,
  Globe,
  Share2,
  MessageCircle,
  Star,
  RefreshCw,
  Sparkles,
  Calendar,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const GIORNI_SETTIMANA = [
  { nome: "Lunedì", giorno: 1, key: "MONDAY" },
  { nome: "Martedì", giorno: 2, key: "TUESDAY" },
  { nome: "Mercoledì", giorno: 3, key: "WEDNESDAY" },
  { nome: "Giovedì", giorno: 4, key: "THURSDAY" },
  { nome: "Venerdì", giorno: 5, key: "FRIDAY" },
  { nome: "Sabato", giorno: 6, key: "SATURDAY" },
  { nome: "Domenica", giorno: 0, key: "SUNDAY" },
] as const;

interface Disponibilita {
  id?: string;
  giorno: number;
  oraInizio: string;
  oraFine: string;
  pausaInizio?: string | null;
  pausaFine?: string | null;
  attivo: boolean;
}

interface ChannelStatus {
  ok: boolean;
  channels?: {
    google?: { enabled: boolean; status: string; lastSyncAt?: string | null };
    meta?: { enabled: boolean; status: string; lastSyncAt?: string | null };
    whatsapp?: { enabled: boolean; displayNumber?: string | null };
    reviewBooster?: { enabled: boolean; totalSent: number; googleUrl?: string | null };
  };
  lastOmnichannelSyncAt?: string | null;
}

interface EccezioneCalendario {
  id: string;
  data: string;
  tipo: "CHIUSURA" | "APERTURA_STRAORDINARIA" | "ORARIO_SPECIALE";
  titolo: string;
  oraInizio?: string | null;
  oraFine?: string | null;
  pausaInizio?: string | null;
  pausaFine?: string | null;
  note?: string | null;
}

interface FestivitaNazionale {
  data: string;
  nome: string;
}

export default function BarberlyOrariPage() {
  const [activeTab, setActiveTab] = useState<"settimanali" | "festivita">("settimanali");

  // Orari settimanali
  const [orari, setOrari] = useState<Disponibilita[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Festività & Eccezioni
  const [eccezioni, setEccezioni] = useState<EccezioneCalendario[]>([]);
  const [festivitaNazionali, setFestivitaNazionali] = useState<FestivitaNazionale[]>([]);
  const [rispettaFestivita, setRispettaFestivita] = useState(true);
  const [savingFestivita, setSavingFestivita] = useState(false);

  // Modal Nuova Eccezione
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTipo, setNewTipo] = useState<"CHIUSURA" | "APERTURA_STRAORDINARIA" | "ORARIO_SPECIALE">("APERTURA_STRAORDINARIA");
  const [newTitolo, setNewTitolo] = useState("");
  const [newOraInizio, setNewOraInizio] = useState("09:00");
  const [newOraFine, setNewOraFine] = useState("19:30");
  const [newPausaInizio, setNewPausaInizio] = useState("");
  const [newPausaFine, setNewPausaFine] = useState("");
  const [newNote, setNewNote] = useState("");
  const [submittingEcc, setSubmittingEcc] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "festivita") {
        setActiveTab("festivita");
      }
    }

    Promise.all([
      fetch("/api/orari").then((r) => r.json()),
      fetch("/api/sync/channels").then((r) => r.json()).catch(() => null),
      fetch("/api/calendario-eccezioni").then((r) => r.json()).catch(() => null),
    ])
      .then(([data, channels, calData]: [Disponibilita[], any, any]) => {
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
        if (channels) setChannelStatus(channels);

        if (calData) {
          setEccezioni(calData.eccezioni || []);
          setFestivitaNazionali(calData.festivitaNazionali || []);
          setRispettaFestivita(calData.rispettaFestivitaNazionali ?? true);
        }

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

  const handleSaveAll = async (andSync: boolean = false) => {
    if (andSync) setSyncing(true);
    else setSaving(true);
    setFeedback(null);

    try {
      // 1. Salva nel database locale di Barberly
      const res = await fetch("/api/orari", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orari),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Impossibile salvare gli orari");
      }

      // 2. Se richiesto, invia la sincronizzazione a Google Maps, Meta e WhatsApp tramite Core
      if (andSync) {
        const weeklyHours = GIORNI_SETTIMANA.map(({ giorno, key }) => {
          const item = orari.find((o) => o.giorno === giorno);
          if (!item || !item.attivo) {
            return { dayOfWeek: key, isOpen: false, slots: [] };
          }
          const slots = [];
          if (item.pausaInizio && item.pausaFine) {
            slots.push({ open: item.oraInizio, close: item.pausaInizio });
            slots.push({ open: item.pausaFine, close: item.oraFine });
          } else {
            slots.push({ open: item.oraInizio, close: item.oraFine });
          }
          return {
            dayOfWeek: key,
            isOpen: true,
            slots,
          };
        });

        const syncRes = await fetch("/api/sync/channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weeklyHours }),
        });
        const syncData = await syncRes.json();
        if (syncRes.ok && syncData.ok) {
          setChannelStatus(syncData);
          setFeedback({
            type: "success",
            text: "Orari salvati e sincronizzati con successo su Google Maps, Meta e WhatsApp!",
          });
        } else {
          setFeedback({
            type: "success",
            text: "Orari salvati localmente. (Avviso sincronizzazione canali: " + (syncData.error || "Core offline") + ")",
          });
        }
      } else {
        setFeedback({
          type: "success",
          text: "Orari del salone aggiornati con successo!",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Errore durante il salvataggio",
      });
    } finally {
      setSaving(false);
      setSyncing(false);
    }
  };

  const handleToggleFestivita = async (val: boolean) => {
    setSavingFestivita(true);
    try {
      const res = await fetch("/api/calendario-eccezioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rispettaFestivitaNazionali: val }),
      });
      if (res.ok) {
        setRispettaFestivita(val);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFestivita(false);
    }
  };

  const handleCreateEccezione = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTitolo) return;
    setSubmittingEcc(true);

    try {
      const payload: any = {
        data: newDate,
        tipo: newTipo,
        titolo: newTitolo,
        isAperto: newTipo !== "CHIUSURA",
        note: newNote || null,
      };

      if (newTipo !== "CHIUSURA") {
        payload.orarioApertura = newOraInizio;
        payload.orarioChiusura = newOraFine;
        payload.pausaInizio = newPausaInizio || null;
        payload.pausaFine = newPausaFine || null;
      }

      const res = await fetch("/api/calendario-eccezioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setEccezioni((prev) => {
          const filtered = prev.filter((x) => x.data !== created.data);
          return [...filtered, created].sort((a, b) => a.data.localeCompare(b.data));
        });
        setIsModalOpen(false);
        setNewDate("");
        setNewTitolo("");
        setNewNote("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEcc(false);
    }
  };

  const handleDeleteEccezione = async (dataStr: string) => {
    if (!confirm("Sei sicuro di voler rimuovere questa data speciale?")) return;
    try {
      const res = await fetch(`/api/calendario-eccezioni?data=${dataStr}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEccezioni((prev) => prev.filter((x) => x.data !== dataStr));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Pagina */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Orari & Calendario Speciale
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestisci gli orari di apertura, le festività italiane, le ferie e le aperture straordinarie natalizie.
          </p>
        </div>

        {activeTab === "settimanali" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyMondayToWeek}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copia Lun su Mar-Sab</span>
            </button>

            <button
              onClick={() => handleSaveAll(false)}
              disabled={saving || syncing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{saving ? "Salvataggio..." : "Salva Locale"}</span>
            </button>

            <button
              onClick={() => handleSaveAll(true)}
              disabled={saving || syncing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{syncing ? "Sincronizzazione..." : "Salva & Sincronizza Canali"}</span>
            </button>
          </div>
        )}

        {activeTab === "festivita" && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Data Speciale</span>
          </button>
        )}
      </div>

      {/* Tabs di navigazione */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("settimanali")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "settimanali"
              ? "bg-slate-800 text-white shadow-xs border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Orari Settimanali Standard</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("festivita")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "festivita"
              ? "bg-slate-800 text-white shadow-xs border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>🎄</span>
          <span>Festività & Date Speciali</span>
          {eccezioni.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
              {eccezioni.length}
            </span>
          )}
        </button>
      </div>

      {/* Banner Feedback */}
      {feedback && activeTab === "settimanali" && (
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

      {/* CONTENUTO TAB 1: ORARI SETTIMANALI */}
      {activeTab === "settimanali" && (
        <div className="space-y-6">
          {/* Box Sincronizzazione Canali Omnichannel (Google Maps, Meta, WhatsApp) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">Google Maps</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${channelStatus?.channels?.google?.enabled ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {channelStatus?.channels?.google?.enabled ? "Sincronizzato" : "Pronto (Core)"}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">Facebook & IG</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${channelStatus?.channels?.meta?.enabled ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {channelStatus?.channels?.meta?.enabled ? "Collegato" : "Pronto (Core)"}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">WhatsApp</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Attivo 1-Click
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Star className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">Review Booster</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Email 5 Stelle
                </div>
              </div>
            </div>
          </div>

          {/* Griglia Orari Giorni */}
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
      )}

      {/* CONTENUTO TAB 2: FESTIVITÀ & DATE SPECIALI */}
      {activeTab === "festivita" && (
        <div className="space-y-6">
          {/* Card Toggle Festività Nazionali Automatiche */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇮🇹</span>
                  <h3 className="text-sm font-bold text-white">
                    Festività Nazionali Italiane Automatiche
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Considera automaticamente chiusa la bottega nei giorni festivi del calendario italiano (Natale, Santo Stefano, Capodanno, Epifania, Pasqua, Pasquetta, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, 8 Dicembre, ecc.).
                  Le prenotazioni online vengono disabilitate e l'invio del report giornaliero viene sospeso automaticamente.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={rispettaFestivita}
                  disabled={savingFestivita}
                  onChange={(e) => handleToggleFestivita(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-2.5 text-xs font-bold text-white">
                  {rispettaFestivita ? "Abilitate" : "Disabilitate"}
                </span>
              </label>
            </div>

            {/* Chip Festività Previste per l'anno in corso */}
            {rispettaFestivita && festivitaNazionali.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Festività Riconosciute ({festivitaNazionali.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {festivitaNazionali.map((fest) => (
                    <span
                      key={fest.data}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80"
                    >
                      <span className="font-mono text-amber-400">{fest.data.slice(5)}</span>
                      <span>{fest.nome}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Elenco Eccezioni e Date Speciali Configurate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Date Speciali & Aperture Straordinarie Personalizzate
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {eccezioni.length} {eccezioni.length === 1 ? "data speciale configurata" : "date speciali configurate"}
              </span>
            </div>

            {eccezioni.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
                  📅
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Nessuna data speciale programmata</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Aggiungi aperture straordinarie (es. Domeniche di Dicembre pre-feste), orari ridotti per la vigilia, oppure ponti e ferie di chiusura.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Programma Nuova Data</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eccezioni.map((ecc) => {
                  const dateObj = new Date(ecc.data + "T00:00:00");
                  const dateFormatted = !isNaN(dateObj.getTime())
                    ? format(dateObj, "EEEE d MMMM yyyy", { locale: it })
                    : ecc.data;

                  const isChiusura = ecc.tipo === "CHIUSURA";
                  const isStraordinaria = ecc.tipo === "APERTURA_STRAORDINARIA";

                  return (
                    <div
                      key={ecc.id || ecc.data}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isChiusura
                          ? "bg-rose-950/20 border-rose-900/40"
                          : isStraordinaria
                          ? "bg-emerald-950/20 border-emerald-900/40"
                          : "bg-amber-950/20 border-amber-900/40"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isChiusura
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isStraordinaria
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isChiusura
                              ? "Chiusura"
                              : isStraordinaria
                              ? "Apertura Straordinaria"
                              : "Orario Speciale"}
                          </span>
                          <span className="font-mono text-xs font-bold text-white capitalize">
                            {dateFormatted}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white truncate">{ecc.titolo}</h4>

                        {!isChiusura && ecc.oraInizio && ecc.oraFine && (
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              {ecc.oraInizio} – {ecc.oraFine}
                            </span>
                            {ecc.pausaInizio && ecc.pausaFine && (
                              <span className="text-[11px] text-slate-400">
                                (Pausa: {ecc.pausaInizio}–{ecc.pausaFine})
                              </span>
                            )}
                          </div>
                        )}

                        {ecc.note && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-2">
                            "{ecc.note}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEccezione(ecc.data)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                        title="Elimina data speciale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NUOVA DATA SPECIALE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  📅
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Aggiungi Data Speciale</h3>
                  <p className="text-xs text-slate-400">
                    Configura aperture straordinarie, vigilie o chiusure per ferie
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEccezione} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                    Data (AAAA-MM-GG)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                    Tipo Evento
                  </label>
                  <select
                    value={newTipo}
                    onChange={(e: any) => setNewTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="APERTURA_STRAORDINARIA">Apertura Straordinaria (es. Domenica)</option>
                    <option value="ORARIO_SPECIALE">Orario Speciale (es. Vigilia continuato)</option>
                    <option value="CHIUSURA">Chiusura per Ferie / Straordinaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  Titolo o Motivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Apertura Straordinaria Domenica di Natale"
                  value={newTitolo}
                  onChange={(e) => setNewTitolo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {newTipo !== "CHIUSURA" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Apertura
                    </label>
                    <input
                      type="time"
                      required
                      value={newOraInizio}
                      onChange={(e) => setNewOraInizio(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Chiusura
                    </label>
                    <input
                      type="time"
                      required
                      value={newOraFine}
                      onChange={(e) => setNewOraFine(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Pausa Inizio
                    </label>
                    <input
                      type="time"
                      value={newPausaInizio}
                      onChange={(e) => setNewPausaInizio(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Pausa Fine
                    </label>
                    <input
                      type="time"
                      value={newPausaFine}
                      onChange={(e) => setNewPausaFine(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  Note Interne (Opzionale)
                </label>
                <input
                  type="text"
                  placeholder="Es. Personale ridotto o orario continuato"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submittingEcc}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingEcc ? "Salvataggio..." : "Salva Data Speciale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
