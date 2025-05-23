import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth"; // Ensure user is logged in
import Favorite from "../models/favorite";
import Hotel from "../models/hotel";

const router = express.Router();

//  Get all favorites for the logged-in user
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const favorites = await Favorite.find({ userId: req.userId }).populate(
      "hotelId"
    );
    res.json(favorites.map((fav) => fav.hotelId));
  } catch (error) {
    res.status(500).json({ error: "Error fetching favorites" });
  }
});

//  Add hotel to favorites
router.post("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { hotelId } = req.params;

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: req.userId,
      hotelId,
    });
    if (existingFavorite) {
      res.status(400).json({ error: "Hotel already in favorites" });
      return;
    }

    // Add to favorites
    const favorite = new Favorite({ userId: req.userId, hotelId });
    await favorite.save();

    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ error: "Error adding hotel to favorites" });
  }
});

// Remove hotel from favorites
router.delete("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { hotelId } = req.params;
    const deletedFavorite = await Favorite.findOneAndDelete({
      userId: req.userId,
      hotelId,
    });

    if (!deletedFavorite) {
      res.status(404).json({ error: "Favorite not found" });
      return;
    }

    res.json({ message: "Favorite removed" });
  } catch (error) {
    res.status(500).json({ error: "Error removing favorite" });
  }
});

export default router;
