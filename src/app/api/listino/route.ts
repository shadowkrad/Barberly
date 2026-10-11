import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDatabase();
    const services = await prisma.service.findMany({
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });

    const formatted = services.map((s) => ({
      id: s.id,
      nome: s.name,
      descrizione: s.description || "",
      durata: s.durationMinutes,
      prezzo: s.price,
      categoria: s.category,
      colore: s.color || "#d97706",
      attivo: s.isActive,
    }));

    return NextResponse.json({ trattamenti: formatted });
  } catch (error) {
    console.error("GET /api/listino error:", error);
    return NextResponse.json({ error: "Errore recupero listino" }, { status: 500 });
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
    const { nome, descrizione, durata, prezzo, categoria, colore } = body;

    if (!nome?.trim() || !prezzo) {
      return NextResponse.json({ error: "Nome e prezzo sono obbligatori" }, { status: 400 });
    }

    const created = await prisma.service.create({
      data: {
        name: nome.trim(),
        description: descrizione?.trim() || null,
        durationMinutes: Number(durata) || 30,
        price: Number(prezzo),
        category: categoria?.trim() || "HAIR",
        color: colore || "#d97706",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, trattamento: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/listino error:", error);
    return NextResponse.json({ error: "Errore creazione servizio" }, { status: 500 });
  }
}
