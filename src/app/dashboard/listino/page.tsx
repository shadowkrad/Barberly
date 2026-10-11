"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Clock, Scissors, Plus, Search, Edit2, Trash2, Check, AlertCircle } from "lucide-react";

interface TrattamentoItem {
  id: string;
  nome: string;
  descrizione: string;
  durata: number;
  prezzo: number;
  categoria: string;
  colore: string;
  attivo: boolean;
}

const CATEGORIE = [
  { id: "ALL", label: "Tutti i Servizi" },
  { id: "HAIR", label: "Taglio & Capelli ✂️" },
  { id: "BEARD", label: "Barba & Rituali 🧔" },
  { id: "COMBO", label: "Pacchetti Combo 💈" },
  { id: "TREATMENT", label: "Trattamenti Cute 💆‍♂️" },
];

const EMPTY_FORM = {
  nome: "",
  descrizione: "",
  durata: 30,
  prezzo: 25,
  categoria: "HAIR",
  colore: "#d97706",
};

export default function BarberlyListinoPage() {
  const [trattamenti, setTrattamenti] = useState<TrattamentoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchListino = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listino");
      if (res.ok) {
        const data = await res.json();
        setTrattamenti(data.trattamenti || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListino();
  }, [fetchListino]);

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      categoria: activeTab !== "ALL" ? activeTab : "HAIR",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (t: TrattamentoItem) => {
    setForm({
      nome: t.nome,
      descrizione: t.descrizione || "",
      durata: t.durata,
      prezzo: t.prezzo,
      categoria: t.categoria || "HAIR",
      colore: t.colore || "#d97706",
    });
    setEditingId(t.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/listino/${editingId}` : "/api/listino";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setFeedback(editingId ? "Servizio aggiornato con successo!" : "Nuovo servizio creato!");
        setTimeout(() => setFeedback(null), 3000);
        fetchListino();
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

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Sei sicuro di voler disattivare il servizio "${nome}"?`)) {
      await fetch(`/api/listino/${id}`, { method: "DELETE" });
      fetchListino();
    }
  };

  const filtered = trattamenti.filter((t) => {
    const matchCat = activeTab === "ALL" || t.categoria === activeTab;
    const matchSearch =
      !search ||
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.descrizione.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Listino Servizi & Pacchetti Combo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci tagli, rituali barba a panno caldo, pacchetti combo e prezzi della bottega.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuovo Servizio / Combo
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Categorie Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIE.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === cat.id
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca servizio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Grid Servizi */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Caricamento listino servizi...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800/80">
          Nessun servizio trovato in questa categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                s.attivo
                  ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                  : "bg-slate-950/60 border-slate-900 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {s.categoria}
                  </span>
                  <span className="font-mono font-bold text-base text-amber-400">
                    € {s.prezzo.toFixed(2)}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-1">{s.nome}</h3>
                {s.descrizione && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {s.descrizione}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> {s.durata} min
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Modifica servizio"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.nome)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Disattiva servizio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crea/Modifica Servizio */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                {editingId ? "Modifica Servizio" : "Nuovo Servizio / Combo"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Nome Servizio *
                </label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Es. Taglio Sartoriale + Panno Caldo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="HAIR">Capelli (HAIR)</option>
                    <option value="BEARD">Barba (BEARD)</option>
                    <option value="COMBO">Combo VIP (COMBO)</option>
                    <option value="TREATMENT">Trattamento (TREATMENT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Durata (minuti) *
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    value={form.durata}
                    onChange={(e) => setForm({ ...form, durata: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Prezzo (€) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.5}
                  value={form.prezzo}
                  onChange={(e) => setForm({ ...form, prezzo: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Descrizione trattamento (opzionale)
                </label>
                <textarea
                  rows={2}
                  value={form.descrizione}
                  onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Es. Massaggio cute con oli essenziali e rifinitura contorno a rasoio..."
                />
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
                  {saving ? "Salvataggio..." : "Salva Servizio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
