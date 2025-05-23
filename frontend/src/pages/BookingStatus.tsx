import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { BookingType } from "../../../backend/src/shared/types";

type AdminBooking = BookingType & {
  hotelName: string;
};

const BookingStatus = () => {
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery<AdminBooking[]>({
    queryKey: ["admin-bookings"],
    queryFn: apiClient.fetchAllBookings,
  });

  const [nameSearch, setNameSearch] = useState("");
  const [hotelFilter, setHotelFilter] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-700">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center mt-8">Failed to load bookings.</p>
    );
  }

  if (!bookings || bookings.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No bookings found.</p>;
  }

  // Unique hotel names for dropdown
  const hotelOptions = Array.from(new Set(bookings.map((b) => b.hotelName)));

  const filteredBookings = bookings.filter((b) => {
    const search = nameSearch.toLowerCase().trim();
    const fullNameMatch =
      b.firstName.toLowerCase().startsWith(search) ||
      b.lastName.toLowerCase().startsWith(search) ||
      `${b.firstName} ${b.lastName}`.toLowerCase().startsWith(search);

    const hotelMatch = hotelFilter === "" || b.hotelName === hotelFilter;

    return fullNameMatch && hotelMatch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Booking Status</h1>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by guest name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-64"
          />
          <select
            value={hotelFilter}
            onChange={(e) => setHotelFilter(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-64"
          >
            <option value="">All Hotels</option>
            {hotelOptions.map((hotel) => (
              <option key={hotel} value={hotel}>
                {hotel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700 text-left text-sm uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Hotel</th>
              <th className="p-3">Check In</th>
              <th className="p-3">Check Out</th>
              <th className="p-3">Total Cost</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b: AdminBooking, index: number) => (
              <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-3">
                  {b.firstName} {b.lastName}
                </td>
                <td className="p-3">{b.email}</td>
                <td className="p-3">{b.hotelName}</td>
                <td className="p-3">
                  {new Date(b.checkIn).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {new Date(b.checkOut).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {b.totalCost.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      b.status === "canceled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingStatus;
