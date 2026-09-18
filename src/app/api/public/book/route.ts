import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await ensureDatabase();
    const body = await req.json();
    const {
      serviceId,
      barberId,
      date,
      time,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = body;

    // Validazione base
    if (!serviceId || !time || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Compila tutti i campi obbligatori (servizio, orario, nome e telefono)" },
        { status: 400 }
      );
    }

    // Recupera servizio
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servizio selezionato non valido" },
        { status: 404 }
      );
    }

    // Seleziona barbiere (o assegna il primo attivo se "qualsiasi")
    let targetBarberId = barberId;
    if (!targetBarberId || targetBarberId === "ANY") {
      const firstBarber = await prisma.barber.findFirst({
        where: { isActive: true },
      });
      if (!firstBarber) {
        return NextResponse.json(
          { error: "Nessun barbiere disponibile" },
          { status: 400 }
        );
      }
      targetBarberId = firstBarber.id;
    }

    // Calcolo endTime basato sulla durata del servizio
    const [startH, startM] = time.split(":").map(Number);
    const duration = service.durationMinutes || 30;
    const totalMinutes = startH * 60 + startM + duration;
    const endH = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const endM = (totalMinutes % 60).toString().padStart(2, "0");
    const endTime = `${endH}:${endM}`;

    // Parsing data
    const appointmentDate = date ? new Date(date) : new Date();
    appointmentDate.setHours(0, 0, 0, 0);

    // Gestione Cliente (cerca per telefono o crea nuovo)
    const cleanPhone = customerPhone.trim();
    const nameParts = customerName.trim().split(" ");
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.slice(1).join(" ") || "Ospite";

    let client = await prisma.client.findFirst({
      where: { phone: cleanPhone },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          phone: cleanPhone,
          email: customerEmail?.trim() || null,
          loyaltyPoints: 10, // 10 punti benvenuto
        },
      });
    } else {
      // Aggiungi 10 punti fedeltà
      await prisma.client.update({
        where: { id: client.id },
        data: { loyaltyPoints: { increment: 10 } },
      });
    }

    // Creazione Appuntamento
    const appointment = await prisma.appointment.create({
      data: {
        barberId: targetBarberId,
        clientId: client.id,
        serviceId: service.id,
        date: appointmentDate,
        startTime: time,
        endTime,
        status: "CONFIRMED",
        pricePaid: service.price,
        notes: notes?.trim() || null,
      },
      include: {
        barber: true,
        service: true,
        client: true,
      },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        barberName: appointment.barber.name,
        serviceName: appointment.service.name,
        price: appointment.service.price,
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      },
    });
  } catch (error) {
    console.error("POST /api/public/book error:", error);
    return NextResponse.json(
      { error: "Impossibile registrare la prenotazione. Riprova più tardi." },
      { status: 500 }
    );
  }
}
