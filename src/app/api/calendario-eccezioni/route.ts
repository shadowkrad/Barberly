import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { getElencoFestivitaAnno } from "@/lib/festivita-italiane";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabase();
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const year = parseInt(req.nextUrl.searchParams.get("anno") || String(new Date().getFullYear()));

    const [eccezioni, cache] = await Promise.all([
      prisma.eccezioneCalendario.findMany({
        orderBy: { data: "asc" },
      }),
      prisma.tenantLocalCache.findUnique({
        where: { id: "singleton" },
      }),
    ]);

    const festivitaNazionali = getElencoFestivitaAnno(year);

    return NextResponse.json({
      eccezioni,
      festivitaNazionali,
      rispettaFestivitaNazionali: (cache as any)?.rispettaFestivitaNazionali ?? true,
    });
  } catch (error: any) {
    console.error("GET /api/calendario-eccezioni error:", error);
    return NextResponse.json({ error: error?.message || "Errore recupero dati" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabase();
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();

    // Toggle rispettaFestivitaNazionali
    if (typeof body.rispettaFestivitaNazionali === "boolean") {
      await prisma.tenantLocalCache.upsert({
        where: { id: "singleton" },
        update: { rispettaFestivitaNazionali: body.rispettaFestivitaNazionali } as any,
        create: {
          id: "singleton",
          domain: "barberly-demo.taaaac.eu",
          brandName: "Barberly Grooming Club",
          rispettaFestivitaNazionali: body.rispettaFestivitaNazionali,
        } as any,
      });
      return NextResponse.json({ success: true, rispettaFestivitaNazionali: body.rispettaFestivitaNazionali });
    }

    const { data, tipo, titolo, oraInizio, oraFine, pausaInizio, pausaFine, note } = body;

    if (!data || !titolo) {
      return NextResponse.json({ error: "Data e titolo sono obbligatori" }, { status: 400 });
    }

    const eccezione = await prisma.eccezioneCalendario.upsert({
      where: { data: data.slice(0, 10) },
      update: {
        tipo: tipo || "CHIUSURA",
        titolo: titolo.trim(),
        oraInizio: oraInizio || null,
        oraFine: oraFine || null,
        pausaInizio: pausaInizio || null,
        pausaFine: pausaFine || null,
        note: note?.trim() || null,
      },
      create: {
        data: data.slice(0, 10),
        tipo: tipo || "CHIUSURA",
        titolo: titolo.trim(),
        oraInizio: oraInizio || null,
        oraFine: oraFine || null,
        pausaInizio: pausaInizio || null,
        pausaFine: pausaFine || null,
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, eccezione });
  } catch (error: any) {
    console.error("POST /api/calendario-eccezioni error:", error);
    return NextResponse.json({ error: error?.message || "Errore salvataggio" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDatabase();
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    const data = req.nextUrl.searchParams.get("data");

    if (id) {
      await prisma.eccezioneCalendario.delete({ where: { id } });
    } else if (data) {
      await prisma.eccezioneCalendario.delete({ where: { data: data.slice(0, 10) } });
    } else {
      return NextResponse.json({ error: "Specificare id o data" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Errore cancellazione" }, { status: 500 });
  }
}
