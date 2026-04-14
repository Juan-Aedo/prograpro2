import { NextRequest, NextResponse } from "next/server";
import { obtenerClima } from "@/lib/weather";

// GET /api/weather?lat=-33.4489&lng=-70.6693
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "-33.4489");
    const lng = parseFloat(searchParams.get("lng") ?? "-70.6693");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Parámetros lat/lng inválidos" },
        { status: 400 }
      );
    }

    const clima = await obtenerClima(lat, lng);

    return NextResponse.json(clima, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[/api/weather] Error:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el clima. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
