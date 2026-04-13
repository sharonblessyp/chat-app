import express from "express"
import dotenv from "dotenv"

import authRoutes  from "./routes/auth.js"
import messageRoutes  from "./routes/message.js"
import path from "path"
import { connectDB } from "./lib/db.js"

dotenv.config();

const app = express()
const _dirname = path.resolve()

const PORT = process.env.PORT || 3000;

app.use(express.json()) // req.Body

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if(process.env.NODE_ENV == "production"){
    app.use(express.static(path.join(_dirname, "../frontend/dist")))

    app.get("*", (_, res) => {
        res.sendFile(path.join(_dirname, "../frontend","dist","index.html"))
    })
}

app.listen(PORT,()=>{
    console.log("server running on port:", PORT)
     connectDB()
})