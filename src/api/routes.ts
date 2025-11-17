// src/api/routes.ts
import { MBTA_API_KEY } from "./config";

export interface MBTARoute {
  id: string;
  attributes: {
    short_name: string;
    long_name: string;
    color: string;
    text_color: string;
    type: number;
    direction_names: string[];
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

// Get all subway/light rail routes
export async function fetchRapidTransitRoutes(): Promise<MBTARoute[]> {
  const data = await fetchMBTA(
    `/routes?filter[type]=0,1&fields[route]=short_name,long_name,color,text_color,type,direction_names`
  );
  return data.data as MBTARoute[];
}

// Get specific route details
export async function fetchRoute(routeId: string): Promise<MBTARoute> {
  const data = await fetchMBTA(`/routes/${routeId}`);
  return data.data as MBTARoute;
}