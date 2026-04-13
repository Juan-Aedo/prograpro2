import { NextRequest, NextResponse } from "next/server";
import { obtenerClima } from "@/lib/weather";

// ─────────────────────────────────────────────
//  GET /api/weather
//  Query params: lat, lng, ciudad
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lat = searchParams.has("lat") ? Number(searchParams.get("lat")) : undefined;
    const lng = searchParams.has("lng") ? Number(searchParams.get("lng")) : undefined;
    const ciudad = searchParams.get("ciudad") ?? "Santiago";

    const clima = await obtenerClima(lat, lng, ciudad);

    return NextResponse.json(
      { ok: true, data: clima },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("[api/weather] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al obtener datos del clima" },
      { status: 500 }
    );
  }
}
