export interface User {
    id: string;
    pseudo: string;
    photoUrl?: string; // base64 or blob url
}

export interface Message {
    senderName: string;
    content: string;
    timestamp: number;
    imageUrl?: string;
    roomId: string;
    location?: {
        lat: number;
        lng: number;
    };
}

export interface Room {
    id: string;
    name: string;
    lastMessage?: string;
    lastActivity?: number;
    participants?: number;
}

export interface Photo {
    id: string;
    url: string;
    timestamp: number;
    roomId?: string;
}
