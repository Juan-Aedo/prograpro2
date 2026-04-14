import { NextRequest, NextResponse } from "next/server";
import {
  buscarActividades,
  obtenerActividadPorId,
  obtenerEnTendencia,
} from "@/lib/recommendations";
import { enriquecerConMaps } from "@/lib/maps";
import { obtenerClima, esCompatibleConClima } from "@/lib/weather";

// ── GET /api/activities ─────────────────────────────────────
// Query params:
//   q          → búsqueda por texto
//   categoria  → filtro por categoría
//   tendencia  → "true" para solo tendencias
//   lat / lng  → para enriquecer con Maps y clima
//   id         → obtener actividad específica
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const q = searchParams.get("q") ?? "";
    const categoria = searchParams.get("categoria") ?? undefined;
    const soloTendencia = searchParams.get("tendencia") === "true";
    const lat = parseFloat(searchParams.get("lat") ?? "NaN");
    const lng = parseFloat(searchParams.get("lng") ?? "NaN");

    // ── Caso: actividad individual por ID ──
    if (id) {
      const actividad = obtenerActividadPorId(id);
      if (!actividad) {
        return NextResponse.json(
          { error: `Actividad '${id}' no encontrada` },
          { status: 404 }
        );
      }

      // Enriquecer con Maps si hay coordenadas del usuario
      let mapInfo;
      let climaInfo;
      let compatibleConClima = true;

      if (!isNaN(lat) && !isNaN(lng)) {
        try {
          mapInfo = await enriquecerConMaps(actividad, lat, lng);
          climaInfo = await obtenerClima(lat, lng);
          compatibleConClima = esCompatibleConClima(actividad, climaInfo).compatible;
        } catch {
          // Non-fatal: continúa sin enriquecimiento
        }
      }

      return NextResponse.json({
        actividad,
        mapInfo,
        clima: climaInfo,
        compatibleConClima,
      });
    }

    // ── Caso: listado / búsqueda ──
    let actividades = soloTendencia
      ? obtenerEnTendencia(12)
      : buscarActividades(q, categoria);

    // Enriquecer con clima si hay coordenadas
    let climaInfo;
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        climaInfo = await obtenerClima(lat, lng);
        // Añadir flag de compatibilidad climática a cada actividad
        actividades = actividades.map((a) => ({
          ...a,
          _compatibleConClima: esCompatibleConClima(a, climaInfo!).compatible,
        })) as typeof actividades;
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({
      actividades,
      clima: climaInfo ?? null,
      total: actividades.length,
    });
  } catch (error) {
    console.error("[/api/activities] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 }
    );
  }
}
