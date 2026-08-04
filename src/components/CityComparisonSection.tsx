import React, { useState, useEffect } from 'react';
import { GeoLocation, ForecastResponse, TempUnit, WindUnit } from '../types/weather';
import { fetchWeatherForecast, searchCities, POPULAR_CITIES } from '../services/openMeteo';
import { getWMOInterpretation } from '../utils/wmoCodes';
import { formatTemp, formatWind } from '../utils/units';
import { WeatherIcon } from './WeatherIcon';
import { Layers, Search, X, RotateCw, ArrowRightLeft, Sparkles } from 'lucide-react';

interface CityComparisonSectionProps {
  city1: GeoLocation;
  weather1: ForecastResponse;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  onClose: () => void;
}

export const CityComparisonSection: React.FC<CityComparisonSectionProps> = ({
  city1,
  weather1,
  tempUnit,
  windUnit,
  onClose,
}) => {
  const [city2, setCity2] = useState<GeoLocation>(POPULAR_CITIES[1]); // Default New York or London
  const [weather2, setWeather2] = useState<ForecastResponse | null>(null);
  const [isLoading2, setIsLoading2] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch city 2 weather
  useEffect(() => {
    let isMounted = true;
    async function loadCity2() {
      setIsLoading2(true);
      try {
        const data = await fetchWeatherForecast(city2.latitude, city2.longitude);
        if (isMounted) setWeather2(data);
      } catch (e) {
        console.error('Failed to load comparison city weather:', e);
      } finally {
        if (isMounted) setIsLoading2(false);
      }
    }
    loadCity2();
    return () => {
      isMounted = false;
    };
  }, [city2]);

  // Handle city 2 search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const curr1 = weather1.current;
  const curr2 = weather2?.current;

  const interp1 = curr1 ? getWMOInterpretation(curr1.weather_code, curr1.is_day) : null;
  const interp2 = curr2 ? getWMOInterpretation(curr2.weather_code, curr2.is_day) : null;

  // Temperature Difference
  const tempDiff =
    curr1?.temperature_2m !== undefined && curr2?.temperature_2m !== undefined
      ? Math.round((curr1.temperature_2m - curr2.temperature_2m) * 10) / 10
      : null;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">Dual Location Comparison Matrix</h3>
            <p className="text-xs font-mono text-slate-400">Side-by-side atmospheric telemetry & thermal delta analysis</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City 1 Card */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">Node 01 · Primary</span>
              <h4 className="text-xl font-bold font-display text-white">{city1.name}</h4>
              <p className="text-xs text-slate-400 font-sans">{city1.country}</p>
            </div>
            {interp1 && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <WeatherIcon name={interp1.iconDay} size={36} color={interp1.accentColor} />
              </div>
            )}
          </div>

          {curr1 && (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-display text-white">
                  {formatTemp(curr1.temperature_2m, tempUnit)}
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  Feels like {formatTemp(curr1.apparent_temperature, tempUnit)}
                </span>
              </div>

              <p className="text-xs font-bold text-sky-300 font-sans">{interp1?.label}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Humidity:</span>
                  <strong className="text-white font-bold">{curr1.relative_humidity_2m}%</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Wind:</span>
                  <strong className="text-white font-bold">{formatWind(curr1.wind_speed_10m, windUnit)}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Cloud Cover:</span>
                  <strong className="text-white font-bold">{curr1.cloud_cover}%</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Pressure:</span>
                  <strong className="text-white font-bold">{curr1.pressure_msl} hPa</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* City 2 Card + Search Controls */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">Node 02 · Comparative</span>
              <h4 className="text-xl font-bold font-display text-white">{city2.name}</h4>
              <p className="text-xs text-slate-400 font-sans">{city2.country}</p>
            </div>

            {/* City 2 Search input */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Change city..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
              />
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-800 font-mono">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setCity2(res);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full text-left p-2 hover:bg-slate-800 text-xs text-slate-200 block"
                    >
                      {res.name}, {res.country}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isLoading2 ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
              <RotateCw className="w-4 h-4 animate-spin text-purple-400" /> Fetching node metrics...
            </div>
          ) : curr2 ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-display text-white">
                  {formatTemp(curr2.temperature_2m, tempUnit)}
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  Feels like {formatTemp(curr2.apparent_temperature, tempUnit)}
                </span>
              </div>

              <p className="text-xs font-bold text-purple-300 font-sans">{interp2?.label}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Humidity:</span>
                  <strong className="text-white font-bold">{curr2.relative_humidity_2m}%</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Wind:</span>
                  <strong className="text-white font-bold">{formatWind(curr2.wind_speed_10m, windUnit)}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Cloud Cover:</span>
                  <strong className="text-white font-bold">{curr2.cloud_cover}%</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Pressure:</span>
                  <strong className="text-white font-bold">{curr2.pressure_msl} hPa</strong>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Summary Delta Banner */}
      {tempDiff !== null && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold uppercase text-slate-400 text-[10px]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            DELTA MATRIX ANALYSIS:
          </span>
          <span className="font-bold text-white">
            {city1.name} is {tempDiff > 0 ? `+${tempDiff}°C warmer` : tempDiff < 0 ? `${tempDiff}°C cooler` : 'identical in temperature'} than {city2.name}.
          </span>
        </div>
      )}
    </div>
  );
};
