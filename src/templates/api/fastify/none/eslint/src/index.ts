import Fastify from "fastify";

const server = Fastify();

server.get("/", async () => {
  return "Hello World!";
});

const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

const url = await server.listen({
  port: 3000,
  host,
});

console.log(`Server listening on ${url} 🚀`);
