// src/core/config.ts
import fs from "node:fs";
import path from "node:path";
function search_config(dir) {
  const exts = [".yaml", ".yml", ".json"];
  const files = fs.readdirSync(dir).filter((file) => file.toLowerCase().startsWith("config") && exts.some((ext) => file.toLowerCase().endsWith(ext)));
  return files.length ? path.resolve(dir, files[0]) : null;
}
export {
  search_config
};
