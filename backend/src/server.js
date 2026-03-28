import express from "express"
import dotenv from "dotenv"

import authRoutes  from "./routes/auth.js"
import messageRoutes  from "./routes/message.js"
import path from "path"

dotenv.config();

const app = express()
const _dirname = path.resolve()

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if(process.env.NODE_ENV == "production"){
    app.use(express.static(path.join(_dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(_dirname, "../frontend","dist","index.html"))
    })
}
app.listen(PORT, ()=> console.log("Server running on port " + PORT));
