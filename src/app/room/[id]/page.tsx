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
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

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
            height: "100dvh",
            maxHeight: "100dvh",
            overflow: "hidden"
        }}>
            <OfflineIndicator />

            <RoomHeader
                room={room}
                isConnected={isConnected}
                participants={participants}
                onLeave={leaveRoom}
                onParticipantsClick={() => setIsParticipantsModalOpen(true)}
            />

            {/* Participants Modal */}
            {isParticipantsModalOpen && (
                <div
                    onClick={() => setIsParticipantsModalOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem"
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass"
                        style={{
                            padding: "1.5rem",
                            borderRadius: "1rem",
                            width: "100%",
                            maxWidth: "min(300px, 90vw)",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            background: "var(--background)",
                            border: "1px solid var(--border)",
                            position: "relative"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ fontWeight: "bold", margin: 0 }}>Participants</h3>
                            <button
                                onClick={() => setIsParticipantsModalOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "1.25rem",
                                    cursor: "pointer",
                                    padding: "0.25rem",
                                    color: "white"
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {participants.length > 0 ? (
                                participants.map((name, idx) => (
                                    <div key={idx} style={{
                                        padding: "0.5rem",
                                        background: "rgba(0,0,0,0.05)",
                                        borderRadius: "0.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}>
                                        <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "white" }}>
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{name}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ opacity: 0.5, textAlign: "center", padding: "1rem" }}>No one else here...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <MessageList messages={messages} user={user} />

            <MessageInput onSend={sendMessage} />
        </main>
    );
}
