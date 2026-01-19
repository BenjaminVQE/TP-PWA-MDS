import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/socket.io",
        destination: "https://api.tools.gavago.fr/socket.io/",
      },
      {
        source: "/socket.io/:path*",
        destination: "https://api.tools.gavago.fr/socket.io/:path*",
      },
      {
        source: "/socketio/api/:path*",
        destination: "https://api.tools.gavago.fr/socketio/api/:path*",
      },
    ];
  },
};

export default withPWA(nextConfig);
