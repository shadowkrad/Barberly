"use client";

import React, { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Printer, X, Scissors, Phone, User, Check } from "lucide-react";

export interface BarberModal {
  id: string;
  nome: string;
  soprannome?: string | null;
  colore?: string;
  attivo?: boolean;
}

export interface AppuntamentoBarberModal {
  id: string;
  dataOra: string;
  durata: number;
  stato: string;
  note?: string | null;
  nomiServizi?: string | null;
  cliente: {
    id: string;
    nome: string;
    cognome: string;
    telefono?: string;
    email?: string | null;
  };
  barbiere?: {
    id: string;
    nome: string;
    soprannome?: string | null;
    colore?: string;
  };
  servizio?: {
    id: string;
    nome: string;
    colore?: string;
    durata?: number;
  };
}

interface ModalStampaSettimanaleA4Props {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  appuntamenti: AppuntamentoBarberModal[];
  barbieri: BarberModal[];
  selectedBarberId?: string;
  nomeSalone?: string;
}

export default function ModalStampaSettimanaleA4({
  isOpen,
  onClose,
  currentDate,
  appuntamenti,
  barbieri,
  selectedBarberId = "TUTTI",
  nomeSalone = "Barber Shop",
}: ModalStampaSettimanaleA4Props) {
  // Configurazioni di stampa
  const [rangeGiorni, setRangeGiorni] = useState<"6gg" | "7gg" | "5gg">("6gg");
  const [passoOrario, setPassoOrario] = useState<30 | 60>(30);
  const [mostraTelefono, setMostraTelefono] = useState<boolean>(true);
  const [mostraServizio, setMostraServizio] = useState<boolean>(true);
  const [barberFiltro, setBarberFiltro] = useState<string>(selectedBarberId);
  const [oraInizio, setOraInizio] = useState<number>(8); // 08:00
  const [oraFine, setOraFine] = useState<number>(20);   // 20:00

  // Calcolo giorni della settimana selezionata (Lunedì inizio settimana)
  const giorniSettimana = useMemo(() => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const count = rangeGiorni === "5gg" ? 5 : rangeGiorni === "6gg" ? 6 : 7;
    return Array.from({ length: count }, (_, i) => addDays(monday, i));
  }, [currentDate, rangeGiorni]);

  // Calcolo slot orari della giornata in base al passo scelto (30m o 60m)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = oraInizio; h < oraFine; h++) {
      const hStr = h.toString().padStart(2, "0");
      slots.push(`${hStr}:00`);
      if (passoOrario === 30) {
        slots.push(`${hStr}:30`);
      }
    }
    return slots;
  }, [oraInizio, oraFine, passoOrario]);

  // Filtra appuntamenti per barbiere selezionato ed esclude annullati
  const appuntamentiFiltrati = useMemo(() => {
    return appuntamenti.filter((a) => {
      if (a.stato === "ANNULLATO") return false;
      if (barberFiltro && barberFiltro !== "TUTTI") {
        return a.barbiere?.id === barberFiltro;
      }
      return true;
    });
  }, [appuntamenti, barberFiltro]);

  // Mappa di appuntamenti per giorno e slot
  const getAppuntamentiPerSlot = (giorno: Date, slotTime: string) => {
    const [sHour, sMin] = slotTime.split(":").map(Number);
    const slotStartMin = sHour * 60 + sMin;
    const slotEndMin = slotStartMin + passoOrario;

    return appuntamentiFiltrati.filter((a) => {
      const d = new Date(a.dataOra);
      if (!isSameDay(d, giorno)) return false;
      const apptStartMin = d.getHours() * 60 + d.getMinutes();
      const apptEndMin = apptStartMin + (a.durata || 30);

      // L'appuntamento cade o inizia in questo slot
      return (
        (apptStartMin >= slotStartMin && apptStartMin < slotEndMin) ||
        (slotStartMin >= apptStartMin && slotStartMin < apptEndMin)
      );
    });
  };

  if (!isOpen) return null;

  const dataInizioSettimanaStr = format(giorniSettimana[0], "d MMMM", { locale: it });
  const dataFineSettimanaStr = format(giorniSettimana[giorniSettimana.length - 1], "d MMMM yyyy", { locale: it });
  const nomeBarbiereSelezionato =
    barberFiltro === "TUTTI"
      ? "Tutto lo Staff"
      : barbieri.find((b) => b.id === barberFiltro)?.nome || "Barbiere";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Contenitore Modal non stampabile */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Intestazione Barra Superiore */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Stampa Planning Settimanale (A4 Orizzontale)
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                  Formato A4 Landscape Barber
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Foglio cartaceo per il salone: visualizza le prenotazioni già prese e lascia spazi liberi puntinati per appuntare clienti di passaggio a penna.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa Foglio A4</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Opzioni di Configurazione Foglio */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Range Giorni */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Giorni:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                {[
                  { id: "6gg", label: "6 Giorni (Lun-Sab)" },
                  { id: "5gg", label: "5 Giorni (Lun-Ven)" },
                  { id: "7gg", label: "7 Giorni (Lun-Dom)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRangeGiorni(item.id as any)}
                    className={`px-2 py-1 rounded-md transition cursor-pointer font-medium ${
                      rangeGiorni === item.id
                        ? "bg-white text-amber-700 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Passo Orario */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Slot:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setPassoOrario(30)}
                  className={`px-2 py-1 rounded-md transition cursor-pointer font-medium ${
                    passoOrario === 30
                      ? "bg-white text-amber-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Slot ogni 30 minuti"
                >
                  30 Minuti
                </button>
                <button
                  onClick={() => setPassoOrario(60)}
                  className={`px-2 py-1 rounded-md transition cursor-pointer font-medium ${
                    passoOrario === 60
                      ? "bg-white text-amber-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Slot ogni 60 minuti compatto"
                >
                  60 Minuti
                </button>
              </div>
            </div>

            {/* Barbiere Filtro */}
            {barbieri.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Staff:</span>
                <select
                  value={barberFiltro}
                  onChange={(e) => setBarberFiltro(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg font-medium outline-hidden focus:border-amber-500 cursor-pointer text-xs"
                >
                  <option value="TUTTI">Tutto lo Staff</option>
                  {barbieri.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome} {b.soprannome ? `("${b.soprannome}")` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Dati Cliente */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                <input
                  type="checkbox"
                  checked={mostraTelefono}
                  onChange={(e) => setMostraTelefono(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Telefono Cliente</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                <input
                  type="checkbox"
                  checked={mostraServizio}
                  onChange={(e) => setMostraServizio(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Servizio Barbiere</span>
              </label>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            Suggerimento: imposta l'orientamento di stampa del browser su "Orizzontale" (Landscape).
          </div>
        </div>

        {/* Anteprima Foglio Stampabile a Schermo */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[1100px] bg-white rounded-xl shadow-lg border border-slate-200 p-6 overflow-x-auto">
            {/* COMPONENTE EFFETTIVAMENTE STAMPABILE CON ID DEDICATO */}
            <div id="foglio-stampa-settimanale-a4" className="w-full bg-white text-slate-900 font-sans">
              
              {/* Intestazione Documento per la Stampa */}
              <div className="border-b-2 border-slate-800 pb-3 mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                      {nomeSalone}
                    </h1>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 font-bold border border-slate-300 rounded text-slate-800 uppercase tracking-wider">
                      PLANNING SETTIMANALE BARBER SHOP
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">
                    Settimana: <span className="font-bold underline">{dataInizioSettimanaStr} – {dataFineSettimanaStr}</span>
                    {barberFiltro !== "TUTTI" && (
                      <span className="ml-2 font-bold text-amber-700">• Barbiere: {nomeBarbiereSelezionato}</span>
                    )}
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <div className="font-semibold text-slate-800">Taaaac Suite • Registro Presenze & Appunti</div>
                  <div>Generato: {format(new Date(), "dd/MM/yyyy HH:mm")}</div>
                  <div className="italic text-slate-400">Spazi vuoti riservati ad annotazioni manuali al banco</div>
                </div>
              </div>

              {/* Tabella / Griglia Settimanale A4 */}
              <table className="w-full border-collapse border border-slate-300 text-xs table-fixed">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-400">
                    <th className="w-14 py-1.5 px-1 border-r border-slate-300 text-center text-[11px] font-black uppercase text-slate-700">
                      Ora
                    </th>
                    {giorniSettimana.map((giorno, idx) => (
                      <th
                        key={idx}
                        className="py-1.5 px-2 border-r border-slate-300 text-center uppercase tracking-tight"
                      >
                        <div className="text-[11px] font-black text-slate-900">
                          {format(giorno, "EEEE", { locale: it })}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">
                          {format(giorno, "dd/MM", { locale: it })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, sIdx) => (
                    <tr
                      key={sIdx}
                      className={`border-b border-slate-200 ${
                        slot.endsWith(":00") ? "bg-slate-50/40" : "bg-white"
                      }`}
                    >
                      {/* Colonna Orario */}
                      <td className="py-1 px-1 border-r border-slate-300 text-center font-bold text-slate-700 text-[11px] align-top bg-slate-100/70">
                        {slot}
                      </td>

                      {/* Colonne per ciascun giorno */}
                      {giorniSettimana.map((giorno, gIdx) => {
                        const apptsInSlot = getAppuntamentiPerSlot(giorno, slot);

                        return (
                          <td
                            key={gIdx}
                            className="p-1 border-r border-slate-200 align-top min-h-[46px] h-[46px] relative"
                          >
                            {apptsInSlot.length > 0 ? (
                              <div className="space-y-1">
                                {apptsInSlot.map((app) => {
                                  const nomeCliente = `${app.cliente.nome} ${app.cliente.cognome}`.trim();
                                  const oraInizioApp = format(new Date(app.dataOra), "HH:mm");
                                  const nomeServizio =
                                    app.nomiServizi ||
                                    app.servizio?.nome ||
                                    "Taglio / Barba";

                                  return (
                                    <div
                                      key={app.id}
                                      className="bg-slate-100 rounded border border-slate-300 p-1 text-[10px] leading-tight"
                                    >
                                      <div className="flex items-center justify-between font-bold text-slate-900">
                                        <span className="truncate max-w-[110px]">{nomeCliente}</span>
                                        <span className="text-[9px] text-slate-600 font-mono">
                                          {oraInizioApp} ({app.durata}m)
                                        </span>
                                      </div>

                                      {mostraTelefono && app.cliente.telefono && (
                                        <div className="text-[9px] text-slate-600 truncate mt-0.5 flex items-center gap-1 font-mono">
                                          <span>📞</span>
                                          <span>{app.cliente.telefono}</span>
                                        </div>
                                      )}

                                      {mostraServizio && (
                                        <div className="text-[9px] text-amber-800 font-medium truncate mt-0.5">
                                          {nomeServizio}
                                        </div>
                                      )}

                                      {barberFiltro === "TUTTI" && app.barbiere?.nome && (
                                        <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">
                                          staff: {app.barbiere.nome}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* Spazio Libero per Scrittura Manuale a Penna */
                              <div className="h-full flex flex-col justify-between text-[9px] text-slate-400 select-none py-0.5 px-0.5">
                                <div className="border-b border-dotted border-slate-300 pb-0.5 flex justify-between">
                                  <span>Nome:</span>
                                  <span className="text-slate-300">...................</span>
                                </div>
                                <div className="border-b border-dotted border-slate-300 pb-0.5 flex justify-between">
                                  <span>Tel:</span>
                                  <span className="text-slate-300">...................</span>
                                </div>
                                <div className="border-b border-dotted border-slate-300 pb-0.5 flex justify-between">
                                  <span>Serv:</span>
                                  <span className="text-slate-300">...................</span>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Note a Piè di Pagina per il Salone */}
              <div className="mt-2 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-bold text-slate-700">Note per lo staff:</span> I clienti segnati a mano su questo foglio devono essere caricati sul gestionale appena possibile per aggiornare l'agenda digitale.
                  </div>
                </div>
                <div>
                  Foglio A4 Orizzontale • Pagina 1 di 1
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Modal con Azioni */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>💡 Suggerimento: attiva la spunta "Grafica di sfondo" nell'anteprima di stampa per evidenziare i blocchi degli appuntamenti.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Chiudi
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Avvia Stampa A4</span>
            </button>
          </div>
        </div>

      </div>

      {/* Regole CSS isolate per la stampa A4 Landscape */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 5mm 5mm 5mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }

          /* Nascondi tutto ciò che è a video tranne il nostro foglio */
          body * {
            visibility: hidden !important;
          }

          #foglio-stampa-settimanale-a4,
          #foglio-stampa-settimanale-a4 * {
            visibility: visible !important;
          }

          #foglio-stampa-settimanale-a4 {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
