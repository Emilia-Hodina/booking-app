import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  UserType,
} from "../../backend/src/shared/types";
import type { BookingFormData } from "./forms/BookingForm/BookingForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching user");
  }
  return response.json();
};

export const register = async (formData: RegisterFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.message);
  }
};

export const signIn = async (formData: SignInFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
};

export const validateToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Token invalid");
  }

  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    method: "POST",
    credentials: "include",
    body: hotelFormData,
  });

  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }

  return response.json();
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/my-hotels/${hotelFormData.get("hotelId")}`,
    {
      method: "PUT",
      body: hotelFormData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update Hotel");
  }

  return response.json();
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("destination", searchParams.destination || "");
  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");

  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`);
  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }
  return response.json();
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`);
  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string,
  roomTypeName: string
): Promise<PaymentIntentResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/bookings/payment-intent`,
    {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ numberOfNights, roomTypeName }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching payment intent");
  }

  return response.json();
};

export const createRoomBooking = async (formData: BookingFormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${formData.hotelId}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    throw new Error("Error booking room");
  }
};

export const fetchMyBookings = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-bookings`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch bookings");
  }

  return response.json();
};

export const fetchFavorites = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/favorites`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching favorites");
  }
  return response.json();
};

export const addFavorite = async (hotelId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${hotelId}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.message);
  }
};

export const removeFavorite = async (hotelId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${hotelId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error removing favorite");
  }
};

export const forgotPassword = async ({ email }: { email: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Failed to send reset email.");
  }
};

export const resetPassword = async ({
  token,
  password,
}: {
  token: string | null;
  password: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error("Failed to reset password.");
  }
};

export const addHotelReview = async (
  hotelId: string,
  reviewData: { comment: string; rating: number }
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(reviewData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Eroare la trimiterea recenziei");
  }

  return response.json(); // returns the new review
};

export const deleteHotelReview = async (hotelId: string, reviewId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/reviews/${reviewId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Eroare la ștergerea recenziei");
  }

  return response.json(); // returns { message: "Recenzia a fost ștearsă cu succes" }
};

export const updateHotelReview = async (
  hotelId: string,
  reviewId: string,
  updatedData: { comment: string; rating: number }
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/reviews/${reviewId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updatedData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update review");
  }

  return response.json(); // returns updated review
};

export const updateUserProfile = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneNumber: string;
}) => {
  const res = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
};

export const getAdminDashboard = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch admin dashboard");
  }

  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const deleteUser = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete user");
};

export const getAllHotels = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/hotels`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch hotels");
  return res.json();
};

export const deleteHotel = async (hotelId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/hotels/${hotelId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete hotel");
};

export const deleteMyHotel = async (hotelId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete hotel");
  }
};

export const getAdminMonthlyBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/monthly-bookings`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch monthly bookings data");
  }
  return response.json();
};

export const getTopHotels = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/top-hotels`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch top hotels");
  }

  return res.json();
};

export const cancelBooking = async (bookingId: string) => {
  const res = await fetch(
    `${API_BASE_URL}/api/my-bookings/${bookingId}/cancel`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to cancel booking");
  }

  return res.json();
};

export const fetchAllBookings = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
};

export const fetchAvailableRooms = async (
  hotelId: string,
  params: {
    checkIn: string;
    checkOut: string;
    adultCount: number;
    childCount: number;
  }
): Promise<{ roomTypes: HotelType["roomTypes"] }> => {
  const query = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adultCount: params.adultCount.toString(),
    childCount: params.childCount.toString(),
  }).toString();

  const response = await fetch(
    `/api/hotels/${hotelId}/available-rooms?${query}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch available rooms");
  }

  return response.json();
};
