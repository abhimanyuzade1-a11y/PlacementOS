import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://placementos-api-mgb.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;   