import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "./../api-client";
import { AiFillStar, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";
import AddReviewForm from "../forms/AddReviewForm/AddReviewForm";
import { useEffect, useState } from "react";
import { UseAppContext } from "../contexts/AppContext";
import HotelLocationMap from "../components/HotelLocationMap";
import { HotelType } from "../../../backend/src/shared/types";

const Detail = () => {
  const { hotelId } = useParams();
  const [refreshReviews, setRefreshReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState<number>(5);
  const { showToast } = UseAppContext();
  const [selectedRoom, setSelectedRoom] = useState<
    HotelType["roomTypes"][0] | null
  >(null);

  const { data: hotel } = useQuery({
    queryKey: ["fetchHotelById", hotelId, refreshReviews],
    queryFn: () => apiClient.fetchHotelById(hotelId || ""),
    enabled: !!hotelId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: apiClient.fetchCurrentUser,
  });

  // After hotel is loaded, initialize selectedRoom
  useEffect(() => {
    if (hotel && hotel.roomTypes && hotel.roomTypes.length > 0) {
      setSelectedRoom(hotel.roomTypes[0]);
    }
  }, [hotel]);

  const handleReviewAdded = () => {
    setRefreshReviews((prev) => !prev);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      if (hotel) {
        await apiClient.deleteHotelReview(hotel._id, reviewId);
      }
      showToast({ message: "Recenzia a fost ștearsă", type: "SUCCESS" });
      setRefreshReviews((prev) => !prev);
    } catch (error) {
      showToast({
        message: "Eroare la ștergerea recenziei",
        type: "ERROR",
      });
      console.error("Eroare la ștergerea recenziei:", error);
    }
  };

  const getGradientClassForUser = (username: string) => {
    const gradients = [
      "from-pink-400 to-red-400",
      "from-blue-400 to-indigo-500",
      "from-green-400 to-teal-600",
      "from-yellow-400 to-orange-500",
      "from-purple-400 to-pink-500",
      "from-rose-400 to-fuchsia-500",
      "from-cyan-400 to-sky-500",
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  if (!hotel) {
    return <></>;
  }

  return (
    <div className="space-y-6 container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
      <div>
        <span className="flex">
          {Array.from({ length: hotel.starRating }).map((_, index) => (
            <AiFillStar key={index} className="fill-yellow-400" />
          ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotel.imageUrls.map((image, index) => (
          <div key={index} className="h-[300px]">
            <img
              src={image}
              alt={hotel.name}
              className="rounded-md w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {hotel.facilities.map((facility, index) => (
          <div key={index} className="border border-slate-300 rounded-sm p-3">
            {facility}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
        <div className="whitespace-pre-line">{hotel.description}</div>
        <div className="h-full">
          <HotelLocationMap hotel={hotel} />
        </div>
      </div>

      {/* New Section: Empty on Left, Book Now on Right */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="bg-gray-100 h-full p-4 rounded-md space-y-4">
          <h3 className="text-lg font-semibold">Selectează tipul camerei</h3>
          <div className="space-y-2">
            {hotel.roomTypes.map((room) => (
              <div
                key={room.name}
                className={`flex items-center gap-4 p-2 rounded-md cursor-pointer border ${
                  selectedRoom?.name === room.name
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <div>
                  <div className="font-bold">{room.name}</div>
                  <div className="text-sm text-gray-600">
                    {room.adults} adulți, {room.children} copii
                  </div>

                  <div className="font-semibold text-blue-700">
                    ${room.price} / noapte
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky top-4 self-start h-fit z-[999] overflow-visible">
          {selectedRoom && (
            <GuestInfoForm selectedRoom={selectedRoom} hotelId={hotel._id} />
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10 border-t pt-6 space-y-6">
        <h2 className="text-2xl font-bold">Recenzii</h2>

        {/* Average Rating */}
        {hotel.reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">Rating mediu:</span>
            <span className="bg-blue-800 text-white px-2 py-1 rounded-md font-bold">
              {(() => {
                const average =
                  hotel.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  hotel.reviews.length;
                return Number.isInteger(average) ? average : average.toFixed(1);
              })()}
            </span>
          </div>
        )}

        {/* All Reviews */}
        {hotel.reviews.length > 0 ? (
          <div className="space-y-4">
            {hotel.reviews
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((review) => (
                <div
                  key={review._id}
                  className="border rounded-md p-4 shadow-sm space-y-2 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm bg-gradient-to-br ${getGradientClassForUser(
                          review.user
                        )}`}
                      >
                        {review.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div>
                        <div className="font-semibold">{review.user}</div>
                        <div className="text-xs text-gray-500"></div>
                      </div>
                    </div>
                    {editingReviewId === review._id ? null : (
                      <div className="bg-blue-800 text-white px-2 py-1 rounded-md font-bold text-sm">
                        {Number.isInteger(review.rating)
                          ? review.rating
                          : review.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {editingReviewId === review._id ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium">Nota:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step={0.5}
                          value={editedRating}
                          onChange={(e) =>
                            setEditedRating(parseFloat(e.target.value))
                          }
                          className="w-16 border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>

                      <textarea
                        className="w-full border p-2 rounded resize-none"
                        rows={3}
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                      />

                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-4 py-1 bg-green-600 text-white rounded"
                          onClick={async () => {
                            try {
                              await apiClient.updateHotelReview(
                                hotel._id,
                                review._id,
                                {
                                  comment: editedComment,
                                  rating: editedRating,
                                }
                              );
                              showToast({
                                message: "Recenzia a fost actualizată",
                                type: "SUCCESS",
                              });
                              setEditingReviewId(null);
                              setRefreshReviews((prev) => !prev);
                            } catch (error) {
                              showToast({
                                message: "Eroare la actualizarea recenziei",
                                type: "ERROR",
                              });
                              console.error(
                                "Eroare la actualizarea recenziei:",
                                error
                              );
                            }
                          }}
                        >
                          Salvează
                        </button>
                        <button
                          className="px-4 py-1 bg-gray-300 rounded"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Anulează
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-700">{review.comment}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString("ro-RO")}
                      </div>
                    </>
                  )}

                  {currentUser &&
                    currentUser._id === review.userId &&
                    editingReviewId !== review._id && (
                      <div className="flex items-center gap-6 mt-2 text-sm text-blue-600 font-medium">
                        <button
                          className="hover:underline flex items-center gap-1"
                          onClick={() => {
                            setEditingReviewId(review._id);
                            setEditedComment(review.comment);
                            setEditedRating(review.rating);
                          }}
                        >
                          <AiOutlineEdit className="text-blue-600" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="hover:underline flex items-center gap-1 text-red-500"
                        >
                          <AiOutlineDelete />
                          Delete
                        </button>
                      </div>
                    )}
                </div>
              ))}
          </div>
        ) : (
          <p>Nu există recenzii pentru acest hotel încă.</p>
        )}

        {/* Add Review Form */}
        <AddReviewForm hotelId={hotel._id} onReviewAdded={handleReviewAdded} />
      </div>
    </div>
  );
};

export default Detail;
