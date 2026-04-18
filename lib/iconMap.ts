import {
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const ICONOS_CLIMA: Record<string, IconComponent> = {
  "clear":         Sun,
  "partly-cloudy": CloudSun,
  "cloudy":        Cloud,
  "rain":          CloudRain,
  "storm":         CloudLightning,
  "snow":          Snowflake,
  "fog":           CloudFog,
};

export function iconoParaClima(icono: string | undefined): IconComponent {
  return (icono && ICONOS_CLIMA[icono]) || Sun;
}
