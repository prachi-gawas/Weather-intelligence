import React from 'react';
import { MapPin, Thermometer, Wind, Droplets, Sun, ShieldCheck, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { CurrentWeather, GeoLocation, TempUnit, WindUnit, DailyWeather, AirQualityData } from '../types/weather';
import { getWMOInterpretation } from '../utils/wmoCodes';
import { formatTemp, formatWind, getAQIInfo } from '../utils/units';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherHeroProps {
  current: CurrentWeather;
  city: GeoLocation;
  daily?: DailyWeather;
  airQuality?: AirQualityData;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CurrentWeatherHero: React.FC<CurrentWeatherHeroProps> = ({
  current,
  city,
  daily,
  airQuality,
  tempUnit,
  windUnit,
}) => {
  const interp = getWMOInterpretation(current.weather_code, current.is_day);

  const todayHigh = daily?.temperature_2m_max?.[0];
  const todayLow = daily?.temperature_2m_min?.[0];

  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const aqiInfo = airQuality ? getAQIInfo(airQuality.us_aqi) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Decorative ambient geometric grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* Ambient color accent corner */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: interp.accentColor }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Side: Location Info, Condition, Main Temp */}
        <div className="space-y-5 max-w-xl">
          {/* Top Geometric Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 font-mono">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              {city.name}
              {city.country && <span className="text-slate-400">, {city.country}</span>}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700/60 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate} • {formattedTime}
            </span>

            {aqiInfo && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border font-mono ${aqiInfo.color}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                AQI {airQuality?.us_aqi} ({aqiInfo.label})
              </span>
            )}
          </div>

          {/* Temperature & Large Icon Display */}
          <div className="flex items-center gap-5 sm:gap-8">
            <div className="flex items-start">
              <span className="text-6xl sm:text-7xl font-extrabold font-display tracking-tight text-white drop-shadow-sm">
                {formatTemp(current.temperature_2m, tempUnit)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md flex items-center justify-center shrink-0">
              <WeatherIcon name={interp.iconDay} size={56} color={interp.accentColor} />
            </div>
          </div>

          {/* Weather Description & High/Low */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold font-display text-slate-100">{interp.label}</h2>
              {current.is_day === 0 && (
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Night</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{interp.description}</p>

            <div className="flex items-center gap-5 pt-2 text-xs text-slate-300 font-mono">
              <span>
                Feels like{' '}
                <strong className="text-white font-semibold">{formatTemp(current.apparent_temperature, tempUnit)}</strong>
              </span>
              {todayHigh !== undefined && todayLow !== undefined && (
                <span>
                  High:{' '}
                  <strong className="text-amber-300 font-semibold">{formatTemp(todayHigh, tempUnit)}</strong> / Low:{' '}
                  <strong className="text-sky-300 font-semibold">{formatTemp(todayLow, tempUnit)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Snapshot Metrics Grid */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md hover:border-slate-600 transition">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>Wind</span>
            </div>
            <p className="text-lg font-bold font-display text-white">{formatWind(current.wind_speed_10m, windUnit)}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Gusts: {formatWind(current.wind_gusts_10m, windUnit)}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md hover:border-slate-600 transition">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Humidity</span>
            </div>
            <p className="text-lg font-bold font-display text-white">{current.relative_humidity_2m}%</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Precip: {current.precipitation} mm</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md hover:border-slate-600 transition col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Clouds</span>
            </div>
            <p className="text-lg font-bold font-display text-white">{current.cloud_cover}%</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              {current.cloud_cover < 20 ? 'Clear Sky' : current.cloud_cover < 70 ? 'Partly Cloudy' : 'Overcast'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
