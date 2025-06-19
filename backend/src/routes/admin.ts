import express from "express";
import verifyToken from "../middleware/auth";
import authorizeRole from "../middleware/authorizeRole";
import User from "../models/user";
import Hotel from "../models/hotel";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const [userCount, hotelCount, hotelBookings] = await Promise.all([
        User.countDocuments(),
        Hotel.countDocuments(),
        Hotel.aggregate([
          { $project: { bookingCount: { $size: "$bookings" } } },
          {
            $group: {
              _id: null,
              totalBookings: { $sum: "$bookingCount" },
            },
          },
        ]),
      ]);

      const bookingCount = hotelBookings[0]?.totalBookings || 0;

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
  "/booking-status",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const breakdown = await Hotel.aggregate([
        { $unwind: "$bookings" },
        {
          $group: {
            _id: "$bookings.status",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json(breakdown);
    } catch (error) {
      console.error("Booking status breakdown error:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch booking status breakdown" });
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
            "bookings.status": "confirmed",
            "bookings.refunded": false,
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

      const rated = hotels.map((hotel) => {
        const reviews = hotel.reviews || [];
        const reviewCount = reviews.length;

        const avgRating =
          reviewCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

        return {
          name: hotel.name,
          bookings: hotel.bookings?.length || 0,
          averageRating: Number(avgRating.toFixed(2)),
          score: Number(avgRating.toFixed(2)), // scorul este doar ratingul
        };
      });

      // Sortează după scor (rating descrescător)
      const top5 = rated.sort((a, b) => b.score - a.score).slice(0, 5);

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
