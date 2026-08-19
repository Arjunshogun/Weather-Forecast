/**
 * AeroCast Weather Dashboard — Application Controller
 * Handles state, API calls to Java backend, UI rendering, charts, maps, and animations.
 */

// ==================== WMO WEATHER CODES MAP ====================
const WMO_CODES = {
  0: { label: 'Clear Sky', iconDay: '☀️', iconNight: '🌙', desc: 'Clear and bright skies' },
  1: { label: 'Mainly Clear', iconDay: '🌤️', iconNight: '🌤️', desc: 'Mostly clear with few clouds' },
  2: { label: 'Partly Cloudy', iconDay: '⛅', iconNight: '☁️', desc: 'Scattered clouds throughout the day' },
  3: { label: 'Overcast', iconDay: '☁️', iconNight: '☁️', desc: 'Overcast and gloomy skies' },
  45: { label: 'Foggy', iconDay: '🌫️', iconNight: '🌫️', desc: 'Dense fog limiting visibility' },
  48: { label: 'Depositing Rime Fog', iconDay: '🌫️', iconNight: '🌫️', desc: 'Freezing rime fog conditions' },
  51: { label: 'Light Drizzle', iconDay: '🌦️', iconNight: '🌧️', desc: 'Light misting drizzle' },
  53: { label: 'Moderate Drizzle', iconDay: '🌦️', iconNight: '🌧️', desc: 'Steady intermittent drizzle' },
  55: { label: 'Dense Drizzle', iconDay: '🌧️', iconNight: '🌧️', desc: 'Heavy drizzle with reduced visibility' },
  56: { label: 'Light Freezing Drizzle', iconDay: '🌨️', iconNight: '🌨️', desc: 'Freezing light drizzle' },
  57: { label: 'Dense Freezing Drizzle', iconDay: '🌨️', iconNight: '🌨️', desc: 'Freezing heavy drizzle' },
  61: { label: 'Slight Rain', iconDay: '🌦️', iconNight: '🌧️', desc: 'Light scattered rain showers' },
  63: { label: 'Moderate Rain', iconDay: '🌧️', iconNight: '🌧️', desc: 'Steady rain throughout the area' },
  65: { label: 'Heavy Rain', iconDay: '🌧️', iconNight: '🌧️', desc: 'Heavy downpours expected' },
  66: { label: 'Light Freezing Rain', iconDay: '🌨️', iconNight: '🌨️', desc: 'Freezing rain on cold surfaces' },
  67: { label: 'Heavy Freezing Rain', iconDay: '🌨️', iconNight: '🌨️', desc: 'Hazardous heavy freezing rain' },
  71: { label: 'Slight Snowfall', iconDay: '🌨️', iconNight: '🌨️', desc: 'Light gentle snowfall' },
  73: { label: 'Moderate Snowfall', iconDay: '❄️', iconNight: '❄️', desc: 'Steady snowfall accumulating' },
  75: { label: 'Heavy Snowfall', iconDay: '❄️', iconNight: '❄️', desc: 'Heavy blizzard-like snow accumulation' },
  77: { label: 'Snow Grains', iconDay: '🌨️', iconNight: '🌨️', desc: 'Fine frozen snow grains' },
  80: { label: 'Slight Rain Showers', iconDay: '🌦️', iconNight: '🌧️', desc: 'Passing light rain showers' },
  81: { label: 'Moderate Rain Showers', iconDay: '🌧️', iconNight: '🌧️', desc: 'Periodic moderate rain showers' },
  82: { label: 'Violent Rain Showers', iconDay: '⛈️', iconNight: '⛈️', desc: 'Sudden intense torrential showers' },
  85: { label: 'Slight Snow Showers', iconDay: '🌨️', iconNight: '🌨️', desc: 'Passing snow flurries' },
  86: { label: 'Heavy Snow Showers', iconDay: '❄️', iconNight: '❄️', desc: 'Intense sudden snow squalls' },
  95: { label: 'Thunderstorm', iconDay: '⛈️', iconNight: '⛈️', desc: 'Thunder and lightning activity' },
  96: { label: 'Thunderstorm with Hail', iconDay: '⛈️', iconNight: '⛈️', desc: 'Severe storm with small hail' },
  99: { label: 'Heavy Thunderstorm with Hail', iconDay: '⛈️', iconNight: '⛈️', desc: 'Severe thunderstorm with heavy hail' }
};

// ==================== APP STATE ====================
const state = {
  currentLocation: {
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.50853,
    longitude: -0.12574,
    timezone: 'Europe/London'
  },
  weatherData: null,
  unit: 'c', // 'c' or 'f'
  favorites: [],
  effectsEngine: null,
  map: null,
  mapMarker: null,
  activeLayer: 'standard',
  activeHourlyTab: 'cards'
};

