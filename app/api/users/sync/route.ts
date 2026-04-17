import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Sincroniza datos del perfil del usuario autenticado en Supabase
// hacia la base local PostgreSQL. Se llama desde el userStore cada vez
// que se actualiza el perfil o las preferencias.
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });
  }

  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();

  if (!supaUser || !supaUser.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    nombre,
    preferencias,
    edad,
    sexo,
    ciudad,
    lat,
    lng,
    telefono,
  } = body as {
    nombre?: string;
    preferencias?: string[];
    edad?: number | null;
    sexo?: string | null;
    ciudad?: string | null;
    lat?: number | null;
    lng?: number | null;
    telefono?: string | null;
  };

  const email = supaUser.email;
  const supabaseId = supaUser.id;
  const metaNombre =
    (supaUser.user_metadata?.nombre as string | undefined) ??
    (supaUser.user_metadata?.full_name as string | undefined);
  const nombreFinal = nombre ?? metaNombre ?? email.split("@")[0];
  const avatar = nombreFinal.charAt(0).toUpperCase();

  const updateData: Record<string, unknown> = {
    supabaseId,
    nombre: nombreFinal,
    avatar,
  };
  if (preferencias !== undefined) updateData.preferencias = preferencias;
  if (edad !== undefined) updateData.edad = edad;
  if (sexo !== undefined) updateData.sexo = sexo;
  if (ciudad !== undefined) updateData.ciudad = ciudad;
  if (lat !== undefined) updateData.lat = lat;
  if (lng !== undefined) updateData.lng = lng;
  if (telefono !== undefined) updateData.telefono = telefono;

  // upsert: actualiza si existe, crea si no existe
  // No setea passwordHash (se crea vacío en flujos OAuth/OTP sin contraseña local)
  const user = await prisma.user.upsert({
    where: { email },
    update: updateData,
    create: {
      email,
      supabaseId,
      nombre: nombreFinal,
      avatar,
      passwordHash: "",
      preferencias: preferencias ?? [],
      edad: edad ?? null,
      sexo: sexo ?? null,
      ciudad: ciudad ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      telefono: telefono ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    id: user.id,
    email: user.email,
    supabaseId: user.supabaseId,
  });
}
