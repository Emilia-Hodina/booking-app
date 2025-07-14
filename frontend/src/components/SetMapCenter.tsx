// src/components/SetMapCenter.tsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface Props {
  center: L.LatLngExpression;
}

const SetMapCenter = ({ center }: Props) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center); // Recenter the map
  }, [center.toString()]);

  return null;
};

export default SetMapCenter;
