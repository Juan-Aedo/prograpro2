import type { Activity, ActivityCategory } from "@/lib/types";

const PLACES_API_BASE = process.env.GOOGLE_PLACES_API_BASE ?? "";
const PLACES_API_URL = `${PLACES_API_BASE}/places:searchNearby`;
const PLACE_DETAILS_URL = `${PLACES_API_BASE}/places`;

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.userRatingCount",
  "places.regularOpeningHours",
  "places.photos",
  "places.priceLevel",
  "places.iconMaskBaseUri",
  "places.iconBackgroundColor",
  "places.googleMapsUri",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "types",
  "primaryType",
  "primaryTypeDisplayName",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "photos",
  "priceLevel",
  "iconMaskBaseUri",
  "iconBackgroundColor",
  "googleMapsUri",
].join(",");

const TYPE_TO_CATEGORY: Array<[string, ActivityCategory]> = [
  ["movie_theater", "cine"],
  ["performing_arts_theater", "teatro"],
  ["opera_house", "teatro"],
  ["park", "parques"],
  ["national_park", "parques"],
  ["state_park", "parques"],
  ["garden", "parques"],
  ["botanical_garden", "parques"],
  ["restaurant", "gastronomia"],
  ["cafe", "gastronomia"],
  ["bakery", "gastronomia"],
  ["meal_takeaway", "gastronomia"],
  ["museum", "museos"],
  ["art_gallery", "museos"],
  ["historical_landmark", "museos"],
  ["historical_place", "museos"],
  ["gym", "deportes"],
  ["stadium", "deportes"],
  ["sports_complex", "deportes"],
  ["sports_activity_location", "deportes"],
  ["sports_club", "deportes"],
  ["concert_hall", "musica"],
  ["live_music_venue", "musica"],
  ["philharmonic_hall", "musica"],
  ["karaoke", "musica"],
  ["tourist_attraction", "aire-libre"],
  ["hiking_area", "aire-libre"],
  ["beach", "aire-libre"],
  ["campground", "aire-libre"],
  ["amusement_park", "aire-libre"],
  ["water_park", "aire-libre"],
  ["zoo", "aire-libre"],
  ["aquarium", "aire-libre"],
  ["wildlife_park", "aire-libre"],
  ["bar", "nightlife"],
  ["night_club", "nightlife"],
  ["pub", "nightlife"],
  ["wine_bar", "nightlife"],
  ["art_studio", "talleres"],
  ["cultural_center", "talleres"],
  ["community_center", "talleres"],
];

const CATEGORY_TO_TYPES: Record<ActivityCategory, string[]> = {
  cine: ["movie_theater"],
  teatro: ["performing_arts_theater", "opera_house"],
  parques: ["park", "national_park", "garden", "botanical_garden"],
  gastronomia: ["restaurant", "cafe"],
  museos: ["museum", "art_gallery", "historical_landmark"],
  deportes: ["gym", "stadium", "sports_complex", "sports_activity_location"],
  musica: ["concert_hall", "live_music_venue"],
  "aire-libre": [
    "tourist_attraction",
    "hiking_area",
    "beach",
    "amusement_park",
    "zoo",
    "aquarium",
  ],
  nightlife: ["bar", "night_club", "pub"],
  talleres: ["art_studio", "cultural_center"],
};

const PRICE_BY_LEVEL: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 5000,
  PRICE_LEVEL_MODERATE: 15000,
  PRICE_LEVEL_EXPENSIVE: 30000,
  PRICE_LEVEL_VERY_EXPENSIVE: 60000,
};

const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface PlacePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
}
interface PlacePeriodPoint {
  day?: number;
  hour?: number;
  minute?: number;
}
interface PlacePeriod {
  open?: PlacePeriodPoint;
  close?: PlacePeriodPoint;
}
interface PlaceOpeningHours {
  openNow?: boolean;
  periods?: PlacePeriod[];
}

interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: PlaceOpeningHours;
  photos?: PlacePhoto[];
  priceLevel?: string;
  iconMaskBaseUri?: string;
  iconBackgroundColor?: string;
  googleMapsUri?: string;
}

