import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePic: { type: String, default: "" }, //cloudinary images url
    profilePicPublicId: { type: String, default: "" }, //cloudineray public id for deletion 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    token: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null }, //otp expiry time  
    address: { type: String },
    city: { type: String },
    zipcode: { type: String },
    phoneNo: { type: String },


}, { timestamps: true });

export default mongoose.model("User", userSchema);
