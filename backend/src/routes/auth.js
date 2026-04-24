import express from "express";
import { signup } from "../controllers/signup_controller.js";
import { login } from "../controllers/login_controller.js";
import { logout } from "../controllers/logout_controller.js";

const router = express.Router()

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout",logout);

export default router;