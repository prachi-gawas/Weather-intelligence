import React from 'react';
import { AirQualityData } from '../types/weather';
import { getAQIInfo } from '../utils/units';
import { Activity, ShieldCheck, Info } from 'lucide-react';

interface AirQualityCardProps {
  airQuality?: AirQualityData;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  if (!airQuality) return null;

  const aqiInfo = getAQIInfo(airQuality.us_aqi);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">Air Quality & Pollution Spectrum</h3>
            <p className="text-xs text-slate-400">Atmospheric particle concentrations & health Index</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border uppercase tracking-wider ${aqiInfo.color}`}>
          US AQI {airQuality.us_aqi} • {aqiInfo.label}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-sans">
        💡 {aqiInfo.desc}
      </p>

      {/* Pollutant Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">PM2.5 (Fine Dust)</span>
          <p className="text-base font-bold font-display text-white">{airQuality.pm2_5} μg/m³</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">PM10 (Coarse Dust)</span>
          <p className="text-base font-bold font-display text-white">{airQuality.pm10} μg/m³</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Ozone (O₃)</span>
          <p className="text-base font-bold font-display text-white">{airQuality.ozone} μg/m³</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Nitrogen Dioxide (NO₂)</span>
          <p className="text-base font-bold font-display text-white">{airQuality.nitrogen_dioxide} μg/m³</p>
        </div>
      </div>
    </div>
  );
};
