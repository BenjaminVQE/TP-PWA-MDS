"use client";
import { io } from "socket.io-client";

const socket = io("https://api.tools.gavago.fr", {
    autoConnect: false,
    transports: ["polling", "websocket"],
});

export default socket;
