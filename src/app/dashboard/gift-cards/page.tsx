import AddonModuleGuard from "@/components/dashboard/AddonModuleGuard";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
import { Gift, Plus, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BarberlyGiftCardsPage() {
  return (
    <AddonModuleGuard
      addonId={TAAAAC_ADDONS.GIFT_CARDS}
      title="Buoni Regalo & Gift Cards Barber"
      description="Emetti coupon e voucher regalo personalizzati per amici o parenti con codice univoco, saldo a scalare e scadenza configurabile."
      icon="🎁"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-500" />
            Voucher & Buoni Regalo Barberly
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestisci i codici emessi e il riscatto al momento del pagamento del servizio.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="text-xs font-bold uppercase text-slate-300">Voucher Attivi</span>
            <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
              + Emetti Nuovo Buono
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-400 text-sm">#GIFT-VIP-50</span>
                <p className="text-slate-400 mt-0.5">Acquistato da: Giulia M. per Marco R.</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-white text-sm">50,00 €</span>
                <span className="text-[10px] text-emerald-400 block">Attivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AddonModuleGuard>
  );
}
