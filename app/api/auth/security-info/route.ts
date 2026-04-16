import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

// Devuelve información sobre los mecanismos criptográficos usados por la cuenta actual.
// Requiere sesión activa de Supabase.
export async function GET() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Buscar usuario en Prisma para obtener el hash bcrypt local
  const prismaUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { passwordHash: true },
  });

  const proveedor = (user.app_metadata?.provider as string) ?? "email";

  return NextResponse.json({
    tieneHashBcrypt: !!prismaUser?.passwordHash,
    // Solo exponemos el prefijo del hash (algoritmo + salt parcial), nunca el hash completo
    hashParcial: prismaUser?.passwordHash
      ? prismaUser.passwordHash.substring(0, 29) + "..."
      : null,
    proveedor,
    email: user.email,
  });
}
