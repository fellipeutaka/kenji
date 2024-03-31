import { app } from "@/index";

afterAll(async () => {
  await app.close();
});

describe("AppRouter (e2e)", () => {
  it("/ (GET)", async () => {
    const { body, statusCode } = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(statusCode).toBe(200);
    expect(body).toBe("Hello World!");
  });
});
