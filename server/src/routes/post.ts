import { Hono } from "hono";
import { createPrismaClient } from "../db";
import { Bindings } from "../types";

const postRouter = new Hono<{ Bindings: Bindings }>();

postRouter.use("/*", async (c, next) => {
  next();
});

postRouter.post("/", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const { title, content, authorId } = await c.req.json();

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
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
  
  // Get query parameters for pagination
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

postRouter.get("/:id", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid post ID" }, 400);
  }

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

postRouter.get("/author/:authorId", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const authorId = parseInt(c.req.param("authorId"));

  if (isNaN(authorId)) {
    return c.json({ error: "Invalid author ID" }, 400);
  }

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
    console.error("Error fetching author posts:", error);
    return c.json({ error: "Failed to fetch author posts" }, 500);
  }
});

postRouter.put("/:id", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));
  
  if (isNaN(id)) {
    return c.json({ error: "Invalid post ID" }, 400);
  }

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
    console.error("Error updating post:", error);
    
    if (error.code === "P2025") {
      return c.json({ error: "Post not found" }, 404);
    }
    
    return c.json({ error: "Failed to update post" }, 500);
  }
});

postRouter.delete("/:id", async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid post ID" }, 400);
  }

  try {
    await prisma.post.delete({
      where: { id },
    });

    return c.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    
    if (error.code === "P2025") {
      return c.json({ error: "Post not found" }, 404);
    }
    
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

export default postRouter;