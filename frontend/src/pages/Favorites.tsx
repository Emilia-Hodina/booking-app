import { UseFavorites } from "../contexts/FavoritesContext";
import SearchResultsCard from "../components/SearchResultsCard";

const FavoritesPage = () => {
  const { favorites } = UseFavorites();

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 space-y-5">
      <h1 className="text-3xl font-bold">My Favorite Hotels</h1>
      {favorites.length > 0 ? (
        <div className="grid gap-6">
          {favorites.map((hotel) => (
            <SearchResultsCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">You have no favorite hotels yet.</p>
      )}
    </div>
  );
};

export default FavoritesPage;
