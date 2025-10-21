import { Hono } from "hono";
import { Bindings } from "./types";
import userRouter from "./routes/user";
import postRouter from "./routes/post";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/post", postRouter);



export default app;
