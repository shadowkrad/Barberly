"use client";

import { useState, useEffect } from "react";
import { Scissors, Clock, Calendar, Users, Phone, Mail, Plus, X, Check } from "lucide-react";

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

  useEffect(() => {
    if (isOpen) {
      if (initialBarberId) setSelectedBarberId(initialBarberId);
      if (initialDate) setDate(initialDate);
      if (initialTime) setStartTime(initialTime);

      Promise.all([
        fetch("/api/barbieri").then((r) => r.json()),
        fetch("/api/listino").then((r) => r.json()),
        fetch("/api/clienti?limit=50").then((r) => r.json()),
      ])
        .then(([barbData, listData, clientData]) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

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
