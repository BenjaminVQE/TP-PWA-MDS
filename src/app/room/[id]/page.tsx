"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, getMessages, saveMessage, getRooms, saveRoom, savePhoto } from "@/lib/storage";
import { User, Message, Room, Photo } from "@/lib/types";
import CameraCapture from "@/components/CameraCapture";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [user, setUser] = useState<User | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const loadedUser = getUser();
        if (!loadedUser) {
            router.push("/reception");
            return;
        }
        setUser(loadedUser);

        const rooms = getRooms();
        const currentRoom = rooms.find((r) => r.id === id);
        if (currentRoom) {
            setRoom(currentRoom);
            setMessages(getMessages(id));

            // Request Notification Permission
            if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
            }
        } else {
            // Room not found
            router.push("/reception");
        }
    }, [id, router]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (content: string, imageUrl?: string) => {
        if (!user || (!content.trim() && !imageUrl)) return;

        const newMessage: Message = {
            id: crypto.randomUUID(),
            roomId: id,
            senderId: user.id,
            senderName: user.pseudo,
            content: content,
            imageUrl: imageUrl,
            timestamp: Date.now(),
        };

        // Save
        saveMessage(newMessage);

        // Update local state
        setMessages((prev) => [...prev, newMessage]);
        if (!imageUrl) setInputText(""); // Clear input if text
    };

    const handleCameraCapture = (imageDataUrl: string) => {
        setShowCamera(false);

        // Save photo to gallery
        const newPhoto: Photo = {
            id: crypto.randomUUID(),
            url: imageDataUrl,
            timestamp: Date.now(),
            roomId: id
        };
        savePhoto(newPhoto);

        // Send as message
        sendMessage("Sent a photo", imageDataUrl);

        // Notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Photo Sent", {
                body: `You sent a photo in ${room?.name}`,
                icon: "/icons/icon-192x192.png"
            });
        }
    };

    const leaveRoom = () => {
        if (confirm("Are you sure you want to leave (unsubscribe) this room?")) {
            const rooms = getRooms();
            const updatedRooms = rooms.filter(r => r.id !== id);
            if (typeof window !== "undefined") {
                localStorage.setItem("pwa_rooms", JSON.stringify(updatedRooms));
            }
            router.push("/reception");
        }
    };

    if (!user || !room) return null;

    return (
        <main style={{ display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100vh", background: "#f9fafb" }}>
            <OfflineIndicator />

            {/* Header */}
            <header className="glass" style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                zIndex: 10,
                position: "relative"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link href="/reception" style={{ fontSize: "1.25rem", padding: "0 0.5rem", textDecoration: "none" }}>←</Link>
                    <div>
                        <h1 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>{room.name}</h1>
                        <span style={{ fontSize: "0.75rem", color: "#22c55e", display: "block" }}>Online</span>
                    </div>
                </div>
                <button onClick={leaveRoom} style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                    Leave
                </button>
            </header>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                            <div style={{
                                maxWidth: "80%",
                                padding: "0.75rem",
                                borderRadius: "1rem",
                                borderBottomRightRadius: isMe ? 0 : "1rem",
                                borderBottomLeftRadius: isMe ? "1rem" : 0,
                                background: isMe ? "var(--primary-gradient)" : "white",
                                color: isMe ? "white" : "var(--foreground)",
                                boxShadow: isMe ? "none" : "0 1px 2px 0 rgb(0 0 0 / 0.05)"
                            }}>
                                {!isMe && <div style={{ fontSize: "0.75rem", opacity: 0.75, marginBottom: "0.25rem" }}>{msg.senderName}</div>}

                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="Attachment" style={{ borderRadius: "0.5rem", marginBottom: "0.5rem", maxWidth: "100%", maxHeight: "200px" }} />
                                )}

                                {msg.content && <p>{msg.content}</p>}

                                <div style={{ fontSize: "0.625rem", opacity: 0.7, textAlign: "right", marginTop: "0.25rem" }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="glass" style={{ padding: "1rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }}
                    style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
                >
                    <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        style={{
                            padding: "0.75rem",
                            borderRadius: "50%",
                            background: "#f3f4f6",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.25rem",
                            lineHeight: 1
                        }}
                    >
                        📷
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            background: "#f3f4f6",
                            borderRadius: "1rem",
                            padding: "0.75rem 1rem",
                            border: "none",
                            outline: "none"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        style={{
                            padding: "0.75rem",
                            borderRadius: "50%",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            cursor: inputText.trim() ? "pointer" : "not-allowed",
                            opacity: inputText.trim() ? 1 : 0.5,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        ➤
                    </button>
                </form>
            </div>

            {/* Camera Overlay */}
            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </main>
    );
}
