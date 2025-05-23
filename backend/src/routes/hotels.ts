import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { param, validationResult } from "express-validator";

import verifyToken from "../middleware/auth";
import { BookingType, HotelSearchResponse } from "../shared/types";
import Stripe from "stripe";
import User from "../models/user";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    const checkIn = req.query.checkIn
      ? new Date(req.query.checkIn.toString())
      : null;
    const checkOut = req.query.checkOut
      ? new Date(req.query.checkOut.toString())
      : null;

    const adultCount = parseInt(req.query.adultCount?.toString() || "1");
    const childCount = parseInt(req.query.childCount?.toString() || "0");

    const rawHotels = await Hotel.find(query).lean();

    const filteredHotelsWithMatchedRoom = rawHotels
      .map((hotel) => {
        const matchedRoom = hotel.roomTypes.find((room: any) => {
          const isCapacityOk =
            room.adults >= adultCount && room.children >= childCount;

          if (!isCapacityOk) return false;

          const overlappingBookings = hotel.bookings.filter(
            (booking: any) =>
              booking.roomTypeName === room.name &&
              booking.status !== "canceled" &&
              checkOut &&
              new Date(booking.checkIn) < checkOut &&
              checkIn &&
              new Date(booking.checkOut) > checkIn
          );

          const isAvailable = overlappingBookings.length < room.totalRooms;

          return isAvailable;
        });

        if (matchedRoom) {
          return {
            ...hotel,
            matchedRoom,
          };
        }

        return null;
      })
      .filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);

    // ✅ Sort AFTER filtering
    const sortOption = req.query.sortOption;
    if (sortOption === "pricePerNightAsc") {
      filteredHotelsWithMatchedRoom.sort(
        (a, b) => a.matchedRoom.price - b.matchedRoom.price
      );
    } else if (sortOption === "pricePerNightDesc") {
      filteredHotelsWithMatchedRoom.sort(
        (a, b) => b.matchedRoom.price - a.matchedRoom.price
      );
    } else if (sortOption === "starRating") {
      filteredHotelsWithMatchedRoom.sort((a, b) => b.starRating - a.starRating);
    }

    // Pagination
    const pageSize = 5;
    const pageNumber = parseInt(req.query.page?.toString() || "1");
    const skip = (pageNumber - 1) * pageSize;
    const paginatedHotels = filteredHotelsWithMatchedRoom.slice(
      skip,
      skip + pageSize
    );

    const response: HotelSearchResponse = {
      data: paginatedHotels,
      pagination: {
        total: filteredHotelsWithMatchedRoom.length,
        page: pageNumber,
        pages: Math.ceil(filteredHotelsWithMatchedRoom.length / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const { numberOfNights, roomTypeName } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(400).json({ message: "Hotel not found" });
      return;
    }

    const roomType = hotel.roomTypes.find((room) => room.name === roomTypeName);

    const totalCost = roomType ? roomType.price * numberOfNights : 0;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "usd",
      metadata: {
        hotelId,
        userId: req.userId,
      },
    });

    if (!paymentIntent.client_secret) {
      res.status(500).json({ message: "Error creating payment intent" });
      return;
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };

    res.send(response);
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        res.status(400).json({ message: "payment intent not found" });
        return;
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        res.status(400).json({ message: "payment intent mismatch" });
        return;
      }

      if (paymentIntent.status !== "succeeded") {
        res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
        return;
      }

      const newBooking: BookingType = {
        ...req.body,
        paymentIntentId,
        userId: req.userId,
      };

      console.log("newBooking", newBooking);

      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.hotelId },
        {
          $push: { bookings: newBooking },
        }
      );

      if (!hotel) {
        res.status(400).json({ message: "hotel not found" });
        return;
      }

      await hotel.save();
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  const constructedQuery: any = {};

  // Match city or country
  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  // Match facilities
  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  // Match type
  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  // Match star rating
  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : [parseInt(queryParams.stars)];
    constructedQuery.starRating = { $in: starRatings };
  }

  // Match roomTypes based on adultCount, childCount, and maxPrice
  const roomCriteria: any = {};

  if (queryParams.adultCount) {
    roomCriteria.adults = { $gte: parseInt(queryParams.adultCount) };
  }

  if (queryParams.childCount) {
    roomCriteria.children = { $gte: parseInt(queryParams.childCount) };
  }

  if (queryParams.maxPrice) {
    roomCriteria.price = { $lte: parseInt(queryParams.maxPrice) };
  }

  // If any of the room criteria exist, use $elemMatch on roomTypes
  if (Object.keys(roomCriteria).length > 0) {
    constructedQuery.roomTypes = { $elemMatch: roomCriteria };
  }

  return constructedQuery;
};

