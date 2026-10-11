"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Scissors,
  Users,
  Filter,
  CheckCircle2,
} from "lucide-react";
import NuovoAppuntamentoModal from "@/components/dashboard/NuovoAppuntamentoModal";
import GestioneModificaModal from "@/components/dashboard/GestioneModificaModal";

interface Barber {
  id: string;
  nome: string;
  soprannome?: string | null;
  colore: string;
}

interface ApptItem {
  id: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  pricePaid?: number | null;
  barber: { id: string; name: string; nickname?: string | null };
  client: { id: string; firstName: string; lastName: string; phone: string; email?: string | null };
  service: { id: string; name: string; price: number; durationMinutes: number; category: string };
}

type ViewMode = "giorno" | "settimana" | "mese";

const ORE_GIORNATA = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export default function BarberlyCalendarioPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("giorno");
  const [selectedBarberId, setSelectedBarberId] = useState<string>("ALL");

  const [barbieri, setBarbieri] = useState<Barber[]>([]);
  const [appuntamenti, setAppuntamenti] = useState<ApptItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modali
  const [nuovoModalOpen, setNuovoModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
    barberId?: string;
  }>({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
  });
  const [selectedAppt, setSelectedAppt] = useState<ApptItem | null>(null);

  // Fetch dati
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, aRes] = await Promise.all([
        fetch("/api/barbieri"),
        fetch("/api/appointments?stato=ALL"),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBarbieri(bData.barbieri || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAppuntamenti(aData.appuntamenti || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigazione Date
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "giorno") d.setDate(d.getDate() - 1);
    else if (viewMode === "settimana") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "giorno") d.setDate(d.getDate() + 1);
    else if (viewMode === "settimana") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Formatta titolo periodo
  const periodTitle = useMemo(() => {
    if (viewMode === "giorno") {
      return currentDate.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (viewMode === "settimana") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
      })} - ${end.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }
    return currentDate.toLocaleDateString("it-IT", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate, viewMode]);

  // Filtro Barbieri attivi
  const activeBarbers = useMemo(() => {
    if (selectedBarberId === "ALL") return barbieri;
    return barbieri.filter((b) => b.id === selectedBarberId);
  }, [barbieri, selectedBarberId]);

  // Appuntamenti del giorno selezionato
  const appuntamentiGiorno = useMemo(() => {
    const targetDateStr = currentDate.toISOString().split("T")[0];
    return appuntamenti.filter((a) => {
      const aDateStr = new Date(a.date).toISOString().split("T")[0];
      return aDateStr === targetDateStr;
    });
  }, [appuntamenti, currentDate]);

  const openSlotCreate = (time: string, bId?: string) => {
    setSelectedSlot({
      date: currentDate.toISOString().split("T")[0],
      time,
      barberId: bId,
    });
    setNuovoModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-500" />
            Calendario Poltrone & Orari
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizzazione dinamica per poltrona/barbiere, slot liberi e cambio orario rapido.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSlot({
              date: currentDate.toISOString().split("T")[0],
              time: "10:00",
            });
            setNuovoModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuovo Appuntamento
        </button>
      </div>

      {/* Controlli Vista, Periodo e Filtro Barbiere */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Navigatore Data */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Oggi
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="font-bold text-sm text-white capitalize px-2">
            {periodTitle}
          </span>
        </div>

        {/* Modalità Vista & Filtro Barbiere */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Filtro Poltrona */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Poltrona:</span>
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tutte le Poltrone</option>
              {barbieri.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome} {b.soprannome ? `(${b.soprannome})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Selettore Vista */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("giorno")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "giorno"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Giorno
            </button>
            <button
              onClick={() => setViewMode("settimana")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "settimana"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Settimana
            </button>
          </div>
        </div>
      </div>

      {/* Vista Calendario */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Caricamento agenda...
        </div>
      ) : viewMode === "giorno" ? (
        /* VISTA GIORNO: COLONNE POLTRONE */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {activeBarbers.map((b) => {
              const apptsForBarber = appuntamentiGiorno.filter(
                (a) => a.barber.id === b.id
              );

              return (
                <div key={b.id} className="p-4 space-y-4">
                  {/* Intestazione Colonna Barbiere */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-xs"
                        style={{ backgroundColor: b.colore }}
                      >
                        💈
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{b.nome}</h3>
                        <p className="text-[11px] text-amber-400 font-mono">
                          {b.soprannome ? `"${b.soprannome}"` : "Poltrona Attiva"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {apptsForBarber.length} prenotati
                    </span>
                  </div>

                  {/* Slot orari della giornata */}
                  <div className="space-y-2">
                    {ORE_GIORNATA.map((slot) => {
                      const apptInSlot = apptsForBarber.find(
                        (a) => a.startTime === slot
                      );

                      if (apptInSlot) {
                        return (
                          <div
                            key={apptInSlot.id}
                            onClick={() => setSelectedAppt(apptInSlot)}
                            className="p-3 rounded-xl border border-amber-500/30 bg-slate-950/80 hover:border-amber-500/60 transition cursor-pointer space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-amber-400">
                                {apptInSlot.startTime} - {apptInSlot.endTime}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                  apptInSlot.status === "COMPLETED"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : apptInSlot.status === "IN_PROGRESS"
                                    ? "bg-blue-500/20 text-blue-300 animate-pulse"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {apptInSlot.status}
                              </span>
                            </div>

                            <div className="font-bold text-xs text-white">
                              {apptInSlot.client.firstName} {apptInSlot.client.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between">
                              <span>{apptInSlot.service.name}</span>
                              <span className="font-mono text-slate-300">
                                € {apptInSlot.service.price}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={slot}
                          onClick={() => openSlotCreate(slot, b.id)}
                          className="px-3 py-2 rounded-xl border border-dashed border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-800/40 transition cursor-pointer flex items-center justify-between text-xs text-slate-500 group"
                        >
                          <span className="font-mono text-[11px] group-hover:text-amber-400">
                            {slot}
                          </span>
                          <span className="text-[10px] text-slate-600 group-hover:text-slate-300 font-semibold flex items-center gap-1">
                            <Plus className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            Disponibile
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISTA SETTIMANA: PANORAMICA 7 GIORNI */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-x-auto shadow-xs">
          <div className="min-w-[800px] grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(currentDate);
              const day = d.getDay();
              const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i;
              d.setDate(diff);

              const dateStr = d.toISOString().split("T")[0];
              const isToday =
                new Date().toISOString().split("T")[0] === dateStr;
              const apptsOfDay = appuntamenti.filter((a) => {
                const aD = new Date(a.date).toISOString().split("T")[0];
                return (
                  aD === dateStr &&
                  (selectedBarberId === "ALL" || a.barber.id === selectedBarberId)
                );
              });

              return (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[300px] ${
                    isToday
                      ? "bg-slate-950 border-amber-500/50 shadow-sm"
                      : "bg-slate-950/60 border-slate-800"
                  }`}
                >
                  <div>
                    <div className="text-center pb-2 border-b border-slate-800 mb-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {d.toLocaleDateString("it-IT", { weekday: "short" })}
                      </p>
                      <p
                        className={`text-base font-black ${
                          isToday ? "text-amber-400" : "text-white"
                        }`}
                      >
                        {d.getDate()}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      {apptsOfDay.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setSelectedAppt(a)}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer text-[11px]"
                        >
                          <div className="font-mono text-[10px] text-amber-400 font-bold">
                            {a.startTime}
                          </div>
                          <div className="font-bold text-white truncate">
                            {a.client.firstName} {a.client.lastName}
                          </div>
                          <div className="text-slate-400 truncate text-[10px]">
                            {a.service.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSlot({
                        date: dateStr,
                        time: "10:00",
                        barberId:
                          selectedBarberId !== "ALL" ? selectedBarberId : undefined,
                      });
                      setNuovoModalOpen(true);
                    }}
                    className="w-full mt-2 py-1.5 text-center text-[10px] font-bold text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 rounded-xl transition"
                  >
                    + Prenota
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modale Nuovo Appuntamento */}
      <NuovoAppuntamentoModal
        isOpen={nuovoModalOpen}
        onClose={() => setNuovoModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        initialDate={selectedSlot.date}
        initialTime={selectedSlot.time}
        initialBarberId={selectedSlot.barberId}
      />

      {/* Modale Gestione / Modifica Appuntamento */}
      <GestioneModificaModal
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        onUpdate={() => {
          fetchData();
        }}
      />
    </div>
  );
}
