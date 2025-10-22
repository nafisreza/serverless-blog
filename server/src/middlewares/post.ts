import { Context, Next } from "hono";
import { createPrismaClient } from "../db";
import { Bindings, Variables } from "../types";

type HonoContext = Context<{ Bindings: Bindings; Variables: Variables }>;

export const verifyPostOwnership = async (c: HonoContext, next: Next) => {
  const userId = c.get("userId");
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid post ID" }, 400);
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    if (post.authorId !== userId) {
      return c.json(
        { error: "Forbidden - You can only modify your own posts" },
        403
      );
    }

    await next();
  } catch (error) {
    console.error("Error verifying post ownership:", error);
    return c.json({ error: "Failed to verify post ownership" }, 500);
  }
};