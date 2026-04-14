"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Home,
  Map,
  Search,
  CalendarCheck,
  Menu,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";

const enlaces = [
  { href: "/",         label: "Inicio",   icono: Home },
  { href: "/explore",  label: "Explorar", icono: Search },
  { href: "/map",      label: "Mapa",     icono: Map },
  { href: "/bookings", label: "Reservas", icono: CalendarCheck },
];

export function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { estaAutenticado, usuario, logout } = useUserStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Navbar desktop */}
      <nav className="sticky top-0 z-50 border-b border-ink-900/8 bg-cream-100/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400 border border-ink-900/20 transition-all duration-150 group-hover:shadow-offset-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
              <Compass className="h-5 w-5 text-ink-900" />
            </div>
            <span className="font-display text-xl font-bold text-ink-900 tracking-tight">
              Panoramas
            </span>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-6">
            {enlaces.map(({ href, label }) => {
              const activo = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-150 cursor-pointer pb-0.5",
                    activo
                      ? "text-ink-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-teal-400"
                      : "text-ink-500 hover:text-ink-900"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="hidden md:flex items-center gap-3">
            {estaAutenticado && usuario ? (
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex items-center gap-2 rounded-full border border-ink-900/15 bg-cream-200 px-3 py-1.5 cursor-pointer transition-all duration-150 hover:border-red-300 hover:shadow-offset-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-ink-900">
                  {usuario.avatar}
                </div>
                <span className="text-sm font-medium text-ink-800">{usuario.nombre}</span>
              </button>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-5">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-ink-900/15 text-ink-600 transition-all duration-150 hover:bg-cream-200 cursor-pointer"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          >
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          menuAbierto ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="border-t border-ink-900/8 bg-cream-100 px-4 pb-5 pt-3 space-y-1">
            {enlaces.map(({ href, label, icono: Icono }) => {
              const activo = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAbierto(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 cursor-pointer",
                    activo
                      ? "bg-teal-100 text-teal-700 border border-teal-200"
                      : "text-ink-600 hover:bg-cream-200"
                  )}
                >
                  <Icono className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            {!estaAutenticado && (
              <Link
                href="/login"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-all duration-150 cursor-pointer"
              >
                <User className="h-4 w-4" />
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Barra inferior móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-ink-900/8 bg-cream-100/95 backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-2">
          {enlaces.map(({ href, label, icono: Icono }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
                  activo ? "text-teal-600" : "text-ink-400 hover:text-ink-700"
                )}
              >
                <div className={cn(
                  "rounded-xl p-1.5 transition-all duration-150",
                  activo ? "bg-teal-100" : ""
                )}>
                  <Icono className={cn("h-5 w-5", activo && "scale-110")} />
                </div>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
