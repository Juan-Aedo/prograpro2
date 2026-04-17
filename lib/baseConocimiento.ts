/**
 * Base de conocimiento — actividades outdoor e indoor con rangos de
 * temperatura y condiciones climáticas óptimas.
 *
 * Fuente: Tablas 1-4 del proyecto Panoramas (TICS420)
 *
 * Las 40 actividades de las tablas están agrupadas en las categorías del
 * sistema y se usan para calcular un ranking de recomendación según el
 * clima actual.
 */

import type { ActivityCategory } from "./types";

// ── Estructura de una regla ───────────────────────────────────────────────────

interface ReglaClima {
  /** Categoría del sistema a la que aplica esta regla */
  categoria: ActivityCategory;
  /** Si la actividad se realiza al aire libre (sensible a lluvia/viento) */
  tipo: "outdoor" | "indoor";
  /** Temperatura mínima óptima en °C */
  tempMin: number;
  /** Temperatura máxima óptima en °C */
  tempMax: number;
  /** Iconos de Open-Meteo que potencian la actividad (+2 pts) */
  iconosIdeal: string[];
  /** Iconos que bloquean la actividad (la regla no aporta puntos) */
  iconosBloqueados: string[];
  /** Score base (0–10) cuando la temperatura está en rango y el clima es neutro */
  scoreBase: number;
  /** Si viento > 40 km/h penaliza la actividad (-3 pts) */
  vientoSensible: boolean;
  /** Actividades de las tablas de referencia que fundamentan esta regla */
  actividades: string[];
}

// ── Tabla 1 — Outdoor v1 ──────────────────────────────────────────────────────

