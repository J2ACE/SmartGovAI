import { Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

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

function HeatmapLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const google = (window as any).google;
    if (!google?.maps?.visualization?.HeatmapLayer) {
      console.warn("Google Maps HeatmapLayer visualization library is not available.");
      return;
    }

    let heatmap: any = null;
    try {
      const heatmapData = points.map(
        (point) =>
          ({
            location: new google.maps.LatLng(point.lat, point.lng),
            weight: point.weight ?? 1,
          })
      );

      heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 30,
        opacity: 0.8,
      });
    } catch (err) {
      console.warn("Google Maps HeatmapLayer initialization handled gracefully:", err);
    }

    return () => {
      if (heatmap) {
        try {
          heatmap.setMap(null);
        } catch (e) {
          // ignore cleanup error
        }
      }
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
