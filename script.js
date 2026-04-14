import { geocodeLocation, getPOIsAlongRoute, drawRoute, clearMap } from './routeOptimizer.js';

window.optimizeRoute = async function () {
  const startInput = document.getElementById('start').value.trim();
  const endInput = document.getElementById('end').value.trim();
  const category = document.getElementById('preference').value;

  if (!startInput || !endInput) {
    alert('Please enter both locations.');
    return;
  }

  try {
    clearMap();

    const startCoords = await geocodeLocation(startInput);
    const endCoords = await geocodeLocation(endInput);

    if (!startCoords || !endCoords) {
      alert('Locations not found.');
      return;
    }

    // 1. Find POIs near the start or along the path
    const pois = await getPOIsAlongRoute(startCoords, category);
    
    // 2. Select the first POI found to "optimize" the route
    const bestPOI = pois.length > 0 ? pois[0].position : null;

    // 3. Draw the route (with the POI if available)
    await drawRoute(startCoords, endCoords, bestPOI);

    if (!bestPOI) {
      alert('No matching places found along the way, showing direct route.');
    }

  } catch (err) {
    console.error(err);
    alert('Error calculating optimized route.');
  }
};