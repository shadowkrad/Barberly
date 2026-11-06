import { NextRequest, NextResponse } from "next/server";
import { cercaClientePerTelefono } from "@/lib/clienti-telefono";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { normalizePhone, getPhoneSearchConditions, parseDataNascita } from "@/lib/phone";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    await ensureDatabase();
    const { searchParams } = new URL(req.url);
    const ricerca = searchParams.get("ricerca")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ricerca) {
      where.OR = [
        { firstName: { contains: ricerca } },
        { lastName: { contains: ricerca } },
        { phone: { contains: ricerca } },
        { email: { contains: ricerca } },
      ];
    }

    const [clienti, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { appointments: true },
          },
          appointments: {
            take: 1,
            orderBy: { date: "desc" },
            select: { date: true },
          },
        },
        orderBy: { lastName: "asc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    const formatted = clienti.map((c) => ({
      id: c.id,
      nome: c.firstName,
      cognome: c.lastName,
      telefono: c.phone,
      email: c.email || "",
      note: c.notes || "",
      puntiFedelta: c.loyaltyPoints,
      dataNascita: c.birthDate ? c.birthDate.toISOString() : null,
      consensoPrivacy: c.privacyConsent,
      dataUltimaVisita: c.appointments[0]?.date ? c.appointments[0].date.toISOString() : null,
      _count: { appuntamenti: c._count.appointments },
    }));

    return NextResponse.json({ clienti: formatted, total, page, limit });
  } catch (error) {
    console.error("GET /api/clienti error:", error);
    return NextResponse.json({ error: "Errore nel caricamento clienti" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    await ensureDatabase();
    const body = await req.json();
    const { nome, cognome, telefono, email, note, consensoPrivacy, consensoMarketing, dataNascita } = body;

    if (!nome?.trim() || !cognome?.trim() || !telefono?.trim()) {
      return NextResponse.json(
        { error: "Nome, cognome e numero di telefono sono obbligatori" },
        { status: 400 }
      );
    }

    // Un numero, un cliente: se il telefono esiste gia' si rimanda alla scheda esistente
    const telNorm = normalizePhone(telefono);
    const esistente = await cercaClientePerTelefono(telefono);
    if (esistente) {
      return NextResponse.json(
        {
          error: `Questo numero è già registrato per ${esistente.firstName} ${esistente.lastName}`.trim(),
          clienteEsistente: { id: esistente.id, nome: esistente.firstName, cognome: esistente.lastName, telefono: esistente.phone },
        },
        { status: 409 }
      );
    }

    const nascita = parseDataNascita(dataNascita);
    if (dataNascita && !nascita) {
      return NextResponse.json({ error: "Data di nascita non valida" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        firstName: nome.trim(),
        lastName: cognome.trim(),
        phone: telNorm || telefono.trim(),
        birthDate: nascita,
        marketingConsent: consensoMarketing !== undefined ? Boolean(consensoMarketing) : false,
        email: email?.trim() || null,
        notes: note?.trim() || null,
        privacyConsent: consensoPrivacy !== undefined ? Boolean(consensoPrivacy) : true,
      },
    });

    return NextResponse.json(
      {
        id: client.id,
        nome: client.firstName,
        cognome: client.lastName,
        telefono: client.phone,
        email: client.email || "",
        note: client.notes || "",
        puntiFedelta: client.loyaltyPoints,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/clienti error:", error);
    return NextResponse.json({ error: "Errore nella creazione cliente" }, { status: 500 });
  }
}
