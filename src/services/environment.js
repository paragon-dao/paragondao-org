/**
 * Environment Data Service
 *
 * Fetches comprehensive weather, air quality, pollutant, pollen, and UV data.
 * All from FREE APIs — no keys required for Open-Meteo.
 * Optional AQICN token for real ground-station AQI.
 *
 * Data sources:
 *   Open-Meteo Weather  — temp, feels like, wind, gusts, precipitation, visibility, pressure, dew point, sunrise/sunset
 *   Open-Meteo Air Quality — PM2.5, PM10, AQI, ozone, NO2, SO2, CO, dust, smoke proxy, pollen (EU only)
 *   AQICN (optional)    — real sensor AQI, dominant pollutant, station name
 */

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let cachedData = null;
let cacheTimestamp = 0;
let cachedLocation = null;

// Persist user's manual location choice across sessions
const LOCATION_STORAGE_KEY = 'paragon_user_location';

function loadSavedLocation() {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveLocation(loc) {
  try { localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc)); } catch {}
}

// ─── Location ──────────────────────────────────────────────────────────

/**
 * Get user location WITHOUT triggering browser permission popup.
 * Priority: 1) User's saved choice  2) IP geolocation  3) Default
 * GPS is only used when user explicitly clicks "Use precise location".
 */
export async function getLocation() {
  if (cachedLocation) return cachedLocation;

  // 1. Check if user previously set a location
  const saved = loadSavedLocation();
  if (saved) {
    cachedLocation = saved;
    return cachedLocation;
  }

  // 2. GeoJS — free, no key, no rate limit, CORS-friendly
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      cachedLocation = {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        city: data.city,
        region: data.region,
        country: data.country,
        source: 'ip'
      };
      return cachedLocation;
    }
  } catch {}

  // 3. Fallback: ipwho.is
  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data.success !== false && data.latitude) {
      cachedLocation = {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        region: data.region,
        country: data.country,
        source: 'ip'
      };
      return cachedLocation;
    }
  } catch {}

  // 4. Last resort fallback: ipapi.co (rate-limited on free tier)
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      cachedLocation = {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        region: data.region,
        country: data.country_name,
        source: 'ip'
      };
      return cachedLocation;
    }
  } catch {}

  // 5. Default — should rarely reach here
  cachedLocation = { latitude: 40.7128, longitude: -74.0060, city: 'New York', region: 'New York', country: 'United States', source: 'default' };
  return cachedLocation;
}

/**
 * Upgrade to GPS precision — only called when user clicks "Use precise location"
 */
export async function upgradeToGPS() {
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 300000
      });
    });

    // Reverse geocode to get city name from coords
    let city = cachedLocation?.city || '';
    let region = cachedLocation?.region || '';
    let country = cachedLocation?.country || '';
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m&timezone=auto`);
      const data = await res.json();
      // Open-Meteo returns timezone which hints at location but not city name
      // Keep the IP-based city name since it's usually close enough
    } catch {}

    cachedLocation = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      city, region, country,
      source: 'gps'
    };
    saveLocation(cachedLocation);
    cachedData = null;
    cacheTimestamp = 0;
    return cachedLocation;
  } catch (err) {
    throw new Error('Location access denied');
  }
}

/**
 * Set location manually by city name using Open-Meteo geocoding API
 */
export async function searchLocation(query) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`);
  const data = await res.json();
  if (!data.results?.length) return [];

  return data.results.map(r => ({
    latitude: r.latitude,
    longitude: r.longitude,
    city: r.name,
    region: r.admin1 || '',
    country: r.country || '',
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', ')
  }));
}

/**
 * Set a specific location (from search results or manual pick)
 */
export function setLocation(loc) {
  cachedLocation = { ...loc, source: 'manual' };
  saveLocation(cachedLocation);
  cachedData = null;
  cacheTimestamp = 0;
  return cachedLocation;
}

// ─── Open-Meteo Weather ────────────────────────────────────────────────