const TABLA_1_OUTDOOR: ReglaClima[] = [
  {
    categoria: "aire-libre",
    tipo: "outdoor",
    tempMin: 10, tempMax: 25,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 10,
    vientoSensible: true,
    actividades: ["Senderismo / Trekking", "Escalada en roca", "Fotografía de naturaleza"],
  },
  {
    categoria: "deportes",
    tipo: "outdoor",
    tempMin: 12, tempMax: 22,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 9,
    vientoSensible: true,
    actividades: ["Running / Ciclismo"],
  },
  {
    categoria: "parques",
    tipo: "outdoor",
    tempMin: 15, tempMax: 28,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 9,
    vientoSensible: false,
    actividades: ["Picnic / Camping"],
  },
  {
    categoria: "deportes",
    tipo: "outdoor",
    tempMin: 22, tempMax: 32,
    iconosIdeal: ["clear"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Playa / Natación", "Kayak / Rafting"],
  },
  {
    categoria: "deportes",
    tipo: "outdoor",
    tempMin: -5, tempMax: 5,
    iconosIdeal: ["snow"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Esquí / Snowboard", "Patinaje sobre hielo natural"],
  },
  {
    categoria: "aire-libre",
    tipo: "outdoor",
    tempMin: 5, tempMax: 20,
    iconosIdeal: ["clear"],
    iconosBloqueados: ["rain", "storm", "snow", "fog"],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Observación astronómica"],
  },
  {
    categoria: "aire-libre",
    tipo: "outdoor",
    tempMin: 10, tempMax: 25,
    iconosIdeal: ["cloudy", "partly-cloudy", "clear"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Fotografía de naturaleza"],
  },
];

// ── Tabla 2 — Indoor v1 ───────────────────────────────────────────────────────

const TABLA_2_INDOOR: ReglaClima[] = [
  {
    categoria: "cine",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "snow", "fog"],
    iconosBloqueados: [],
    scoreBase: 9,
    vientoSensible: false,
    actividades: ["Cine / Teatro"],
  },
  {
    categoria: "teatro",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Juegos de mesa / D&D", "Conciertos / Eventos culturales"],
  },
  {
    categoria: "deportes",
    tipo: "indoor",
    tempMin: 18, tempMax: 24,
    iconosIdeal: [],
    iconosBloqueados: [],
    scoreBase: 6,
    vientoSensible: false,
    actividades: ["Gimnasio / Yoga", "Escalada indoor", "Bowling / Arcade"],
  },
  {
    categoria: "museos",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "snow"],
    iconosBloqueados: [],
    scoreBase: 9,
    vientoSensible: false,
    actividades: ["Museos / Exposiciones"],
  },
  {
    categoria: "gastronomia",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "snow"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Cocinar / Repostería"],
  },
  {
    categoria: "musica",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Conciertos / Eventos culturales"],
  },
  {
    categoria: "talleres",
    tipo: "indoor",
    tempMin: 18, tempMax: 24,
    iconosIdeal: ["rain", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Lectura / Estudio"],
  },
  {
    categoria: "nightlife",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm"],
    iconosBloqueados: [],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Bowling / Arcade", "Escape rooms"],
  },
];

// ── Tabla 3 — Outdoor v2 ──────────────────────────────────────────────────────

const TABLA_3_OUTDOOR: ReglaClima[] = [
  {
    categoria: "deportes",
    tipo: "outdoor",
    tempMin: 14, tempMax: 24,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 8,
    vientoSensible: true,
    actividades: ["Paseo en bicicleta eléctrica", "Mountain bike en cerros"],
  },
  {
    categoria: "aire-libre",
    tipo: "outdoor",
    tempMin: 12, tempMax: 22,
    iconosIdeal: ["partly-cloudy", "cloudy", "clear"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Observación de aves", "Fotografía de murales", "Caminata patrimonial guiada"],
  },
  {
    categoria: "parques",
    tipo: "outdoor",
    tempMin: 16, tempMax: 26,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Jardinería / Huertos urbanos", "Patinaje en parques"],
  },
  {
    categoria: "gastronomia",
    tipo: "outdoor",
    tempMin: 18, tempMax: 28,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Caminata por viñedos"],
  },
  {
    categoria: "deportes",
    tipo: "outdoor",
    tempMin: 18, tempMax: 28,
    iconosIdeal: ["clear", "partly-cloudy"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Paseo en bote en lagunas"],
  },
  {
    categoria: "aire-libre",
    tipo: "outdoor",
    tempMin: 10, tempMax: 20,
    iconosIdeal: ["clear"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Paseo fotográfico nocturno"],
  },
  {
    categoria: "museos",
    tipo: "outdoor",
    tempMin: 15, tempMax: 25,
    iconosIdeal: ["partly-cloudy", "cloudy", "clear"],
    iconosBloqueados: ["rain", "storm"],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Caminata patrimonial guiada"],
  },
];

// ── Tabla 4 — Indoor v2 ───────────────────────────────────────────────────────

const TABLA_4_INDOOR: ReglaClima[] = [
  {
    categoria: "talleres",
    tipo: "indoor",
    tempMin: 18, tempMax: 24,
    iconosIdeal: ["rain", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 9,
    vientoSensible: false,
    actividades: [
      "Talleres de cerámica", "Clases de baile",
      "Talleres de escritura creativa", "Talleres de fotografía indoor",
    ],
  },
  {
    categoria: "musica",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Karaoke", "Conciertos acústicos en cafés", "Clases de baile"],
  },
  {
    categoria: "museos",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 9,
    vientoSensible: false,
    actividades: ["Planetario", "Museo Interactivo Mirador"],
  },
  {
    categoria: "gastronomia",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Talleres de cocina internacional", "Conciertos acústicos en cafés"],
  },
  {
    categoria: "nightlife",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "clear"],
    iconosBloqueados: [],
    scoreBase: 7,
    vientoSensible: false,
    actividades: ["Juegos de realidad virtual", "Karaoke"],
  },
  {
    categoria: "cine",
    tipo: "indoor",
    tempMin: -Infinity, tempMax: Infinity,
    iconosIdeal: ["rain", "storm", "cloudy"],
    iconosBloqueados: [],
    scoreBase: 8,
    vientoSensible: false,
    actividades: ["Escape rooms"],
  },
];

// ── Base de conocimiento completa (las 4 tablas) ──────────────────────────────

export const BASE_CONOCIMIENTO: ReglaClima[] = [
  ...TABLA_1_OUTDOOR,
  ...TABLA_2_INDOOR,
  ...TABLA_3_OUTDOOR,
  ...TABLA_4_INDOOR,
];

// ── Función de ranking ────────────────────────────────────────────────────────

/**
 * Evalúa cada categoría del sistema contra las reglas de las 4 tablas y
 * devuelve las categorías ordenadas de mayor a menor afinidad con las
 * condiciones climáticas recibidas.
 *
 * @param temperatura  Temperatura actual en °C
 * @param icono        Código de icono de Open-Meteo ("clear", "rain", ...)
 * @param viento       Velocidad del viento en km/h
 */
export function rankCategoriasPorClima(
  temperatura: number,
  icono: string,
  viento: number
): ActivityCategory[] {
  const TODAS: ActivityCategory[] = [
    "cine", "teatro", "parques", "gastronomia", "museos",
    "deportes", "musica", "aire-libre", "nightlife", "talleres",
  ];

  // Score inicial 1 para que ninguna categoría tenga score 0 en ausencia de reglas
  const scores = new Map<ActivityCategory, number>(TODAS.map((c) => [c, 1]));

  for (const regla of BASE_CONOCIMIENTO) {
    // Condición climática adversa → esta regla no aporta puntos
    if (regla.iconosBloqueados.includes(icono)) continue;

    const tempOK = temperatura >= regla.tempMin && temperatura <= regla.tempMax;
    const iconoBonus = regla.iconosIdeal.includes(icono) ? 2 : 0;
    const vientoPenalti = regla.vientoSensible && viento > 40 ? 3 : 0;

    let puntos: number;
    if (tempOK) {
      puntos = regla.scoreBase + iconoBonus - vientoPenalti;
    } else {
      // Fuera del rango ideal: el score decae 0.5 pt por cada °C de distancia
      const distMin = temperatura < regla.tempMin ? regla.tempMin - temperatura : 0;
      const distMax = temperatura > regla.tempMax ? temperatura - regla.tempMax : 0;
      const dist = Math.max(distMin, distMax);
      puntos = Math.max(0, regla.scoreBase - dist * 0.5 + iconoBonus - vientoPenalti);
    }

    // Tomamos el mejor score entre todas las reglas de la misma categoría
    const prev = scores.get(regla.categoria) ?? 0;
    scores.set(regla.categoria, Math.max(prev, puntos));
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);
}
