// npm on Windows can start in "c:\..." while modules resolve to "C:\...": Vitest then loads itself twice and
// finds no suite. Start it from the canonical folder instead.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const cwd = fs.realpathSync.native(process.cwd());
const run = spawnSync(process.execPath, [path.join(cwd, "node_modules", "vitest", "vitest.mjs"), "run", ...process.argv.slice(2)], { cwd, stdio: "inherit" });
process.exit(run.status ?? 1);
