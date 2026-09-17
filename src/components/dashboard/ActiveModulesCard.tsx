import React from "react";
import { MessageSquare, Gift, Globe, Layers, CheckCircle2, ShieldAlert } from "lucide-react";
import { TaaaacModuleKey } from "@/types/taaaac";

interface ActiveModulesCardProps {
  enabledModules: TaaaacModuleKey[];
}

export function ActiveModulesCard({ enabledModules }: ActiveModulesCardProps) {
  const allModules: {
    key: TaaaacModuleKey;
    title: string;
    description: string;
    icon: React.ElementType;
    badgeText: string;
  }[] = [
    {
      key: "WHATSAPP_REMINDERS",
      title: "Promemoria WhatsApp",
      description: "Notifiche automatiche e promemoria appuntamento 24h prima.",
      icon: MessageSquare,
      badgeText: "Taaaac Messaging",
    },
    {
      key: "LOYALTY_CARD",
      title: "Tessera Fedeltà Digitale",
      description: "Raccolta punti e premi automatici per i clienti abituali.",
      icon: Gift,
      badgeText: "Taaaac Loyalty",
    },
    {
      key: "VENDOLY_CHANNEL_MANAGER",
      title: "Vendoly Channel Manager",
      description: "Sincronizzazione orari e disponibilità multicanale in tempo reale.",
      icon: Layers,
      badgeText: "Vendoly Sync",
    },
    {
      key: "ONLINE_BOOKING",
      title: "Prenotazione Online Pubblica",
      description: "Widget self-service per prenotazioni dirette dal sito o Instagram.",
      icon: Globe,
      badgeText: "Taaaac Booking",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Moduli Add-On Taaaac Abilitati
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Funzionalità verticali sincronizzate con la console centrale Taaaac Core
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
          {enabledModules.length} attivi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allModules.map((mod) => {
          const isEnabled = enabledModules.includes(mod.key);
          const Icon = mod.icon;

          return (
            <div
              key={mod.key}
              className={`p-3.5 rounded-xl border transition-all ${
                isEnabled
                  ? "bg-slate-50/70 border-slate-200/90 text-slate-800"
                  : "bg-slate-50/30 border-dashed border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isEnabled ? "bg-white shadow-xs text-amber-600" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {mod.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">
                      {mod.badgeText}
                    </span>
                  </div>
                </div>

                {isEnabled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Attivo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <ShieldAlert className="w-3 h-3" />
                    Disattivo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {mod.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
