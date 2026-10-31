import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import FloatingWhatsAppWidget from "@/components/public/FloatingWhatsAppWidget";
import { getTenantConfig } from "@/lib/taaaac-core";
import { prisma, ensureDatabase } from "@/lib/db";
import { parseShowcaseConfig } from "@/lib/showcase-defaults";
import {
  Scissors,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  CheckCircle,
  CheckCircle2,
  Flame,
  ArrowRight,
  Calendar,
  Quote,
  MapPin,
  Phone,
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

const FALLBACK_SERVICES: PublicServiceItem[] = [
  {
    id: "s1",
    name: "Taglio Sartoriale & Styling",
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

  let services = FALLBACK_SERVICES;
  let barbers = FALLBACK_BARBERS;
  let showcase = parseShowcaseConfig(null);

  try {
    await ensureDatabase();
    const [dbServices, dbBarbers, localCache] = await Promise.all([
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
      prisma.tenantLocalCache.findUnique({
        where: { id: "singleton" },
        select: { showcaseConfig: true },
      }),
    ]);

    if (dbServices.length > 0) services = dbServices;
    if (dbBarbers.length > 0) barbers = dbBarbers;
    if (localCache?.showcaseConfig) {
      showcase = parseShowcaseConfig(localCache.showcaseConfig);
    }
  } catch (err) {
    console.warn("Utilizzo dati di fallback vetrina pubblica:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header Vetrina */}
      <PublicHeader config={config} />

      {/* Hero Section Dinamica */}
      {showcase.sections.showHero && (
        <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24">
          {/* Sfondo Copertina Hero con Overlay Regolabile */}
          {showcase.hero.coverImageUrl ? (
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={showcase.hero.coverImageUrl}
                alt="Hero Cover"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 bg-slate-950"
                style={{ opacity: (showcase.hero.overlayOpacity ?? 85) / 100 }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            {showcase.hero.badgeText && (
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${showcase.accentColor || "#d97706"}15`,
                  borderColor: `${showcase.accentColor || "#d97706"}40`,
                  color: showcase.accentColor || "#d97706",
                }}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{showcase.hero.badgeText}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
              {showcase.hero.title}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {showcase.hero.subtitle}
            </p>

            {/* Trust Badges Dinamici */}
            {showcase.sections.showTrustBadges && showcase.trustBadges?.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-2 text-xs font-semibold text-slate-300">
                {showcase.trustBadges.map((tb) => (
                  <span
                    key={tb.id}
                    className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs"
                  >
                    {tb.icon === "star" && (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    )}
                    {tb.icon === "shield" && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    {tb.icon === "award" && (
                      <Award className="w-4 h-4 text-amber-400" />
                    )}
                    {tb.icon === "clock" && (
                      <Clock className="w-4 h-4 text-blue-400" />
                    )}
                    {tb.icon === "check" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{tb.text}</span>
                  </span>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/prenotazione"
                style={{ backgroundColor: showcase.accentColor || "#d97706" }}
                className="text-slate-950 text-sm py-3.5 px-8 shadow-lg inline-flex items-center gap-2 font-bold rounded-xl transition hover:opacity-95 active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>{showcase.hero.ctaPrimaryText || "Prenota il Tuo Taglio"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {showcase.hero.ctaSecondaryText && (
                <a
                  href="#servizi"
                  className="bg-slate-800/90 hover:bg-slate-700 text-white text-sm py-3.5 px-6 rounded-xl border border-slate-600 transition"
                >
                  {showcase.hero.ctaSecondaryText}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Sezione Listino Servizi */}
        {showcase.sections.showServices && (
          <section id="servizi" className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {showcase.customLabels.servicesTitle || "Il Nostro Listino Servizi"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {showcase.customLabels.servicesSubtitle ||
                  "Ogni servizio include lavaggio preparatorio, styling e panno rinfrescante finale."}
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
                    <Link
                      href="/prenotazione"
                      style={{ color: showcase.accentColor || "#d97706" }}
                      className="font-bold hover:underline"
                    >
                      Prenota →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sezione Galleria Fotografica Vetrina */}
        {showcase.sections.showGallery && showcase.gallery.images?.length > 0 && (
          <section id="galleria" className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {showcase.gallery.title || "Atmosfera & Creazioni"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {showcase.gallery.subtitle || "Dettagli della nostra bottega e tagli sartoriali realizzati."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {showcase.gallery.images.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs aspect-4/3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.caption || "Salone"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent text-white text-xs">
                      <p className="font-medium line-clamp-2">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sezione Team & Barbieri */}
        {showcase.sections.showBarbers && (
          <section id="team" className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {showcase.customLabels.barbersTitle || "I Barbieri in Salone"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {showcase.customLabels.barbersSubtitle ||
                  "Professionisti esperti pronti a consigliarti il look più adatto alla tua fisionomia."}
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
                        &quot;{barber.nickname}&quot;
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
        )}

        {/* Sezione Chi Siamo / Bottega */}
        {showcase.sections.showAbout && (
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: showcase.accentColor || "#d97706" }}
              >
                {showcase.about.subtitle}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                {showcase.about.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {showcase.about.description}
              </p>

              {showcase.about.quoteText && (
                <blockquote className="pt-4 border-t border-slate-800/80 italic text-slate-300 text-sm space-y-1.5">
                  <p>&ldquo;{showcase.about.quoteText}&rdquo;</p>
                  {showcase.about.quoteAuthor && (
                    <footer
                      className="font-bold not-italic text-xs"
                      style={{ color: showcase.accentColor || "#d97706" }}
                    >
                      — {showcase.about.quoteAuthor}
                    </footer>
                  )}
                </blockquote>
              )}
            </div>
          </section>
        )}

        {/* Sezione Call-To-Action Prenotazione */}
        <section className="bg-amber-50/70 rounded-3xl p-8 sm:p-12 border border-amber-200/80 text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-700 flex items-center justify-center mx-auto text-2xl shadow-xs">
            📅
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prenota il tuo Posto in pochi secondi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Scegli il barbiere, il trattamento e l&apos;orario perfetto per te direttamente dal nostro calendario online. Riceverai conferma immediata e promemoria automatico.
          </p>
          <div className="pt-2">
            <Link
              href="/prenotazione"
              style={{ backgroundColor: showcase.accentColor || "#d97706" }}
              className="text-slate-950 text-sm py-3.5 px-8 shadow-md inline-flex items-center gap-2 font-bold rounded-xl transition hover:opacity-95"
            >
              <span>Apri Form Prenotazione</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer con link discreto per l'esercente */}
      <PublicFooter config={config} />

      {/* Widget Flottante WhatsApp Vetrina */}
      <FloatingWhatsAppWidget
        phone={config.contact?.phone}
        brandName={config.theme.brandName || "Barberly Studio"}
      />
    </div>
  );
}
