import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now, expires: '2h' }, // Session expires after 2 hours
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);