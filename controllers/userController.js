import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import sessionModel from "../models/sessionModel.js";

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

// export const verify = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("bearer ")) {
//       return res.status(401).json({ success: false, message: "Authorization token is missing or invalid " });
//     }

//     const token = authHeader.split(" ")[1];  // Bearer <token>

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.SECRET_KEY);
//       return res.status(200).json({ success: true, message: "Token verified", decoded });
//     } catch (error) {
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({ success: false, message: "Token has expired" });
//       }
//       return res.status(401).json({ success: false, message: "Token is invalid" });
//     }

//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     user.token = null;
//     user.isVerified = true;
//     await user.save();
//     return res.status(200).json({ success: true, message: "Email verified successfully" });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };


export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Token has expired" });
      }
      return res
        .status(401)
        .json({ success: false, message: "Token is invalid" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


export const reVerify = async (req, res) => {

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    verifyEmail(token, email); // Call the email verification function
    user.token = token;
    await user.save();
    return res.status(200).json({ success: true, message: "Verification email sent", token: user.token });

  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }

}

// isLogin middleware will be added later

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    // email verification check will be added later
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Password verification
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    // Email verification check
    if (!existingUser.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified",
      });
    }


    // Generate JWT token for login
    const accessToken = jwt.sign({ id: existingUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign({ id: existingUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    existingUser.isLoggedIn = true;
    await existingUser.save();

    // user delete existing session if exists
    const existingSession = await sessionModel.findOne({ userId: existingUser._id });
    if (existingSession) {
      await sessionModel.deleteOne({ userId: existingUser._id });
    }

    await sessionModel.create({
      userId: existingUser._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    })
    return res.status(200).json({
      success: true, message: `Welcome back ${existingUser.firstName}`,
      user: existingUser,
      accessToken,
      refreshToken
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
}


// logout controller to be added later
export const logout = async (req, res) => {
  try {
    const userId = req.id
    await sessionModel.deleteOne({ userId: userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
}


// forgotPassword and resetPassword controllers to be added later
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOTPMail(email, otp); // Function to send OTP email (implementation not shown here)
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    // Send email with the token (implementation not shown here)
    return res.status(200).json({ success: true, message: "Password reset email sent", token });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
}