// Adăugare recenzie
router.post("/:hotelId/reviews", verifyToken, async (req, res) => {
  const { hotelId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ message: "Hotelul nu există" });
      return;
    }

    // Verificăm dacă userul a făcut o rezervare
    const hasBooked = hotel.bookings.some(
      (booking) => booking.userId.toString() === userId
    );
    if (!hasBooked) {
      res.status(403).json({
        message: "Trebuie să fi rezervat acest hotel pentru a lăsa o recenzie.",
      });
      return;
    }

    // Verificăm dacă userul a scris deja o recenzie
    const alreadyReviewed = hotel.reviews.some(
      (review) => review.user.toString() === userId
    );
    if (alreadyReviewed) {
      res.status(400).json({
        message: "Ai deja o recenzie pentru acest hotel.",
      });
      return;
    }

    // Preia numele complet al utilizatorului
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
      return;
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    const newReview = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      user: fullName,
      comment,
      rating,
      date: new Date(),
    };

    hotel.reviews.push(newReview);
    await hotel.save();

    // Trimite recenzia adăugată ca răspuns
    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare server", error });
  }
});

// Șterge recenzie
router.delete("/:hotelId/reviews/:reviewId", verifyToken, async (req, res) => {
  const { hotelId, reviewId } = req.params;
  const userId = req.userId;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ message: "Hotelul nu a fost găsit" });
      return;
    }

    const review = hotel.reviews.find(
      (review) => review._id.toString() === reviewId
    );
    if (!review) {
      res.status(404).json({ message: "Recenzia nu a fost găsită" });
      return;
    }

    if (review.userId.toString() !== userId) {
      res.status(403).json({
        message: "Nu ai permisiunea să ștergi această recenzie.",
      });
      return;
    }

    hotel.reviews = hotel.reviews.filter(
      (review) => review._id.toString() !== reviewId
    );
    await hotel.save();

    res.status(200).json({ message: "Recenzia a fost ștearsă cu succes" });
  } catch (error) {
    console.error("Eroare la ștergerea recenziei:", error);
    res.status(500).json({ message: "Eroare server", error });
  }
});

// Actualizează recenzie
router.put("/:hotelId/reviews/:reviewId", verifyToken, async (req, res) => {
  const { hotelId, reviewId } = req.params;
  const { comment, rating } = req.body;
  const userId = req.userId;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ message: "Hotelul nu a fost găsit" });
      return;
    }

    const review = hotel.reviews.find(
      (review) => review._id.toString() === reviewId
    );
    if (!review) {
      res.status(404).json({ message: "Recenzia nu a fost găsită" });
      return;
    }

    if (review.userId.toString() !== userId) {
      res.status(403).json({
        message: "Nu ai permisiunea să editezi această recenzie.",
      });
      return;
    }

    review.comment = comment;
    review.rating = rating;
    review.date = new Date();

    await hotel.save();

    res.status(200).json(review);
  } catch (error) {
    console.error("Eroare la actualizarea recenziei:", error);
    res.status(500).json({ message: "Eroare server", error });
  }
});

router.get("/:id/available-rooms", async (req: Request, res: Response) => {
  const hotelId = req.params.id;
  const checkIn = req.query.checkIn
    ? new Date(req.query.checkIn as string)
    : null;
  const checkOut = req.query.checkOut
    ? new Date(req.query.checkOut as string)
    : null;
  const adultCount = parseInt((req.query.adultCount as string) || "1");
  const childCount = parseInt((req.query.childCount as string) || "0");

  try {
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel || !checkIn || !checkOut) {
      res.status(404).json({ message: "Missing data" });
      return;
    }

    const availableRooms = hotel.roomTypes.filter((room) => {
      const isCapacityOk =
        room.adults >= adultCount && room.children >= childCount;
      if (!isCapacityOk) return false;

      const overlappingBookings = hotel.bookings.filter(
        (booking) =>
          booking.roomTypeName === room.name &&
          booking.status !== "canceled" &&
          new Date(booking.checkIn) < checkOut &&
          new Date(booking.checkOut) > checkIn
      );

      return overlappingBookings.length < room.totalRooms;
    });

    res.json({ roomTypes: availableRooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching available rooms" });
  }
});

export default router;
