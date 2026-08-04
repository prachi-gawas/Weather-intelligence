import React, { useState } from 'react';
import { HourlyWeather, TempUnit, WindUnit } from '../types/weather';
import { getWMOInterpretation } from '../utils/wmoCodes';
import { formatTemp, formatWind, formatTempVal } from '../utils/units';
import { WeatherIcon } from './WeatherIcon';
import { Clock, TrendingUp, CloudRain, Sun, Wind, ChevronRight, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, LineChart, Line } from 'recharts';

interface HourlyForecastSectionProps {
  hourly: HourlyWeather;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

export const HourlyForecastSection: React.FC<HourlyForecastSectionProps> = ({ hourly, tempUnit, windUnit }) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain' | 'uv' | 'wind'>('temp');

  if (!hourly || !hourly.time || hourly.time.length === 0) {
    return null;
  }

  // Slice next 24 hours
  const next24Hours = hourly.time.slice(0, 24).map((timeStr, idx) => {
    const dateObj = new Date(timeStr);
    const hourLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isNow = idx === 0;

    const weatherCode = hourly.weather_code?.[idx] ?? 0;
    const tempC = hourly.temperature_2m?.[idx] ?? 20;
    const precipProb = hourly.precipitation_probability?.[idx] ?? 0;
    const precipAmount = hourly.precipitation?.[idx] ?? 0;
    const windSpeed = hourly.wind_speed_10m?.[idx] ?? 0;
    const uvIdx = hourly.uv_index?.[idx] ?? 0;

    const interp = getWMOInterpretation(weatherCode, dateObj.getHours() >= 6 && dateObj.getHours() <= 19 ? 1 : 0);

    return {
      index: idx,
      timeIso: timeStr,
      hourLabel: isNow ? 'Now' : hourLabel,
      temp: formatTempVal(tempC, tempUnit),
      tempRaw: tempC,
      weatherCode,
      interp,
      precipProb,
      precipAmount,
      windSpeed,
      uvIdx,
    };
  });

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header & View Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">24-Hour Timeline Spectrum</h3>
            <p className="text-xs font-mono text-slate-400">Hourly atmospheric metrics, trends & visual analytics</p>
          </div>
        </div>

        {/* Tab Controls for Recharts Chart */}
        <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 font-mono text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'temp' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> TEMP
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'rain' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> PRECIP %
          </button>
          <button
            onClick={() => setActiveTab('uv')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'uv' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> UV INDEX
          </button>
          <button
            onClick={() => setActiveTab('wind')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'wind' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> WIND
          </button>
        </div>
      </div>

      {/* 1. Horizontal Scrollable Cards */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
        {next24Hours.map((item) => (
          <div
            key={item.index}
            className={`flex-shrink-0 w-24 p-3.5 rounded-xl border text-center transition-all duration-300 font-mono flex flex-col items-center justify-between gap-2.5 ${
              item.index === 0
                ? 'bg-slate-800 border-sky-500/60 text-white shadow-md'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            <span className={`text-[11px] font-bold ${item.index === 0 ? 'text-sky-300' : 'text-slate-400'}`}>
              {item.hourLabel}
            </span>

            <div className="my-1">
              <WeatherIcon name={item.interp.iconDay} size={28} color={item.interp.accentColor} />
            </div>

            <span className="text-base font-bold font-display text-white">
              {item.temp}°{tempUnit}
            </span>

            {item.precipProb > 15 ? (
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center gap-0.5">
                <CloudRain className="w-2.5 h-2.5" /> {item.precipProb}%
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">{formatWind(item.windSpeed, windUnit).split(' ')[0]}</span>
            )}
          </div>
        ))}
      </div>

      {/* 2. Interactive Recharts Visualizer */}
      <div className="pt-2">
        <div className="h-64 w-full bg-slate-950 rounded-xl border border-slate-800 p-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'temp' ? (
              <AreaChart data={next24Hours}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit={`°${tempUnit}`} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  formatter={(val: number) => [`${val}°${tempUnit}`, 'Temperature']}
                />
                <Area type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGradient)" />
              </AreaChart>
            ) : activeTab === 'rain' ? (
              <BarChart data={next24Hours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  formatter={(val: number) => [`${val}%`, 'Rain Probability']}
                />
                <Bar dataKey="precipProb" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : activeTab === 'uv' ? (
              <AreaChart data={next24Hours}>
                <defs>
                  <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 12]} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  formatter={(val: number) => [val, 'UV Index']}
                />
                <Area type="monotone" dataKey="uvIdx" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#uvGradient)" />
              </AreaChart>
            ) : (
              <LineChart data={next24Hours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" km/h" fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  formatter={(val: number) => [`${val} km/h`, 'Wind Speed']}
                />
                <Line type="monotone" dataKey="windSpeed" stroke="#2dd4bf" strokeWidth={2.5} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
