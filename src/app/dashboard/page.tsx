import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AppointmentTimeline } from "@/components/dashboard/AppointmentTimeline";
import { QuickBookingModal } from "@/components/dashboard/QuickBookingModal";
import { ActiveModulesCard } from "@/components/dashboard/ActiveModulesCard";
import { prisma, ensureDatabase } from "@/lib/db";
import { Scissors, UserCheck, Calendar as CalendarIcon, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardMainPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let appointments: any[] = [];
  let barbers: any[] = [
    { id: "b1", name: "Marco Rossi", nickname: "The Blade", chair: "Poltrona 1" },
    { id: "b2", name: "Luca Fontana", nickname: "Razor Master", chair: "Poltrona 2" },
  ];
  let services: any[] = [
    { id: "s1", name: "Taglio Sartoriale Barberly", price: 28.0, durationMinutes: 35 },
    { id: "s2", name: "Rituale Barba Tradizionale", price: 20.0, durationMinutes: 25 },
    { id: "s3", name: "Combo Vip (Taglio + Barba)", price: 44.0, durationMinutes: 60 },
  ];
  let clients: any[] = [
    { id: "c1", firstName: "Alessandro", lastName: "Bianchi", phone: "+39 333 1122334" },
    { id: "c2", firstName: "Davide", lastName: "Moretti", phone: "+39 349 9988776" },
  ];
  let totalClientsCount = 2;

  try {
    await ensureDatabase();
    const [dbAppointments, dbBarbers, dbServices, dbClients, dbClientsCount] =
      await Promise.all([
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
        prisma.client.count(),
      ]);

    appointments = dbAppointments;
    if (dbBarbers.length > 0) barbers = dbBarbers;
    if (dbServices.length > 0) services = dbServices;
    if (dbClients.length > 0) clients = dbClients;
    totalClientsCount = dbClientsCount;
  } catch (err) {
    console.warn("Dati fallback per Barberly dashboard:", err);
  }

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length;
  const estimatedRevenue = appointments
    .filter((a) => a.status !== "CANCELLED")
    .reduce((sum, a) => sum + (a.pricePaid || a.service?.price || 0), 0);

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
    <div className="space-y-6">
      {/* Header Pagina */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Dashboard Poltrone & Cassa
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <QuickBookingModal
            barbers={optionsBarbers}
            services={services}
            clients={optionsClients}
          />
        </div>
      </div>

      {/* KPI Overview */}
      <StatsOverview
        totalAppointments={totalAppointments}
        completedAppointments={completedAppointments}
        estimatedRevenue={estimatedRevenue}
        activeBarbersCount={barbers.length}
        totalClientsCount={totalClientsCount}
      />

      {/* Layout 2 Colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Timeline Poltrone Oggi */}
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
                id: a.barber?.id || "b1",
                name: a.barber?.name || "Barbiere",
                nickname: a.barber?.nickname,
              },
              client: {
                id: a.client?.id || "c1",
                firstName: a.client?.firstName || "Cliente",
                lastName: a.client?.lastName || "Ospite",
                phone: a.client?.phone || "+39 0000000000",
                loyaltyPoints: a.client?.loyaltyPoints || 0,
              },
              service: {
                id: a.service?.id || "s1",
                name: a.service?.name || "Servizio",
                price: a.service?.price || 25.0,
                durationMinutes: a.service?.durationMinutes || 30,
              },
            }))}
            hasWhatsAppModule={true}
            hasLoyaltyModule={true}
          />
        </div>

        {/* Colonna Destra: Barbieri & Moduli */}
        <div className="space-y-6">
          {/* Barbieri in Servizio Oggi */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Barbieri & Poltrone Oggi
            </h3>
            <div className="space-y-2.5">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      💈
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {barber.name}
                      </p>
                      {barber.nickname && (
                        <p className="text-[11px] text-amber-400 font-mono">
                          "{barber.nickname}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    In Poltrona
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card Taaaac */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-slate-900 border border-amber-500/30 text-white shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Barberly Suite
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tutte le prenotazioni confermate generano promemoria WhatsApp e aggiornano il registro presenze in tempo reale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
