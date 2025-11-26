import { createServer } from 'node:http';
import { parse } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT_DIR = resolve(process.cwd());
const PORT = process.env.PORT || 3000;
loadDotEnv();
const OPEN_WEATHER_TOKEN = process.env.OPEN_WEATHER_TOKEN || process.env.OPENWEATHER_API_KEY;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function loadDotEnv() {
  try {
    const envPath = join(ROOT_DIR, '.env');
    if (!existsSync(envPath)) return;
    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    console.warn('Could not read .env file:', error);
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

async function fetchOneCall(queryString) {
  const endpoints = [
    { url: 'https://api.openweathermap.org/data/3.0/onecall', label: 'onecall3' },
    { url: 'https://api.openweathermap.org/data/2.5/onecall', label: 'onecall2' },
  ];

  for (const endpoint of endpoints) {
    const resp = await fetch(`${endpoint.url}?${queryString}`);
    if (resp.ok) {
      return { data: await resp.json(), source: endpoint.label };
    }
    // If unauthorized/forbidden/not found, try next endpoint; otherwise surface the error.
    if (![401, 403, 404].includes(resp.status)) {
      const text = await resp.text().catch(() => '');
      throw new Error(`One Call request failed (${resp.status}): ${text.slice(0, 200)}`);
    }
  }

  return null;
}

async function fetchWeather({ lat, lng }) {
  if (!OPEN_WEATHER_TOKEN) {
    throw new Error('OPEN_WEATHER_TOKEN is not set on the server.');
  }

  const params = new URLSearchParams({
    lat,
    lon: lng,
    appid: OPEN_WEATHER_TOKEN,
    units: 'metric',
  });

  const paramsString = params.toString();

  const oneCall = await fetchOneCall(paramsString);
  if (!oneCall?.data) {
    throw new Error('OpenWeather One Call is not available for this request (v3 and v2.5 both failed).');
  }

  return {
    weather: oneCall.data,
    // Provide daily as forecastList for existing rendering; renderDaily handles shape differences.
    forecastList: oneCall.data.daily || [],
    meta: { oneCallSource: oneCall.source },
  };
}

async function handleApiWeather(req, res, query) {
  const lat = Number(query.lat);
  const lng = Number(query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return sendJson(res, 400, { error: 'Invalid lat/lng parameters.' });
  }

  try {
    const data = await fetchWeather({ lat, lng });
    return sendJson(res, 200, data);
  } catch (error) {
    console.error('Weather API error:', error);
    return sendJson(res, 500, { error: 'Failed to fetch weather data.' });
  }
}

async function serveStatic(req, res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const normalized = normalize(safePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(ROOT_DIR, normalized);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const data = await readFile(filePath);
    const contentType = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = createServer((req, res) => {
  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/favicon.ico') {
    return serveStatic(req, res, '/favicon.svg');
  }

  if (req.method === 'GET' && pathname === '/api/weather') {
    return handleApiWeather(req, res, query);
  }

  if (req.method === 'GET') {
    return serveStatic(req, res, pathname);
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
