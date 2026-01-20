"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, saveRooms } from "@/lib/storage";
import { User, Room } from "@/lib/types";
import UserProfile from "@/components/UserProfile";
import OfflineIndicator from "@/components/OfflineIndicator";
import socket from "@/lib/socket";
import { fetchRooms, createRoom } from "@/lib/api";

export default function Reception() {
    const [user, setUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
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

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;
        setIsLoading(true);
        const success = await createRoom(newRoomName);
        if (success) {
            setNewRoomName("");
            setIsCreatingRoom(false);
            await loadRooms();
        } else {
            alert("Failed to create room. It might already exist.");
        }
        setIsLoading(false);
    };

    // Filtrer les rooms selon la recherche
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <button
                    onClick={() => setIsCreatingRoom(true)}
                    className="btn-primary"
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        marginLeft: "0.5rem",
                        cursor: "pointer"
                    }}
                >
                    ➕ New
                </button>
            </div>

            {/* Barre de recherche */}
            <div style={{ marginBottom: "1rem" }}>
                <div style={{ position: "relative" }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un salon..."
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem 0.75rem 2.5rem",
                            borderRadius: "0.75rem",
                            border: "1px solid var(--border)",
                            background: "white",
                            fontSize: "0.875rem",
                            outline: "none",
                            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
                        }}
                    />
                    <span style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "1rem",
                        opacity: 0.5
                    }}>
                        🔍
                    </span>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                position: "absolute",
                                right: "0.75rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.25rem",
                                opacity: 0.5,
                                padding: "0.25rem"
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {isLoading && rooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                    Loading rooms...
                </div>
            ) : filteredRooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                    {searchQuery ? `Aucun salon trouvé pour "${searchQuery}"` : "No rooms available"}
                </div>
            ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {filteredRooms.map((room, idx) => (
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


            {/* Create Room Modal */}
            {isCreatingRoom && (
                <div
                    onClick={() => setIsCreatingRoom(false)}
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem"
                    }}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass"
                        style={{
                            padding: "1.5rem",
                            borderRadius: "1rem",
                            width: "100%",
                            maxWidth: "300px",
                            background: "var(--background)",
                            border: "1px solid var(--border)"
                        }}>
                        <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>New Room</h3>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Room name..."
                            autoFocus
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--border)",
                                marginBottom: "1rem",
                                outline: "none"
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>

                            <button
                                onClick={handleCreateRoom}
                                disabled={!newRoomName.trim() || isLoading}
                                className="btn-primary"
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    cursor: isLoading ? "wait" : "pointer",
                                    opacity: (!newRoomName.trim() || isLoading) ? 0.5 : 1
                                }}
                            >
                                {isLoading ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
