const envConfig = window.__DROPLET_CONFIG__ || window.__DROPLET_PUBLIC_CONFIG__ || {};

export const CONFIG = {
  MAPBOX_TOKEN: envConfig.MAPBOX_TOKEN || '',
  API_BASE: envConfig.API_BASE || '',
};

export const DEFAULT_LOCATION = {
  lng: 139.7263785,
  lat: 35.6652064,
  label: 'Tokyo, JP',
};

export function validateConfig() {
  if (!CONFIG.MAPBOX_TOKEN) {
    throw new Error('Missing Mapbox token. Provide MAPBOX_TOKEN in env.js or env.public.js.');
  }
}
