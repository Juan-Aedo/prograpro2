import { NextRequest, NextResponse } from "next/server";
import { getActividades } from "@/lib/data";
import { topRecomendaciones } from "@/lib/recommendations";
import { obtenerClima } from "@/lib/weather";
import type { UserPreferences } from "@/lib/types";

// ─────────────────────────────────────────────
//  GET /api/recommendations
//  Query params: n (número de resultados, default 6)
//                userId (para preferencias personalizadas, opcional)
// ─────────────────────────────────────────────

const DEFAULT_PREFS: UserPreferences = {
  categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
  presupuesto: "medio",
  evitar: [],
  prefiereExterior: true,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const n = Math.min(20, Math.max(1, Number(searchParams.get("n") ?? 6)));

    // En producción: obtener preferencias del userId desde la DB
    // const userId = searchParams.get("userId");
    // const prefs = userId ? await obtenerPrefsUsuario(userId) : DEFAULT_PREFS;

    const [clima, actividades] = await Promise.all([
      obtenerClima(),
      Promise.resolve(getActividades()),
    ]);

    const recomendaciones = topRecomendaciones(
      actividades,
      clima,
      DEFAULT_PREFS,
      n
    );

    return NextResponse.json({
      ok: true,
      data: recomendaciones,
      clima,
      meta: {
        total: recomendaciones.length,
        generadoEn: new Date().toISOString(),
        factoresConsiderados: [
          "clima",
          "afluencia",
          "disponibilidad",
          "preferencias_usuario",
          "precio",
          "rating",
          "tendencia",
        ],
      },
    });
  } catch (err) {
    console.error("[api/recommendations] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al generar recomendaciones" },
      { status: 500 }
    );
  }
}
