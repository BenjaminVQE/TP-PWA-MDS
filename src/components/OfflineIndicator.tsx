"use client";

import { useEffect, useState } from "react";

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        if (typeof window !== "undefined") {
            setIsOffline(!navigator.onLine);
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ef4444",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            fontWeight: "500",
            zIndex: 50,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
            You are currently offline
        </div>
    );
}
