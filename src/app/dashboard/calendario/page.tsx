"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import NuovoAppuntamentoModal from "@/components/dashboard/NuovoAppuntamentoModal";
import GestioneModificaModal from "@/components/dashboard/GestioneModificaModal";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  addMinutes,
} from "date-fns";
import { it } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Scissors,
  Users,
  Phone,
  MessageSquare,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { generaLinkWhatsApp, generaMessaggioWhatsAppPromemoria } from "@/lib/whatsapp";

interface Barber {
  id: string;
  nome: string;
  soprannome?: string | null;
  colore: string;
  attivo?: boolean;
}

interface Appuntamento {
  id: string;
  dataOra: string;
  durata: number;
  stato: string;
  note?: string | null;
  noteInterne?: string | null;
  channel?: string | null;
  prezzoStimato?: number | null;
  nomiServizi?: string | null;
  cliente: {
    id: string;
    nome: string;
    cognome: string;
    telefono?: string;
    email?: string | null;
  };
  barbiere: Barber;
  servizio: {
    id: string;
    nome: string;
    colore: string;
    prezzo: number;
    durata?: number;
  };
  raw: any;
}

interface SpazioLibero {
  inizio: Date;
  fine: Date;
  minuti: number;
}

// Convertitore colore pastello barbershop morbido e riposante
function getPastelBarberlyStyle(hexColor?: string) {
  let hex = (hexColor || "#d97706").replace("#", "").trim();
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length !== 6) hex = "d97706";

  const r = parseInt(hex.substring(0, 2), 16) || 217;
  const g = parseInt(hex.substring(2, 4), 16) || 119;
  const b = parseInt(hex.substring(4, 6), 16) || 6;

  // Sfondo solido 92% bianco + 8% colore per pastello chiarissimo
  const solidBgR = Math.round(255 * 0.92 + r * 0.08);
  const solidBgG = Math.round(255 * 0.92 + g * 0.08);
  const solidBgB = Math.round(255 * 0.92 + b * 0.08);

  // Bordo definito (65% bianco + 35% colore)
  const borderR = Math.round(255 * 0.65 + r * 0.35);
  const borderG = Math.round(255 * 0.65 + g * 0.35);
  const borderB = Math.round(255 * 0.65 + b * 0.35);

  return {
    backgroundColor: `rgb(${solidBgR}, ${solidBgG}, ${solidBgB})`,
    borderColor: `rgb(${borderR}, ${borderG}, ${borderB})`,
    textColor: `rgb(${Math.max(0, Math.round(r * 0.45))}, ${Math.max(0, Math.round(g * 0.45))}, ${Math.max(0, Math.round(b * 0.45))})`,
    badgeBg: `rgba(${r}, ${g}, ${b}, 0.20)`,
    rawHex: `#${hex}`,
  };
}

