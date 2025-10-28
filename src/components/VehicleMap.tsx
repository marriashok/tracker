import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { AnimatedMarker } from './AnimatedMarker';
import { ControlPanel } from './ControlPanel';
import { calculateSpeedKmH, type RoutePoint } from '@/utils/mapUtils';
import 'leaflet/dist/leaflet.css';

const INITIAL_CENTER: [number, number] = [17.385044, 78.486671];
const UPDATE_INTERVAL = 2000; // 2 seconds

export function VehicleMap() {
  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load route data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/dummy-route.json');
        const data = await response.json();

        const transformedData: RoutePoint[] = data.map((p: any) => ({
          lat: p.latitude,
          lng: p.longitude,
          timestamp: p.timestamp,
        }));

        setRouteData(transformedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading route data:', error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Simulation logic
  useEffect(() => {
    if (isPlaying && routeData.length > 0 && currentIndex < routeData.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= routeData.length - 1) {
            setIsPlaying(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, UPDATE_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, routeData]);

  const togglePlay = () => {
    if (currentIndex >= routeData.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  // Vehicle marker icon
  const vehicleIcon = L.divIcon({
    className: 'vehicle-marker',
    html: '<div class="w-8 h-8 flex items-center justify-center text-2xl drop-shadow-lg">🚗</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading route data...</p>
        </div>
      </div>
    );
  }

  if (routeData.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <p className="text-destructive">Failed to load route data</p>
      </div>
    );
  }

  const currentPosition = routeData[currentIndex] || routeData[0];
  const fullRouteCoords: [number, number][] = routeData.map((p) => [p.lat, p.lng]);
  const traveledRouteCoords: [number, number][] = routeData
    .slice(0, currentIndex + 1)
    .map((p) => [p.lat, p.lng]);

  return (
    <div className="h-screen w-full relative">
      {/* @ts-ignore - React-Leaflet types issue */}
      <MapContainer
        center={INITIAL_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* @ts-ignore - React-Leaflet types issue */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Full planned route (gray) */}
        <Polyline
          pathOptions={{
            color: 'hsl(var(--route-planned))',
            weight: 4,
            opacity: 0.4,
            dashArray: '10, 10',
          }}
          positions={fullRouteCoords}
        />

        {/* Traveled route (accent color) */}
        {traveledRouteCoords.length > 1 && (
          <Polyline
            pathOptions={{
              color: 'hsl(var(--route-active))',
              weight: 5,
              opacity: 0.9,
            }}
            positions={traveledRouteCoords}
          />
        )}

        {/* Animated vehicle marker */}
        <AnimatedMarker
          position={[currentPosition.lat, currentPosition.lng]}
          icon={vehicleIcon}
          duration={UPDATE_INTERVAL - 200}
        />
      </MapContainer>

      {/* Control panel overlay */}
      <ControlPanel
        currentPosition={currentPosition}
        isPlaying={isPlaying}
        speed={calculateSpeedKmH(currentIndex, routeData)}
        currentIndex={currentIndex}
        totalPoints={routeData.length}
        onTogglePlay={togglePlay}
        onReset={resetSimulation}
      />

      {/* Bottom info bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 bg-card/95 backdrop-blur-md border border-glass-border rounded-full shadow-[var(--shadow-glass)]">
        <p className="text-sm text-muted-foreground">
          Point <span className="font-semibold text-foreground">{currentIndex + 1}</span> of{' '}
          <span className="font-semibold text-foreground">{routeData.length}</span>
        </p>
      </div>
    </div>
  );
}
