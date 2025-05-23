import express from "express";
import verifyToken from "../middleware/auth";
import authorizeRole from "../middleware/authorizeRole";
import User from "../models/user";
import Hotel from "../models/hotel";
import Booking from "../models/hotel";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const [userCount, hotelCount, bookingCount] = await Promise.all([
        User.countDocuments(),
        Hotel.countDocuments(),
        Booking.countDocuments(),
      ]);

      res.json({
        message: "Welcome Admin",
        stats: {
          users: userCount,
          hotels: hotelCount,
          bookings: bookingCount,
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Error loading admin stats" });
    }
  }
);

router.get(
  "/users",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);

router.delete(
  "/users/:userId",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted" });
  }
);

router.get(
  "/hotels",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    const hotels = await Hotel.find();
    res.json(hotels);
  }
);

router.delete(
  "/hotels/:hotelId",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    await Hotel.findByIdAndDelete(req.params.hotelId);
    res.json({ message: "Hotel deleted" });
  }
);

router.get(
  "/monthly-bookings",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const result = await Hotel.aggregate([
        { $unwind: "$bookings" },
        {
          $match: {
            "bookings.checkIn": { $exists: true },
          },
        },
        {
          $group: {
            _id: { $month: "$bookings.checkIn" },
            bookings: { $sum: 1 },
            revenue: { $sum: "$bookings.totalCost" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const formatted = result.map((item) => ({
        month: months[item._id - 1],
        bookings: item.bookings,
        revenue: item.revenue,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("Monthly bookings error:", error);
      res.status(500).json({ message: "Failed to load monthly bookings" });
    }
  }
);

router.get(
  "/top-hotels",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const hotels = await Hotel.find();

      let maxBookings = 0;

      const rawScores = hotels.map((hotel) => {
        const bookings = hotel.bookings?.length || 0;
        const reviews = hotel.reviews || [];
        const reviewCount = reviews.length;

        const avgRating =
          reviewCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

        if (bookings > maxBookings) {
          maxBookings = bookings;
        }

        return {
          name: hotel.name,
          bookings,
          averageRating: Number(avgRating.toFixed(2)),
          rawRating: avgRating,
          rawBookings: bookings,
        };
      });

      const scored = rawScores.map((hotel) => {
        const normalizedBookings =
          maxBookings > 0 ? hotel.rawBookings / maxBookings : 0;
        const normalizedRating = hotel.rawRating / 10;

        const score = (normalizedBookings * 0.5 + normalizedRating * 0.5) * 10;

        return {
          name: hotel.name,
          bookings: hotel.rawBookings,
          averageRating: hotel.averageRating,
          score: Number(score.toFixed(2)),
        };
      });

      const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);

      res.json(top5);
    } catch (error) {
      console.error("Top hotels error:", error);
      res.status(500).json({ message: "Failed to fetch top hotels" });
    }
  }
);

router.get(
  "/bookings",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const hotels = await Hotel.find({}, { bookings: 1, name: 1 });
      const allBookings = hotels.flatMap((hotel) =>
        hotel.bookings.map((booking) => ({
          hotelName: hotel.name,
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          adultCount: booking.adultCount,
          childCount: booking.childCount,
          totalCost: booking.totalCost,
          status: booking.status,
        }))
      );

      res.json(allBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
);

export default router;
