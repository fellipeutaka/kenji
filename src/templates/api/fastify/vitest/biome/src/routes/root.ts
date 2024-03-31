import type { RootService } from "@/services/root";
import type { FastifyInstance } from "fastify";

export async function rootRouter(
  app: FastifyInstance,
  rootService: RootService,
) {
  app.get("/", async (request, reply) => {
    return rootService.getHello();
  });
}
