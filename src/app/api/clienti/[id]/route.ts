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

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            barber: true,
            service: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente non trovato" }, { status: 404 });
    }

    return NextResponse.json({
      id: client.id,
      nome: client.firstName,
      cognome: client.lastName,
      telefono: client.phone,
      email: client.email || "",
      note: client.notes || "",
      puntiFedelta: client.loyaltyPoints,
      consensoPrivacy: client.privacyConsent,
      createdAt: client.createdAt.toISOString(),
      appuntamenti: client.appointments.map((a) => ({
        id: a.id,
        data: a.date.toISOString(),
        orario: `${a.startTime} - ${a.endTime}`,
        stato: a.status,
        servizio: a.service?.name || "Servizio",
        barbiere: a.barber?.name || "Barbiere",
        prezzo: a.pricePaid ?? a.service?.price ?? 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/clienti/[id] error:", error);
    return NextResponse.json({ error: "Errore caricamento scheda cliente" }, { status: 500 });
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
    const { nome, cognome, telefono, email, note, puntiFedelta, consensoPrivacy } = body;

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(nome !== undefined && { firstName: nome.trim() }),
        ...(cognome !== undefined && { lastName: cognome.trim() }),
        ...(telefono !== undefined && { phone: telefono.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(note !== undefined && { notes: note?.trim() || null }),
        ...(puntiFedelta !== undefined && { loyaltyPoints: Number(puntiFedelta) || 0 }),
        ...(consensoPrivacy !== undefined && { privacyConsent: Boolean(consensoPrivacy) }),
      },
    });

    return NextResponse.json({ success: true, cliente: updated });
  } catch (error) {
    console.error("PUT /api/clienti/[id] error:", error);
    return NextResponse.json({ error: "Errore aggiornamento cliente" }, { status: 500 });
  }
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

    // GDPR Anonimizzazione: preserva lo storico appuntamenti e fatturato senza dati personali
    await prisma.client.update({
      where: { id },
      data: {
        firstName: "Cliente",
        lastName: "Anonimizzato",
        phone: "+39 000 0000000",
        email: null,
        notes: null,
        loyaltyPoints: 0,
        privacyConsent: false,
      },
    });

    return NextResponse.json({ success: true, message: "Cliente anonimizzato conformemente al GDPR" });
  } catch (error) {
    console.error("DELETE /api/clienti/[id] error:", error);
    return NextResponse.json({ error: "Errore eliminazione/anonimizzazione cliente" }, { status: 500 });
  }
}
