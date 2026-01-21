import { Message, User } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
    ssr: false,
    loading: () => <div style={{ height: "200px", background: "#f0f0f0", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Map...</div>
});

export default function MessageList({
    messages,
    user
}: {
    messages: Message[];
    user: User;
}) {
    const endRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Track if we should stick to bottom
    const isAtBottomRef = useRef(true);
    const hasInitialScrolledRef = useRef(false);

    // Handle scroll events to detect if user is at bottom
    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

        isAtBottomRef.current = isAtBottom;
        setShowScrollButton(!isAtBottom);
    };

    // Auto-scroll logic
    useEffect(() => {
        if (messages.length === 0) return;

        // 1. Initial Load: Always scroll to bottom
        if (!hasInitialScrolledRef.current) {
            // Scroll immediately
            endRef.current?.scrollIntoView({ behavior: "auto" });

            // Scroll again after a short delay to account for image/map loading
            setTimeout(() => {
                endRef.current?.scrollIntoView({ behavior: "auto" });
            }, 100);

            hasInitialScrolledRef.current = true;
            return;
        }

        // 2. New Message: Scroll only if we were already at bottom
        if (isAtBottomRef.current) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            // Otherwise show button (handled by handleScroll state update usually, but ensure it's on)
            setShowScrollButton(true);
        }
    }, [messages]);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div style={{ position: "relative", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="chat-scroll"
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}
            >
                {messages.map((msg, idx) => {
                    const isMe = msg.senderName === user.pseudo;

                    return (
                        <div
                            key={`${msg.timestamp}-${idx}`}
                            style={{
                                display: "flex",
                                justifyContent: isMe ? "flex-end" : "flex-start"
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: "80%",
                                    padding: "0.75rem",
                                    borderRadius: "1rem",
                                    borderBottomRightRadius: isMe ? 0 : "1rem",
                                    borderBottomLeftRadius: isMe ? "1rem" : 0,
                                    background: isMe
                                        ? "var(--primary-gradient)"
                                        : "white",
                                    color: isMe ? "white" : "#111827",
                                    boxShadow: isMe
                                        ? "none"
                                        : "0 1px 2px 0 rgb(0 0 0 / 0.05)"
                                }}
                            >
                                {!isMe && (
                                    <div
                                        style={{
                                            fontSize: "0.75rem",
                                            opacity: 0.75,
                                            marginBottom: "0.25rem"
                                        }}
                                    >
                                        {msg.senderName}
                                    </div>
                                )}

                                {msg.location && (
                                    <div style={{ marginBottom: "0.5rem" }}>
                                        <LocationMap lat={msg.location.lat} lng={msg.location.lng} />
                                    </div>
                                )}

                                {msg.imageUrl && (
                                    <img
                                        src={msg.imageUrl}
                                        alt="Attachment"
                                        onClick={() => setSelectedImage(msg.imageUrl || null)}
                                        style={{
                                            borderRadius: "0.5rem",
                                            marginBottom: "0.5rem",
                                            maxWidth: "100%",
                                            maxHeight: "200px",
                                            cursor: "pointer"
                                        }}
                                    />
                                )}

                                {msg.content && (
                                    msg.content.startsWith("data:image/") ? (
                                        !msg.imageUrl && (
                                            <img
                                                src={msg.content}
                                                alt="Base64 Image"
                                                onClick={() => setSelectedImage(msg.content)}
                                                style={{
                                                    borderRadius: "0.5rem",
                                                    maxWidth: "100%",
                                                    maxHeight: "200px",
                                                    cursor: "pointer"
                                                }}
                                            />
                                        )
                                    ) : (
                                        <p>{msg.content}</p>
                                    )
                                )}

                                <div
                                    style={{
                                        fontSize: "0.625rem",
                                        opacity: 0.7,
                                        textAlign: "right",
                                        marginTop: "0.25rem"
                                    }}
                                >
                                    {new Date(msg.timestamp).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div ref={endRef} />
            </div>

            {/* Floating Scroll Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="animate-fade-in"
                    style={{
                        position: "absolute",
                        bottom: "1rem",
                        right: "1rem",
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        zIndex: 10
                    }}
                >
                    ↓
                </button>
            )}

            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "zoom-out"
                    }}
                >
                    <img
                        src={selectedImage}
                        alt="Enlarged"
                        style={{
                            maxWidth: "95vw",
                            maxHeight: "95vh",
                            objectFit: "contain"
                        }}
                    />
                </div>
            )}
        </div>
    );
}
