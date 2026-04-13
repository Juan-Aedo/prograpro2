import { NextRequest, NextResponse } from "next/server";
import { getActividades } from "@/lib/data";
import { filtrarActividades, calcularScore } from "@/lib/recommendations";
import { obtenerClima } from "@/lib/weather";
import type { ActivityFilters, UserPreferences } from "@/lib/types";

// ─────────────────────────────────────────────
//  GET /api/activities
//  Query params: categoria, search, soloGratis, soloDisponibles,
//                soloAptoClima, soloTendencia, afluenciaMax,
//                precioMax, sortBy, page, pageSize
// ─────────────────────────────────────────────

// Preferencias por defecto (en producción vendrían del JWT/sesión)
const DEFAULT_PREFS: UserPreferences = {
  categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
  presupuesto: "medio",
  evitar: [],
  prefiereExterior: true,
  maxDistanciaKm: 30,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filtros: ActivityFilters = {
      categoria: (searchParams.get("categoria") as any) ?? undefined,
      search: searchParams.get("search") ?? undefined,
      soloGratis: searchParams.get("soloGratis") === "true",
      soloDisponibles: searchParams.get("soloDisponibles") === "true",
      soloAptoClima: searchParams.get("soloAptoClima") === "true",
      soloTendencia: searchParams.get("soloTendencia") === "true",
      afluenciaMax: (searchParams.get("afluenciaMax") as any) ?? undefined,
      precioMax: searchParams.has("precioMax")
        ? Number(searchParams.get("precioMax"))
        : undefined,
      sortBy: (searchParams.get("sortBy") as any) ?? "rec",
      page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.has("pageSize")
        ? Number(searchParams.get("pageSize"))
        : 20,
    };

    const clima = await obtenerClima();
    const actividades = getActividades();

    const resultado = filtrarActividades(
      actividades,
      filtros,
      clima,
      DEFAULT_PREFS
    );

    // Enriquecer con score de recomendación
    const conScore = resultado.map((a) => ({
      ...a,
      recScore: calcularScore(a, clima, DEFAULT_PREFS).score,
    }));

    return NextResponse.json({
      data: conScore,
      total: actividades.length,
      filtradas: resultado.length,
      clima,
      ok: true,
    });
  } catch (err) {
    console.error("[api/activities] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
