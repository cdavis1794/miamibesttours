import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");
const ignored = new Set([
  ".git",
  ".github",
  ".netlify",
  "dist",
  "docs",
  "netlify",
  "node_modules",
  "scripts",
  "test",
  ".env",
  ".node-version",
  ".gitignore",
  "netlify.toml",
  "package.json",
  "pnpm-lock.yaml"
]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (ignored.has(entry.name) || entry.name.startsWith(".env.")) continue;
  await cp(join(root, entry.name), join(output, entry.name), {
    force: true,
    recursive: entry.isDirectory()
  });
}
