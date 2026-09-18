import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Accesso non autorizzato. PIN richiesto." },
        { status: 401 }
      );
    }

    await ensureDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
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
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json(
      { error: "Impossibile recuperare gli appuntamenti" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Accesso non autorizzato. PIN richiesto." },
        { status: 401 }
      );
    }

    await ensureDatabase();
    const body = await req.json();
    const { barberId, clientId, serviceId, startTime, endTime, notes } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    const appointment = await prisma.appointment.create({
      data: {
        barberId,
        clientId,
        serviceId,
        date: today,
        startTime,
        endTime,
        status: "CONFIRMED",
        pricePaid: service ? service.price : 0,
        notes,
      },
      include: {
        barber: true,
        client: true,
        service: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'appuntamento" },
      { status: 500 }
    );
  }
}
