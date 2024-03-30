import { exec as nodeExec } from "node:child_process";
import { promisify } from "node:util";
export const exec = promisify(nodeExec);
