// src/core/utils.ts
import fs from "node:fs";
import path from "node:path";
async function sleep(ms) {
  new Promise((resolve) => setTimeout(resolve, ms));
}
function get_version(dirname) {
  try {
    let depth = 5;
    let package_path = path.resolve(dirname, "package.json");
    while (!fs.existsSync(package_path) && depth-- > 0) {
      package_path = path.resolve(path.dirname(package_path), "..", "package.json");
    }
    const file = fs.readFileSync(package_path, "utf8");
    const json = JSON.parse(file);
    return json.version;
  } catch (err) {
    return "";
  }
}
function second_to_time(second) {
  const hour = Math.floor(second / 3600);
  const minute = Math.floor((second - hour * 3600) / 60);
  const second_left = second - hour * 3600 - minute * 60;
  return `${hour} \u5C0F\u6642 ${minute} \u5206 ${second_left} \u79D2`;
}
export {
  get_version,
  second_to_time,
  sleep
};
