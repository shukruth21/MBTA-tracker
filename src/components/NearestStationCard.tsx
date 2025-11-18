// src/components/NearestStationCard.tsx
import { useEffect, useState } from "react";
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
        const stops = await fetchNearestStops(lat, lon);
        console.log("Nearest stops found:", stops);
        
        if (stops.length > 0) {
          setStop(stops[0]);
        } else {
          setError("No MBTA stops found within 2km. Try a different location.");
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

  // Format distance nicely
  const distanceText = stop.distance 
    ? stop.distance < 1 
      ? `${Math.round(stop.distance * 1000)}m away`
      : `${stop.distance.toFixed(1)}km away`
    : '';

  return (
    <div>
      <h2>Nearest MBTA Stop</h2>
      <p>
        <strong>{stop.attributes.name}</strong>
        {distanceText && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '13px', 
            color: '#666',
            fontWeight: 'normal'
          }}>
            ({distanceText})
          </span>
        )}
      </p>
      <p className="muted" style={{ fontSize: '12px', margin: '4px 0 12px 0' }}>
        Stop ID: {stop.id}
      </p>
      <PredictionsCard stopId={stop.id} stopName={stop.attributes.name} />
    </div>
  );
}
