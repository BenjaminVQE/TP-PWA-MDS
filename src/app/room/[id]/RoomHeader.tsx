import Link from "next/link";
import { Room } from "@/lib/types";

export default function RoomHeader({
    room,
    isConnected,
    participants,
    onLeave
}: {
    room: Room;
    isConnected: boolean;
    participants: number;
    onLeave?: () => void;
}) {
    return (
        <header
            className="glass"
            style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                zIndex: 10,
                position: "relative"
            }}
        >
            {/* Left */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                }}
            >
                <Link
                    href="/reception"
                    style={{
                        fontSize: "1.25rem",
                        padding: "0 0.5rem",
                        textDecoration: "none"
                    }}
                >
                    ←
                </Link>

                <div>
                    <h1
                        style={{
                            fontWeight: "bold",
                            fontSize: "1.125rem",
                            margin: 0
                        }}
                    >
                        {room.name}
                    </h1>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                    >
                        <span
                            style={{
                                width: "0.5rem",
                                height: "0.5rem",
                                borderRadius: "50%",
                                background: isConnected
                                    ? "#22c55e"
                                    : "#ef4444"
                            }}
                        />

                        <span
                            style={{
                                fontSize: "0.75rem",
                                opacity: 0.8
                            }}
                        >
                            {isConnected
                                ? `${participants} participants`
                                : "Connecting..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right */}
            {onLeave && (
                <button
                    onClick={onLeave}
                    style={{
                        color: "#ef4444",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    Leave
                </button>
            )}
        </header>
    );
}
