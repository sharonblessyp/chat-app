import mongoose from "mongoose";
import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../lib/socket.js";

export const getContacts = async (req, res) => {
    try {
        const contacts = await User.find({ _id: { $ne: req.user._id } }).select("-password");
        return res.status(200).json(contacts);
    } catch (error) {
        console.error("Error in getContacts controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/*
get all the chats of the user, 
for each chat get the last message and details of the contact (name, profile pic) and return it to the client
*/
export const getChats = async (req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user._id);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: currentUserId },
                        { receiverId: currentUserId },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $addFields: {
                    contactId: {
                        $cond: [
                            { $eq: ["$senderId", currentUserId] },
                            "$receiverId",
                            "$senderId",
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$contactId",
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            { $sort: { "lastMessage.createdAt": -1 } },
        ]);

        const contactIds = conversations.map((conversation) => conversation._id);
        const contacts = await User.find({ _id: { $in: contactIds } }).select("-password");
        const contactMap = new Map(
            contacts.map((contact) => [contact._id.toString(), contact]),
        );

        const chats = conversations
            .map((conversation) => {
                const contact = contactMap.get(conversation._id.toString());
                if (!contact) {
                    return null;
                }

                return {
                    contact,
                    lastMessage: conversation.lastMessage,
                };
            })
            .filter(Boolean);

        return res.status(200).json(chats);
    } catch (error) {
        console.error("Error in getChats controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessagesByUserId = async (req, res) => {
    const { id: chatUserId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(chatUserId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, receiverId: chatUserId },
                { senderId: chatUserId, receiverId: req.user._id },
            ],
        }).sort({ createdAt: 1 });

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByUserId controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    const { id: receiverId } = req.params;
    const { text, image } = req.body ?? {};

    try {
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const trimmedText = typeof text === "string" ? text.trim() : "";
        const trimmedImage = typeof image === "string" ? image.trim() : "";

        if (!trimmedText && !trimmedImage) {
            return res.status(400).json({ message: "text or image is required" });
        }

        let imageUrl = "";
        if (trimmedImage) {
            const uploadResponse = await cloudinary.uploader.upload(trimmedImage, {
                folder: "chat-app/messages",
            });
            imageUrl = uploadResponse.secure_url;
        }

        const message = await Message.create({
            senderId: req.user._id,
            receiverId,
            text: trimmedText,
            image: imageUrl,
        });

        // send message in real time if user is online using socket.io
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", message);
        }

        return res.status(201).json(message);
    } catch (error) {
        console.error("Error in sendMessage controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
