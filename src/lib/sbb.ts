/**
 * SBB Travel Cost Estimator
 *
 * Estimates train fares between Swiss cities based on distance zones.
 * In production, this would integrate with the SBB API (transport.opendata.ch).
 * For now, uses realistic fare estimates based on distance.
 */

interface SBBEstimate {
  from: string;
  to: string;
  adultPrice: number;
  halfFarePrice: number;
  travelTime: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Zurich": { lat: 47.3769, lng: 8.5417 },
  "Bern": { lat: 46.9480, lng: 7.4474 },
  "Basel": { lat: 47.5596, lng: 7.5886 },
  "Geneva": { lat: 46.2044, lng: 6.1432 },
  "Lausanne": { lat: 46.5197, lng: 6.6323 },
  "Lucerne": { lat: 47.0502, lng: 8.3093 },
  "St. Gallen": { lat: 47.4245, lng: 9.3767 },
  "Lugano": { lat: 46.0037, lng: 8.9511 },
  "Winterthur": { lat: 47.4979, lng: 8.7112 },
  "Interlaken": { lat: 46.6863, lng: 7.8632 },
  "Zermatt": { lat: 46.0207, lng: 7.7491 },
  "Davos": { lat: 46.8027, lng: 9.8360 },
  "Montreux": { lat: 46.4312, lng: 6.9107 },
  "Chur": { lat: 46.8499, lng: 9.5329 },
  "Engelberg": { lat: 46.8200, lng: 8.4000 },
  "Grindelwald": { lat: 46.6586, lng: 8.0414 },
  "Schaffhausen": { lat: 47.6960, lng: 8.6350 },
  "Locarno": { lat: 46.1709, lng: 8.7991 },
};

export const DEPARTURE_CITIES = Object.keys(CITY_COORDINATES).sort();

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateSBBFare(fromCity: string, toCity: string): SBBEstimate | null {
  const from = CITY_COORDINATES[fromCity];
  const to = CITY_COORDINATES[toCity];
  if (!from || !to) return null;

  const distance = haversineDistance(from.lat, from.lng, to.lat, to.lng);
  const travelFactor = 1.4; // trains don't go straight
  const railDistance = distance * travelFactor;

  // SBB pricing: roughly CHF 0.28-0.35 per km for 2nd class
  const pricePerKm = 0.32;
  const baseFare = Math.max(5, Math.round(railDistance * pricePerKm * 2) / 2);
  const adultPrice = Math.round(baseFare * 2) / 2; // round to nearest 0.50
  const halfFarePrice = Math.round((adultPrice / 2) * 2) / 2;

  const speedKmh = railDistance > 100 ? 90 : 60;
  const travelHours = railDistance / speedKmh;
  const hours = Math.floor(travelHours);
  const minutes = Math.round((travelHours - hours) * 60);
  const travelTime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  return {
    from: fromCity,
    to: toCity,
    adultPrice,
    halfFarePrice,
    travelTime,
  };
}

export function findNearestCity(lat: number, lng: number): string {
  let nearest = "Zurich";
  let minDist = Infinity;

  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = haversineDistance(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return nearest;
}
