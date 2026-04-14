/*
 * API de Reservas — con Supabase cuando las credenciales estén configuradas,
 * y fallback a datos mock mientras no lo estén.
 *
 * Tabla Supabase requerida:
 * ─────────────────────────────────────────────────────────────
 * create table public.bookings (
 *   id            uuid primary key default gen_random_uuid(),
 *   usuario_id    uuid references auth.users(id) on delete cascade,
 *   actividad_id  text not null,
 *   fecha         date not null,
 *   hora          text not null,
 *   personas      int not null default 1,
 *   total         int not null default 0,
 *   estado        text not null default 'pendiente'
 *                   check (estado in ('confirmada','pendiente','cancelada','completada')),
 *   created_at    timestamptz default now()
 * );
 * alter table public.bookings enable row level security;
 * create policy "Cada usuario ve sus reservas"
 *   on public.bookings for all
 *   using (auth.uid() = usuario_id);
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { reservasMock, actividades } from "@/lib/mock-data";
import type { Booking } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function supabaseConfigurado(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes("your-project-ref")
  );
}

// ── GET /api/bookings ── devuelve las reservas del usuario autenticado
export async function GET() {
  if (supabaseConfigurado()) {
    try {
      const supabase = createServerSupabaseClient();
      if (!supabase) throw new Error("Supabase client no disponible");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enriquecer con datos de la actividad desde mock (mientras no haya tabla de actividades en DB)
      const reservasEnriquecidas = (data ?? []).map((r) => {
        const actividad = actividades.find((a) => a.id === r.actividad_id);
        return {
          id: r.id,
          actividadId: r.actividad_id,
          actividad: actividad ?? null,
          fecha: r.fecha,
          hora: r.hora,
          personas: r.personas,
          estado: r.estado,
          total: r.total,
        };
      });

      return NextResponse.json(reservasEnriquecidas);
    } catch (err) {
      console.error("Supabase GET /api/bookings error:", err);
      // fallthrough → mock
    }
  }

  return NextResponse.json(reservasMock);
}

// ── POST /api/bookings ── crea una nueva reserva
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { actividadId, fecha, hora, personas } = body;

  if (!actividadId || !fecha || !hora || !personas) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios: actividadId, fecha, hora, personas" },
      { status: 400 }
    );
  }

  const actividad = actividades.find((a) => a.id === actividadId);
  if (!actividad) {
    return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
  }

  const total = actividad.precio.esPorPersona
    ? actividad.precio.valor * Number(personas)
    : actividad.precio.valor;

  if (supabaseConfigurado()) {
    try {
      const supabase = createServerSupabaseClient();
      if (!supabase) throw new Error("Supabase client no disponible");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: "Debes iniciar sesión para reservar" },
          { status: 401 }
        );
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          usuario_id: user.id,
          actividad_id: actividadId,
          fecha,
          hora,
          personas: Number(personas),
          total,
          estado: "pendiente",
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(
        { ...data, actividad },
        { status: 201 }
      );
    } catch (err) {
      console.error("Supabase POST /api/bookings error:", err);
      // fallthrough → mock response
    }
  }

  // Fallback: respuesta mock (sin persistencia)
  const nuevaReserva: Booking = {
    id: `b${Date.now()}`,
    actividadId,
    actividad,
    fecha,
    hora,
    personas: Number(personas),
    estado: "pendiente",
    total,
  };

  return NextResponse.json(nuevaReserva, { status: 201 });
}
