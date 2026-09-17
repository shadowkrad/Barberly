"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Calendar, Clock, Scissors, User } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  price?: number;
  durationMinutes?: number;
}

interface QuickBookingModalProps {
  barbers: OptionItem[];
  services: OptionItem[];
  clients: OptionItem[];
  onCreated?: () => void;
}

export function QuickBookingModal({
  barbers,
  services,
  clients,
  onCreated,
}: QuickBookingModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [barberId, setBarberId] = useState(barbers[0]?.id || "");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [startTime, setStartTime] = useState("12:30");
  const [endTime, setEndTime] = useState("13:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId,
          clientId,
          serviceId,
          startTime,
          endTime,
          notes,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        setNotes("");
        if (onCreated) {
          onCreated();
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="taaaac-btn-accent text-sm shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Nuovo Appuntamento</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registra Appuntamento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inserisci un nuovo passaggio in poltrona
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servizio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Servizio Richiesto
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} min - €{s.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Barbiere */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Barbiere / Poltrona
                </label>
                <select
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orari */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orario Inizio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orario Fine
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note aggiuntive
                </label>
                <input
                  type="text"
                  placeholder="Es. Richiede sfumatura zero, intolleranze prodotti..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Azioni */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="taaaac-btn-secondary text-xs"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="taaaac-btn-primary text-xs"
                >
                  {loading ? "Salvataggio..." : "Salva Appuntamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
