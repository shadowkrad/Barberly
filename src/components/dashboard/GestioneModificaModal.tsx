"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Scissors,
  Users,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Trash2,
  X,
  Check,
  Edit2,
  Save,
} from "lucide-react";
import { apriWhatsAppWeb, generaMessaggioWhatsAppPromemoria, generaLinkWhatsApp } from "@/lib/whatsapp";

interface Appointment {
  id: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  pricePaid?: number | null;
  barber: { id: string; name: string; nickname?: string | null };
  client: { id: string; firstName: string; lastName: string; phone: string; email?: string | null };
  service: { id: string; name: string; price: number; durationMinutes: number };
}

interface Barber {
  id: string;
  name: string;
  nickname?: string | null;
}

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function GestioneModificaModal({
  appointment,
  onClose,
  onUpdate,
}: Props) {
  const [barbieri, setBarbieri] = useState<Barber[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(appointment?.status || "CONFIRMED");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [barberId, setBarberId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      const d = new Date(appointment.date);
      setDate(d.toISOString().split("T")[0]);
      setStartTime(appointment.startTime);
      setBarberId(appointment.barber.id);
      setNotes(appointment.notes || "");
      setIsEditing(false);

      fetch("/api/barbieri")
        .then((r) => r.json())
        .then((data) => {
          setBarbieri(data.barbieri || []);
        })
        .catch(() => {});
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        setFeedback(`Stato aggiornato a: ${newStatus}`);
        setTimeout(() => setFeedback(null), 2500);
        onUpdate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startTime,
          barberId,
          notes,
        }),
      });
      if (res.ok) {
        setFeedback("Dettagli appuntamento aggiornati!");
        setIsEditing(false);
        setTimeout(() => setFeedback(null), 2500);
        onUpdate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (!appointment.client.phone) return;
    const dStr = new Date(appointment.date).toLocaleDateString("it-IT");
    const dataOraStr = `${dStr} alle ore ${appointment.startTime}`;
    const msg = generaMessaggioWhatsAppPromemoria({
      nomeCliente: appointment.client.firstName,
      servizio: appointment.service.name,
      dataOra: dataOraStr,
      barbiere: appointment.barber.name,
      nomeSalone: "Barberly Studio",
    });
    apriWhatsAppWeb(appointment.client.phone, msg);
  };

  const handleDelete = async () => {
    if (confirm("Sei sicuro di voler annullare definitivamente questo appuntamento?")) {
      await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              💈
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Gestione Appuntamento
              </h2>
              <p className="text-[11px] text-slate-400">
                {appointment.client.firstName} {appointment.client.lastName} • {appointment.service.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Azioni Rapide Contatto */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-white">
              {appointment.client.firstName} {appointment.client.lastName}
            </p>
            <p className="text-[11px] font-mono text-slate-400">{appointment.client.phone}</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${appointment.client.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Chiama
            </a>
            <button
              onClick={handleWhatsApp}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Azioni Cambio Stato One-Touch */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 block">
            Stato Appuntamento (Attuale: <span className="text-amber-400">{status}</span>)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleUpdateStatus("CONFIRMED")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                status === "CONFIRMED"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              Confermato
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("IN_PROGRESS")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                status === "IN_PROGRESS"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              In Poltrona 💈
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("COMPLETED")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                status === "COMPLETED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              Completato ✓
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("NO_SHOW")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                status === "NO_SHOW"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              No-Show ⚠️
            </button>
          </div>
        </div>

        {/* Form Modifica Orario / Barbiere */}
        {isEditing ? (
          <form onSubmit={handleSaveDetails} className="space-y-3 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Orario
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Barbiere Assegnato
              </label>
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {barbieri.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.nickname ? `(${b.nickname})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Salva Modifiche
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span>Orario: </span>
              <strong className="text-white font-mono">{appointment.startTime} - {appointment.endTime}</strong>
              <span className="mx-2">•</span>
              <span>Barbiere: </span>
              <strong className="text-white">{appointment.barber.name}</strong>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Sposta / Riprogramma
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleDelete}
            type="button"
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Annulla Appuntamento
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
