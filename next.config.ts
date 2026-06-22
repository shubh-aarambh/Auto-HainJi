import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['winston', 'playwright', '@prisma/client', 'ws'],
};

export default nextConfig;
