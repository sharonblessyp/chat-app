import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateToken } from "../lib/utils.js";

export const login = async (req, res) => {
    const { email, password } = req.body ?? {};

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
