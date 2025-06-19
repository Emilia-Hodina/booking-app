import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiStar } from "react-icons/bi";
import { UseAppContext } from "../contexts/AppContext";
import { FaRegCalendarAlt } from "react-icons/fa";
import ConfirmDialog from "../components/ConfirmDialog";

const MyHotels = () => {
  const queryClient = useQueryClient();
  const { showToast } = UseAppContext();

  const { data: hotelData = [] } = useQuery({
    queryKey: ["fetchMyHotels"],
    queryFn: apiClient.fetchMyHotels,
  });

  // State for popup dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const handleDeleteClick = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHotelId) return;
    try {
      await apiClient.deleteMyHotel(selectedHotelId);
      showToast({ message: "Hotel deleted successfully", type: "SUCCESS" });
      queryClient.invalidateQueries({ queryKey: ["fetchMyHotels"] });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      showToast({ message: "Error deleting hotel", type: "ERROR" });
    } finally {
      setConfirmOpen(false);
      setSelectedHotelId(null);
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{hotel.name}</h2>
                <Link to={`/my-hotels/${hotel._id}/calendar`}>
                  <FaRegCalendarAlt className="text-blue-600 hover:text-blue-800 text-xl" />
                </Link>
              </div>

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
                  onClick={() => handleDeleteClick(hotel._id)}
                  className="flex bg-red-600 text-white text-xl font-bold p-2 hover:bg-red-500"
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        title="Delete Hotel"
        message="Are you sure you want to delete this hotel?"
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default MyHotels;