async function fetchWeather(lat, lon) {
  const currentParams = [
    'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
    'dew_point_2m', 'wind_speed_10m', 'wind_gusts_10m', 'wind_direction_10m',
    'precipitation', 'rain', 'snowfall', 'weather_code',
    'pressure_msl', 'surface_pressure', 'visibility', 'cloud_cover',
    'uv_index'
  ].join(',');

  const dailyParams = [
    'sunrise', 'sunset',
    'temperature_2m_max', 'temperature_2m_min',
    'apparent_temperature_max', 'apparent_temperature_min',
    'precipitation_sum', 'precipitation_probability_max',
    'wind_speed_10m_max', 'wind_gusts_10m_max'
  ].join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${currentParams}&daily=${dailyParams}&timezone=auto&forecast_days=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();

  const c = data.current;
  const cu = data.current_units || {};
  const d = data.daily || {};

  return {
    // Core
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    dewPoint: c.dew_point_2m,
    weatherCode: c.weather_code,
    cloudCover: c.cloud_cover,
    uvIndex: c.uv_index,

    // Wind
    windSpeed: c.wind_speed_10m,
    windGusts: c.wind_gusts_10m,
    windDirection: c.wind_direction_10m,

    // Precipitation
    precipitation: c.precipitation,
    rain: c.rain,
    snowfall: c.snowfall,

    // Atmospheric
    pressureMsl: c.pressure_msl,
    surfacePressure: c.surface_pressure,
    visibility: c.visibility,

    // Daily
    sunrise: d.sunrise?.[0] || null,
    sunset: d.sunset?.[0] || null,
    tempMax: d.temperature_2m_max?.[0],
    tempMin: d.temperature_2m_min?.[0],
    feelsLikeMax: d.apparent_temperature_max?.[0],
    feelsLikeMin: d.apparent_temperature_min?.[0],
    precipitationSum: d.precipitation_sum?.[0],
    precipProbMax: d.precipitation_probability_max?.[0],
    windSpeedMax: d.wind_speed_10m_max?.[0],
    windGustsMax: d.wind_gusts_10m_max?.[0],

    // 3-day forecast sunrise/sunset for daylight tracking
    sunriseAll: d.sunrise || [],
    sunsetAll: d.sunset || [],

    units: {
      temperature: cu.temperature_2m || '°C',
      humidity: '%',
      windSpeed: cu.wind_speed_10m || 'km/h',
      pressure: cu.pressure_msl || 'hPa',
      visibility: 'm',
      precipitation: cu.precipitation || 'mm'
    },

    description: getWeatherDescription(c.weather_code)
  };
}

// ─── Open-Meteo Air Quality ────────────────────────────────────────────

