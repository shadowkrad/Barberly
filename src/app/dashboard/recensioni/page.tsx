import AddonModuleGuard from "@/components/dashboard/AddonModuleGuard";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
import { Star, QrCode, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BarberlyRecensioniPage() {
  return (
    <AddonModuleGuard
      addonId={TAAAAC_ADDONS.GOOGLE_REVIEWS}
      title="Booster Recensioni Google Maps"
      description="Aumenta la reputazione della tua bottega: invia una richiesta automatica di recensione 5 stelle via WhatsApp ai clienti soddisfatti subito dopo il taglio o mostra il QR code a specchio."
      icon="⭐"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Recensioni Google Maps Booster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ottimizza la tua scheda Google Business e scala i risultati locali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-white">QR Code da Specchio / Cassa</h3>
            <p className="text-xs text-slate-400">
              I clienti inquadrano il QR code mentre pagano e vengono indirizzati direttamente al form 5 stelle.
            </p>
            <div className="w-28 h-28 mx-auto bg-white rounded-xl p-2 flex items-center justify-center">
              <QrCode className="w-24 h-24 text-slate-900" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-white">Invio Automatico Post-Taglio</h3>
            <p className="text-xs text-slate-400">
              Un messaggio WhatsApp gentile 1 ora dopo il servizio: "Grazie per essere passato da Barberly! Ci lasci un feedback su Google?"
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono">
              🟢 Attivazione automatica: 1 ora post-appuntamento
            </div>
          </div>
        </div>
      </div>
    </AddonModuleGuard>
  );
}
