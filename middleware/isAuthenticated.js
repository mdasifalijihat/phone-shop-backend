import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
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

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        req.id = user._id;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
export default isAuthenticated;  