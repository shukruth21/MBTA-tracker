// src/components/PredictionsCard.tsx
import  { useEffect, useState } from "react";
import { fetchPredictionsWithRoutes} from "../api/predictions";
import type { MBTAPrediction, MBTARoute, MBTATrip } from "../api/predictions";
import AlertsBanner from "./AlertsBanner";

interface Props {
  stopId: string;
  stopName: string;
}

interface EnrichedPrediction {
  prediction: MBTAPrediction;
  route?: MBTARoute["attributes"];
  trip?: MBTATrip["attributes"];
}

export default function PredictionsCard({ stopId, stopName }: Props) {
  const [loading, setLoading] = useState(true);
  const [enrichedPredictions, setEnrichedPredictions] = useState<EnrichedPrediction[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setDebugInfo(`Fetching predictions for stop: ${stopId}`);
      
      try {
        const { predictions: data, routesMap, tripsMap } = await fetchPredictionsWithRoutes(stopId);
        console.log("Raw predictions data:", data);
        console.log("Routes map:", routesMap);
        console.log("Trips map:", tripsMap);
        setDebugInfo(`Found ${data.length} raw predictions`);

        // Filter out invalid predictions AND past trains
        const now = Date.now();
        let valid = data.filter(
          (p) => {
            if (!p.attributes.departure_time) return false;
            if (p.attributes.schedule_relationship === "CANCELLED") return false;
            if (p.attributes.schedule_relationship === "SKIPPED") return false;
            
            const departureTime = new Date(p.attributes.departure_time).getTime();
            if (departureTime < now) return false;
            
            return true;
          }
        );

        console.log("Valid predictions:", valid);
        setDebugInfo(`${valid.length} valid predictions after filtering`);

        // Enrich predictions with route AND trip data
        const enriched: EnrichedPrediction[] = valid.map(prediction => {
          const routeId = prediction.relationships.route?.data?.id;
          const tripId = prediction.relationships.trip?.data?.id;
          
          const route = routeId ? routesMap.get(routeId) : undefined;
          const trip = tripId ? tripsMap.get(tripId) : undefined;
          
          return { prediction, route, trip };
        });

        // Sort by departure time
        enriched.sort(
          (a, b) => {
            const timeA = new Date(a.prediction.attributes.departure_time!).getTime();
            const timeB = new Date(b.prediction.attributes.departure_time!).getTime();
            return timeA - timeB;
          }
        );

        setEnrichedPredictions(enriched);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setDebugInfo(`Error: ${err}`);
        setEnrichedPredictions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [stopId]);

  function formatTime(prediction: MBTAPrediction) {
    if (prediction.attributes.status) {
      return prediction.attributes.status;
    }

    const time = prediction.attributes.departure_time;
    if (!time) return "—";

    const seconds = (new Date(time).getTime() - Date.now()) / 1000;

    if (seconds < 0) return "Departed";
    if (seconds <= 90) return "BRD";
    if (seconds <= 30) return "ARR";
    if (seconds <= 60) return "1 min";

    const minutes = Math.ceil(seconds / 60);
    if (minutes > 20) return "20+ min";

    return `${minutes} min`;
  }

  function renderPredictionWithRoute(ep: EnrichedPrediction) {
    const time = formatTime(ep.prediction);
    
    // Get route info
    let routeName = ep.route?.short_name || "";
    const longName = ep.route?.long_name || "";
    const color = ep.route?.color ? `#${ep.route.color}` : "#999";
    
    // Get destination/headsign
    const destination = ep.trip?.headsign || "";
    
    // For Green Line branches, show "Green-B", "Green-C", etc.
    if (longName.includes("Green Line") && routeName.length === 1) {
      routeName = `Green-${routeName}`;
    }
    
    return (
      <div 
        key={ep.prediction.id} 
        style={{ 
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {routeName && (
            <span 
              style={{ 
                backgroundColor: color,
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "600",
                minWidth: "60px",
                textAlign: "center"
              }}
            >
              {routeName}
            </span>
          )}
          <span style={{ fontSize: "15px", fontWeight: "500" }}>
            {destination}
          </span>
        </div>
        <span style={{ fontWeight: "600", fontSize: "15px", marginLeft: "12px" }}>
          {time}
        </span>
      </div>
    );
  }

  const inbound = enrichedPredictions.filter((ep) => ep.prediction.attributes.direction_id === 1);
  const outbound = enrichedPredictions.filter((ep) => ep.prediction.attributes.direction_id === 0);

  return (
    <section className="card" style={{ marginTop: "12px" }}>
      <h3>Next Trains — {stopName}</h3>
      
      <AlertsBanner stopId={stopId} />
      
      {loading && <p className="loading">Loading trains…</p>}
      
      { debugInfo && (
        <p style={{ fontSize: '12px', color: '#999', margin: '8px 0' }}>{debugInfo}</p>
      )}
      
      {!loading && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <strong style={{ fontSize: "14px", color: "#666" }}>Inbound:</strong>
            <div style={{ marginTop: "8px" }}>
              {inbound.length > 0 ? (
                inbound.slice(0, 3).map(ep => renderPredictionWithRoute(ep))
              ) : (
                <span style={{ color: '#999' }}>No trains</span>
              )}
            </div>
          </div>
          
          <div>
            <strong style={{ fontSize: "14px", color: "#666" }}>Outbound:</strong>
            <div style={{ marginTop: "8px" }}>
              {outbound.length > 0 ? (
                outbound.slice(0, 3).map(ep => renderPredictionWithRoute(ep))
              ) : (
                <span style={{ color: '#999' }}>No trains</span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}