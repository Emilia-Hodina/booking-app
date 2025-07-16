import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { HotelWithMatchedRoom } from "../../../backend/src/shared/types"; // changed this import to match the other file
import MapFitBounds from "./MapFitBounds";

interface Props {
  hotels: HotelWithMatchedRoom[]; // changed to include matchedRoom
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SearchMap = ({ hotels }: Props) => {
  const hotelsWithLocation = hotels.filter(
    (hotel) =>
      hotel.location &&
      typeof hotel.location.lat === "number" &&
      typeof hotel.location.lng === "number"
  );

  const defaultCenter = hotelsWithLocation.length
    ? [hotelsWithLocation[0].location.lat, hotelsWithLocation[0].location.lng]
    : [45.7489, 21.2087];

  return (
    <div className="h-[450px] w-full border rounded shadow-sm overflow-hidden mb-5">
      <MapContainer
        center={defaultCenter as L.LatLngExpression}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {hotelsWithLocation.map((hotel) => (
          <Marker
            key={hotel._id}
            position={[hotel.location.lat, hotel.location.lng]}
            icon={markerIcon}
          >
            <Popup closeButton={false}>
              <div className="text-sm w-[210px] bg-white rounded shadow-md overflow-hidden">
                <div className="p-[6px] pb-0">
                  {hotel.imageUrls?.length > 0 && (
                    <img
                      src={hotel.imageUrls[0]}
                      alt={hotel.name}
                      className="rounded-md w-full h-[110px] object-cover"
                    />
                  )}
                </div>

                <div className="px-2 pt-2 pb-4">
                  <div className="font-semibold text-[14px] leading-tight mb-1">
                    {hotel.name}
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <div className="flex space-x-[2px] text-yellow-400 text-xs">
                      {Array.from({ length: hotel.starRating || 0 }, (_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>

                    {hotel.matchedRoom?.price ? (
                      <div className="text-blue-600 font-bold text-sm text-right">
                        <div>{hotel.matchedRoom.price} € / night</div>
                      </div>
                    ) : (
                      <div className="text-blue-600 font-bold text-sm">
                        {hotel.pricePerNight} €
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <div>
                      {hotel.city}, {hotel.country}
                    </div>
                    <a
                      href={`/detail/${hotel._id}`}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      View Hotel
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapFitBounds
          bounds={hotelsWithLocation.map((hotel) => [
            hotel.location.lat,
            hotel.location.lng,
          ])}
        />
      </MapContainer>
    </div>
  );
};

export default SearchMap;
