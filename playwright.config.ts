import { defineConfig } from "@playwright/test";

/** Software WebGL on purpose: the gates must not need a GPU. One worker, because it is slow. */
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 240_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["json", { outputFile: "test-results/gates.json" }]],
  use: {
    baseURL: "http://localhost:4180",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "npm run build && npx next start -p 4180",
    url: "http://localhost:4180",
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
