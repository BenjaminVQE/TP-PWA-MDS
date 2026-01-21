"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js/React
import React from "react";

// Fix Leaflet's default icon path issues in Next.js/React
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function LocationMap({ lat, lng }: { lat: number; lng: number }) {
    // Unique key to force re-mounting if coordinates change definitively,
    // impeding React form trying to diff the internal Leaflet DOM which causes the crash.
    const mapKey = `${lat}-${lng}`;

    return (
        <div style={{ height: "200px", width: "100%", minWidth: "250px", borderRadius: "0.5rem", overflow: "hidden", zIndex: 0 }}>
            <MapContainer
                key={mapKey}
                center={[lat, lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={icon}>
                    <Popup>
                        Location: {lat.toFixed(5)}, {lng.toFixed(5)}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default React.memo(LocationMap);
