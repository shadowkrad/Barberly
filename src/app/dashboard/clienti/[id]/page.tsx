"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Phone,
  Mail,
  Award,
  Scissors,
  Calendar,
  Save,
  Trash2,
  ShieldCheck,
  MessageCircle,
  Clock,
  ArrowLeft,
  Check,
} from "lucide-react";
import { generaLinkWhatsApp } from "@/lib/whatsapp";
import { classificaTelefono, ETICHETTA_TELEFONO, puoRicevereMessaggi } from "@/lib/phone";
import ClienteFedeltaPanel from "@/components/dashboard/ClienteFedeltaPanel";

export default function BarberlyClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [duplicatoId, setDuplicatoId] = useState<string | null>(null);

  const ricaricaCliente = useCallback(async () => {
    try {
      const r = await fetch(`/api/clienti/${id}`);
      const data = await r.json();
      setCliente(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    ricaricaCliente();
  }, [ricaricaCliente]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    setErrore(null);
    setDuplicatoId(null);
    try {
      const { puntiFedelta: _p, buoni: _b, movimentiPunti: _m, appuntamenti: _a, tokenTessera: _t, ...dati } = cliente;
      const res = await fetch(`/api/clienti/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dati, dataNascita: cliente.dataNascita ? String(cliente.dataNascita).slice(0, 10) : "" }),
      });
      if (res.ok) {
        setFeedback("Scheda cliente aggiornata con successo!");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const err = await res.json();
        setErrore(err.error || "Errore durante il salvataggio");
        setDuplicatoId(res.status === 409 ? err.clienteEsistente?.id || null : null);
      }
    } catch (e: any) {
      setErrore("Errore di connessione: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleGdprDelete = async () => {
    if (
      confirm(
        "Sei sicuro di voler anonimizzare questo cliente ai sensi del GDPR? I suoi dati personali e recapiti verranno cancellati in modo irreversibile, preservando solo il totale delle visite contabili."
      )
    ) {
      await fetch(`/api/clienti/${id}`, { method: "DELETE" });
      router.push("/dashboard/clienti");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Caricamento scheda cliente...
        </div>
      </div>
    );
  }

  if (!cliente || cliente.error) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <p className="text-rose-400 font-bold">Cliente non trovato.</p>
        <Link
          href="/dashboard/clienti"
          className="text-xs text-amber-400 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Torna all&apos;anagrafica clienti
        </Link>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/clienti"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna all&apos;elenco clienti
        </Link>
        <button
          onClick={handleGdprDelete}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 border border-rose-500/30 rounded-xl hover:bg-rose-500/10 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Anonimizza (GDPR Delete)
        </button>
      </div>

      {errore && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl">
          {errore}{" "}
          {duplicatoId && (
            <Link href={`/dashboard/clienti/${duplicatoId}`} className="underline text-amber-400">
              Apri la scheda esistente →
            </Link>
          )}
        </div>
      )}

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Scheda Dati Cliente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400 font-black text-lg flex items-center justify-center">
              {cliente.nome?.charAt(0)}{cliente.cognome?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {cliente.nome} {cliente.cognome}
              </h1>
              <p className="text-xs text-slate-400">
                Cliente registrato • {cliente.appuntamenti?.length || 0} visite in archivio
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px]">
                <span
                  className={`px-2 py-0.5 rounded-full font-semibold border ${
                    puoRicevereMessaggi(cliente.telefono)
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  📞 {ETICHETTA_TELEFONO[classificaTelefono(cliente.telefono)]}
                </span>
                {cliente.dataNascita && (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    🎂 {new Date(cliente.dataNascita).toLocaleDateString("it-IT", { day: "numeric", month: "long", timeZone: "UTC" })}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {cliente.puntiFedelta ?? 0} punti
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${cliente.telefono}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Chiama
            </a>
            {puoRicevereMessaggi(cliente.telefono) && (
              <a
                href={generaLinkWhatsApp(
                  cliente.telefono,
                  `Ciao ${cliente.nome}! Ti contattiamo da Barberly.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={cliente.nome || ""}
                onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Cognome
              </label>
              <input
                type="text"
                required
                value={cliente.cognome || ""}
                onChange={(e) => setCliente({ ...cliente, cognome: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Telefono (Cellulare)
              </label>
              <input
                type="tel"
                required
                value={cliente.telefono || ""}
                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Email (opzionale per conferme automatiche)
              </label>
              <input
                type="email"
                value={cliente.email || ""}
                placeholder="Nessuna email registrata"
                onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Data di nascita (opzionale, per il buono compleanno)
              </label>
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={cliente.dataNascita ? String(cliente.dataNascita).slice(0, 10) : ""}
                onChange={(e) => setCliente({ ...cliente, dataNascita: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Consenso promozionale</p>
                <p className="text-[10px] text-slate-400">Per ricevere il buono compleanno via email</p>
              </div>
              <input
                type="checkbox"
                checked={cliente.consensoMarketing || false}
                onChange={(e) => setCliente({ ...cliente, consensoMarketing: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Note Tecniche & Preferenze di Stile (Taglio, Barba, Massaggio)
            </label>
            <textarea
              rows={3}
              value={cliente.note || ""}
              onChange={(e) => setCliente({ ...cliente, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="Es. Sfumatura a pelle sui lati con misura 1 sopra a forbice. Barba squadrata definita, olio profumato tabacco."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Punti Fedeltà Barberly
                </p>
                <p className="text-[10px] text-slate-400">
                  I punti si gestiscono dalla{" "}
                  <Link href="/dashboard/fedelta" className="text-amber-400 underline">
                    pagina Fedeltà
                  </Link>
                </p>
              </div>
              <span className="w-20 text-center text-sm text-amber-400 font-black font-mono">{cliente.puntiFedelta || 0}</span>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Consenso Privacy GDPR
                </p>
                <p className="text-[10px] text-slate-400">Trattamento dati e comunicazioni</p>
              </div>
              <input
                type="checkbox"
                checked={cliente.consensoPrivacy || false}
                onChange={(e) =>
                  setCliente({ ...cliente, consensoPrivacy: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>

      {/* Fedeltà, punti e invio tessera */}
      <ClienteFedeltaPanel
        clienteId={cliente.id}
        nomeCliente={`${cliente.nome || ""} ${cliente.cognome || ""}`.trim()}
        telefono={cliente.telefono || ""}
        email={cliente.email}
        punti={cliente.puntiFedelta ?? 0}
        tokenTessera={cliente.tokenTessera}
        movimenti={cliente.movimentiPunti || []}
        nomeAttivita={cliente.nomeAttivita}
        dark
        accent="amber"
        onSaldoAggiornato={ricaricaCliente}
      />

      {/* Buoni */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Buoni</h2>
          <Link href="/dashboard/gift-cards" className="text-[11px] text-amber-400 font-semibold hover:underline">
            Gestisci buoni →
          </Link>
        </div>
        {(cliente.buoni || []).length === 0 ? (
          <p className="text-xs text-slate-500">Nessun buono attivo per questo cliente.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {cliente.buoni.map((b: any) => (
              <div key={b.id} className="py-2 text-xs">
                <p className="text-slate-200 font-medium">
                  {b.tipoValore === "PERCENTUALE"
                    ? `${b.percentuale}% di sconto`
                    : b.tipoValore === "SERVIZIO"
                    ? b.descrizioneServizio
                    : `${Number(b.saldoResiduo).toFixed(2)} € di credito`}
                </p>
                <p className="text-[10px] text-slate-500">
                  <span className="font-mono">{b.codice}</span> ·{" "}
                  {b.dataScadenza ? `scade il ${new Date(b.dataScadenza).toLocaleDateString("it-IT")}` : "senza scadenza"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storico Visite Appuntamenti */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          Storico Visite & Appuntamenti ({cliente.appuntamenti?.length || 0})
        </h2>

        {(!cliente.appuntamenti || cliente.appuntamenti.length === 0) ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Nessun appuntamento registrato finora per questo cliente.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {cliente.appuntamenti.map((a: any) => (
              <div
                key={a.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <span>{new Date(a.data).toLocaleDateString("it-IT")}</span>
                    <span className="font-mono text-amber-400 text-[11px] font-semibold">{a.orario}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-amber-500" />
                      {a.servizio}
                    </span>
                    <span>•</span>
                    <span>Poltrona: {a.barbiere}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    € {Number(a.prezzo || 0).toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.stato === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : a.stato === "CANCELLED"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 line-through"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {a.stato}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
