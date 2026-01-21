"use client";

import { useEffect, useState } from "react";

// Types for the Battery Status API
interface BatteryManager extends EventTarget {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
}

// Extend Navigator interface to include getBattery
declare global {
    interface Navigator {
        getBattery?: () => Promise<BatteryManager>;
    }
}

export default function BatteryIndicator() {
    const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (!navigator.getBattery) {
            setSupported(false);
            return;
        }

        let batteryManager: BatteryManager | null = null;

        const updateBattery = () => {
            if (batteryManager) {
                setBattery({
                    level: batteryManager.level,
                    charging: batteryManager.charging
                });
            }
        };

        navigator.getBattery().then((bm) => {
            batteryManager = bm;
            updateBattery();

            bm.addEventListener("levelchange", updateBattery);
            bm.addEventListener("chargingchange", updateBattery);
        });

        return () => {
            if (batteryManager) {
                batteryManager.removeEventListener("levelchange", updateBattery);
                batteryManager.removeEventListener("chargingchange", updateBattery);
            }
        };
    }, []);

    if (!supported || !battery) return null;

    // Determine color based on level
    const getBatteryColor = () => {
        if (battery.charging) return "#22c55e"; // Green when charging
        if (battery.level <= 0.2) return "#ef4444"; // Red for low battery
        if (battery.level <= 0.5) return "#eab308"; // Yellow for medium
        return "#22c55e"; // Green for good
    };

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "9999px",
            background: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            fontSize: "0.75rem",
            fontWeight: "600",
            color: "#374151"
        }}>
            {/* Battery Icon */}
            <div style={{
                width: "24px",
                height: "12px",
                border: `2px solid ${getBatteryColor()}`,
                borderRadius: "3px",
                position: "relative",
                padding: "1px",
                display: "flex",
                alignItems: "center"
            }}>
                <div style={{
                    height: "100%",
                    width: `${battery.level * 100}%`,
                    backgroundColor: getBatteryColor(),
                    borderRadius: "1px",
                    transition: "width 0.3s ease, background-color 0.3s ease"
                }} />
                {/* Positive terminal */}
                <div style={{
                    position: "absolute",
                    right: "-4px",
                    top: "2px",
                    bottom: "2px",
                    width: "2px",
                    backgroundColor: getBatteryColor(),
                    borderTopRightRadius: "2px",
                    borderBottomRightRadius: "2px"
                }} />

                {battery.charging && (
                    <span style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "10px",
                        lineHeight: 1,
                        color: battery.level > 0.5 ? "white" : getBatteryColor(),
                        textShadow: battery.level > 0.5 ? "0 0 2px rgba(0,0,0,0.5)" : "none"
                    }}>⚡</span>
                )}
            </div>

            <span>{Math.round(battery.level * 100)}%</span>
        </div>
    );
}
