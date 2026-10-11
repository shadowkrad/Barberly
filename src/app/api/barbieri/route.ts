import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDatabase();
    const barbers = await prisma.barber.findMany({
      include: {
        _count: { select: { appointments: true } },
      },
      orderBy: { name: "asc" },
    });

    const formatted = barbers.map((b) => ({
      id: b.id,
      nome: b.name,
      soprannome: b.nickname || "",
      telefono: b.phone || "",
      email: b.email || "",
      colore: b.color || "#d97706",
      attivo: b.isActive,
      avatarUrl: b.avatarUrl || null,
      totaleAppuntamenti: b._count.appointments,
    }));

    return NextResponse.json({ barbieri: formatted });
  } catch (error) {
    console.error("GET /api/barbieri error:", error);
    return NextResponse.json({ error: "Errore recupero staff" }, { status: 500 });
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
    const { nome, soprannome, telefono, email, colore } = body;

    if (!nome?.trim()) {
      return NextResponse.json({ error: "Il nome del barbiere è obbligatorio" }, { status: 400 });
    }

    const created = await prisma.barber.create({
      data: {
        name: nome.trim(),
        nickname: soprannome?.trim() || null,
        phone: telefono?.trim() || null,
        email: email?.trim() || null,
        color: colore || "#d97706",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, barbiere: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/barbieri error:", error);
    return NextResponse.json({ error: "Errore creazione barbiere" }, { status: 500 });
  }
}
