import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secretHeader = req.headers.get("x-taaaac-core-secret");
  const expectedSecret = process.env.TAAAAC_INTERNAL_SECRET || "taaaac-internal-key";

  if (!secretHeader || secretHeader !== expectedSecret) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetDateStr = searchParams.get("date");

  let targetDate = new Date();
  if (targetDateStr) {
    targetDate = new Date(targetDateStr);
  } else {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const rawAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["CONFIRMED", "PENDING", "IN_PROGRESS"] },
      },
      include: {
        client: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
        barber: {
          select: { name: true },
        },
        service: {
          select: { name: true },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const appointments = rawAppointments.map((app) => ({
      id: app.id,
      clienteNome: `${app.client.firstName} ${app.client.lastName}`.trim(),
      clienteTelefono: app.client.phone,
      clienteEmail: app.client.email || null,
      data: format(app.date, "yyyy-MM-dd"),
      orario: app.startTime,
      servizio: app.service.name,
      operatore: app.barber.name,
      note: app.notes || null,
    }));

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (err: any) {
    console.error("[Internal Appointments Barberly] Errore:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
