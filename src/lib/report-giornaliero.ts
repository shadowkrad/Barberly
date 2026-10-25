import { risolviStatoGiornoBarberly } from "@/lib/festivita-italiane";
import { prisma, ensureDatabase } from "@/lib/db";
import { sendNotificationMail } from "@/lib/taaaac-mailer";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function eseguiInvioReportGiornaliero(options?: { isForcedManual?: boolean }) {
  await ensureDatabase();

  // 1. Lettura configurazione tenant / salone
  const cache = await prisma.tenantLocalCache.findUnique({
    where: { id: "singleton" },
  });

  const isForcedManual = options?.isForcedManual === true;
  const emailDestinatario = cache?.contactEmail || process.env.SALON_CONTACT_EMAIL;
  if (!emailDestinatario || !emailDestinatario.includes("@")) {
    return {
      success: false,
      error: "Nessun indirizzo email configurato per la ricezione del report giornaliero",
    };
  }

  // 2. Verifica giorno lavorativo / festività italiane / aperture straordinarie
  const now = new Date();
  const dateStr = format(now, "yyyy-MM-dd");
  const statoGiorno = await risolviStatoGiornoBarberly(dateStr);

  if (!statoGiorno.isLavorativo && !isForcedManual) {
    return {
      success: true,
      skipped: true,
      giornoNonLavorativo: true,
      stato: statoGiorno.stato,
      message: "Report giornaliero saltato: " + (statoGiorno.motivo || statoGiorno.titolo) + ".",
    };
  }

  // 3. Recupero appuntamenti della giornata odierna
  const inizioGiorno = new Date(now);
  inizioGiorno.setHours(0, 0, 0, 0);
  const fineGiorno = new Date(now);
  fineGiorno.setHours(23, 59, 59, 999);

  const appuntamenti = await prisma.appointment.findMany({
    where: {
      date: {
        gte: inizioGiorno,
        lte: fineGiorno,
      },
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      barber: true,
      client: true,
      service: true,
    },
    orderBy: { startTime: "asc" },
  });

  const nomeSalone = cache?.brandName || "Barberly Grooming Club";
  const dataFormattata = format(now, "EEEE d MMMM yyyy", { locale: it });

  // 4. Creazione Template HTML Barberly
  const rowsHtml = appuntamenti.length === 0
    ? `<tr><td colspan="5" style="padding: 24px; text-align: center; color: #64748b; font-size: 14px;">Nessun appuntamento in programma per oggi. Giornata libera.</td></tr>`
    : appuntamenti.map((appt, i) => {
        const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
        const clienteNome = `${escapeHtml(appt.client.firstName)} ${escapeHtml(appt.client.lastName)}`;
        const tel = escapeHtml(appt.client.phone);
        const servizio = escapeHtml(appt.service.name);
        const barbiere = escapeHtml(appt.barber.name);
        const note = appt.notes ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Note: ${escapeHtml(appt.notes)}</div>` : "";
        const prezzo = appt.pricePaid ? `€ ${appt.pricePaid.toFixed(2)}` : `€ ${appt.service.price.toFixed(2)}`;

        return `
          <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 14px; font-weight: 800; color: #d97706; font-size: 13px; white-space: nowrap;">
              ${appt.startTime} – ${appt.endTime}
            </td>
            <td style="padding: 12px 14px; font-size: 13px; color: #0f172a; font-weight: 600;">
              <div>${clienteNome}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 400;">📞 ${tel}</div>
              ${note}
            </td>
            <td style="padding: 12px 14px; font-size: 13px; color: #334155;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; font-weight: 600; color: #0f172a; font-size: 12px;">
                ${servizio}
              </span>
            </td>
            <td style="padding: 12px 14px; font-size: 13px; color: #475569;">
              💈 ${barbiere}
            </td>
            <td style="padding: 12px 14px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; white-space: nowrap;">
              ${prezzo}
            </td>
          </tr>
        `;
      }).join("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barberly.taaaac.eu";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">💈 ${escapeHtml(nomeSalone)}</h1>
        <p style="color: #d97706; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px;">
          Report Giornaliero Appuntamenti • ${escapeHtml(dataFormattata)}
        </p>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Totale Clienti in Poltrona Oggi</span>
          <div style="font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 2px;">
            ${appuntamenti.length} ${appuntamenti.length === 1 ? "appuntamento" : "appuntamenti"}
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Orario</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Cliente</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Servizio</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Barbiere</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Prezzo</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${appUrl}/admin" style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; border: 1px solid #d97706;">
          Accedi al Gestionale Barberly →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        ${escapeHtml(nomeSalone)} • Notifica automatica generata da Barberly Suite (Taaaac Modular Ecosystem)
      </p>
    </div>
  `;

  // 5. Spedizione email
  const emailResult = await sendNotificationMail({
    to: emailDestinatario,
    subject: `📋 Report Appuntamenti di Oggi — ${nomeSalone} (${appuntamenti.length} in poltrona)`,
    html,
    senderName: nomeSalone,
  });

  return {
    success: emailResult.success,
    emailInviataA: emailDestinatario,
    totaleAppuntamenti: appuntamenti.length,
    data: dataFormattata,
    error: emailResult.error || null,
  };
}