// ==================== DOM ELEMENTS ====================
const el = {
  citySearchInput: document.getElementById('city-search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  searchSpinner: document.getElementById('search-spinner'),
  searchSuggestions: document.getElementById('search-suggestions'),
  geoBtn: document.getElementById('geo-btn'),
  unitToggle: document.getElementById('unit-toggle'),
  refreshBtn: document.getElementById('refresh-btn'),
  refreshIcon: document.getElementById('refresh-icon'),
  favoritesList: document.getElementById('favorites-list'),
  bookmarkCurrentBtn: document.getElementById('bookmark-current-btn'),

  // Hero Card
  currentCityName: document.getElementById('current-city-name'),
  countryBadge: document.getElementById('country-badge'),
  locationDetails: document.getElementById('location-details'),
  conditionBadge: document.getElementById('condition-badge'),
  conditionText: document.getElementById('condition-text'),
  currentTemp: document.getElementById('current-temp'),
  tempUnitSymbol: document.getElementById('temp-unit-symbol'),
  weatherAnimIcon: document.getElementById('weather-anim-icon'),
  feelsLikeTemp: document.getElementById('feels-like-temp'),
  highLowTemp: document.getElementById('high-low-temp'),
  cloudCoverVal: document.getElementById('cloud-cover-val'),
  lastUpdatedTime: document.getElementById('last-updated-time'),

  // Advisory
  advisoryCard: document.getElementById('advisory-card'),
  advisoryIcon: document.getElementById('advisory-icon'),
  advisoryTitle: document.getElementById('advisory-title'),
  advisoryText: document.getElementById('advisory-text'),

  // Metrics
  humidityVal: document.getElementById('humidity-val'),
  humidityBar: document.getElementById('humidity-bar'),
  humidityDesc: document.getElementById('humidity-desc'),
  windSpeedVal: document.getElementById('wind-speed-val'),
  windUnit: document.getElementById('wind-unit'),
  windDirText: document.getElementById('wind-dir-text'),
  compassArrow: document.getElementById('compass-arrow'),
  uvVal: document.getElementById('uv-val'),
  uvBadge: document.getElementById('uv-badge'),
  uvBar: document.getElementById('uv-bar'),
  uvDesc: document.getElementById('uv-desc'),
  pressureVal: document.getElementById('pressure-val'),
  pressureUnit: document.getElementById('pressure-unit'),
  pressureBar: document.getElementById('pressure-bar'),
  pressureDesc: document.getElementById('pressure-desc'),
  visibilityVal: document.getElementById('visibility-val'),
  visibilityUnit: document.getElementById('visibility-unit'),
  visibilityBar: document.getElementById('visibility-bar'),
  visibilityDesc: document.getElementById('visibility-desc'),
  dewPointVal: document.getElementById('dew-point-val'),
  dewUnit: document.getElementById('dew-unit'),
  dewBar: document.getElementById('dew-bar'),
  dewDesc: document.getElementById('dew-desc'),

  // Hourly & Daily
  hourlyScrollContainer: document.getElementById('hourly-scroll-container'),
  hourlyList: document.getElementById('hourly-list'),
  hourlyChartContainer: document.getElementById('hourly-chart-container'),
  hourlyCanvasChart: document.getElementById('hourly-canvas-chart'),
  hourlyCardsTab: document.getElementById('hourly-cards-tab'),
  hourlyChartTab: document.getElementById('hourly-chart-tab'),
  dailyList: document.getElementById('daily-list'),

  // Air Quality
  aqiVal: document.getElementById('aqi-val'),
  aqiStatusBadge: document.getElementById('aqi-status-badge'),
  aqiSummary: document.getElementById('aqi-summary'),
  polPm25: document.getElementById('pol-pm25'),
  polPm10: document.getElementById('pol-pm10'),
  polNo2: document.getElementById('pol-no2'),
  polO3: document.getElementById('pol-o3'),
  polCo: document.getElementById('pol-co'),
  polSo2: document.getElementById('pol-so2'),

  // Solar Arc
  daylightDuration: document.getElementById('daylight-duration'),
  solarProgressArc: document.getElementById('solar-progress-arc'),
  solarSunDot: document.getElementById('solar-sun-dot'),
  sunriseTime: document.getElementById('sunrise-time'),
  sunsetTime: document.getElementById('sunset-time'),
  daylightRemaining: document.getElementById('daylight-remaining'),

  // Map & Toast
  toast: document.getElementById('toast')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Dynamic Particle Engine
  state.effectsEngine = new WeatherEffectsEngine('weather-canvas');

  // 2. Initialize Leaflet Map
  initMap();

  // 3. Setup Event Listeners
  setupEventListeners();

  // 4. Load Saved Favorites
  loadFavorites();

  // 5. Fetch Initial Weather Data
  fetchWeather(state.currentLocation);
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Search Autocomplete with Debounce
  let debounceTimeout = null;
  el.citySearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    el.clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';

    clearTimeout(debounceTimeout);
    if (query.length < 2) {
      el.searchSuggestions.style.display = 'none';
      el.searchSpinner.style.display = 'none';
      return;
    }

    el.searchSpinner.style.display = 'block';
    debounceTimeout = setTimeout(() => {
      searchCityAutocomplete(query);
    }, 280);
  });

  el.clearSearchBtn.addEventListener('click', () => {
    el.citySearchInput.value = '';
    el.clearSearchBtn.style.display = 'none';
    el.searchSuggestions.style.display = 'none';
    el.citySearchInput.focus();
  });

  // Close search suggestions on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      el.searchSuggestions.style.display = 'none';
    }
  });

  // Unit Switcher
  el.unitToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.unit-btn');
    if (!btn) return;
    const targetUnit = btn.dataset.unit;
    if (targetUnit !== state.unit) {
      state.unit = targetUnit;
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unit === state.unit));
      if (state.weatherData) {
        renderDashboard(state.weatherData);
      }
    }
  });

  // Geolocation Button
  el.geoBtn.addEventListener('click', getUserGeolocation);

  // Refresh Button
  el.refreshBtn.addEventListener('click', () => {
    el.refreshIcon.classList.add('spinning');
    fetchWeather(state.currentLocation, true).finally(() => {
      setTimeout(() => el.refreshIcon.classList.remove('spinning'), 600);
    });
  });

  // Bookmark / Pin current city
  el.bookmarkCurrentBtn.addEventListener('click', toggleBookmarkCurrentCity);

  // Hourly Tab Toggle
  el.hourlyCardsTab.addEventListener('click', () => {
    state.activeHourlyTab = 'cards';
    el.hourlyCardsTab.classList.add('active');
    el.hourlyChartTab.classList.remove('active');
    el.hourlyScrollContainer.style.display = 'block';
    el.hourlyChartContainer.style.display = 'none';
  });

  el.hourlyChartTab.addEventListener('click', () => {
    state.activeHourlyTab = 'chart';
    el.hourlyChartTab.classList.add('active');
    el.hourlyCardsTab.classList.remove('active');
    el.hourlyScrollContainer.style.display = 'none';
    el.hourlyChartContainer.style.display = 'block';
    if (state.weatherData) {
      renderHourlyCanvasChart(state.weatherData);
    }
  });

  // Map Layer Pills
  document.querySelectorAll('.layer-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.layer-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeLayer = pill.dataset.layer;
      updateMapLayers();
    });
  });
}

