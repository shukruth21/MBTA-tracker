// src/api/mbta.ts
import { MBTA_API_KEY } from "./config";

export interface MBTAStop {
  id: string;
  attributes: {
    name: string;
    latitude: number;
    longitude: number;
    location_type: number; // 0 = platform, 1 = station
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

// Find nearest RAPID TRANSIT stops (subway/light rail only)
export async function fetchNearestStops(lat: number, lon: number): Promise<MBTAStop[]> {
  const data = await fetchMBTA(
    `/stops?filter[latitude]=${lat}&filter[longitude]=${lon}&sort=distance&filter[radius]=0.005` // Reduced radius to ~500m
  );
  
  const stops = data.data as MBTAStop[];
  
  // Filter for parent stations (location_type=1) only
  // These are the main station entrances that have predictions
  const parentStations = stops.filter(stop => stop.attributes.location_type === 1);
  
  console.log("Filtered parent stations:", parentStations);
  
  return parentStations;
}

// Fetch stops by placeId (all platforms)
export async function fetchStopsByPlace(placeId: string): Promise<MBTAStop[]> {
  const data = await fetchMBTA(`/stops?filter[place]=${placeId}`);
  return data.data as MBTAStop[];
}
// src/api/mbta.ts - ADD THIS NEW FUNCTION
export async function fetchNearestStopWithPlatforms(lat: number, lon: number) {
  // First, get nearest parent station
  const data = await fetchMBTA(
    `/stops?filter[latitude]=${lat}&filter[longitude]=${lon}&sort=distance&filter[radius]=0.01`
  );
  
  const stops = data.data as MBTAStop[];
  
  // Find first parent station (location_type=1)
  const parentStation = stops.find(stop => stop.attributes.location_type === 1);
  
  if (!parentStation) {
    throw new Error("No parent station found nearby");
  }
  
  console.log("Found parent station:", parentStation);
  
  // Now get all child platforms for this parent station
  const platformsData = await fetchMBTA(
    `/stops?filter[location_type]=0&filter[parent_station]=${parentStation.id}`
  );
  
  const platforms = platformsData.data as MBTAStop[];
  console.log("Child platforms:", platforms);
  
  return {
    parentStation,
    platforms
  };
}