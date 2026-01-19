"use client";

import { Message, Photo, Room, User } from "./types";

const STORAGE_KEYS = {
    USER: "pwa_user",
    ROOMS: "pwa_rooms",
    MESSAGES: "pwa_messages_",
    PHOTOS: "pwa_photos",
};

export const getLocalStorage = (key: string) => {
    if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    return null;
};

export const setLocalStorage = (key: string, value: any) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// User
export const getUser = (): User | null => getLocalStorage(STORAGE_KEYS.USER);
export const saveUser = (user: User) => setLocalStorage(STORAGE_KEYS.USER, user);

// Rooms
export const getRooms = (): Room[] => {
    return getLocalStorage(STORAGE_KEYS.ROOMS) || [
        { id: "general", name: "General Chat" },
        { id: "tech", name: "Tech Talk" },
        { id: "random", name: "Random" },
    ]; // Default rooms
};
export const saveRoom = (room: Room) => {
    const rooms = getRooms();
    const index = rooms.findIndex((r) => r.id === room.id);
    if (index > -1) rooms[index] = room;
    else rooms.push(room);
    setLocalStorage(STORAGE_KEYS.ROOMS, rooms);
};

// Messages
export const getMessages = (roomId: string): Message[] => {
    return getLocalStorage(`${STORAGE_KEYS.MESSAGES}${roomId}`) || [];
};

export const saveMessage = (message: Message) => {
    const messages = getMessages(message.roomId);
    messages.push(message);
    setLocalStorage(`${STORAGE_KEYS.MESSAGES}${message.roomId}`, messages);

    // Update Room last activity
    const rooms = getRooms();
    const room = rooms.find(r => r.id === message.roomId);
    if (room) {
        room.lastMessage = message.content;
        room.lastActivity = message.timestamp;
        saveRoom(room);
    }
};

// Photos
export const getPhotos = (): Photo[] => getLocalStorage(STORAGE_KEYS.PHOTOS) || [];
export const savePhoto = (photo: Photo) => {
    const photos = getPhotos();
    photos.unshift(photo);
    setLocalStorage(STORAGE_KEYS.PHOTOS, photos);
};
