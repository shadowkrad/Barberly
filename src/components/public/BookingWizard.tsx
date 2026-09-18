"use client";

import React, { useState } from "react";
import {
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Award,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  category: string;
}

interface BarberItem {
  id: string;
  name: string;
  nickname?: string | null;
}

interface BookingWizardProps {
  services: ServiceItem[];
  barbers: BarberItem[];
  brandName: string;
  phone?: string | null;
}

const AVAILABLE_SLOTS = [
  "09:30",
  "10:15",
  "11:00",
  "11:45",
  "12:30",
  "14:30",
  "15:15",
  "16:00",
  "16:45",
  "17:30",
  "18:15",
  "19:00",
];

export function BookingWizard({
  services,
  barbers,
  brandName,
  phone,
}: BookingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    services[0] || null
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string>("ANY");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>("10:15");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTime || !customerName || !customerPhone) {
      setErrorMsg("Per favore compila tutti i campi richiesti.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          barberId: selectedBarberId,
          date: selectedDate,
          time: selectedTime,
          customerName,
          customerPhone,
          customerEmail,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore durante la prenotazione");
      }

      setBookingSuccess(data.appointment);
      setStep(5);
    } catch (err: any) {
      setErrorMsg(err.message || "Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const selectedBarberName =
    selectedBarberId === "ANY"
      ? "Qualsiasi barbiere disponibile"
      : barbers.find((b) => b.id === selectedBarberId)?.name || "Barbiere";

  return (
    <div
      id="prenota"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto"
    >
      {/* Progress Steps Header */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <span className={step >= 1 ? "text-amber-600 font-bold" : ""}>
              1. Servizio
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 2 ? "text-amber-600 font-bold" : ""}>
              2. Barbiere
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 3 ? "text-amber-600 font-bold" : ""}>
              3. Data & Ora
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 4 ? "text-amber-600 font-bold" : ""}>
              4. I Tuoi Dati
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Scelta Servizio */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Scegli il tuo Trattamento
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Seleziona il servizio desiderato tra tagli classici, cura della barba e rituali completi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {services.map((srv) => {
              const isSelected = selectedService?.id === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-amber-600 bg-amber-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {srv.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {srv.description || "Servizio professionale Barberly."}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-700 font-mono ml-2">
                      {formatPrice(srv.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px] font-medium text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{srv.durationMinutes} minuti</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="taaaac-btn-accent text-sm"
            >
              <span>Continua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Scelta Barbiere */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Scegli il tuo Barbiere di Fiducia
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Affidati al tuo barbiere preferito oppure scegli il primo disponibile per la massima flessibilità.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Qualsiasi */}
            <div
              onClick={() => setSelectedBarberId("ANY")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                selectedBarberId === "ANY"
                  ? "border-amber-600 bg-amber-50/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Prima Poltrona Libera
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Consigliato per gli orari più richiesti
              </p>
            </div>

            {barbers.map((b) => {
              const isSelected = selectedBarberId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                    isSelected
                      ? "border-amber-600 bg-amber-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center mb-3 border border-slate-200">
                    {b.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                  {b.nickname && (
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">
                      "{b.nickname}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Master Barber
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="taaaac-btn-secondary text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="taaaac-btn-accent text-sm"
            >
              <span>Scegli Data e Ora</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Data e Orario */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Data e Slot Orario
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Seleziona il giorno e l'orario perfetto per il tuo appuntamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selettore Giorno */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Seleziona Giorno
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Riepilogo Scelta:</p>
                <p className="mt-1">
                  <strong>Servizio:</strong> {selectedService?.name} (
                  {selectedService?.durationMinutes} min)
                </p>
                <p>
                  <strong>Barbiere:</strong> {selectedBarberName}
                </p>
              </div>
            </div>

            {/* Griglia Orari Disponibili */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Orari Disponibili
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {AVAILABLE_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-amber-400 shadow-xs ring-2 ring-amber-500"
                          : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="taaaac-btn-secondary text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="taaaac-btn-accent text-sm"
            >
              <span>Inserisci i Tuoi Dati</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Dati Cliente & Conferma */}
      {step === 4 && (
        <form onSubmit={handleSubmitBooking} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              I tuoi recapiti per la conferma
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Riceverai il promemoria dell'appuntamento direttamente via WhatsApp o SMS.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome e Cognome *
              </label>
              <input
                type="text"
                required
                placeholder="Es. Mario Rossi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numero di Telefono (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                placeholder="Es. 340 1234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (opzionale)
              </label>
              <input
                type="email"
                placeholder="mario.rossi@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note o Preferenze (opzionale)
              </label>
              <input
                type="text"
                placeholder="Es. Preferisco forbice a lama piena, barba sfumata a zero..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Scheda Riepilogo Prezzo */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Totale al banco:</p>
              <p className="text-lg font-bold text-slate-900">
                {selectedService?.name}
              </p>
              <p className="text-xs text-slate-500">
                {selectedDate} alle {selectedTime} con {selectedBarberName}
              </p>
            </div>
            <span className="text-2xl font-extrabold text-amber-600 font-mono">
              {formatPrice(selectedService?.price || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="taaaac-btn-secondary text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="taaaac-btn-accent text-sm px-6 shadow-md"
            >
              {loading ? (
                <span>Elaborazione in corso...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conferma Prenotazione</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Successo Prenotazione */}
      {step === 5 && bookingSuccess && (
        <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Prenotazione Confermata
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
              Ti aspettiamo in poltrona, {bookingSuccess.clientName}!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Il tuo appuntamento è stato registrato con successo nel sistema Barberly.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Servizio:</span>
              <span className="font-bold text-slate-900">
                {bookingSuccess.serviceName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Barbiere:</span>
              <span className="font-bold text-slate-900">
                {bookingSuccess.barberName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Orario:</span>
              <span className="font-bold text-slate-900 font-mono">
                {bookingSuccess.startTime} - {bookingSuccess.endTime}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Importo previsto:</span>
              <span className="font-bold text-amber-600 font-mono">
                {formatPrice(bookingSuccess.price)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Ciao! Ho appena prenotato un appuntamento per ${bookingSuccess.serviceName} alle ${bookingSuccess.startTime}. Nome: ${bookingSuccess.clientName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="taaaac-btn-secondary text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Invia promemoria WhatsApp al salone</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setBookingSuccess(null);
                setCustomerName("");
                setCustomerPhone("");
              }}
              className="taaaac-btn-primary text-xs w-full sm:w-auto"
            >
              Nuova Prenotazione
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
