import type { Activity as DbActivity, Booking as DbBooking, User as DbUser } from "@prisma/client";
import type { Activity, Booking, User, ActivityCategory } from "./types";

type BookingWithActivity = DbBooking & { activity: DbActivity };

export function serializeActivity(a: DbActivity): Activity {
  return {
    id: a.id,
    nombre: a.nombre,
    descripcion: a.descripcion,
    categoria: a.categoria as ActivityCategory,
    imagen: a.imagen,
    ubicacion: {
      direccion: a.direccion,
      lat: a.lat,
      lng: a.lng,
    },
    horario: {
      apertura: a.apertura,
      cierre: a.cierre,
      diasDisponibles: a.diasDisponibles,
    },
    precio: {
      moneda: a.moneda,
      valor: a.valor,
      esPorPersona: a.esPorPersona,
    },
    rating: a.rating,
    totalResenas: a.totalResenas,
    afluencia: a.afluencia as Activity["afluencia"],
    tags: a.tags,
    destacada: a.destacada,
    enTendencia: a.enTendencia,
  };
}

export function serializeBooking(b: BookingWithActivity): Booking {
  return {
    id: b.id,
    actividadId: b.activityId,
    actividad: serializeActivity(b.activity),
    fecha: b.fecha,
    hora: b.hora,
    personas: b.personas,
    estado: b.estado as Booking["estado"],
    total: b.total,
  };
}

export function serializeUser(u: DbUser): User {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    avatar: u.avatar,
    preferencias: u.preferencias as ActivityCategory[],
  };
}
