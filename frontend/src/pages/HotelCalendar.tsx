import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { getMonth, format } from "date-fns";
import { BookingType, HotelType } from "../../../backend/src/shared/types";

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(2025, i).toLocaleString("default", { month: "short" })
);

const getBookingGridPosition = (checkIn: Date, checkOut: Date) => {
  const startMonthIndex = getMonth(checkIn);
  const endMonthIndex = getMonth(checkOut);
  const colStart = startMonthIndex + 1;
  const colSpan = Math.max(1, endMonthIndex - startMonthIndex + 1);
  return { colStart, colSpan };
};

const HotelCalendar = () => {
  const { hotelId } = useParams();

  const { data: hotel } = useQuery<HotelType>({
    queryKey: ["hotel", hotelId],
    queryFn: () => apiClient.fetchMyHotelById(hotelId!),
    enabled: !!hotelId,
  });

  const { data: bookings } = useQuery<BookingType[]>({
    queryKey: ["bookings", hotelId],
    queryFn: () => apiClient.fetchHotelBookings(hotelId!),
    enabled: !!hotelId,
  });

  const expandedRooms: { label: string; type: string }[] = [];
  hotel?.roomTypes.forEach((roomType) => {
    for (let i = 1; i <= roomType.totalRooms; i++) {
      expandedRooms.push({
        label: `${roomType.name} ${i}`,
        type: roomType.name,
      });
    }
  });

  const roomAssignments: Record<string, BookingType[]> = {};
  expandedRooms.forEach((room) => {
    roomAssignments[room.label] = [];
  });

  bookings?.forEach((booking) => {
    const matchingRooms = expandedRooms.filter(
      (r) => r.type === booking.roomTypeName
    );
    for (const room of matchingRooms) {
      const conflicts = roomAssignments[room.label].some(
        (b) =>
          new Date(b.checkIn) < new Date(booking.checkOut) &&
          new Date(b.checkOut) > new Date(booking.checkIn)
      );
      if (!conflicts) {
        roomAssignments[room.label].push(booking);
        break;
      }
    }
  });

  const monthWidth = 120;
  const monthGap = 4;
  const totalWidth = 12 * monthWidth + 11 * monthGap;

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 space-y-6">
      <div className="flex justify-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {hotel?.name || "Hotel Bookings"}
        </h1>
      </div>

      <div className="flex overflow-x-auto">
        {/* Room Labels */}
        <div className="flex flex-col space-y-2 mr-2 min-w-[176px]">
          <div className="h-[42px]" />
          {expandedRooms.map((room, index) => (
            <div
              key={index}
              className="w-44 h-[80px] flex items-center justify-center bg-blue-900 text-white text-sm font-semibold px-2 py-3 rounded shadow"
            >
              {room.label}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto relative z-50">
          <div style={{ width: `${totalWidth}px` }}>
            {/* Months */}
            <div className="flex gap-[4px] mb-2">
              {months.map((month, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 rounded py-2 text-sm text-gray-800 font-medium text-center shadow"
                  style={{ width: `${monthWidth}px` }}
                >
                  {month}
                </div>
              ))}
            </div>

            {/* Bookings */}
            <div className="flex flex-col space-y-2">
              {expandedRooms.map((room, index) => (
                <div
                  key={index}
                  className="relative flex items-center h-[80px] bg-white rounded shadow"
                >
                  {roomAssignments[room.label].map((booking, i) => {
                    const checkIn = new Date(booking.checkIn);
                    const checkOut = new Date(booking.checkOut);
                    const { colStart } = getBookingGridPosition(
                      checkIn,
                      checkOut
                    );
                    const left = (colStart - 1) * (monthWidth + monthGap);

                    return (
                      <div
                        key={i}
                        className="absolute h-10 bg-gray-400 text-black text-xs px-4 py-1 rounded-full shadow-md flex items-center justify-center overflow-visible whitespace-nowrap relative group w-auto max-w-full"
                        style={{ left: `${left}px` }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-sm truncate">
                            {booking.firstName} {booking.lastName}
                          </span>
                          <span className="text-[10px] text-clack">
                            {format(checkIn, "d.M")} – {format(checkOut, "d.M")}
                          </span>
                        </div>

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] bg-gray-100 text-gray-800 text-xs border border-gray-300 rounded-xl px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[999] shadow-md whitespace-normal text-left">
                          <div className="text-[11px] font-medium">
                            {booking.email}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCalendar;
