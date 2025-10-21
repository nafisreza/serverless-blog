import { Hono } from "hono";
import { createPrismaClient } from "./db";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/user/signup", async (c) => {
  try {
    const { name, username, password } = await c.req.json();
    const prisma = createPrismaClient(c.env.DATABASE_URL);
    const user = await prisma.user.create({
      data: { name, username, password },
    });
    return c.json({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "User creation failed" }, 500);
  }
});

export default app;
