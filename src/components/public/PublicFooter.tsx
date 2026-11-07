import React from "react";
import Link from "next/link";
import { Scissors, MapPin, Phone, Clock, Lock, Sparkles, Mail } from "lucide-react";
import { TenantConfigResponse } from "@/types/taaaac";
import { parseShowcaseConfig } from "@/lib/showcase-defaults";
import { caricaVetrinaUnificata } from "@/lib/anagrafica-attivita";

interface PublicFooterProps {
  config: TenantConfigResponse;
}

export async function PublicFooter({ config }: PublicFooterProps) {
  const { theme, contact } = config;
  // Il piede legge sempre la vetrina salvata, con dati dell'attivita' e orari ufficiali allineati
  let unificata: Awaited<ReturnType<typeof caricaVetrinaUnificata>> | null = null;
  try {
    unificata = await caricaVetrinaUnificata();
  } catch {}
  const showcase = unificata
    ? unificata.showcase
    : typeof config.showcaseConfig === "string"
    ? parseShowcaseConfig(config.showcaseConfig)
    : (config.showcaseConfig || parseShowcaseConfig(null));

  const contactInfo: any = showcase.contactInfo || {};
  const mostraIndirizzo = showcase.sections?.showAddress !== false;
  const mostraTelefono = showcase.sections?.showPhone !== false;
  const mostraEmail = showcase.sections?.showEmail !== false;
  const mostraColonnaContatti = showcase.sections?.showContact !== false && (mostraIndirizzo || mostraTelefono || mostraEmail);
  const righeOrari: Array<{ label: string; orario: string }> = Array.isArray(contactInfo.hoursRows) ? contactInfo.hoursRows : [];

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${(showcase.sections?.showHours !== false ? 1 : 0) + (mostraColonnaContatti ? 1 : 0) === 2 ? "md:grid-cols-4" : (showcase.sections?.showHours !== false ? 1 : 0) + (mostraColonnaContatti ? 1 : 0) === 1 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-8 pb-8 border-b border-slate-800 text-xs`}>
          {/* Colonna 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400"
                style={{ backgroundColor: theme.primaryColor || showcase.primaryColor }}
              >
                <Scissors className="w-4 h-4" />
              </div>
              <span>{showcase.brandName || theme.brandName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {contactInfo.brandClaim || "Il punto di riferimento per il grooming maschile e la rasatura tradizionale con panni caldi e prodotti esclusivi."}
            </p>
          </div>

          {/* Colonna 2: Orari (Condizionale da showcase.sections.showHours) */}
          {showcase.sections?.showHours !== false && (
            <div className="space-y-2">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {showcase.customLabels?.hoursTitle || "Orari di Apertura"}
              </h4>
              {righeOrari.length > 0 ? (
                righeOrari.map((r) => (
                  <p key={r.label} className="text-slate-400">
                    <span className="text-slate-200 font-semibold">{r.label}:</span> {r.orario}
                  </p>
                ))
              ) : (
                <p className="text-slate-400">{contactInfo.hoursWeekday}</p>
              )}
              {contactInfo.hoursNote && (
                <p className="text-amber-400 font-semibold pt-1">{contactInfo.hoursNote}</p>
              )}
            </div>
          )}

          {/* Colonna 3: Indirizzo e Contatti */}
          {mostraColonnaContatti && (
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {showcase.customLabels?.contactTitle || "Dove Siamo"}
            </h4>
            {mostraIndirizzo && (
              <p className="text-slate-400">{contactInfo.address || config.address || "Via Roma, 42 — Milano (MI)"}</p>
            )}
            {mostraIndirizzo && contactInfo.addressNote && (
              <p className="text-slate-500 text-[11px]">{contactInfo.addressNote}</p>
            )}
            {mostraTelefono && (contactInfo.phone || contact?.phone) && (
              <p className="text-slate-400 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>Tel / WhatsApp: {contactInfo.phone || contact?.phone}</span>
              </p>
            )}
            {mostraEmail && (contactInfo.email || contact?.email) && (
              <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>Email: {contactInfo.email || contact?.email}</span>
              </p>
            )}
          </div>
          )}

          {/* Colonna 4: Garanzia & Qualità */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Esperienza & Qualità
            </h4>
            <p className="text-slate-400 leading-relaxed">
              {contactInfo.guaranteeText || "Tagli su misura, cura della barba e rituali di benessere maschile realizzati con passione ed eccellenza artigianale."}
            </p>
          </div>
        </div>

        {/* Bottom Bar con link discreto admin */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <span>
            © {new Date().getFullYear()} {showcase.brandName || theme.brandName} — Tutti i diritti riservati.
          </span>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
              title="Accesso pannello di controllo"
            >
              <Lock className="w-3 h-3" />
              <span>Area Riservata Staff</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
