import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface MinitiaConfig {
  system_keys: Record<string, any>;
  genesis_accounts: Array<{ address: string }>;
}

/**
 * Resolve a user-supplied path (file or directory) into the absolute path of
 * `minitia.config.json`.
 *
 *  • If the path is a directory, we look for `<dir>/.weave/data/minitia.config.json`.
 *  • If the path is a file, we assume it's already the config.
 *  • If omitted, we default to `$HOME/.weave/data/minitia.config.json`.
 */
export function resolveMinitiaConfigPath(input?: string): string {
  const defaultPath = path.join(os.homedir(), ".weave/data/minitia.config.json");
  const candidate = input ?? defaultPath;

  try {
    const stats = fs.statSync(candidate);
    if (stats.isDirectory()) {
      return path.join(candidate, ".weave/data/minitia.config.json");
    }
    return candidate; // file path
  } catch {
    // Path does not exist – just return what we were given and let caller handle error
    return candidate;
  }
}

/** Read and parse the JSON config. */
export function readMinitiaConfig(configPath: string): MinitiaConfig {
  const content = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(content) as MinitiaConfig;
}
