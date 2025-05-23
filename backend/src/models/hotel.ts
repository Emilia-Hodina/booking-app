import mongoose from "mongoose";
import { BookingType, HotelType } from "../shared/types";

const bookingSchema = new mongoose.Schema<BookingType>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  adultCount: { type: Number, required: true },
  childCount: { type: Number, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  userId: { type: String, required: true },
  totalCost: { type: Number, required: true },
  roomTypeName: { type: String, required: false },
  paymentIntentId: { type: String, required: false },
  status: {
    type: String,
    enum: ["confirmed", "canceled"],
    default: "confirmed",
  },
  refunded: {
    type: Boolean,
    default: false,
  },
});

const hotelSchema = new mongoose.Schema<HotelType>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  // adultCount: { type: Number, required: true },
  // childCount: { type: Number, required: true },
  facilities: { type: [String], required: true },
  //pricePerNight: { type: Number, required: true },
  starRating: { type: Number, required: true, min: 1, max: 5 },
  imageUrls: { type: [String], required: true },
  lastUpdated: { type: Date, required: true },
  roomTypes: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      adults: { type: Number, required: true },
      children: { type: Number, required: true },
      totalRooms: { type: Number, required: true },
    },
  ],
  bookings: [bookingSchema],
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      user: { type: String, required: true },
      comment: { type: String, required: true },
      rating: { type: Number, required: true, min: 0, max: 10 },
      date: { type: Date, default: Date.now },
    },
  ],
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
});

const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);

export default Hotel;
