"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeatherData } from "@/lib/types";
import { WeatherBadge } from "./WeatherBadge";

interface HomeHeroProps {
  clima: WeatherData;
}

export function HomeHero({ clima }: HomeHeroProps) {
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/explore?q=${encodeURIComponent(busqueda.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Texto principal */}
          <div className="flex-1 max-w-2xl animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight text-balance">
              ¿Qué me recomiendas hacer?
            </h1>
            <p className="mt-4 text-base sm:text-lg text-brand-100 max-w-lg">
              Descubre las mejores actividades de ocio en tu ciudad, según tus
              gustos y el clima de hoy.
            </p>

            {/* Barra de búsqueda */}
            <form onSubmit={handleBusqueda} className="mt-8 relative max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar actividades, lugares, eventos..."
                  className="w-full rounded-2xl bg-white py-4 pl-12 pr-32 text-sm text-surface-900 placeholder:text-surface-400 shadow-elevated focus:outline-none focus:ring-2 focus:ring-white/30 transition-shadow duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 cursor-pointer"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {/* Widget clima */}
          <div className="hidden md:block w-64 animate-slide-in-right">
            <WeatherBadge clima={clima} />
          </div>
        </div>

        {/* Clima compacto móvil */}
        <div className="mt-6 md:hidden animate-fade-in">
          <WeatherBadge clima={clima} compacto />
        </div>
      </div>
    </section>
  );
}
