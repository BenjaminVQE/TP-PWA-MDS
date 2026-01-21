"use client";

import { useRef, useState, useEffect } from "react";
import { savePhoto } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid"; // We might need a UUID generator or random ID

interface CameraCaptureProps {
    onCapture: (imageDataUrl: string) => void;
    onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const takePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg");

                // Save to App Gallery (LocalStorage)
                savePhoto({
                    id: crypto.randomUUID(),
                    url: dataUrl,
                    timestamp: Date.now()
                });

                onCapture(dataUrl);
                stopCamera();
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "black",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
            />
            <div style={{
                position: "absolute",
                bottom: "2rem",
                display: "flex",
                gap: "2rem"
            }}>
                <button
                    onClick={() => { stopCamera(); onClose(); }}
                    style={{
                        background: "white",
                        color: "black",
                        padding: "1rem",
                        borderRadius: "50%",
                        border: "none",
                        fontWeight: "bold"
                    }}
                >
                    Close
                </button>
                <button
                    onClick={takePhoto}
                    style={{
                        width: "4rem",
                        height: "4rem",
                        borderRadius: "50%",
                        border: "4px solid white",
                        background: "transparent",
                        cursor: "pointer"
                    }}
                />
            </div>
        </div>
    );
}
