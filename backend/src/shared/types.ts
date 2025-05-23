export type UserType = {
  _id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  role: "user" | "admin";
};

export type HotelType = {
  _id: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageUrls: string[];
  lastUpdated: Date;
  roomTypes: {
    name: string;
    price: number;
    adults: number;
    children: number;
    totalRooms: number;
  }[];
  bookings: BookingType[];
  reviews: {
    _id: string;
    userId: string;
    user: string;
    comment: string;
    rating: number;
    date: Date;
  }[];
  location: {
    lat: number;
    lng: number;
  };
};

export type BookingType = {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  roomTypeName: string;
  paymentIntentId: string;
  status: "confirmed" | "canceled";
  refunded: boolean;
};

export type RoomType = {
  name: string;
  price: number;
  adults: number;
  children: number;
  totalRooms: number;
};

export type HotelWithMatchedRoom = HotelType & {
  matchedRoom?: RoomType;
};

export type HotelSearchResponse = {
  data: HotelWithMatchedRoom[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type PaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  totalCost: number;
};
