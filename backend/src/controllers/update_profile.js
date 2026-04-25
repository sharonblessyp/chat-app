import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";

export const updateProfile = async (req, res) => {
    const { profilePic } = req.body ?? {};

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const trimmedProfilePic = profilePic.trim();
        if (!trimmedProfilePic) {
            return res.status(400).json({ message: "profilePic cannot be empty" });
        }

        const uploadResponse = await cloudinary.uploader.upload(trimmedProfilePic, {
            folder: "chat-app/profiles",
        });

        user.profilePic = uploadResponse.secure_url;
        

        const updatedUser = await user.save();

        return res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
        });
    } catch (error) {
        console.error("Error in update profile controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
