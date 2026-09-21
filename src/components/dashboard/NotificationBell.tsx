"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, Trash2, Clock, Calendar, Scissors, AlertCircle } from "lucide-react";

interface NotificaItem {
  id: string;
  tipo: "IN_ATTESA" | "CONFERMATO" | "CANCELLATO" | "INFO";
  titolo: string;
  descrizione: string;
  timestamp: string;
  isUnread: boolean;
  link?: string;
}

interface Props {
  placement?: "sidebar" | "topbar";
}

const READ_IDS_KEY = "barberly_notifiche_read_ids";

function getLocalReadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReadIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(ids.slice(-200)));
  } catch {
    // ignore
  }
}

export default function NotificationBell({ placement = "sidebar" }: Props) {
  const [open, setOpen] = useState(false);
  const [notifiche, setNotifiche] = useState<NotificaItem[]>([
    {
      id: "n1",
      tipo: "CONFERMATO",
      titolo: "Nuovo Taglio Prenotato",
      descrizione: "Alessandro B. per oggi alle 16:15 (Poltrona 1)",
      timestamp: new Date().toISOString(),
      isUnread: true,
      link: "/dashboard/appuntamenti",
    },
    {
      id: "n2",
      tipo: "INFO",
      titolo: "Sincronizzazione Taaaac",
      descrizione: "Canali e orari aggiornati con successo",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isUnread: false,
    },
  ]);
  const [unreadCount, setUnreadCount] = useState(1);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const readIds = new Set(getLocalReadIds());
    setNotifiche((prev) =>
      prev.map((n) => ({ ...n, isUnread: !readIds.has(n.id) && n.isUnread }))
    );
  }, []);

  useEffect(() => {
    setUnreadCount(notifiche.filter((n) => n.isUnread).length);
  }, [notifiche]);

  const markAllAsRead = () => {
    const allIds = notifiche.map((n) => n.id);
    saveLocalReadIds(allIds);
    setNotifiche((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const markOneAsRead = (id: string) => {
    const current = getLocalReadIds();
    if (!current.includes(id)) {
      saveLocalReadIds([...current, id]);
    }
    setNotifiche((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  // Chiudi cliccando fuori o premendo Esc
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
          open
            ? "bg-slate-800 text-white ring-1 ring-slate-700"
            : "text-slate-300 hover:text-white hover:bg-slate-800/80"
        }`}
        aria-label="Notifiche"
      >
        <Bell className="w-5 h-5 text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 fixed inset-x-3 top-14 sm:inset-x-auto sm:top-full sm:mt-2 ${
            placement === "sidebar"
              ? "sm:absolute sm:left-0 sm:right-auto sm:w-80 md:w-96"
              : "sm:absolute sm:right-0 sm:left-auto sm:w-80 md:w-96"
          }`}
        >
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">Notifiche Barberly</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {unreadCount} nuove
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
              >
                Segna tutte lette
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifiche.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nessuna notifica presente
              </div>
            ) : (
              notifiche.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markOneAsRead(item.id)}
                  className={`p-3 text-xs transition-colors cursor-pointer flex items-start gap-2.5 ${
                    item.isUnread ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-slate-900 truncate">{item.titolo}</p>
                      {item.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                      {item.descrizione}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/dashboard/appuntamenti"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Vedi tutti gli appuntamenti →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
