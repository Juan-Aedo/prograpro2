-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "edad" INTEGER,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "sexo" TEXT,
ADD COLUMN     "supabaseId" TEXT,
ADD COLUMN     "telefono" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "public"."User"("supabaseId");
