import { Map } from "@vis.gl/react-google-maps";

export function GoogleMapDebug() {
  return (
    <div className="w-full h-[400px] border border-red-500">
      <Map
        defaultCenter={{ lat: 28.6139, lng: 77.209 }} // Delhi
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI={false}
      />
    </div>
  );
}
