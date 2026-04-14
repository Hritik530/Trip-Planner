const API_KEY = 'YOUR_HERE_API_KEY'; // Replace with your HERE API key from https://developer.here.com/

const platform = new H.service.Platform({
  apikey: 'PASTE_YOUR_LONG_KEY_HERE' 
});

const maptypes = platform.createDefaultLayers();
const map = new H.Map(
  document.getElementById('mapContainer'),
  maptypes.vector.normal.map,
  {
    zoom: 13,
    center: { lat: 12.9716, lng: 77.5946 }
  }
);

new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
const ui = H.ui.UI.createDefault(map, maptypes);

export function clearMap() {
  map.removeObjects(map.getObjects());
}

export async function geocodeLocation(query) {
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].position;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
}

export async function getPOIsAlongRoute(startCoords, category) {
  const url = `https://discover.search.hereapi.com/v1/discover?at=${startCoords.lat},${startCoords.lng}&categories=${category}&limit=5&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('POI search error:', error);
    return [];
  }
}

export async function drawRoute(start, end, waypoint = null) {
  let url = `https://router.hereapi.com/v8/routes?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&transportMode=car&return=polyline,summary&apiKey=${API_KEY}`;
  if (waypoint) {
    url += `&via=${waypoint.lat},${waypoint.lng}`;
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Add Start/End Markers
      map.addObject(new H.map.Marker(start));
      map.addObject(new H.map.Marker(end));
      if(waypoint) map.addObject(new H.map.Marker(waypoint));

      // Draw Line
      route.sections.forEach((section) => {
        const linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
        const routeLine = new H.map.Polyline(linestring, {
          style: { strokeColor: 'dodgerblue', lineWidth: 5 }
        });
        map.addObject(routeLine);
        map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
      });
      
      return route;
    } else {
      throw new Error('No route found');
    }
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
}