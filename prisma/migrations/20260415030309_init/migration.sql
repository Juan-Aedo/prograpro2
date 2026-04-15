-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'U',
    "preferencias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "apertura" TEXT NOT NULL,
    "cierre" TEXT NOT NULL,
    "diasDisponibles" TEXT[],
    "moneda" TEXT NOT NULL DEFAULT 'CLP',
    "valor" INTEGER NOT NULL,
    "esPorPersona" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalResenas" INTEGER NOT NULL DEFAULT 0,
    "afluencia" TEXT NOT NULL DEFAULT 'media',
    "tags" TEXT[],
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "enTendencia" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "personas" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Activity_categoria_idx" ON "public"."Activity"("categoria");

-- CreateIndex
CREATE INDEX "Activity_destacada_idx" ON "public"."Activity"("destacada");

-- CreateIndex
CREATE INDEX "Activity_enTendencia_idx" ON "public"."Activity"("enTendencia");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "public"."Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_activityId_idx" ON "public"."Booking"("activityId");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
