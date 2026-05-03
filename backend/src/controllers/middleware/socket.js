import jwt from "jsonwebtoken"
import User from "../../models/user.js"
import { ENV } from "../../lib/env.js"

export const socketAuthMiddleware = async (socket, next) => {
    try {
        // extract token from http-only cookies
        const token = socket.handshake.headers.cookie
            ?.split(";")
            .find(cookie => cookie.trim().startsWith("jwt="))
            ?.split("=")[1]; 
       
        if (!token) {
            console.log("No token provided in socket handshake");
            return next(new Error("Unauthorized - No token provided"));
        }

        // verify the token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded?.userId) {
            console.log("Invalid token in socket handshake");
            return next(new Error("Unauthorized - Invalid token"));
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.log("User not found in socket handshake");
            return next(new Error("Unauthorized - User not found"));
        }
        
        // attach user info to socket
        socket.user = user;
        socket.userId = user._id.toString();
        next();  
    }catch (error) {
        console.error("Error in socket auth middleware", error.message);
        return next(new Error("Unauthorized - Invalid token"));
    }
};
