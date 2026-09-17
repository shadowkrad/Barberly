import { Header } from "@/components/layout/Header";
import { LicenseBanner } from "@/components/layout/LicenseBanner";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ActiveModulesCard } from "@/components/dashboard/ActiveModulesCard";
import { AppointmentTimeline } from "@/components/dashboard/AppointmentTimeline";
import { QuickBookingModal } from "@/components/dashboard/QuickBookingModal";
import { getTenantConfig } from "@/lib/taaaac-core";
import { prisma } from "@/lib/db";
import { Scissors, UserCheck, Calendar as CalendarIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getTenantConfig();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Dati da SQLite
  const [appointments, barbers, services, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        barber: true,
        client: true,
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
    }),
    prisma.barber.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nickname: true },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, price: true, durationMinutes: true },
    }),
    prisma.client.findMany({
      select: { id: true, firstName: true, lastName: true, phone: true },
    }),
  ]);

  const totalClientsCount = await prisma.client.count();

  // Calcolo metriche
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const estimatedRevenue = appointments
    .filter((a) => a.status !== "CANCELLED")
    .reduce((sum, a) => sum + (a.pricePaid || a.service.price), 0);

  const hasWhatsApp = config.enabledModules.includes("WHATSAPP_REMINDERS");
  const hasLoyalty = config.enabledModules.includes("LOYALTY_CARD");

  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const optionsBarbers = barbers.map((b) => ({
    id: b.id,
    name: b.nickname ? `${b.name} (${b.nickname})` : b.name,
  }));

  const optionsClients = clients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName} (${c.phone})`,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header con identità brand e stato licenza Taaaac */}
      <Header config={config} />

      {/* Banner se licenza non attiva */}
      <LicenseBanner
        status={config.licenseStatus}
        expiresAt={config.licenseExpiresAt}
      />

      {/* Contenuto Principale */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intestazione pagina con data e azione rapida */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Poltrona & Cassa
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <QuickBookingModal
              barbers={optionsBarbers}
              services={services}
              clients={optionsClients}
              onCreated={async () => {
                "use server";
                // Server action trigger
              }}
            />
          </div>
        </div>

        {/* Panoramica KPI Statistiche */}
        <StatsOverview
          totalAppointments={totalAppointments}
          completedAppointments={completedAppointments}
          estimatedRevenue={estimatedRevenue}
          activeBarbersCount={barbers.length}
          totalClientsCount={totalClientsCount}
        />

        {/* Layout a due colonne: Timeline a sinistra (2/3) e Moduli/Poltrone a destra (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Timeline Appuntamenti Odierni */}
          <div className="lg:col-span-2">
            <AppointmentTimeline
              initialAppointments={appointments.map((a) => ({
                id: a.id,
                startTime: a.startTime,
                endTime: a.endTime,
                status: a.status,
                notes: a.notes,
                pricePaid: a.pricePaid,
                barber: {
                  id: a.barber.id,
                  name: a.barber.name,
                  nickname: a.barber.nickname,
                },
                client: {
                  id: a.client.id,
                  firstName: a.client.firstName,
                  lastName: a.client.lastName,
                  phone: a.client.phone,
                  loyaltyPoints: a.client.loyaltyPoints,
                },
                service: {
                  id: a.service.id,
                  name: a.service.name,
                  price: a.service.price,
                  durationMinutes: a.service.durationMinutes,
                },
              }))}
              hasWhatsAppModule={hasWhatsApp}
              hasLoyaltyModule={hasLoyalty}
            />
          </div>

          {/* Colonna laterale: Moduli Add-on Taaaac & Poltrone in servizio */}
          <div className="space-y-6">
            {/* Scheda Moduli Taaaac */}
            <ActiveModulesCard enabledModules={config.enabledModules} />

            {/* Scheda Staff & Poltrone operative */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-700" />
                Barbieri in Servizio Oggi
              </h3>
              <div className="space-y-3">
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {barber.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {barber.name}
                        </p>
                        {barber.nickname && (
                          <p className="text-[11px] text-amber-600 font-medium">
                            "{barber.nickname}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Disponibile
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info nodo Taaaac */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Taaaac Modular Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Questo nodo gestionale opera con database SQLite isolato per
                garantire sovranità e velocità locale, mentre licenze e canali
                sono centralizzati su <strong>taaaac.eu</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            © {new Date().getFullYear()} <strong>{config.theme.brandName}</strong> — Barberly v0.1.0
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Node ID: {config.domain} | Managed by Alessio Guidelli (shadowkrad)
          </span>
        </div>
      </footer>
    </div>
  );
}
