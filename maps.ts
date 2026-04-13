// ─────────────────────────────────────────────
//  MAPS — URL helpers & Google Maps JS loader
// ─────────────────────────────────────────────

/**
 * Generates a Google Maps directions URL for the given coordinates.
 */
export function generarUrlMaps(lat: number, lng: number, label?: string): string {
  const destino = label
    ? encodeURIComponent(label)
    : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destino}`;
}

/**
 * Generates a Google Maps "place" embed URL for use in an <iframe>.
 */
export function generarUrlEmbed(lat: number, lng: number, apiKey: string): string {
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
}

/**
 * Generates a static map image URL (Google Maps Static API).
 */
export function generarUrlStaticMap(
  lat: number,
  lng: number,
  apiKey: string,
  width = 600,
  height = 300,
  zoom = 15
): string {
  const marker = `color:red|${lat},${lng}`;
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${width}x${height}` +
    `&markers=${encodeURIComponent(marker)}` +
    `&key=${apiKey}`
  );
}

/**
 * Dynamically loads the Google Maps JavaScript API.
 * Safe to call multiple times — will only inject the script once.
 */
export function cargarGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();

    if ((window as any).google?.maps) return resolve();

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Creates a custom styled map (dark/light mode aware).
 */
export const MAPA_ESTILOS_CLARO: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "simplified" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d9e8" }] },
  { featureType: "landscape", stylers: [{ color: "#f9f9f6" }] },
];

export const MAPA_ESTILOS_OSCURO: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#303030" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];
