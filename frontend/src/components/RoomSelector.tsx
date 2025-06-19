import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HotelType } from "../../../backend/src/shared/types";
import * as apiClient from "../api-client";
import { useMemo } from "react";

type Props = {
  hotelId: string;
  selectedRoom: HotelType["roomTypes"][0] | null;
  onSelect: (room: HotelType["roomTypes"][0] | null) => void;
  checkIn: Date | null;
  checkOut: Date | null;
  adultCount: number;
  childCount: number;
};

const RoomSelector = ({
  hotelId,
  selectedRoom,
  onSelect,
  checkIn,
  checkOut,
  adultCount,
  childCount,
}: Props) => {
  const { data: availableData, isLoading } = useQuery({
    queryKey: [
      "availableRooms",
      hotelId,
      checkIn,
      checkOut,
      adultCount,
      childCount,
    ],
    queryFn: () =>
      apiClient.fetchAvailableRooms(hotelId, {
        checkIn: checkIn!.toISOString(),
        checkOut: checkOut!.toISOString(),
        adultCount,
        childCount,
      }),
    enabled:
      !!hotelId &&
      !!checkIn &&
      !!checkOut &&
      adultCount >= 1 &&
      childCount >= 0,
  });

  const availableRooms = useMemo(
    () => availableData?.roomTypes || [],
    [availableData]
  );

  // 🔄 Auto-select first available room or clear selection if none
  useEffect(() => {
    const anyAvailable = availableRooms.some((r) => r.isAvailable);

    if (!anyAvailable) {
      if (selectedRoom !== null) {
        onSelect(null);
      }
      return;
    }

    const selectedStillAvailable = availableRooms.find(
      (r) => r.name === selectedRoom?.name && r.isAvailable
    );

    if (!selectedStillAvailable) {
      const firstAvailable = availableRooms.find((room) => room.isAvailable);
      if (firstAvailable) {
        onSelect(firstAvailable);
      }
    }
  }, [availableRooms, selectedRoom, onSelect]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  //   if (availableRooms.length === 0) {
  //     return <p>Nu sunt camere disponibile pentru această selecție.</p>;
  //   }

  return (
    <div className="bg-gray-100 h-full p-4 rounded-md space-y-4">
      <h3 className="text-lg font-semibold">Selectează tipul camerei</h3>

      <div className="space-y-2">
        {availableRooms.map((room) => {
          const isAvailable = room.isAvailable;
          const isSelected = selectedRoom?.name === room.name && isAvailable; // ✅ only show selected if available

          return (
            <div
              key={room.name}
              className={`flex items-center gap-4 p-2 rounded-md border transition-all
                ${
                  isSelected ? "border-blue-500 bg-blue-100" : "border-gray-300"
                }
                ${
                  !isAvailable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              onClick={() => {
                if (isAvailable) {
                  onSelect(room);
                }
              }}
            >
              <div>
                <div className="font-bold">{room.name}</div>
                <div className="text-sm text-gray-600">
                  {room.adults} adulți, {room.children} copii
                </div>
                <div className="font-semibold text-blue-700">
                  ${room.price} / noapte
                </div>
                <div
                  className={`text-sm font-medium ${
                    isAvailable ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isAvailable ? "Disponibil" : "Indisponibil"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomSelector;
