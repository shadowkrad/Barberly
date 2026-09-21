"use client";

import React, { useState } from "react";
import {
  Clock,
  User,
  CheckCircle,
  XCircle,
  Scissors,
  Phone,
  MessageSquare,
  Sparkles,
  Award,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface AppointmentItem {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  pricePaid?: number | null;
  barber: {
    id: string;
    name: string;
    nickname?: string | null;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    loyaltyPoints: number;
  };
  service: {
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  };
}

interface AppointmentTimelineProps {
  initialAppointments: AppointmentItem[];
  hasWhatsAppModule: boolean;
  hasLoyaltyModule: boolean;
  onRefresh?: () => void;
}

export function AppointmentTimeline({
  initialAppointments,
  hasWhatsAppModule,
  hasLoyaltyModule,
  onRefresh,
}: AppointmentTimelineProps) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [filterBarber, setFilterBarber] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Elenco unico barbieri per filtro
  const barbers = Array.from(
    new Map(appointments.map((a) => [a.barber.id, a.barber])).values()
  );

  const filtered = appointments.filter((a) => {
    if (filterBarber === "ALL") return true;
    return a.barber.id === filterBarber;
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Errore aggiornamento:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Completato
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            In Programma
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Annullato
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
      {/* Header e filtri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            Timeline Appuntamenti di Oggi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestione in tempo reale dei passaggi in poltrona e dello stato cliente
          </p>
        </div>

        {/* Filtro Poltrona / Barbiere */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filtra per:</span>
          <select
            value={filterBarber}
            onChange={(e) => setFilterBarber(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            <option value="ALL">Tutte le Poltrone</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} {b.nickname ? `(${b.nickname})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista Appuntamenti */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600 font-medium text-sm">
          Nessun appuntamento trovato per i criteri selezionati.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((item) => {
            const isFinished = item.status === "COMPLETED" || item.status === "CANCELLED";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.status === "COMPLETED"
                    ? "bg-slate-50/40 border-slate-200 opacity-75"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Orario e Info Servizio */}
                  <div className="flex items-start gap-3.5">
                    {/* Badge orario */}
                    <div className="flex flex-col items-center justify-center min-w-16 py-2 px-2.5 rounded-xl bg-slate-900 text-white font-mono text-center">
                      <span className="text-sm font-bold tracking-tight">
                        {item.startTime}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {item.endTime}
                      </span>
                    </div>

                    {/* Cliente e Servizio */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.client.firstName} {item.client.lastName}
                        </span>

                        {hasLoyaltyModule && item.client.loyaltyPoints > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            <Award className="w-3 h-3 text-purple-600" />
                            {item.client.loyaltyPoints} pt
                          </span>
                        )}

                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <Scissors className="w-3.5 h-3.5 text-amber-600" />
                          {item.service.name}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-mono font-semibold">
                          {formatPrice(item.pricePaid || item.service.price)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <User className="w-3.5 h-3.5" />
                          Poltrona: <strong>{item.barber.name}</strong>
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-500 italic mt-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Azioni veloci & Contatti */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Pulsante WhatsApp se modulo attivo */}
                    {hasWhatsAppModule && (
                      <a
                        href={`https://wa.me/${item.client.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Invia WhatsApp al cliente"
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {/* Telefono */}
                    <a
                      href={`tel:${item.client.phone}`}
                      title={`Chiama ${item.client.phone}`}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {/* Tasti cambio stato */}
                    {!isFinished && (
                      <>
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                          className="taaaac-btn-primary text-xs py-2 px-3.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Concludi
                        </button>
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateStatus(item.id, "CANCELLED")}
                          className="taaaac-btn-secondary text-xs py-2 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {item.status === "COMPLETED" && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5" />
                        Servizio Eseguito
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
