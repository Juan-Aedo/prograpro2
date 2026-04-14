import type { WeatherData, CondicionClima } from "../types";

// ── Coordenadas por defecto: Santiago de Chile ──
const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

// ── Mapeo de WMO weather codes → CondicionClima ──
function wmoACondicion(wmoCode: number, esNoche: boolean): CondicionClima {
  if (wmoCode === 0) return "clear";
  if (wmoCode <= 2) return "partly-cloudy";
  if (wmoCode <= 3) return "cloudy";
  if (wmoCode <= 49) return "fog";
  if (wmoCode <= 57) return "rain";  // llovizna
  if (wmoCode <= 67) return "rain";
  if (wmoCode <= 77) return "snow";
  if (wmoCode <= 82) return "rain";
  if (wmoCode <= 99) return "storm";
  return "cloudy";
}

function wmoADescripcion(wmoCode: number): string {
  const map: Record<number, string> = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna densa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia intensa",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada intensa",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos violentos",
    95: "Tormenta eléctrica",
    99: "Tormenta con granizo",
  };
  // Buscar la clave más cercana
  const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (wmoCode >= keys[i]) return map[keys[i]];
  }
  return "Condición desconocida";
}

// ── Determina si es de noche según hora local ──
function esHoraNocturna(): boolean {
  const hour = new Date().getHours();
  return hour < 7 || hour >= 21;
}

// ── Fetch principal a Open-Meteo ──
export async function obtenerClima(
  lat: number = DEFAULT_LAT,
  lng: number = DEFAULT_LNG
): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
    `wind_speed_10m,precipitation,weather_code` +
    `&hourly=temperature_2m` +
    `&timezone=auto` +
    `&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const current = data.current;

  const esNoche = esHoraNocturna();
  const wmoCode: number = current.weather_code ?? 0;
  const icono = wmoACondicion(wmoCode, esNoche);
  const descripcion = wmoADescripcion(wmoCode);

  // Resolución inversa de nombre de ciudad mediante timezone
  const ciudad = obtenerNombreCiudad(lat, lng);

  return {
    temperatura: Math.round(current.temperature_2m),
    sensacionTermica: Math.round(current.apparent_temperature),
    humedad: Math.round(current.relative_humidity_2m),
    viento: Math.round(current.wind_speed_10m),
    precipitacion: current.precipitation ?? 0,
    descripcion,
    icono,
    ciudad,
    lat,
    lng,
    esNoche,
  };
}

// Mapeo simple lat/lng → nombre de ciudad (expandible)
function obtenerNombreCiudad(lat: number, lng: number): string {
  const ciudades = [
    { nombre: "Santiago", lat: -33.4489, lng: -70.6693, radio: 0.5 },
    { nombre: "Valparaíso", lat: -33.0472, lng: -71.6127, radio: 0.3 },
    { nombre: "Concepción", lat: -36.8201, lng: -73.0444, radio: 0.3 },
    { nombre: "La Serena", lat: -29.9027, lng: -71.2519, radio: 0.3 },
  ];
  for (const c of ciudades) {
    const distLat = Math.abs(lat - c.lat);
    const distLng = Math.abs(lng - c.lng);
    if (distLat < c.radio && distLng < c.radio) return c.nombre;
  }
  return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}

// ── Lógica de filtrado: ¿es una actividad compatible con el clima? ──
export function esCompatibleConClima(
  actividad: { climasCompatibles: CondicionClima[]; climasIncompatibles: CondicionClima[]; esBajoTecho: boolean },
  clima: WeatherData
): { compatible: boolean; razon: string } {
  const { icono, temperatura, precipitacion } = clima;

  // Excluir explícitamente
  if (actividad.climasIncompatibles.includes(icono)) {
    return { compatible: false, razon: climaRazonExclusion(icono) };
  }

  // Actividad de aire libre con lluvia → incompatible
  if (!actividad.esBajoTecho && (icono === "rain" || icono === "storm")) {
    return { compatible: false, razon: "Actividad al aire libre no recomendada con lluvia" };
  }

  // Actividad de aire libre con nieve → incompatible
  if (!actividad.esBajoTecho && icono === "snow") {
    return { compatible: false, razon: "No recomendado con nevada" };
  }

  // Temperatura extrema al aire libre
  if (!actividad.esBajoTecho && temperatura < 4) {
    return { compatible: false, razon: "Temperatura demasiado baja para actividad exterior" };
  }

  // Si tiene lista blanca de climas, verificar
  if (actividad.climasCompatibles.length > 0 && !actividad.climasCompatibles.includes(icono)) {
    // Si está lloviendo y la actividad solo es compatible con buen tiempo
    if (icono === "rain" || icono === "storm" || icono === "snow") {
      return { compatible: false, razon: climaRazonExclusion(icono) };
    }
  }

  return { compatible: true, razon: "" };
}

function climaRazonExclusion(icono: CondicionClima): string {
  const razones: Record<CondicionClima, string> = {
    "clear": "",
    "partly-cloudy": "",
    "cloudy": "",
    "rain": "No recomendado durante lluvias",
    "storm": "Suspendido por tormenta eléctrica",
    "snow": "No recomendado con nevada",
    "fog": "Visibilidad reducida por niebla",
  };
  return razones[icono] ?? "";
}

// ── Genera mensaje contextual de recomendación según clima ──
export function generarMensajeClima(clima: WeatherData, esBajoTecho: boolean): string {
  const { icono, temperatura } = clima;

  if (esBajoTecho) {
    if (icono === "rain" || icono === "storm") return "Perfecta para un día lluvioso";
    if (icono === "snow") return "Ideal para refugiarse del frío";
    if (temperatura > 28) return "Un buen plan bajo techo con calor";
    return "Disfruta sin preocuparte del clima";
  }

  if (icono === "clear" && temperatura >= 18 && temperatura <= 26) return "Condiciones perfectas hoy";
  if (icono === "partly-cloudy") return "Buen día para salir";
  if (temperatura > 28) return "Refresca con esta actividad al aire libre";
  if (temperatura < 10) return "Abrígate bien para disfrutarla";
  return "Gran opción para hoy";
}
