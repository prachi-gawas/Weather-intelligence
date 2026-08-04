import React, { useState } from 'react';
import { CurrentWeather, HourlyWeather, DailyWeather, TempUnit } from '../types/weather';
import { generatePlanningRecommendations } from '../utils/planner';
import { formatTemp } from '../utils/units';
import {
  Sparkles,
  Shirt,
  Umbrella,
  Sun,
  Car,
  Footprints,
  Bike,
  Trees,
  Waves,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface ActivityPlannerSectionProps {
  current?: CurrentWeather;
  hourly?: HourlyWeather;
  daily?: DailyWeather;
  tempUnit: TempUnit;
}

export const ActivityPlannerSection: React.FC<ActivityPlannerSectionProps> = ({
  current,
  hourly,
  daily,
  tempUnit,
}) => {
  const recommendations = generatePlanningRecommendations(current, hourly, daily);

  // Custom Event Time Evaluation State
  const [selectedActivity, setSelectedActivity] = useState<string>('running');
  const [startHour, setStartHour] = useState<number>(14); // 2 PM default
  const [duration, setDuration] = useState<number>(2); // 2 hours

  // Helper to map icon name to Lucide
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-sky-400" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-teal-400" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'Waves':
        return <Waves className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Evaluate Custom Hour Slot
  const evaluateCustomSlot = () => {
    if (!hourly || !hourly.time || hourly.time.length === 0) {
      return { status: 'Caution', reason: 'Insufficient hourly forecast data' };
    }

    const endHour = Math.min(23, startHour + duration);
    const targetHours = hourly.precipitation_probability?.slice(startHour, endHour + 1) || [];
    const targetTemps = hourly.temperature_2m?.slice(startHour, endHour + 1) || [];
    const targetWinds = hourly.wind_speed_10m?.slice(startHour, endHour + 1) || [];

    const maxRainProb = targetHours.length > 0 ? Math.max(...targetHours) : 0;
    const avgTemp = targetTemps.length > 0 ? targetTemps.reduce((a, b) => a + b, 0) / targetTemps.length : 20;
    const maxWind = targetWinds.length > 0 ? Math.max(...targetWinds) : 0;

    if (maxRainProb > 50) {
      return {
        status: 'No-Go',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        icon: <XCircle className="w-5 h-5 text-rose-400" />,
        reason: `High rain risk (${maxRainProb}%) during ${startHour}:00 - ${endHour}:00.`,
      };
    }
    if (maxWind > 35 || avgTemp < 5 || avgTemp > 35) {
      return {
        status: 'Caution',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        reason: `Challenging weather (${Math.round(maxWind)} km/h winds, ${formatTemp(avgTemp, tempUnit)}).`,
      };
    }
    return {
      status: 'Ideal Window',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      reason: `Favorable conditions (${formatTemp(avgTemp, tempUnit)}, rain chance ${maxRainProb}%).`,
    };
  };

  const slotVerdict = evaluateCustomSlot();

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">Smart Weather Recommendations</h3>
            <p className="text-xs font-mono text-slate-400">Automated outfit, activity scores & safety guidance</p>
          </div>
        </div>
      </div>

      {/* Top Cards Grid: Outfit & Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Outfit Planner Card */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Shirt className="w-4 h-4" /> Daily Outfit Advisor
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium text-[10px] uppercase">Top & Upper:</span>
                <span className="text-slate-100 font-semibold">{recommendations.outfit.top}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium text-[10px] uppercase">Bottom:</span>
                <span className="text-slate-100 font-semibold">{recommendations.outfit.bottom}</span>
              </div>

              {recommendations.outfit.outerwear && (
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-indigo-300 block font-medium text-[10px] uppercase">Outerwear:</span>
                  <span className="text-indigo-100 font-semibold">{recommendations.outfit.outerwear}</span>
                </div>
              )}
            </div>
          </div>

          {recommendations.outfit.accessories.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase">Recommended Accessories:</span>
              <div className="flex flex-wrap gap-1">
                {recommendations.outfit.accessories.map((acc) => (
                  <span key={acc} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Umbrella & Rain Alert */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Umbrella className="w-4 h-4" /> Rain & Umbrella Radar
            </div>

            <div className="my-2">
              <span className="text-2xl font-bold font-display text-white">{recommendations.umbrellaProbability}%</span>
              <span className="text-xs text-slate-400 ml-1.5">Peak prob next 12h</span>
            </div>

            <div
              className={`p-3 rounded-lg border text-xs mt-3 ${
                recommendations.umbrellaNeeded
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                {recommendations.umbrellaNeeded ? (
                  <>
                    <Umbrella className="w-4 h-4 text-sky-400" /> Carry an Umbrella
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Umbrella Needed
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90 font-sans">
                {recommendations.umbrellaNeeded
                  ? 'Rain expected in your region. Keep an umbrella or raincoat handy.'
                  : 'Low probability of rain for the upcoming hours.'}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Driving Safety:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                recommendations.drivingCondition.status === 'Safe'
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                  : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
              }`}
            >
              {recommendations.drivingCondition.status}
            </span>
          </div>
        </div>

        {/* UV Protection & Sun Advisor */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sun className="w-4 h-4" /> Sun & UV Protection
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-medium text-[10px] uppercase">UV Level:</span>
                <span className="text-amber-300 font-bold">{recommendations.uvAdvice.level}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-medium text-[10px] uppercase">SPF Guard:</span>
                <span className="text-white font-bold">{recommendations.uvAdvice.spf}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-medium text-[10px] uppercase">Peak UV Time:</span>
                <span className="text-slate-200 font-bold">{recommendations.uvAdvice.peakHour}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
            Apply sunscreen 15 minutes before stepping outside.
          </p>
        </div>
      </div>

      {/* Outdoor Activity Scores Grid */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Footprints className="w-4 h-4 text-sky-400" /> Outdoor Activity Scoreboard
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 font-mono"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getActivityIcon(act.iconName)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 font-sans">{act.name}</span>
                    <p className="text-[10px] text-slate-400">{act.summary}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold font-display text-white block">{act.score}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      act.score >= 80
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : act.score >= 50
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {act.label}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    act.score >= 80
                      ? 'bg-emerald-500'
                      : act.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${act.score}%` }}
                />
              </div>

              {/* Tips */}
              <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 font-sans">
                💡 {act.tips[0]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Hour Activity Planner Tool */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Custom Time Slot Event Planner</h4>
        </div>

        <p className="text-xs text-slate-400 mb-4 font-sans">
          Select a time window today to get an instant weather verdict for your outdoor plans.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Start Hour:</span>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {i < 10 ? `0${i}` : i}:00
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Duration:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={3}>3 Hours</option>
              <option value={4}>4 Hours</option>
            </select>
          </div>

          {/* Verdict Banner */}
          <div className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${slotVerdict.badge}`}>
            {slotVerdict.icon}
            <div>
              <span className="block font-bold font-mono">{slotVerdict.status}</span>
              <span className="text-[10px] opacity-90 font-normal font-sans">{slotVerdict.reason}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
