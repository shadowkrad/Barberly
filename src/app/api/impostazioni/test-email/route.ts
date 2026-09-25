import { NextRequest, NextResponse } from "next/server";
import { sendNotificationMail } from "@/lib/taaaac-mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const toEmail = body.to || "info@taaaac.eu";

    const result = await sendNotificationMail({
      to: toEmail,
      subject: "Test Notifiche Barberly — Taaaac Cloud Mail Engine",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #fed7aa; border-radius: 16px; background: #ffffff;">
          <h2 style="color: #d97706; margin-top: 0;">✂️ Barberly — Test Email Riuscito!</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">
            Questo messaggio conferma che il canale email di Barberly è attivo e correttamente sincronizzato con il gateway certificato Taaaac.
          </p>
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #92400e;">
            <strong>Destinatario test:</strong> ${toEmail}<br>
            <strong>Data & Ora:</strong> ${new Date().toLocaleString("it-IT")}
          </div>
        </div>
      `,
      senderName: "Barberly Grooming Club",
    });

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: `Email di test inviata con successo a ${toEmail}!`, id: result.id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
