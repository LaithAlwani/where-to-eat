import type { NextConfig } from "next";

// R2 is served from a public bucket domain (pub-*.r2.dev) or a custom domain
// set via R2_PUBLIC_HOST. next/image rejects hosts not listed here.
const r2PublicHost = process.env.R2_PUBLIC_HOST;

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source; let Next transpile them.
  transpilePackages: ["@repo/shared", "@repo/backend"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      ...(r2PublicHost
        ? [{ protocol: "https" as const, hostname: r2PublicHost }]
        : []),
    ],
  },
};

export default nextConfig;
