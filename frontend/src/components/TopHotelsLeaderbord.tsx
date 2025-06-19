import { FaTrophy } from "react-icons/fa";

type Hotel = {
  name: string;
  bookings: number;
  averageRating: number;
  score: number;
};

type Props = {
  data: Hotel[];
};

const rankColors = ["bg-yellow-400", "bg-gray-400", "bg-orange-400"];

const TopHotelsLeaderboard = ({ data }: Props) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-yellow-500 text-2xl">
          <FaTrophy />
        </span>
        <span>Top 5 Hotels Leaderboard</span>
      </h2>
      <div className="space-y-4">
        {data.map((hotel, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-gray-100 pb-3"
          >
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center text-white font-bold ${
                rankColors[index] || "bg-blue-500"
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{hotel.name}</p>
              <div className="text-sm text-gray-500">
                Rating: {hotel.averageRating.toFixed(1)} ⭐
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{
                    width: `${Math.min(hotel.averageRating * 10, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {hotel.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopHotelsLeaderboard;
