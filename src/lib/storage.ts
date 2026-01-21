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
        try {
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return null;
        }
    }
    return null;
};

export const setLocalStorage = (key: string, value: any) => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn("LocalStorage quota exceeded. Offline backup paused.");
            // On pourrait notifier l'utilisateur que le stockage est plein
        }
    }
};

// User
export const getUser = (): User | null => getLocalStorage(STORAGE_KEYS.USER);
export const saveUser = (user: User) => setLocalStorage(STORAGE_KEYS.USER, user);

// Rooms
export const getRooms = (): Room[] => {
    return getLocalStorage(STORAGE_KEYS.ROOMS) || [];
};
export const saveRooms = (newRooms: Room[]) => {
    const existingRooms = getRooms() || [];
    const updatedRooms = [...existingRooms];

    newRooms.forEach(newRoom => {
        const index = updatedRooms.findIndex(r => r.id === newRoom.id);
        if (index > -1) {
            // Keep existing lastMessage/lastActivity if not present in newRoom
            updatedRooms[index] = {
                ...updatedRooms[index],
                ...newRoom
            };
        } else {
            updatedRooms.push(newRoom);
        }
    });

    setLocalStorage(STORAGE_KEYS.ROOMS, updatedRooms);
};

export const saveRoom = (room: Room) => {
    saveRooms([room]);
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
