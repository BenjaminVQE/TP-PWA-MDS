import { Message, User } from "@/lib/types";
import { useEffect, useRef } from "react";

export default function MessageList({
    messages,
    user
}: {
    messages: Message[];
    user: User;
}) {
    const endRef = useRef<HTMLDivElement>(null);

    // 🔽 Auto-scroll vers le bas à chaque nouveau message
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
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
            {messages.map((msg) => {
                const isMe = msg.senderId === user.id;

                return (
                    <div
                        key={msg.id}
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

                            {msg.imageUrl && (
                                <img
                                    src={msg.imageUrl}
                                    alt="Attachment"
                                    style={{
                                        borderRadius: "0.5rem",
                                        marginBottom: "0.5rem",
                                        maxWidth: "100%",
                                        maxHeight: "200px"
                                    }}
                                />
                            )}

                            {msg.content && <p>{msg.content}</p>}

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
    );
}
