import { NextRequest, NextResponse } from "next/server";
import { enriquecerConMaps, generarUrlEmbed } from "@/lib/maps";
import { obtenerActividadPorId } from "@/lib/recommendations";

// ── GET /api/maps?actividadId=xxx&lat=-33.4&lng=-70.6 ──
// Devuelve info de Maps para una actividad específica:
// distancia, duración, URL embed, URL navegación
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const actividadId = searchParams.get("actividadId");
    const lat = parseFloat(searchParams.get("lat") ?? "NaN");
    const lng = parseFloat(searchParams.get("lng") ?? "NaN");

    if (!actividadId) {
      return NextResponse.json({ error: "actividadId requerido" }, { status: 400 });
    }
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "lat/lng requeridos y válidos" }, { status: 400 });
    }

    const actividad = obtenerActividadPorId(actividadId);
    if (!actividad) {
      return NextResponse.json(
        { error: `Actividad '${actividadId}' no encontrada` },
        { status: 404 }
      );
    }

    const mapInfo = await enriquecerConMaps(actividad, lat, lng);

    return NextResponse.json(mapInfo, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[/api/maps GET]", error);
    return NextResponse.json({ error: "Error al obtener datos de mapa" }, { status: 500 });
  }
}

// ── POST /api/maps/embed ── Genera URL de embed ──
// Body: { lat, lng, nombre? }
export async function POST(req: NextRequest) {
  try {
    let body: { lat?: number; lng?: number; nombre?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const { lat, lng, nombre } = body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat y lng requeridos" }, { status: 400 });
    }

    const urlEmbed = generarUrlEmbed(lat, lng, nombre);
    return NextResponse.json({ urlEmbed });
  } catch (error) {
    console.error("[/api/maps POST]", error);
    return NextResponse.json({ error: "Error generando URL de mapa" }, { status: 500 });
  }
}
