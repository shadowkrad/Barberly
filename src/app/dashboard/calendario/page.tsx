import { prisma, ensureDatabase } from "@/lib/db";
import { Calendar as CalendarIcon, Clock, User, Scissors, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarberlyCalendarioPage() {
  await ensureDatabase();
  const appointments = await prisma.appointment.findMany({
    include: { barber: true, client: true, service: true },
    orderBy: { date: "asc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-500" />
            Calendario Poltrone & Orari
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizzazione temporale di tutti gli slot prenotati per barbiere.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase text-slate-300">
              Prossimi Appuntamenti in Programma ({appointments.length})
            </span>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nessun appuntamento programmato. I nuovi appuntamenti appariranno automaticamente qui.
          </div>
        ) : (
          <div className="space-y-2.5">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex flex-col items-center justify-center shrink-0">
                    <span>{appt.startTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-white">
                        {appt.client.firstName} {appt.client.lastName}
                      </strong>
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.2 rounded">
                        {appt.barber.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {appt.service.name} · {appt.service.durationMinutes} min · {appt.service.price} €
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      appt.status === "CONFIRMED"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
