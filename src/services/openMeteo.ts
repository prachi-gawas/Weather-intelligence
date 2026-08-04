import { GeoLocation, ForecastResponse, AirQualityResponse } from '../types/weather';

export const POPULAR_CITIES: GeoLocation[] = [
  { id: 1, name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', country_code: 'JP', timezone: 'Asia/Tokyo' },
  { id: 2, name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', country_code: 'US', admin1: 'New York', timezone: 'America/New_York' },
  { id: 3, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London' },
  { id: 4, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', country_code: 'FR', timezone: 'Europe/Paris' },
  { id: 5, name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', country_code: 'AU', timezone: 'Australia/Sydney' },
  { id: 6, name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, country: 'United States', country_code: 'US', admin1: 'California', timezone: 'America/Los_Angeles' },
  { id: 7, name: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729, country: 'Brazil', country_code: 'BR', timezone: 'America/Sao_Paulo' },
  { id: 8, name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', country_code: 'IN', admin1: 'Maharashtra', timezone: 'Asia/Kolkata' },
  { id: 9, name: 'Reykjavik', latitude: 64.1466, longitude: -21.9426, country: 'Iceland', country_code: 'IS', timezone: 'Atlantic/Reykjavik' },
  { id: 10, name: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'Singapore', country_code: 'SG', timezone: 'Asia/Singapore' },
];

export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=10&language=en&format=json`
    );
    if (!response.ok) throw new Error('Geocoding search failed');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error in searchCities:', error);
    return [];
  }
}

export async function fetchWeatherForecast(lat: number, lng: number): Promise<ForecastResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo forecast request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchAirQuality(lat: number, lng: number): Promise<AirQualityResponse | null> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.warn('Air Quality API unavailable or failed:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    if (response.ok) {
      const data = await response.json();
      const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
      const country = data.address?.country || '';
      const country_code = data.address?.country_code?.toUpperCase() || '';
      return {
        id: Date.now(),
        name,
        latitude: lat,
        longitude: lng,
        country,
        country_code,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
  }
  return {
    id: Date.now(),
    name: 'Detected Location',
    latitude: lat,
    longitude: lng,
  };
}
