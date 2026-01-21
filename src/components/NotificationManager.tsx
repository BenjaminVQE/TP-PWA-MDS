"use client";

import { useEffect } from "react";
import socket from "@/lib/socket";
import { getUser } from "@/lib/storage";

export default function NotificationManager() {
    useEffect(() => {
        // Demander la permission
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        const onChatMsg = (data: any) => {
            const currentUser = getUser();
            // Ne pas notifier si c'est moi qui ai envoyé le message
            if (currentUser && data.userId === currentUser.id) return;

            // Vérifier si l'app est en background OU si on est pas sur la page de la room concernée
            // (Simplification logic: on notifie tout le temps sauf si focus sur la room ?)
            // Pour l'instant on notifie si document.hidden ou si le message vient d'ailleurs
            if (document.hidden || !window.location.pathname.includes(data.roomName)) {
                if (Notification.permission === "granted") {
                    new Notification(`Message de ${data.pseudo}`, {
                        body: data.content || "Nouveau message",
                        icon: "/icons/icon-192x192.png",
                        tag: data.roomName
                    });

                    // Vibrate device
                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                }
            }
        };

        socket.on("chat-msg", onChatMsg);

        return () => {
            socket.off("chat-msg", onChatMsg);
        };
    }, []);

    return null; // Composant logique sans UI
}
