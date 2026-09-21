import { prisma, ensureDatabase } from "@/lib/db";
import { Tag, Clock, Scissors, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarberlyListinoPage() {
  await ensureDatabase();
  const services = await prisma.service.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Listino Tagli & Servizi Barber
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci trattamenti, rituali barba a panno caldo, combo VIP e listino prezzi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {s.category}
                </span>
                <span className="font-mono font-bold text-base text-amber-400">
                  {s.price.toFixed(2)} €
                </span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">{s.name}</h3>
              {s.description && (
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {s.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> {s.durationMinutes} min
              </span>
              <span className="text-emerald-400 font-semibold text-[11px]">
                Disponibile online
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
