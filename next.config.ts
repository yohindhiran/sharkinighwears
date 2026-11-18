import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
    ],
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/uploads/:filename",
          destination: "/api/uploads/:filename",
        },
      ],
    };
  },
};

export default nextConfig;
