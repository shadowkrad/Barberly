import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    await ensureDatabase();
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: true,
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appuntamento non trovato" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);
    return NextResponse.json({ error: "Errore recupero appuntamento" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    await ensureDatabase();
    const { id } = await params;
    const body = await req.json();
    const { status, date, startTime, endTime, barberId, serviceId, notes, pricePaid } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (date !== undefined) dataToUpdate.date = new Date(date);
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;
    if (barberId !== undefined) dataToUpdate.barberId = barberId;
    if (serviceId !== undefined) dataToUpdate.serviceId = serviceId;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (pricePaid !== undefined) dataToUpdate.pricePaid = Number(pricePaid);

    const updated = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
      include: {
        barber: true,
        client: true,
        service: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/appointments/[id] error:", error);
    return NextResponse.json({ error: "Errore aggiornamento appuntamento" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    await ensureDatabase();
    const { id } = await params;

    // Imposta lo stato a CANCELLED
    const cancelled = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true, appointment: cancelled });
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);
    return NextResponse.json({ error: "Errore cancellazione appuntamento" }, { status: 500 });
  }
}
