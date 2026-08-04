import React, { useState } from 'react';
import { DailyWeather, TempUnit, WindUnit } from '../types/weather';
import { getWMOInterpretation } from '../utils/wmoCodes';
import { formatTemp, formatWind, formatTempVal } from '../utils/units';
import { WeatherIcon } from './WeatherIcon';
import { Calendar, ChevronDown, ChevronUp, CloudRain, Sun, Wind, Sunrise, Sunset, Umbrella } from 'lucide-react';

interface DailyForecastSectionProps {
  daily: DailyWeather;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

export const DailyForecastSection: React.FC<DailyForecastSectionProps> = ({ daily, tempUnit, windUnit }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!daily || !daily.time || daily.time.length === 0) {
    return null;
  }

  // Calculate 7-day min/max for visual range bar scaling
  const allMaxs = daily.temperature_2m_max || [];
  const allMins = daily.temperature_2m_min || [];
  const globalMinC = Math.min(...allMins);
  const globalMaxC = Math.max(...allMaxs);
  const tempRangeSpan = Math.max(1, globalMaxC - globalMinC);

  const toggleExpand = (idx: number) => {
    setExpandedDay((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">7-Day Outlook Spectrum</h3>
            <p className="text-xs font-mono text-slate-400">Expand daily node for granular metrics & solar windows</p>
          </div>
        </div>
      </div>

      {/* Daily Cards List */}
      <div className="space-y-2.5">
        {daily.time.map((timeStr, idx) => {
          const dateObj = new Date(timeStr);
          const isToday = idx === 0;
          const dayName = isToday
            ? 'Today'
            : dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

          const weatherCode = daily.weather_code?.[idx] ?? 0;
          const maxTempC = daily.temperature_2m_max?.[idx] ?? 20;
          const minTempC = daily.temperature_2m_min?.[idx] ?? 10;
          const precipProb = daily.precipitation_probability_max?.[idx] ?? 0;
          const precipSum = daily.precipitation_sum?.[idx] ?? 0;
          const uvMax = daily.uv_index_max?.[idx] ?? 0;
          const windMax = daily.wind_speed_10m_max?.[idx] ?? 0;
          const sunrise = daily.sunrise?.[idx];
          const sunset = daily.sunset?.[idx];

          const interp = getWMOInterpretation(weatherCode, 1);

          // Range Bar Calculation (%)
          const leftPercent = Math.max(0, Math.min(100, ((minTempC - globalMinC) / tempRangeSpan) * 100));
          const rightPercent = Math.max(0, Math.min(100, ((maxTempC - globalMinC) / tempRangeSpan) * 100));
          const barWidth = Math.max(5, rightPercent - leftPercent);

          const isExpanded = expandedDay === idx;

          return (
            <div
              key={timeStr}
              className={`rounded-xl border transition-all duration-300 overflow-hidden font-mono ${
                isExpanded
                  ? 'bg-slate-900 border-sky-500/60 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {/* Row Bar */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full text-left p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Day Name & Weather Icon */}
                <div className="flex items-center gap-3 w-full sm:w-52">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    <WeatherIcon name={interp.iconDay} size={22} color={interp.accentColor} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isToday ? 'text-sky-300' : 'text-slate-100'}`}>
                      {dayName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">{interp.label}</span>
                  </div>
                </div>

                {/* Precip Badge */}
                <div className="w-24 shrink-0">
                  {precipProb > 15 ? (
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 inline-flex items-center gap-1">
                      <CloudRain className="w-2.5 h-2.5" /> {precipProb}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 uppercase">Dry</span>
                  )}
                </div>

                {/* Min / Max Temp & Visual Bar */}
                <div className="flex items-center gap-3 w-full sm:w-64">
                  <span className="text-xs font-bold text-slate-400 w-10 text-right">
                    {formatTemp(minTempC, tempUnit)}
                  </span>

                  {/* Temperature Spectrum Bar */}
                  <div className="relative flex-1 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${barWidth}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-white w-10 text-left">
                    {formatTemp(maxTempC, tempUnit)}
                  </span>
                </div>

                {/* Expand Chevron */}
                <div className="text-slate-400 p-1 rounded-lg hover:bg-slate-800">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Detail Breakdown */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/90 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" /> Peak UV
                    </span>
                    <p className="text-xs font-bold text-white">{uvMax.toFixed(1)} / 12</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-teal-400" /> Max Wind
                    </span>
                    <p className="text-xs font-bold text-white">{formatWind(windMax, windUnit)}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-sky-400" /> Precip Vol
                    </span>
                    <p className="text-xs font-bold text-white">{precipSum} mm</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase flex items-center gap-1">
                      <Sunrise className="w-3.5 h-3.5 text-amber-400" /> Sun Window
                    </span>
                    <p className="text-xs font-bold text-white">
                      {sunrise ? sunrise.split('T')[1]?.substring(0, 5) : '--:--'} - {sunset ? sunset.split('T')[1]?.substring(0, 5) : '--:--'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
