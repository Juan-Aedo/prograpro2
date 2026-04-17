/**
 * Capitales regionales de Chile con actividades predefinidas de fallback.
 *
 * Cuando el usuario está en una ciudad sin actividades en la base de datos,
 * se muestran estas 3 actividades representativas de la capital regional
 * más cercana, hasta que se disponga de datos reales.
 */

import { calcularDistanciaKm } from "./maps";
import type { Activity, ActivityCategory } from "./types";

// ── Tipo de capital regional ──────────────────────────────────────────────────

export interface CapitalRegional {
  nombre: string;
  region: string;
  lat: number;
  lng: number;
}

// ── Las 16 capitales regionales de Chile ─────────────────────────────────────

export const CAPITALES_REGIONALES: CapitalRegional[] = [
  { nombre: "Arica",        region: "Arica y Parinacota", lat: -18.4783, lng: -70.3126 },
  { nombre: "Iquique",      region: "Tarapacá",           lat: -20.2133, lng: -70.1503 },
  { nombre: "Antofagasta",  region: "Antofagasta",        lat: -23.6509, lng: -70.3975 },
  { nombre: "Copiapó",      region: "Atacama",            lat: -27.3668, lng: -70.3323 },
  { nombre: "La Serena",    region: "Coquimbo",           lat: -29.9027, lng: -71.2519 },
  { nombre: "Valparaíso",   region: "Valparaíso",         lat: -33.0472, lng: -71.6127 },
  { nombre: "Santiago",     region: "Metropolitana",      lat: -33.4489, lng: -70.6693 },
  { nombre: "Rancagua",     region: "O'Higgins",          lat: -34.1703, lng: -70.7398 },
  { nombre: "Talca",        region: "Maule",              lat: -35.4264, lng: -71.6554 },
  { nombre: "Chillán",      region: "Ñuble",              lat: -36.6063, lng: -72.1033 },
  { nombre: "Concepción",   region: "Biobío",             lat: -36.8201, lng: -73.0444 },
  { nombre: "Temuco",       region: "La Araucanía",       lat: -38.7359, lng: -72.5904 },
  { nombre: "Valdivia",     region: "Los Ríos",           lat: -39.8142, lng: -73.2459 },
  { nombre: "Puerto Montt", region: "Los Lagos",          lat: -41.4693, lng: -72.9424 },
  { nombre: "Coyhaique",    region: "Aysén",              lat: -45.5712, lng: -72.0662 },
  { nombre: "Punta Arenas", region: "Magallanes",         lat: -53.1638, lng: -70.9171 },
];

// ── Helper para construir actividades con valores por defecto ─────────────────

function act(
  id: string,
  nombre: string,
  descripcion: string,
  categoria: ActivityCategory,
  imagen: string,
  lat: number,
  lng: number,
  direccion: string,
  tags: string[],
  precio = 0,
): Activity {
  return {
    id,
    nombre,
    descripcion,
    categoria,
    imagen,
    ubicacion: { direccion, lat, lng },
    horario: {
      apertura: "09:00",
      cierre: "18:00",
      diasDisponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    },
    precio: { moneda: "CLP", valor: precio, esPorPersona: false },
    rating: 4.5,
    totalResenas: 0,
    afluencia: "media",
    tags,
    destacada: false,
    enTendencia: false,
  };
}

// ── 3 actividades por capital regional ───────────────────────────────────────

