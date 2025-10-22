import { Hono } from "hono";
import { createPrismaClient } from "../db";
import { Bindings, Variables } from "../types";
import { requireAuth } from "../middlewares/auth";
import { verifyPostOwnership } from "../middlewares/post";

const postRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create a new post
postRouter.post("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const { title, content } = await c.req.json();

  if (!title || !content) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
    return c.json(post, 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json({ error: "Failed to create post" }, 400);
  }
});

postRouter.get("/", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);

  // Query params for pagination
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const skip = (page - 1) * limit;

  // Filter for published posts only
  const publishedOnly = c.req.query("published") === "true";

  try {
    const where = publishedOnly ? { published: true } : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
      prisma.post.count({ where }),
    ]);

    return c.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// Get a single post by ID
postRouter.get("/:id", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// Get posts by author ID
postRouter.get("/author/:authorId", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const authorId = parseInt(c.req.param("authorId"));

  try {
    const posts = await prisma.post.findMany({
      where: { authorId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    
    return c.json({ posts });
  } catch (error) {
    return c.json({ error: "Failed to fetch author posts" }, 500);
  }
});

// Update a post
postRouter.put("/:id", requireAuth, verifyPostOwnership, async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));
  const { title, content, published } = await c.req.json();

  try {
    // update data object with only provided fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return c.json(post);
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json({ error: "Post not found" }, 404);
    }
    
    return c.json({ error: "Failed to update post" }, 500);
  }
});

// Delete a post
postRouter.delete("/:id", requireAuth, verifyPostOwnership, async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));

  try {
    await prisma.post.delete({
      where: { id },
    });

    return c.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json({ error: "Failed to delete post" }, 500);
  }
});

export default postRouter;