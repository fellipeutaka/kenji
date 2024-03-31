import Fastify from "fastify";
import { rootRouter } from "./routes/root";
import { RootService } from "./services/root";

export const app = Fastify();

app.register((app) => rootRouter(app, new RootService()));

const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

const url = await app.listen({
  port: 3000,
  host,
});

console.log(`Server listening on ${url} 🚀`);
