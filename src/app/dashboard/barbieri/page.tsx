import { prisma, ensureDatabase } from "@/lib/db";
import { UserCheck, Scissors, Plus, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarberlyBarbieriPage() {
  await ensureDatabase();
  const barbers = await prisma.barber.findMany({
    include: { appointments: { take: 5 } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            Staff & Maestri Barbieri
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci le poltrone attive, orari di presenza e avatar dei professionisti.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((b) => (
          <div
            key={b.id}
            className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-black text-lg flex items-center justify-center">
                💈
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{b.name}</h3>
                {b.nickname && (
                  <p className="text-xs text-amber-400 font-mono">"{b.nickname}"</p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Stato poltrona:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Attivo in bottega
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Appuntamenti gestiti:</span>
                <strong className="text-slate-200">{b.appointments.length}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
