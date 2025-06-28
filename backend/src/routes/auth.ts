import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();

router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Invalid Credentials" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Invalid Credentials" });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      res.status(200).json({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
});

router.post("/logout", (req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    expires: new Date(0),
  });
  res.send();
});

// FORGOT PASSWORD ROUTE
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    // Generate a unique token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    // Create Nodemailer Transporter with a fixed email
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "emiliahodina@gmail.com",
        pass: "jmotyeizfbwopmpi",
      },
    });

    var mailOptions = {
      from: "emiliahodina@gmail.com",
      to: user.email,
      subject: "Reset your password",
      text: `Click the link to reset your password: http://localhost:5173/reset-password?token=${user.resetToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error); // Log detailed error
        res
          .status(500)
          .json({ message: "Error sending email", error: error.message });
      } else {
        console.log("Email sent: " + info.response);
        res.json({ message: "Reset link sent" });
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// RESET PASSWORD ROUTE
router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // Clear the reset token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;
