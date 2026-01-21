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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const hasScrolledRef = useRef(false);

    // 🔽 Auto-scroll vers le bas uniquement lors du chargement initial des messages
    useEffect(() => {
        if (!hasScrolledRef.current && messages.length > 0) {
            endRef.current?.scrollIntoView({ behavior: "auto" }); // "auto" for instant jump on load, "smooth" might be distracting
            hasScrolledRef.current = true;
        }
    }, [messages]);

    return (
        <div
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
