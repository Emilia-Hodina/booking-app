import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { HotelType } from "../../../backend/src/shared/types";
import SetMapCenter from "./SetMapCenter"; // Import the helper

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

  const center: L.LatLngExpression = [hotel.location.lat, hotel.location.lng];

  return (
    <div className="border rounded mt-2 overflow-hidden h-[300px]">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        touchZoom={true}
        keyboard={true}
        boxZoom={true}
      >
        <SetMapCenter center={center} />{" "}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} icon={markerIcon} draggable={false} />
      </MapContainer>
    </div>
  );
};

export default HotelLocationMap;
