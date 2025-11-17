// src/api/alerts.ts
import { MBTA_API_KEY } from "./config";

export interface MBTAAlert {
  id: string;
  attributes: {
    header: string;
    description: string;
    severity: number; // 1-10, higher = more severe
    effect: string;
    lifecycle: string;
    active_period: Array<{
      start: string;
      end: string | null;
    }>;
  };
  relationships: {
    routes: { data: Array<{ id: string; type: string }> };
  };
}

const BASE_URL = "https://api-v3.mbta.com";

async function fetchMBTA(endpoint: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "x-api-key": MBTA_API_KEY,
      "Accept-Encoding": "gzip",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchAlertsForStop(stopId: string): Promise<MBTAAlert[]> {
  const data = await fetchMBTA(
    `/alerts?filter[stop]=${stopId}&filter[datetime]=NOW`
  );
  return data.data as MBTAAlert[];
}

export async function fetchAlertsForRoute(routeId: string): Promise<MBTAAlert[]> {
  const data = await fetchMBTA(
    `/alerts?filter[route]=${routeId}&filter[datetime]=NOW`
  );
  return data.data as MBTAAlert[];
}