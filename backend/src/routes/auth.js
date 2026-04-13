import express from "express";
import { signup } from "../controllers/auth_controller.js";

const router = express.Router()

router.post("/signup", signup);

router.get("/login", (req, resp) => {
   resp.send("login endpoint")
});

router.get("/logout", (req, resp) => {
    resp.send("logout endpoint")
});

export default router;