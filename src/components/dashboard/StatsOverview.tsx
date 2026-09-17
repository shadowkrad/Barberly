import React from "react";
import { CalendarCheck, DollarSign, Users, Award } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsProps {
  totalAppointments: number;
  completedAppointments: number;
  estimatedRevenue: number;
  activeBarbersCount: number;
  totalClientsCount: number;
}

export function StatsOverview({
  totalAppointments,
  completedAppointments,
  estimatedRevenue,
  activeBarbersCount,
  totalClientsCount,
}: StatsProps) {
  const stats = [
    {
      label: "Appuntamenti Oggi",
      value: `${completedAppointments}/${totalAppointments}`,
      subtext: `${totalAppointments - completedAppointments} da completare`,
      icon: CalendarCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Incasso Previsto Oggi",
      value: formatPrice(estimatedRevenue),
      subtext: "Basato su listino servizi",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Poltrone Attive",
      value: activeBarbersCount.toString(),
      subtext: "Barbieri operativi oggi",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Anagrafica Clienti",
      value: totalClientsCount.toString(),
      subtext: "Con storico e punti fedeltà",
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-shadow hover:shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
