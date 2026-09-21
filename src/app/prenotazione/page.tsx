import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BookingWizard } from "@/components/public/BookingWizard";
import { getTenantConfig } from "@/lib/taaaac-core";
import { prisma, ensureDatabase } from "@/lib/db";
import { ArrowLeft, Sparkles, Scissors } from "lucide-react";

export const dynamic = "force-dynamic";

interface PublicBarberItem {
  id: string;
  name: string;
  nickname?: string | null;
}

interface PublicServiceItem {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  category: string;
}

const FALLBACK_SERVICES: PublicServiceItem[] = [
  {
    id: "s1",
    name: "Taglio Sartoriale Barberly",
    description: "Consulenza stile, taglio a forbice e rasoio, lavaggio rilassante e styling finale.",
    durationMinutes: 35,
    price: 28.0,
    category: "HAIR",
  },
  {
    id: "s2",
    name: "Rituale Barba Tradizionale",
    description: "Modellatura barba, doppio panno caldo agli oli essenziali e rasatura rifinita.",
    durationMinutes: 25,
    price: 20.0,
    category: "BEARD",
  },
  {
    id: "s3",
    name: "Combo Vip (Taglio + Barba)",
    description: "L'esperienza grooming completa: taglio sartoriale e rituale barba.",
    durationMinutes: 60,
    price: 44.0,
    category: "COMBO",
  },
  {
    id: "s4",
    name: "Trattamento Purificante Cute",
    description: "Scrub ossigenante ed esfoliante per cute con fiala anticaduta.",
    durationMinutes: 20,
    price: 18.0,
    category: "TREATMENT",
  },
];

const FALLBACK_BARBERS: PublicBarberItem[] = [
  { id: "b1", name: "Marco Rossi", nickname: "The Blade" },
  { id: "b2", name: "Luca Fontana", nickname: "Razor Master" },
];

export default async function PrenotazionePage() {
  const config = await getTenantConfig();

  let services: PublicServiceItem[] = FALLBACK_SERVICES;
  let barbers: PublicBarberItem[] = FALLBACK_BARBERS;

  try {
    await ensureDatabase();
    const [dbServices, dbBarbers] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          durationMinutes: true,
          price: true,
          category: true,
        },
      }),
      prisma.barber.findMany({
        where: { isActive: true },
        select: { id: true, name: true, nickname: true },
      }),
    ]);

    if (dbServices.length > 0) services = dbServices;
    if (dbBarbers.length > 0) barbers = dbBarbers;
  } catch (err) {
    console.warn("Utilizzo dati di fallback prenotazione Barberly:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <PublicHeader config={config} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Link Torna alla Vetrina */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Vetrina
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            Conferma Istantanea
          </span>
        </div>

        {/* Intestazione Form */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2.5">
            <Scissors className="w-7 h-7 text-amber-600" />
            Prenota il tuo Posto in Poltrona
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Scegli il servizio e l&apos;orario che preferisci in pochi secondi, senza attese telefoniche.
          </p>
        </div>

        {/* Wizard Form Effettivo */}
        <BookingWizard
          services={services}
          barbers={barbers}
          brandName={config.theme.brandName}
          phone={config.contact?.phone}
        />
      </main>

      <PublicFooter config={config} />
    </div>
  );
}
