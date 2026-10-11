import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

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
    const { nome, descrizione, durata, prezzo, categoria, colore, attivo } = body;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(nome !== undefined && { name: nome.trim() }),
        ...(descrizione !== undefined && { description: descrizione?.trim() || null }),
        ...(durata !== undefined && { durationMinutes: Number(durata) }),
        ...(prezzo !== undefined && { price: Number(prezzo) }),
        ...(categoria !== undefined && { category: categoria.trim() }),
        ...(colore !== undefined && { color: colore }),
        ...(attivo !== undefined && { isActive: Boolean(attivo) }),
      },
    });

    return NextResponse.json({ success: true, trattamento: updated });
  } catch (error) {
    console.error("PUT /api/listino/[id] error:", error);
    return NextResponse.json({ error: "Errore aggiornamento servizio" }, { status: 500 });
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

    // Soft delete: disattiva il servizio per preservare lo storico appuntamenti
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Servizio disattivato" });
  } catch (error) {
    console.error("DELETE /api/listino/[id] error:", error);
    return NextResponse.json({ error: "Errore eliminazione servizio" }, { status: 500 });
  }
}
