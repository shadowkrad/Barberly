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
  Save,
  DollarSign,
  FileText,
} from "lucide-react";
import { apriWhatsAppWeb, generaMessaggioWhatsAppPromemoria } from "@/lib/whatsapp";

interface BarberItem {
  id: string;
  nome?: string;
  name?: string;
  soprannome?: string;
  nickname?: string;
  colore?: string;
  color?: string;
}

interface ServiceItem {
  id: string;
  nome?: string;
  name?: string;
  durata?: number;
  durationMinutes?: number;
  prezzo?: number;
  price?: number;
  categoria?: string;
  category?: string;
  colore?: string;
  color?: string;
}

interface Props {
  appointment?: any | null;
  appuntamento?: any | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onSuccess?: () => void;
}

export default function GestioneModificaModal({
  appointment,
  appuntamento,
  isOpen,
  onClose,
  onUpdate,
  onSuccess,
}: Props) {
  const currentAppt = appointment || appuntamento;
  const isModalOpen = isOpen !== undefined ? isOpen : !!currentAppt;

  const [barbieri, setBarbieri] = useState<BarberItem[]>([]);
  const [servizi, setServizi] = useState<ServiceItem[]>([]);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durata, setDurata] = useState<number>(30);
  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [pricePaid, setPricePaid] = useState<string>("");
  const [status, setStatus] = useState("CONFIRMED");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fetch lista Barbieri e Listino Servizi
  useEffect(() => {
    if (isModalOpen) {
      fetch("/api/barbieri")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.barbieri)) setBarbieri(data.barbieri);
          else if (Array.isArray(data.operatori)) setBarbieri(data.operatori);
          else if (Array.isArray(data)) setBarbieri(data);
        })
        .catch(() => {});

      fetch("/api/listino")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.trattamenti)) setServizi(data.trattamenti);
          else if (Array.isArray(data)) setServizi(data);
        })
        .catch(() => {});
    }
  }, [isModalOpen]);

  // Inizializzazione dai dati appuntamento
  useEffect(() => {
    if (currentAppt) {
      try {
        const rawDate = currentAppt.date || currentAppt.dataOra;
        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            setDate(d.toISOString().split("T")[0]);
          } else {
            setDate(new Date().toISOString().split("T")[0]);
          }
        } else {
          setDate(new Date().toISOString().split("T")[0]);
        }
      } catch {
        setDate(new Date().toISOString().split("T")[0]);
      }

      setStartTime(currentAppt.startTime || "09:00");

      const dur =
        currentAppt.service?.durationMinutes ||
        currentAppt.service?.durata ||
        currentAppt.durata ||
        30;
      setDurata(Number(dur) || 30);

      setBarberId(
        currentAppt.barber?.id ||
        currentAppt.barberId ||
        currentAppt.operatore?.id ||
        currentAppt.operatoreId ||
        ""
      );

      setServiceId(
        currentAppt.service?.id ||
        currentAppt.serviceId ||
        currentAppt.trattamento?.id ||
        currentAppt.trattamentoId ||
        ""
      );

      const price =
        currentAppt.pricePaid ??
        currentAppt.service?.price ??
        currentAppt.prezzoStimato;
      setPricePaid(price !== null && price !== undefined ? String(price) : "");

      setStatus(currentAppt.status || currentAppt.stato || "CONFIRMED");
      setNotes(currentAppt.notes || currentAppt.note || "");
      setError(null);
      setFeedback(null);
    }
  }, [currentAppt]);

  if (!isModalOpen || !currentAppt) return null;

  // Calcolo fine orario dinamico
  const computeEndTime = () => {
    if (!startTime) return "09:30";
    const [h, m] = startTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "09:30";
    const totalMin = h * 60 + m + (durata || 30);
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  const handleServiceChange = (newServiceId: string) => {
    setServiceId(newServiceId);
    const found = servizi.find((s) => s.id === newServiceId);
    if (found) {
      const d = found.durationMinutes || found.durata;
      if (d) setDurata(d);
      const p = found.price ?? found.prezzo;
      if (p !== undefined && p !== null) setPricePaid(String(p));
    }
  };

  const notifySuccess = () => {
    if (onUpdate) onUpdate();
    if (onSuccess) onSuccess();
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const endTime = computeEndTime();
      const payload: any = {
        date,
        startTime,
        endTime,
        barberId: barberId || undefined,
        serviceId: serviceId || undefined,
        pricePaid: pricePaid !== "" ? parseFloat(pricePaid) : null,
        status,
        notes: notes || null,
      };

      const res = await fetch(`/api/appointments/${currentAppt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Errore durante il salvataggio delle modifiche.");
      }

      setFeedback("✓ Prenotazione aggiornata con successo!");
      setTimeout(() => {
        notifySuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatusQuick = async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${currentAppt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setFeedback(`✓ Stato aggiornato a: ${newStatus}`);
        setTimeout(() => setFeedback(null), 2500);
        notifySuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler annullare definitivamente questo appuntamento?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${currentAppt.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        notifySuccess();
        onClose();
      } else {
        throw new Error("Errore durante l'annullamento.");
      }
    } catch (err: any) {
      setError(err.message || "Impossibile annullare l'appuntamento.");
    } finally {
      setSaving(false);
    }
  };

  const clientFirstName =
    currentAppt.client?.firstName || currentAppt.cliente?.nome || "Cliente";
  const clientLastName =
    currentAppt.client?.lastName || currentAppt.cliente?.cognome || "";
  const clientPhone =
    currentAppt.client?.phone || currentAppt.cliente?.telefono || "";
  const serviceName =
    currentAppt.service?.name ||
    currentAppt.service?.nome ||
    currentAppt.trattamento?.nome ||
    "Taglio / Servizio";
  const barberName =
    currentAppt.barber?.name ||
    currentAppt.barber?.nome ||
    currentAppt.operatore?.nome ||
    "Barbiere";

  const handleWhatsApp = () => {
    if (!clientPhone) return;
    let dataStr = date;
    try {
      if (date) {
        const [y, m, d] = date.split("-");
        dataStr = `${d}/${m}/${y}`;
      }
    } catch {}

    const msg = generaMessaggioWhatsAppPromemoria({
      nomeCliente: clientFirstName,
      servizio: serviceName,
      dataOra: `${dataStr} alle ore ${startTime}`,
      barbiere: barberName,
      nomeSalone: "Barberly Studio",
    });
    apriWhatsAppWeb(clientPhone, msg);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              💈
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Modifica Prenotazione
              </h2>
              <p className="text-xs text-slate-400">
                {clientFirstName} {clientLastName} • {serviceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback messaggi */}
        {feedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Box Cliente & Azioni Rapide Contatto */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-white">
              {clientFirstName} {clientLastName}
            </p>
            <p className="text-[11px] font-mono text-slate-400">{clientPhone || "Nessun telefono"}</p>
          </div>

          <div className="flex items-center gap-2">
            {clientPhone && (
              <a
                href={`tel:${clientPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Chiama
              </a>
            )}
            {clientPhone && (
              <button
                onClick={handleWhatsApp}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 active:scale-95 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* Cambio Rapido Stato One-Touch */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Stato Prenotazione
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {[
              { id: "CONFIRMED", label: "Confermato", activeClass: "bg-amber-500 text-slate-950" },
              { id: "PENDING", label: "In Attesa", activeClass: "bg-yellow-500 text-slate-950" },
              { id: "IN_PROGRESS", label: "In Poltrona", activeClass: "bg-blue-600 text-white" },
              { id: "COMPLETED", label: "Completato", activeClass: "bg-emerald-600 text-white" },
              { id: "NO_SHOW", label: "No-Show", activeClass: "bg-orange-600 text-white" },
              { id: "CANCELLED", label: "Annullato", activeClass: "bg-rose-600 text-white" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleUpdateStatusQuick(st.id)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center text-center cursor-pointer ${
                  status === st.id
                    ? `${st.activeClass} shadow-xs font-extrabold`
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* FORM COMPLETO MODIFICA */}
        <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800">
          {/* Data e Orario */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                📅 Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                🕒 Orario Inizio
              </label>
              <input
                type="time"
                step="900"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Servizio / Trattamento */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              ✂️ Servizio
            </label>
            <select
              value={serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="">Seleziona servizio dal listino...</option>
              {servizi.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.nome} — €{(s.price ?? s.prezzo ?? 0).toFixed(2)} ({s.durationMinutes || s.durata || 30} min)
                </option>
              ))}
            </select>
          </div>

          {/* Barbiere Assegnato */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              💈 Barbiere
            </label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="">Seleziona barbiere...</option>
              {barbieri.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || b.nome} {b.nickname || b.soprannome ? `(${b.nickname || b.soprannome})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Durata, Orario Fine e Prezzo Concordato */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                ⏱️ Durata & Fine
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={durata}
                  onChange={(e) => setDurata(Number(e.target.value) || 30)}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                />
                <span className="text-[11px] text-slate-400 font-mono">
                  fine: <strong className="text-amber-400 font-bold">{computeEndTime()}</strong>
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                💶 Prezzo (€)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="es. 25.00"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-emerald-400 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              📝 Note Appuntamento
            </label>
            <input
              type="text"
              placeholder="es. Taglio sfumato a pelle, barba corta, cliente ritardatario..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Footer & Pulsanti Azione */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleDelete}
              disabled={saving}
              type="button"
              className="w-full sm:w-auto text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl hover:bg-rose-950/30 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Annulla Appuntamento</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                type="button"
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Chiudi
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-lg shadow-amber-500/20"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salva Modifiche</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
