import express from "express";

const router = express.Router()

router.get("/signup", (req, resp) => {
    resp.send("signup endpoint")
});

router.get("/login", (req, resp) => {
   resp.send("login endpoint")
});

router.get("/logout", (req, resp) => {
    resp.send("logout endpoint")
});

export default router;