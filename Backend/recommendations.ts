import type {
  Activity,
  WeatherData,
  UserPreferences,
  RecommendationScore,
  ActivityFilters,
  NivelAfluencia,
} from "./types";
import { distanciaKm, precioANivel } from "./utils";

// ─────────────────────────────────────────────
//  MOTOR DE RECOMENDACIONES — Panoramas
// ─────────────────────────────────────────────

// Pesos de cada factor (deben sumar 100)
const PESOS = {
  clima: 22,        // Compatibilidad con el clima actual
  afluencia: 14,    // Nivel de ocupación
  disponibilidad: 18, // Cupos disponibles
  preferencias: 20, // Categorías de interés del usuario
  precio: 12,       // Compatibilidad con presupuesto
  rating: 10,       // Calificación de la actividad
  tendencia: 4,     // Si está en tendencia
} as const;

// ── Factores individuales ──────────────────────

function scoreClima(actividad: Activity, clima: WeatherData): number {
  if (actividad.aptoClima.includes(clima.icono)) return 100;
  // Climas "similares" reciben puntaje parcial
  const similares: Record<string, string[]> = {
    "partly-cloudy": ["clear", "cloudy"],
    cloudy: ["partly-cloudy", "fog"],
    fog: ["cloudy", "partly-cloudy"],
  };
  const parecidos = similares[clima.icono] ?? [];
  const hayAlguno = parecidos.some((c) => actividad.aptoClima.includes(c as any));
  return hayAlguno ? 40 : 0;
}

function scoreAfluencia(nivel: NivelAfluencia): number {
  return { baja: 100, media: 60, alta: 20 }[nivel];
}

function scoreDisponibilidad(actividad: Activity): number {
  if (!actividad.cuposDisponibles) return 0;
  if (actividad.cuposRestantes === null) return 100; // Sin límite
  if (actividad.cuposRestantes <= 0) return 0;
  if (actividad.cuposRestantes <= 3) return 70; // Últimos cupos
  if (actividad.cuposRestantes <= 10) return 90;
  return 100;
}

function scorePreferencias(actividad: Activity, prefs: UserPreferences): number {
  if (prefs.evitar.includes(actividad.categoria)) return 0;
  if (prefs.categorias.includes(actividad.categoria)) return 100;
  return 50; // Categoría neutra
}

function scorePrecio(actividad: Activity, prefs: UserPreferences): number {
  const nivel = precioANivel(actividad.precio.valor, actividad.precio.moneda);
  if (actividad.precio.valor === 0) return 100;
  const tabla: Record<string, Record<string, number>> = {
    "sin-limite": { bajo: 100, medio: 100, alto: 100, "sin-limite": 100 },
    alto: { bajo: 100, medio: 100, alto: 100, "sin-limite": 80 },
    medio: { bajo: 100, medio: 100, alto: 60, "sin-limite": 30 },
    bajo: { bajo: 100, medio: 50, alto: 10, "sin-limite": 0 },
  };
  return tabla[prefs.presupuesto]?.[nivel] ?? 50;
}

function scoreRating(rating: number): number {
  // Normaliza 1-5 a 0-100
  return Math.round(((rating - 1) / 4) * 100);
}

function scoreTendencia(enTendencia: boolean): number {
  return enTendencia ? 100 : 50;
}

// ── Score compuesto ────────────────────────────
export function calcularScore(
  actividad: Activity,
  clima: WeatherData,
  prefs: UserPreferences
): RecommendationScore {
  const factores = {
    clima: scoreClima(actividad, clima),
    afluencia: scoreAfluencia(actividad.afluencia),
    disponibilidad: scoreDisponibilidad(actividad),
    preferencias: scorePreferencias(actividad, prefs),
    precio: scorePrecio(actividad, prefs),
    rating: scoreRating(actividad.rating),
    tendencia: scoreTendencia(actividad.enTendencia),
  };

  const score = Math.round(
    (factores.clima * PESOS.clima +
      factores.afluencia * PESOS.afluencia +
      factores.disponibilidad * PESOS.disponibilidad +
      factores.preferencias * PESOS.preferencias +
      factores.precio * PESOS.precio +
      factores.rating * PESOS.rating +
      factores.tendencia * PESOS.tendencia) /
      100
  );

  return {
    actividadId: actividad.id,
    score: Math.max(0, Math.min(100, score)),
    factores,
  };
}