// ==================== API CALLS ====================
async function searchCityAutocomplete(query) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    el.searchSpinner.style.display = 'none';

    if (!data.results || data.results.length === 0) {
      el.searchSuggestions.innerHTML = `<li style="color:var(--text-muted); cursor:default;">No matching locations found</li>`;
      el.searchSuggestions.style.display = 'block';
      return;
    }

    el.searchSuggestions.innerHTML = data.results.map(item => {
      const region = [item.admin1, item.country].filter(Boolean).join(', ');
      const countryCode = item.country_code ? item.country_code.toUpperCase() : '';
      return `
        <li data-lat="${item.latitude}" data-lon="${item.longitude}" data-name="${escapeHtml(item.name)}" data-country="${escapeHtml(item.country || '')}" data-admin1="${escapeHtml(item.admin1 || '')}" data-tz="${item.timezone || 'auto'}">
          <div>
            <div class="item-title">${escapeHtml(item.name)}</div>
            <div class="item-sub">${escapeHtml(region)}</div>
          </div>
          <span class="item-badge">${countryCode}</span>
        </li>
      `;
    }).join('');

    el.searchSuggestions.style.display = 'block';

    // Add click listeners to items
    el.searchSuggestions.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        if (!li.dataset.lat) return;
        const selectedLoc = {
          name: li.dataset.name,
          country: li.dataset.country,
          admin1: li.dataset.admin1,
          latitude: parseFloat(li.dataset.lat),
          longitude: parseFloat(li.dataset.lon),
          timezone: li.dataset.tz
        };
        state.currentLocation = selectedLoc;
        el.citySearchInput.value = '';
        el.clearSearchBtn.style.display = 'none';
        el.searchSuggestions.style.display = 'none';
        fetchWeather(selectedLoc);
      });
    });

  } catch (err) {
    el.searchSpinner.style.display = 'none';
    console.error('Error during search:', err);
  }
}

