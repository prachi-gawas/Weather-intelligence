export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string; // State / Province
  admin2?: string;
  country?: string;
  timezone?: string;
  population?: number;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  weather_code: number[];
  surface_pressure: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  uv_index: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current?: CurrentWeather;
  hourly_units: Record<string, string>;
  hourly?: HourlyWeather;
  daily_units: Record<string, string>;
  daily?: DailyWeather;
}

export interface AirQualityData {
  time: string;
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
  european_aqi: number;
  us_aqi: number;
}

export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  current?: AirQualityData;
}

export type TempUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'hPa' | 'inHg';

export interface UserPreferences {
  tempUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  favoriteCities: GeoLocation[];
}

export interface ActivityScore {
  id: string;
  name: string;
  category: 'sports' | 'outdoor' | 'travel' | 'lifestyle';
  score: number; // 0 - 100
  label: 'Ideal' | 'Good' | 'Moderate' | 'Poor' | 'Unfavorable';
  iconName: string;
  summary: string;
  tips: string[];
}

export interface WeatherRecommendation {
  outfit: {
    top: string;
    bottom: string;
    outerwear?: string;
    accessories: string[];
  };
  umbrellaNeeded: boolean;
  umbrellaProbability: number;
  uvAdvice: {
    level: string;
    spf: string;
    peakHour: string;
  };
  activities: ActivityScore[];
  drivingCondition: {
    status: 'Safe' | 'Caution' | 'Hazardous';
    reason: string;
  };
  stargazing: {
    score: number;
    description: string;
  };
}
