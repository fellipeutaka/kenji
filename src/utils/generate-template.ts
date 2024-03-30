import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "cross-spawn";
import colors from "picocolors";
import { spinner } from "~/lib/clack";
import type {
  Framework,
  Linter,
  ProjectType,
  TestingFrameworks,
} from "../constants";
import { copy } from "./copy";
import type { PackageManager } from "./get-pkg-manager";
import { tryGitInit } from "./git";
import { getOnline } from "./is-online";
import { isWriteable } from "./is-writeable";

type GenerateTemplateProps = {
  root: string;
  appName: string;
  packageManager: PackageManager;
  projectType: ProjectType;
  framework: {
    label: string;
    value: Framework;
  };
  importPath: string;
  testingFramework: TestingFrameworks | "none";
  linter: Linter;
  installDeps: boolean;
  initializeGit: boolean;
};

export async function generateTemplate({
  root,
  appName,
  packageManager,
  projectType,
  framework,
  importPath,
  testingFramework,
  linter,
  installDeps,
  initializeGit,
}: GenerateTemplateProps) {
  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again.",
    );
    console.error(
      "It is likely you do not have write permissions for this folder.",
    );
    process.exit(1);
  }

  const templatePath = new URL(
    `./${projectType}/${framework.value}/${testingFramework}/${linter}`,
    import.meta.url,
  ).pathname.slice(1);

  const s = spinner();
  s.start(
    `Creating a new ${colors.cyan(framework.label)} app in ${colors.green(
      root,
    )}`,
  );

  const { sourceFiles } = await copy("**/*", root, {
    parents: true,
    cwd: templatePath,
  });

  for (const file of sourceFiles) {
    const isTsconfig = file === "tsconfig.json";
    const isPackageJson = file === "package.json";

    if (importPath !== "@/*") {
      if (isTsconfig || file.endsWith(".ts") || file.endsWith(".tsx")) {
        const filePath = path.join(root, file);
        const content = await fs.readFile(filePath, "utf-8");
        const searchRegex = isTsconfig ? /@\/\*/g : /@\//g;
        const updatedContent = content.replace(searchRegex, importPath);
        await fs.writeFile(filePath, updatedContent);
      }
    }
    if (isPackageJson) {
      const filePath = path.join(root, file);
      const content = await fs.readFile(filePath, "utf-8");
      const updatedContent = content.replace(
        '"name": ""',
        `"name": "${appName}"`,
      );
      await fs.writeFile(filePath, updatedContent);
    }
  }

  s.stop(
    `Created ${colors.cyan(framework.label)} app in ${colors.green(root)}`,
  );

  if (initializeGit) {
    s.start("Initializing a git repository");
    if (await tryGitInit(root)) {
      s.stop("Initialized git repository.");
    }
  }

  if (installDeps) {
    s.start(`Installing dependencies with ${packageManager}`);
    await install(packageManager, root);
    s.stop(`Installed dependencies with ${packageManager}`);
  }
}

async function install(packageManager: PackageManager, cwd: string) {
  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const args = ["install"];
  if (!isOnline) {
    console.log(
      colors.yellow(
        "You appear to be offline.\nFalling back to the local cache.",
      ),
    );
    args.push("--offline");
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(packageManager, args, {
      stdio: "ignore",
      cwd,
      env: {
        ...process.env,
        ADBLOCK: "1",
        // we set NODE_ENV to development as pnpm skips dev
        // dependencies when production
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `${packageManager} ${args.join(" ")}` });
        return;
      }
      resolve();
    });
  });
}
