import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/** Browser-side Better Auth client used for sign-in/up/out flows. */
export const authClient = createAuthClient({
  plugins: [convexClient()],
});
