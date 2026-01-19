"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, saveRooms } from "@/lib/storage";
import { User, Room } from "@/lib/types";
import UserProfile from "@/components/UserProfile";
import OfflineIndicator from "@/components/OfflineIndicator";
import socket from "@/lib/socket";
import { fetchRooms } from "@/lib/api";

export default function Reception() {
    const [user, setUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadedUser = getUser();
        if (loadedUser) setUser(loadedUser);
        else setIsEditingProfile(true);

        // Connect socket
        socket.connect();

        // Load rooms from API
        loadRooms();

        return () => {
            socket.disconnect();
        };
    }, []);

    const loadRooms = async () => {
        setIsLoading(true);
        const apiRooms = await fetchRooms();
        setRooms(apiRooms);
        saveRooms(apiRooms); // Persist fetched rooms to local storage
        setIsLoading(false);
    };

    const handleProfileSave = () => {
        setUser(getUser());
        setIsEditingProfile(false);
    };

    if (isEditingProfile) {
        return (
            <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <UserProfile onSave={handleProfileSave} />
            </main>
        );
    }

    return (
        <main style={{ minHeight: "100vh", paddingTop: "1rem", paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "5rem" }}>
            <OfflineIndicator />

            {/* Header */}
            <header className="glass" style={{
                padding: "1rem",
                borderRadius: "0.75rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: "1rem",
                zIndex: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "#e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="Me" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ fontSize: "0.75rem" }}>Me</div>
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontWeight: "bold" }}>{user?.pseudo}</h2>
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            style={{ fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
                <Link href="/gallery" style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    background: "rgba(0,0,0,0.05)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    textDecoration: "none"
                }}>
                    Gallery
                </Link>
            </header>

            {/* Room List */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingLeft: "0.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Rooms</h3>
                <button
                    onClick={loadRooms}
                    disabled={isLoading}
                    className="btn-primary"
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        opacity: isLoading ? 0.5 : 1,
                        cursor: isLoading ? "not-allowed" : "pointer"
                    }}
                >
                    {isLoading ? "Loading..." : "🔄 Reload"}
                </button>
            </div>

            {isLoading && rooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                    Loading rooms...
                </div>
            ) : rooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                    No rooms available
                </div>
            ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {rooms.map((room, idx) => (
                        <Link
                            key={`${room.id}-${idx}`}
                            href={`/room/${encodeURIComponent(room.id)}`}
                            style={{ textDecoration: "none", display: "block" }}
                        >
                            <div className="glass" style={{
                                padding: "1rem",
                                borderRadius: "0.75rem",
                                position: "relative",
                                transition: "background 0.2s"
                            }}>
                                <h4 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>{room.name}</h4>
                                <p style={{ fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {room.lastMessage || "No messages yet"}
                                </p>
                                {room.lastActivity && (
                                    <span style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.75rem", opacity: 0.5 }}>
                                        {new Date(room.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
