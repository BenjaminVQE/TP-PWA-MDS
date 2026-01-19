import { Room } from "./types";

const API_BASE_URL = "https://api.tools.gavago.fr";

export async function fetchRooms(): Promise<Room[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/socketio/api/rooms`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const resultData = await response.json();

        // Transform API response to Room[]
        if (resultData.data) {
            return Object.keys(resultData.data).map((roomName) => ({
                id: roomName.toLowerCase().replace(/\s+/g, "-"),
                name: roomName,
                lastActivity: Date.now(),
            }));
        }

        return [];
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }
}
