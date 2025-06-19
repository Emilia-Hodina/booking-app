import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});

// Create hotel
router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
    body("location.lat")
      .notEmpty()
      .isNumeric()
      .withMessage("Latitude is required and must be a number"),
    body("location.lng")
      .notEmpty()
      .isNumeric()
      .withMessage("Longitude is required and must be a number"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    console.log("Creating hotel with body:", req.body);
    try {
      const imageFiles = req.files as Express.Multer.File[];

      let roomTypes = [];
      if (typeof req.body.roomTypes === "string") {
        console.log("TESTING roomTypes string:", req.body.roomTypes);
        roomTypes = JSON.parse(req.body.roomTypes);
      } else if (Array.isArray(req.body.roomTypes)) {
        roomTypes = req.body.roomTypes.map((room: any) => ({
          name: room.name,
          price: Number(room.price),
          adults: Number(room.adults),
          children: Number(room.children),
          totalRooms: Number(room.totalRooms),
        }));
      }
      const facilities =
        Array.isArray(req.body.facilities) &&
        typeof req.body.facilities !== "string"
          ? req.body.facilities
          : [req.body.facilities];

      const newHotel = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        description: req.body.description,
        starRating: Number(req.body.starRating),
        type: req.body.type,
        facilities,
        location: {
          lat: Number(req.body["location.lat"]),
          lng: Number(req.body["location.lng"]),
        },
        userId: req.userId,
        roomTypes,
        imageUrls: [] as string[],
        lastUpdated: new Date(),
      };

      console.log("roomTypes", roomTypes);

      const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64");
        let dataURI = "data:" + image.mimetype + ";base64," + b64;
        const res = await cloudinary.v2.uploader.upload(dataURI);
        return res.url;
      });

      const imageUrls = await Promise.all(uploadPromises);
      newHotel.imageUrls = imageUrls;

      const hotel = new Hotel(newHotel);

      await hotel.save();

      res.status(201).send(hotel);
    } catch (e) {
      console.error("Error creating hotel", e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// Get all hotels for user
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

// Get single hotel by ID
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id.toString(),
      userId: req.userId,
    });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotel" });
  }
});

// GET /api/hotels/:hotelId/bookings
router.get(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const hotel = await Hotel.findOne({
        _id: req.params.hotelId,
        userId: req.userId, // Ensure only the hotel owner can access
      });

      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      res.status(200).json(hotel.bookings || []);
    } catch (error) {
      console.error("Error fetching hotel bookings:", error);
      res.status(500).json({ message: "Error fetching hotel bookings" });
    }
  }
);

// Update hotel
router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      // Step 1: Find the existing hotel
      const hotel = await Hotel.findOne({
        _id: req.params.hotelId,
        userId: req.userId,
      });

      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      // Step 2: Parse room types from req.body
      let parsedRoomTypes = [];
      const rawRoomTypes = req.body.roomTypes;

      if (typeof rawRoomTypes === "string") {
        try {
          parsedRoomTypes = JSON.parse(rawRoomTypes);
        } catch (err) {
          console.error("Failed to parse roomTypes string:", err);
          res.status(400).json({ error: "Invalid roomTypes format" });
          return;
        }
      } else if (Array.isArray(rawRoomTypes)) {
        parsedRoomTypes = rawRoomTypes;
      } else {
        res
          .status(400)
          .json({ error: "roomTypes must be an array or JSON string" });
        return;
      }

      //@ts-ignore
      const roomTypes = parsedRoomTypes.map((room) => ({
        name: room.name,
        price: Number(room.price),
        adults: Number(room.adults),
        children: Number(room.children),
        totalRooms: Number(room.totalRooms),
      }));

      // Step 3: Parse facilities
      const facilities = Array.isArray(req.body.facilities)
        ? req.body.facilities
        : [req.body.facilities];

      // Step 4: Get existing image URLs from body
      let existingImageUrls: string[] = [];

      if (Array.isArray(req.body.imageUrls)) {
        existingImageUrls = req.body.imageUrls;
      } else if (typeof req.body.imageUrls === "string") {
        existingImageUrls = [req.body.imageUrls];
      }

      // Step 5: Upload new images (if any)
      const files = req.files as Express.Multer.File[];
      const uploadedImages = await uploadImages(files); // this should return an array of Cloudinary URLs

      // Step 6: Merge existing and new image URLs
      const finalImageUrls = [...existingImageUrls, ...uploadedImages];

      // Step 7: Construct the update object
      const updatedHotelData = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        description: req.body.description,
        type: req.body.type,
        facilities,
        location: {
          lat: Number(req.body["location.lat"]),
          lng: Number(req.body["location.lng"]),
        },
        roomTypes,
        imageUrls: finalImageUrls,
        lastUpdated: new Date(),
      };

      // Step 8: Apply the update
      const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.hotelId,
        updatedHotelData,
        { new: true }
      );

      res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// Delete hotel
router.delete("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    if (hotel.userId.toString() !== req.userId) {
      res.status(403).json({ message: "Not authorized to delete this hotel" });
      return;
    }

    await Hotel.findByIdAndDelete(req.params.hotelId);
    res.json({ message: "Hotel deleted" });
  } catch (error) {
    console.error("Failed to delete hotel:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Helper function to upload files
async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${b64}`;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  return Promise.all(uploadPromises);
}

export default router;
