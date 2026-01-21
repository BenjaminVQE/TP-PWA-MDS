import { useEffect, useState, useRef } from "react";
import socket from "@/lib/socket";
import { Message, Room, User } from "@/lib/types";
import { saveMessage } from "@/lib/storage";

export function useRoomSocket({
  room,
  user,
  setMessages
}: {
  room: Room | null;
  user: User | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);



  useEffect(() => {
    if (!room || !user) return;

    socket.connect();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit("chat-join-room", {
        roomName: room.name,
        userId: user.id,
        pseudo: user.pseudo
      });
    };

    const onDisconnect = () => setIsConnected(false);

    const onMsg = (data: any) => {
      let content = data.content || "";
      let location = data.location || null;

      // Check if content is our specific JSON format: {"type":"geo", ...} or {"type":"LOCATION", ...}
      // We prioritize this content parsing if found, to ensure consistency
      if (typeof content === "string" && content.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(content);
          if (parsed && (parsed.type === "geo" || parsed.type === "LOCATION") && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
            location = { lat: parsed.lat, lng: parsed.lng };
            content = "Shared a location";
          }
        } catch (e) {
          // Not valid JSON or not our format, ignore
        }
      }

      // Fallback for legacy "LOCATION:" prefix if strictly needed, but JSON format above is preferred
      if (!location && typeof content === "string" && content.startsWith("LOCATION:")) {
        try {
          location = JSON.parse(content.substring(9));
          content = "Shared a location";
        } catch (e) {
          console.error("Failed to parse LOCATION: prefix", e);
        }
      }

      // Ensure location has valid numbers if it came from data.location directly
      if (location && (typeof location.lat !== 'number' || typeof location.lng !== 'number')) {
        location = null;
      }

      const msg: Message = {
        roomId: room.id,
        senderName: data.pseudo,
        content: content,
        imageUrl: data.imageUrl || data.image_data || null,
        location: location,
        timestamp: Date.now()
      };

      saveMessage(msg);
      setMessages(prev => [...prev, msg]);
    };



    const onJoinedRoom = (d: any) => {
      // Si d.clients est un objet, on récupère les pseudos
      if (d.clients && typeof d.clients === "object") {
        const pseudos = Object.values(d.clients).map((c: any) => c.pseudo || "Unknown");
        setParticipants(pseudos);
      } else {
        setParticipants([]);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-msg", onMsg);
    socket.on("chat-joined-room", onJoinedRoom);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat-msg", onMsg);
      socket.off("chat-joined-room", onJoinedRoom);
      socket.disconnect();
    };
  }, [room, user, setMessages]);

  const sendMessage = (content: string, imageUrl?: string, location?: { lat: number; lng: number }) => {
    if (!room || !user) return;

    // Si une image est fournie, le contenu devient l'image en Base64
    let finalContent = imageUrl || content;

    // Use the specific JSON format requested for location
    if (location && !imageUrl) {
      finalContent = JSON.stringify({
        type: "geo",
        lat: location.lat,
        lng: location.lng,
        accuracy: 0
      });
    }

    // On envoie direct au serveur sans sauvegarde locale optimiste
    socket.emit("chat-msg", {
      roomName: room.name,
      userId: user.id,
      pseudo: user.pseudo,
      content: finalContent,
      imageUrl,
      location // We still send it just in case
    });
  };

  return { isConnected, participants, sendMessage };
}
