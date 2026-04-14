import type {
  Activity, EnrichedActivity, RecommendationRequest,
  RecommendationResponse, WeatherData, MapInfo,
} from "../types";
import { ACTIVIDADES } from "../data/actividades";
import { obtenerClima, esCompatibleConClima, generarMensajeClima } from "./weather";
import { filtrarPorRadio, enriquecerLote } from "./maps";

// ══════════════════════════════════════════════════════════════
// MOTOR DE SCORING
// ══════════════════════════════════════════════════════════════

function calcularScore(
  actividad: Activity,
  req: RecommendationRequest,
  clima: WeatherData,
  distanciaMetros?: number
): number {
  let score = 0;

  // 1. Coincidencia de categoría (40 pts)
  if (req.preferencias.includes(actividad.categoria)) {
    score += 40;
  }

  // 2. Compatibilidad climática (25 pts)
  const { compatible } = esCompatibleConClima(actividad, clima);
  if (compatible) score += 25;

  // 3. Rating normalizado (15 pts)
  score += ((actividad.rating - 3) / 2) * 15; // rango 3-5 → 0-15

  // 4. Proximidad (10 pts): penaliza por distancia
  if (distanciaMetros !== undefined) {
    const radio = req.radio ?? 10000;
    const proximidad = Math.max(0, 1 - distanciaMetros / radio);
    score += proximidad * 10;
  }

  // 5. En tendencia (5 pts)
  if (actividad.enTendencia) score += 5;

  // 6. Gratuita o bajo presupuesto (5 pts)
  if (actividad.precio.valor === 0) {
    score += 5;
  } else if (req.presupuestoMax && actividad.precio.valor <= req.presupuestoMax * 0.5) {
    score += 3;
  }

  // Bonus: actividad bajo techo cuando llueve
  if (
    actividad.esBajoTecho &&
    (clima.icono === "rain" || clima.icono === "storm" || clima.icono === "snow")
  ) {
    score += 8;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ══════════════════════════════════════════════════════════════
// RAZÓN TEXTUAL DE RECOMENDACIÓN
// ══════════════════════════════════════════════════════════════

function generarRazon(
  actividad: Activity,
  clima: WeatherData,
  distanciaTexto?: string
): string {
  const partes: string[] = [];

  // Categoría
  const etiquetas: Record<string, string> = {
    cine: "Perfecta para una tarde de cine",
    teatro: "Una velada cultural imperdible",
    parques: "Disfruta los espacios verdes",
    gastronomia: "Una experiencia gastronómica top",
    museos: "Cultura e historia a tu alcance",
    deportes: "Actívate hoy",
    musica: "Música en vivo que no te puedes perder",
    "aire-libre": "Naturaleza y aventura te esperan",
    nightlife: "La mejor noche de Santiago",
    talleres: "Aprende algo nuevo hoy",
  };
  partes.push(etiquetas[actividad.categoria] ?? "Gran opción para hoy");

  // Clima
  const msgClima = generarMensajeClima(clima, actividad.esBajoTecho);
  if (msgClima) partes.push(msgClima.toLowerCase());

  // Distancia
  if (distanciaTexto) partes.push(`a solo ${distanciaTexto}`);

  return partes.join(" · ");
}

// ══════════════════════════════════════════════════════════════
// PIPELINE PRINCIPAL
// ══════════════════════════════════════════════════════════════

export async function generarRecomendaciones(
  req: RecommendationRequest
): Promise<RecommendationResponse> {
  const { lat, lng, preferencias, presupuestoMax, radio = 10000, limite = 10 } = req;

  // 1. Obtener clima actual
  const clima = await obtenerClima(lat, lng);

  // 2. Filtrar por radio geográfico
  let candidatos = filtrarPorRadio(ACTIVIDADES, lat, lng, radio);

  // 3. Filtrar por presupuesto
  if (presupuestoMax !== undefined) {
    candidatos = candidatos.filter(
      (a) => a.precio.valor === 0 || a.precio.valor <= presupuestoMax
    );
  }

  // 4. Filtrar por día de la semana
  const diaSemana = new Date().getDay();
  candidatos = candidatos.filter((a) => a.horario.diasSemana.includes(diaSemana));

  // 5. Enriquecer con Maps (distancias reales)
  const mapaDistancias = await enriquecerLote(candidatos, lat, lng);

  // 6. Evaluar compatibilidad climática
  const totalCandidatos = candidatos.length;
  let filtradasPorClima = 0;

  // 7. Calcular scores y construir EnrichedActivity[]
  const enriquecidas: EnrichedActivity[] = candidatos.map((actividad) => {
    const mapInfo: MapInfo | undefined = mapaDistancias.get(actividad.id);
    const { compatible, razon: razonClima } = esCompatibleConClima(actividad, clima);

    if (!compatible) filtradasPorClima++;

    const score = calcularScore(actividad, req, clima, mapInfo?.distanciaMetros);
    const razonRecomendacion = compatible
      ? generarRazon(actividad, clima, mapInfo?.distanciaTexto)
      : razonClima;

    return {
      ...actividad,
      mapInfo,
      scoreRelevancia: score,
      razonRecomendacion,
      compatibleConClima: compatible,
    };
  });

  // 8. Ordenar: primero compatibles, luego por score descendente
  enriquecidas.sort((a, b) => {
    if (a.compatibleConClima && !b.compatibleConClima) return -1;
    if (!a.compatibleConClima && b.compatibleConClima) return 1;
    return b.scoreRelevancia - a.scoreRelevancia;
  });

  // 9. Limitar resultados
  const resultado = enriquecidas.slice(0, limite);

  return {
    actividades: resultado,
    clima,
    totalEncontradas: totalCandidatos,
    filtradasPorClima,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════
// BÚSQUEDA POR TEXTO
// ══════════════════════════════════════════════════════════════

export function buscarActividades(
  query: string,
  categoria?: string
): Activity[] {
  const q = query.toLowerCase().trim();

  return ACTIVIDADES.filter((a) => {
    const matchQuery =
      !q ||
      a.nombre.toLowerCase().includes(q) ||
      a.descripcion.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)) ||
      a.ubicacion.comuna.toLowerCase().includes(q);

    const matchCategoria = !categoria || a.categoria === categoria;

    return matchQuery && matchCategoria;
  });
}

// ══════════════════════════════════════════════════════════════
// OBTENER ACTIVIDAD POR ID
// ══════════════════════════════════════════════════════════════

export function obtenerActividadPorId(id: string): Activity | undefined {
  return ACTIVIDADES.find((a) => a.id === id);
}

// ══════════════════════════════════════════════════════════════
// TENDENCIAS
// ══════════════════════════════════════════════════════════════

export function obtenerEnTendencia(limite = 6): Activity[] {
  return ACTIVIDADES.filter((a) => a.enTendencia)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limite);
}
