"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Phone, Mail, Award, Scissors, Search, Plus, ExternalLink, ShieldCheck, MessageCircle } from "lucide-react";
import { generaLinkWhatsApp } from "@/lib/whatsapp";

interface ClienteItem {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  note?: string;
  puntiFedelta: number;
  consensoPrivacy: boolean;
  dataUltimaVisita?: string | null;
  _count: { appuntamenti: number };
}

export default function BarberlyClientiPage() {
  const [clienti, setClienti] = useState<ClienteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nuovoCliente, setNuovoCliente] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    note: "",
    consensoPrivacy: true,
  });

  const fetchClienti = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "30",
    });
    if (search) params.append("ricerca", search);

    try {
      const res = await fetch(`/api/clienti?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClienti(data.clienti || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchClienti();
  }, [fetchClienti]);

  const handleCreaCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clienti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuovoCliente),
      });
      if (res.ok) {
        setShowModal(false);
        setNuovoCliente({
          nome: "",
          cognome: "",
          email: "",
          telefono: "",
          note: "",
          consensoPrivacy: true,
        });
        fetchClienti();
      } else {
        const err = await res.json();
        alert(err.error || "Errore nella creazione del cliente");
      }
    } catch (e: any) {
      alert("Errore di connessione: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Anagrafica Clienti & Schede Barba (CRM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestione clienti, note tecniche di taglio/barba, punti fedeltà e recapiti.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuovo Cliente
        </button>
      </div>

      {/* Barra di ricerca */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Cerca per nome, cognome, cellulare o email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Cancella
          </button>
        )}
      </div>

      {/* Lista Clienti: Responsive Mobile Cards + Desktop Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Caricamento anagrafica clienti...
          </div>
        ) : clienti.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nessun cliente trovato con i criteri specificati.
          </div>
        ) : (
          <>
            {/* VISTA MOBILE: CARD TOUCH-FRIENDLY */}
            <div className="md:hidden divide-y divide-slate-800">
              {clienti.map((c) => (
                <div key={c.id} className="p-4 space-y-3 hover:bg-slate-800/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0">
                        {c.nome.charAt(0)}{c.cognome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {c.nome} {c.cognome}
                        </h3>
                        <div className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-amber-500" />
                          <span>{c.telefono}</span>
                        </div>
                        {c.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 text-slate-500" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Award className="w-3 h-3" />
                        {c.puntiFedelta} pt
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c._count.appuntamenti} visite
                      </span>
                    </div>
                  </div>

                  {c.note && (
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
                      <span className="text-amber-400 font-semibold block mb-0.5">Note Stile:</span>
                      {c.note}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div>
                      {c.consensoPrivacy ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                          ✓ Privacy OK
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/30">
                          No Privacy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${c.telefono}`}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition"
                        title="Chiama"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={generaLinkWhatsApp(c.telefono, `Ciao ${c.nome}! Ti contattiamo da Barberly.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs transition"
                        title="Invia WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/dashboard/clienti/${c.id}`}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition"
                      >
                        Scheda →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA DESKTOP: TABELLA COMPATTA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Contatti</th>
                    <th className="py-3 px-4">Note Taglio & Barba</th>
                    <th className="py-3 px-4">Visite</th>
                    <th className="py-3 px-4">Fidelity</th>
                    <th className="py-3 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {clienti.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">
                          {c.nome} {c.cognome}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.consensoPrivacy ? "Consenso Privacy rilasciato" : "Senza consenso"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-200">{c.telefono}</div>
                        {c.email && <div className="text-slate-400">{c.email}</div>}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {c.note ? (
                          <div className="truncate text-slate-300" title={c.note}>
                            {c.note}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Nessuna nota</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200">{c._count.appuntamenti}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Award className="w-3 h-3" />
                          {c.puntiFedelta} pt
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${c.telefono}`}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Chiama"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={generaLinkWhatsApp(c.telefono, `Ciao ${c.nome}! Ti contattiamo da Barberly.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/dashboard/clienti/${c.id}`}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition"
                          >
                            Scheda →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Nuovo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Aggiungi Nuovo Cliente
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreaCliente} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuovoCliente.nome}
                    onChange={(e) => setNuovoCliente({ ...nuovoCliente, nome: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Es. Mario"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuovoCliente.cognome}
                    onChange={(e) => setNuovoCliente({ ...nuovoCliente, cognome: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Es. Rossi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Telefono (Cellulare) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={nuovoCliente.telefono}
                    onChange={(e) => setNuovoCliente({ ...nuovoCliente, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Es. +39 340 1234567"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Email (opzionale)
                  </label>
                  <input
                    type="email"
                    value={nuovoCliente.email}
                    onChange={(e) => setNuovoCliente({ ...nuovoCliente, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Es. mario.rossi@email.it"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Note Stile (Taglio, Barba, Preferenze)
                </label>
                <textarea
                  rows={3}
                  value={nuovoCliente.note}
                  onChange={(e) => setNuovoCliente({ ...nuovoCliente, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Es. Sfumatura bassa a pelle, panno caldo, balsamo barba wood & spice..."
                />
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Consenso Privacy GDPR
                </span>
                <input
                  type="checkbox"
                  checked={nuovoCliente.consensoPrivacy}
                  onChange={(e) => setNuovoCliente({ ...nuovoCliente, consensoPrivacy: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
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
                  {saving ? "Salvataggio..." : "Salva Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
