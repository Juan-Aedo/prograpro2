import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeActivity } from "@/lib/serializers";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const activity = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!activity) {
    return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
  }
  return NextResponse.json(serializeActivity(activity));
}
