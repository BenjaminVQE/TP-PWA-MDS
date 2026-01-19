"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, getMessages, saveMessage, getRooms, savePhoto } from "@/lib/storage";
import { User, Message, Room, Photo } from "@/lib/types";
import CameraCapture from "@/components/CameraCapture";
import OfflineIndicator from "@/components/OfflineIndicator";
import socket from "@/lib/socket";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [user, setUser] = useState<User | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Sert à ignorer l'echo serveur de nos propres messages (anti-doublon)
    // On garde une trace des messages envoyés récemment (contenu + pseudo + timestamp)
    const recentSentMessagesRef = useRef<Map<string, number>>(new Map());
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

    // Socket.IO Integration
    useEffect(() => {
        if (!room || !user) return;

        socket.connect();

        const onConnect = () => {
            console.log("Connected to Socket.IO server");
            setIsConnected(true);

            socket.emit("chat-join-room", {
                roomName: room.name,
                pseudo: user.pseudo,
                userId: user.id
            });
        };

        const onDisconnect = () => {
            console.log("Disconnected from server");
            setIsConnected(false);
        };

        const onMessage = (data: any) => {
            console.log("Message received:", data);

            const messageContent = data.content || data.message || "";
            const messagePseudo = data.pseudo || data.username || data.sender || "";
            const messageUserId = data.userId || data.senderId || "";
            const messageTimestamp = data.dateEmis
                ? new Date(data.dateEmis).getTime()
                : data.timestamp
                    ? new Date(data.timestamp).getTime()
                    : Date.now();

            // Détection de doublon pour nos propres messages
            if ((messageUserId === user.id || messagePseudo === user.pseudo) && messageContent.trim()) {
                const messageKey = `${messageContent.trim()}_${messagePseudo}`;
                const sentTimestamp = recentSentMessagesRef.current.get(messageKey);

                // Si on a envoyé ce message récemment (< 3 secondes), c'est un doublon - on l'ignore
                if (sentTimestamp && Math.abs(messageTimestamp - sentTimestamp) < 3000) {
                    console.log("Message dupliqué ignoré (timestamp):", messageKey);
                    recentSentMessagesRef.current.delete(messageKey);
                    return;
                }

                // Vérifier aussi dans la liste des messages existants pour éviter les doublons
                setMessages(prev => {
                    const trimmedContent = messageContent.trim();
                    const isDuplicate = prev.some(msg =>
                        msg.senderId === user.id &&
                        msg.content.trim() === trimmedContent &&
                        Math.abs(msg.timestamp - messageTimestamp) < 2000
                    );

                    if (isDuplicate) {
                        console.log("Message dupliqué détecté dans la liste existante, ignoré");
                        return prev; // Retourner la liste inchangée
                    }

                    // Sinon, ajouter le message
                    const newMessage: Message = {
                        id: data.id || crypto.randomUUID(),
                        roomId: id,
                        senderId: messageUserId || "unknown",
                        senderName: messagePseudo || "Inconnu",
                        content: messageContent,
                        timestamp: messageTimestamp,
                    };
                    saveMessage(newMessage);
                    return [...prev, newMessage];
                });
                return;
            }

            const newMessage: Message = {
                id: data.id || crypto.randomUUID(),
                roomId: id,
                senderId: messageUserId || "unknown",
                senderName: messagePseudo || "Inconnu",
                content: messageContent,
                timestamp: messageTimestamp,
            };

            // Save and update state
            saveMessage(newMessage);
            setMessages(prev => [...prev, newMessage]);

            // Notification pour messages en arrière-plan
            if (document.hidden && "Notification" in window && Notification.permission === "granted") {
                new Notification(`New message in ${room.name}`, {
                    body: `${newMessage.senderName}: ${newMessage.content}`,
                    icon: "/icons/icon-192x192.png"
                });
            }
        };

        const onRoomInfo = (data: any) => {
            console.log("Room info:", data);
            if (data.clients) {
                setParticipants(Object.keys(data.clients).length);
            } else if (data.participants) {
                setParticipants(data.participants);
            }
        };

        const onError = (msg: string) => {
            console.error("Socket error:", msg);
            alert(`Erreur du serveur: ${msg}.`);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("chat-msg", onMessage);
        socket.on("chat-joined-room", onRoomInfo);
        socket.on("chat-disconnected", onRoomInfo);
        socket.on("error", onError);

        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.emit("leave_room", { room: room.name, userId: user.id });
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("chat-msg", onMessage);
            socket.off("chat-joined-room", onRoomInfo);
            socket.off("chat-disconnected", onRoomInfo);
            socket.off("error", onError);
            socket.disconnect();
        };
    }, [room, user, id]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (content: string, imageUrl?: string) => {
        if (!user || !room || (!content.trim() && !imageUrl)) return;

        const timestamp = Date.now();
        const newMessage: Message = {
            id: crypto.randomUUID(),
            roomId: id,
            senderId: user.id,
            senderName: user.pseudo,
            content: content,
            imageUrl: imageUrl,
            timestamp: timestamp,
        };

        // Emit to socket
        if (isConnected) {
            socket.emit("chat-msg", {
                content,
                roomName: room.name,
                userId: user.id,
                pseudo: user.pseudo,
                categorie: "MESSAGE",
                dateEmis: new Date(timestamp).toISOString(),
                imageUrl: imageUrl
            });

            // Compat anciens backends
            socket.emit("send_message", {
                room: room.name,
                message: content,
                username: user.pseudo,
                userId: user.id,
                timestamp: new Date(timestamp).toISOString(),
                imageUrl: imageUrl // Optional extension if backend supports it
            });
        }

        // Enregistre ce message comme envoyé récemment pour détecter les doublons
        if (content.trim()) {
            const messageKey = `${content.trim()}_${user.pseudo}`;
            recentSentMessagesRef.current.set(messageKey, timestamp);
            // Nettoie après 10 secondes pour éviter une fuite mémoire
            setTimeout(() => {
                recentSentMessagesRef.current.delete(messageKey);
            }, 10000);
        }

        // Save locally
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
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{
                                width: "0.5rem",
                                height: "0.5rem",
                                borderRadius: "50%",
                                background: isConnected ? "#22c55e" : "#ef4444"
                            }}></span>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                                {isConnected ? `${participants} participants` : 'Connecting...'}
                            </span>
                        </div>
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
                                // Sur certains thèmes, --foreground peut être blanc => texte invisible sur bulle blanche
                                color: isMe ? "white" : "#111827",
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