// src/api/mbta.ts
import { MBTA_API_KEY } from "./config";


export interface MBTAStop {
  id: string;
  attributes: {
    name: string;
    latitude: number;
    longitude: number;
    location_type: number;
  };
  distance?: number;
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


// Fetch stops by placeId (all platforms)
export async function fetchStopsByPlace(placeId: string): Promise<MBTAStop[]> {
  const url = `/stops?filter[place]=${placeId}`;
  const res = await fetchMBTA(url);
  return res.data as MBTAStop[];
}

// src/api/mbta.ts
export async function fetchNearestStops(lat: number, lon: number): Promise<MBTAStop[]> {
  const url = `/stops?filter[latitude]=${lat}&filter[longitude]=${lon}&sort=distance&filter[radius]=0.02`;
  const res = await fetchMBTA(url);
  const allStops = res.data as MBTAStop[];
  
  console.log(`Found ${allStops.length} stops within radius`);
  
  // Filter to only parent stations (location_type = 1 or IDs starting with "place-")
  const parentStations = allStops.filter(stop => 
    stop.id.startsWith('place-') || stop.attributes.location_type === 1
  );
  
  console.log(`Filtered to ${parentStations.length} parent stations`);
  
  // Add distance to each stop
  return parentStations.map(stop => ({
    ...stop,
    distance: calculateDistance(lat, lon, stop.attributes.latitude, stop.attributes.longitude)
  }));
}

// Add this helper function if you haven't already
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}