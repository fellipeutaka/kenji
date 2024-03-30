import { type UserConfig, mergeConfig } from "vitest/config";
import defaultConfig from "./vitest.config.js";

export default mergeConfig<UserConfig, UserConfig>(defaultConfig, {
  test: {
    root: "test",
    include: ["**/*.e2e-spec.ts"],
  },
});
