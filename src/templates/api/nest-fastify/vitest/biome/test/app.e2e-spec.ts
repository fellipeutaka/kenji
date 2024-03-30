import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppModule } from "@/app.module.js";

let app: NestFastifyApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication(new FastifyAdapter());
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  await app.close();
});

describe("AppController (e2e)", () => {
  it("/ (GET)", async () => {
    const { body, statusCode } = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(statusCode).toBe(200);
    expect(body).toBe("Hello World!");
  });
});
