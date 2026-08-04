import { TempUnit, WindUnit, PressureUnit } from '../types/weather';

export function formatTemp(celsius: number | undefined | null, unit: TempUnit = 'C'): string {
  if (celsius === undefined || celsius === null) return '--°';
  if (unit === 'F') {
    const fahrenheit = Math.round((celsius * 9) / 5 + 32);
    return `${fahrenheit}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempVal(celsius: number, unit: TempUnit = 'C'): number {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatWind(kmh: number | undefined | null, unit: WindUnit = 'kmh'): string {
  if (kmh === undefined || kmh === null) return '--';
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${(kmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatPressure(hPa: number | undefined | null, unit: PressureUnit = 'hPa'): string {
  if (hPa === undefined || hPa === null) return '--';
  if (unit === 'inHg') {
    return `${(hPa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
}

export function formatVisibility(meters: number | undefined | null): string {
  if (meters === undefined || meters === null) return '--';
  if (meters >= 10000) {
    return `${(meters / 1000).toFixed(0)} km (Clear)`;
  }
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function getWindDirectionLabel(deg: number | undefined | null): string {
  if (deg === undefined || deg === null) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export function getUVInfo(uvIndex: number) {
  if (uvIndex <= 2) {
    return {
      level: 'Low',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Minimal sun hazard. Safe to enjoy outdoors.',
      spf: 'Not strictly required',
      protectionTime: 'No limit',
    };
  }
  if (uvIndex <= 5) {
    return {
      level: 'Moderate',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Moderate risk. Wear sunglasses and SPF 30+ if staying out long.',
      spf: 'SPF 30+',
      protectionTime: '45 mins',
    };
  }
  if (uvIndex <= 7) {
    return {
      level: 'High',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      description: 'High protection required! Seek shade during mid-day hours.',
      spf: 'SPF 30 - 50',
      protectionTime: '25 mins',
    };
  }
  if (uvIndex <= 10) {
    return {
      level: 'Very High',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Very High hazard. Avoid direct sun from 10 AM to 4 PM.',
      spf: 'SPF 50+',
      protectionTime: '15 mins',
    };
  }
  return {
    level: 'Extreme',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Extreme danger! Unprotected skin can burn in minutes.',
    spf: 'SPF 50+ & Sun Hat',
    protectionTime: '10 mins',
  };
}

export function getAQIInfo(aqi: number) {
  if (aqi <= 50) {
    return {
      label: 'Good',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      desc: 'Air quality is satisfactory and poses little or no risk.',
    };
  }
  if (aqi <= 100) {
    return {
      label: 'Moderate',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      desc: 'Acceptable air quality. Sensitive individuals should take care.',
    };
  }
  if (aqi <= 150) {
    return {
      label: 'Unhealthy (Sensitive)',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      desc: 'Members of sensitive groups may experience health effects.',
    };
  }
  if (aqi <= 200) {
    return {
      label: 'Unhealthy',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      desc: 'Everyone may begin to experience health effects.',
    };
  }
  return {
    label: 'Very Unhealthy / Hazardous',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    desc: 'Health alert: risk of serious health effects for all.',
  };
}
