import { prisma, ensureDatabase } from "@/lib/db";
import { Users, Phone, Award, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarberlyClientiPage() {
  await ensureDatabase();
  const clients = await prisma.client.findMany({
    include: { appointments: { take: 3, orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Rubrica Clienti & Schede Barba
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Anagrafica, preferenze di taglio, punti fedeltà e storico visite.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Nessun cliente registrato in archivio.
          </div>
        ) : (
          clients.map((c) => (
            <div
              key={c.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-bold flex items-center justify-center">
                    {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{c.firstName} {c.lastName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-amber-500" /> {c.phone}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> {c.loyaltyPoints} pt
                </span>
              </div>

              {c.notes && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Note Stile:</strong>
                  {c.notes}
                </div>
              )}

              <div className="pt-2 border-t border-slate-700/50 flex justify-between text-[11px] text-slate-400">
                <span>Visite totali:</span>
                <strong className="text-slate-200">{c.appointments.length}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
