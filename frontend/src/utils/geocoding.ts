/**
 * Location and Geocoding Utility for MessMap
 * File: frontend/src/utils/geocoding.ts
 *
 * Provides synchronized location state handling, forward and reverse geocoding
 * using OpenStreetMap Nominatim with an offline campus directory fallback.
 * Strictly free and open-source (no API keys, no paid services).
 */

export interface LocationData {
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

// Verified geographic coordinates for Pune university & college campus zones
export const KNOWN_CAMPUS_LOCATIONS: Record<string, { lat: number; lng: number; area: string; pincode: string }> = {
  'fergusson college': { lat: 18.5236, lng: 73.8418, area: 'Shivajinagar', pincode: '411004' },
  'fc road': { lat: 18.5236, lng: 73.8418, area: 'Shivajinagar', pincode: '411004' },
  'shivajinagar': { lat: 18.5308, lng: 73.8567, area: 'Shivajinagar', pincode: '411005' },
  'shivaji nagar': { lat: 18.5308, lng: 73.8567, area: 'Shivajinagar', pincode: '411005' },
  'coep': { lat: 18.5298, lng: 73.8565, area: 'Shivajinagar', pincode: '411005' },
  'kothrud': { lat: 18.5074, lng: 73.8077, area: 'Kothrud', pincode: '411038' },
  'mit wpu': { lat: 18.5186, lng: 73.8152, area: 'Kothrud', pincode: '411038' },
  'mit-wpu': { lat: 18.5186, lng: 73.8152, area: 'Kothrud', pincode: '411038' },
  'katraj': { lat: 18.4482, lng: 73.8584, area: 'Katraj', pincode: '411046' },
  'bharati vidyapeeth': { lat: 18.4482, lng: 73.8584, area: 'Katraj', pincode: '411046' },
  'viman nagar': { lat: 18.5679, lng: 73.9143, area: 'Viman Nagar', pincode: '411014' },
  'symbiosis': { lat: 18.5679, lng: 73.9143, area: 'Viman Nagar', pincode: '411014' },
  'karve nagar': { lat: 18.4912, lng: 73.8197, area: 'Karve Nagar', pincode: '411052' },
  'cummin college': { lat: 18.4912, lng: 73.8197, area: 'Karve Nagar', pincode: '411052' },
  'deccan': { lat: 18.5167, lng: 73.8417, area: 'Deccan', pincode: '411004' },
  'deccan gymkhana': { lat: 18.5167, lng: 73.8417, area: 'Deccan', pincode: '411004' },
  'law college road': { lat: 18.5150, lng: 73.8310, area: 'Erandwane', pincode: '411004' },
  'model colony': { lat: 18.5350, lng: 73.8380, area: 'Model Colony', pincode: '411016' },
  'senapati bapat road': { lat: 18.5320, lng: 73.8290, area: 'SB Road', pincode: '411016' },
  'sb road': { lat: 18.5320, lng: 73.8290, area: 'SB Road', pincode: '411016' },
  'aundh': { lat: 18.5590, lng: 73.8070, area: 'Aundh', pincode: '411007' },
  'baner': { lat: 18.5597, lng: 73.7799, area: 'Baner', pincode: '411045' },
  'hinjewadi': { lat: 18.5913, lng: 73.7389, area: 'Hinjewadi', pincode: '411057' },
  'hadapsar': { lat: 18.5089, lng: 73.9259, area: 'Hadapsar', pincode: '411028' },
  'camp': { lat: 18.5140, lng: 73.8780, area: 'Camp', pincode: '411001' },
  'mg road': { lat: 18.5140, lng: 73.8780, area: 'Camp', pincode: '411001' },
  'swargate': { lat: 18.5018, lng: 73.8580, area: 'Swargate', pincode: '411042' },
  'wagholi': { lat: 18.5800, lng: 73.9800, area: 'Wagholi', pincode: '412207' },
  'wakad': { lat: 18.5987, lng: 73.7667, area: 'Wakad', pincode: '411057' },
  'pashan': { lat: 18.5410, lng: 73.7920, area: 'Pashan', pincode: '411008' },
};

export const POPULAR_PUNE_AREAS = [
  'Shivajinagar',
  'FC Road',
  'Fergusson College Road',
  'COEP Area',
  'Kothrud',
  'Katraj',
  'Bharati Vidyapeeth',
  'Viman Nagar',
  'Symbiosis Campus',
  'Karve Nagar',
  'Deccan Gymkhana',
  'Law College Road',
  'Model Colony',
  'SB Road',
  'Aundh',
  'Baner',
  'Hinjewadi Phase 1',
  'Hadapsar',
  'Camp',
  'Swargate',
];

/**
 * Validate latitude and longitude values.
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90.0 &&
    lat <= 90.0 &&
    lng >= -180.0 &&
    lng <= 180.0
  );
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  area?: string;
  city?: string;
  pincode?: string;
}

/**
 * Geocode text address/locality to Latitude and Longitude.
 * Accepts address, optional area, and optional city.
 * Attempts Nominatim OpenStreetMap with timeout, falling back to known campus directory and city center.
 */
export async function geocodeAddress(
  address: string,
  area?: string,
  city: string = 'Pune'
): Promise<GeocodeResult | null> {
  const query = [address, area].filter(Boolean).join(' ').trim().toLowerCase();
  if (!query) return null;

  // 1. Check offline known campus directory first for instant response
  for (const [key, loc] of Object.entries(KNOWN_CAMPUS_LOCATIONS)) {
    if (query.includes(key)) {
      return {
        latitude: loc.lat,
        longitude: loc.lng,
        lat: loc.lat,
        lng: loc.lng,
        area: loc.area,
        city: 'Pune',
        pincode: loc.pincode,
      };
    }
  }

  // 2. Query OpenStreetMap Nominatim
  try {
    const fullSearch = `${[address, area, city].filter(Boolean).join(', ')}, Maharashtra, India`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullSearch)}&limit=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MessMap-StudentDiningApp/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);
        if (isValidCoordinates(lat, lng)) {
          return {
            latitude: lat,
            longitude: lng,
            lat,
            lng,
            city,
          };
        }
      }
    }
  } catch {
    // Network or timeout, fallback gracefully
  }

  // 3. Fallback to default Pune city center coordinates if inside Pune
  if (city.toLowerCase().includes('pune')) {
    return {
      latitude: 18.5204,
      longitude: 73.8567,
      lat: 18.5204,
      lng: 73.8567,
      area: 'Central Pune',
      city: 'Pune',
      pincode: '411001',
    };
  }

  return null;
}

