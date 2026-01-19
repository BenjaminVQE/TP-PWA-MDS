"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPhotos } from "@/lib/storage";
import { Photo } from "@/lib/types";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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
                        <div
                            key={photo.id}
                            className="glass"
                            onClick={() => setSelectedPhoto(photo)}
                            style={{
                                position: "relative",
                                aspectRatio: "1 / 1",
                                borderRadius: "0.75rem",
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "transform 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
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

            {/* Modal/Lightbox */}
            {selectedPhoto && (
                <div
                    onClick={() => setSelectedPhoto(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "2rem",
                        cursor: "pointer"
                    }}
                >
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            border: "none",
                            color: "white",
                            fontSize: "2rem",
                            width: "3rem",
                            height: "3rem",
                            borderRadius: "50%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(10px)"
                        }}
                    >
                        ×
                    </button>
                    <img
                        src={selectedPhoto.url}
                        alt="Full size"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            borderRadius: "0.5rem"
                        }}
                    />
                </div>
            )}
        </main>
    );
}
