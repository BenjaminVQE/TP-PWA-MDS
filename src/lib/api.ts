import { Room } from "./types";

// Use relative path to hit Next.js proxy (configured in next.config.ts)
const API_BASE_URL = "";


export async function fetchRooms(): Promise<Room[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/socketio/api/rooms`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const resultData = await response.json();

        if (resultData.data) {
            return Object.keys(resultData.data).map((roomName) => {
                let displayName = roomName;
                try {
                    // Certaines rooms reviennent encodées (ex: "test%20ABC")
                    displayName = decodeURIComponent(roomName);
                } catch {
                    // ignore: garder le nom brut si non décodable
                }

                return {
                    // IMPORTANT: l'id doit rester unique/stable.
                    // On utilise la clé renvoyée par l'API (pas de "slug") pour éviter les collisions.
                    id: roomName,
                    name: displayName,
                    lastActivity: Date.now(),
                };
            });
        }

        return [];
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }
}

export function getRoomFromId(id: string): Room {
    let name = id;
    try {
        name = decodeURIComponent(id);
    } catch {
        // ignore
    }
    return {
        id,
        name,
        lastActivity: Date.now()
    };
}

