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
  const [participants, setParticipants] = useState(0);

  // On stocke les messages envoyés localement pour les filtrer ensuite
  const sentLocal = useRef<Set<string>>(new Set());

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


      // Si on a déjà envoyé ce message localement, on ignore
      if (data.localId && sentLocal.current.has(data.localId)) return;

      // Si le message vient de nous (basé sur le pseudo), on ignore aussi
      if (user && data.pseudo === user.pseudo) return;

      const msg: Message = {
        id: crypto.randomUUID(),
        roomId: room.id,
        senderId: data.userId,
        senderName: data.pseudo,
        content: data.content || "",
        imageUrl: data.imageUrl || data.image_data || null,
        timestamp: Date.now()
      };

      saveMessage(msg);
      setMessages(prev => [...prev, msg]);
    };

    const onJoinedRoom = (d: any) =>
      setParticipants(d.participants || Object.keys(d.clients || {}).length);

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

  const sendMessage = (content: string, imageUrl?: string) => {
    if (!room || !user) return;

    // localId unique
    const localId = crypto.randomUUID();

    // On stocke l'id local
    sentLocal.current.add(localId);

    const msg: Message = {
      id: crypto.randomUUID(),
      roomId: room.id,
      senderId: user.id,
      senderName: user.pseudo,
      content,
      imageUrl,
      timestamp: Date.now()
    };

    saveMessage(msg);
    setMessages(prev => [...prev, msg]);

    socket.emit("chat-msg", {
      roomName: room.name,
      userId: user.id,
      pseudo: user.pseudo,
      content,
      imageUrl,
      localId // 🔥 on l'envoie au serveur
    });
  };

  return { isConnected, participants, sendMessage };
}
