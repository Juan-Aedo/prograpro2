import { NextRequest, NextResponse } from "next/server";
import { getActividadById } from "@/lib/data";
import { calcularScore, explicarRecomendacion } from "@/lib/recommendations";
import { obtenerClima } from "@/lib/weather";
import { contarReservasPorActividad } from "@/lib/bookings";
import type { UserPreferences } from "@/lib/types";

const DEFAULT_PREFS: UserPreferences = {
  categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
  presupuesto: "medio",
  evitar: [],
  prefiereExterior: true,
};

// ─────────────────────────────────────────────
//  GET /api/activities/[id]
// ─────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actividad = getActividadById(params.id);

    if (!actividad) {
      return NextResponse.json(
        { ok: false, message: "Actividad no encontrada" },
        { status: 404 }
      );
    }

    const clima = await obtenerClima();
    const scoreData = calcularScore(actividad, clima, DEFAULT_PREFS);
    const razones = explicarRecomendacion(scoreData, clima);
    const totalReservas = contarReservasPorActividad(actividad.id);

    return NextResponse.json({
      ok: true,
      data: {
        ...actividad,
        recScore: scoreData.score,
        factores: scoreData.factores,
        razonesRecomendacion: razones,
        totalReservasHoy: totalReservas,
        clima,
      },
    });
  } catch (err) {
    console.error("[api/activities/[id]] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
