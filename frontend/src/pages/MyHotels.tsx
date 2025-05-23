import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiStar } from "react-icons/bi";
import { UseAppContext } from "../contexts/AppContext";

const MyHotels = () => {
  const queryClient = useQueryClient();
  const { showToast } = UseAppContext();

  const { data: hotelData = [] } = useQuery({
    queryKey: ["fetchMyHotels"],
    queryFn: apiClient.fetchMyHotels,
  });

  const handleDelete = async (hotelId: string) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      try {
        await apiClient.deleteMyHotel(hotelId);
        showToast({ message: "Hotel deleted successfully", type: "SUCCESS" });
        queryClient.invalidateQueries({ queryKey: ["fetchMyHotels"] });
      } catch (error) {
        console.error("Error deleting hotel:", error);
        showToast({ message: "Error deleting hotel", type: "ERROR" });
      }
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 space-y-5">
      <span className="flex justify-between">
        <h1 className="text-3xl font-bold">My Hotels</h1>
        <Link
          to="/add-hotel"
          className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
        >
          Add Hotel
        </Link>
      </span>

      {hotelData?.length === 0 ? (
        <span className="text-gray-600 mt-4 ml-1 block">No hotels found</span>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {hotelData.map((hotel) => (
            <div
              key={hotel._id}
              data-testid="hotel-card"
              className="flex flex-col justify-between border border-slate-300 rounded-lg p-8 gap-5"
            >
              <h2 className="text-2xl font-bold">{hotel.name}</h2>
              <div className="whitespace-pre-line">{hotel.description}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                  <BsMap className="mr-1" />
                  {hotel.city}, {hotel.country}
                </div>
                <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                  <BsBuilding className="mr-1" />
                  {hotel.type}
                </div>
                <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                  <BiStar className="mr-1" />
                  {hotel.starRating} Star Rating
                </div>
              </div>
              <span className="flex justify-end gap-2">
                <Link
                  to={`/edit-hotel/${hotel._id}`}
                  className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(hotel._id)}
                  className="flex bg-red-600 text-white text-xl font-bold p-2 hover:bg-red-500"
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHotels;