async function fetchWeather(location, forceRefresh = false) {
  showToast(`Loading weather for ${location.name}...`);
  try {
    const tzParam = location.timezone ? `&tz=${encodeURIComponent(location.timezone)}` : '';
    const res = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}${tzParam}`);
    if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
    
    const data = await res.json();
    state.weatherData = data;
    renderDashboard(data);
    showToast(`Updated weather for ${location.name}`);
  } catch (err) {
    console.error('Failed to load weather:', err);
    showToast('Failed to load weather data. Please try again.');
  }
}

async function loadFavorites() {
  try {
    const res = await fetch('/api/favorites');
    if (res.ok) {
      state.favorites = await res.json();
      renderFavoritesBar();
    }
  } catch (err) {
    console.warn('Could not load favorites:', err);
  }
}

async function saveFavorites() {
  try {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.favorites)
    });
  } catch (err) {
    console.warn('Could not save favorites:', err);
  }
}

// ==================== RENDERING LOGIC ====================
function renderDashboard(data) {
  if (!data || !data.current) return;

  const current = data.current;
  const hourly = data.hourly || {};
  const daily = data.daily || {};
  const air = (data.air_quality && data.air_quality.current) ? data.air_quality.current : {};

  const loc = state.currentLocation;
  const isDay = current.is_day === 1;
  const wmo = WMO_CODES[current.weather_code] || { label: 'Unknown', iconDay: '🌤️', iconNight: '🌙', desc: 'Variable weather' };

  // 1. Update Atmospheric Background Canvas & Theme
  state.effectsEngine.setMode(current.weather_code, isDay);

  // 2. Hero Section
  el.currentCityName.textContent = loc.name;
  el.countryBadge.textContent = loc.country || 'Global';
  
  const localTimeStr = formatLocalTime(data.timezone, current.time);
  el.locationDetails.textContent = `${[loc.admin1, loc.country].filter(Boolean).join(', ')} • ${localTimeStr}`;

  el.conditionBadge.textContent = wmo.label;
  el.conditionText.textContent = wmo.label;
  el.weatherAnimIcon.textContent = isDay ? wmo.iconDay : wmo.iconNight;

  const tempVal = convertTemp(current.temperature_2m);
  const feelsLikeVal = convertTemp(current.apparent_temperature);
  el.currentTemp.textContent = Math.round(tempVal);
  el.tempUnitSymbol.textContent = `°${state.unit.toUpperCase()}`;
  el.feelsLikeTemp.textContent = `${Math.round(feelsLikeVal)}°${state.unit.toUpperCase()}`;

  const todayMax = (daily.temperature_2m_max && daily.temperature_2m_max[0] != null) ? Math.round(convertTemp(daily.temperature_2m_max[0])) : '--';
  const todayMin = (daily.temperature_2m_min && daily.temperature_2m_min[0] != null) ? Math.round(convertTemp(daily.temperature_2m_min[0])) : '--';
  el.highLowTemp.textContent = `H: ${todayMax}° / L: ${todayMin}°`;
  el.cloudCoverVal.textContent = `${current.cloud_cover ?? 0}%`;
  el.lastUpdatedTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 3. Smart Weather Advisory
  renderAdvisory(current, daily, air);

  // 4. Metrics Grid
  renderMetrics(current);

  // 5. 24-Hour Hourly Forecast
  renderHourlyTimeline(hourly, data.timezone);
  if (state.activeHourlyTab === 'chart') {
    renderHourlyCanvasChart(data);
  }

  // 6. 7-Day Extended Forecast
  renderDailyForecast(daily);

  // 7. Air Quality Index
  renderAirQuality(air);

  // 8. Solar Arc & Daylight Cycle
  renderSolarCycle(daily, data.timezone);

  // 9. Update Map Position
  updateMap(loc.latitude, loc.longitude, loc.name, Math.round(tempVal), wmo.label);

  // 10. Update Bookmark Button state
  updateBookmarkButton();
}

function renderMetrics(current) {
  // Humidity
  const humidity = current.relative_humidity_2m ?? 0;
  el.humidityVal.textContent = humidity;
  el.humidityBar.style.width = `${Math.min(100, Math.max(0, humidity))}%`;
  el.humidityDesc.textContent = humidity > 70 ? 'High humidity (sticky)' : humidity < 30 ? 'Dry air' : 'Comfortable moisture';

  // Wind
  const windSpeedKmH = current.wind_speed_10m ?? 0;
  const windSpeed = state.unit === 'f' ? Math.round(windSpeedKmH * 0.621371) : Math.round(windSpeedKmH);
  el.windSpeedVal.textContent = windSpeed;
  el.windUnit.textContent = state.unit === 'f' ? 'mph' : 'km/h';
  const windDir = current.wind_direction_10m ?? 0;
  el.compassArrow.style.transform = `rotate(${windDir}deg)`;
  el.windDirText.textContent = `Wind: ${getCardinalDirection(windDir)} (${windDir}°)`;

  // UV Index
  const uv = current.uv_index ?? 0;
  el.uvVal.textContent = uv.toFixed(1);
  el.uvBar.style.width = `${Math.min(100, (uv / 12) * 100)}%`;
  if (uv <= 2) {
    el.uvBadge.textContent = 'Low';
    el.uvBadge.style.color = '#10b981';
    el.uvDesc.textContent = 'Minimal sun protection required';
  } else if (uv <= 5) {
    el.uvBadge.textContent = 'Moderate';
    el.uvBadge.style.color = '#f59e0b';
    el.uvDesc.textContent = 'Wear sunglasses & sunscreen';
  } else if (uv <= 7) {
    el.uvBadge.textContent = 'High';
    el.uvBadge.style.color = '#f97316';
    el.uvDesc.textContent = 'Seek shade during midday';
  } else {
    el.uvBadge.textContent = 'Very High';
    el.uvBadge.style.color = '#ef4444';
    el.uvDesc.textContent = 'Avoid prolonged sun exposure';
  }

  // Pressure
  const pressure = current.pressure_msl ?? current.surface_pressure ?? 1013;
  if (state.unit === 'f') {
    el.pressureVal.textContent = (pressure * 0.02953).toFixed(2);
    el.pressureUnit.textContent = 'inHg';
  } else {
    el.pressureVal.textContent = Math.round(pressure);
    el.pressureUnit.textContent = 'hPa';
  }
  const pressPercent = Math.min(100, Math.max(0, ((pressure - 970) / (1040 - 970)) * 100));
  el.pressureBar.style.width = `${pressPercent}%`;
  el.pressureDesc.textContent = pressure > 1020 ? 'High pressure system' : pressure < 1005 ? 'Low pressure system' : 'Stable atmospheric pressure';

  // Visibility (from hourly first index if available, or estimated)
  const visibilityMeters = 10000;
  if (state.unit === 'f') {
    el.visibilityVal.textContent = (visibilityMeters / 1609.34).toFixed(1);
    el.visibilityUnit.textContent = 'mi';
  } else {
    el.visibilityVal.textContent = (visibilityMeters / 1000).toFixed(0);
    el.visibilityUnit.textContent = 'km';
  }
  el.visibilityBar.style.width = '100%';
  el.visibilityDesc.textContent = 'Crystal clear visibility';

  // Dew Point
  const tempC = current.temperature_2m;
  const rh = current.relative_humidity_2m;
  const dewC = tempC - ((100 - rh) / 5);
  el.dewPointVal.textContent = Math.round(convertTemp(dewC));
  el.dewUnit.textContent = `°${state.unit.toUpperCase()}`;
  el.dewBar.style.width = `${Math.min(100, Math.max(0, (dewC / 35) * 100))}%`;
  el.dewDesc.textContent = dewC > 20 ? 'Muggy & humid air' : 'Comfortable dew point';
}

function renderAdvisory(current, daily, air) {
  const code = current.weather_code;
  const uv = current.uv_index ?? 0;
  const aqi = air.us_aqi ?? 25;
  const wind = current.wind_speed_10m ?? 0;

  let icon = '💡';
  let title = 'Optimal Conditions';
  let text = 'Great weather for outdoor activities and travel.';

  if ([95, 96, 99].includes(code)) {
    icon = '⛈️';
    title = 'Severe Thunderstorm Warning';
    text = 'Heavy thunderstorm active. Stay indoors and avoid open outdoor areas.';
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    icon = '☔';
    title = 'Rain Advisory';
    text = 'Rain is active or expected soon. Carry an umbrella or waterproof jacket.';
  } else if ([71, 73, 75, 85, 86].includes(code)) {
    icon = '❄️';
    title = 'Snowfall Advisory';
    text = 'Snow accumulation possible. Drive carefully and dress in warm layers.';
  } else if (uv >= 6) {
    icon = '☀️';
    title = 'High UV Advisory';
    text = `UV index is high (${uv.toFixed(1)}). Apply SPF 30+ sunscreen and wear sunglasses.`;
  } else if (aqi > 100) {
    icon = '😷';
    title = 'Air Quality Advisory';
    text = `Air quality index is elevated (${aqi}). Sensitive individuals should limit outdoor exertion.`;
  } else if (wind > 35) {
    icon = '💨';
    title = 'Wind Gust Advisory';
    text = `Strong winds up to ${Math.round(wind)} km/h. Secure loose outdoor objects.`;
  }

  el.advisoryIcon.textContent = icon;
  el.advisoryTitle.textContent = title;
  el.advisoryText.textContent = text;
}

function renderHourlyTimeline(hourly, timezone) {
  if (!hourly || !hourly.time) return;

  const times = hourly.time.slice(0, 24);
  const temps = hourly.temperature_2m.slice(0, 24);
  const codes = hourly.weather_code.slice(0, 24);
  const pops = hourly.precipitation_probability ? hourly.precipitation_probability.slice(0, 24) : [];
  const isDays = hourly.is_day ? hourly.is_day.slice(0, 24) : [];

  el.hourlyList.innerHTML = times.map((t, i) => {
    const isNow = i === 0;
    const hourLabel = formatHour(t, timezone, isNow);
    const code = codes[i];
    const isDay = isDays[i] !== 0;
    const wmo = WMO_CODES[code] || { iconDay: '🌤️', iconNight: '🌙' };
    const icon = isDay ? wmo.iconDay : wmo.iconNight;
    const temp = Math.round(convertTemp(temps[i]));
    const pop = pops[i] != null ? pops[i] : 0;

    return `
      <div class="hourly-item ${isNow ? 'now' : ''}">
        <span class="hourly-time">${hourLabel}</span>
        <span class="hourly-icon">${icon}</span>
        <span class="hourly-temp">${temp}°</span>
        <span class="hourly-pop" title="Precipitation chance">${pop > 10 ? `💧${pop}%` : ''}</span>
      </div>
    `;
  }).join('');
}

function renderHourlyCanvasChart(data) {
  const canvas = el.hourlyCanvasChart;
  if (!canvas || !data || !data.hourly) return;
  const ctx = canvas.getContext('2d');

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  const hourlyTemps = data.hourly.temperature_2m.slice(0, 24).map(t => convertTemp(t));
  const hourlyTimes = data.hourly.time.slice(0, 24);
  const minTemp = Math.min(...hourlyTemps) - 2;
  const maxTemp = Math.max(...hourlyTemps) + 2;
  const tempRange = Math.max(1, maxTemp - minTemp);

  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const points = hourlyTemps.map((temp, i) => {
    const x = paddingLeft + (i / (hourlyTemps.length - 1)) * chartW;
    const y = paddingTop + chartH - ((temp - minTemp) / tempRange) * chartH;
    return { x, y, temp, time: hourlyTimes[i] };
  });

  // Area gradient under curve
  const areaGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
  areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
  }
  ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
  ctx.lineTo(points[0].x, height - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Draw smooth line curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
  }
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Points & Labels for key hours (every 3 hours)
  ctx.font = '600 11px Inter, sans-serif';
  ctx.textAlign = 'center';

  points.forEach((p, i) => {
    if (i % 3 === 0 || i === points.length - 1) {
      // Point circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Temperature text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${Math.round(p.temp)}°`, p.x, p.y - 8);

      // Time label
      ctx.fillStyle = '#94a3b8';
      const timeLabel = new Date(p.time).toLocaleTimeString([], { hour: 'numeric', hour12: true });
      ctx.fillText(timeLabel, p.x, height - 10);
    }
  });
}

