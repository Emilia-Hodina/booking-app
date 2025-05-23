import { useState } from "react";
import { addHotelReview } from "../../api-client";

const AddReviewForm = ({
  hotelId,
  onReviewAdded,
}: {
  hotelId: string;
  onReviewAdded: () => void;
}) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating <= 0 || rating > 10) {
      setError("Ratingul trebuie să fie între 1 și 10");
      return;
    }

    try {
      await addHotelReview(hotelId, { comment, rating });
      setComment("");
      setRating(0);
      setError("");
      onReviewAdded();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("A apărut o eroare la trimiterea recenziei.");
      }

      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-4">
      <h3 className="text-xl font-semibold">Adaugă o recenzie</h3>

      {error && <p className="text-red-500">{error}</p>}

      <div>
        <label className="block mb-1 font-medium">Rating (1-10)</label>
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(parseFloat(e.target.value))}
          className="border px-3 py-2 rounded w-20"
          min="1"
          max="10"
          step="0.5"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Comentariu</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          rows={3}
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Trimite recenzia
      </button>
    </form>
  );
};

export default AddReviewForm;
