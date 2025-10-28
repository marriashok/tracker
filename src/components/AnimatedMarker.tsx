import { useEffect, useRef, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

interface AnimatedMarkerProps {
  position: [number, number];
  icon: L.DivIcon;
  duration?: number;
}

export function AnimatedMarker({ position, icon, duration = 1800 }: AnimatedMarkerProps) {
  const [currentPos, setCurrentPos] = useState<[number, number]>(position);
  const previousPosRef = useRef<[number, number]>(position);
  const animationRef = useRef<number | null>(null);
  const map = useMap();

  useEffect(() => {
    const [newLat, newLng] = position;
    const [prevLat, prevLng] = previousPosRef.current;

    // If position hasn't changed, skip animation
    if (prevLat === newLat && prevLng === newLng) {
      return;
    }

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(1, elapsedTime / duration);

      // Linear interpolation
      const lat = prevLat + (newLat - prevLat) * progress;
      const lng = prevLng + (newLng - prevLng) * progress;

      setCurrentPos([lat, lng]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentPos([newLat, newLng]);
        previousPosRef.current = [newLat, newLng];
        map.panTo([newLat, newLng], { animate: true, duration: 1 });
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    previousPosRef.current = position;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [position, duration, map]);

  // @ts-ignore - React-Leaflet icon prop type issue
  return <Marker position={currentPos} icon={icon} />;
}
