/**
 * Email Templates & Sender per Barberly
 * Invia email di conferma e notifica con design Taaaac Barberly
 */

import { sendNotificationMail } from "./taaaac-mailer";

function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function templateConfermaBarberly(dati: {
  nomeCliente: string;
  servizio: string;
  durataMinuti: number;
  prezzo: number;
  barbiere: string;
  data: string;
  orario: string;
  nomeSalone: string;
  indirizzo: string;
  linkGestione?: string;
}) {
  const nome = escapeHtml(dati.nomeCliente);
  const servizio = escapeHtml(dati.servizio);
  const barbiere = escapeHtml(dati.barbiere);
  const data = escapeHtml(dati.data);
  const orario = escapeHtml(dati.orario);
  const nomeSalone = escapeHtml(dati.nomeSalone);
  const indirizzo = escapeHtml(dati.indirizzo);

  return {
    subject: `Prenotazione confermata 💈 ${nomeSalone}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">💈 ${nomeSalone}</h1>
          <p style="color: #d97706; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px;">Prenotazione Confermata</p>
        </div>

        <p style="color: #334155; font-size: 15px;">Ciao <strong>${nome}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">Il tuo appuntamento in poltrona è stato registrato con successo. Ti aspettiamo per un rituale di grooming a regola d'arte.</p>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Servizio</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a; font-size: 14px;">${servizio}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Barbiere / Poltrona</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${barbiere}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Data e Orario</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #d97706; font-size: 15px;">${data} ore ${orario}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Durata & Prezzo</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px;">${dati.durataMinuti} min • € ${dati.prezzo.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 600;">Indirizzo Salone</td>
            <td style="padding: 12px 16px; color: #0f172a; font-size: 13px;">📍 ${indirizzo}</td>
          </tr>
        </table>

        ${dati.linkGestione ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dati.linkGestione}" style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; border: 1px solid #d97706;">
              Visualizza o Gestisci Appuntamento →
            </a>
          </div>
        ` : ""}

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          ${nomeSalone} • Ricevuto tramite Barberly Engine (Taaaac Modular Ecosystem)
        </p>
      </div>
    `,
  };
}

export async function inviaEmailConfermaPrenotazione(dati: {
  destinatarioEmail: string;
  nomeCliente: string;
  servizio: string;
  durataMinuti: number;
  prezzo: number;
  barbiere: string;
  data: string;
  orario: string;
  nomeSalone?: string;
  indirizzo?: string;
  linkGestione?: string;
}) {
  const salone = dati.nomeSalone || "Barberly Grooming Club";
  const ind = dati.indirizzo || "Via Roma, 42 — Milano (MI)";
  const template = templateConfermaBarberly({
    nomeCliente: dati.nomeCliente,
    servizio: dati.servizio,
    durataMinuti: dati.durataMinuti,
    prezzo: dati.prezzo,
    barbiere: dati.barbiere,
    data: dati.data,
    orario: dati.orario,
    nomeSalone: salone,
    indirizzo: ind,
    linkGestione: dati.linkGestione,
  });

  return sendNotificationMail({
    to: dati.destinatarioEmail,
    subject: template.subject,
    html: template.html,
    senderName: salone,
  });
}
