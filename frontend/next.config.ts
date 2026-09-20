import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://placementos-api-mgbi.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;