import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Almacena el hash bcrypt de la contraseña del usuario en Prisma.
// Se llama desde el registro con contraseña, después de que Supabase crea la cuenta.
// Elemento criptográfico: bcrypt con cost factor 10 (adaptativo, resistente a fuerza bruta).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const { email, password, nombre } = body as {
    email?: string;
    password?: string;
    nombre?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  // bcrypt.hash — genera un salt aleatorio y aplica el algoritmo Blowfish
  // El resultado tiene formato: $2b$10$[22-char salt][31-char hash] (60 chars total)
  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      nombre: nombre ?? email.split("@")[0],
      email,
      passwordHash,
      avatar: (nombre ?? email).charAt(0).toUpperCase(),
    },
  });

  // Devolvemos solo el identificador del algoritmo + salt parcial (no el hash real)
  // Formato: $2b$10$[primeros chars del salt] — seguro para mostrar en UI
  const hashParcial = passwordHash.substring(0, 29) + "...";

  return NextResponse.json({ hashParcial });
}
