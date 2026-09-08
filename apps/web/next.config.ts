import type { NextConfig } from "next";

// R2 images are served either as signed URLs on the S3 endpoint
// (<account>.r2.cloudflarestorage.com — what r2.getUrl() returns), a public
// bucket domain (pub-*.r2.dev), or a custom domain via R2_PUBLIC_HOST.
// next/image rejects hosts not listed here.
const r2PublicHost = process.env.R2_PUBLIC_HOST;

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source; let Next transpile them.
  transpilePackages: ["@repo/shared", "@repo/backend"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      ...(r2PublicHost
        ? [{ protocol: "https" as const, hostname: r2PublicHost }]
        : []),
    ],
  },
};

export default nextConfig;
