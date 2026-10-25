"use client";

import { useState, useEffect } from "react";
import { Clock, Save, Copy, Check, AlertCircle, Calendar, Plus, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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

  const [orari, setOrari] = useState<Disponibilita[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    Promise.all([
      fetch("/api/orari").then((r) => r.json()),
      fetch("/api/calendario-eccezioni").then((r) => r.json()).catch(() => null),
    ])
      .then(([data, calData]: [Disponibilita[], any]) => {
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

      setFeedback({ type: "success", text: "Orari settimanali aggiornati con successo!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Errore durante il salvataggio" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFestivita = async (val: boolean) => {
    setRispettaFestivita(val);
    setSavingFestivita(true);
    try {
      await fetch("/api/calendario-eccezioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rispettaFestivitaNazionali: val }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingFestivita(false);
    }
  };

  const handleCreateEccezione = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTitolo.trim()) return;

    setSubmittingEcc(true);
    try {
      const res = await fetch("/api/calendario-eccezioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: newDate,
          tipo: newTipo,
          titolo: newTitolo.trim(),
          oraInizio: newTipo !== "CHIUSURA" ? newOraInizio : undefined,
          oraFine: newTipo !== "CHIUSURA" ? newOraFine : undefined,
          pausaInizio: newTipo !== "CHIUSURA" && newPausaInizio ? newPausaInizio : undefined,
          pausaFine: newTipo !== "CHIUSURA" && newPausaFine ? newPausaFine : undefined,
          note: newNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.eccezione) {
        setEccezioni((prev) => {
          const filtered = prev.filter((x) => x.data !== data.eccezione.data);
          return [...filtered, data.eccezione].sort((a, b) => a.data.localeCompare(b.data));
        });
        setIsModalOpen(false);
        setNewDate("");
        setNewTitolo("");
        setNewNote("");
      } else {
        alert(data.error || "Errore durante il salvataggio");
      }
    } catch (err: any) {
      alert(err.message || "Errore di connessione");
    } finally {
      setSubmittingEcc(false);
    }
  };

  const handleDeleteEccezione = async (id: string) => {
    if (!confirm("Vuoi eliminare questa eccezione di calendario?")) return;
    try {
      const res = await fetch(`/api/calendario-eccezioni?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEccezioni((prev) => prev.filter((x) => x.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Caricamento orari e calendario barberia...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header con Titolo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Orari & Festività Barberia
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Imposta l&apos;orario ordinario di poltrona, le festività italiane e le aperture straordinarie per le feste.
          </p>
        </div>

        {activeTab === "settimanali" && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Salva Orari
              </>
            )}
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
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* CONTENUTO TAB 1: ORARI SETTIMANALI */}
      {activeTab === "settimanali" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyMondayToWeek}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copia orari del Lunedì su Mar – Sab
            </button>
          </div>

          <div className="space-y-2.5">
            {GIORNI_SETTIMANA.map(({ nome, giorno }) => {
              const item = orari.find((o) => o.giorno === giorno) || {
                giorno,
                oraInizio: "09:00",
                oraFine: "19:30",
                pausaInizio: null,
                pausaFine: null,
                attivo: false,
              };

              const isAperto = item.attivo;

              return (
                <div
                  key={giorno}
                  className={`rounded-2xl border transition-all p-4 ${
                    isAperto
                      ? "bg-slate-900/90 border-slate-800 shadow-sm"
                      : "bg-slate-950/60 border-slate-900 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <input
                        type="checkbox"
                        id={`wh-${giorno}`}
                        checked={isAperto}
                        onChange={(e) => update(giorno, "attivo", e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 border-slate-700 bg-slate-800 cursor-pointer"
                      />
                      <label htmlFor={`wh-${giorno}`} className="font-bold text-white text-sm cursor-pointer select-none">
                        {nome}
                      </label>
                      {!isAperto && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Chiuso
                        </span>
                      )}
                    </div>

                    {isAperto ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[11px]">Orario:</span>
                          <input
                            type="time"
                            value={item.oraInizio}
                            onChange={(e) => update(giorno, "oraInizio", e.target.value)}
                            className="bg-transparent text-white font-semibold focus:outline-none focus:text-amber-400"
                          />
                          <span className="text-slate-600">—</span>
                          <input
                            type="time"
                            value={item.oraFine}
                            onChange={(e) => update(giorno, "oraFine", e.target.value)}
                            className="bg-transparent text-white font-semibold focus:outline-none focus:text-amber-400"
                          />
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[11px]">Pausa:</span>
                          <input
                            type="time"
                            value={item.pausaInizio || ""}
                            onChange={(e) => update(giorno, "pausaInizio", e.target.value || null)}
                            placeholder="--:--"
                            className="bg-transparent text-slate-300 w-20 focus:outline-none focus:text-amber-400"
                          />
                          <span className="text-slate-600">—</span>
                          <input
                            type="time"
                            value={item.pausaFine || ""}
                            onChange={(e) => update(giorno, "pausaFine", e.target.value || null)}
                            placeholder="--:--"
                            className="bg-transparent text-slate-300 w-20 focus:outline-none focus:text-amber-400"
                          />
                          {(item.pausaInizio || item.pausaFine) && (
                            <button
                              type="button"
                              onClick={() => {
                                update(giorno, "pausaInizio", null);
                                update(giorno, "pausaFine", null);
                              }}
                              className="text-slate-500 hover:text-rose-400 ml-1 text-xs"
                              title="Rimuovi pausa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Riposo settimanale della barberia</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENUTO TAB 2: FESTIVITA & APERTURE STRAORDINARIE */}
      {activeTab === "festivita" && (
        <div className="space-y-6">
          {/* Card Toggle Festività Nazionali Italiane */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🇮🇹</span>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Festività Nazionali Italiane Automatiche
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Riconosci automaticamente Natale, Santo Stefano, Capodanno, Befana, Pasqua, Pasquetta, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, Ognissanti e 8 Dicembre come giorni di chiusura.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={rispettaFestivita}
                  onChange={(e) => handleToggleFestivita(e.target.checked)}
                  disabled={savingFestivita}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {rispettaFestivita && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Festività incluse nel calendario automatico:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {festivitaNazionali.map((f) => (
                    <span
                      key={f.data}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="text-amber-500 font-mono">
                        {format(new Date(f.data + "T00:00:00"), "dd/MM")}
                      </span>
                      <span>{f.nome}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sezione Date Speciali & Aperture Straordinarie */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Aperture Straordinarie & Chiusure Speciali
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pianifica una Domenica aperta per le feste natalizie, orari speciali o ferie del salone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Data Speciale</span>
              </button>
            </div>

            {eccezioni.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                Nessuna data speciale programmata. Clicca su &quot;Aggiungi Data Speciale&quot; per inserire un&apos;apertura domenicale o una chiusura.
              </div>
            ) : (
              <div className="space-y-2.5">
                {eccezioni.map((ecc) => {
                  const dObj = new Date(ecc.data + "T00:00:00");
                  const dataFormatted = format(dObj, "EEEE d MMMM yyyy", { locale: it });

                  return (
                    <div
                      key={ecc.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs sm:text-sm font-bold text-white capitalize">
                            {dataFormatted}
                          </strong>
                          {ecc.tipo === "APERTURA_STRAORDINARIA" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Apertura Straordinaria
                            </span>
                          )}
                          {ecc.tipo === "ORARIO_SPECIALE" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Orario Speciale
                            </span>
                          )}
                          {ecc.tipo === "CHIUSURA" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Chiuso
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{ecc.titolo}</span>
                          {ecc.tipo !== "CHIUSURA" && (
                            <span className="text-amber-500/90 font-mono">
                              (ore {ecc.oraInizio} – {ecc.oraFine}
                              {ecc.pausaInizio && ecc.pausaFine ? `, pausa ${ecc.pausaInizio}-${ecc.pausaFine}` : ""}
                              )
                            </span>
                          )}
                          {ecc.note && <span className="text-slate-500 italic">• {ecc.note}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEccezione(ecc.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg text-xs font-semibold transition self-end sm:self-auto cursor-pointer flex items-center gap-1"
                        title="Elimina eccezione"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Elimina
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE AGGIUNGI ECCEZIONE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Nuova Data Speciale / Festività
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEccezione} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Tipologia *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "APERTURA_STRAORDINARIA", label: "Apertura Straord.", icon: "✨" },
                    { id: "ORARIO_SPECIALE", label: "Orario Speciale", icon: "⏰" },
                    { id: "CHIUSURA", label: "Chiuso / Ferie", icon: "🔒" },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setNewTipo(t.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition ${
                        newTipo === t.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-300"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-base mb-0.5">{t.icon}</div>
                      <div className="text-[11px] leading-tight">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Titolo / Motivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Domenica pre-Natale, Vigilia, Chiusi per ferie..."
                  value={newTitolo}
                  onChange={(e) => setNewTitolo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {newTipo !== "CHIUSURA" && (
                <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Ora Inizio
                      </label>
                      <input
                        type="time"
                        value={newOraInizio}
                        onChange={(e) => setNewOraInizio(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Ora Fine
                      </label>
                      <input
                        type="time"
                        value={newOraFine}
                        onChange={(e) => setNewOraFine(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Pausa Inizio (opzionale)
                      </label>
                      <input
                        type="time"
                        value={newPausaInizio}
                        onChange={(e) => setNewPausaInizio(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Pausa Fine (opzionale)
                      </label>
                      <input
                        type="time"
                        value={newPausaFine}
                        onChange={(e) => setNewPausaFine(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Note Interne (opzionale)
                </label>
                <input
                  type="text"
                  placeholder="Es. Orario continuato per regali di Natale"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submittingEcc}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
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
