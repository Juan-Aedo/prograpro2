import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Sincroniza datos del usuario de Supabase (nombre, email, contacto, preferencias)
// hacia la base local PostgreSQL + guarda hash bcrypt de la contraseña.
// Elemento criptográfico: bcrypt con cost factor 10 (adaptativo, resistente a fuerza bruta).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const {
    email,
    password,
    nombre,
    supabaseId,
    preferencias,
    edad,
    sexo,
    ciudad,
    lat,
    lng,
    telefono,
  } = body as {
    email?: string;
    password?: string;
    nombre?: string;
    supabaseId?: string;
    preferencias?: string[];
    edad?: number | null;
    sexo?: string | null;
    ciudad?: string | null;
    lat?: number | null;
    lng?: number | null;
    telefono?: string | null;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  // bcrypt.hash — genera salt aleatorio y aplica Blowfish
  // Formato resultante: $2b$10$[22-char salt][31-char hash] (60 chars total)
  const passwordHash = await hashPassword(password);

  const nombreFinal = nombre ?? email.split("@")[0];
  const avatarFinal = (nombre ?? email).charAt(0).toUpperCase();

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      nombre: nombreFinal,
      ...(supabaseId !== undefined && { supabaseId }),
      ...(preferencias !== undefined && { preferencias }),
      ...(edad !== undefined && { edad }),
      ...(sexo !== undefined && { sexo }),
      ...(ciudad !== undefined && { ciudad }),
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
      ...(telefono !== undefined && { telefono }),
    },
    create: {
      nombre: nombreFinal,
      email,
      passwordHash,
      avatar: avatarFinal,
      supabaseId: supabaseId ?? null,
      preferencias: preferencias ?? [],
      edad: edad ?? null,
      sexo: sexo ?? null,
      ciudad: ciudad ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      telefono: telefono ?? null,
    },
  });

  // Devolvemos solo identificador + salt parcial (no el hash real)
  const hashParcial = passwordHash.substring(0, 29) + "...";

  return NextResponse.json({ hashParcial });
}
