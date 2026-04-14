// ============================================================
// TIPOS COMPARTIDOS — Panoramas App Backend
// ============================================================

export type Categoria =
  | "cine"
  | "teatro"
  | "parques"
  | "gastronomia"
  | "museos"
  | "deportes"
  | "musica"
  | "aire-libre"
  | "nightlife"
  | "talleres";

export type NivelAfluencia = "baja" | "media" | "alta";

export type CondicionClima =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog";

// -----------------------------------------------
// Actividad / Panorama
// -----------------------------------------------
export interface Precio {
  valor: number;
  moneda: "CLP" | "USD";
  esPorPersona: boolean;
}

export interface Horario {
  apertura: string;
  cierre: string;
  diasSemana: number[]; // 0=dom … 6=sab
}

export interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
  comuna: string;
  ciudad: string;
}

export interface Activity {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  imagen: string;
  ubicacion: Ubicacion;
  precio: Precio;
  horario: Horario;
  rating: number;
  totalResenas: number;
  afluencia: NivelAfluencia;
  enTendencia: boolean;
  tags: string[];
  // Condiciones climáticas compatibles (si está vacío = siempre)
  climasCompatibles: CondicionClima[];
  // Condiciones que lo excluyen explícitamente
  climasIncompatibles: CondicionClima[];
  // Si la actividad es bajo techo
  esBajoTecho: boolean;
}

// -----------------------------------------------
// Clima
// -----------------------------------------------
export interface WeatherData {
  temperatura: number;
  sensacionTermica: number;
  humedad: number;
  viento: number;
  descripcion: string;
  icono: CondicionClima;
  ciudad: string;
  lat: number;
  lng: number;
  precipitacion: number; // mm/h
  esNoche: boolean;
}

// -----------------------------------------------
// Google Maps enrichment
// -----------------------------------------------
export interface MapInfo {
  actividadId: string;
  distanciaTexto: string;  // "2.4 km"
  distanciaMetros: number;
  duracionTexto: string;   // "8 min"
  duracionSegundos: number;
  urlMaps: string;
  urlEmbed: string;
  placeId?: string;
  reseñaGoogle?: number;
}

// -----------------------------------------------
// Request / Response de la API
// -----------------------------------------------
export interface RecommendationRequest {
  lat: number;
  lng: number;
  preferencias: Categoria[];
  presupuestoMax?: number;     // CLP
  radio?: number;              // metros, default 10000
  limite?: number;             // max resultados, default 10
  incluirGratuitas?: boolean;
}

export interface EnrichedActivity extends Activity {
  mapInfo?: MapInfo;
  scoreRelevancia: number;     // 0–100
  razonRecomendacion: string;  // texto para mostrar al usuario
  compatibleConClima: boolean;
}

export interface RecommendationResponse {
  actividades: EnrichedActivity[];
  clima: WeatherData;
  totalEncontradas: number;
  filtradasPorClima: number;
  timestamp: string;
}

// -----------------------------------------------
// Reservas
// -----------------------------------------------
export interface Booking {
  id: string;
  actividadId: string;
  actividadNombre: string;
  fecha: string;
  personas: number;
  totalPagado: number;
  moneda: "CLP" | "USD";
  estado: "confirmada" | "pendiente" | "cancelada";
  creadaEn: string;
}
