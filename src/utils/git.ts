import fs from "node:fs";
import path from "node:path";
import { exec } from "./child-process";

async function isInGitRepository() {
  try {
    await exec("git rev-parse --is-inside-work-tree");
    return true;
  } catch {
    return false;
  }
}

async function isInMercurialRepository() {
  try {
    await exec("hg --cwd . root");
    return true;
  } catch {
    return false;
  }
}

async function isDefaultBranchSet() {
  try {
    await exec("git config init.defaultBranch");
    return true;
  } catch {
    return false;
  }
}

export async function tryGitInit(root: string) {
  let didInit = false;
  try {
    await exec("git --version");
    if ((await isInGitRepository()) || (await isInMercurialRepository())) {
      return false;
    }

    await exec("git init", { cwd: root });
    didInit = true;

    if (!isDefaultBranchSet()) {
      await exec("git checkout -b main");
    }

    return true;
  } catch {
    if (didInit) {
      try {
        fs.rmSync(path.join(root, ".git"), { recursive: true, force: true });
      } catch {}
    }
    return false;
  }
}
