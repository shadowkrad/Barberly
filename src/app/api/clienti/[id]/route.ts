import { NextRequest, NextResponse } from "next/server";
import { cercaClientePerTelefono } from "@/lib/clienti-telefono";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { normalizePhone, getPhoneSearchConditions, parseDataNascita } from "@/lib/phone";
import { assicuraTokenTessera } from "@/lib/fidelity";

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
          take: 30,
        },
        pointsMovements: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente non trovato" }, { status: 404 });
    }

    const tokenTessera = await assicuraTokenTessera(id);
    // Buoni intestati al cliente ancora utilizzabili
    const ora = new Date();
    const [buoni, cache] = await Promise.all([
      prisma.giftCard.findMany({
        where: { clienteId: id, stato: "ATTIVA", OR: [{ dataScadenza: null }, { dataScadenza: { gte: ora } }] },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, codice: true, motivo: true, tipoValore: true, importoIniziale: true, saldoResiduo: true,
          percentuale: true, descrizioneServizio: true, dataScadenza: true,
        },
      }),
      prisma.tenantLocalCache.findUnique({
        where: { id: "singleton" },
        select: { brandName: true },
      }),
    ]);

    return NextResponse.json({
      id: client.id,
      nome: client.firstName,
      cognome: client.lastName,
      telefono: client.phone,
      email: client.email || "",
      note: client.notes || "",
      puntiFedelta: client.loyaltyPoints,
      consensoPrivacy: client.privacyConsent,
      consensoMarketing: client.marketingConsent,
      dataNascita: client.birthDate ? client.birthDate.toISOString() : null,
      tokenTessera,
      nomeAttivita: cache?.brandName || "Barberly",
      buoni,
      movimentiPunti: client.pointsMovements,
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
    const { nome, cognome, telefono, email, note, consensoPrivacy, consensoMarketing, dataNascita } = body;

    // Telefono: salvato normalizzato e mai uguale a quello di un altro cliente
    let telefonoDaSalvare: string | undefined;
    if (telefono !== undefined) {
      telefonoDaSalvare = normalizePhone(telefono) || String(telefono).trim();
      const altro = await cercaClientePerTelefono(telefono, id);
      if (altro) {
        return NextResponse.json(
          {
            error: `Questo numero è già registrato per ${altro.firstName} ${altro.lastName}`.trim(),
            clienteEsistente: { id: altro.id, nome: altro.firstName, cognome: altro.lastName, telefono: altro.phone },
          },
          { status: 409 }
        );
      }
    }

    let nascita: Date | null | undefined;
    if (dataNascita !== undefined) {
      if (dataNascita) {
        nascita = parseDataNascita(dataNascita);
        if (!nascita) return NextResponse.json({ error: "Data di nascita non valida" }, { status: 400 });
      } else {
        nascita = null;
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(nome !== undefined && { firstName: nome.trim() }),
        ...(cognome !== undefined && { lastName: cognome.trim() }),
        ...(telefonoDaSalvare !== undefined && { phone: telefonoDaSalvare }),
        ...(nascita !== undefined && { birthDate: nascita }),
        ...(consensoMarketing !== undefined && { marketingConsent: Boolean(consensoMarketing) }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(note !== undefined && { notes: note?.trim() || null }),
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
        phone: "CANCELLATO",
        email: null,
        notes: null,
        loyaltyPoints: 0,
        privacyConsent: false,
        marketingConsent: false,
        birthDate: null,
        loyaltyToken: null,
      },
    });

    return NextResponse.json({ success: true, message: "Cliente anonimizzato conformemente al GDPR" });
  } catch (error) {
    console.error("DELETE /api/clienti/[id] error:", error);
    return NextResponse.json({ error: "Errore eliminazione/anonimizzazione cliente" }, { status: 500 });
  }
}
