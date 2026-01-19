"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, getRooms, saveRoom } from "@/lib/storage";
import { User, Room } from "@/lib/types";
import UserProfile from "@/components/UserProfile";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function Reception() {
    const [user, setUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loadedUser = getUser();
        if (loadedUser) setUser(loadedUser);
        else setIsEditingProfile(true);

        setRooms(getRooms());
    }, []);

    const handleProfileSave = () => {
        setUser(getUser());
        setIsEditingProfile(false);
    };

    const createRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        const newRoom: Room = {
            id: crypto.randomUUID(),
            name: newRoomName,
            lastActivity: Date.now(),
            lastMessage: "Created room"
        };
        saveRoom(newRoom);
        setRooms(getRooms());
        setNewRoomName("");
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
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", paddingLeft: "0.5rem" }}>Rooms</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
                {rooms.map((room) => (
                    <Link key={room.id} href={`/room/${room.id}`} style={{ textDecoration: "none", display: "block" }}>
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

            {/* Create Room */}
            <form onSubmit={createRoom} className="glass" style={{ marginTop: "2rem", padding: "1rem", borderRadius: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Create New Room</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Room Name"
                        style={{
                            flex: 1,
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border)",
                            background: "rgba(255,255,255,0.5)"
                        }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                        + Add
                    </button>
                </div>
            </form>
        </main>
    );
}
