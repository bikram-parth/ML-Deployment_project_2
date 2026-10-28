
'use strict';

const USE_LOCAL_BACKEND = false;
const LOCAL_API_URL = 'http://127.0.0.1:8000';
const DEPLOYED_API_URL = 'https://ml-deployment-project-2-2.onrender.com/';

// The URL actually used by the app.
const API_BASE_URL = (USE_LOCAL_BACKEND ? LOCAL_API_URL : DEPLOYED_API_URL).replace(/\/+$/, '');
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/`;

// True once the placeholder has been replaced.
const API_CONFIGURED = !API_BASE_URL.includes('YOUR-BACKEND-URL');

const PREDICT_TIMEOUT_MS = 45000;
const HEALTH_TIMEOUT_MS = 20000;
const HEALTH_MIN_INTERVAL_MS = 60000; 

const FIELD_RULES = {
  city_zone: {
    type: 'select',
    label: 'City zone',
    options: ['Financial District', 'Industrial East', 'Suburban North', 'Downtown Core', 'Tech Park', 'Residential West'],
  },
  road_type: {
    type: 'select',
    label: 'Road type',
    options: ['Local Street', 'Arterial', 'Collector', 'Highway'],
  },
  lanes: { type: 'int', label: 'Number of lanes', min: 2, max: 4 },
  speed_limit: { type: 'number', label: 'Speed limit', min: 40, minExclusive: true, max: 90 },
  vehicle_count: { type: 'int', label: 'Vehicle count', min: 54, max: 3162 },
  average_speed: { type: 'number', label: 'Average speed', min: 5, max: 90 },
  traffic_density: { type: 'number', label: 'Traffic density', min: 9, max: 378 },
  queue_length: { type: 'number', label: 'Queue length', min: 0, max: 10111 },
  hour: { type: 'int', label: 'Hour of day', min: 0, max: 23 },
  is_weekend: { type: 'select', label: 'Weekend', options: ['0', '1'], numeric: true },
  weather_condition: {
    type: 'select',
    label: 'Weather condition',
    options: ['Clear', 'Rain', 'Heavy Rain', 'Fog'],
  },
};

const FIELD_NAMES = Object.keys(FIELD_RULES);

// Values the backend may return, with display details for each.
const CONGESTION_INFO = {
  Low: {
    icon: 'fa-circle-check',
    description: 'The model predicts light traffic for the values you entered. Vehicles are expected to move with little delay.',
  },
  Moderate: {
    icon: 'fa-gauge',
    description: 'The model predicts a moderate level of traffic for the values you entered. Some slowdowns may occur.',
  },
  High: {
    icon: 'fa-triangle-exclamation',
    description: 'The model predicts heavy traffic for the values you entered. Noticeable delays are likely.',
  },
  Severe: {
    icon: 'fa-circle-exclamation',
    description: 'The model predicts very heavy traffic for the values you entered. Long delays are likely.',
  },
};

const form = document.getElementById('predict-form');
const submitBtn = document.getElementById('submit-btn');
const submitLabel = document.getElementById('submit-label');
const resetBtn = document.getElementById('reset-btn');

const banner = document.getElementById('form-banner');
const bannerText = document.getElementById('form-banner-text');

const apiStatusBtn = document.getElementById('api-status');
const apiStatusText = document.getElementById('api-status-text');

const resultCard = document.getElementById('result-card');
const predictAgainBtn = document.getElementById('predict-again');

const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

const state = {
  isSubmitting: false,
  healthInFlight: false,
  lastHealthCheck: 0,
};


class ApiError extends Error {
  /**
   * @param {'network'|'timeout'|'http'|'validation'|'invalid-json'|'invalid-response'} kind
   * @param {string} message 
   * @param {object} [extra]  
   */
  constructor(kind, message, extra = {}) {
    super(message);
    this.kind = kind;
    this.extra = extra;
  }
}

function setApiStatus(status) {
  const labels = {
    checking: 'Checking API…',
    online: 'AI Engine Ready',
    offline: 'API Offline',
    unconfigured: 'API Not Configured',
  };
  apiStatusBtn.dataset.status = status;
  apiStatusText.textContent = labels[status];
}

async function checkApiHealth({ force = false } = {}) {
  if (!API_CONFIGURED) {
    setApiStatus('unconfigured');
    return;
  }
  if (state.healthInFlight) return;
  if (!force && Date.now() - state.lastHealthCheck < HEALTH_MIN_INTERVAL_MS) return;

  state.healthInFlight = true;
  setApiStatus('checking');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(HEALTH_ENDPOINT, { method: 'GET', signal: controller.signal });
    setApiStatus(response.ok ? 'online' : 'offline');
  } catch (error) {
   
    setApiStatus('offline');
  } finally {
    clearTimeout(timer);
    state.healthInFlight = false;
    state.lastHealthCheck = Date.now();
  }
}

function validateField(name) {
  const rule = FIELD_RULES[name];
  const raw = form.elements[name].value.trim();

  if (raw === '') {
    return rule.type === 'select' ? `Please select a ${rule.label.toLowerCase()}.` : `${rule.label} is required.`;
  }

  if (rule.type === 'select') {
    return rule.options.includes(raw) ? '' : `Please choose one of the listed options.`;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) return 'Enter a valid number.';
  if (rule.type === 'int' && !Number.isInteger(value)) return 'Enter a whole number (no decimals).';

  if (rule.minExclusive ? value <= rule.min : value < rule.min) {
    return rule.minExclusive
      ? `Must be greater than ${rule.min}.`
      : `Must be at least ${rule.min}.`;
  }
  if (value > rule.max) return `Must be ${rule.max} or less.`;

  return '';
}


function setFieldError(name, message) {
  const input = form.elements[name];
  const errorEl = document.getElementById(`${name}-error`);
  const wrapper = input.closest('.field');

  errorEl.textContent = message;
  wrapper.classList.toggle('has-error', Boolean(message));
  if (message) {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }
}

function validateForm() {
  const invalid = [];
  FIELD_NAMES.forEach((name) => {
    const message = validateField(name);
    setFieldError(name, message);
    if (message) invalid.push(name);
  });
  return invalid;
}

function clearAllFieldErrors() {
  FIELD_NAMES.forEach((name) => setFieldError(name, ''));
}

function showBanner(message, tone = 'error') {
  bannerText.textContent = message;
  banner.dataset.tone = tone;
  banner.hidden = false;
}

function clearBanner() {
  banner.hidden = true;
  bannerText.textContent = '';
}

function collectPayload() {
  const payload = {};
  FIELD_NAMES.forEach((name) => {
    const rule = FIELD_RULES[name];
    const raw = form.elements[name].value.trim();
    const isNumeric = rule.type === 'int' || rule.type === 'number' || rule.numeric;
    payload[name] = isNumeric ? Number(raw) : raw;
  });
  return payload;
}

async function requestPrediction(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PREDICT_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(PREDICT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('timeout', 'The server took too long to respond. If it was asleep, wait a moment and try again.');
    }

    throw new ApiError('network', 'Could not reach the prediction server. Check your connection and the API URL, then try again.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch (ignored) {
     
    }

    if (response.status === 422) {
      throw new ApiError('validation', 'The server rejected some of the values. Please check the highlighted fields.', {
        status: 422,
        fieldErrors: extractFieldErrors(body),
      });
    }
    if (response.status === 404) {
      throw new ApiError('http', 'The /predict endpoint was not found (404). Check the API URL in script.js.', { status: 404 });
    }
    if (response.status >= 500) {
      throw new ApiError('http', `The server hit an error (${response.status}). Please try again in a moment.`, { status: response.status });
    }
    throw new ApiError('http', `The request failed with status ${response.status}.`, { status: response.status });
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError('invalid-json', 'The server sent a response that is not valid JSON.');
  }

  const level = data && data.congestion_level;
  if (typeof level !== 'string' || !Object.prototype.hasOwnProperty.call(CONGESTION_INFO, level)) {
    throw new ApiError('invalid-response', 'The server returned an unexpected result, so no prediction is shown.');
  }
  return level;
}

function extractFieldErrors(body) {
  const result = {};
  if (!body || !Array.isArray(body.detail)) return result;

  body.detail.forEach((item) => {
    const loc = Array.isArray(item.loc) ? item.loc : [];
    const field = loc[loc.length - 1];
    if (FIELD_NAMES.includes(field) && !result[field]) {
      result[field] = typeof item.msg === 'string' ? item.msg : 'Invalid value.';
    }
  });
  return result;
}

function handleApiError(error) {
  if (!(error instanceof ApiError)) {
    showBanner('Something unexpected went wrong. Please try again.');
    return;
  }

  if (error.kind === 'network' || error.kind === 'timeout') {
    setApiStatus('offline');
  }

  if (error.kind === 'validation') {
    const fieldErrors = error.extra.fieldErrors || {};
    Object.entries(fieldErrors).forEach(([name, message]) => setFieldError(name, message));
    const firstInvalid = Object.keys(fieldErrors)[0];
    if (firstInvalid) form.elements[firstInvalid].focus();
  }

  showBanner(error.message);
}

function setLoading(isLoading) {
  state.isSubmitting = isLoading;
  submitBtn.disabled = isLoading;
  resetBtn.disabled = isLoading;
  submitBtn.classList.toggle('is-loading', isLoading);
  submitBtn.setAttribute('aria-busy', String(isLoading));
  submitLabel.textContent = isLoading ? 'Predicting…' : 'Predict Congestion';
}

function hideResult() {
  resultCard.hidden = true;
  resultCard.classList.remove('reveal');
  resultCard.dataset.level = '';
}

/** Fill the result card with textContent only (never innerHTML) and play the reveal. */
function renderResult(level, payload, requestedAt) {
  const info = CONGESTION_INFO[level];

  resultCard.dataset.level = level; // CSS picks the color from this attribute
  document.getElementById('result-icon').className = `fa-solid ${info.icon}`;
  document.getElementById('result-level').textContent = level;
  document.getElementById('result-description').textContent = info.description;

  const timeEl = document.getElementById('result-time');
  timeEl.textContent = requestedAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' });
  timeEl.dateTime = requestedAt.toISOString();

  document.getElementById('sum-road').textContent = payload.road_type;
  document.getElementById('sum-zone').textContent = payload.city_zone;
  document.getElementById('sum-weather').textContent = payload.weather_condition;
  document.getElementById('sum-vehicles').textContent = `${payload.vehicle_count} vehicles`;
  document.getElementById('sum-speed').textContent = `${payload.average_speed} km/h`;

  resultCard.hidden = false;
  resultCard.classList.remove('reveal');
  void resultCard.offsetWidth; 
  resultCard.classList.add('reveal');

  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  resultCard.focus({ preventScroll: true });
}

/* -----------------------------------------------------
   8. FORM EVENTS
   ----------------------------------------------------- */

async function handleSubmit(event) {
  event.preventDefault(); // stay on the page
  if (state.isSubmitting) return; // block duplicate submissions

  clearBanner();
  hideResult(); // never leave an old result visible next to a new request

  const invalidFields = validateForm();
  if (invalidFields.length > 0) {
    form.elements[invalidFields[0]].focus();
    showBanner('Please fix the highlighted fields and try again.');
    return;
  }

  if (!API_CONFIGURED) {
    setApiStatus('unconfigured');
    showBanner('The backend URL is not set yet. Open script.js and replace YOUR-BACKEND-URL with your Render URL.', 'warning');
    return;
  }

  const payload = collectPayload();
  const requestedAt = new Date();
  setLoading(true);

  try {
    const level = await requestPrediction(payload);
    setApiStatus('online');
    state.lastHealthCheck = Date.now();
    renderResult(level, payload, requestedAt);
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false);
  }
}

function handleReset() {
  clearAllFieldErrors();
  clearBanner();
  hideResult();
}

function handlePredictAgain() {
  document.getElementById('predict').scrollIntoView({ behavior: 'smooth' });
  form.elements.city_zone.focus({ preventScroll: true });
}

/** Validate a field when the user leaves it, and re-check while fixing an error. */
function attachFieldValidation() {
  FIELD_NAMES.forEach((name) => {
    const input = form.elements[name];
    input.addEventListener('blur', () => setFieldError(name, validateField(name)));

    const recheck = () => {
      if (input.closest('.field').classList.contains('has-error')) {
        setFieldError(name, validateField(name));
      }
    };
    input.addEventListener('input', recheck);
    input.addEventListener('change', recheck);
  });
}

function setMenuOpen(isOpen) {
  siteNav.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
}

function initNavigation() {
  navToggle.addEventListener('click', () => setMenuOpen(!siteNav.classList.contains('is-open')));

  // Close the mobile menu after choosing a link or pressing Escape
  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  // Highlight the nav link of the section currently on screen
  const links = Array.from(siteNav.querySelectorAll('.nav-link'));
  const sections = links.map((link) => document.querySelector(link.getAttribute('href')));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => section && observer.observe(section));
  }
}

function init() {
  form.addEventListener('submit', handleSubmit);
  form.addEventListener('reset', handleReset);
  predictAgainBtn.addEventListener('click', handlePredictAgain);
  attachFieldValidation();
  initNavigation();

  // Manual re-check when the user clicks the status pill
  apiStatusBtn.addEventListener('click', () => checkApiHealth({ force: true }));

  // One check on load, then only when the tab becomes visible again and the last check is stale
  checkApiHealth({ force: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkApiHealth();
  });
}

init();
