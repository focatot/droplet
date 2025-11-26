# droplet
weather station

## Local setup
1) Copy `env.sample.js` to `env.js` and set your `MAPBOX_TOKEN` (client-side only; file stays out of git).
2) Set your OpenWeather API key before starting the server: `export OPEN_WEATHER_TOKEN=your-openweather-token` (or put it in a local `.env` file).
3) Run `npm start` (Node 18+) to serve the app at `http://localhost:3000`. Static files and `/api/weather` are served from the same process.

## Deploying the API (example: Render)
- Deploy `server.js` as a Node service (build: `npm install`, start: `npm start`).
- Set env var `OPEN_WEATHER_TOKEN` on the host. The server sends CORS headers.
- Use the deployed base URL (e.g., `https://droplet-6mr0.onrender.com`).

## Hosting the frontend (GitHub Pages)
- `env.public.js` is tracked and loaded first. Set:
  - `MAPBOX_TOKEN`: a scoped Mapbox public token allowing `https://focatot.github.io` (and your API host if needed).
  - `API_BASE`: your deployed API URL (e.g., `https://droplet-6mr0.onrender.com`).
- `env.js` (gitignored) can override locally.
- Push to Pages; the frontend calls `${API_BASE}/api/weather` and uses the public Mapbox token.

## Security
- Mapbox tokens are public by design; scope them to allowed domains and capabilities, and rotate if leaked.
- Keep OpenWeather keys server-side only; never ship them to the browser.
