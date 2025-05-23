import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-client";

const MyBookings = () => {
  const queryClient = useQueryClient();

  const {
    data: hotels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fetchMyBookings"],
    queryFn: apiClient.fetchMyBookings,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => apiClient.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyBookings"] });
    },
  });

  const handleCancel = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const hasBookings = hotels.some((hotel) => hotel.bookings.length > 0);

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold">My Bookings</h1>

        {isLoading && (
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}

        {error && (
          <p className="text-red-600 text-sm mt-1 ml-1">
            Failed to load bookings.
          </p>
        )}

        {!isLoading && !error && !hasBookings && (
          <p className="text-gray-500  mt-1 ml-1">No bookings found.</p>
        )}

        {!isLoading &&
          !error &&
          hasBookings &&
          hotels.map((hotel) =>
            hotel.bookings.map((booking, index) => {
              const checkInDate = new Date(booking.checkIn);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isCancelable =
                checkInDate > today && booking.status !== "canceled";

              return (
                <div
                  key={booking._id}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] border border-slate-300 rounded-lg p-8 gap-5"
                >
                  <div className="lg:w-full lg:h-[250px]">
                    <img
                      src={hotel.imageUrls[0]}
                      className="w-full h-full object-cover object-center"
                      alt={hotel.name}
                    />
                  </div>
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px]">
                    <div className="text-2xl font-bold">
                      {hotel.name}
                      <div className="text-xs font-normal">
                        {hotel.city}, {hotel.country}
                      </div>
                    </div>

                    <div className="pt-4">
                      {index > 0 && (
                        <hr className="w-80 border-t border-gray-300 mb-2" />
                      )}

                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div>
                            <span className="font-bold mr-2">Dates:</span>
                            <span>
                              {checkInDate.toDateString()} -{" "}
                              {new Date(booking.checkOut).toDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold mr-2">Guests:</span>
                            <span>
                              {booking.adultCount} adults, {booking.childCount}{" "}
                              children
                            </span>
                          </div>
                          <div>
                            <span className="font-bold mr-2">Status:</span>
                            {booking.status === "canceled" ? (
                              <span className="text-red-600 font-semibold">
                                ❌ Canceled
                              </span>
                            ) : (
                              <span className="text-green-600 font-semibold">
                                ✅ Confirmed
                              </span>
                            )}
                          </div>
                        </div>

                        {isCancelable && (
                          <div className="flex flex-col items-end mt-[22px] pr-10">
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="px-4 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition duration-200"
                            >
                              Cancel
                            </button>
                            <span className="text-xs text-gray-500 mt-1">
                              * Free cancellation
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
      </div>
    </div>
  );
};

export default MyBookings;
