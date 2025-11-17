// src/components/NearestStationCard.tsx
import  { useEffect, useState } from "react";
import { fetchNearestStops } from "../api/mbta";
import type { MBTAStop } from "../api/mbta";
import PredictionsCard from "./PredictionsCard";

interface Props {
  lat: number;
  lon: number;
}

export default function NearestStationCard({ lat, lon }: Props) {
  const [stop, setStop] = useState<MBTAStop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // NOW USING REAL LOCATION!
        const stops = await fetchNearestStops(lat, lon);
        console.log("Nearest stops found:", stops);
        
        if (stops.length > 0) {
          setStop(stops[0]);
        } else {
          setError("No nearby MBTA stops found. Try a different location.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch nearest stops");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [lat, lon]);

  if (loading) return <p>Finding nearest station…</p>;
  if (error) return <p>{error}</p>;
  if (!stop) return null;

  return (
    <div>
      <h2>Nearest MBTA Stop</h2>
      <p><strong>{stop.attributes.name}</strong></p>
      <p className="muted" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
        Stop ID: {stop.id}
      </p>
      <PredictionsCard stopId={stop.id} stopName={stop.attributes.name} />
    </div>
  );
}