// ── Filtrar y ordenar actividades ──────────────
export function filtrarActividades(
  actividades: Activity[],
  filtros: ActivityFilters,
  clima: WeatherData,
  prefs: UserPreferences,
  userLat?: number,
  userLng?: number
): Activity[] {
  let lista = [...actividades];

  // Búsqueda por texto
  if (filtros.search?.trim()) {
    const q = filtros.search.toLowerCase();
    lista = lista.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q) ||
        a.categoria.includes(q) ||
        a.ubicacion.direccion.toLowerCase().includes(q) ||
        a.etiquetas?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Filtrar por categoría
  if (filtros.categoria) {
    lista = lista.filter((a) => a.categoria === filtros.categoria);
  }

  // Solo gratis
  if (filtros.soloGratis) {
    lista = lista.filter((a) => a.precio.valor === 0);
  }

  // Solo con cupos disponibles
  if (filtros.soloDisponibles) {
    lista = lista.filter((a) => a.cuposDisponibles);
  }

  // Solo aptos para el clima actual
  if (filtros.soloAptoClima) {
    lista = lista.filter((a) => a.aptoClima.includes(clima.icono));
  }

  // Solo en tendencia
  if (filtros.soloTendencia) {
    lista = lista.filter((a) => a.enTendencia);
  }

  // Afluencia máxima
  if (filtros.afluenciaMax) {
    const orden: NivelAfluencia[] = ["baja", "media", "alta"];
    const maxIdx = orden.indexOf(filtros.afluenciaMax);
    lista = lista.filter((a) => orden.indexOf(a.afluencia) <= maxIdx);
  }

  // Precio máximo
  if (filtros.precioMax !== undefined) {
    lista = lista.filter((a) => a.precio.valor <= filtros.precioMax!);
  }

  // Distancia máxima
  if (userLat !== undefined && userLng !== undefined && prefs.maxDistanciaKm) {
    lista = lista.filter(
      (a) =>
        distanciaKm(userLat, userLng, a.ubicacion.lat, a.ubicacion.lng) <=
        prefs.maxDistanciaKm!
    );
  }

  // Ordenar
  const scoreMap = new Map(
    lista.map((a) => [a.id, calcularScore(a, clima, prefs).score])
  );

  lista.sort((a, b) => {
    switch (filtros.sortBy ?? "rec") {
      case "rec":
        return (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0);
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.precio.valor - b.precio.valor;
      case "price-desc":
        return b.precio.valor - a.precio.valor;
      case "crowd": {
        const ord = ["baja", "media", "alta"];
        return ord.indexOf(a.afluencia) - ord.indexOf(b.afluencia);
      }
      default:
        return 0;
    }
  });

  // Paginación
  const page = filtros.page ?? 1;
  const size = filtros.pageSize ?? 50;
  return lista.slice((page - 1) * size, page * size);
}

// ── Top recomendaciones del día ────────────────
export function topRecomendaciones(
  actividades: Activity[],
  clima: WeatherData,
  prefs: UserPreferences,
  n = 6
): Array<Activity & { recScore: number; factores: RecommendationScore["factores"] }> {
  return actividades
    .map((a) => {
      const { score, factores } = calcularScore(a, clima, prefs);
      return { ...a, recScore: score, factores };
    })
    .filter((a) => a.cuposDisponibles && a.recScore >= 55)
    .sort((a, b) => b.recScore - a.recScore)
    .slice(0, n);
}

// ── Explicación legible del score ──────────────
export function explicarRecomendacion(
  score: RecommendationScore,
  clima: WeatherData
): string[] {
  const razones: string[] = [];
  const { factores } = score;

  if (factores.clima >= 100) {
    razones.push(`✅ Ideal para el clima de hoy (${clima.descripcion})`);
  } else if (factores.clima === 0) {
    razones.push(`⛔ No recomendado con el clima actual`);
  }

  if (factores.disponibilidad === 0) {
    razones.push("⛔ Sin cupos disponibles");
  } else if (factores.disponibilidad <= 70) {
    razones.push("⚠️ Últimos cupos disponibles");
  }

  if (factores.afluencia === 100) razones.push("🟢 Poca afluencia esperada");
  else if (factores.afluencia === 20) razones.push("🔴 Alta afluencia esperada");

  if (factores.preferencias === 100) razones.push("⭐ Coincide con tus intereses");
  else if (factores.preferencias === 0) razones.push("✋ Categoría que prefieres evitar");

  if (factores.precio === 100) razones.push("💰 Dentro de tu presupuesto");
  else if (factores.precio <= 30) razones.push("💸 Por encima de tu presupuesto habitual");

  return razones;
}
