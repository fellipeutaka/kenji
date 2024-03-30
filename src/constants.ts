export const LINTERS = [
  {
    label: "ESLint",
    value: "eslint",
  },
  {
    label: "Biome.js",
    value: "biome",
  },
] as const;

export type Linter = (typeof LINTERS)[number]["value"];

export const DEFAULT_LINTER = "biome" satisfies Linter;

export type TestingFrameworks = "jest" | "vitest";

export const templates = {
  api: {
    label: "API (Backend)",
    items: [
      // {
      //   value: "nest-express",
      //   label: "Nest.js (Express)",
      //   testing: ["jest", "vitest"],
      // },
      {
        value: "nest-fastify",
        label: "Nest.js (Fastify)",
        // testing: ["jest", "vitest"],
        testing: ["vitest"],
      },
      // {
      //   value: "fastify",
      //   label: "Fastify",
      //   testing: ["jest", "vitest"],
      // },
      // {
      //   value: "express",
      //   label: "Express",
      //   testing: ["jest", "vitest"],
      // },
    ],
  },
  // web: {
  //   label: "Web (Frontend)",
  //   items: [
  //     {
  //       value: "next-shadcn",
  //       label: "Next.js with shadcn/ui",
  //       testing: ["jest", "vitest"],
  //     },
  //   ],
  // },
  // mobile: {
  //   label: "Mobile",
  //   items: [
  //     {
  //       value: "expo",
  //       label: "Expo",
  //       testing: ["jest"],
  //     },
  //   ],
  // },
} as const satisfies Record<
  string,
  {
    label: string;
    items: {
      value: string;
      label: string;
      testing: TestingFrameworks[];
    }[];
  }
>;

export type ProjectType = keyof typeof templates;

export type Framework =
  (typeof templates)[ProjectType]["items"][number]["value"];

export const PATH_ALIAS_REGEX = /^[^\s].*\/\*$/;
