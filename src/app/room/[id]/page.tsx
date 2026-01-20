"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getUser, getMessages, getRooms } from "@/lib/storage";
import { User, Room, Message } from "@/lib/types";
import OfflineIndicator from "@/components/OfflineIndicator";
import RoomHeader from "./RoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useRoomSocket } from "./useRoomSocket";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const u = getUser();
        if (!u) return router.push("/reception");
        setUser(u);

        const r = getRooms().find(r => r.id === id);
        if (r) {
            setRoom(r);
        } else {
            // Room not in local storage yet (newly joined/created)
            // Construct a temporary room object
            setRoom({
                id: id,
                name: decodeURIComponent(id),
                lastActivity: Date.now()
            });
        }

        setMessages(getMessages(id));
    }, [id, router]);

    const { isConnected, participants, sendMessage } =
        useRoomSocket({ room, user, setMessages });

    if (!user || !room) return null;

    const leaveRoom = () => {
        if (!room) return;

        if (confirm("Are you sure you want to leave (unsubscribe) this room?")) {
            const rooms = getRooms();
            const updatedRooms = rooms.filter(r => r.id !== room.id);

            if (typeof window !== "undefined") {
                localStorage.setItem("pwa_rooms", JSON.stringify(updatedRooms));
            }

            router.push("/reception");
        }
    };


    return (
        <main style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden"
        }}>
            <OfflineIndicator />

            <RoomHeader
                room={room}
                isConnected={isConnected}
                participants={participants}
                onLeave={leaveRoom}
            />

            <MessageList messages={messages} user={user} />

            <MessageInput onSend={sendMessage} />
        </main>
    );
}
