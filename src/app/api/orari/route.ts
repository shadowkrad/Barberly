import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDatabase();
    const rows = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    // Se mancano record, assicurati che i 7 giorni (0..6) siano presenti
    const giorni = Array.from({ length: 7 }, (_, i) => {
      const trovato = rows.find((r) => r.dayOfWeek === i);
      if (trovato) {
        return {
          id: trovato.id,
          giorno: trovato.dayOfWeek,
          oraInizio: trovato.startTime,
          oraFine: trovato.endTime,
          pausaInizio: trovato.breakStart,
          pausaFine: trovato.breakEnd,
          attivo: trovato.isOpen,
        };
      }
      return {
        id: `wh_${i}`,
        giorno: i,
        oraInizio: "09:00",
        oraFine: "19:30",
        pausaInizio: "13:00",
        pausaFine: "14:00",
        attivo: i >= 1 && i <= 6, // Lun-Sab aperto, Dom chiuso
      };
    });

    return NextResponse.json(giorni);
  } catch (error) {
    console.error("GET /api/orari error:", error);
    return NextResponse.json({ error: "Errore recupero orari" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    await ensureDatabase();
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Formato payload non valido" }, { status: 400 });
    }

    for (const item of body) {
      const giorno = Number(item.giorno);
      if (isNaN(giorno) || giorno < 0 || giorno > 6) continue;

      await prisma.workingHours.upsert({
        where: { dayOfWeek: giorno },
        update: {
          startTime: item.oraInizio || "09:00",
          endTime: item.oraFine || "19:30",
          breakStart: item.pausaInizio || null,
          breakEnd: item.pausaFine || null,
          isOpen: item.attivo !== undefined ? Boolean(item.attivo) : true,
        },
        create: {
          id: `wh_${giorno}`,
          dayOfWeek: giorno,
          startTime: item.oraInizio || "09:00",
          endTime: item.oraFine || "19:30",
          breakStart: item.pausaInizio || null,
          breakEnd: item.pausaFine || null,
          isOpen: item.attivo !== undefined ? Boolean(item.attivo) : true,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Orari aggiornati con successo" });
  } catch (error) {
    console.error("PUT /api/orari error:", error);
    return NextResponse.json({ error: "Errore salvataggio orari" }, { status: 500 });
  }
}
