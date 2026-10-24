"use client";

import { useState, useEffect, useMemo } from "react";
import { Scissors, Clock, Calendar, Users, Phone, Mail, Plus, X, Check } from "lucide-react";

interface OrarioGiorno {
  giorno: number;
  oraInizio: string;
  oraFine: string;
  pausaInizio?: string | null;
  pausaFine?: string | null;
  attivo: boolean;
}

interface Barber {
  id: string;
  name: string;
  nickname?: string | null;
  color?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  initialTime?: string;
  initialBarberId?: string;
}

export default function NuovoAppuntamentoModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
  initialBarberId,
}: Props) {
  const [barbieri, setBarbieri] = useState<Barber[]>([]);
  const [servizi, setServizi] = useState<Service[]>([]);
  const [clienti, setClienti] = useState<Client[]>([]);

  const [selectedBarberId, setSelectedBarberId] = useState(initialBarberId || "");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(initialTime || "10:00");
  const [channel, setChannel] = useState("PHONE");
  const [notes, setNotes] = useState("");

  // Modalità creazione nuovo cliente al volo
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [newClient, setNewClient] = useState({
    nome: "",
    cognome: "",
    telefono: "",
    email: "",
    noteCliente: "",
  });

  const [clientSearch, setClientSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Orari di apertura e gestione eccezione fuori orario
  const [workingHours, setWorkingHours] = useState<OrarioGiorno[]>([]);
  const [confermaFuoriOrarioRichiesta, setConfermaFuoriOrarioRichiesta] = useState(false);
  const [confermaFuoriOrarioAccettata, setConfermaFuoriOrarioAccettata] = useState(false);

  const selectedService = servizi.find((s) => s.id === selectedServiceId) || servizi[0] || null;

  const calculatedEndTime = useMemo(() => {
    if (!startTime) return "";
    const [h, m] = startTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "";
    const duration = selectedService?.durationMinutes || 30;
    const totalMin = h * 60 + m + duration;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
  }, [startTime, selectedService]);

  const infoFuoriOrario = useMemo(() => {
    if (!date || !startTime || workingHours.length === 0) return null;
    try {
      const [y, m, d] = date.split("-").map(Number);
      if (!y || !m || !d) return null;
      const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Dom, 1 = Lun, etc.
      const wh = workingHours.find((w) => w.giorno === dayOfWeek);

      const endTime = calculatedEndTime;

      // 1. Giorno chiuso
      if (!wh || !wh.attivo) {
        return {
          tipo: "GIORNO_CHIUSO",
          titolo: "Giorno di Chiusura",
          motivo: "La barberia risulta chiusa nella giornata selezionata (es. Domenica o riposo settimanale).",
          orarioRichiesto: `${startTime} – ${endTime}`,
          orarioApertura: "Chiuso",
        };
      }

      // 2. Prima dell'apertura
      if (wh.oraInizio && startTime < wh.oraInizio) {
        return {
          tipo: "PRIMA_APERTURA",
          titolo: "Orario Precedente all'Apertura",
          motivo: `L'orario di inizio (${startTime}) precede l'apertura stabilita delle ${wh.oraInizio}.`,
          orarioRichiesto: `${startTime} – ${endTime}`,
          orarioApertura: `Apertura ore ${wh.oraInizio} — Chiusura ore ${wh.oraFine}`,
        };
      }

      // 3. Dopo la chiusura
      if (wh.oraFine && endTime > wh.oraFine) {
        return {
          tipo: "DOPO_CHIUSURA",
          titolo: "Orario Oltre l'Orario di Chiusura",
          motivo: `La conclusione del servizio (${endTime}) supera l'orario di chiusura stabilito delle ${wh.oraFine}.`,
          orarioRichiesto: `${startTime} – ${endTime}`,
          orarioApertura: `Apertura ore ${wh.oraInizio} — Chiusura ore ${wh.oraFine}`,
        };
      }

      // 4. Pausa pranzo
      if (wh.pausaInizio && wh.pausaFine) {
        const sovrapponePausa = startTime < wh.pausaFine && endTime > wh.pausaInizio;
        if (sovrapponePausa) {
          return {
            tipo: "DURANTE_PAUSA",
            titolo: "Appuntamento Durante la Pausa",
            motivo: `L'appuntamento (${startTime} – ${endTime}) ricade durante l'intervallo di pausa (${wh.pausaInizio} – ${wh.pausaFine}).`,
            orarioRichiesto: `${startTime} – ${endTime}`,
            orarioApertura: `Pausa: ${wh.pausaInizio} – ${wh.pausaFine}`,
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }, [date, startTime, calculatedEndTime, workingHours]);

  useEffect(() => {
    if (isOpen) {
      if (initialBarberId) setSelectedBarberId(initialBarberId);
      if (initialDate) setDate(initialDate);
      if (initialTime) setStartTime(initialTime);

      setConfermaFuoriOrarioRichiesta(false);
      setConfermaFuoriOrarioAccettata(false);

      Promise.all([
        fetch("/api/barbieri").then((r) => r.json()),
        fetch("/api/listino").then((r) => r.json()),
        fetch("/api/clienti?limit=50").then((r) => r.json()),
        fetch("/api/orari").then((r) => r.json()).catch(() => []),
      ])
        .then(([barbData, listData, clientData, whData]) => {
          const bList = (barbData.barbieri || []).map((b: any) => ({
            id: b.id,
            name: b.nome,
            nickname: b.soprannome,
            color: b.colore,
          }));
          setBarbieri(bList);
          if (!selectedBarberId && bList.length > 0) {
            setSelectedBarberId(bList[0].id);
          }

          const sList = (listData.trattamenti || []).map((s: any) => ({
            id: s.id,
            name: s.nome,
            price: s.prezzo,
            durationMinutes: s.durata,
            category: s.categoria,
          }));
          setServizi(sList);
          if (sList.length > 0) {
            setSelectedServiceId(sList[0].id);
          }

          const cList = (clientData.clienti || []).map((c: any) => ({
            id: c.id,
            firstName: c.nome,
            lastName: c.cognome,
            phone: c.telefono,
            email: c.email,
          }));
          setClienti(cList);
          if (Array.isArray(whData)) {
            setWorkingHours(whData);
          }
        })
        .catch((err) => console.error("Errore fetch modale:", err));
    }
  }, [isOpen, initialBarberId, initialDate, initialTime]);

  if (!isOpen) return null;

  const filteredClients = clienti.filter(
    (c) =>
      c.firstName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.lastName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  );

  const handleSubmit = async (e?: React.FormEvent, forceFuoriOrario = false) => {
    if (e) e.preventDefault();
    setError(null);

    // Se l'orario ricade fuori dall'apertura o in chiusura e non è confermata l'eccezione
    if (infoFuoriOrario && !forceFuoriOrario && !confermaFuoriOrarioAccettata) {
      setConfermaFuoriOrarioRichiesta(true);
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        barberId: selectedBarberId,
        serviceId: selectedServiceId,
        date,
        startTime,
        channel,
        notes,
      };

      if (isNewClientMode) {
        if (!newClient.nome || !newClient.telefono) {
          throw new Error("Nome e numero di telefono sono obbligatori per il nuovo cliente");
        }
        payload.nuovoCliente = newClient;
      } else {
        if (!selectedClientId) {
          throw new Error("Seleziona un cliente esistente o crea un nuovo cliente al volo");
        }
        payload.clientId = selectedClientId;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const d = await res.json();
        throw new Error(d.error || "Errore nella creazione appuntamento");
      }
    } catch (err: any) {
      setError(err.message || "Errore");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Nuovo Appuntamento in Poltrona
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Conferma Appuntamento Fuori Orario / Chiusura */}
        {confermaFuoriOrarioRichiesta && infoFuoriOrario && (
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500 rounded-2xl text-amber-200 space-y-3 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl shrink-0 font-bold shadow-md">
                ⚠️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Controllo Orari Barberia
                  </span>
                  <h4 className="text-sm font-bold text-amber-300">
                    {infoFuoriOrario.titolo}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {infoFuoriOrario.motivo}
                </p>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Orario richiesto:</span>
                    <strong className="text-amber-400 font-bold">{infoFuoriOrario.orarioRichiesto}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Orario ufficiale:</span>
                    <strong className="text-slate-200 font-semibold">{infoFuoriOrario.orarioApertura}</strong>
                  </div>
                </div>
                <p className="text-xs text-amber-300 pt-1 font-semibold">
                  Stai effettuando questo appuntamento di proposito come eccezione concordata con il cliente, oppure si tratta di un errore di inserimento?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => {
                  setConfermaFuoriOrarioAccettata(true);
                  setConfermaFuoriOrarioRichiesta(false);
                  handleSubmit(undefined, true);
                }}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Salvataggio in corso...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Conferma Eccezione Fuori Orario</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setConfermaFuoriOrarioRichiesta(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                ✕ Annulla e Correggi Orario
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sezione Barbiere & Canale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Barbiere / Poltrona *
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                Canale Prenotazione
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="PHONE">📞 Telefonico</option>
                <option value="WALK_IN">🏢 In Bottega (Walk-in)</option>
                <option value="WHATSAPP">💬 WhatsApp</option>
                <option value="MANUAL">📝 Manuale Staff</option>
                <option value="WEB">🌐 Online Booking</option>
              </select>
            </div>
          </div>

          {/* Servizio */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Servizio / Taglio *
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {servizi.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} • {s.durationMinutes} min • € {s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Data e Ora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Orario Inizio *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Scelta Cliente */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                {isNewClientMode ? "Nuovo Cliente al Volo" : "Cliente in Archivio"}
              </span>
              <button
                type="button"
                onClick={() => setIsNewClientMode(!isNewClientMode)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                {isNewClientMode ? "← Cerca Esistente" : "+ Nuovo Cliente"}
              </button>
            </div>

            {isNewClientMode ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nome *"
                    value={newClient.nome}
                    onChange={(e) => setNewClient({ ...newClient, nome: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Cognome"
                    value={newClient.cognome}
                    onChange={(e) => setNewClient({ ...newClient, cognome: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Cellulare *"
                    value={newClient.telefono}
                    onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="email"
                    placeholder="Email (opzionale)"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Digita per filtrare cliente (nome o telefono)..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Seleziona Cliente --</option>
                  {filteredClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Note Appuntamento */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Note Appuntamento / Richieste Particolari
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. Sfumatura alta, panno caldo doppio..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Pulsanti Azione */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Creazione..." : "Conferma Prenotazione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
