import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination:
          "/api/backend/:path*",
      },
    ];
  },
};

export default nextConfig;