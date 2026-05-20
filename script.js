/* ============================================================
   Weather App – script.js
   API: https://www.weatherapi.com/
   ============================================================ */

const API_KEY  = '51aaa3a8f7aa47559a3101837262005';
const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

/* ── DOM ── */
const cityInput   = document.getElementById('cityInput');
const findBtn     = document.getElementById('findBtn');
const errorMsg    = document.getElementById('errorMsg');
const weatherGrid = document.getElementById('weatherGrid');

/* ── Helpers ── */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getDayName(dateStr) {
  return DAYS[new Date(dateStr + 'T00:00:00').getDay()];
}
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}${MONTHS[d.getMonth()]}`;
}

/* Render temp as: 31<sup>°</sup>C */
function tempHTML(c) {
  return `${Math.round(c)}<sup>°</sup>C`;
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function setHTML(id, v) { const el = document.getElementById(id); if (el) el.innerHTML  = v; }
function setIcon(id, src, alt) {
  const el = document.getElementById(id);
  if (el) { el.src = src; el.alt = alt; el.style.display = src ? 'block' : 'none'; }
}

/* ── Render ── */
function renderWeather(data) {
  const fc  = data.forecast.forecastday;
  const cur = data.current;
  const t0  = fc[0];

  // Today
  setText('day0',      getDayName(t0.date));
  setText('date0',     formatDate(t0.date));
  setText('city0',     data.location.name);
  setHTML('temp0',     tempHTML(cur.temp_c));
  setIcon('iconImg0',  'https:' + cur.condition.icon, cur.condition.text);
  setText('cond0',     cur.condition.text);
  setText('humidity0', cur.humidity);
  setText('wind0',     Math.round(cur.wind_kph));
  setText('dir0',      cur.wind_dir);

  // Day 2
  const d1 = fc[1];
  setText('day1',     getDayName(d1.date));
  setHTML('temp1',    tempHTML(d1.day.maxtemp_c));
  setText('low1',     `${Math.round(d1.day.mintemp_c)}°`);
  setText('cond1',    d1.day.condition.text);
  setIcon('iconImg1', 'https:' + d1.day.condition.icon, d1.day.condition.text);

  // Day 3
  const d2 = fc[2];
  setText('day2',     getDayName(d2.date));
  setHTML('temp2',    tempHTML(d2.day.maxtemp_c));
  setText('low2',     `${Math.round(d2.day.mintemp_c)}°`);
  setText('cond2',    d2.day.condition.text);
  setIcon('iconImg2', 'https:' + d2.day.condition.icon, d2.day.condition.text);

  clearError();
}

/* ── Fetch ── */
async function fetchWeather(city) {
  if (!city.trim()) { showError('Please enter a city name.'); return; }
  weatherGrid.classList.add('loading');
  clearError();
  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&aqi=no&alerts=no`);
    if (!res.ok) throw new Error(res.status === 400 ? 'City not found.' : 'Server error, try again.');
    renderWeather(await res.json());
  } catch (e) {
    showError(e.message);
  } finally {
    weatherGrid.classList.remove('loading');
  }
}

function showError(msg) { if (errorMsg) errorMsg.textContent = msg; }
function clearError()   { if (errorMsg) errorMsg.textContent = ''; }

/* ── Events ── */
findBtn.addEventListener('click', () => fetchWeather(cityInput.value));
cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchWeather(cityInput.value); });

/* ── Nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

/* ── Auto-detect location on load ── */
function loadDefault() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
      ()  => fetchWeather('Cairo')
    );
  } else {
    fetchWeather('Cairo');
  }
}
loadDefault();
