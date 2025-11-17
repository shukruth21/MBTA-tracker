// src/components/AlertsBanner.tsx
import React, { useEffect, useState } from "react";
import { fetchAlertsForStop, type MBTAAlert } from "../api/alerts";

interface Props {
  stopId: string;
}

export default function AlertsBanner({ stopId }: Props) {
  const [alerts, setAlerts] = useState<MBTAAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAlertsForStop(stopId);
        console.log("Alerts:", data);
        
        // Filter to show important alerts (severity >= 3)
        // Severity scale: 1=info, 3=minor delay, 5=major delay, 7+=severe
        const important = data.filter(alert => alert.attributes.severity >= 3);
        setAlerts(important);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [stopId]);

  if (loading || alerts.length === 0) return null;

  function getSeverityStyle(severity: number) {
    if (severity >= 7) {
      // Severe - red
      return {
        background: "#fee",
        border: "2px solid #dc2626",
        color: "#991b1b"
      };
    } else if (severity >= 5) {
      // Major - orange
      return {
        background: "#fff7ed",
        border: "2px solid #f97316",
        color: "#9a3412"
      };
    } else {
      // Minor - yellow
      return {
        background: "#fffbeb",
        border: "2px solid #f59e0b",
        color: "#92400e"
      };
    }
  }

  return (
    <div style={{ marginTop: "12px" }}>
      {alerts.map(alert => (
        <div
          key={alert.id}
          style={{
            ...getSeverityStyle(alert.attributes.severity),
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "8px"
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>
            ⚠️ {alert.attributes.header}
          </div>
          <div style={{ fontSize: "14px" }}>
            {alert.attributes.effect}
          </div>
        </div>
      ))}
    </div>
  );
}