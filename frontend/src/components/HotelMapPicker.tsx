import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";

interface LatLng {
  lat: number;
  lng: number;
}

interface HotelMapPickerProps {
  onLocationChange: (latlng: LatLng) => void;
  initialPosition?: LatLng;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to update the map center dynamically when initialPosition changes
const MapCenterUpdater = ({ position }: { position?: LatLng }) => {
  const map = useMapEvents({});

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return null;
};

const LocationMarker = ({
  onChange,
  initialPosition,
}: {
  onChange: (latlng: LatLng) => void;
  initialPosition?: LatLng;
}) => {
  const [position, setPosition] = useState<LatLng | undefined>(initialPosition);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng);
    },
  });

  if (!map) return null;

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const newPos = marker.getLatLng();
      const newLatLng = { lat: newPos.lat, lng: newPos.lng };
      setPosition(newLatLng);
      onChange(newLatLng);
    }
  };

  return position ? (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      eventHandlers={{ dragend: handleDragEnd }}
      ref={(ref) => {
        markerRef.current = ref as L.Marker;
      }}
    />
  ) : null;
};

const HotelMapPicker = ({
  onLocationChange,
  initialPosition,
}: HotelMapPickerProps) => {
  return (
    <div className="border rounded mt-2 overflow-hidden">
      <MapContainer
        center={initialPosition || [45.7489, 21.2087]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapCenterUpdater position={initialPosition} />
        <LocationMarker
          onChange={onLocationChange}
          initialPosition={initialPosition}
        />
      </MapContainer>
    </div>
  );
};

export default HotelMapPicker;
