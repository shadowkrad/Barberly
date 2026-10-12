"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Scissors,
  CheckCircle2,
  Calendar,
  Filter,
  Award,
} from "lucide-react";
import NuovoAppuntamentoModal from "@/components/dashboard/NuovoAppuntamentoModal";
import GestioneModificaModal from "@/components/dashboard/GestioneModificaModal";
import { apriWhatsAppWeb, generaMessaggioWhatsAppPromemoria } from "@/lib/whatsapp";

interface ApptItem {
  id: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  status: string;
  channel?: string;
  notes?: string | null;
  pricePaid?: number | null;
  barber: { id: string; name: string; nickname?: string | null };
  client: { id: string; firstName: string; lastName: string; phone: string; email?: string | null };
  service: { id: string; name: string; price: number; durationMinutes: number; category: string };
}

const STATI_FILTRI = [
  { id: "VALIDI", label: "Validi / Operativi" },
  { id: "ALL", label: "Tutti gli Appuntamenti" },
  { id: "IN_PROGRESS", label: "In Poltrona 💈" },
  { id: "CONFIRMED", label: "Confermati" },
  { id: "PENDING", label: "In Attesa" },
  { id: "COMPLETED", label: "Completati" },
  { id: "CANCELLED", label: "Annullati" },
];

export default function BarberlyAppuntamentiPage() {
  const [appuntamenti, setAppuntamenti] = useState<ApptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStato, setFilterStato] = useState("VALIDI");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [nuovoModalOpen, setNuovoModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<ApptItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchAppuntamenti = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStato !== "ALL") params.append("stato", filterStato);
    if (search) params.append("ricerca", search);

    try {
      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppuntamenti(data.appuntamenti || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStato, search]);

  useEffect(() => {
    fetchAppuntamenti();
  }, [fetchAppuntamenti]);

  const updateStato = async (id: string, newStatus: string, clientName?: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setToastMsg(clientName ? `✓ ${clientName}: stato aggiornato a ${newStatus}` : "✓ Stato aggiornato");
        setTimeout(() => setToastMsg(null), 3000);
        fetchAppuntamenti();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsApp = (a: ApptItem) => {
    if (!a.client?.phone) return;
    const dStr = new Date(a.date).toLocaleDateString("it-IT");
    const dataOraStr = `${dStr} alle ore ${a.startTime}`;
    const msg = generaMessaggioWhatsAppPromemoria({
      nomeCliente: a.client.firstName,
      servizio: a.service.name,
      dataOra: dataOraStr,
      barbiere: a.barber.name,
      nomeSalone: "Barberly Studio",
    });
    apriWhatsAppWeb(a.client.phone, msg);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/40 animate-pulse">
            In Poltrona 💈
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Confermato
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            Completato ✓
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 line-through">
            Annullato
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
            No-Show ⚠️
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            In Attesa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notifica */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Registro Appuntamenti
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci prenotazioni in poltrona, cambi di stato, promemoria WhatsApp e incassi.
          </p>
        </div>

        <button
          onClick={() => setNuovoModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuovo Appuntamento
        </button>
      </div>

      {/* Filtri Stato & Barra di Ricerca */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATI_FILTRI.map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStato(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterStato === st.id
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Cerca per nome cliente, telefono o servizio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
      </div>

      {/* Lista Appuntamenti: Mobile Cards + Desktop Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Caricamento appuntamenti...
          </div>
        ) : appuntamenti.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nessun appuntamento trovato con i filtri selezionati.
          </div>
        ) : (
          <>
            {/* VISTA MOBILE: CARD TOUCH-FRIENDLY */}
            <div className="md:hidden divide-y divide-slate-800">
              {appuntamenti.map((a) => (
                <div key={a.id} className="p-4 space-y-3 hover:bg-slate-800/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Badge orario */}
                      <div className="flex flex-col items-center justify-center min-w-16 py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-center">
                        <span className="text-sm font-bold tracking-tight">{a.startTime}</span>
                        <span className="text-[10px] text-slate-400">{a.endTime}</span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {a.client.firstName} {a.client.lastName}
                        </h3>
                        <div className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-amber-500" />
                          <span>{a.client.phone}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <Scissors className="w-3 h-3 text-amber-500" />
                          <span>{a.service.name} • Poltrona: {a.barber.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {getStatusBadge(a.status)}
                      <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                        € {(a.pricePaid ?? a.service.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {a.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
                      <span className="text-amber-400 font-semibold block mb-0.5">Note:</span>
                      {a.notes}
                    </div>
                  )}

                  {/* Pulsanti Azione Rapida */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      {a.status !== "IN_PROGRESS" && a.status !== "COMPLETED" && (
                        <button
                          onClick={() => updateStato(a.id, "IN_PROGRESS", a.client.firstName)}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-bold"
                        >
                          In Poltrona
                        </button>
                      )}
                      {a.status !== "COMPLETED" && (
                        <button
                          onClick={() => updateStato(a.id, "COMPLETED", a.client.firstName)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold"
                        >
                          Completa
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${a.client.phone}`}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleWhatsApp(a)}
                        className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedAppt(a)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Modifica
                      </button>
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
                    <th className="py-3 px-4">Orario & Data</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Servizio & Poltrona</th>
                    <th className="py-3 px-4">Prezzo</th>
                    <th className="py-3 px-4">Stato</th>
                    <th className="py-3 px-4 text-right">Azioni Rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {appuntamenti.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-400 text-sm">
                          {a.startTime} - {a.endTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(a.date).toLocaleDateString("it-IT")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">
                          {a.client.firstName} {a.client.lastName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {a.client.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{a.service.name}</div>
                        <div className="text-[11px] text-slate-400">Poltrona: {a.barber.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          € {(a.pricePaid ?? a.service.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(a.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${a.client.phone}`}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Chiama"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleWhatsApp(a)}
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedAppt(a)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition cursor-pointer"
                          >
                            Modifica
                          </button>
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

      {/* Modale Nuovo Appuntamento */}
      <NuovoAppuntamentoModal
        isOpen={nuovoModalOpen}
        onClose={() => setNuovoModalOpen(false)}
        onSuccess={() => {
          setToastMsg("✓ Nuovo appuntamento registrato in agenda!");
          setTimeout(() => setToastMsg(null), 3000);
          fetchAppuntamenti();
        }}
      />

      {/* Modale Gestione / Modifica Appuntamento */}
      <GestioneModificaModal
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        onUpdate={() => {
          fetchAppuntamenti();
        }}
      />
    </div>
  );
}
