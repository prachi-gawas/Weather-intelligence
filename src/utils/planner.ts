import { CurrentWeather, HourlyWeather, DailyWeather, WeatherRecommendation, ActivityScore } from '../types/weather';
import { getUVInfo } from './units';

export function generatePlanningRecommendations(
  current: CurrentWeather | undefined,
  hourly: HourlyWeather | undefined,
  daily: DailyWeather | undefined
): WeatherRecommendation {
  const temp = current?.temperature_2m ?? 20;
  const precip = current?.precipitation ?? 0;
  const wind = current?.wind_speed_10m ?? 10;
  const weatherCode = current?.weather_code ?? 0;
  const cloudCover = current?.cloud_cover ?? 20;
  const isDay = current?.is_day ?? 1;

  // 1. Outfit Generator
  let top = 'Light T-Shirt';
  let bottom = 'Comfortable Shorts / Skirt';
  let outerwear: string | undefined = undefined;
  const accessories: string[] = [];

  if (temp < 0) {
    top = 'Thermal Base Layer + Wool Sweater';
    bottom = 'Insulated Winter Pants';
    outerwear = 'Heavy Down Winter Coat';
    accessories.push('Warm Beanie', 'Insulated Gloves', 'Scarf');
  } else if (temp < 10) {
    top = 'Long-sleeve Shirt / Fleece';
    bottom = 'Long Pants / Jeans';
    outerwear = 'Warm Windbreaker or Puffer Jacket';
    accessories.push('Light Gloves', 'Knit Cap');
  } else if (temp < 18) {
    top = 'Long-sleeve Cotton Shirt / Layered Tee';
    bottom = 'Chinos / Trousers';
    outerwear = 'Light Jacket or Cardigan';
  } else if (temp < 25) {
    top = 'Short-sleeve T-Shirt or Polo';
    bottom = 'Breathable Pants or Denim';
  } else {
    top = 'Ultra-light Breathable Tank or Linen Top';
    bottom = 'Light Shorts or Summer Dress';
  }

  // Rain / Snow accessories
  if (precip > 0.5 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
    outerwear = outerwear ? `${outerwear} (Waterproof)` : 'Waterproof Rain Jacket';
    accessories.push('Waterproof Footwear', 'Umbrella');
  } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    accessories.push('Snow Boots', 'Thermal Socks');
  }

  // UV Accessories
  const maxUvToday = daily?.uv_index_max?.[0] ?? (hourly?.uv_index ? Math.max(...hourly.uv_index.slice(0, 24)) : 3);
  if (maxUvToday >= 4 && isDay) {
    accessories.push('UV Protection Sunglasses', 'Wide-Brim Sun Hat');
  }

  // 2. Umbrella Alert (Next 12 Hours)
  let umbrellaNeeded = false;
  let umbrellaProbability = 0;
  if (hourly && hourly.precipitation_probability && hourly.precipitation_probability.length > 0) {
    const next12Hours = hourly.precipitation_probability.slice(0, 12);
    umbrellaProbability = Math.max(...next12Hours);
    if (umbrellaProbability >= 35 || precip > 0.2) {
      umbrellaNeeded = true;
    }
  }

  // 3. UV Advice
  const uvInfo = getUVInfo(maxUvToday);
  let peakUvHour = '12:00 PM';
  if (hourly?.uv_index) {
    const next24Uv = hourly.uv_index.slice(0, 24);
    const maxIdx = next24Uv.indexOf(Math.max(...next24Uv));
    if (maxIdx !== -1 && hourly.time[maxIdx]) {
      const dateStr = hourly.time[maxIdx];
      const timePart = dateStr.includes('T') ? dateStr.split('T')[1] : dateStr;
      peakUvHour = timePart.substring(0, 5);
    }
  }

  // 4. Outdoor Activity Scoring
  const activities: ActivityScore[] = [];

  // Running
  let runScore = 90;
  const runTips: string[] = [];
  if (temp < 5) { runScore -= 25; runTips.push('Dress in thermal layers'); }
  else if (temp > 28) { runScore -= 30; runTips.push('High heat risk - run early morning or late evening'); }
  else if (temp >= 12 && temp <= 20) { runTips.push('Optimal temperature window for running'); }

  if (precip > 1.0) { runScore -= 40; runTips.push('Wet track hazard'); }
  if (wind > 30) { runScore -= 25; runTips.push('Strong headwind resistance'); }
  if (maxUvToday >= 7) { runTips.push('Wear sunscreen & hat'); }
  
  activities.push({
    id: 'running',
    name: 'Running & Jogging',
    category: 'sports',
    score: Math.max(10, Math.min(100, runScore)),
    label: getScoreLabel(runScore),
    iconName: 'Footprints',
    summary: runScore >= 75 ? 'Great conditions for an outdoor run!' : 'Sub-optimal running weather.',
    tips: runTips.length > 0 ? runTips : ['Standard comfortable run conditions.'],
  });

  // Cycling
  let cycleScore = 90;
  const cycleTips: string[] = [];
  if (wind > 35) { cycleScore -= 50; cycleTips.push('Hazardous wind gusts for biking'); }
  else if (wind > 20) { cycleScore -= 20; cycleTips.push('Moderate wind gusts expected'); }
  if (precip > 0.3) { cycleScore -= 45; cycleTips.push('Slippery roads and diminished brake responsiveness'); }
  if (temp < 3) { cycleScore -= 35; cycleTips.push('Risk of icy patches on road surface'); }
  if (cycleScore >= 80) cycleTips.push('Clear roads and smooth wind speed');

  activities.push({
    id: 'cycling',
    name: 'Outdoor Cycling',
    category: 'sports',
    score: Math.max(10, Math.min(100, cycleScore)),
    label: getScoreLabel(cycleScore),
    iconName: 'Bike',
    summary: cycleScore >= 75 ? 'Excellent riding conditions!' : 'Exercise caution while cycling.',
    tips: cycleTips.length > 0 ? cycleTips : ['Wear helmet and enjoy the ride.'],
  });

  // Outdoor Picnic / Park
  let picnicScore = 90;
  const picnicTips: string[] = [];
  if (temp < 15 || temp > 32) picnicScore -= 30;
  if (precip > 0.1 || umbrellaProbability > 40) { picnicScore -= 55; picnicTips.push('High rain probability - consider indoor alternative'); }
  if (cloudCover > 85) picnicScore -= 15;
  if (wind > 25) { picnicScore -= 25; picnicTips.push('Breezy - secure light items'); }
  if (picnicScore >= 80) picnicTips.push('Sunny & pleasant park weather');

  activities.push({
    id: 'picnic',
    name: 'Picnic & Park Gatherings',
    category: 'outdoor',
    score: Math.max(10, Math.min(100, picnicScore)),
    label: getScoreLabel(picnicScore),
    iconName: 'Trees',
    summary: picnicScore >= 75 ? 'Ideal weather for picnics!' : 'Unfavorable park conditions.',
    tips: picnicTips.length > 0 ? picnicTips : ['Bring a picnic blanket'],
  });

  // Stargazing (Night)
  let starScore = 100 - cloudCover;
  const starTips: string[] = [];
  if (precip > 0) starScore = 5;
  if (starScore > 75) starTips.push('Clear atmospheric visibility for viewing stars');
  else if (cloudCover > 50) starTips.push('High cloud density obscuring night sky');
  if (temp < 8) starTips.push('Bundle up with extra blankets for cold night air');

  activities.push({
    id: 'stargazing',
    name: 'Stargazing & Astronomy',
    category: 'lifestyle',
    score: Math.max(5, Math.min(100, starScore)),
    label: getScoreLabel(starScore),
    iconName: 'Sparkles',
    summary: starScore >= 70 ? 'Clear night sky conditions!' : 'Obscured sky due to clouds or rain.',
    tips: starTips.length > 0 ? starTips : ['Find a location away from city lights'],
  });

  // Beach & Pool
  let beachScore = 50;
  const beachTips: string[] = [];
  if (temp >= 24 && cloudCover < 50 && precip < 0.1) {
    beachScore = 90;
    beachTips.push('Warm temperatures & sunshine perfect for water activity');
  } else {
    if (temp < 20) beachTips.push('Too cool for comfortable swimming');
    if (cloudCover > 70) beachTips.push('Limited sunshine');
    if (precip > 0) beachTips.push('Precipitation present');
  }

  activities.push({
    id: 'beach',
    name: 'Beach & Swimming',
    category: 'outdoor',
    score: Math.max(10, Math.min(100, beachScore)),
    label: getScoreLabel(beachScore),
    iconName: 'Waves',
    summary: beachScore >= 75 ? 'Ideal beach day!' : 'Sub-optimal beach weather.',
    tips: beachTips.length > 0 ? beachTips : ['Stay hydrated'],
  });

  // 5. Driving & Travel Safety
  let drivingStatus: 'Safe' | 'Caution' | 'Hazardous' = 'Safe';
  let drivingReason = 'Normal driving conditions across roads.';

  if ([95, 96, 99].includes(weatherCode)) {
    drivingStatus = 'Hazardous';
    drivingReason = 'Thunderstorm alert! Heavy rain, lightning, and reduced traction.';
  } else if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(weatherCode)) {
    drivingStatus = 'Hazardous';
    drivingReason = 'Snow/Ice on roads causing extreme slipperiness and low visibility.';
  } else if (wind > 50) {
    drivingStatus = 'Caution';
    drivingReason = 'High side-wind gusts affecting high-profile vehicles.';
  } else if ([45, 48].includes(weatherCode)) {
    drivingStatus = 'Caution';
    drivingReason = 'Dense fog alert! Maintain increased stopping distance and use fog lights.';
  } else if (precip > 2.0) {
    drivingStatus = 'Caution';
    drivingReason = 'Standing water & risk of hydroplaning.';
  }

  return {
    outfit: {
      top,
      bottom,
      outerwear,
      accessories,
    },
    umbrellaNeeded,
    umbrellaProbability,
    uvAdvice: {
      level: uvInfo.level,
      spf: uvInfo.spf,
      peakHour: peakUvHour,
    },
    activities,
    drivingCondition: {
      status: drivingStatus,
      reason: drivingReason,
    },
    stargazing: {
      score: starScore,
      description: starTips.join(' • '),
    },
  };
}

function getScoreLabel(score: number): 'Ideal' | 'Good' | 'Moderate' | 'Poor' | 'Unfavorable' {
  if (score >= 85) return 'Ideal';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Poor';
  return 'Unfavorable';
}
