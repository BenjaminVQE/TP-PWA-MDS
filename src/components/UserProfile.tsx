"use client";

import { useEffect, useState } from "react";
import { User } from "../lib/types";
import { getUser, saveUser } from "../lib/storage";
import { useRouter } from "next/navigation";

export default function UserProfile({ onSave }: { onSave?: () => void }) {
    const [pseudo, setPseudo] = useState("");
    const [photo, setPhoto] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const user = getUser();
        if (user) {
            setPseudo(user.pseudo);
            setPhoto(user.photoUrl || null);
        }
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pseudo.trim()) return;

        const newUser: User = {
            id: getUser()?.id || crypto.randomUUID(),
            pseudo,
            photoUrl: photo || undefined,
        };

        saveUser(newUser);
        if (onSave) onSave();
        else router.push("/reception");
    };

    return (
        <form onSubmit={handleSave} className="glass" style={{ padding: "2rem", borderRadius: "1rem", maxWidth: "400px", width: "100%" }}>
            <h2 style={{ marginBottom: "1.5rem", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" }}>Your Profile</h2>

            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#e2e8f0", overflow: "hidden", position: "relative" }}>
                    {photo ? (
                        <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b" }}>
                            No Photo
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Pseudo</label>
                <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Enter your pseudo"
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.5)"
                    }}
                    required
                />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                Save & Continue
            </button>
        </form>
    );
}
