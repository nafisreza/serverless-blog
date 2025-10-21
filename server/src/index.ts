import { Hono } from "hono";
import { createPrismaClient } from "./db";
import { decode, sign, verify } from 'hono/jwt';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
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

    const jwt = await sign({ userId: user.id }, c.env.JWT_SECRET);

    return c.json({ user, jwt });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "User creation failed" }, 500);
  }
});

export default app;
