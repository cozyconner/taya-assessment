import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Allow larger audio files (2+ minutes)
    },
  },
};

export default nextConfig;
