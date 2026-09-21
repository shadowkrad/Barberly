import AddonModuleGuard from "@/components/dashboard/AddonModuleGuard";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
import { Award, Plus, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BarberlyFedeltaPage() {
  return (
    <AddonModuleGuard
      addonId={TAAAAC_ADDONS.LOYALTY_CARD}
      title="Raccolta Punti & Fidelity Card Barber"
      description="Fidelizza i tuoi clienti con una carta punti digitale integrata: accumulo punti automatico ad ogni taglio e premi personalizzati (es. Taglio omaggio ogni 10 visite o prodotto cera/balsamo)."
      icon="🎟️"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Programma Fedeltà Barberly
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci la carta punti digitale e assegna premi ai clienti più assidui.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="text-xs font-bold uppercase text-slate-300">Regole Punti Attive</span>
            <span className="text-xs text-emerald-400 font-bold">1 € speso = 1 Punto</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400">Premio 100 Punti</span>
              <h4 className="font-bold text-sm text-white">Rituale Barba a Panno Caldo Omaggio</h4>
              <p className="text-xs text-slate-400">Riscattabile al prossimo appuntamento taglio</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400">Premio 250 Punti</span>
              <h4 className="font-bold text-sm text-white">Taglio Sartoriale Barberly Omaggio</h4>
              <p className="text-xs text-slate-400">Applicabile automaticamente a cassa</p>
            </div>
          </div>
        </div>
      </div>
    </AddonModuleGuard>
  );
}
