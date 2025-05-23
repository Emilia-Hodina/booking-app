import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );

      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// /api/my-bookings/:bookingId/cancel
router.put(
  "/:bookingId/cancel",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;

      // 1. Find the hotel containing this booking
      const hotel = await Hotel.findOne({ "bookings._id": bookingId });
      if (!hotel) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // 2. Find the booking and ensure it's owned by the current user
      const booking = hotel.bookings.find(
        (b) => b._id.toString() === bookingId && b.userId === req.userId
      );
      if (!booking) {
        res.status(403).json({ message: "Unauthorized or booking not found" });
        return;
      }

      // 3. Refund the payment using Stripe
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.paymentIntentId
        );

        if (paymentIntent.status !== "succeeded") {
          res.status(400).json({ message: "Booking payment is not completed" });
          return;
        }

        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });

        // 4. Update booking status
        booking.status = "canceled";
        booking.refunded = true;

        await hotel.save();

        res
          .status(200)
          .json({ message: "Booking canceled and refunded successfully" });
        return;
      } catch (err) {
        console.error("Stripe refund error:", err);
        res.status(500).json({ message: "Failed to process refund" });
        return;
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      res.status(500).json({ message: "Failed to cancel booking" });
      return;
    }
  }
);

export default router;
