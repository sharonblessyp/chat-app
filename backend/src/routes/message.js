import express from "express";

const router = express.Router()

router.get("/send", (req, resp) => {
    resp.send("send message endpoint");
});

export default router;