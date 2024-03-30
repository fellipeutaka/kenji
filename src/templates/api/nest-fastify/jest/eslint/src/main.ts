import { AppModule } from "@/app.module";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const port = 3000;
  const host = "0.0.0.0";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const url = `${protocol}://${host}:${port}`;
  await app.listen(port, host);
  console.log(`Server listening on ${url} 🚀`);
}

bootstrap();
