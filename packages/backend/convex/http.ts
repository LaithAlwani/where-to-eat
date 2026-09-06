import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Registers Better Auth's HTTP routes on the Convex deployment.
authComponent.registerRoutes(http, createAuth);

export default http;
