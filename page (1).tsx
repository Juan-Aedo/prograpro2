import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Phone,
  Globe,
  Tag,
  Timer,
} from "lucide-react";
import { getActividadById, getActividades } from "@/lib/data";
import { calcularScore, explicarRecomendacion } from "@/lib/recommendations";
import { obtenerClima } from "@/lib/weather";
import { formatearPrecio, capitalizar } from "@/lib/utils";
import { BookingForm } from "@/components/BookingForm";
import { MapWidget } from "@/components/MapWidget";
import { CrowdIndicator } from "@/components/CrowdIndicator";
import { ActivityCard } from "@/components/ActivityCard";
import type { UserPreferences } from "@/lib/types";

const DEFAULT_PREFS: UserPreferences = {
  categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
  presupuesto: "medio",
  evitar: [],
  prefiereExterior: true,
};

// Genera rutas estáticas para todas las actividades
export async function generateStaticParams() {
  return getActividades().map((a) => ({ id: a.id }));
}

interface Props {
  params: { id: string };
}

export default async function ActivityPage({ params }: Props) {
  const actividad = getActividadById(params.id);
  if (!actividad) notFound();

  const clima = await obtenerClima();
  const { score, factores } = calcularScore(actividad, clima, DEFAULT_PREFS);
  const razones = explicarRecomendacion({ actividadId: actividad.id, score, factores }, clima);

  // Actividades relacionadas (misma categoría, distinto ID)
  const relacionadas = getActividades()
    .filter((a) => a.categoria === actividad.categoria && a.id !== actividad.id)
    .slice(0, 3);

  const climaOk = actividad.aptoClima.includes(clima.icono);

  return (
    <main className="pb-24 md:pb-10">
      {/* Banner de imagen */}
      <div className="relative h-56 md:h-80 bg-surface-200 overflow-hidden">
        {actividad.imagen ? (
          <Image
            src={actividad.imagen}
            alt={actividad.nombre}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-6xl opacity-30">🗺</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Badge score */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow">
            ✨ {score}% recomendada
          </span>
          {!climaOk && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow">
              ⚠ No ideal para hoy
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-surface-900 leading-tight">
                  {actividad.nombre}
                </h1>
                <span className="text-2xl font-bold text-brand-700 whitespace-nowrap">
                  {formatearPrecio(actividad.precio.valor, actividad.precio.moneda)}
                  {actividad.precio.esPorPersona && actividad.precio.valor > 0 && (
                    <span className="text-sm font-normal text-surface-500"> /persona</span>
                  )}
                </span>
              </div>

              {/* Rating y categoría */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`badge text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700`}>
                  {capitalizar(actividad.categoria)}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-surface-900">{actividad.rating}</span>
                  <span className="text-surface-400">({actividad.totalResenas.toLocaleString()} reseñas)</span>
                </div>
                {actividad.enTendencia && (
                  <span className="flex items-center gap-1 text-xs font-medium text-fuchsia-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    En tendencia
                  </span>
                )}
              </div>
            </div>

            {/* Info rápida */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoChip icon={<MapPin className="h-4 w-4" />} label="Dirección" value={actividad.ubicacion.comuna ?? actividad.ubicacion.ciudad ?? ""} />
              <InfoChip icon={<Clock className="h-4 w-4" />} label="Horario" value={`${actividad.horario.apertura} – ${actividad.horario.cierre}`} />
              {actividad.duracionMinutos && (
                <InfoChip icon={<Timer className="h-4 w-4" />} label="Duración" value={`~${Math.round(actividad.duracionMinutos / 60 * 10) / 10}h`} />
              )}
              <InfoChip
                icon={<Users className="h-4 w-4" />}
                label="Cupos"
                value={!actividad.cuposDisponibles
                  ? "Agotado"
                  : actividad.cuposRestantes !== null
                  ? `${actividad.cuposRestantes} disponibles`
                  : "Disponible"}
                danger={!actividad.cuposDisponibles}
              />
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-2">Descripción</h2>
              <p className="text-surface-600 leading-relaxed">{actividad.descripcion}</p>
            </div>

            {/* Afluencia */}
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-2">Afluencia esperada</h2>
              <CrowdIndicator nivel={actividad.afluencia} />
            </div>

            {/* Recomendación IA */}
            {razones.length > 0 && (
              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
                <h2 className="text-sm font-semibold text-brand-800 mb-2">
                  ✨ ¿Por qué la recomendamos?
                </h2>
                <ul className="space-y-1">
                  {razones.map((r, i) => (
                    <li key={i} className="text-sm text-brand-700">{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Etiquetas */}
            {actividad.etiquetas && actividad.etiquetas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-surface-400" />
                  {actividad.etiquetas.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-surface-100 text-surface-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contacto */}
            {(actividad.telefono || actividad.sitioWeb) && (
              <div className="flex gap-4 flex-wrap">
                {actividad.telefono && (
                  <a href={`tel:${actividad.telefono}`} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
                    <Phone className="h-4 w-4" />
                    {actividad.telefono}
                  </a>
                )}
                {actividad.sitioWeb && (
                  <a href={actividad.sitioWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
                    <Globe className="h-4 w-4" />
                    Sitio web oficial
                  </a>
                )}
              </div>
            )}

            {/* Mapa */}
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Ubicación</h2>
              <MapWidget
                lat={actividad.ubicacion.lat}
                lng={actividad.ubicacion.lng}
                direccion={actividad.ubicacion.direccion}
                nombre={actividad.nombre}
                googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              />
            </div>
          </div>

          {/* ── Sidebar: formulario de reserva ── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <BookingForm actividad={actividad} />

            {/* Widget clima */}
            <div className="card p-4">
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">
                Clima hoy en Santiago
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-surface-900">{clima.temperatura}°C</p>
                  <p className="text-sm text-surface-500">{clima.descripcion}</p>
                </div>
                <div className={`text-xs font-medium px-2.5 py-1.5 rounded-full ${
                  climaOk
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {climaOk ? "✅ Apto para esta actividad" : "⚠ Clima no ideal"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actividades relacionadas */}
        {relacionadas.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-surface-900 mb-4">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relacionadas.map((a, i) => (
                <ActivityCard key={a.id} actividad={a} indice={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// Componente auxiliar de info
function InfoChip({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface-50 border border-surface-100 p-3">
      <div className={`flex items-center gap-1.5 text-xs mb-1 ${danger ? "text-red-500" : "text-surface-400"}`}>
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm font-semibold ${danger ? "text-red-600" : "text-surface-900"}`}>
        {value}
      </p>
    </div>
  );
}
