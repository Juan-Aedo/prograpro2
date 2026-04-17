import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const actividades = [
  {
    id: "1",
    nombre: "Cine Hoyts — Estreno Dune: Parte 3",
    descripcion:
      "Disfruta del esperado estreno de Dune: Parte 3 en sala IMAX con sonido Dolby Atmos. Una experiencia cinematográfica inmersiva que no te puedes perder.",
    categoria: "cine",
    imagen: "/panoramas/dune-3-cine-hoyts.png",
    direccion: "Av. Kennedy 5413, Las Condes",
    lat: -33.3988,
    lng: -70.5754,
    apertura: "14:00",
    cierre: "23:30",
    diasDisponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    moneda: "CLP",
    valor: 7500,
    esPorPersona: true,
    rating: 4.7,
    totalResenas: 328,
    afluencia: "alta",
    tags: ["IMAX", "estreno", "ciencia ficción"],
    destacada: true,
    enTendencia: true,
  },
  {
    id: "2",
    nombre: "Parque Bicentenario — Picnic al aire libre",
    descripcion:
      "Un hermoso parque urbano ideal para hacer picnic, pasear con mascotas o simplemente relajarte junto al lago. Cuenta con áreas verdes, juegos infantiles y senderos para caminar.",
    categoria: "parques",
    imagen: "/panoramas/parque-bicentenario.jpeg",
    direccion: "Av. Bicentenario 3800, Vitacura",
    lat: -33.3954,
    lng: -70.5985,
    apertura: "07:00",
    cierre: "20:00",
    diasDisponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    moneda: "CLP",
    valor: 0,
    esPorPersona: false,
    rating: 4.8,
    totalResenas: 1205,
    afluencia: "media",
    tags: ["gratis", "mascotas", "familiar", "aire libre"],
    destacada: true,
    enTendencia: false,
  },
  {
    id: "3",
    nombre: "Teatro Municipal — La Traviata",
    descripcion:
      "Presentación de la ópera clásica de Verdi interpretada por el elenco del Teatro Municipal de Santiago. Una velada elegante con música de clase mundial.",
    categoria: "teatro",
    imagen: "/panoramas/teatro-municipal.jpg",
    direccion: "Agustinas 794, Santiago Centro",
    lat: -33.4417,
    lng: -70.6505,
    apertura: "19:00",
    cierre: "22:00",
    diasDisponibles: ["Viernes", "Sábado", "Domingo"],
    moneda: "CLP",
    valor: 25000,
    esPorPersona: true,
    rating: 4.9,
    totalResenas: 567,
    afluencia: "alta",
    tags: ["ópera", "cultura", "elegante"],
    destacada: true,
    enTendencia: true,
  },
  {
    id: "4",
    nombre: "Museo de Arte Contemporáneo",
    descripcion:
      "Exposición temporal 'Futuros Posibles' — una colección de artistas latinoamericanos que exploran la relación entre tecnología y naturaleza a través de instalaciones interactivas.",
    categoria: "museos",
    imagen: "/panoramas/museo-arte-contemporaneo.jpg",
    direccion: "Parque Forestal s/n, Santiago Centro",
    lat: -33.4372,
    lng: -70.6422,
    apertura: "10:00",
    cierre: "18:00",
    diasDisponibles: ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    moneda: "CLP",
    valor: 3000,
    esPorPersona: true,
    rating: 4.5,
    totalResenas: 892,
    afluencia: "baja",
    tags: ["arte", "exposición", "interactivo"],
    destacada: false,
    enTendencia: false,
  },
  {
    id: "5",
    nombre: "Restaurante Boragó — Experiencia Gastronómica",
    descripcion:
      "Cena de degustación en uno de los mejores restaurantes de Latinoamérica. Cocina de autor con ingredientes endémicos chilenos en un ambiente sofisticado.",
    categoria: "gastronomia",
    imagen: "/panoramas/borago.jpg",
    direccion: "Av. San Josemaría Escrivá de Balaguer 5970, Vitacura",
    lat: -33.3835,
    lng: -70.5672,
    apertura: "19:30",
    cierre: "23:00",
    diasDisponibles: ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    moneda: "CLP",
    valor: 85000,
    esPorPersona: true,
    rating: 4.9,
    totalResenas: 245,
    afluencia: "media",
    tags: ["fine dining", "degustación", "premium"],
    destacada: true,
    enTendencia: true,
  },
  {
    id: "6",
    nombre: "Escalada en Muro Indoor — The Climb",
    descripcion:
      "Centro de escalada con muros de diferentes niveles de dificultad. Incluye equipamiento, clase introductoria para principiantes y zona de boulder.",
    categoria: "deportes",
    imagen: "/panoramas/entrenamiento-de-escalada.jpg",
    direccion: "Av. Italia 1234, Providencia",
    lat: -33.4445,
    lng: -70.6157,
    apertura: "09:00",
    cierre: "22:00",
    diasDisponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    moneda: "CLP",
    valor: 12000,
    esPorPersona: true,
    rating: 4.6,
    totalResenas: 178,
    afluencia: "baja",
    tags: ["deporte", "aventura", "principiantes"],
    destacada: false,
    enTendencia: false,
  },
  {
    id: "7",
    nombre: "Festival de Jazz en el Parque",
    descripcion:
      "Festival al aire libre con bandas de jazz nacionales e internacionales. Trae tu manta, disfruta de food trucks y música en vivo bajo las estrellas.",
    categoria: "musica",
    imagen: "/panoramas/festival-jazz.jpg",
    direccion: "Parque O'Higgins, Santiago",
    lat: -33.4625,
    lng: -70.6555,
    apertura: "17:00",
    cierre: "23:00",
    diasDisponibles: ["Sábado", "Domingo"],
    moneda: "CLP",
    valor: 15000,
    esPorPersona: true,
    rating: 4.7,
    totalResenas: 432,
    afluencia: "alta",
    tags: ["jazz", "festival", "aire libre", "food trucks"],
    destacada: true,
    enTendencia: true,
  },
  {
    id: "8",
    nombre: "Taller de Cerámica Artesanal",
    descripcion:
      "Aprende técnicas de cerámica en torno y modelado a mano. Incluye materiales, horneado de piezas y una bebida caliente. Ideal para desconectarte de la rutina.",
    categoria: "talleres",
    imagen: "/panoramas/taller-ceramica.jpg",
    direccion: "Constitución 62, Providencia",
    lat: -33.4267,
    lng: -70.6162,
    apertura: "10:00",
    cierre: "19:00",
    diasDisponibles: ["Miércoles", "Jueves", "Viernes", "Sábado"],
    moneda: "CLP",
    valor: 22000,
    esPorPersona: true,
    rating: 4.8,
    totalResenas: 89,
    afluencia: "baja",
    tags: ["taller", "manualidades", "relax"],
    destacada: false,
    enTendencia: false,
  },
  {
    id: "9",
    nombre: "Kayak en el Cajón del Maipo",
    descripcion:
      "Aventura de medio día en kayak por los rápidos del río Maipo. Incluye transporte, equipamiento completo, guía certificado y snack energético.",
    categoria: "aire-libre",
    imagen: "/panoramas/kayak.jpg",
    direccion: "Camino al Volcán km 25, San José de Maipo",
    lat: -33.6389,
    lng: -70.3533,
    apertura: "08:00",
    cierre: "14:00",
    diasDisponibles: ["Sábado", "Domingo"],
    moneda: "CLP",
    valor: 35000,
    esPorPersona: true,
    rating: 4.8,
    totalResenas: 156,
    afluencia: "media",
    tags: ["aventura", "naturaleza", "deporte acuático"],
    destacada: true,
    enTendencia: false,
  },
  {
    id: "10",
    nombre: "Bar Speakeasy — Cócteles de Autor",
    descripcion:
      "Bar secreto con entrada oculta. Cócteles de autor preparados por mixólogos premiados en un ambiente de los años 20. Reserva obligatoria.",
    categoria: "nightlife",
    imagen: "/panoramas/speakeasy-providencia.jpg",
    direccion: "Bombero Ossa 1010, Santiago Centro",
    lat: -33.4396,
    lng: -70.6445,
    apertura: "20:00",
    cierre: "02:00",
    diasDisponibles: ["Jueves", "Viernes", "Sábado"],
    moneda: "CLP",
    valor: 9000,
    esPorPersona: true,
    rating: 4.6,
    totalResenas: 312,
    afluencia: "alta",
    tags: ["cócteles", "speakeasy", "nocturno"],
    destacada: false,
    enTendencia: true,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const act of actividades) {
    await prisma.activity.upsert({
      where: { id: act.id },
      update: act,
      create: act,
    });
  }
  console.log(`Inserted ${actividades.length} activities`);

  const demoEmail = "demo@panoramas.cl";
  const demoPasswordHash = await bcrypt.hash("demo1234", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      nombre: "Matías",
      email: demoEmail,
      passwordHash: demoPasswordHash,
      avatar: "M",
      preferencias: ["cine", "gastronomia", "musica", "aire-libre"],
    },
  });
  console.log(`Demo user: ${demoEmail} / demo1234`);

  // Get the created activities to use their actual IDs
  const act1 = await prisma.activity.findFirst({ where: { nombre: "Cine Hoyts — Estreno Dune: Parte 3" } });
  const act7 = await prisma.activity.findFirst({ where: { nombre: "Festival de Jazz en el Parque" } });
  const act3 = await prisma.activity.findFirst({ where: { nombre: "Teatro Municipal — La Traviata" } });

  if (act1 && act7 && act3) {
    await prisma.booking.deleteMany({ where: { userId: demoUser.id } });
    await prisma.booking.createMany({
      data: [
        {
          userId: demoUser.id,
          activityId: act3.id,
          fecha: "2026-04-15",
          hora: "19:00",
          personas: 2,
          estado: "confirmada",
          total: 50000,
        },
        {
          userId: demoUser.id,
          activityId: act7.id,
          fecha: "2026-04-12",
          hora: "17:00",
          personas: 4,
          estado: "pendiente",
          total: 60000,
        },
        {
          userId: demoUser.id,
          activityId: act1.id,
          fecha: "2026-04-05",
          hora: "20:00",
          personas: 2,
          estado: "completada",
          total: 15000,
        },
      ],
    });
    console.log("Inserted 3 demo bookings");
  } else {
    console.log("Warning: Could not find activities for bookings");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
