// src/components/HotelLocationMap.tsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { HotelType } from "../../../backend/src/shared/types";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const HotelLocationMap = ({ hotel }: { hotel: HotelType }) => {
  if (
    !hotel.location ||
    typeof hotel.location.lat !== "number" ||
    typeof hotel.location.lng !== "number"
  ) {
    return null;
  }

  return (
    <div className="border rounded mt-2 overflow-hidden h-[300px]">
      <MapContainer
        center={[hotel.location.lat, hotel.location.lng]}
        zoom={14}
        scrollWheelZoom={true} // ✅ keep zoom via scroll
        style={{ height: "100%", width: "100%" }}
        dragging={true} // ✅ allow panning
        doubleClickZoom={true}
        zoomControl={true}
        touchZoom={true}
        keyboard={true}
        boxZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={[hotel.location.lat, hotel.location.lng]}
          icon={markerIcon}
          draggable={false} // ✅ marker can't be moved
        />
      </MapContainer>
    </div>
  );
};

export default HotelLocationMap;
