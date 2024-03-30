import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";

interface CopyOption {
  cwd?: string;
  rename?: (basename: string) => string;
  parents?: boolean;
}

const identity = (x: string) => x;

export async function copy(
  src: string | string[],
  dest: string,
  { cwd, rename = identity, parents = true }: CopyOption = {},
) {
  const source = typeof src === "string" ? [src] : src;

  if (source.length === 0 || !dest) {
    throw new TypeError("`src` and `dest` are required");
  }

  const sourceFiles = await fg.async(source, {
    cwd,
    dot: true,
    absolute: false,
    stats: false,
  });

  const destRelativeToCwd = cwd ? path.resolve(cwd, dest) : dest;

  await Promise.all(
    sourceFiles.map(async (p) => {
      const dirname = path.dirname(p);
      const basename = rename(path.basename(p));

      const from = cwd ? path.resolve(cwd, p) : p;
      const to = parents
        ? path.join(destRelativeToCwd, dirname, basename)
        : path.join(destRelativeToCwd, basename);

      // Ensure the destination directory exists
      await mkdir(path.dirname(to), { recursive: true });

      return copyFile(from, to);
    }),
  );

  return { sourceFiles };
}
