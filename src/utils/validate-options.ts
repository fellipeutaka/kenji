import colors from "picocolors";
import { PATH_ALIAS_REGEX } from "../constants";

type Options = {
  importAlias?: string;
};

export function validateOptions({ importAlias }: Options) {
  if (importAlias) {
    if (!PATH_ALIAS_REGEX.test(importAlias)) {
      console.error(
        `    ${colors.red(
          colors.bold("*"),
        )} 'Import alias must follow the pattern <prefix>/*'`,
      );
      process.exit(1);
    }
  }

  return {
    importAlias,
  };
}
