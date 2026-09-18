import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BookingWizard } from "@/components/public/BookingWizard";
import { getTenantConfig } from "@/lib/taaaac-core";
import { prisma, ensureDatabase } from "@/lib/db";
import {
  Scissors,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  CheckCircle,
  MapPin,
  Flame,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

// Dati dimostrativi di fallback garantiti
const FALLBACK_SERVICES: PublicServiceItem[] = [
  {
    id: "s1",
    name: "Taglio Sartoriale Barberly",
    description: "Consulenza stile, taglio a forbice e rasoio, lavaggio rilassante con massaggio e styling finale.",
    durationMinutes: 35,
    price: 28.0,
    category: "HAIR",
  },
  {
    id: "s2",
    name: "Rituale Barba Tradizionale",
    description: "Modellatura barba, doppio panno caldo agli oli essenziali, rasatura rifinita e balsamo nutriente.",
    durationMinutes: 25,
    price: 20.0,
    category: "BEARD",
  },
  {
    id: "s3",
    name: "Combo Vip (Taglio + Barba)",
    description: "L'esperienza grooming completa: taglio sartoriale abbinato al rituale completo della barba.",
    durationMinutes: 60,
    price: 44.0,
    category: "COMBO",
  },
  {
    id: "s4",
    name: "Trattamento Purificante Cute",
    description: "Scrub ossigenante ed esfoliante per cute con fiala anticaduta e panno caldo defaticante.",
    durationMinutes: 20,
    price: 18.0,
    category: "TREATMENT",
  },
];

const FALLBACK_BARBERS: PublicBarberItem[] = [
  { id: "b1", name: "Marco Rossi", nickname: "The Blade" },
  { id: "b2", name: "Luca Fontana", nickname: "Razor Master" },
];

export default async function PublicHomePage() {
  const config = await getTenantConfig();

  // Inizializza DB e recupera dati con fallback garantito
  let services = FALLBACK_SERVICES;
  let barbers = FALLBACK_BARBERS;

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
    console.warn("Utilizzo dati di fallback vetrina pubblica:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header Vetrina */}
      <PublicHeader config={config} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Grooming Club Tradizionale • Dal 2018</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Tagli Sartoriali &amp; Rasatura a Regola d'Arte
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Rilassati nella nostra poltrona d'epoca. Panni caldi, oli essenziali profumati e forbici artigianali per definire il tuo stile unico.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.9 / 5 stelle (340+ recensioni)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prodotti Premium Naturali</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Barber Master Certificati</span>
            </span>
          </div>

          <div className="pt-4">
            <a
              href="#prenota"
              className="taaaac-btn-accent text-sm py-3.5 px-8 shadow-lg inline-flex items-center gap-2 font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prenota il Tuo Taglio Adesso</span>
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Sezione Listino Servizi */}
        <section id="servizi" className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Il Nostro Listino Servizi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ogni servizio include lavaggio preparatorio, styling con cera a base d'acqua e panno rinfrescante finale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                      {service.category}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">
                    {service.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {service.durationMinutes} min
                  </span>
                  <a
                    href="#prenota"
                    className="text-amber-600 hover:text-amber-700 font-bold"
                  >
                    Prenota →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sezione Team & Barbieri */}
        <section id="team" className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              I Barbieri in Salone
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Professionisti esperti pronti a consigliarti il look più adatto alla fisionomia del tuo viso.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 font-extrabold text-xl mx-auto flex items-center justify-center shadow-xs">
                  {barber.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {barber.name}
                  </h4>
                  {barber.nickname && (
                    <p className="text-xs text-amber-600 font-semibold">
                      "{barber.nickname}"
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    Specialista sfumature a rasoio e barbe sagomate
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Poltrona Operativa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sezione Wizard di Prenotazione Self-Service */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Self-Service Booking</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Prenota il tuo Posto in Poltrona
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Scegli il servizio e l'orario che preferisci in pochi secondi, senza attese telefoniche.
            </p>
          </div>

          <BookingWizard
            services={services}
            barbers={barbers}
            brandName={config.theme.brandName}
            phone={config.contact?.phone}
          />
        </section>
      </main>

      {/* Footer con link discreto per l'esercente */}
      <PublicFooter config={config} />
    </div>
  );
}
