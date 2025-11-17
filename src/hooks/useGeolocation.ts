// src/hooks/useGeolocation.ts
import { useEffect, useState, useCallback } from "react";

export type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "granted"; coords: { latitude: number; longitude: number } }
  | { status: "denied"; message?: string }
  | { status: "error"; message: string };

export default function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "denied", message: "Geolocation not supported" });
      return;
    }

    setState({ status: "requesting" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "granted",
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        });
      },
      (err) => {
        if (err.code === 1) {
          // PERMISSION_DENIED
          setState({ status: "denied", message: "Permission denied" });
        } else {
          setState({ status: "error", message: err.message });
        }
      },
      options ?? { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [options]);

  // optional: auto-request once on mount
  useEffect(() => {
    request();
  }, [request]);

  return { state, request };
}
