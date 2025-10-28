export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
}

/**
 * Calculate distance between two points using simplified planar approximation
 * For more accuracy, use Haversine formula or libraries like geolib
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  // Simplified planar approximation (adequate for short distances)
  return Math.sqrt(dLat * dLat + dLon * dLon) * 111.32;
}

/**
 * Calculate speed in km/h between current and previous point
 */
export function calculateSpeedKmH(currentIndex: number, routeData: RoutePoint[]): string {
  if (currentIndex === 0 || routeData.length <= 1) return '0.00';

  const currPoint = routeData[currentIndex];
  const prevPoint = routeData[currentIndex - 1];

  if (!prevPoint || !currPoint) return '0.00';

  const distanceKm = calculateDistanceKm(
    prevPoint.lat,
    prevPoint.lng,
    currPoint.lat,
    currPoint.lng
  );

  const timeDeltaMs =
    new Date(currPoint.timestamp).getTime() - new Date(prevPoint.timestamp).getTime();
  const timeDeltaHours = timeDeltaMs / (1000 * 60 * 60); // Convert ms to hours

  if (timeDeltaHours <= 0) return 'N/A';

  const speed = distanceKm / timeDeltaHours; // Speed in km/h
  return speed.toFixed(2);
}

/**
 * Calculate total distance traveled along the route
 */
export function calculateTotalDistance(routeData: RoutePoint[]): string {
  if (routeData.length <= 1) return '0.00';

  let totalKm = 0;
  for (let i = 1; i < routeData.length; i++) {
    totalKm += calculateDistanceKm(
      routeData[i - 1].lat,
      routeData[i - 1].lng,
      routeData[i].lat,
      routeData[i].lng
    );
  }

  return totalKm.toFixed(2);
}
