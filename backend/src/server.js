import express from "express";

import authRoutes  from "./routes/auth.js";
import messageRoutes  from "./routes/message.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app = express();
const _dirname = path.resolve();
const { PORT, NODE_ENV } = ENV;

app.use(express.json()); // req.body

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if(NODE_ENV == "production"){
    app.use(express.static(path.join(_dirname, "../frontend/dist")));

    app.get("*", (_, res) => {
        res.sendFile(path.join(_dirname, "../frontend","dist","index.html"));
    });
}

app.listen(PORT,()=>{
    console.log("server running on port:", PORT);
    connectDB();
});
