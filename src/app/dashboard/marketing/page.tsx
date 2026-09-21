import AddonModuleGuard from "@/components/dashboard/AddonModuleGuard";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
import { Share2, Send, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BarberlyMarketingPage() {
  return (
    <AddonModuleGuard
      addonId={TAAAAC_ADDONS.MARKETING_1CLICK}
      title="Marketing 1-Click & Broadcast WhatsApp"
      description="Invia comunicazioni, promozioni per giornate calme e auguri di compleanno direttamente via WhatsApp a tutti i tuoi clienti con un solo tocco."
      icon="📣"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-amber-500" />
            Marketing Broadcast WhatsApp
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Campagne istantanee per riempire i buchi in agenda e riattivare i clienti dormienti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-white">Riattiva Clienti Assenti da 45 Giorni</h3>
            <p className="text-xs text-slate-400">
              Invia un messaggio cordiale con invito a prenotare il rinfresco del taglio.
            </p>
            <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition">
              Invia Broadcast (32 Destinatari)
            </button>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-white">Promozione Giovedì Poltrona Relax</h3>
            <p className="text-xs text-slate-400">
              Offri il trattamento barba scontato del 20% nelle ore mattutine.
            </p>
            <button className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition">
              Configura Messaggio
            </button>
          </div>
        </div>
      </div>
    </AddonModuleGuard>
  );
}
