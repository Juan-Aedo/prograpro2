// Tipos principales de Panoramas

export type ActivityCategory =
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

export interface Activity {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: ActivityCategory;
  imagen: string;
  ubicacion: {
    direccion: string;
    lat: number;
    lng: number;
  };
  horario: {
    apertura: string;
    cierre: string;
    diasDisponibles: string[];
  };
  precio: {
    moneda: string;
    valor: number;
    esPorPersona: boolean;
  };
  rating: number;
  totalResenas: number;
  afluencia: "baja" | "media" | "alta";
  tags: string[];
  destacada: boolean;
  enTendencia: boolean;
}

export interface WeatherData {
  temperatura: number;
  sensacionTermica: number;
  descripcion: string;
  icono: string;
  humedad: number;
  viento: number;
  ciudad: string;
}

export interface Booking {
  id: string;
  actividadId: string;
  actividad: Activity;
  fecha: string;
  hora: string;
  personas: number;
  estado: "confirmada" | "pendiente" | "cancelada" | "completada";
  total: number;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar: string;
  preferencias: ActivityCategory[];
  edad?: number;
  sexo?: "masculino" | "femenino" | "no_binario" | "prefiero_no_decir";
  ciudad?: string;
  lat?: number;
  lng?: number;
}

export interface FilterState {
  busqueda: string;
  categorias: ActivityCategory[];
  precioMax: number;
  soloDestacadas: boolean;
  ordenarPor: "relevancia" | "precio" | "rating" | "distancia";
}

export interface RecommendationRequest {
  lat: number;
  lng: number;
  preferencias: ActivityCategory[];
  presupuestoMax?: number;
  radio?: number;
  limite?: number;
}

export interface EnrichedActivity extends Activity {
  scoreRelevancia: number;
  razonRecomendacion: string;
  compatibleConClima: boolean;
  distanciaTexto?: string;
  distanciaMetros?: number;
  urlMaps?: string;
}

export interface RecommendationResponse {
  actividades: EnrichedActivity[];
  clima: WeatherData;
  totalEncontradas: number;
  filtradasPorClima: number;
  timestamp: string;
}
