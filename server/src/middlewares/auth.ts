import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { Bindings, Variables } from "../types";

type HonoContext = Context<{ Bindings: Bindings; Variables: Variables }>;

export const requireAuth = async (c: HonoContext, next: Next) => {
  const token = c.req.header("Authorization");

  if (!token) {
    return c.json({ error: "Unauthorized - Please login" }, 401);
  }

  try {
    const user = await verify(token, c.env.JWT_SECRET);
    const userId = user.id as number;

    if (!userId) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    c.set("userId", userId);
    await next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return c.json({ error: "Unauthorized - Invalid token" }, 401);
  }
};