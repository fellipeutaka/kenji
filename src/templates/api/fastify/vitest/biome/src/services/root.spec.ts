import { RootService } from "./root";

describe("root", () => {
  it('should return "Hello World!"', async () => {
    const service = new RootService();
    expect(await service.getHello()).toBe("Hello World!");
  });
});
