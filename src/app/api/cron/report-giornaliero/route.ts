import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { eseguiInvioReportGiornaliero } from "@/lib/report-giornaliero";

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const xCronSecret = req.headers.get("x-cron-secret");
    const isCronAuthorized =
      cronSecret &&
      (authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret);

    const isAuth = await isAdminAuthenticated();

    if (!isCronAuthorized && !isAuth) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const isForcedManual = req.nextUrl.searchParams.get("test") === "true";
    const result = await eseguiInvioReportGiornaliero({
      isForcedManual: isForcedManual || isAuth,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : result.error ? 400 : 200,
    });
  } catch (error: any) {
    console.error("[CRON /api/cron/report-giornaliero] Errore:", error);
    return NextResponse.json(
      { error: error?.message || "Errore generazione report giornaliero" },
      { status: 500 }
    );
  }
}
