import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Accesso non autorizzato. PIN richiesto." },
        { status: 401 }
      );
    }

    await ensureDatabase();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        barber: true,
        client: true,
        service: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/appointments/[id] error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento dell'appuntamento" },
      { status: 500 }
    );
  }
}
