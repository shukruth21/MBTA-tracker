// src/api/predictions.ts
import { MBTA_API_KEY } from "./config";

export interface MBTAPrediction {
  id: string;
  attributes: {
    arrival_time: string | null;
    departure_time: string | null;
    direction_id: number;
    schedule_relationship: string | null;
    status: string | null;
  };
  relationships: {
    stop: { data: { id: string } | null };
    route: { data: { id: string; type: string } | null };
    trip: { data: { id: string; type: string } | null };
  };
}

export interface MBTARoute {
  id: string;
  type: string;
  attributes: {
    short_name: string;
    long_name: string;
    color: string;
    text_color: string;
    direction_names: string[];
  };
}

// Add Trip interface
export interface MBTATrip {
  id: string;
  type: string;
  attributes: {
    headsign: string;
    name: string;
    direction_id: number;
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

export async function fetchPredictionsForStop(stopId: string): Promise<MBTAPrediction[]> {
  const data = await fetchMBTA(
    `/predictions?filter[stop]=${stopId}&include=route,trip&sort=departure_time`
  );
  return data.data as MBTAPrediction[];
}

// Updated to return both routes and trips
export async function fetchPredictionsWithRoutes(stopId: string) {
  const data = await fetchMBTA(
    `/predictions?filter[stop]=${stopId}&include=route,trip&sort=departure_time`
  );

  const predictions = data.data as MBTAPrediction[];
  const included = data.included || [];

  // Map routes by id
  const routesMap = new Map<string, MBTARoute["attributes"]>();
  // Map trips by id
  const tripsMap = new Map<string, MBTATrip["attributes"]>();
  
  included.forEach((item: any) => {
    if (item.type === "route") {
      routesMap.set(item.id, item.attributes);
    } else if (item.type === "trip") {
      tripsMap.set(item.id, item.attributes);
    }
  });

  console.log("Routes map:", routesMap);
  console.log("Trips map:", tripsMap);

  return { predictions, routesMap, tripsMap };
}

export async function fetchSchedulesFallback(stopId: string): Promise<MBTAPrediction[]> {
  const data = await fetchMBTA(
    `/schedules?filter[stop]=${stopId}&include=prediction,route,trip&sort=departure_time`
  );
  return (data.data as MBTAPrediction[]).filter(
    (s) => s.attributes.departure_time !== null
  );
}