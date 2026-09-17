import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { LicenseStatus } from "@/types/taaaac";

interface LicenseBannerProps {
  status: LicenseStatus;
  expiresAt?: string;
}

export function LicenseBanner({ status, expiresAt }: LicenseBannerProps) {
  if (status === "ATTIVO") return null;

  if (status === "SOSPESO") {
    return (
      <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-3 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>
              Attenzione: la licenza di questa istanza Barberly risulta <strong>SOSPESA</strong> su Taaaac Core. Alcune funzionalità potrebbero essere limitate.
            </span>
          </div>
          <a
            href="https://taaaac.eu/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-rose-700 transition-colors whitespace-nowrap"
          >
            Rinnova Licenza
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2.5 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Licenza Taaaac in scadenza
            {expiresAt ? ` il ${new Date(expiresAt).toLocaleDateString("it-IT")}` : ""}. Rinnova per evitare interruzioni nei promemoria.
          </span>
        </div>
        <a
          href="https://taaaac.eu/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          Gestisci
        </a>
      </div>
    </div>
  );
}
