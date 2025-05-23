import mongoose from "mongoose";
import { UserType } from "../shared/types";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String },
  phoneNumber: { type: String },
  resetToken: { type: String }, // Token for password reset
  resetTokenExpiry: { type: Number }, // Expiry time for reset token
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
