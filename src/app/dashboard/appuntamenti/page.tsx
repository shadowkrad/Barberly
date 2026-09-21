import { prisma, ensureDatabase } from "@/lib/db";
import { Clock, CheckCircle2, XCircle, Search, Scissors, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarberlyAppuntamentiPage() {
  await ensureDatabase();
  const appointments = await prisma.appointment.findMany({
    include: { barber: true, client: true, service: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Registro Appuntamenti
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Storico completo e gestione stati (confermato, completato, cancellato).
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-3.5">Orario</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Servizio</th>
                <th className="p-3.5">Barbiere</th>
                <th className="p-3.5">Prezzo</th>
                <th className="p-3.5">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Nessun appuntamento registrato.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      {a.startTime} - {a.endTime}
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      <div>{a.client.firstName} {a.client.lastName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Phone className="w-2.5 h-2.5" /> {a.client.phone}
                      </div>
                    </td>
                    <td className="p-3.5">{a.service.name}</td>
                    <td className="p-3.5 font-medium text-slate-200">{a.barber.name}</td>
                    <td className="p-3.5 font-mono font-bold text-white">{a.service.price} €</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
