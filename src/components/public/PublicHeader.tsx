import React from "react";
import Link from "next/link";
import { Scissors, Phone, MessageSquare, Clock, MapPin, Sparkles, Lock } from "lucide-react";
import { TenantConfigResponse } from "@/types/taaaac";

interface PublicHeaderProps {
  config: TenantConfigResponse;
  onBookClick?: () => void;
}

export function PublicHeader({ config }: PublicHeaderProps) {
  const { theme, contact } = config;

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink">
          {theme.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.logoUrl}
              alt={theme.brandName}
              className="h-8 sm:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain rounded-xl shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight truncate">
              {theme.brandName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">Aperto Oggi 09:00 - 19:30</span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <span className="text-amber-700 font-semibold hidden md:inline">Grooming & Barber Club</span>
            </p>
          </div>
        </div>

        {/* Quick Contacts & CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* WhatsApp Direct */}
          {contact?.phone && (
            <a
              href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Telefono */}
          {contact?.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.phone}</span>
            </a>
          )}

          {/* Prenota Ora CTA */}
          <Link
            href="/prenotazione"
            className="taaaac-btn-accent text-xs sm:text-sm py-2 px-3 sm:px-4 shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Prenota</span>
            <span className="hidden sm:inline">Taglio</span>
          </Link>

          {/* Discreet Staff / Admin Login */}
          <Link
            href="/admin"
            title="Area Riservata Staff"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
