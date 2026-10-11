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
    const { nome, soprannome, telefono, email, colore, attivo } = body;

    const updated = await prisma.barber.update({
      where: { id },
      data: {
        ...(nome !== undefined && { name: nome.trim() }),
        ...(soprannome !== undefined && { nickname: soprannome?.trim() || null }),
        ...(telefono !== undefined && { phone: telefono?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(colore !== undefined && { color: colore }),
        ...(attivo !== undefined && { isActive: Boolean(attivo) }),
      },
    });

    return NextResponse.json({ success: true, barbiere: updated });
  } catch (error) {
    console.error("PUT /api/barbieri/[id] error:", error);
    return NextResponse.json({ error: "Errore aggiornamento barbiere" }, { status: 500 });
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

    // Disattiva invece di eliminare a cascata
    await prisma.barber.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Barbiere disattivato" });
  } catch (error) {
    console.error("DELETE /api/barbieri/[id] error:", error);
    return NextResponse.json({ error: "Errore disattivazione barbiere" }, { status: 500 });
  }
}
