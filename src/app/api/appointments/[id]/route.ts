import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
