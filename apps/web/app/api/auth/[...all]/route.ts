import { handler } from "@/lib/auth-server";

// Better Auth mounts sign-in/up/out/session endpoints under /api/auth/*.
export const { GET, POST } = handler;
