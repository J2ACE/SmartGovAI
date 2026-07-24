import { Map, useMap } from "@vis.gl/react-google-maps";
import { useMemo } from "react";

export type HeatmapPoint = {
  lat: number;
  lng: number;
  weight?: number;
};

type GoogleHeatmapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  points: HeatmapPoint[];
  className?: string;
};

// Heatmap layer component using Google Maps Visualization library
function HeatmapLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();

  useMemo(() => {
    if (!map) return;

    const google = window.google;
    if (!google?.maps?.visualization) return;

    const heatmapData = points.map(
      (point) =>
        ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.weight ?? 1,
        } as google.maps.visualization.WeightedLocation)
    );

    const heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 30,
      opacity: 0.8,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });

    return () => {
      heatmap.setMap(null);
    };
  }, [map, points]);

  return null;
}

export function GoogleHeatmap({
  center,
  zoom = 11,
  points,
  className,
}: GoogleHeatmapProps) {
  return (
    <div
      className={
        className ??
        "h-[300px] w-full rounded-xl overflow-hidden border border-border"
      }
    >
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        mapId="bf51a910020fa25a"
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <HeatmapLayer points={points} />
      </Map>
    </div>
  );
}
