import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, RotateCw, Heart, Layers, Sparkles, X, Check, Globe } from 'lucide-react';
import { GeoLocation, TempUnit, WindUnit, UserPreferences } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/openMeteo';

interface HeaderProps {
  currentCity: GeoLocation | null;
  onSelectCity: (city: GeoLocation) => void;
  onUseLocation: () => void;
  isLoading: boolean;
  onRefresh: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  isComparisonActive: boolean;
  onToggleComparison: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectCity,
  onUseLocation,
  isLoading,
  onRefresh,
  preferences,
  onUpdatePreferences,
  isComparisonActive,
  onToggleComparison,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
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

  // Click outside search container to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFavorite = currentCity
    ? preferences.favoriteCities.some((c) => c.name.toLowerCase() === currentCity.name.toLowerCase())
    : false;

  const toggleFavorite = () => {
    if (!currentCity) return;
    let updated: GeoLocation[];
    if (isFavorite) {
      updated = preferences.favoriteCities.filter((c) => c.name.toLowerCase() !== currentCity.name.toLowerCase());
    } else {
      updated = [...preferences.favoriteCities, currentCity];
    }
    onUpdatePreferences({ favoriteCities: updated });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/90 px-4 py-3 sm:px-6 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Current City Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sky-400 shadow-sm">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display tracking-tight text-white">
                  WeatherIntel
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  METEO
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block">Geometric Weather Engine</p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              title="Refresh Weather"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={onToggleComparison}
              className={`p-2 rounded-lg transition text-xs font-medium border ${
                isComparisonActive
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Search Input */}
        <div ref={searchRef} className="relative w-full md:max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search location (e.g. London, Tokyo, Paris)..."
              className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onUseLocation}
              className="absolute right-2 p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
              title="Use current location (GPS)"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete & Suggestions Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50">
              {isSearching && (
                <div className="p-3 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  Searching global location database...
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {searchResults.map((city) => (
                    <button
                      key={`${city.id}-${city.latitude}`}
                      onClick={() => {
                        onSelectCity(city);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-sky-500/10 flex items-center justify-between group transition"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300">
                          {city.name}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {[city.admin1, city.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {city.country_code || 'GEO'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No cities found for &quot;{searchQuery}&quot;. Try another query.
                </div>
              )}

              {/* Popular Cities Pills */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800">
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sky-400" /> Quick Select Locations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CITIES.slice(0, 7).map((pop) => (
                    <button
                      key={pop.name}
                      onClick={() => {
                        onSelectCity(pop);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs font-mono hover:bg-sky-500/20 hover:text-sky-300 border border-slate-800 transition"
                    >
                      {pop.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Units, Refresh, Compare & Favorites */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Favorites Button */}
          {currentCity && (
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                isFavorite
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-rose-400'
              }`}
              title={isFavorite ? 'Remove from saved locations' : 'Save location'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          {/* Unit Selectors (°C/°F & km/h/mph) */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => onUpdatePreferences({ tempUnit: 'C' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                preferences.tempUnit === 'C' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => onUpdatePreferences({ tempUnit: 'F' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                preferences.tempUnit === 'F' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 font-mono text-[11px]">
            <button
              onClick={() => onUpdatePreferences({ windUnit: 'kmh' })}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                preferences.windUnit === 'kmh' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              km/h
            </button>
            <button
              onClick={() => onUpdatePreferences({ windUnit: 'mph' })}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                preferences.windUnit === 'mph' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              mph
            </button>
          </div>

          {/* Compare Cities Toggle */}
          <button
            onClick={onToggleComparison}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 font-mono transition ${
              isComparisonActive
                ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            COMPARE
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh weather data"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Favorites Bar if available */}
      {preferences.favoriteCities.length > 0 && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> Saved:
          </span>
          <div className="flex items-center gap-1.5">
            {preferences.favoriteCities.map((fav) => {
              const isSelected = currentCity?.name.toLowerCase() === fav.name.toLowerCase();
              return (
                <button
                  key={fav.name}
                  onClick={() => onSelectCity(fav)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono shrink-0 transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {fav.name}
                  <span className="text-[10px] text-slate-500">{fav.country_code}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