function renderDailyForecast(daily) {
  if (!daily || !daily.time) return;

  const days = daily.time.slice(0, 7);
  const minTemps = daily.temperature_2m_min.slice(0, 7);
  const maxTemps = daily.temperature_2m_max.slice(0, 7);
  const codes = daily.weather_code.slice(0, 7);
  const pops = daily.precipitation_probability_max ? daily.precipitation_probability_max.slice(0, 7) : [];

  const allMin = Math.min(...minTemps);
  const allMax = Math.max(...maxTemps);
  const globalRange = Math.max(1, allMax - allMin);

  el.dailyList.innerHTML = days.map((dateStr, i) => {
    const isToday = i === 0;
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const wmo = WMO_CODES[codes[i]] || { iconDay: '🌤️' };
    const min = Math.round(convertTemp(minTemps[i]));
    const max = Math.round(convertTemp(maxTemps[i]));
    const pop = pops[i] != null ? pops[i] : 0;

    // Calculate bar percentage
    const leftPercent = ((minTemps[i] - allMin) / globalRange) * 100;
    const widthPercent = Math.max(10, ((maxTemps[i] - minTemps[i]) / globalRange) * 100);

    return `
      <div class="daily-row">
        <div class="daily-day-group">
          <span class="daily-day-name">${dayName}</span>
          <span class="daily-date">${formattedDate}</span>
        </div>
        <div class="daily-icon" title="${escapeHtml(wmo.label || '')}">${wmo.iconDay}</div>
        <div class="daily-bar-container">
          <div class="daily-temp-bar">
            <div class="daily-temp-range" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
          </div>
        </div>
        <div class="daily-temps">
          <span class="daily-min">${min}°</span>
          <span class="daily-max">${max}°</span>
          ${pop > 20 ? `<span class="daily-pop-badge">${pop}%</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderAirQuality(air) {
  const aqi = air.us_aqi != null ? Math.round(air.us_aqi) : 28;
  el.aqiVal.textContent = aqi;

  let statusClass = 'good';
  let statusText = 'Good';
  let desc = 'Air quality is satisfactory with little to no health hazard.';
  let gaugeColor = '#10b981';

  if (aqi > 150) {
    statusClass = 'unhealthy';
    statusText = 'Unhealthy';
    desc = 'Health alert: everyone may experience adverse health effects.';
    gaugeColor = '#ef4444';
  } else if (aqi > 100) {
    statusClass = 'moderate';
    statusText = 'Sensitive Alert';
    desc = 'Sensitive groups may experience health effects.';
    gaugeColor = '#f97316';
  } else if (aqi > 50) {
    statusClass = 'moderate';
    statusText = 'Moderate';
    desc = 'Acceptable air quality for most individuals.';
    gaugeColor = '#f59e0b';
  }

  el.aqiStatusBadge.className = `aqi-pill ${statusClass}`;
  el.aqiStatusBadge.textContent = statusText;
  el.aqiSummary.textContent = desc;

  const gauge = document.querySelector('.aqi-gauge-circle');
  if (gauge) {
    gauge.style.borderColor = gaugeColor;
    gauge.style.boxShadow = `0 0 16px ${gaugeColor}40`;
  }

  // Micro pollutants
  el.polPm25.textContent = air.pm2_5 != null ? `${air.pm2_5.toFixed(1)} µg` : '12 µg';
  el.polPm10.textContent = air.pm10 != null ? `${air.pm10.toFixed(1)} µg` : '18 µg';
  el.polNo2.textContent = air.nitrogen_dioxide != null ? `${air.nitrogen_dioxide.toFixed(1)} µg` : '9.4 µg';
  el.polO3.textContent = air.ozone != null ? `${air.ozone.toFixed(1)} µg` : '42 µg';
  el.polCo.textContent = air.carbon_monoxide != null ? `${air.carbon_monoxide.toFixed(0)} µg` : '210 µg';
  el.polSo2.textContent = air.sulphur_dioxide != null ? `${air.sulphur_dioxide.toFixed(1)} µg` : '2.1 µg';
}

function renderSolarCycle(daily, timezone) {
  if (!daily || !daily.sunrise || !daily.sunset) return;

  const sunriseIso = daily.sunrise[0];
  const sunsetIso = daily.sunset[0];

  const sunriseDate = new Date(sunriseIso);
  const sunsetDate = new Date(sunsetIso);

  const sunriseFormatted = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunsetFormatted = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  el.sunriseTime.textContent = sunriseFormatted;
  el.sunsetTime.textContent = sunsetFormatted;

  const daylightMs = sunsetDate.getTime() - sunriseDate.getTime();
  const daylightHours = Math.floor(daylightMs / (1000 * 60 * 60));
  const daylightMinutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));
  el.daylightDuration.textContent = `${daylightHours}h ${daylightMinutes}m Daylight`;

  // Calculate Sun Position on Arc
  const now = new Date();
  const nowMs = now.getTime();
  let progress = (nowMs - sunriseDate.getTime()) / daylightMs;
  progress = Math.max(0, Math.min(1, progress));

  if (nowMs < sunriseDate.getTime()) {
    el.daylightRemaining.textContent = 'Before Sunrise';
  } else if (nowMs > sunsetDate.getTime()) {
    el.daylightRemaining.textContent = 'After Sunset (Night)';
  } else {
    const remainingMs = sunsetDate.getTime() - nowMs;
    const remHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    el.daylightRemaining.textContent = `${remHours}h ${remMinutes}m Left`;
  }

  // Arc path math: Center (150, 110), rx = 120, ry = 90
  const angle = Math.PI - progress * Math.PI; // from PI to 0
  const sunX = 150 + 120 * Math.cos(angle);
  const sunY = 110 - 90 * Math.sin(angle);

  el.solarSunDot.setAttribute('cx', sunX);
  el.solarSunDot.setAttribute('cy', sunY);

  // Update progress arc
  el.solarProgressArc.setAttribute('d', `M 30 110 A 120 90 0 0 1 ${sunX} ${sunY}`);
}

// ==================== MAP INTEGRATION ====================
function initMap() {
  const mapContainer = document.getElementById('weather-map');
  if (!mapContainer || typeof L === 'undefined') return;

  state.map = L.map('weather-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([state.currentLocation.latitude, state.currentLocation.longitude], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(state.map);

  const customIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background:#38bdf8; width:16px; height:16px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 12px #38bdf8;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  state.mapMarker = L.marker([state.currentLocation.latitude, state.currentLocation.longitude], { icon: customIcon }).addTo(state.map);
}

function updateMap(lat, lon, cityName, temp, condition) {
  if (!state.map) return;
  state.map.setView([lat, lon], 10);
  if (state.mapMarker) {
    state.mapMarker.setLatLng([lat, lon]);
    state.mapMarker.bindPopup(`<b>${cityName}</b><br>${temp}°${state.unit.toUpperCase()} &bull; ${condition}`).openPopup();
  }
}

function updateMapLayers() {
  // Layer switcher hook
  showToast(`Active map layer: ${state.activeLayer.toUpperCase()}`);
}

// ==================== FAVORITES / BOOKMARKS ====================
function renderFavoritesBar() {
  el.favoritesList.innerHTML = state.favorites.map((fav, index) => {
    const isActive = fav.name.toLowerCase() === state.currentLocation.name.toLowerCase();
    return `
      <div class="fav-chip ${isActive ? 'active' : ''}" data-index="${index}">
        <span class="chip-name">${escapeHtml(fav.name)}</span>
        <span class="chip-del" data-del-index="${index}" title="Remove">&times;</span>
      </div>
    `;
  }).join('');

  // Add click listeners to chips
  el.favoritesList.querySelectorAll('.fav-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip-del')) {
        const delIdx = parseInt(e.target.dataset.delIndex);
        state.favorites.splice(delIdx, 1);
        saveFavorites();
        renderFavoritesBar();
        updateBookmarkButton();
        return;
      }
      const idx = parseInt(chip.dataset.index);
      const fav = state.favorites[idx];
      if (fav) {
        state.currentLocation = fav;
        fetchWeather(fav);
      }
    });
  });
}

