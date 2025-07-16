import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface FitBoundsProps {
  bounds: L.LatLngExpression[];
}

const MapFitBounds = ({ bounds }: FitBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.length === 0) return;

    const leafletBounds = L.latLngBounds(bounds);
    map.fitBounds(leafletBounds, {
      padding: [50, 50],
    });
  }, [bounds, map]);

  return null;
};

export default MapFitBounds;
