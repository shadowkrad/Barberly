"use client";

import React, { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Printer, X, Scissors, Phone, User, Check, Clock } from "lucide-react";

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
  // Configurazioni di stampa calibrate per 1 singolo foglio A4
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

  const isCompatto30 = passoOrario === 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Contenitore Modal non stampabile */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Intestazione Barra Superiore */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Stampa Settimana su Singolo Foglio A4
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                  100% Adattato A4 Landscape
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Impaginazione calibrata per far entrare l'intera settimana del barbershop su 1 unica pagina cartacea A4.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa 1 Pagina A4</span>
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
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Range Giorni */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Giorni:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                {[
                  { id: "6gg", label: "6gg (Lun-Sab)" },
                  { id: "5gg", label: "5gg (Lun-Ven)" },
                  { id: "7gg", label: "7gg (Lun-Dom)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRangeGiorni(item.id as any)}
                    className={`px-2 py-1 rounded-md transition cursor-pointer text-[11px] font-medium ${
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
              <span className="font-semibold text-slate-600">Frequenza:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setPassoOrario(30)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] font-medium ${
                    passoOrario === 30
                      ? "bg-white text-amber-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="30 Minuti: slot compatti calibrati per 1 foglio A4"
                >
                  30 Minuti
                </button>
                <button
                  onClick={() => setPassoOrario(60)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] font-medium ${
                    passoOrario === 60
                      ? "bg-white text-amber-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="60 Minuti: slot più ampi per appuntamenti lunghi"
                >
                  60 Minuti
                </button>
              </div>
            </div>

            {/* Selezione Orari Apertura Salone */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600">Fascia:</span>
              <select
                value={`${oraInizio}-${oraFine}`}
                onChange={(e) => {
                  const [i, f] = e.target.value.split("-").map(Number);
                  setOraInizio(i);
                  setOraFine(f);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2 rounded-lg font-medium outline-hidden focus:border-amber-500 cursor-pointer text-[11px]"
              >
                <option value="9-19">09:00 – 19:00 (Standard 10h)</option>
                <option value="8-20">08:00 – 20:00 (Esteso 12h)</option>
                <option value="8-19">08:00 – 19:00 (11h)</option>
                <option value="9-20">09:00 – 20:00 (11h)</option>
                <option value="8-18">08:00 – 18:00 (10h)</option>
              </select>
            </div>

            {/* Barber Filtro */}
            {barbieri.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="font-semibold text-slate-600">Barbiere:</span>
                <select
                  value={barberFiltro}
                  onChange={(e) => setBarberFiltro(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2 rounded-lg font-medium outline-hidden focus:border-amber-500 cursor-pointer text-[11px]"
                >
                  <option value="TUTTI">Tutto lo Staff</option>
                  {barbieri.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome} {b.soprannome ? `(${b.soprannome})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Dati Cliente */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <label className="flex items-center gap-1 cursor-pointer text-slate-600 hover:text-slate-900 select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={mostraTelefono}
                  onChange={(e) => setMostraTelefono(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer w-3.5 h-3.5"
                />
                <span>Tel</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer text-slate-600 hover:text-slate-900 select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={mostraServizio}
                  onChange={(e) => setMostraServizio(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer w-3.5 h-3.5"
                />
                <span>Servizio</span>
              </label>
            </div>
          </div>

          <div className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            ✓ Formato 1 Foglio A4 Garantito
          </div>
        </div>

        {/* Anteprima Foglio Stampabile a Schermo */}
        <div className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[1100px] bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-5 overflow-x-auto">
            {/* COMPONENTE EFFETTIVAMENTE STAMPABILE CON ID DEDICATO */}
            <div id="foglio-stampa-settimanale-a4" className="w-full bg-white text-slate-900 font-sans">
              
              {/* Intestazione Documento Super Compatta per A4 */}
              <div className="border-b-2 border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                      {nomeSalone}
                    </h1>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 font-bold border border-slate-300 rounded text-slate-800 uppercase tracking-wider">
                      PLANNING SETTIMANALE BARBER
                    </span>
                    {barberFiltro !== "TUTTI" && (
                      <span className="text-[10px] font-bold text-amber-700">• {nomeBarbiereSelezionato}</span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    Settimana: <span className="font-bold underline text-slate-900">{dataInizioSettimanaStr} – {dataFineSettimanaStr}</span>
                  </div>
                </div>

                <div className="text-right text-[9px] text-slate-500">
                  <div className="font-semibold text-slate-800">Taaaac Suite • Registro Cartaceo</div>
                  <div>Generato: {format(new Date(), "dd/MM/yyyy HH:mm")}</div>
                </div>
              </div>

              {/* Tabella / Griglia Settimanale A4 Calibrata */}
              <table className="w-full border-collapse border border-slate-300 table-fixed text-[9px]">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-400">
                    <th className="w-12 py-1 px-1 border-r border-slate-300 text-center text-[10px] font-black uppercase text-slate-700">
                      Ora
                    </th>
                    {giorniSettimana.map((giorno, idx) => (
                      <th
                        key={idx}
                        className="py-1 px-1 border-r border-slate-300 text-center uppercase tracking-tight"
                      >
                        <div className="text-[10px] font-black text-slate-900">
                          {format(giorno, "EEEE", { locale: it })}
                        </div>
                        <div className="text-[9px] font-semibold text-slate-500">
                          {format(giorno, "dd/MM", { locale: it })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, sIdx) => {
                    const isOraPiena = slot.endsWith(":00");
                    return (
                      <tr
                        key={sIdx}
                        className={`border-b border-slate-200 ${
                          isOraPiena ? "bg-slate-50/50" : "bg-white"
                        }`}
                      >
                        {/* Colonna Orario */}
                        <td className={`py-0.5 px-0.5 border-r border-slate-300 text-center font-bold text-slate-700 align-middle bg-slate-100/70 ${
                          isCompatto30 ? "text-[8.5px]" : "text-[9.5px]"
                        }`}>
                          {slot}
                        </td>

                        {/* Colonne per ciascun giorno */}
                        {giorniSettimana.map((giorno, gIdx) => {
                          const apptsInSlot = getAppuntamentiPerSlot(giorno, slot);

                          return (
                            <td
                              key={gIdx}
                              className={`border-r border-slate-200 align-middle relative ${
                                isCompatto30
                                  ? "p-0.5 h-[23px] max-h-[25px]"
                                  : "p-1 h-[38px] max-h-[42px]"
                              }`}
                            >
                              {apptsInSlot.length > 0 ? (
                                <div className="space-y-0.5">
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
                                        className="bg-slate-100 rounded border border-slate-300 px-1 py-0.5 leading-none"
                                      >
                                        <div className="flex items-center justify-between font-bold text-slate-900">
                                          <span className="truncate max-w-[95px] text-[8.5px]">
                                            {nomeCliente}
                                          </span>
                                          <span className="text-[7.5px] text-slate-600 font-mono flex-shrink-0">
                                            {oraInizioApp} ({app.durata}m)
                                          </span>
                                        </div>

                                        {(mostraTelefono || mostraServizio) && (
                                          <div className="flex items-center gap-1.5 mt-0.5 truncate text-[7.5px] text-slate-600">
                                            {mostraServizio && (
                                              <span className="text-amber-800 font-semibold truncate">
                                                {nomeServizio}
                                              </span>
                                            )}
                                            {mostraTelefono && app.cliente.telefono && (
                                              <span className="font-mono text-slate-500">
                                                📞{app.cliente.telefono}
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        {barberFiltro === "TUTTI" && app.barbiere?.nome && !isCompatto30 && (
                                          <div className="text-[7px] text-slate-400 uppercase tracking-wider font-semibold">
                                            barber: {app.barbiere.nome}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                /* Spazio Libero Ultra-Compatto per Annotazione a Penna */
                                <div className="h-full flex flex-col justify-center text-[7.5px] text-slate-400 select-none leading-none px-0.5">
                                  <div className="border-b border-dotted border-slate-300 pb-0.5 flex justify-between">
                                    <span>Nome:</span>
                                    <span className="text-slate-300 font-mono">...............</span>
                                  </div>
                                  <div className="pt-0.5 flex justify-between">
                                    <span>Serv:</span>
                                    <span className="text-slate-300 font-mono">...............</span>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Note a Piè di Pagina Compatte per 1 Pagina A4 */}
              <div className="mt-1 pt-1 border-t border-slate-300 flex items-center justify-between text-[8px] text-slate-500">
                <div>
                  <span className="font-bold text-slate-700">Nota:</span> Inserire a sistema gli appuntamenti presi a penna al rientro dell'esercente.
                </div>
                <div className="font-bold text-slate-700">
                  Planning Settimanale A4 Orizzontale • Pagina Singola 1 di 1
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Modal con Azioni */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>💡 <strong>Configurazione Stampa:</strong> Formato impostato su <strong>A4 Orizzontale (Landscape)</strong> su singola pagina A4.</span>
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa Foglio Singolo A4</span>
            </button>
          </div>
        </div>

      </div>

      {/* Regole CSS isolate per la stampa A4 Landscape a Foglio Singolo Rigoroso */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 3mm 4mm 3mm 4mm;
          }
          
          html, body {
            width: 290mm !important;
            height: 204mm !important;
            max-height: 204mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }

          /* Nascondi tutto il resto dell'applicazione gestionale */
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
            max-width: 100% !important;
            height: 100% !important;
            max-height: 204mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
          }

          table {
            page-break-inside: avoid !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }

          td, th {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
