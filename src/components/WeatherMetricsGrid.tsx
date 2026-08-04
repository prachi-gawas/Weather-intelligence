import React from 'react';
import { Compass, Droplet, Sun, Gauge, Eye, Sunrise, Sunset, Wind, AlertCircle } from 'lucide-react';
import { CurrentWeather, DailyWeather, TempUnit, WindUnit, PressureUnit } from '../types/weather';
import { formatWind, formatPressure, formatVisibility, getWindDirectionLabel, getUVInfo, formatTemp } from '../utils/units';

interface WeatherMetricsGridProps {
  current: CurrentWeather;
  daily?: DailyWeather;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  current,
  daily,
  tempUnit,
  windUnit,
  pressureUnit,
}) => {
  const windDirLabel = getWindDirectionLabel(current.wind_direction_10m);
  const uvMaxToday = daily?.uv_index_max?.[0] ?? 0;
  const uvInfo = getUVInfo(uvMaxToday);

  // Sunrise / Sunset calculation
  const sunriseRaw = daily?.sunrise?.[0];
  const sunsetRaw = daily?.sunset?.[0];

  const formatTimeOnly = (isoStr?: string) => {
    if (!isoStr) return '--:--';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr.split('T')[1]?.substring(0, 5) || isoStr;
    }
  };

  const sunriseFormatted = formatTimeOnly(sunriseRaw);
  const sunsetFormatted = formatTimeOnly(sunsetRaw);

  // Dew point approximation if missing: T - ((100 - RH)/5)
  const estimatedDewPoint = current.temperature_2m - (100 - current.relative_humidity_2m) / 5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Wind & Gust Direction Compass */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-sky-400" /> Wind Vectors
          </span>
          <span className="text-sky-400 font-mono">{windDirLabel} ({current.wind_direction_10m}°)</span>
        </div>

        <div className="my-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold font-display text-white">{formatWind(current.wind_speed_10m, windUnit)}</div>
            <p className="text-xs text-slate-400 mt-1">
              Max Gusts: <span className="text-slate-200 font-semibold font-mono">{formatWind(current.wind_gusts_10m, windUnit)}</span>
            </p>
          </div>

          {/* Compass Graphic */}
          <div className="relative w-16 h-16 rounded-full border border-slate-700/80 flex items-center justify-center bg-slate-950/80 shadow-inner">
            <span className="absolute top-0.5 text-[9px] text-slate-500 font-mono">N</span>
            <span className="absolute bottom-0.5 text-[9px] text-slate-500 font-mono">S</span>
            <span className="absolute left-1 text-[9px] text-slate-500 font-mono">W</span>
            <span className="absolute right-1 text-[9px] text-slate-500 font-mono">E</span>

            {/* Pointer Needle */}
            <div
              className="w-1 h-10 bg-gradient-to-t from-sky-500 to-rose-500 rounded-full transition-transform duration-700 origin-center"
              style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 font-mono">
          Orientation: {windDirLabel} ({current.wind_direction_10m}° compass angle)
        </p>
      </div>

      {/* 2. Humidity & Dew Point */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-blue-400" /> Relative Humidity
          </span>
          <span className="text-blue-400 font-mono">{current.relative_humidity_2m}%</span>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold font-display text-white">{current.relative_humidity_2m}% RH</div>
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 mt-2.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, current.relative_humidity_2m)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-300 border-t border-slate-800/80 pt-2.5 flex items-center justify-between font-mono">
          <span className="text-slate-400">Dew Point:</span>
          <strong className="text-white font-semibold">{formatTemp(estimatedDewPoint, tempUnit)}</strong>
        </div>
      </div>

      {/* 3. UV Index Gauge */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" /> Solar Radiation
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${uvInfo.color}`}>
            {uvInfo.level}
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{uvMaxToday.toFixed(1)}</span>
            <span className="text-xs font-mono text-slate-400">/ 12 Peak Index</span>
          </div>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{uvInfo.description}</p>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 flex items-center justify-between font-mono">
          <span>Protection Standard:</span>
          <span className="text-amber-300 font-semibold">{uvInfo.spf}</span>
        </div>
      </div>

      {/* 4. Atmospheric Pressure */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-teal-400" /> Barometric Pressure
          </span>
          <span className="text-teal-400 font-mono">{current.pressure_msl} hPa</span>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold font-display text-white">{formatPressure(current.pressure_msl, pressureUnit)}</div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Surface: {formatPressure(current.surface_pressure, pressureUnit)}
          </p>
        </div>

        <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 font-mono">
          {current.pressure_msl >= 1013 ? 'High Pressure System (Stable)' : 'Low Pressure System (Dynamic)'}
        </p>
      </div>

      {/* 5. Visibility & Cloudiness */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" /> Visibility Distance
          </span>
          <span className="text-emerald-400 font-mono">10 km max</span>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold font-display text-white">{formatVisibility(10000)}</div>
          <p className="text-xs font-mono text-slate-400 mt-1">Cloud Density: {current.cloud_cover}%</p>
        </div>

        <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 font-mono">
          Clear visual optics for air & ground transit.
        </p>
      </div>

      {/* 6. Sunrise & Sunset */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-400" /> Solar Cycle
          </span>
          <span className="text-amber-400 font-mono">SUN ORBIT</span>
        </div>

        <div className="my-3 flex items-center justify-around text-center">
          <div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-block mb-1">
              <Sunrise className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Sunrise</p>
            <p className="text-sm font-bold font-mono text-white mt-0.5">{sunriseFormatted}</p>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 inline-block mb-1">
              <Sunset className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Sunset</p>
            <p className="text-sm font-bold font-mono text-white mt-0.5">{sunsetFormatted}</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 text-center font-mono">
          {current.is_day ? 'Daylight Cycle Active' : 'Nocturnal Cycle Active'}
        </p>
      </div>
    </div>
  );
};
