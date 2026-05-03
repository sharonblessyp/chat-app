import express from "express";
import { protectRoute } from "../controllers/middleware/authentication.js";
import {
    getChats,
    getContacts,
    getMessagesByUserId,
    sendMessage,
} from "../controllers/message.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getContacts);
router.get("/chats", getChats);
router.get("/chats/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;
