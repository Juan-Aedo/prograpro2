import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrowdIndicatorProps {
  nivel: "baja" | "media" | "alta";
  compacto?: boolean;
}

const config = {
  baja: {
    label: "Poca gente",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    barras: 1,
  },
  media: {
    label: "Moderado",
    color: "text-amber-600",
    bg: "bg-amber-50",
    barras: 2,
  },
  alta: {
    label: "Mucha gente",
    color: "text-red-500",
    bg: "bg-red-50",
    barras: 3,
  },
};

export function CrowdIndicator({
  nivel,
  compacto = false,
}: CrowdIndicatorProps) {
  const { label, color, bg, barras } = config[nivel];

  if (compacto) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs font-medium", color)}>
        <Users className="h-3 w-3" />
        <div className="flex items-end gap-0.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300",
                i <= barras ? "opacity-100" : "opacity-20",
                i === 1 && "h-1.5",
                i === 2 && "h-2.5",
                i === 3 && "h-3.5",
                i <= barras ? color.replace("text-", "bg-") : "bg-ink-200"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-xl px-3 py-2", bg)}>
      <Users className={cn("h-4 w-4", color)} />
      <div>
        <p className={cn("text-xs font-semibold", color)}>{label}</p>
        <div className="mt-1 flex items-end gap-0.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all duration-300",
                i <= barras ? "opacity-100" : "opacity-20",
                i === 1 && "h-2",
                i === 2 && "h-3",
                i === 3 && "h-4",
                i <= barras ? color.replace("text-", "bg-") : "bg-ink-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