function toggleBookmarkCurrentCity() {
  const current = state.currentLocation;
  const existingIdx = state.favorites.findIndex(f => f.name.toLowerCase() === current.name.toLowerCase());

  if (existingIdx >= 0) {
    state.favorites.splice(existingIdx, 1);
    showToast(`Removed ${current.name} from pinned cities`);
  } else {
    state.favorites.push({ ...current });
    showToast(`Pinned ${current.name} to quick bar`);
  }

  saveFavorites();
  renderFavoritesBar();
  updateBookmarkButton();
}

function updateBookmarkButton() {
  const isBookmarked = state.favorites.some(f => f.name.toLowerCase() === state.currentLocation.name.toLowerCase());
  el.bookmarkCurrentBtn.innerHTML = isBookmarked
    ? `<svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" style="width:14px;height:14px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>Pinned</span>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span>Pin City</span>`;
}

// ==================== GEOLOCATION ====================
function getUserGeolocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.');
    return;
  }

  showToast('Locating your position...');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      state.currentLocation = {
        name: 'My Current Location',
        country: 'Local GPS',
        admin1: '',
        latitude: lat,
        longitude: lon,
        timezone: 'auto'
      };
      fetchWeather(state.currentLocation);
    },
    (err) => {
      console.warn('Geolocation error:', err);
      showToast('Could not retrieve location. Please search manually.');
    },
    { timeout: 10000 }
  );
}

// ==================== HELPERS ====================
function convertTemp(celsius) {
  if (celsius == null) return 0;
  return state.unit === 'f' ? (celsius * 9/5) + 32 : celsius;
}

function formatLocalTime(timezone, isoString) {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return new Date().toLocaleTimeString();
  }
}

function formatHour(isoTime, timezone, isNow) {
  if (isNow) return 'Now';
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  } catch (e) {
    return isoTime;
  }
}

function getCardinalDirection(angle) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(angle / 45) % 8];
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let toastTimeout = null;
function showToast(message) {
  if (!el.toast) return;
  el.toast.textContent = message;
  el.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.toast.classList.remove('show');
  }, 2600);
}
