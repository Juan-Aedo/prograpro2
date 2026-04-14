import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const { nombre, email, password, preferencias } = body as {
    nombre?: string;
    email?: string;
    password?: string;
    preferencias?: string[];
  };

  if (!nombre || !email || !password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      nombre,
      email,
      passwordHash,
      avatar: nombre.charAt(0).toUpperCase() || "U",
      preferencias: preferencias ?? [],
    },
  });

  const token = await createToken(user.id);
  setSessionCookie(token);

  return NextResponse.json(serializeUser(user), { status: 201 });
}
