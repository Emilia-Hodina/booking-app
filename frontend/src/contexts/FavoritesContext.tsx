import { createContext, useContext, useState, useEffect } from "react";
import { HotelType } from "../../../backend/src/shared/types";
import * as apiClient from "../api-client";
import { UseAppContext } from "./AppContext";

type FavoritesContextType = {
  favorites: HotelType[];
  toggleFavorite: (hotel: HotelType) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoggedIn } = UseAppContext();
  const [favorites, setFavorites] = useState<HotelType[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      apiClient
        .fetchFavorites()
        .then((fetchedFavorites) => {
          setFavorites(fetchedFavorites); // Set fetched favorites first

          const pendingFavorite = localStorage.getItem("pendingFavorite");
          if (pendingFavorite) {
            const hotel: HotelType = JSON.parse(pendingFavorite);
            localStorage.removeItem("pendingFavorite"); // Remove stored favorite

            if (!fetchedFavorites.some((fav) => fav._id === hotel._id)) {
              apiClient
                .addFavorite(hotel._id)
                .then(() => {
                  setFavorites((prevFavorites) => [...prevFavorites, hotel]); // Ensure UI updates instantly
                })
                .catch(console.error);
            }
          }
        })
        .catch(console.error);
    } else {
      setFavorites([]); // Clear favorites when logged out
    }
  }, [isLoggedIn]);

  const toggleFavorite = async (hotel: HotelType) => {
    if (!isLoggedIn) {
      localStorage.setItem("pendingFavorite", JSON.stringify(hotel));
      window.location.href = "/signin"; // Redirect after storing
      return;
    }

    try {
      if (favorites.some((fav) => fav._id === hotel._id)) {
        await apiClient.removeFavorite(hotel._id);
        setFavorites(favorites.filter((fav) => fav._id !== hotel._id));
      } else {
        await apiClient.addFavorite(hotel._id);
        setFavorites([...favorites, hotel]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const UseFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("UseFavorites must be used within a FavoritesProvider");
  }
  return context;
};