/**
 * Reverse geocode Latitude and Longitude to address, area name, and postal code.
 * Strictly uses the exact selected coordinates without inferring from city defaults.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ address?: string; area?: string; city?: string; pincode?: string } | null> {
  if (!isValidCoordinates(lat, lng)) return null;

  // 1. Primary: query OpenStreetMap Nominatim with the exact coordinates
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MessMap-StudentDiningApp/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.city_district ||
          addr.subdivision ||
          addr.commercial ||
          addr.industrial ||
          addr.road ||
          addr.village ||
          addr.hamlet ||
          addr.district ||
          undefined;
        const city = addr.city || addr.town || addr.municipality || addr.county || 'Pune';
        const pincode = addr.postcode ? String(addr.postcode).trim() : undefined;
        return {
          address: data.display_name?.split(',').slice(0, 3).join(', ') || area,
          area,
          city,
          pincode,
        };
      }
    }
  } catch {
    // Network or timeout, fallback to known campus proximity if within very close range
  }

  // 2. Offline fallback: check verified known locations within tight proximity (< 400m)
  for (const [, loc] of Object.entries(KNOWN_CAMPUS_LOCATIONS)) {
    const dLat = Math.abs(loc.lat - lat);
    const dLng = Math.abs(loc.lng - lng);
    if (dLat < 0.004 && dLng < 0.004) {
      return {
        area: loc.area,
        city: 'Pune',
        pincode: loc.pincode,
      };
    }
  }

  return null;
}

/**
 * Calculate the great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns distance in kilometers, or NaN if coordinates are invalid.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinates(lat1, lon1) || !isValidCoordinates(lat2, lon2)) {
    return NaN;
  }
  const EARTH_RADIUS_KM = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Format distance in kilometers into a human-friendly string (e.g. "450 m away" or "1.8 km away").
 */
export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm == null || isNaN(distanceKm)) {
    return '';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
