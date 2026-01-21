import { useRef, useState } from "react";
import CameraCapture from "@/components/CameraCapture";

export default function MessageInput({
    onSend
}: {
    onSend: (content: string, imageUrl?: string, location?: { lat: number; lng: number }) => void;
}) {
    const [text, setText] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className="glass"
            style={{
                padding: "0.5rem",
                borderTop: "1px solid var(--border)",
                flexShrink: 0
            }}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSend(text);
                    setText("");
                }}
                style={{
                    display: "flex",
                    gap: "0.25rem",
                    alignItems: "center",
                    width: "100%"
                }}
            >
                {showCamera && (
                    <CameraCapture
                        onCapture={(image) => {
                            onSend("Sent a photo", image);
                            setShowCamera(false);
                        }}
                        onClose={() => setShowCamera(false)}
                    />
                )}

                {/* Camera button */}
                <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "50%",
                        background: "#f3f4f6",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                        flexShrink: 0,
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    📷
                </button>
                {/* Image picker */}
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "50%",
                        background: "#f3f4f6",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                        flexShrink: 0,
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    🖼️
                </button>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = () =>
                            onSend("Sent a photo", reader.result as string);
                        reader.readAsDataURL(file);

                        if (fileRef.current) fileRef.current.value = "";
                    }}
                />

                {/* Location button */}
                <button
                    type="button"
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const { latitude, longitude } = position.coords;
                                    // Make sure type definition in props matches
                                    // We'll need to update the prop signature below too
                                    onSend("Shared a location", undefined, { lat: latitude, lng: longitude });
                                },
                                (error) => {
                                    alert("Unable to retrieve your location");
                                    console.error(error);
                                }
                            );
                        } else {
                            alert("Geolocation is not supported by this browser.");
                        }
                    }}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "50%",
                        background: "#f3f4f6",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                        flexShrink: 0,
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    📍
                </button>

                {/* Text input */}
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        minWidth: 0,
                        background: "#f3f4f6",
                        borderRadius: "1rem",
                        padding: "0.5rem 0.75rem",
                        border: "none",
                        outline: "none",
                        height: "2.5rem"
                    }}
                />

                {/* Send */}
                <button
                    type="submit"
                    disabled={!text.trim()}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        cursor: text.trim()
                            ? "pointer"
                            : "not-allowed",
                        opacity: text.trim() ? 1 : 0.5,
                        boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        flexShrink: 0,
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    ➤
                </button>
            </form>
        </div>
    );
}
