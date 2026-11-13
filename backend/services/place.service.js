const prisma = require('../lib/prismaClient');

const FSQ_API_KEY = process.env.FOURSQUARE_API_KEY;
const FSQ_BASE = 'https://api.foursquare.com/v3/places/search';
const CACHE_TTL_DAYS = 30;

async function searchPlaces(query, limit = 10) {
  if (FSQ_API_KEY) {
    const url = new URL(FSQ_BASE);
    url.searchParams.set('query', query);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('fields', 'fsq_id,name,location,geocodes');

    let results;
    try {
      const response = await fetch(url, {
        headers: { Authorization: FSQ_API_KEY },
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        throw new Error(`Foursquare respondio ${response.status}`);
      }
      const data = await response.json();
      results = data.results || [];
    } catch (err) {
      console.error('Error llamando a Foursquare:', err.message);
      // Fallback: devolver lo que haya en cache local que coincida
      return searchCachedPlaces(query, limit);
    }

    const places = [];
    for (const r of results) {
      const place = await upsertPlace({
        source: 'foursquare',
        sourceId: r.fsq_id,
        name: r.name,
        locality: r.location?.locality ?? null,
        region: r.location?.region ?? null,
        country: r.location?.country ?? null,
        lat: r.geocodes?.main?.latitude ?? null,
        lng: r.geocodes?.main?.longitude ?? null
      });
      places.push(toPublicPlace(place));
    }
    return places;
  }

  // Sin API key: fallback a Nominatim (OpenStreetMap), no requiere key
  return searchNominatim(query, limit);
}

async function searchNominatim(query, limit) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'XClone/1.0 (location feature)' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) throw new Error(`Nominatim responsio ${response.status}`);

    const results = await response.json();

    const places = [];
    for (const r of results) {
      const [lat, lng] = [parseFloat(r.lat), parseFloat(r.lon)];
      const parts = (r.display_name || '').split(',').map(s => s.trim()).filter(Boolean);
      const place = await upsertPlace({
        source: 'osm',
        sourceId: String(r.osm_id ?? r.place_id),
        name: r.name || parts[0] || 'Lugar sin nombre',
        locality: parts[parts.length - 3] ?? null,
        region: parts[parts.length - 2] ?? null,
        country: parts[parts.length - 1] ?? null,
        lat,
        lng
      });
      places.push(toPublicPlace(place));
    }
    return places;
  } catch (err) {
    console.error('Error llamando a Nominatim:', err.message);
    return searchCachedPlaces(query, limit);
  }
}

async function searchCachedPlaces(query, limit) {
  const places = await prisma.place.findMany({
    where: { name: { contains: query, mode: 'insensitive' } },
    take: limit
  });
  return places.map(toPublicPlace);
}

async function upsertPlace(data) {
  if (!data.sourceId || !data.name) {
    throw new Error('Place requiere sourceId y name');
  }

  const existing = await prisma.place.findUnique({
    where: { source_sourceId: { source: data.source, sourceId: data.sourceId } }
  });

  if (existing) {
    const ageDays = (Date.now() - existing.updatedAt.getTime()) / 86_400_000;
    if (ageDays > CACHE_TTL_DAYS) {
      return prisma.place.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          locality: data.locality,
          region: data.region,
          country: data.country,
          lat: data.lat,
          lng: data.lng
        }
      });
    }
    return existing;
  }
  return prisma.place.create({ data });
}

async function getOrCreatePlace(data){
  const place = await upsertPlace(data);
  return toPublicPlace(place);
}

async function getPlaceById(id) {
  const place = await prisma.place.findUnique({
    where: { id }
  });
  if (!place) return null;
  return toPublicPlace(place);
}

function toPublicPlace(place) {
  const { lat, lng, updatedAt, ...publicPlace } = place;
  return publicPlace;
}

module.exports = {
  searchPlaces,
  getOrCreatePlace,
  getPlaceById
};