export const ACTIVIDADES_FALLBACK: Record<string, Activity[]> = {
  "Arica": [
    act("fb-arica-1", "Playa El Laucho", "La playa más popular de Arica, con aguas tranquilas y arena oscura ideal para descansar y practicar deportes acuáticos.", "deportes", "/panoramas/playa-el-laucho.jpg", -18.4947, -70.3108, "Av. Costanera, Arica", ["playa", "deportes acuáticos", "arica"]),
    act("fb-arica-2", "Morro de Arica", "Emblemático cerro con vistas panorámicas de la ciudad y el océano Pacífico. Ideal para senderismo y fotografía.", "aire-libre", "/panoramas/morro-de-arica.jpg", -18.4792, -70.3198, "Morro de Arica, Arica", ["senderismo", "fotografía", "historia"]),
    act("fb-arica-3", "Mercado Colón", "Mercado tradicional con gastronomía local, artesanía y la mejor ceviche de la región. Experiencia cultural imperdible.", "gastronomia", "/panoramas/mercado-colon.jpg", -18.4746, -70.3119, "21 de Mayo 349, Arica", ["gastronomía", "mercado", "artesanía"]),
  ],
  "Iquique": [
    act("fb-iquique-1", "Playa Cavancha", "Playa urbana de Iquique, famosa por sus olas perfectas para surf y su tranquilo borde costero.", "deportes", "/panoramas/playa-cavancha.jpg", -20.2286, -70.1492, "Playa Cavancha, Iquique", ["surf", "playa", "deportes"]),
    act("fb-iquique-2", "Centro Histórico de Iquique", "Recorre la arquitectura georgiana del siglo XIX en el centro histórico, declarado Zona Típica por el Consejo de Monumentos.", "museos", "/panoramas/centro-historico-iquique.jpg", -20.2133, -70.1503, "Plaza Prat, Iquique", ["historia", "arquitectura", "cultura"]),
    act("fb-iquique-3", "Cerro Dragón", "Las dunas más altas del mundo en medio de una ciudad. Perfecto para sandboard, fotografía y avistamiento de fauna.", "aire-libre", "/panoramas/cerro-dragon.jpg", -20.2280, -70.1356, "Cerro Dragón, Iquique", ["dunas", "sandboard", "aventura"]),
  ],
  "Antofagasta": [
    act("fb-antofagasta-1", "La Portada", "Monumento natural declarado Santuario de la Naturaleza. Un arco rocoso de 43 metros sobre el mar, ideal para fotografía y avistamiento de aves.", "aire-libre", "/panoramas/la-portada.jpg", -23.5257, -70.5611, "Ruta 1 Norte km 16, Antofagasta", ["fotografía", "naturaleza", "avistamiento"]),
    act("fb-antofagasta-2", "Playa Municipal de Antofagasta", "La playa más accesible de la ciudad, con servicios completos y aguas aptas para natación.", "deportes", "/panoramas/playa-municipal-antofagasta.jpg", -23.6480, -70.4051, "Av. Balmaceda, Antofagasta", ["playa", "natación", "familia"]),
    act("fb-antofagasta-3", "Museo Regional de Antofagasta", "Colección de arte y cultura atacameña en el edificio histórico de la Aduana. Cultura e historia minera del norte.", "museos", "/panoramas/museo-regional-antofagasta.jpg", -23.6500, -70.3970, "Bolívar 188, Antofagasta", ["museo", "historia", "cultura"]),
  ],
  "Copiapó": [
    act("fb-copiapo-1", "Parque Nacional Nevado Tres Cruces", "Reserva de la biosfera con lagunas altiplánicas, flamencos y paisajes volcánicos únicos del desierto de Atacama.", "aire-libre", "/panoramas/parque-nacional-nevado-3-cruces.jpg", -27.1000, -68.8000, "Ruta 31, 135 km al este de Copiapó", ["naturaleza", "flamingos", "alta montaña"]),
    act("fb-copiapo-2", "Museo Regional de Atacama", "Arqueología, paleontología y minerales del desierto más árido del mundo. La historia del oro y la plata en la región.", "museos", "/panoramas/museo-regional-atacama.jpg", -27.3688, -70.3320, "Atacama 98, Copiapó", ["museo", "arqueología", "minerales"]),
    act("fb-copiapo-3", "Mercado Central de Copiapó", "El mejor lugar para probar la gastronomía local: papas cocidas, humitas y postres típicos del norte chico.", "gastronomia", "/panoramas/mercado-copiapo.jpg", -27.3669, -70.3324, "Mercado Central, Copiapó", ["gastronomía", "mercado", "local"]),
  ],
  "La Serena": [
    act("fb-laserena-1", "Playa La Serena", "Una de las playas más largas de Chile (7 km), ideal para descanso, deportes acuáticos y atardeceres espectaculares.", "deportes", "/panoramas/playa-la-serena.jpg", -29.9112, -71.2581, "Av. del Mar, La Serena", ["playa", "deportes", "familia"]),
    act("fb-laserena-2", "Valle del Elqui", "Valle místico conocido por sus viñedos de pisco, cielos despejados para astronomía y pueblos coloniales.", "aire-libre", "/panoramas/valle-del-elqui.jpg", -30.0000, -70.7000, "Valle del Elqui, Región de Coquimbo", ["astronomía", "vinos", "naturaleza"]),
    act("fb-laserena-3", "Centro Histórico de La Serena", "Pasea por las 30 iglesias coloniales de la ciudad y la Plaza de Armas. Arquitectura única en Chile.", "museos", "/panoramas/centro-historico-de-la-serena.jpeg", -29.9027, -71.2519, "Plaza de Armas, La Serena", ["historia", "arquitectura", "iglesias"]),
  ],
  "Valparaíso": [
    act("fb-valparaiso-1", "Cerro Alegre y Cerro Concepción", "El barrio más colorido de Chile: murales, cafeterías, galerías de arte y vistas panorámicas del Pacífico.", "aire-libre", "/panoramas/cerro-alegre.jpeg", -33.0493, -71.6135, "Cerro Alegre, Valparaíso", ["arte", "murales", "gastronomía"]),
    act("fb-valparaiso-2", "Puerto de Valparaíso", "El puerto más importante de Chile con un paseo marítimo histórico, museos y el famoso Reloj de los Cinco Minutos.", "museos", "/panoramas/puerto-de-valparaiso.jpeg", -33.0374, -71.6267, "Muelle Barón, Valparaíso", ["puerto", "historia", "cultura"]),
    act("fb-valparaiso-3", "Paseo 21 de Mayo", "El mirador más famoso de Valparaíso desde el Cerro Artillería. Vistas 360° de la bahía y el anfiteatro natural de la ciudad.", "parques", "/panoramas/paseo-21-mayo.jpg", -33.0380, -71.6277, "Paseo 21 de Mayo, Cerro Artillería", ["mirador", "fotografía", "vistas"]),
  ],
  "Santiago": [
    act("fb-santiago-1", "Parque Metropolitano", "El pulmón verde de Santiago con el zoológico, piscinas públicas, senderos y las mejores vistas de la ciudad desde el Cerro San Cristóbal.", "parques", "/panoramas/parque-metropolitano.jpg", -33.4247, -70.6337, "Av. Pío Nono 450, Providencia", ["parque", "zoológico", "senderismo"]),
    act("fb-santiago-2", "Barrio Italia", "El barrio más trendy de Santiago con restaurantes de autor, tiendas de diseño, cafeterías especiales y arte urbano.", "gastronomia", "/panoramas/barrio-italia.jpg", -33.4512, -70.6233, "Av. Italia, Providencia, Santiago", ["gastronomía", "diseño", "café"]),
    act("fb-santiago-3", "Museo Nacional de Bellas Artes", "El museo de arte más importante de Chile con colecciones de pintura, escultura y arte contemporáneo en un palacio neoclásico.", "museos", "/panoramas/museo-nacional-de-bellas-artes.jpeg", -33.4368, -70.6486, "Parque Forestal s/n, Santiago", ["arte", "cultura", "museo"]),
  ],
  "Rancagua": [
    act("fb-rancagua-1", "Mina El Teniente", "La mina de cobre subterránea más grande del mundo. Tour guiado por sus 3.000 km de túneles y la historia minera de Chile.", "museos", "/panoramas/mina-el-teniente.jpg", -34.1500, -70.5833, "Sewell, Machalí (45 km al este)", ["minería", "historia", "tour"]),
    act("fb-rancagua-2", "Termas de Cauquenes", "Aguas termales minerales entre los ríos Cachapoal y Claro, en un entorno boscoso. Relajación natural a 50 km de Rancagua.", "aire-libre", "/panoramas/termas-de-cauquenes.jpg", -34.2500, -70.5667, "Camino a Cauquenes km 28, Rancagua", ["termas", "naturaleza", "relax"]),
    act("fb-rancagua-3", "Reserva Nacional Río Los Cipreses", "Parque nacional con cipreses de la cordillera, cóndores y el río Cachapoal. Senderismo y camping en la precordillera.", "parques", "/panoramas/reserva-nacional-rio-los-cipreses.jpg", -34.2333, -70.4667, "Acceso por Machalí, Región de O'Higgins", ["senderismo", "cóndores", "camping"]),
  ],
  "Talca": [
    act("fb-talca-1", "Ruta del Vino del Maule", "Recorrido por las bodegas de la denominación de origen más grande de Chile. Degustaciones, paisajes y la historia del vino maulino.", "gastronomia", "/panoramas/ruta-del-vino-maule.jpg", -35.4264, -71.6554, "Valle del Maule, Talca", ["vino", "gastronomía", "turismo rural"]),
    act("fb-talca-2", "Parque Río Claro", "Área verde urbana a orillas del río Claro, ideal para picnics, ciclismo y actividades familiares.", "parques", "/panoramas/parque-rio-claro.jpg", -35.4139, -71.6672, "Av. del Río, Talca", ["parque", "ciclismo", "familia"]),
    act("fb-talca-3", "Museo O'Higginiano y de Bellas Artes", "Casa natal del Libertador Bernardo O'Higgins, con colecciones históricas y artísticas de la Independencia de Chile.", "museos", "/panoramas/museo-ohiggiano.jpeg", -35.4277, -71.6569, "1 Norte 875, Talca", ["historia", "museo", "O'Higgins"]),
  ],
  "Chillán": [
    act("fb-chillan-1", "Nevados de Chillán", "Centro de ski y termas de clase mundial en la cordillera andina. Pistas para todos los niveles y aguas termales naturales.", "deportes", "/panoramas/nevados-de-chillan.jpeg", -36.9000, -71.4333, "Camino Termas de Chillán, 80 km al este", ["ski", "termas", "snowboard"]),
    act("fb-chillan-2", "Mercado de Chillán", "El mercado más famoso de la Región de Ñuble, con los mejores longanizas, quesos y artesanía en greda de Chile.", "gastronomia", "/panoramas/mercado-chillan.jpg", -36.6041, -72.1027, "Mercado Central, Chillán", ["longaniza", "mercado", "gastronomía"]),
    act("fb-chillan-3", "Murales de la Escuela México", "Los murales de Diego Rivera y David Alfaro Siqueiros en la Escuela México de Chillán, obra icónica del muralismo latinoamericano.", "museos", "/panoramas/murales-escuela-mexico.jpg", -36.6050, -72.1015, "Escuela México, Chillán", ["murales", "arte", "Rivera"]),
  ],
  "Concepción": [
    act("fb-concepcion-1", "Parque Ecuador", "El parque más importante de Concepción con jardines, el Jardín Botánico de la UdeC y senderos para caminar y hacer picnic.", "parques", "/panoramas/parque-ecuador.jpg", -36.8271, -73.0440, "Av. Víctor Lamas, Concepción", ["parque", "picnic", "jardín botánico"]),
    act("fb-concepcion-2", "Laguna del Laja", "Parque nacional con el volcán Antuco, la laguna Laja y bosques de araucarias. Ideal para trekking y fotografía volcánica.", "aire-libre", "/panoramas/laguna-del-laja.jpeg", -37.4000, -71.3333, "Laguna del Laja, Los Ángeles (130 km)", ["volcán", "trekking", "araucarias"]),
    act("fb-concepcion-3", "Barrio Universitario y Galerías", "El barrio cultural de Concepción con galerías de arte, teatros, cafeterías universitarias y el famoso paseo de la Plaza de la Independencia.", "museos", "/panoramas/barrio-universitario-concepcion.jpg", -36.8201, -73.0444, "Barrio Universitario, Concepción", ["cultura", "arte", "universidad"]),
  ],
  "Temuco": [
    act("fb-temuco-1", "Parque Nacional Conguillío", "El parque más espectacular de la Araucanía: lagunas, araucarias milenarias, el volcán Llaima activo y senderos de alta montaña.", "aire-libre", "/panoramas/parque-nacional-conguillo.jpeg", -38.6667, -71.6333, "Parque Nacional Conguillío (80 km)", ["araucarias", "volcán", "trekking"]),
    act("fb-temuco-2", "Feria Municipal Mapuche", "La feria más importante de la cultura mapuche: hierbas medicinales, platería, textiles y gastronomía ancestral.", "gastronomia", "/panoramas/feria-mapuche.jpeg", -38.7362, -72.5936, "Av. Barros Arana s/n, Temuco", ["mapuche", "artesanía", "gastronomía"]),
    act("fb-temuco-3", "Museo Regional de La Araucanía", "La colección más completa de arte y cultura mapuche del país, incluyendo instrumentos musicales, platería ceremonial y textiles.", "museos", "/panoramas/museo-regional-de-la-araucania.jpg", -38.7326, -72.5904, "Av. Alemania 084, Temuco", ["mapuche", "museo", "cultura"]),
  ],
  "Valdivia": [
    act("fb-valdivia-1", "Río Calle Calle — Kayak y Botes", "Navega el emblemático río de Valdivia entre sus islas, fuertes históricos y la fauna del estuario. Experiencia única en el sur.", "deportes", "/panoramas/rio-calle-calle.jpg", -39.8142, -73.2459, "Costanera Arturo Prat, Valdivia", ["kayak", "río", "naturaleza"]),
    act("fb-valdivia-2", "Mercado Fluvial de Valdivia", "El mercado a orillas del río donde los pescadores venden el mejor marisco y centolla del sur de Chile, con leones marinos como vecinos.", "gastronomia", "/panoramas/mercado-fluvial.jpg", -39.8134, -73.2460, "Costanera Arturo Prat, Valdivia", ["mercado", "marisco", "leones marinos"]),
    act("fb-valdivia-3", "Museo Histórico y Antropológico", "Arte precolombino, cultura mapuche y la historia de la colonización alemana del sur de Chile en una casona del siglo XIX.", "museos", "/panoramas/museo-antropologico-valdivia.jpg", -39.8124, -73.2333, "Los Laureles s/n, Isla Teja, Valdivia", ["historia", "mapuche", "colonización"]),
  ],
  "Puerto Montt": [
    act("fb-puertomontt-1", "Feria Artesanal de Angelmó", "El mercado artesanal más famoso del sur de Chile, con artesanía en madera, cuero y los mejores mariscos del mar de Chiloé.", "gastronomia", "/panoramas/feria-angelmo.jpg", -41.4720, -73.0100, "Puerto Angelmó, Puerto Montt", ["artesanía", "marisco", "chiloé"]),
    act("fb-puertomontt-2", "Parque Nacional Alerce Andino", "Bosque de alerces milenarios (algunos de más de 4.000 años) en la cordillera de la Costa. Senderismo en el corazón de la Patagonia.", "aire-libre", "/panoramas/parque-alerce-andino.jpg", -41.5833, -72.3333, "Acceso por Correntoso (45 km)", ["alerces", "senderismo", "patagonia"]),
    act("fb-puertomontt-3", "Volcán Osorno desde Puerto Varas", "El volcán más fotogénico de Chile reflejado en el Lago Llanquihue. Tour de un día desde Puerto Montt con vistas incomparables.", "aire-libre", "/panoramas/volcan-osorno.jpg", -41.1000, -72.4833, "Lago Llanquihue, Puerto Varas (25 km)", ["volcán", "lago", "fotografía"]),
  ],
  "Coyhaique": [
    act("fb-coyhaique-1", "Reserva Nacional Coyhaique", "Bosque nativo con senderos entre lengas y cipreses a solo 4 km del centro de Coyhaique. El parque urbano más accesible de la Patagonia.", "aire-libre", "/panoramas/reserva-nacional-coyhaique.jpg", -45.5412, -72.0562, "Sector Los Lingues, Coyhaique", ["bosque nativo", "senderismo", "patagonia"]),
    act("fb-coyhaique-2", "Lago Elizalde", "Lago glaciar de aguas cristalinas a 33 km de Coyhaique, ideal para pesca de salmón y trucha, kayak y camping en plena Patagonia.", "deportes", "/panoramas/lago-elizalde.jpg", -45.7500, -72.0000, "Carretera Austral km 33, Coyhaique", ["lago glaciar", "pesca", "kayak"]),
    act("fb-coyhaique-3", "Plaza de Armas de Coyhaique", "La única plaza de cinco lados de Chile, corazón de la vida social patagónica con restaurantes de cocina regional y artesanía local.", "gastronomia", "/panoramas/plaza-armas-coyhaique.jpg", -45.5716, -72.0666, "Plaza de Armas, Coyhaique", ["gastronomía patagónica", "artesanía", "cordero"]),
  ],
  "Punta Arenas": [
    act("fb-puntaarenas-1", "Torres del Paine — Excursión de día", "El parque más famoso de la Patagonia a 3 horas de Punta Arenas. Torres, glaciares, pumas y la experiencia de fin del mundo.", "aire-libre", "/panoramas/torres-del-paine.jpg", -50.9423, -73.4068, "Torres del Paine (280 km al norte)", ["torres del paine", "trekking", "glaciares"]),
    act("fb-puntaarenas-2", "Cementerio Municipal de Punta Arenas", "Uno de los cementerios más hermosos del mundo, con mausoleos de colonos europeos entre cipreses y cipruces. Patrimonio histórico único.", "museos", "/panoramas/cementerio-punta-arenas.jpg", -53.1550, -70.9117, "Av. Bulnes, Punta Arenas", ["patrimonio", "historia", "arquitectura"]),
    act("fb-puntaarenas-3", "Restaurantes de Centolla Magallánica", "La centolla del Estrecho de Magallanes, considerada el mejor marisco del mundo. Experiencia gastronómica única en el fin del mundo.", "gastronomia", "/panoramas/centolla-magallanica.jpg", -53.1638, -70.9171, "Centro de Punta Arenas", ["centolla", "gastronomía", "fin del mundo"]),
  ],
};

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Encuentra la capital regional más cercana a las coordenadas dadas.
 */
export function capitalMasCercana(lat: number, lng: number): CapitalRegional {
  let mejor = CAPITALES_REGIONALES[0]!;
  let distMin = Infinity;
  for (const capital of CAPITALES_REGIONALES) {
    const d = calcularDistanciaKm(lat, lng, capital.lat, capital.lng);
    if (d < distMin) {
      distMin = d;
      mejor = capital;
    }
  }
  return mejor;
}

/**
 * Devuelve las 3 actividades predefinidas para una capital regional.
 * Usa el nombre de la capital como clave.
 */
export function actividadesFallback(nombreCapital: string): Activity[] {
  return ACTIVIDADES_FALLBACK[nombreCapital] ?? ACTIVIDADES_FALLBACK["Santiago"] ?? [];
}