function getCanaleBadge(channel?: string | null, noteInterne?: string | null) {
  const ch = (channel || noteInterne || "").toUpperCase();
  if (ch.includes("PHONE") || ch.includes("TELEFON")) {
    return { icon: "📞", label: "Telefonico", color: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  if (ch.includes("WHATSAPP")) {
    return { icon: "💬", label: "WhatsApp", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  if (ch.includes("WALK_IN") || ch.includes("IN_LOCO") || ch.includes("POLTRONA")) {
    return { icon: "💈", label: "In Salone", color: "bg-amber-50 text-amber-800 border-amber-200" };
  }
  if (ch.includes("MANUAL")) {
    return { icon: "📝", label: "Manuale", color: "bg-slate-50 text-slate-700 border-slate-200" };
  }
  return { icon: "🌐", label: "Web Booking", color: "bg-amber-50 text-amber-700 border-amber-200" };
}

const STATI_COLORI: Record<string, string> = {
  IN_ATTESA: "bg-amber-100 text-amber-900 border-amber-300",
  CONFERMATO: "bg-emerald-100 text-emerald-800 border-emerald-300",
  IN_POLTRONA: "bg-amber-500 text-slate-950 font-bold border-amber-600",
  COMPLETATO: "bg-slate-100 text-slate-700 border-slate-300",
  ANNULLATO: "bg-rose-100 text-rose-700 border-rose-300 line-through",
  NO_SHOW: "bg-orange-100 text-orange-900 border-orange-300",
};

const STATI_LABEL: Record<string, string> = {
  IN_ATTESA: "⚠️ In attesa",
  CONFERMATO: "✓ Confermato",
  IN_POLTRONA: "💈 In Poltrona",
  COMPLETATO: "✨ Completato",
  ANNULLATO: "✕ Annullato",
  NO_SHOW: "🚫 No-Show",
};

type ViewMode = "settimana" | "giorno" | "mese";

// Parametri griglia oraria continua stile Schedly (08:00 -> 20:00)
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 12 ore
const HOUR_HEIGHT = 68; // px per ora (30 min = 34px)
const TOTAL_GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT; // 816px
const ORE_GIORNATA = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

function getOrarioFine(dataOra: string | Date, durataMinuti: number): Date {
  return addMinutes(new Date(dataOra), durataMinuti || 30);
}

// Calcola le informazioni su durata base e tempo in più (differenza di orario) per appuntamenti multi-servizio
function getDettaglioOrarioServizi(a: Appuntamento) {
  const baseDurata = a.servizio?.durata || (a.durata > 0 ? a.durata : 30);
  const tempoExtra = Math.max(0, (a.durata || 30) - baseDurata);
  const hasExtra =
    tempoExtra > 0 ||
    Boolean(a.nomiServizi && a.nomiServizi.includes(" + ")) ||
    Boolean(a.servizio?.nome && a.servizio.nome.includes(" + "));

  const baseFine = addMinutes(new Date(a.dataOra), baseDurata);
  const fineEffettiva = getOrarioFine(a.dataOra, a.durata);

  return {
    baseDurata,
    tempoExtra,
    hasExtra,
    baseFine,
    fineEffettiva,
  };
}

function getNextAvailableTimeSlot(date: Date): string {
  const now = new Date();
  const isTargetToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (!isTargetToday) {
    return "10:00";
  }

  const currentH = now.getHours();
  const currentM = now.getMinutes();
  let nextH = currentH;
  let nextM = currentM > 30 ? 0 : 30;
  if (currentM > 30) {
    nextH += 1;
  }

  const clampedH = Math.min(Math.max(nextH, START_HOUR), END_HOUR - 1);
  return `${String(clampedH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
}

// Calcola i buchi liberi per un giorno
function calcolaBuchiDisponibili(
  appuntamentiGiorno: Appuntamento[],
  giorno: Date,
  oraInizio: number = 8.5,
  oraFine: number = 19.5,
  adesso?: Date
): SpazioLibero[] {
  const now = adesso || new Date();
  const startOfNowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTargetDay = new Date(giorno.getFullYear(), giorno.getMonth(), giorno.getDate()).getTime();

  if (startOfTargetDay < startOfNowDay) {
    return [];
  }

  const attivi = appuntamentiGiorno
    .filter((a) => a.stato !== "ANNULLATO")
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());

  const startOfDayTime = new Date(giorno);
  startOfDayTime.setHours(Math.floor(oraInizio), Math.round((oraInizio % 1) * 60), 0, 0);

  const endOfDayTime = new Date(giorno);
  endOfDayTime.setHours(Math.floor(oraFine), Math.round((oraFine % 1) * 60), 0, 0);

  let effectiveStart = startOfDayTime;
  if (startOfTargetDay === startOfNowDay) {
    const min = now.getMinutes();
    const roundedMin = Math.ceil(min / 15) * 15;
    const roundedNow = new Date(now);
    roundedNow.setMinutes(roundedMin, 0, 0);

    if (roundedNow > effectiveStart) {
      effectiveStart = roundedNow;
    }
  }

  if (effectiveStart >= endOfDayTime) {
    return [];
  }

  const spazi: SpazioLibero[] = [];
  let currentPointer = effectiveStart;

  for (const appt of attivi) {
    const apptStart = new Date(appt.dataOra);
    const apptEnd = getOrarioFine(appt.dataOra, appt.durata);

    if (apptEnd <= currentPointer) {
      continue;
    }

    if (apptStart <= currentPointer) {
      currentPointer = apptEnd;
      continue;
    }

    if (apptStart > currentPointer) {
      const diffMin = Math.round((apptStart.getTime() - currentPointer.getTime()) / (60 * 1000));
      if (diffMin >= 15) {
        spazi.push({
          inizio: new Date(currentPointer),
          fine: new Date(apptStart),
          minuti: diffMin,
        });
      }
      currentPointer = apptEnd;
    }
  }

  if (endOfDayTime > currentPointer) {
    const diffMin = Math.round((endOfDayTime.getTime() - currentPointer.getTime()) / (60 * 1000));
    if (diffMin >= 15) {
      spazi.push({
        inizio: new Date(currentPointer),
        fine: new Date(endOfDayTime),
        minuti: diffMin,
      });
    }
  }

  return spazi;
}

// Algoritmo di posizionamento nella Griglia con gestione sovrapposizioni (Overlapping)
interface PositionedAppt {
  appt: Appuntamento;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
  startMinutes: number;
  endMinutes: number;
}

function calcolaPosizioniGriglia(apptsGiorno: Appuntamento[]): PositionedAppt[] {
  const attivi = apptsGiorno
    .filter((a) => a.stato !== "ANNULLATO")
    .map((a) => {
      const d = new Date(a.dataOra);
      const startMinutes = d.getHours() * 60 + d.getMinutes();
      const endMinutes = startMinutes + (a.durata || 30);
      return { appt: a, startMinutes, endMinutes };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);

  if (attivi.length === 0) return [];

  type Group = typeof attivi;
  const clusters: Group[] = [];
  let currentCluster: Group = [];
  let clusterEnd = 0;

  for (const item of attivi) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.endMinutes;
    } else if (item.startMinutes < clusterEnd) {
      currentCluster.push(item);
      if (item.endMinutes > clusterEnd) clusterEnd = item.endMinutes;
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.endMinutes;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const result: PositionedAppt[] = [];

  for (const cluster of clusters) {
    const columns: typeof attivi[] = [];
    for (const item of cluster) {
      let placed = false;
      for (let colIdx = 0; colIdx < columns.length; colIdx++) {
        const lastInCol = columns[colIdx][columns[colIdx].length - 1];
        if (item.startMinutes >= lastInCol.endMinutes) {
          columns[colIdx].push(item);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item]);
      }
    }

    const totalCols = columns.length;
    const widthPercent = 100 / totalCols;

    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const colItems = columns[colIdx];
      for (let i = 0; i < colItems.length; i++) {
        const item = colItems[i];
        const relativeStartMinutes = Math.max(0, item.startMinutes - START_HOUR * 60);
        const top = (relativeStartMinutes / 60) * HOUR_HEIGHT;
        const rawHeight = (item.appt.durata / 60) * HOUR_HEIGHT;

        const nextItem = colItems[i + 1];
        let maxHeight = rawHeight;
        if (nextItem) {
          const nextRelativeStart = Math.max(0, nextItem.startMinutes - START_HOUR * 60);
          const nextTop = (nextRelativeStart / 60) * HOUR_HEIGHT;
          maxHeight = Math.max(6, nextTop - top - 1);
        }

        const height = Math.max(8, Math.min(rawHeight - 1, maxHeight));
        const leftPercent = colIdx * widthPercent;

        result.push({
          appt: item.appt,
          top,
          height,
          leftPercent,
          widthPercent,
          startMinutes: item.startMinutes,
          endMinutes: item.endMinutes,
        });
      }
    }
  }

  return result;
}

export default function BarberlyCalendarioPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("settimana");
  const [gridStyle, setGridStyle] = useState<"griglia" | "lista">("griglia");
  const [settimanaRange, setSettimanaRange] = useState<"auto" | "7gg" | "6gg" | "5gg">("6gg");
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [barbieri, setBarbieri] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("TUTTI");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Appuntamento | null>(null);
  const [modificaModalAppt, setModificaModalAppt] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Mini Calendario Mensile popover
  const [showMiniMese, setShowMiniMese] = useState(false);
  const [miniMeseCursor, setMiniMeseCursor] = useState<Date>(new Date());
  const miniMeseRef = useRef<HTMLDivElement>(null);

  // Timer per aggiornare la linea "Adesso"
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Chiudi mini calendario cliccando fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (miniMeseRef.current && !miniMeseRef.current.contains(event.target as Node)) {
        setShowMiniMese(false);
      }
    }
    if (showMiniMese) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMiniMese]);

  useEffect(() => {
    setMiniMeseCursor(currentDate);
  }, [currentDate]);

  // Modale nuovo appuntamento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);
  const [modalTime, setModalTime] = useState<string | undefined>(undefined);
  const [modalBarberId, setModalBarberId] = useState<string | undefined>(undefined);

  // Fetch Barbieri / Staff
  useEffect(() => {
    fetch("/api/barbieri")
      .then((r) => r.json())
      .then((data) => {
        if (data.barbieri && Array.isArray(data.barbieri)) {
          setBarbieri(data.barbieri);
        } else if (Array.isArray(data)) {
          setBarbieri(data);
        }
      })
      .catch((e) => console.error("Errore fetch barbieri:", e));
  }, []);

  // Fetch Appuntamenti
  const fetchAppuntamenti = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments?stato=ALL");
      if (res.ok) {
        const data = await res.json();
        const rawList = data.appuntamenti || [];

        // Normalizza ogni appuntamento per il motore di visualizzazione
        const normalized: Appuntamento[] = rawList.map((raw: any) => {
          const datePart =
            typeof raw.date === "string"
              ? raw.date.split("T")[0]
              : new Date(raw.date).toISOString().split("T")[0];
          const timePart = raw.startTime || "09:00";
          const [h, m] = timePart.split(":").map(Number);

          const fullDate = new Date(`${datePart}T${String(h || 9).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00`);

          const durata = raw.durationMinutes || raw.durata || raw.service?.durationMinutes || 30;

          const stato =
            raw.status === "PENDING"
              ? "IN_ATTESA"
              : raw.status === "IN_PROGRESS"
              ? "IN_POLTRONA"
              : raw.status === "COMPLETED"
              ? "COMPLETATO"
              : raw.status === "CANCELLED"
              ? "ANNULLATO"
              : raw.status === "NO_SHOW"
              ? "NO_SHOW"
              : "CONFERMATO";

          return {
            id: raw.id,
            dataOra: fullDate.toISOString(),
            durata,
            stato,
            note: raw.notes,
            noteInterne: raw.internalNotes || (raw.channel ? `[${raw.channel}]` : null),
            channel: raw.channel,
            prezzoStimato: raw.pricePaid ?? raw.service?.price,
            nomiServizi: raw.nomiServizi || null,
            cliente: {
              id: raw.client?.id || "",
              nome: raw.client?.firstName || "Cliente",
              cognome: raw.client?.lastName || "",
              telefono: raw.client?.phone,
              email: raw.client?.email,
            },
            barbiere: {
              id: raw.barber?.id || "",
              nome: raw.barber?.name || "Barbiere",
              soprannome: raw.barber?.nickname,
              colore: raw.barber?.color || "#d97706",
            },
            servizio: {
              id: raw.service?.id || "",
              nome: raw.nomiServizi || raw.service?.name || "Taglio Sartoriale",
              colore: raw.service?.color || "#d97706",
              prezzo: raw.service?.price || 28,
              durata: raw.service?.durationMinutes || 30,
            },
            raw,
          };
        });

        setAppuntamenti(normalized);
      }
    } catch (e) {
      console.error("Errore fetch appuntamenti:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppuntamenti();
  }, [fetchAppuntamenti]);

  const aggiornaStato = async (id: string, statoBarberly: string) => {
    let dbStatus = "CONFIRMED";
    if (statoBarberly === "IN_ATTESA") dbStatus = "PENDING";
    if (statoBarberly === "IN_POLTRONA") dbStatus = "IN_PROGRESS";
    if (statoBarberly === "COMPLETED" || statoBarberly === "COMPLETATO") dbStatus = "COMPLETED";
    if (statoBarberly === "ANNULLATO") dbStatus = "CANCELLED";
    if (statoBarberly === "NO_SHOW") dbStatus = "NO_SHOW";

    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: dbStatus }),
    });
    fetchAppuntamenti();
    setSelected(null);
  };

  const handlePrev = () => {
    if (viewMode === "giorno") setCurrentDate(subDays(currentDate, 1));
    else if (viewMode === "settimana") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "giorno") setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === "settimana") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Titolo range periodo
  const getHeaderTitle = () => {
    if (viewMode === "giorno") {
      return format(currentDate, "EEEE d MMMM yyyy", { locale: it });
    }
    if (viewMode === "settimana") {
      const wStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const wEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(wStart, "d", { locale: it })} – ${format(wEnd, "d MMMM yyyy", { locale: it })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: it });
  };

  // Filtro Barbieri
  const appuntamentiFiltrati = useMemo(() => {
    if (selectedBarberId === "TUTTI") return appuntamenti;
    return appuntamenti.filter((a) => a.barbiere.id === selectedBarberId);
  }, [appuntamenti, selectedBarberId]);

  // Giorni della settimana
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const giorniSettimana = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const giorniSettimanaFiltrati = useMemo(() => {
    if (settimanaRange === "7gg") return giorniSettimana;
    if (settimanaRange === "6gg") return giorniSettimana.slice(0, 6); // Lun - Sab
    if (settimanaRange === "5gg") return giorniSettimana.slice(0, 5); // Lun - Ven
    return giorniSettimana.slice(0, 6);
  }, [giorniSettimana, settimanaRange]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const giorniMese = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Buchi liberi del giorno selezionato
  const buchiOggi = useMemo(() => {
    const apptsGiorno = appuntamentiFiltrati.filter((a) => isSameDay(new Date(a.dataOra), currentDate));
    return calcolaBuchiDisponibili(apptsGiorno, currentDate, START_HOUR, END_HOUR, currentTime);
  }, [appuntamentiFiltrati, currentDate, currentTime]);

  // Mini Calendario Mensile Popup
  const miniStartMonth = startOfMonth(miniMeseCursor);
  const miniEndMonth = endOfMonth(miniMeseCursor);
  const miniCalStart = startOfWeek(miniStartMonth, { weekStartsOn: 1 });
  const miniCalEnd = endOfWeek(miniEndMonth, { weekStartsOn: 1 });
  const miniGiorni = eachDayOfInterval({ start: miniCalStart, end: miniCalEnd });

  // Calcolo linea orario corrente (Adesso) in pixel
  const currentMinutesFromStart =
    (currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes();
  const currentLineTop = (currentMinutesFromStart / 60) * HOUR_HEIGHT;
  const isCurrentTimeInGrid = currentMinutesFromStart >= 0 && currentMinutesFromStart <= TOTAL_HOURS * 60;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header Unificato Compatto (~58px) in puro Taaaac Design System */}
      <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 relative">
        {/* Blocco Sinistra: Navigazione Temporale & Data */}
        <div className="flex items-center gap-3">
          {/* Frecce di navigazione + Oggi */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={handlePrev}
              className="w-7 h-7 text-xs font-bold text-slate-600 hover:bg-white hover:text-amber-600 rounded-lg transition flex items-center justify-center cursor-pointer shadow-2xs"
              title="Precedente"
            >
              ‹
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-amber-600 bg-white hover:bg-amber-50 rounded-lg transition cursor-pointer shadow-2xs"
              title="Torna ad oggi"
            >
              Oggi
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 text-xs font-bold text-slate-600 hover:bg-white hover:text-amber-600 rounded-lg transition flex items-center justify-center cursor-pointer shadow-2xs"
              title="Successivo"
            >
              ›
            </button>
          </div>

          {/* Tasto Mini Calendario Popup */}
          <div className="relative" ref={miniMeseRef}>
            <button
              onClick={() => setShowMiniMese(!showMiniMese)}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 rounded-xl border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Scegli una data dal calendario rapido"
            >
              <span className="text-sm">📅</span>
              <span className="capitalize">{format(currentDate, "MMMM yyyy", { locale: it })}</span>
              <span className="text-[10px] text-amber-500">▾</span>
            </button>

            {/* Popover Mini Calendario */}
            {showMiniMese && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-800 capitalize">
                    {format(miniMeseCursor, "MMMM yyyy", { locale: it })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMiniMeseCursor(subMonths(miniMeseCursor, 1))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 text-xs font-bold flex items-center justify-center transition"
                      title="Mese precedente"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => {
                        setMiniMeseCursor(new Date());
                        setCurrentDate(new Date());
                        setShowMiniMese(false);
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition"
                    >
                      Oggi
                    </button>
                    <button
                      onClick={() => setMiniMeseCursor(addMonths(miniMeseCursor, 1))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 text-xs font-bold flex items-center justify-center transition"
                      title="Mese successivo"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1">
                  {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
                    <div key={i}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {miniGiorni.map((g) => {
                    const isMese = isSameMonth(g, miniMeseCursor);
                    const isSel = isSameDay(g, currentDate);
                    const isTod = isToday(g);
                    const isCurrentWeekDay =
                      g >= weekStart && g <= weekEnd && viewMode === "settimana";

                    return (
                      <button
                        key={g.toISOString()}
                        onClick={() => {
                          setCurrentDate(g);
                          setShowMiniMese(false);
                        }}
                        className={`h-7 w-7 text-[11px] rounded-lg font-semibold flex items-center justify-center transition cursor-pointer ${
                          isSel
                            ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                            : isTod
                            ? "border border-amber-400 text-amber-700 font-bold bg-amber-50"
                            : isCurrentWeekDay
                            ? "bg-amber-50/60 text-amber-900 font-medium hover:bg-amber-100"
                            : isMese
                            ? "text-slate-700 hover:bg-slate-100"
                            : "text-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {format(g, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Range Data Attuale */}
          <div className="hidden sm:block">
            <span className="text-sm font-extrabold text-slate-900 capitalize tracking-tight">
              {getHeaderTitle()}
            </span>
          </div>
        </div>

        {/* Blocco Centro: Filtro Barbiere / Staff Compatto */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-400 text-[10px] font-bold px-1 uppercase hidden md:inline">
              Poltrone:
            </span>
            <button
              onClick={() => setSelectedBarberId("TUTTI")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedBarberId === "TUTTI"
                  ? "bg-amber-500 text-slate-950 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>💈</span>
              <span>Tutte</span>
              <span className="text-[10px] opacity-80">({appuntamenti.length})</span>
            </button>
            {barbieri.map((b) => {
              const isSelected = selectedBarberId === b.id;
              const count = appuntamenti.filter((a) => a.barbiere?.id === b.id).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarberId(isSelected ? "TUTTI" : b.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-900 font-bold shadow-2xs ring-1 ring-amber-400"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={`Filtra per ${b.nome} ${b.soprannome ? `(${b.soprannome})` : ""}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: b.colore || "#d97706" }}
                  />
                  <span className="truncate max-w-[100px]">{b.nome}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blocco Destra: Range Giorni + Vista (Settimana/Giorno/Mese) + Tasto Prenota */}
        <div className="flex items-center gap-2">
          {viewMode === "settimana" && (
            <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              {[
                { id: "7gg", label: "7 gg", title: "Tutta la settimana (Lun-Dom)" },
                { id: "6gg", label: "6 gg", title: "6 giorni (Lun-Sab)" },
                { id: "5gg", label: "5 gg", title: "5 giorni (Lun-Ven)" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSettimanaRange(r.id as any)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                    settimanaRange === r.id
                      ? "bg-white text-amber-700 font-bold shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title={r.title}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Selettore Vista */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center gap-0.5 text-xs font-semibold">
            {(["settimana", "giorno", "mese"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer text-xs ${
                  viewMode === mode
                    ? "bg-white text-amber-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Pulsante Nuovo Appuntamento */}
          <button
            onClick={() => {
              setModalDate(format(currentDate, "yyyy-MM-dd"));
              setModalTime(getNextAvailableTimeSlot(currentDate));
              setModalBarberId(selectedBarberId !== "TUTTI" ? selectedBarberId : undefined);
              setModalOpen(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Prenota</span>
          </button>
        </div>
      </div>

      {/* Contenuto Calendario */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center text-slate-400">
          <div className="inline-block animate-spin text-3xl mb-2">⏳</div>
          <p className="text-sm font-medium">Caricamento agenda salone in corso...</p>
        </div>
      ) : (
        <>
          {/* ──────────────── 1. VISTA SETTIMANALE (TIME-GRID CONTINUO STILE SCHEDLY) ──────────────── */}
          {viewMode === "settimana" && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto">
                <div
                  className="min-w-[980px]"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `56px repeat(${giorniSettimanaFiltrati.length}, minmax(140px, 1fr))`,
                  }}
                >
                  {/* Header angolo sinistro */}
                  <div className="p-3 bg-amber-50/40 border-b border-r border-slate-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400">ORA</span>
                  </div>

                  {/* Header giorni */}
                  {giorniSettimanaFiltrati.map((giorno) => {
                    const oggi = isToday(giorno);
                    const apptsCount = appuntamentiFiltrati.filter((a) =>
                      isSameDay(new Date(a.dataOra), giorno)
                    ).length;

                    return (
                      <div
                        key={giorno.toISOString()}
                        className={`p-3 border-b border-r border-slate-200 flex items-center justify-between transition-colors ${
                          oggi ? "bg-amber-50/80" : "bg-slate-50/40"
                        }`}
                      >
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {format(giorno, "EEE", { locale: it })}
                          </span>
                          <span
                            className={`text-base font-extrabold ${
                              oggi ? "text-amber-600" : "text-slate-800"
                            }`}
                          >
                            {format(giorno, "d")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {apptsCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {apptsCount}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setModalDate(format(giorno, "yyyy-MM-dd"));
                              setModalTime(getNextAvailableTimeSlot(giorno));
                              setModalBarberId(
                                selectedBarberId !== "TUTTI" ? selectedBarberId : undefined
                              );
                              setModalOpen(true);
                            }}
                            className="w-5 h-5 rounded-full bg-white hover:bg-amber-500 hover:text-slate-950 text-amber-600 text-xs font-bold flex items-center justify-center transition cursor-pointer shadow-2xs border border-slate-200"
                            title="Aggiungi appuntamento in questo giorno"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Colonna Asse Orario (sinistra) */}
                  <div
                    className="border-r border-slate-200 bg-slate-50/50 select-none relative"
                    style={{ height: `${TOTAL_GRID_HEIGHT}px` }}
                  >
                    {ORE_GIORNATA.map((ora) => (
                      <div
                        key={ora}
                        className="border-b border-slate-200/80 text-right pr-2 text-[11px] font-bold text-slate-400 flex items-start justify-end pt-1"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      >
                        <span>{String(ora).padStart(2, "0")}:00</span>
                      </div>
                    ))}
                  </div>

                  {/* Colonne dei Giorni con la Griglia di Sfondo e i Blocchi Appuntamenti */}
                  {giorniSettimanaFiltrati.map((giorno) => {
                    const apptsGiorno = appuntamentiFiltrati.filter((a) =>
                      isSameDay(new Date(a.dataOra), giorno)
                    );
                    const posizionati = calcolaPosizioniGriglia(apptsGiorno);
                    const buchi = calcolaBuchiDisponibili(apptsGiorno, giorno, START_HOUR, END_HOUR, currentTime);
                    const oggi = isToday(giorno);

                    return (
                      <div
                        key={giorno.toISOString()}
                        className={`relative border-r border-slate-200 transition-colors ${
                          oggi ? "bg-amber-50/15" : "bg-white"
                        }`}
                        style={{ height: `${TOTAL_GRID_HEIGHT}px` }}
                      >
                        {/* Righe orarie di sfondo (Cliccabili per prenotare) */}
                        {ORE_GIORNATA.map((ora) => {
                          const slotEndDate = new Date(giorno);
                          slotEndDate.setHours(ora + 1, 0, 0, 0);
                          const isPastSlot = slotEndDate.getTime() <= currentTime.getTime();

                          return (
                            <div
                              key={ora}
                              className={`border-b border-slate-100 relative group/slot ${
                                isPastSlot ? "bg-slate-50/20" : "cursor-pointer"
                              }`}
                              style={{ height: `${HOUR_HEIGHT}px` }}
                              onClick={() => {
                                setModalDate(format(giorno, "yyyy-MM-dd"));
                                setModalTime(`${String(ora).padStart(2, "0")}:00`);
                                setModalBarberId(
                                  selectedBarberId !== "TUTTI" ? selectedBarberId : undefined
                                );
                                setModalOpen(true);
                              }}
                              title={
                                isPastSlot
                                  ? `Orario trascorso (${String(ora).padStart(2, "0")}:00)`
                                  : `Clicca per prenotare alle ${String(ora).padStart(2, "0")}:00`
                              }
                            >
                              {/* Linea mezz'ora tratteggiata */}
                              <div
                                className="absolute left-0 right-0 border-b border-dashed border-slate-100 pointer-events-none"
                                style={{ top: `${HOUR_HEIGHT / 2}px` }}
                              />
                              {/* Overlay hover per prenotare */}
                              {!isPastSlot && (
                                <div className="opacity-0 group-hover/slot:opacity-100 absolute inset-0 bg-amber-100/30 flex items-center justify-center transition pointer-events-none">
                                  <span className="text-[10px] font-bold text-amber-900 bg-white/95 px-2 py-0.5 rounded-full shadow-xs border border-amber-200">
                                    + Prenota {String(ora).padStart(2, "0")}:00
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Linea orario corrente in tempo reale per "Oggi" */}
                        {oggi && isCurrentTimeInGrid && (
                          <div
                            className="absolute left-0 right-0 border-t-2 border-amber-500 z-20 pointer-events-none flex items-center"
                            style={{ top: `${currentLineTop}px` }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-600 -ml-1 shadow-xs animate-ping" />
                            <div className="w-2 h-2 rounded-full bg-amber-600 -ml-2 shadow-xs" />
                          </div>
                        )}

                        {/* Blocchi Buchi Liberi Grandi Evidenti */}
                        {buchi.map((buco, bIdx) => {
                          const bStartMin = buco.inizio.getHours() * 60 + buco.inizio.getMinutes();
                          const relativeStart = Math.max(0, bStartMin - START_HOUR * 60);
                          const top = (relativeStart / 60) * HOUR_HEIGHT;
                          const height = (buco.minuti / 60) * HOUR_HEIGHT;

                          if (buco.minuti < 45 || height < 36 || buco.fine.getTime() <= currentTime.getTime()) return null;

                          return (
                            <div
                              key={bIdx}
                              className="absolute left-1 right-1 z-5 pointer-events-auto flex items-center justify-center"
                              style={{
                                top: `${top + 4}px`,
                                height: `${height - 8}px`,
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalDate(format(giorno, "yyyy-MM-dd"));
                                  setModalTime(format(buco.inizio, "HH:mm"));
                                  setModalBarberId(
                                    selectedBarberId !== "TUTTI" ? selectedBarberId : undefined
                                  );
                                  setModalOpen(true);
                                }}
                                className="w-[92%] max-w-[200px] py-1 px-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center justify-between transition group/buco cursor-pointer shadow-2xs active:scale-95"
                                title={`Buco libero dalle ${format(buco.inizio, "HH:mm")} alle ${format(buco.fine, "HH:mm")} (${buco.minuti} min)`}
                              >
                                <span className="flex items-center gap-1 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span className="font-bold text-emerald-700 truncate">
                                    {format(buco.inizio, "HH:mm")}–{format(buco.fine, "HH:mm")}
                                  </span>
                                </span>
                                <span className="text-[9px] font-extrabold bg-white border border-emerald-300 px-1 py-0.2 rounded text-emerald-800 shrink-0 group-hover/buco:bg-emerald-600 group-hover/buco:text-white transition">
                                  +{buco.minuti}m
                                </span>
                              </button>
                            </div>
                          );
                        })}

                        {/* Blocchi Appuntamenti Posizionati in Griglia */}
                        {posizionati.map((pos) => {
                          const a = pos.appt;
                          const inizio = new Date(a.dataOra);
                          const fine = getOrarioFine(a.dataOra, a.durata);
                          const badge = getCanaleBadge(a.channel, a.noteInterne);
                          const pastel = getPastelBarberlyStyle(a.servizio?.colore);
                          const opColore = a.barbiere?.colore || "#d97706";
                          const { baseDurata, tempoExtra } = getDettaglioOrarioServizi(a);

                          const isPassato = currentTime > inizio;
                          const isAttesa = a.stato === "IN_ATTESA" && !isPassato;
                          const isInPoltrona = a.stato === "IN_POLTRONA";

                          return (
                            <div
                              key={a.id}
                              onClick={() => setSelected(a)}
                              className={`absolute p-2 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-lg hover:z-30 select-none overflow-hidden ${
                                isInPoltrona ? "ring-2 ring-amber-500 ring-offset-1 animate-pulse" : ""
                              }`}
                              style={{
                                top: `${pos.top}px`,
                                height: `${pos.height}px`,
                                left: `${pos.leftPercent}%`,
                                width: `${pos.widthPercent}%`,
                                backgroundColor: pastel.backgroundColor,
                                borderColor: pastel.borderColor,
                                borderLeftWidth: "4px",
                                borderLeftColor: opColore,
                              }}
                              title={`${format(inizio, "HH:mm")} - ${format(fine, "HH:mm")} • ${a.cliente.nome} ${a.cliente.cognome} • ${a.servizio.nome} (${a.durata}m)${tempoExtra > 0 ? ` [Base: ${baseDurata}m + Tempo aggiunto: +${tempoExtra}m (fine ore ${format(fine, "HH:mm")})]` : ""} (${a.barbiere.nome})`}
                            >
                              <div className="flex items-center justify-between font-bold text-[11px] text-slate-900 leading-tight">
                                <span>
                                  {format(inizio, "HH:mm")} - {format(fine, "HH:mm")}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span
                                    className="text-[9px] px-1 py-0.2 rounded font-mono font-semibold"
                                    style={{ color: pastel.textColor }}
                                  >
                                    {a.durata}m
                                  </span>
                                  {tempoExtra > 0 && (
                                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-mono shadow-2xs">
                                      +{tempoExtra}m
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="font-extrabold text-slate-900 text-xs truncate mt-0.5">
                                {a.cliente.nome} {a.cliente.cognome}
                              </div>

                              {pos.height >= 45 && (
                                <div
                                  className="text-[10px] font-semibold truncate mt-0.5"
                                  style={{ color: pastel.textColor }}
                                >
                                  {a.servizio.nome}
                                </div>
                              )}

                              {pos.height >= 60 && (
                                <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-500">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: opColore }}
                                  />
                                  <span className="truncate">{a.barbiere.nome}</span>
                                  <span>•</span>
                                  <span className={`px-1 py-0.2 rounded border ${badge.color}`}>
                                    {badge.icon}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 2. VISTA GIORNALIERA ──────────────── */}
          {viewMode === "giorno" && (
            <div className="space-y-4">
              {/* Banner Buchi & Spazi Disponibili del giorno */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Buchi & Spazi Disponibili ({format(currentDate, "EEEE d MMMM", { locale: it })})
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      • Clicca su uno slot per prenotarlo
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {buchiOggi.length} {buchiOggi.length === 1 ? "buco disponibile" : "buchi disponibili"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-3">
                  {buchiOggi.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">
                      Nessun buco disponibile: giornata completamente prenotata o fuori orario!
                    </div>
                  ) : (
                    buchiOggi.map((buco, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setModalDate(format(currentDate, "yyyy-MM-dd"));
                          setModalTime(format(buco.inizio, "HH:mm"));
                          setModalBarberId(
                            selectedBarberId !== "TUTTI" ? selectedBarberId : undefined
                          );
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2 transition hover:shadow-xs group cursor-pointer"
                        title={`Clicca per prenotare alle ${format(buco.inizio, "HH:mm")}`}
                      >
                        <span className="font-bold">
                          {format(buco.inizio, "HH:mm")} → {format(buco.fine, "HH:mm")}
                        </span>
                        <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-emerald-700 font-bold border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition">
                          +{buco.minuti}m
                        </span>
                        <span className="text-emerald-500 group-hover:text-emerald-700 font-bold">+</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Griglia Oraria della Giornata */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 bg-amber-50/40 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm capitalize">
                    Agenda Oraria • {format(currentDate, "EEEE d MMMM", { locale: it })}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {appuntamentiFiltrati.filter((a) => isSameDay(new Date(a.dataOra), currentDate)).length} appuntamenti
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {ORE_GIORNATA.map((ora) => {
                    const apptsOra = appuntamentiFiltrati.filter((a) => {
                      const d = new Date(a.dataOra);
                      return isSameDay(d, currentDate) && d.getHours() === ora;
                    });
                    const slotEndDate = new Date(currentDate);
                    slotEndDate.setHours(ora + 1, 0, 0, 0);
                    const isPastSlot = slotEndDate.getTime() <= currentTime.getTime();

                    return (
                      <div key={ora} className="flex min-h-[85px] group hover:bg-amber-50/15 transition">
                        <div className="w-20 sm:w-24 p-3 text-right border-r border-slate-100 shrink-0">
                          <span className="text-xs font-bold text-slate-500">
                            {String(ora).padStart(2, "0")}:00
                          </span>
                        </div>
                        <div className="flex-1 p-2 flex flex-wrap gap-2.5 items-center">
                          {apptsOra.map((a) => {
                            const pastel = getPastelBarberlyStyle(a.servizio?.colore);
                            const opColore = a.barbiere?.colore || "#d97706";
                            const badge = getCanaleBadge(a.channel, a.noteInterne);
                            const inizio = new Date(a.dataOra);
                            const fine = getOrarioFine(a.dataOra, a.durata);

                            return (
                              <button
                                key={a.id}
                                onClick={() => setSelected(a)}
                                className="text-left rounded-xl p-3 transition-all relative group text-xs block cursor-pointer border shadow-2xs hover:shadow-md"
                                style={{
                                  backgroundColor: pastel.backgroundColor,
                                  borderColor: pastel.borderColor,
                                  borderLeftWidth: "5px",
                                  borderLeftColor: opColore,
                                }}
                              >
                                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                                  <span>{format(inizio, "HH:mm")} - {format(fine, "HH:mm")}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-bold border border-black/5" style={{ color: pastel.textColor }}>
                                    {a.servizio.nome} ({a.durata}m)
                                  </span>
                                </div>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">
                                  {a.cliente.nome} {a.cliente.cognome}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opColore }} />
                                  <span>Poltrona: {a.barbiere.nome}</span>
                                  <span>•</span>
                                  <span className={`px-1.5 py-0.2 rounded border ${badge.color}`}>
                                    {badge.icon} {badge.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}

                          {!isPastSlot ? (
                            <button
                              onClick={() => {
                                setModalDate(format(currentDate, "yyyy-MM-dd"));
                                setModalTime(`${String(ora).padStart(2, "0")}:00`);
                                setModalBarberId(
                                  selectedBarberId !== "TUTTI" ? selectedBarberId : undefined
                                );
                                setModalOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer border border-amber-200"
                              title={`Prenota alle ore ${String(ora).padStart(2, "0")}:00`}
                            >
                              <span>+</span>
                              <span>Prenota {String(ora).padStart(2, "0")}:00</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-medium italic select-none">
                              Orario trascorso
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 3. VISTA MENSILE ──────────────── */}
          {viewMode === "mese" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
                {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((g) => (
                  <div key={g}>{g}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
                {giorniMese.map((giorno) => {
                  const appts = appuntamentiFiltrati
                    .filter((a) => isSameDay(new Date(a.dataOra), giorno))
                    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
                  const isCurrentMonth = isSameMonth(giorno, currentDate);
                  const oggi = isToday(giorno);

                  return (
                    <div
                      key={giorno.toISOString()}
                      onClick={() => {
                        setCurrentDate(giorno);
                        setViewMode("giorno");
                      }}
                      className={`min-h-[90px] sm:min-h-[110px] rounded-xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col ${
                        oggi
                          ? "border-amber-400 bg-amber-50/50 shadow-xs"
                          : isCurrentMonth
                          ? "border-slate-100 bg-white hover:border-amber-200"
                          : "border-transparent bg-slate-50/50 opacity-40 hover:opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold leading-none ${
                            oggi
                              ? "bg-amber-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center font-black"
                              : isCurrentMonth
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {format(giorno, "d")}
                        </span>
                        {appts.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                            {appts.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 overflow-hidden">
                        {appts.slice(0, 3).map((a) => {
                          const pastel = getPastelBarberlyStyle(a.servizio?.colore);
                          const inizio = new Date(a.dataOra);
                          const fine = getOrarioFine(a.dataOra, a.durata);
                          return (
                            <div
                              key={a.id}
                              className="text-[10px] truncate px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border border-black/5"
                              style={{
                                backgroundColor: pastel.backgroundColor,
                                borderLeftWidth: "3px",
                                borderLeftColor: a.barbiere?.colore || "#d97706",
                              }}
                              title={`${format(inizio, "HH:mm")} - ${format(fine, "HH:mm")} • ${a.cliente.nome} (${a.servizio.nome})`}
                            >
                              <span className="font-bold text-slate-900">{format(inizio, "HH:mm")}</span>
                              <span className="truncate text-slate-700">{a.cliente.nome}</span>
                            </div>
                          );
                        })}
                        {appts.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-semibold block text-center">
                            +{appts.length - 3} altri
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Popup Dettaglio Appuntamento */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] sm:max-h-[90vh] flex flex-col my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modale Fisso con Chiusura Sempre Cliccabile */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: selected.barbiere?.colore || "#d97706" }}
                  title={`Barbiere: ${selected.barbiere?.nome || "Non assegnato"}`}
                />
                <h2 className="text-base font-bold text-slate-900 truncate">Scheda Appuntamento</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0 font-bold active:scale-95 text-xs"
                title="Chiudi scheda"
              >
                ✕
              </button>
            </div>

            {/* Contenuto Scrollabile Interno */}
            <div className="overflow-y-auto px-5 py-4 space-y-3.5 flex-1 [scrollbar-width:thin] text-sm">
              {/* Banner Stato */}
              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span>Stato Attuale:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATI_COLORI[selected.stato] || ""}`}>
                      {STATI_LABEL[selected.stato] || selected.stato}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400">Azioni rapide:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => aggiornaStato(selected.id, "IN_POLTRONA")}
                    className="py-1.5 px-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>💈</span>
                    <span>In Poltrona</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => aggiornaStato(selected.id, "COMPLETATO")}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>✨</span>
                    <span>Fatto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => aggiornaStato(selected.id, "NO_SHOW")}
                    className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    title="Il cliente non si è presentato"
                  >
                    <span>🚫</span>
                    <span>Assente</span>
                  </button>
                </div>
              </div>

              {/* Scheda Cliente Compatta */}
              <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] text-slate-500 uppercase font-semibold">Cliente</p>
                    {(() => {
                      const b = getCanaleBadge(selected.channel, selected.noteInterne);
                      return (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${b.color}`}>
                          {b.icon} {b.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-base font-bold text-slate-900 mt-0.5 truncate">
                    {selected.cliente?.nome || "Cliente"} {selected.cliente?.cognome || ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {selected.cliente?.telefono && (
                    <>
                      <a
                        href={generaLinkWhatsApp(
                          selected.cliente.telefono,
                          generaMessaggioWhatsAppPromemoria({
                            nomeCliente: selected.cliente?.nome || "Cliente",
                            servizio: selected.servizio?.nome || "Servizio",
                            dataOra: format(new Date(selected.dataOra), "d MMMM 'alle' HH:mm", { locale: it }),
                            barbiere: selected.barbiere?.nome || "Barbiere",
                            nomeSalone: "Barberly Studio",
                          })
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-xs"
                        title="Invia promemoria WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <a
                        href={`tel:${selected.cliente.telefono}`}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs"
                        title="Chiama cliente"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Servizio & Barbiere */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 border rounded-xl bg-white border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Servizio</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2">
                    {selected.servizio?.nome || "Servizio"}
                  </span>
                </div>
                <div className="p-2.5 border rounded-xl bg-white border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Poltrona / Staff</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: selected.barbiere?.colore || "#d97706" }}
                    />
                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                      {selected.barbiere?.nome || "Barbiere"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Riquadro Dettaglio Servizi e Calcolo Differenza Orario */}
              {(() => {
                const dett = getDettaglioOrarioServizi(selected);
                const inizio = new Date(selected.dataOra);
                const fine = getOrarioFine(selected.dataOra, selected.durata);
                const baseFine = dett.baseFine;

                return (
                  <>
                    {/* Se ci sono più servizi o tempo extra, mostra la scheda esplicativa del ricalcolo orario */}
                    {dett.hasExtra && (
                      <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 rounded-2xl text-xs space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/20">
                          <div className="flex items-center gap-1.5 font-black text-amber-900">
                            <span className="text-base">⏱️</span>
                            <span>Calcolo Differenza Orario</span>
                          </div>
                          <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
                            +{dett.tempoExtra} min di tempo in più
                          </span>
                        </div>

                        {/* Ricalcolo dell'orario di fine nel calendario */}
                        <div className="bg-white/95 p-2.5 rounded-xl border border-amber-200 space-y-1 text-[11px]">
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Orario con solo servizio base ({dett.baseDurata} min):</span>
                            <span className="font-mono line-through text-slate-400">
                              {format(inizio, "HH:mm")} → {format(baseFine, "HH:mm")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-amber-700 font-bold">
                            <span>Tempo in più per servizi aggiuntivi:</span>
                            <span className="font-mono bg-amber-100 px-1.5 py-0.2 rounded text-amber-900">
                              +{dett.tempoExtra} min
                            </span>
                          </div>
                          <div className="flex justify-between items-center font-extrabold text-slate-950 pt-1 border-t border-amber-100">
                            <span className="flex items-center gap-1">
                              <span>📅</span>
                              <span>Orario effettivo nel calendario:</span>
                            </span>
                            <span className="font-mono text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg shadow-2xs">
                              {format(inizio, "HH:mm")} → {format(fine, "HH:mm")} ({selected.durata} min)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Riquadro Standard Orario Inizio, Fine, Durata e Prezzo */}
                    <div className="p-3 border border-amber-200/80 rounded-2xl bg-amber-50/30 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Data Seduta:</span>
                        <span className="font-bold text-slate-800 capitalize">
                          {format(inizio, "EEEE d MMMM yyyy", { locale: it })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-b border-amber-100">
                        <span className="text-slate-600 font-semibold">Orario:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{format(inizio, "HH:mm")}</span>
                          <span className="text-amber-500 font-bold">→</span>
                          <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md text-sm border border-amber-200">
                            {format(fine, "HH:mm")}
                          </span>
                          {dett.tempoExtra > 0 && (
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-md">
                              +{dett.tempoExtra}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Durata:</span>
                        <span className="font-bold text-amber-700">
                          {selected.durata} min
                          {dett.tempoExtra > 0
                            ? ` (${dett.baseDurata}m base + ${dett.tempoExtra}m aggiunti)`
                            : ` (fine ore ${format(fine, "HH:mm")})`}
                        </span>
                      </div>
                      {selected.prezzoStimato !== undefined && selected.prezzoStimato !== null && (
                        <div className="flex justify-between pt-1 border-t border-amber-100">
                          <span className="text-slate-500">Prezzo Listino:</span>
                          <span className="font-bold text-emerald-700">€{Number(selected.prezzoStimato).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {selected.note && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Note Barbiere / Cliente:</span>
                  {selected.note}
                </div>
              )}

              {/* Azione Principale: Modifica Prenotazione */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const selToEdit = selected.raw || selected;
                    setSelected(null);
                    setModificaModalAppt(selToEdit);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>✏️</span>
                  <span>Modifica Prenotazione (Data, Ora, Barbiere, Servizio)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer text-center"
                >
                  Chiudi scheda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale Nuovo Appuntamento */}
      <NuovoAppuntamentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchAppuntamenti();
        }}
        initialDate={modalDate}
        initialTime={modalTime}
        initialBarberId={modalBarberId}
      />

      {/* Modale Gestione & Modifica */}
      {modificaModalAppt && (
        <GestioneModificaModal
          appointment={modificaModalAppt}
          onClose={() => setModificaModalAppt(null)}
          onUpdate={() => {
            fetchAppuntamenti();
          }}
        />
      )}
    </div>
  );
}
