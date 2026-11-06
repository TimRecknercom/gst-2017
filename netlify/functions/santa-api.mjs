// Serves Santa Tracker live data in the format the 2018 web app expects.
//
// Google's santa-api still answers, but it now returns a newer format and
// real (present-day) times, and its route data is for a later year. The 2018
// app runs on a simulated 2018 clock, so this function:
//   ?op=info  -> 2018-style /info response on the simulated 2018 clock
//   ?op=route -> Google's route, shifted so takeoff is 24 Dec 2018 10:00 UTC
const GOOGLE_INFO = "https://santa-api.appspot.com/info?client=web&language=en";
const TAKEOFF_2018 = Date.UTC(2018, 11, 24, 10, 0, 0);
const SIM_YEAR = 2018;

function simulatedNow() {
  const d = new Date();
  d.setUTCFullYear(SIM_YEAR);
  return d.getTime();
}

function json(body, cacheControl) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(cacheControl ? { "netlify-cdn-cache-control": cacheControl } : {}),
    },
  });
}

async function googleRouteUrl() {
  const res = await fetch(GOOGLE_INFO + "&rand=" + Math.random());
  if (!res.ok) throw new Error("santa-api info " + res.status);
  const info = await res.json();
  const route = Array.isArray(info.route) ? info.route[0] : info.route;
  if (!route) throw new Error("no route in santa-api info");
  return route;
}

async function shiftedRoute() {
  const res = await fetch(await googleRouteUrl());
  if (!res.ok) throw new Error("route " + res.status);
  const data = await res.json();
  const destinations = data.destinations || [];
  if (!destinations.length) throw new Error("empty route");

  const delta = TAKEOFF_2018 - destinations[0].departure;
  const shift = (t) => (typeof t === "number" ? t + delta : t);
  return {
    destinations: destinations.map((d) => ({
      ...d,
      arrival: shift(d.arrival),
      departure: shift(d.departure),
      // The 2018 app expects a Panoramio photo list (a retired Google service);
      // an empty list keeps its city-photo panel from crashing.
      details: d.details ? { panoramio: [], ...d.details } : d.details,
    })),
    stream: (data.stream || []).map((s) => ({ ...s, timestamp: shift(s.timestamp) })),
  };
}

export default async (req, context) => {
  const op = new URL(req.url).searchParams.get("op") || "info";

  if (op === "route") {
    try {
      // Cache the (large) route at the CDN; keep serving it if Google is down.
      return json(await shiftedRoute(),
        "public, durable, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000");
    } catch (err) {
      console.error("route failed:", err.message);
      return json({ destinations: [] });
    }
  }

  // Preview mode (?preview=tracker on the page) sends its own simulated time,
  // limited to the 2018 Christmas Eve flight window.
  const requested = Number(new URL(req.url).searchParams.get("now"));
  const previewNow =
    requested >= TAKEOFF_2018 - 86400000 && requested <= TAKEOFF_2018 + 2 * 86400000 ? requested : null;

  const geo = context.geo || {};
  const info = {
    status: "OK",
    now: previewNow ?? simulatedNow(),
    timeOffset: 0,
    refresh: 60000,
    route: "/.netlify/functions/santa-api?op=route&v=2",
  };
  if (isFinite(geo.latitude) && isFinite(geo.longitude)) {
    info.location = geo.latitude + "," + geo.longitude;
  }
  return json(info);
};
