// ─────────────────────────────────────────────
//  TYPES — Panoramas App
// ─────────────────────────────────────────────

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

export type CondicionClimatica =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog";

// ── Actividad ──────────────────────────────────
export interface Precio {
  valor: number;
  moneda: "CLP" | "USD" | "EUR";
  esPorPersona: boolean;
}

export interface Horario {
  apertura: string; // "HH:MM"
  cierre: string;
}

export interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
  comuna?: string;
  ciudad?: string;
}

export interface Activity {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  imagen: string;
  imagenes?: string[];
  ubicacion: Ubicacion;
  precio: Precio;
  horario: Horario;
  rating: number;
  totalResenas: number;
  afluencia: NivelAfluencia;
  enTendencia: boolean;
  cuposDisponibles: boolean;
  cuposRestantes: number | null; // null = sin límite
  aptoClima: CondicionClimatica[];
  etiquetas?: string[];
  duracionMinutos?: number;
  telefono?: string;
  sitioWeb?: string;
  createdAt?: string;
}

// ── Clima ──────────────────────────────────────
export interface WeatherData {
  ciudad: string;
  temperatura: number;
  sensacionTermica: number;
  humedad: number;
  viento: number;
  descripcion: string;
  icono: CondicionClimatica;
  timestamp: string;
}

// ── Usuario ────────────────────────────────────
export type NivelPresupuesto = "bajo" | "medio" | "alto" | "sin-limite";

export interface UserPreferences {
  categorias: Categoria[];
  presupuesto: NivelPresupuesto;
  evitar: Categoria[];
  prefiereExterior: boolean;
  maxDistanciaKm?: number;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar: string;
  preferences: UserPreferences;
}

// ── Reserva ────────────────────────────────────
export type EstadoReserva = "pendiente" | "confirmada" | "cancelada";

export interface Booking {
  id: string;
  actividadId: string;
  userId: string;
  fecha: string; // ISO date
  personas: number;
  total: number;
  moneda: string;
  estado: EstadoReserva;
  createdAt: string;
}

// ── Recomendación ──────────────────────────────
export interface RecommendationScore {
  actividadId: string;
  score: number; // 0-100
  factores: {
    clima: number;
    afluencia: number;
    disponibilidad: number;
    preferencias: number;
    precio: number;
    rating: number;
    tendencia: number;
  };
}

// ── API responses ──────────────────────────────
export interface ApiResponse<T> {
  data: T;
  ok: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  ok: boolean;
}

// ── Filtros ────────────────────────────────────
export interface ActivityFilters {
  categoria?: Categoria;
  search?: string;
  soloGratis?: boolean;
  soloDisponibles?: boolean;
  soloAptoClima?: boolean;
  soloTendencia?: boolean;
  afluenciaMax?: NivelAfluencia;
  precioMax?: number;
  sortBy?: "rec" | "rating" | "price-asc" | "price-desc" | "crowd";
  page?: number;
  pageSize?: number;
}
