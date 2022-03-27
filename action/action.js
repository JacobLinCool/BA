// node_modules/.pnpm/tsup@5.11.13_typescript@4.5.2/node_modules/tsup/assets/esm_shims.js
import { fileURLToPath } from "url";
import path from "path";
var getFilename = () => fileURLToPath(import.meta.url);
var getDirname = () => path.dirname(getFilename());
var __dirname = /* @__PURE__ */ getDirname();

// src/action/action.ts
import { execSync } from "node:child_process";
import fs from "node:fs";
prepare();
main();
function prepare() {
  try {
    process.stdout.write("Installing PNPM... ");
    execSync("npm i -g pnpm", { cwd: __dirname });
    console.log("Done");
  } catch (err) {
  }
  try {
    process.stdout.write("Installing Packages... ");
    execSync("pnpm i", { cwd: __dirname });
    console.log("Done");
  } catch (err) {
  }
  try {
    process.stdout.write("Installing Playwright Dependencies... ");
    execSync("pnpx -y playwright install", { cwd: __dirname });
    console.log("Done");
  } catch (err) {
  }
  try {
    process.stdout.write("Installing Browser Dependencies... ");
    execSync("pnpx -y playwright install-deps", { cwd: __dirname });
    console.log("Done");
  } catch (err) {
  }
  console.log("\n");
}
async function main() {
  const core = (await import("@actions/core")).default;
  try {
    const { BahamutAutomation } = await import("./lib/core");
    const config_path = core.getInput("config");
    const secrets = { ...JSON.parse(core.getInput("secrets") || "{}") };
    let raw = fs.readFileSync(config_path, "utf8");
    for (const key in secrets) {
      raw = raw.replace(new RegExp(`$${key}`, "ig"), secrets[key]);
    }
    fs.writeFileSync(config_path, raw);
    const automation = BahamutAutomation.from(config_path);
    automation.setup_listeners();
    const result = await automation.run();
    if (result) {
      console.log(result);
      process.exit(0);
    }
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
}
