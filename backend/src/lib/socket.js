import { Server } from "socket.io"
import http from "http"
import express from "express"
import { ENV } from "./env.js"
import { socketAuthMiddleware } from "../controllers/middleware/socket.js"

const app = express()
const server = http.createServer(app)

// hanles both http requests and socket connections on the same server instance
const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
})

//apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("socket connection event fired", {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.user.fullName,
    });
    console.log(`New socket connection: ${socket.id} for user ${socket.userId}`);
    userSocketMap[socket.userId] = socket.id;   
    

    // io.emit() is used to send events to all connected clients, including the sender.
     io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
     // with socket.on we listen for events from the client, in this case we listen for "disconnect" event which is emitted when a client disconnects from the server. When a user disconnects, we remove them from the userSocketMap and emit the updated list of online users to all remaining clients.
    socket.on("disconnect", () => { 
        console.log(`A user disconnected: ${socket.id} for user ${socket.userId}`);
        delete userSocketMap[socket.userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { server, io, app };
