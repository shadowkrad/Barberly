import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Accesso non autorizzato. PIN richiesto." },
        { status: 401 }
      );
    }

    await ensureDatabase();
    const { searchParams } = new URL(req.url);
    const dataParam = searchParams.get("data");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const stato = searchParams.get("stato");
    const barberId = searchParams.get("barberId");
    const ricerca = searchParams.get("ricerca")?.trim();

    const where: any = {};

    // Filtro Date
    if (startParam && endParam) {
      where.date = {
        gte: new Date(startParam),
        lte: new Date(endParam),
      };
    } else if (dataParam) {
      const target = new Date(dataParam);
      target.setHours(0, 0, 0, 0);
      const nextDay = new Date(target);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = {
        gte: target,
        lt: nextDay,
      };
    }

    // Filtro Barbiere
    if (barberId && barberId !== "ALL") {
      where.barberId = barberId;
    }

    // Filtro Stato
    if (stato && stato !== "ALL" && stato !== "TUTTI") {
      if (stato === "VALIDI") {
        where.status = { in: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] };
      } else {
        where.status = stato;
      }
    }

    // Filtro Ricerca
    if (ricerca) {
      where.OR = [
        { client: { firstName: { contains: ricerca } } },
        { client: { lastName: { contains: ricerca } } },
        { client: { phone: { contains: ricerca } } },
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        barber: true,
        client: true,
        service: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const counts = {
      tutti: await prisma.appointment.count(),
      oggi: await prisma.appointment.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      inAttesa: await prisma.appointment.count({ where: { status: "PENDING" } }),
      confermati: await prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      inPoltrona: await prisma.appointment.count({ where: { status: "IN_PROGRESS" } }),
      completati: await prisma.appointment.count({ where: { status: "COMPLETED" } }),
      annullati: await prisma.appointment.count({ where: { status: "CANCELLED" } }),
    };

    return NextResponse.json({
      appuntamenti: appointments,
      total: appointments.length,
      counts,
    });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json(
      { error: "Impossibile recuperare gli appuntamenti" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    let { barberId, clientId, serviceId, date, startTime, endTime, notes, channel } = body;

    // Se clientId manca ma sono forniti dati cliente al volo
    if (!clientId && body.nuovoCliente) {
      const { nome, cognome, telefono, email, noteCliente } = body.nuovoCliente;
      const createdClient = await prisma.client.create({
        data: {
          firstName: nome.trim(),
          lastName: cognome?.trim() || "Cliente",
          phone: telefono.trim(),
          email: email?.trim() || null,
          notes: noteCliente?.trim() || null,
        },
      });
      clientId = createdClient.id;
    }

    if (!barberId || !clientId || !serviceId) {
      return NextResponse.json(
        { error: "Barbiere, cliente e servizio sono obbligatori" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    const appointmentDate = date ? new Date(date) : new Date();
    appointmentDate.setHours(0, 0, 0, 0);

    const calculatedStartTime = startTime || "10:00";
    let calculatedEndTime = endTime;

    if (!calculatedEndTime && service) {
      const [sh, sm] = calculatedStartTime.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const endMin = startMin + service.durationMinutes;
      const eh = Math.floor(endMin / 60);
      const em = endMin % 60;
      calculatedEndTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
    }

    const appointment = await prisma.appointment.create({
      data: {
        barberId,
        clientId,
        serviceId,
        date: appointmentDate,
        startTime: calculatedStartTime,
        endTime: calculatedEndTime || "10:30",
        status: "CONFIRMED",
        channel: channel || "MANUAL",
        pricePaid: service ? service.price : 0,
        notes: notes?.trim() || null,
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
