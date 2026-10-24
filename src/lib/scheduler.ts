import { eseguiInvioReportGiornaliero } from "./report-giornaliero";

const globalForScheduler = globalThis as unknown as {
  __barberly_scheduler_interval?: NodeJS.Timeout | null;
  __barberly_last_report_date?: string | null;
  __barberly_is_running_report?: boolean;
};

export function getLocalItalyTime(date = new Date()): { timeStr: string; dateStr: string } {
  const timeZone = process.env.TZ || "Europe/Rome";
  try {
    const timeStr = new Intl.DateTimeFormat("it-IT", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    const dateStr = new Intl.DateTimeFormat("it-IT", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

    return { timeStr, dateStr };
  } catch {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return { timeStr: `${h}:${m}`, dateStr: `${d}/${mo}/${y}` };
  }
}

export function startBarberlyScheduler(): void {
  if (globalForScheduler.__barberly_scheduler_interval) {
    return;
  }

  console.log("[Barberly Scheduler] ⏰ Inizializzazione motore di schedulazione automatico...");

  // Controllo ogni 30 secondi
  const interval = setInterval(async () => {
    try {
      const { timeStr, dateStr } = getLocalItalyTime();
      const targetReportTime = (process.env.DAILY_REPORT_TIME || "07:30").trim();

      if (
        timeStr === targetReportTime &&
        globalForScheduler.__barberly_last_report_date !== dateStr &&
        !globalForScheduler.__barberly_is_running_report
      ) {
        globalForScheduler.__barberly_last_report_date = dateStr;
        globalForScheduler.__barberly_is_running_report = true;

        console.log(
          `[Barberly Scheduler] 📋 Orario target ${targetReportTime} raggiunto (oggi ${dateStr}). Invio report mattutino in corso...`
        );

        try {
          const res = await eseguiInvioReportGiornaliero();
          if (res.skipped) {
            console.log(`[Barberly Scheduler] ℹ️ Report mattutino saltato: ${res.message}`);
          } else if (res.success) {
            console.log(
              `[Barberly Scheduler] ✅ Report mattutino inviato con successo a ${res.emailInviataA} (${res.totaleAppuntamenti} clienti).`
            );
          } else {
            console.error("[Barberly Scheduler] ⚠️ Errore invio report mattutino:", res.error);
          }
        } catch (err: any) {
          console.error(
            "[Barberly Scheduler] ❌ Eccezione durante invio report mattutino:",
            err?.message || err
          );
        } finally {
          globalForScheduler.__barberly_is_running_report = false;
        }
      }
    } catch (loopErr) {
      console.error("[Barberly Scheduler] Errore loop scheduler:", loopErr);
    }
  }, 30000);

  globalForScheduler.__barberly_scheduler_interval = interval;

  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}
