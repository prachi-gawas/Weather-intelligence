import React, { useState, useEffect, useCallback } from 'react';
import { GeoLocation, ForecastResponse, AirQualityData, UserPreferences } from './types/weather';
import { fetchWeatherForecast, fetchAirQuality, reverseGeocode, POPULAR_CITIES } from './services/openMeteo';
import { Header } from './components/Header';
import { CurrentWeatherHero } from './components/CurrentWeatherHero';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { HourlyForecastSection } from './components/HourlyForecastSection';
import { DailyForecastSection } from './components/DailyForecastSection';
import { ActivityPlannerSection } from './components/ActivityPlannerSection';
import { CityComparisonSection } from './components/CityComparisonSection';
import { AirQualityCard } from './components/AirQualityCard';
import { AlertCircle, RotateCw, Sparkles, Compass } from 'lucide-react';

const PREFS_STORAGE_KEY = 'weather_intel_preferences_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  tempUnit: 'C',
  windUnit: 'kmh',
  pressureUnit: 'hPa',
  favoriteCities: [POPULAR_CITIES[0], POPULAR_CITIES[1], POPULAR_CITIES[2]], // Tokyo, NYC, London
};

export default function App() {
  const [currentCity, setCurrentCity] = useState<GeoLocation>(POPULAR_CITIES[0]); // Tokyo default
  const [weatherData, setWeatherData] = useState<ForecastResponse | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isComparisonActive, setIsComparisonActive] = useState<boolean>(false);

  // Load preferences from localStorage
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse preferences from localStorage:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Save preferences when changed
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e);
    }
  }, [preferences]);

  const updatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  // Main weather loader
  const loadWeatherData = useCallback(async (city: GeoLocation) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [forecast, aq] = await Promise.all([
        fetchWeatherForecast(city.latitude, city.longitude),
        fetchAirQuality(city.latitude, city.longitude),
      ]);
      setWeatherData(forecast);
      setAirQualityData(aq?.current || null);
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
      setErrorMsg('Unable to retrieve weather data from Open-Meteo. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch weather on city change
  useEffect(() => {
    loadWeatherData(currentCity);
  }, [currentCity, loadWeatherData]);

  // Initial Geolocation Auto-Detection on boot
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const detectedLocation = await reverseGeocode(latitude, longitude);
            setCurrentCity(detectedLocation);
          } catch (e) {
            console.warn('Auto location reverse geocode failed:', e);
          }
        },
        (err) => {
          console.info('User declined GPS or position unavailable, using default city:', err.message);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Handler for GPS button
  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const detected = await reverseGeocode(latitude, longitude);
          setCurrentCity(detected);
        } catch (e) {
          console.error('Failed reverse geocoding:', e);
          setCurrentCity({
            id: Date.now(),
            name: 'Current Location',
            latitude,
            longitude,
          });
        }
      },
      (err) => {
        setIsLoading(false);
        alert(`Location permission failed: ${err.message}`);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased bg-grid-pattern selection:bg-sky-500 selection:text-white relative">
      {/* Background Accent Geometry Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <Header
        currentCity={currentCity}
        onSelectCity={(city) => setCurrentCity(city)}
        onUseLocation={handleUseLocation}
        isLoading={isLoading}
        onRefresh={() => loadWeatherData(currentCity)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        isComparisonActive={isComparisonActive}
        onToggleComparison={() => setIsComparisonActive((prev) => !prev)}
      />

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => loadWeatherData(currentCity)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-semibold text-xs border border-rose-500/40 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !weatherData && (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 rounded-2xl bg-slate-900/90 border border-slate-800" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-36 rounded-xl bg-slate-900/90 border border-slate-800" />
              <div className="h-36 rounded-xl bg-slate-900/90 border border-slate-800" />
              <div className="h-36 rounded-xl bg-slate-900/90 border border-slate-800" />
            </div>
          </div>
        )}

        {/* Dual City Comparison Modal / Banner */}
        {isComparisonActive && weatherData && (
          <CityComparisonSection
            city1={currentCity}
            weather1={weatherData}
            tempUnit={preferences.tempUnit}
            windUnit={preferences.windUnit}
            onClose={() => setIsComparisonActive(false)}
          />
        )}

        {/* Current Weather Display */}
        {weatherData && weatherData.current && (
          <>
            {/* Hero Current Condition */}
            <CurrentWeatherHero
              current={weatherData.current}
              city={currentCity}
              daily={weatherData.daily}
              airQuality={airQualityData || undefined}
              tempUnit={preferences.tempUnit}
              windUnit={preferences.windUnit}
              onRefresh={() => loadWeatherData(currentCity)}
              isLoading={isLoading}
            />

            {/* Weather Metrics Grid */}
            <WeatherMetricsGrid
              current={weatherData.current}
              daily={weatherData.daily}
              tempUnit={preferences.tempUnit}
              windUnit={preferences.windUnit}
              pressureUnit={preferences.pressureUnit}
            />

            {/* Smart Activity & Planning Recommendations */}
            <ActivityPlannerSection
              current={weatherData.current}
              hourly={weatherData.hourly}
              daily={weatherData.daily}
              tempUnit={preferences.tempUnit}
            />

            {/* 24-Hour Timeline & Charts */}
            {weatherData.hourly && (
              <HourlyForecastSection
                hourly={weatherData.hourly}
                tempUnit={preferences.tempUnit}
                windUnit={preferences.windUnit}
              />
            )}

            {/* 7-Day Extended Outlook */}
            {weatherData.daily && (
              <DailyForecastSection
                daily={weatherData.daily}
                tempUnit={preferences.tempUnit}
                windUnit={preferences.windUnit}
              />
            )}

            {/* Air Quality Card */}
            {airQualityData && <AirQualityCard airQuality={airQualityData} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold font-display text-slate-200 tracking-wider">WEATHER INTEL</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">GEOMETRIC BALANCE ENGINE</span>
          </div>
          <p className="text-slate-500">Open-Meteo High Resolution Forecast Data</p>
        </div>
      </footer>
    </div>
  );
}