function tipoACategoria(
  types: string[] = [],
  primary?: string
): ActivityCategory | null {
  const all = [primary, ...types].filter(Boolean) as string[];
  for (const t of all) {
    const match = TYPE_TO_CATEGORY.find(([k]) => k === t);
    if (match) return match[1];
  }
  return null;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function extraerHorario(hours?: PlaceOpeningHours): Activity["horario"] {
  const fallback = {
    apertura: "00:00",
    cierre: "23:59",
    diasDisponibles: [...DAYS_ES],
  };
  if (!hours?.periods || hours.periods.length === 0) return fallback;

  const dias = new Set<string>();
  let primeraApertura: string | null = null;
  let ultimaCierre: string | null = null;

  for (const p of hours.periods) {
    if (p.open?.day !== undefined && DAYS_ES[p.open.day]) {
      dias.add(DAYS_ES[p.open.day]);
    }
    if (p.open) {
      const t = `${pad2(p.open.hour ?? 0)}:${pad2(p.open.minute ?? 0)}`;
      if (!primeraApertura || t < primeraApertura) primeraApertura = t;
    }
    if (p.close) {
      const t = `${pad2(p.close.hour ?? 23)}:${pad2(p.close.minute ?? 59)}`;
      if (!ultimaCierre || t > ultimaCierre) ultimaCierre = t;
    }
  }

  return {
    apertura: primeraApertura ?? fallback.apertura,
    cierre: ultimaCierre ?? fallback.cierre,
    diasDisponibles: dias.size > 0 ? Array.from(dias) : fallback.diasDisponibles,
  };
}

function afluenciaDesdeReseñas(count?: number): "baja" | "media" | "alta" {
  if (!count) return "baja";
  if (count > 1000) return "alta";
  if (count > 200) return "media";
  return "baja";
}

function urlFotoProxy(name: string, w = 800): string {
  return `/api/places/photo?name=${encodeURIComponent(name)}&w=${w}`;
}

function placeAActivity(p: GooglePlace): Activity | null {
  const cat = tipoACategoria(p.types, p.primaryType);
  if (!cat) return null;
  if (!p.location) return null;

  const nombre = p.displayName?.text?.trim();
  if (!nombre) return null;

  const direccion = p.formattedAddress ?? "";
  const imagen = p.photos?.[0]?.name
    ? urlFotoProxy(p.photos[0].name, 800)
    : "/placeholder.svg";

  const tags: string[] = ["google-places"];
  if (p.primaryType) tags.push(p.primaryType);
  for (const t of p.types ?? []) {
    if (!tags.includes(t)) tags.push(t);
  }
  if (p.iconMaskBaseUri) tags.push(`icon:${p.iconMaskBaseUri}`);
  if (p.iconBackgroundColor) tags.push(`color:${p.iconBackgroundColor}`);
  if (p.googleMapsUri) tags.push(`gmaps:${p.googleMapsUri}`);

  const descripcion =
    p.primaryTypeDisplayName?.text?.trim() ||
    direccion ||
    "Recomendado por Google Places";

  return {
    id: `gplace:${p.id}`,
    nombre,
    descripcion,
    categoria: cat,
    imagen,
    ubicacion: {
      direccion,
      lat: p.location.latitude,
      lng: p.location.longitude,
    },
    horario: extraerHorario(p.regularOpeningHours),
    precio: {
      moneda: "CLP",
      valor: PRICE_BY_LEVEL[p.priceLevel ?? ""] ?? 0,
      esPorPersona: true,
    },
    rating: p.rating ?? 0,
    totalResenas: p.userRatingCount ?? 0,
    afluencia: afluenciaDesdeReseñas(p.userRatingCount),
    tags,
    destacada: false,
    enTendencia: false,
  };
}

const cache = new Map<string, { ts: number; data: Activity[] }>();
const TTL_MS = 15 * 60 * 1000;

function cacheKey(
  lat: number,
  lng: number,
  radio: number,
  cats: ActivityCategory[]
): string {
  const lr = lat.toFixed(2);
  const lo = lng.toFixed(2);
  const r = Math.round(radio / 1000);
  const c = [...cats].sort().join(",");
  return `${lr}|${lo}|${r}|${c}`;
}

export async function buscarLugaresGoogle(
  lat: number,
  lng: number,
  radio: number,
  categorias: ActivityCategory[]
): Promise<Activity[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !PLACES_API_BASE) return [];

  const key = cacheKey(lat, lng, radio, categorias);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.data;

  const cats =
    categorias.length > 0
      ? categorias
      : (Object.keys(CATEGORY_TO_TYPES) as ActivityCategory[]);
  const includedTypes = Array.from(
    new Set(cats.flatMap((c) => CATEGORY_TO_TYPES[c] ?? []))
  );
  if (includedTypes.length === 0) return [];

  const radiusMeters = Math.min(radio || 5000, 50000);

  try {
    const res = await fetch(PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: 20,
        languageCode: "es",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn("[places] HTTP", res.status, await res.text().catch(() => ""));
      return [];
    }

    const json = (await res.json()) as { places?: GooglePlace[] };
    const acts = (json.places ?? [])
      .map(placeAActivity)
      .filter((a): a is Activity => a !== null);

    cache.set(key, { ts: Date.now(), data: acts });
    return acts;
  } catch (err) {
    console.warn("[places] error consultando Google Places", err);
    return [];
  }
}

const detailsCache = new Map<string, { ts: number; data: Activity | null }>();

export async function obtenerLugarGoogle(placeId: string): Promise<Activity | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !PLACES_API_BASE || !placeId) return null;

  const cached = detailsCache.get(placeId);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.data;

  try {
    const res = await fetch(`${PLACE_DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=es`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.warn("[places] details HTTP", res.status);
      return null;
    }
    const place = (await res.json()) as GooglePlace;
    const act = placeAActivity(place);
    detailsCache.set(placeId, { ts: Date.now(), data: act });
    return act;
  } catch (err) {
    console.warn("[places] error consultando detalles", err);
    return null;
  }
}
