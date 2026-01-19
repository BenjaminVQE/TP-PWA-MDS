"use client";
import { io } from "socket.io-client";

const socket = io("https://api.tools.gavago.fr", {
    path: "/socket.io/",
    autoConnect: false,
    transports: ["websocket", "polling"],
});

export default socket;
