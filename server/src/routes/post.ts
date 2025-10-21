import { Hono } from "hono";
import { createPrismaClient } from "../db";
import { Bindings } from "../types";

const postRouter = new Hono<{ Bindings: Bindings }>();

export default postRouter;