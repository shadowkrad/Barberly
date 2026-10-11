"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCheck, Scissors, Plus, CheckCircle2, Phone, Mail, Edit2, Trash2, Check, AlertCircle } from "lucide-react";

interface BarbiereItem {
  id: string;
  nome: string;
  soprannome: string;
  telefono: string;
  email: string;
  colore: string;
  attivo: boolean;
  totaleAppuntamenti: number;
}

const COLORI_PRESET = [
  { nome: "Ambra Barberly", hex: "#d97706" },
  { nome: "Blu Navy", hex: "#2563eb" },
  { nome: "Smeraldo", hex: "#10b981" },
  { nome: "Rosso Cuoio", hex: "#dc2626" },
  { nome: "Viola Vintage", hex: "#9333ea" },
  { nome: "Grigio Ardesia", hex: "#475569" },
];

const EMPTY_FORM = {
  nome: "",
  soprannome: "",
  telefono: "",
  email: "",
  colore: "#d97706",
};

export default function BarberlyBarbieriPage() {
  const [barbieri, setBarbieri] = useState<BarbiereItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBarbieri = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/barbieri");
      if (res.ok) {
        const data = await res.json();
        setBarbieri(data.barbieri || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBarbieri();
  }, [fetchBarbieri]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (b: BarbiereItem) => {
    setForm({
      nome: b.nome,
      soprannome: b.soprannome || "",
      telefono: b.telefono || "",
      email: b.email || "",
      colore: b.colore || "#d97706",
    });
    setEditingId(b.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/barbieri/${editingId}` : "/api/barbieri";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setFeedback(editingId ? "Barbiere aggiornato con successo!" : "Nuovo barbiere aggiunto allo staff!");
        setTimeout(() => setFeedback(null), 3000);
        fetchBarbieri();
      } else {
        const err = await res.json();
        alert(err.error || "Errore nel salvataggio");
      }
    } catch (e: any) {
      alert("Errore di connessione: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAttivo = async (id: string, attivoAttuale: boolean) => {
    await fetch(`/api/barbieri/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attivo: !attivoAttuale }),
    });
    fetchBarbieri();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            Staff & Poltrone Barbieri
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci i barbieri operativi in salone, le poltrone attive e i recapiti dello staff.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuovo Barbiere
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid Barbieri */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Caricamento staff barbieri...
        </div>
      ) : barbieri.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
          Nessun barbiere presente in anagrafica.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbieri.map((b) => (
            <div
              key={b.id}
              className={`border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                b.attivo
                  ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                  : "bg-slate-950/60 border-slate-900 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl text-white font-black text-lg flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: b.colore, borderColor: `${b.colore}80` }}
                  >
                    💈
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{b.nome}</h3>
                    {b.soprannome && (
                      <p className="text-xs text-amber-400 font-mono">&quot;{b.soprannome}&quot;</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Modifica"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleAttivo(b.id, b.attivo)}
                    className={`p-1.5 rounded-lg transition ${
                      b.attivo
                        ? "bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                    title={b.attivo ? "Metti in pausa poltrona" : "Riattiva poltrona"}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Stato poltrona:</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      b.attivo ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" /> {b.attivo ? "Attivo in Bottega" : "In Pausa / Assente"}
                  </span>
                </div>

                {b.telefono && (
                  <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-500" /> Tel:</span>
                    <span className="text-slate-200">{b.telefono}</span>
                  </div>
                )}

                {b.email && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> Mail:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{b.email}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-800 flex justify-between text-slate-400 text-[11px]">
                  <span>Appuntamenti gestiti:</span>
                  <strong className="text-slate-200">{b.totaleAppuntamenti}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crea/Modifica Barbiere */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                {editingId ? "Modifica Dati Barbiere" : "Aggiungi Barbiere allo Staff"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Es. Luca"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Soprannome / Poltrona
                  </label>
                  <input
                    type="text"
                    value={form.soprannome}
                    onChange={(e) => setForm({ ...form, soprannome: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Es. The Blade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="+39 348 1234567"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="luca@barberly.it"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                  Colore Identificativo Poltrona
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORI_PRESET.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setForm({ ...form, colore: c.hex })}
                      className={`w-7 h-7 rounded-xl transition cursor-pointer border-2 ${
                        form.colore === c.hex ? "border-white scale-110 shadow-sm" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.nome}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {saving ? "Salvataggio..." : "Salva Barbiere"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