async function fetchAirQuality(lat, lon) {
  const params = [
    'pm2_5', 'pm10', 'us_aqi', 'uv_index',
    'ozone', 'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide',
    'dust', 'aerosol_optical_depth',
    'us_aqi_pm2_5', 'us_aqi_pm10', 'us_aqi_nitrogen_dioxide',
    'us_aqi_ozone', 'us_aqi_sulphur_dioxide', 'us_aqi_carbon_monoxide',
    'alder_pollen', 'birch_pollen', 'grass_pollen',
    'mugwort_pollen', 'olive_pollen', 'ragweed_pollen'
  ].join(',');

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Air Quality API error: ${res.status}`);
  const data = await res.json();
  const c = data.current;

  return {
    // Core AQI
    aqi: c.us_aqi,
    pm25: c.pm2_5,
    pm10: c.pm10,
    ozone: c.ozone,
    no2: c.nitrogen_dioxide,
    so2: c.sulphur_dioxide,
    co: c.carbon_monoxide,
    uvIndex: c.uv_index,

    // Particulates & smoke proxy
    dust: c.dust,
    aerosolOpticalDepth: c.aerosol_optical_depth,

    // Per-pollutant AQI
    aqiBreakdown: {
      pm25: c.us_aqi_pm2_5,
      pm10: c.us_aqi_pm10,
      no2: c.us_aqi_nitrogen_dioxide,
      ozone: c.us_aqi_ozone,
      so2: c.us_aqi_sulphur_dioxide,
      co: c.us_aqi_carbon_monoxide
    },

    // Pollen (Europe only — null elsewhere)
    pollen: {
      alder: c.alder_pollen,
      birch: c.birch_pollen,
      grass: c.grass_pollen,
      mugwort: c.mugwort_pollen,
      olive: c.olive_pollen,
      ragweed: c.ragweed_pollen
    }
  };
}

// ─── AQICN (optional, needs free token) ────────────────────────────────

async function fetchAQICN(lat, lon) {
  const token = import.meta.env.VITE_AQICN_TOKEN;
  if (!token) return null;

  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'ok') return null;

    return {
      aqi: data.data.aqi,
      dominantPollutant: data.data.dominantpol,
      station: data.data.city?.name,
      time: data.data.time?.s
    };
  } catch {
    return null;
  }
}

// ─── Health Categorization ─────────────────────────────────────────────

function getAQICategory(aqi) {
  if (aqi <= 50) return { level: 'Good', color: '#10b981', advisory: 'Good for outdoor breathing exercises' };
  if (aqi <= 100) return { level: 'Moderate', color: '#f59e0b', advisory: 'Acceptable — sensitive groups may want to stay indoors' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#f97316', advisory: 'Consider breathing exercises indoors' };
  if (aqi <= 200) return { level: 'Unhealthy', color: '#ef4444', advisory: 'AQI elevated — breathe indoors' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: '#7c3aed', advisory: 'Avoid outdoor breathing — stay indoors' };
  return { level: 'Hazardous', color: '#991b1b', advisory: 'Hazardous air — remain indoors with air purification' };
}

function getUVCategory(uv) {
  if (uv <= 2) return { level: 'Low', color: '#10b981' };
  if (uv <= 5) return { level: 'Moderate', color: '#f59e0b' };
  if (uv <= 7) return { level: 'High', color: '#f97316' };
  if (uv <= 10) return { level: 'Very High', color: '#ef4444' };
  return { level: 'Extreme', color: '#7c3aed' };
}

function getWindChillAdvisory(feelsLike, actual) {
  const diff = actual - feelsLike;
  if (feelsLike <= -27) return { level: 'Extreme', color: '#991b1b', advisory: 'Frostbite risk in minutes — stay indoors' };
  if (feelsLike <= -15) return { level: 'Very Cold', color: '#ef4444', advisory: 'Frostbite risk — limit outdoor exposure' };
  if (feelsLike <= 0) return { level: 'Cold', color: '#f97316', advisory: 'Dress warmly — cold stress possible' };
  if (diff > 5) return { level: 'Windy', color: '#f59e0b', advisory: `Feels ${diff.toFixed(0)}° colder due to wind` };
  return { level: 'Comfortable', color: '#10b981', advisory: 'Wind chill minimal' };
}

function getPressureCategory(pressure) {
  if (pressure < 1000) return { level: 'Low', color: '#6366f1', advisory: 'Low pressure — possible migraine/fatigue trigger' };
  if (pressure < 1013) return { level: 'Below Normal', color: '#f59e0b', advisory: 'Slightly low — watch for pressure sensitivity' };
  if (pressure <= 1023) return { level: 'Normal', color: '#10b981', advisory: 'Normal atmospheric pressure' };
  return { level: 'High', color: '#3b82f6', advisory: 'High pressure — generally stable weather' };
}

function getVisibilityCategory(visMeters) {
  if (visMeters < 200) return { level: 'Dense Fog', color: '#991b1b', advisory: 'Dangerous — avoid driving' };
  if (visMeters < 1000) return { level: 'Fog', color: '#ef4444', advisory: 'Poor visibility — drive with caution' };
  if (visMeters < 4000) return { level: 'Mist', color: '#f59e0b', advisory: 'Reduced visibility' };
  if (visMeters < 10000) return { level: 'Haze', color: '#f59e0b', advisory: 'Moderate visibility' };
  return { level: 'Clear', color: '#10b981', advisory: 'Good visibility' };
}

/**
 * Estimate indoor mold risk from outdoor humidity and dew point
 *
 * Indoor humidity correlates with outdoor dew point more than outdoor RH:
 *   - In winter, heating dries indoor air (RH drops)
 *   - In summer, outdoor dew point passes through to indoors
 *   - High outdoor RH + poor ventilation = condensation + mold
 */
function getMoldRisk(humidity, dewPoint, temperature) {
  // Condensation risk: when dew point approaches temperature
  const condensationMargin = temperature - dewPoint;

  // High humidity + small condensation margin = high mold risk
  if (humidity >= 80 || condensationMargin < 2) {
    return { level: 'High', color: '#ef4444', score: 3, advisory: 'High mold risk — ensure ventilation, use dehumidifier' };
  }
  if (humidity >= 70 || condensationMargin < 5) {
    return { level: 'Elevated', color: '#f97316', score: 2, advisory: 'Elevated mold risk — check bathrooms and basements' };
  }
  if (humidity >= 60) {
    return { level: 'Moderate', color: '#f59e0b', score: 1, advisory: 'Moderate — monitor indoor humidity' };
  }
  return { level: 'Low', color: '#10b981', score: 0, advisory: 'Low mold risk — conditions are dry' };
}

/**
 * Estimate indoor air quality from outdoor data
 * Indoor AQI is typically 2-5x worse than outdoor in poorly ventilated spaces
 */
function getIndoorRisk(outdoorAqi, humidity, co) {
  const risks = [];

  // Ventilation proxy: if outdoor AQI is bad, indoor is likely worse
  if (outdoorAqi > 100) {
    risks.push('Close windows — outdoor air unhealthy');
  } else if (outdoorAqi > 50) {
    risks.push('Ventilate to bring in cleaner outdoor air');
  }

  // CO check
  if (co > 500) {
    risks.push('Elevated CO levels — check gas appliances');
  }

  // Humidity for comfort
  if (humidity > 70) {
    risks.push('High humidity — use dehumidifier');
  } else if (humidity < 30) {
    risks.push('Very dry air — consider humidifier');
  }

  const score = outdoorAqi > 100 ? 3 : outdoorAqi > 50 ? 2 : humidity > 70 ? 2 : 1;
  const level = score >= 3 ? 'Poor' : score >= 2 ? 'Fair' : 'Good';
  const color = score >= 3 ? '#ef4444' : score >= 2 ? '#f59e0b' : '#10b981';

  return { level, color, score, risks, advisory: risks[0] || 'Indoor conditions likely good' };
}

/**
 * Calculate daylight hours from sunrise/sunset strings
 */
function getDaylightInfo(sunrise, sunset) {
  if (!sunrise || !sunset) return null;

  const parseTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.getTime();
  };

  const riseMs = parseTime(sunrise);
  const setMs = parseTime(sunset);
  const daylightMs = setMs - riseMs;
  const daylightHours = daylightMs / (1000 * 60 * 60);

  // Extract display times
  const riseTime = new Date(sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const setTime = new Date(sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // SAD risk based on daylight hours
  let sadRisk;
  if (daylightHours < 8) sadRisk = { level: 'High', color: '#ef4444', advisory: 'Very short days — consider light therapy' };
  else if (daylightHours < 10) sadRisk = { level: 'Moderate', color: '#f59e0b', advisory: 'Short daylight — get outside during peak sun' };
  else sadRisk = { level: 'Low', color: '#10b981', advisory: 'Adequate daylight for vitamin D' };

  return {
    sunrise: riseTime,
    sunset: setTime,
    daylightHours: Math.round(daylightHours * 10) / 10,
    sadRisk
  };
}

/**
 * Get total pollen level (sum of all types that have data)
 */
function getPollenSummary(pollen) {
  if (!pollen) return null;

  const types = [];
  let total = 0;
  let hasData = false;

  const pollenTypes = [
    { key: 'grass', label: 'Grass' },
    { key: 'birch', label: 'Birch' },
    { key: 'alder', label: 'Alder' },
    { key: 'ragweed', label: 'Ragweed' },
    { key: 'mugwort', label: 'Mugwort' },
    { key: 'olive', label: 'Olive' }
  ];

  for (const t of pollenTypes) {
    const val = pollen[t.key];
    if (val != null && val > 0) {
      hasData = true;
      total += val;
      types.push({ ...t, value: val });
    }
  }

  if (!hasData) return null; // No pollen data (likely outside Europe)

  let level, color, advisory;
  if (total < 10) { level = 'Low'; color = '#10b981'; advisory = 'Low pollen — safe for allergy sufferers'; }
  else if (total < 50) { level = 'Moderate'; color = '#f59e0b'; advisory = 'Moderate pollen — take antihistamine if sensitive'; }
  else if (total < 100) { level = 'High'; color = '#f97316'; advisory = 'High pollen — limit outdoor exposure'; }
  else { level = 'Very High'; color = '#ef4444'; advisory = 'Very high pollen — stay indoors if allergic'; }

  return { level, color, advisory, total: Math.round(total), types };
}

/**
 * Get smoke/haze risk from aerosol optical depth
 */
function getSmokeRisk(aod, dust) {
  if (aod == null) return null;

  if (aod > 1.0) return { level: 'Severe', color: '#991b1b', advisory: 'Heavy smoke or haze — stay indoors, use air purifier' };
  if (aod > 0.5) return { level: 'High', color: '#ef4444', advisory: 'Significant haze/smoke — limit outdoor activity' };
  if (aod > 0.2) return { level: 'Moderate', color: '#f59e0b', advisory: 'Moderate haze detected' };
  return { level: 'Low', color: '#10b981', advisory: 'Clear air — no smoke detected' };
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Freezing drizzle', 57: 'Heavy freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Unknown';
}

// ─── Main Export ───────────────────────────────────────────────────────

export async function getEnvironmentData() {
  if (cachedData && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return cachedData;
  }

  const location = await getLocation();
  const { latitude, longitude } = location;

  const [weather, airQuality, aqicn] = await Promise.allSettled([
    fetchWeather(latitude, longitude),
    fetchAirQuality(latitude, longitude),
    fetchAQICN(latitude, longitude)
  ]);

  const w = weather.status === 'fulfilled' ? weather.value : null;
  const aq = airQuality.status === 'fulfilled' ? airQuality.value : null;
  const aqicnData = aqicn.status === 'fulfilled' ? aqicn.value : null;

  const aqi = aqicnData?.aqi || aq?.aqi || null;
  const aqiCategory = aqi != null ? getAQICategory(aqi) : null;
  const uvIndex = w?.uvIndex ?? aq?.uvIndex ?? null;
  const uvCategory = uvIndex != null ? getUVCategory(uvIndex) : null;

  const result = {
    location: {
      ...location,
      station: aqicnData?.station || null
    },

    // ── Outdoor Weather ──
    weather: w ? {
      temperature: w.temperature,
      feelsLike: w.feelsLike,
      humidity: w.humidity,
      dewPoint: w.dewPoint,
      cloudCover: w.cloudCover,
      description: w.description,
      weatherCode: w.weatherCode,
      units: w.units,

      wind: {
        speed: w.windSpeed,
        gusts: w.windGusts,
        direction: w.windDirection,
        advisory: getWindChillAdvisory(w.feelsLike, w.temperature)
      },

      precipitation: {
        current: w.precipitation,
        rain: w.rain,
        snow: w.snowfall,
        dailySum: w.precipitationSum,
        probabilityMax: w.precipProbMax,
        isActive: (w.precipitation || 0) > 0
      },

      pressure: {
        msl: w.pressureMsl,
        surface: w.surfacePressure,
        category: getPressureCategory(w.pressureMsl)
      },

      visibility: {
        meters: w.visibility,
        km: w.visibility != null ? Math.round(w.visibility / 100) / 10 : null,
        category: w.visibility != null ? getVisibilityCategory(w.visibility) : null
      },

      daylight: getDaylightInfo(w.sunrise, w.sunset),

      daily: {
        tempMax: w.tempMax,
        tempMin: w.tempMin,
        feelsLikeMax: w.feelsLikeMax,
        feelsLikeMin: w.feelsLikeMin,
        windSpeedMax: w.windSpeedMax,
        windGustsMax: w.windGustsMax
      }
    } : null,

    // ── Air Quality ──
    airQuality: {
      aqi,
      aqiCategory,
      pm25: aq?.pm25 || null,
      pm10: aq?.pm10 || null,
      ozone: aq?.ozone || null,
      no2: aq?.no2 || null,
      so2: aq?.so2 || null,
      co: aq?.co || null,
      dominantPollutant: aqicnData?.dominantPollutant || null,
      source: aqicnData ? 'aqicn' : 'open-meteo',
      breakdown: aq?.aqiBreakdown || null,
      smoke: getSmokeRisk(aq?.aerosolOpticalDepth, aq?.dust),
      dust: aq?.dust || null,
      aerosolOpticalDepth: aq?.aerosolOpticalDepth || null
    },

    // ── UV ──
    uv: {
      index: uvIndex,
      category: uvCategory
    },

    // ── Pollen (Europe only) ──
    pollen: getPollenSummary(aq?.pollen),

    // ── Indoor Risk Estimates ──
    indoor: w ? {
      moldRisk: getMoldRisk(w.humidity, w.dewPoint, w.temperature),
      airQuality: getIndoorRisk(aqi || 0, w.humidity, aq?.co || 0),
      humidityAdvice: w.humidity > 70
        ? 'Use dehumidifier — high moisture indoors'
        : w.humidity < 30
        ? 'Air very dry — consider humidifier for respiratory comfort'
        : 'Indoor humidity likely comfortable'
    } : null,

    // ── Health Advisory (primary) ──
    advisory: aqiCategory?.advisory || 'Environment data loading...',

    fetchedAt: Date.now()
  };

  cachedData = result;
  cacheTimestamp = Date.now();
  return result;
}

export function clearCache() {
  cachedData = null;
  cacheTimestamp = 0;
  cachedLocation = null;
}
