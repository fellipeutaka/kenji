import fs from "node:fs";
import path from "node:path";
import colors from "picocolors";

const validFiles = [
  ".DS_Store",
  ".git",
  ".gitattributes",
  ".gitignore",
  ".gitlab-ci.yml",
  ".hg",
  ".hgcheck",
  ".hgignore",
  ".idea",
  ".npmignore",
  ".travis.yml",
  "LICENSE",
  "Thumbs.db",
  "docs",
  "mkdocs.yml",
  "npm-debug.log",
  "yarn-debug.log",
  "yarn-error.log",
  "yarnrc.yml",
  ".yarn",
];

export function isFolderEmpty(
  root: string,
  name: string,
  suppressLogs = false,
): boolean {
  const log = suppressLogs ? () => {} : console.log;
  const conflicts = fs.readdirSync(root).filter(
    (file) =>
      !validFiles.includes(file) &&
      // Support IntelliJ IDEA-based editors
      !/\.iml$/.test(file),
  );

  if (conflicts.length > 0) {
    log(
      `The directory ${colors.green(name)} contains files that could conflict:`,
    );
    log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          log(`  ${colors.blue(file)}/`);
        } else {
          log(`  ${file}`);
        }
      } catch {
        log(`  ${file}`);
      }
    }
    log();
    log(
      "Either try using a new directory name, or remove the files listed above.",
    );
    log();
    return false;
  }

  return true;
}
