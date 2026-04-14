"use client";

import { useState, useCallback } from "react";
import type { RecommendationResponse, RecommendationRequest } from "@/lib/types";

interface UseRecommendationsReturn {
  data: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
  fetch: (req: RecommendationRequest) => Promise<void>;
  reset: () => void;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecomendaciones = useCallback(async (req: RecommendationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error desconocido");
      }

      const resultado: RecommendationResponse = await res.json();
      setData(resultado);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al obtener recomendaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch: fetchRecomendaciones, reset };
}
