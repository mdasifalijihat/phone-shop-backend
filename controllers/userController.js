import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check empty fields 
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Generate JWT token for email verification
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });



    // 🔹 Save token with user
    newUser.token = token;
    await newUser.save();

    // 🔹 (Optional) Email verification system will be added later
    verifyEmail(token, email);  // Call the email verification function

    // Response
    return res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: newUser,
        token: token
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
