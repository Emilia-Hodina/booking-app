import { useEffect, useState } from "react";
import { UseAppContext } from "../contexts/AppContext";
import { getAllHotels, deleteHotel } from "../api-client";
import { HotelType } from "../../../backend/src/shared/types";
import { FaTrash } from "react-icons/fa";
import ConfirmDialog from "../components/ConfirmDialog";

const HotelManagement = () => {
  const { showToast } = UseAppContext();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const allHotels = await getAllHotels();
        setHotels(allHotels);
      } catch (err) {
        showToast({ message: "Failed to fetch hotels", type: "ERROR" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [showToast]);

  const handleDeleteClick = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHotelId) return;
    try {
      await deleteHotel(selectedHotelId);
      setHotels((prev) => prev.filter((h) => h._id !== selectedHotelId));
      showToast({ message: "Hotel deleted", type: "SUCCESS" });
    } catch (err) {
      showToast({ message: "Failed to delete hotel", type: "ERROR" });
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setSelectedHotelId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-700">Loading hotels...</p>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return <p>No hotels found.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hotel Management</h1>
        <input
          type="text"
          placeholder="Search by hotel name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm w-64"
        />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700 text-left text-sm uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">City</th>
              <th className="p-3">Country</th>
              <th className="p-3">Type</th>
              <th className="p-3">Stars</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels
              .filter((hotel) =>
                hotel.name
                  .toLowerCase()
                  .trim()
                  .startsWith(searchTerm.toLowerCase().trim())
              )
              .map((hotel) => (
                <tr
                  key={hotel._id}
                  className="text-sm bg-white hover:bg-gray-100 border-b"
                >
                  <td className="p-3 whitespace-nowrap">{hotel.name}</td>
                  <td className="p-3 whitespace-nowrap">{hotel.city}</td>
                  <td className="p-3 whitespace-nowrap">{hotel.country}</td>
                  <td className="p-3 whitespace-nowrap capitalize">
                    {hotel.type}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {"★".repeat(hotel.starRating)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteClick(hotel._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
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

export default HotelManagement;
