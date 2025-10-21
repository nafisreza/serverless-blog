import { Hono } from "hono";
import { createPrismaClient } from "./db";
import { decode, sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/user/register", async (c) => {
  try {
    const { name, username, password } = await c.req.json();

    const hashedPass = await bcrypt.hash(password, 10);

    const prisma = createPrismaClient(c.env.DATABASE_URL);
    const user = await prisma.user.create({
      data: { name, username, password: hashedPass },
    });

    const jwt = await sign({ userId: user.id }, c.env.JWT_SECRET);

    return c.json({ user, jwt });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "User creation failed" }, 500);
  }
});

app.post("/api/v1/user/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const prisma = createPrismaClient(c.env.DATABASE_URL);
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return c.json({ error: "User does not exist" }, 404);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ error: "Invalid username or password" }, 403);
    }

    const jwt = await sign({ userId: user.id }, c.env.JWT_SECRET);
    return c.json({ user, jwt });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

export default app;
