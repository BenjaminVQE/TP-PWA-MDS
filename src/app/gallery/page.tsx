"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPhotos } from "@/lib/storage";
import { Photo } from "@/lib/types";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        setPhotos(getPhotos());
    }, []);

    return (
        <main style={{ minHeight: "100vh", padding: "1rem" }}>
            <OfflineIndicator />

            <header style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href="/reception" style={{ fontSize: "1.5rem", textDecoration: "none" }}>←</Link>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Photo Gallery</h1>
            </header>

            {photos.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--foreground)", opacity: 0.5, marginTop: "5rem" }}>
                    No photos yet. Take some in a chat!
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "1rem"
                }}>
                    {photos.map((photo) => (
                        <div key={photo.id} className="glass" style={{
                            position: "relative",
                            aspectRatio: "1 / 1",
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                        }}>
                            <img src={photo.url} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "rgba(0,0,0,0.5)",
                                color: "white",
                                fontSize: "0.75rem",
                                padding: "0.25rem",
                                textAlign: "center"
                            }}>
                                {new Date(photo.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
