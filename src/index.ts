#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { Command } from "@commander-js/extra-typings";
import colors from "picocolors";
import packageJson from "../package.json";
import {
  DEFAULT_LINTER,
  LINTERS,
  PATH_ALIAS_REGEX,
  type TestingFrameworks,
  templates,
} from "./constants";
import { confirm, select, text } from "./lib/clack";
import { capitalize } from "./utils/capitalize";
import { generateTemplate } from "./utils/generate-template";
import { getPkgManager } from "./utils/get-pkg-manager";
import { isFolderEmpty } from "./utils/is-folder-empty";
import { validateOptions } from "./utils/validate-options";
import { validateNpmName } from "./utils/validate-pkg-name";

const handleSigTerm = () => process.exit(0);
process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

function getProjectRoot(projectPath: string) {
  return path.resolve(projectPath);
}

function getProjectDetails(projectPath: string) {
  const root = getProjectRoot(projectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);

  return { root, appName, folderExists };
}

const program = new Command()
  .name(packageJson.name)
  .version(packageJson.version, "-v, --version", "display the version number")
  .usage(`${colors.green("<project-directory>")} [options]`)
  .arguments("[project-directory]")
  .option(
    "--import-alias <alias-to-configure>",
    'Specify import alias to use (default "@/*").',
  )
  .action(async (directory, options) => {
    const { importAlias } = validateOptions(options);

    const appName =
      directory?.trim() ??
      (await text({
        message: "What is your project named?",
        validate: (name) => {
          const validation = validateNpmName(name);
          if (!validation.valid) {
            return `Invalid project name: ${validation.problems[0]}`;
          }

          const { appName, folderExists, root } = getProjectDetails(name);
          if (folderExists && !isFolderEmpty(root, appName, true)) {
            return `The directory ${colors.red(
              `"${appName}"`,
            )} is not empty. Please choose a different project name or location.`;
          }
        },
      }));

    const resolvedProjectPath = path.resolve(appName);
    const projectName = path.basename(resolvedProjectPath);
    const validation = validateNpmName(projectName);
    if (!validation.valid) {
      console.error(
        `Could not create a project called ${colors.red(
          `"${projectName}"`,
        )} because of npm naming restrictions:`,
      );

      for (const problem of validation.problems) {
        console.error(`    ${colors.red(colors.bold("*"))} ${problem}`);
      }
      process.exit(1);
    }

    const root = getProjectRoot(appName);

    const projectType = await select({
      message: "What type of project would you like to create?",
      options: Object.entries(templates).map(([key, value]) => ({
        label: value.label,
        value: key as keyof typeof templates,
      })),
    });

    const framework = await select({
      message: "Which framework would you like to use?",
      options: templates[projectType].items.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    });

    const linter = await select({
      message: "Which linter would you like to use?",
      options: LINTERS.map((item) => ({
        label: item.label,
        value: item.value,
      })),
      initialValue: DEFAULT_LINTER,
    });

    const testingFramework = await select({
      message: "Which testing framework would you like to use?",
      options:
        ["none"]
          .concat(
            templates[projectType].items.find(
              (item) => item.value === framework,
            )?.testing ?? [],
          )
          .map((item) => ({
            label: capitalize(item),
            value: item as TestingFrameworks | "none",
          })) ?? [],
    });

    const hasCustomImportAlias = importAlias
      ? true
      : await confirm({
          message:
            "Would you like to customize the default import alias (@/*)?",
          initialValue: false,
        });

    const importPath = hasCustomImportAlias
      ? await text({
          message: "What import alias would you like configured?",
          placeholder: "~/*",
          validate(value) {
            if (!PATH_ALIAS_REGEX.test(value)) {
              return "Import alias must follow the pattern <prefix>/*";
            }
          },
        })
      : "@/*";

    const initializeGit = await confirm({
      message: "Would you like to initialize a git repository?",
      initialValue: true,
    });

    if (!initializeGit) {
      console.log(
        colors.gray(
          `You can initialize a git repository in the project directory later by running ${colors.cyan(
            "git init",
          )}.`,
        ),
      );
    }

    const installDeps = await confirm({
      message: "Would you like to install dependencies now?",
      initialValue: true,
    });

    if (!installDeps) {
      console.log(colors.gray("Remember to install dependencies after setup."));
    }

    await generateTemplate({
      root,
      appName,
      packageManager: getPkgManager(),
      projectType,
      framework: {
        label:
          templates[projectType].items.find((item) => item.value === framework)
            ?.label ?? "",
        value: framework,
      },
      importPath,
      testingFramework,
      linter,
      installDeps,
      initializeGit,
    });
  });

program.parse();
