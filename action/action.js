var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __reExport = (target, module, copyDefault, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
};

// node_modules/.pnpm/tsup@5.11.13_typescript@4.5.2/node_modules/tsup/assets/esm_shims.js
import { fileURLToPath } from "url";
import path from "path";
var getFilename = () => fileURLToPath(import.meta.url);
var getDirname = () => path.dirname(getFilename());
var __dirname = /* @__PURE__ */ getDirname();

// src/action/action.ts
import { execSync } from "child_process";
import fs from "fs";
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
  const core = (await Promise.resolve().then(() => __toESM(__require("@actions/core"), 1))).default;
  try {
    const { BahamutAutomation } = await Promise.resolve().then(() => __toESM(__require("./lib/core"), 1));
    const config_path = core.getInput("config");
    const secrets = __spreadValues({}, JSON.parse(core.getInput("secrets") || "{}"));
    let raw = fs.readFileSync(config_path, "utf8");
    for (const key in secrets) {
      raw = raw.replace(new RegExp(`$${key}`, "g"), secrets[key]);
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
