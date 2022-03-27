// src/core/logger.ts
var Logger = class {
  constructor(name = "", verbose = 3) {
    this.name = name;
    this.verbose = verbose;
  }
  debug = this.log;
  log(...msg) {
    this.verbose >= 3 && console.log("\x1B[94m[LOG]\x1B[m", `\x1B[95m[${this.name}]\x1B[m`, ...msg);
  }
  error(...msg) {
    this.verbose >= 1 && console.log("\x1B[91m[ERROR]\x1B[m", `\x1B[95m[${this.name}]\x1B[m`, ...msg);
  }
  warn(...msg) {
    this.verbose >= 2 && console.log("\x1B[93m[WARN]\x1B[m", `\x1B[95m[${this.name}]\x1B[m`, ...msg);
  }
  info(...msg) {
    this.verbose >= 3 && console.log("\x1B[96m[INFO]\x1B[m", `\x1B[95m[${this.name}]\x1B[m`, ...msg);
  }
  success(...msg) {
    this.verbose >= 2 && console.log("\x1B[92m[SUCCESS]\x1B[m", `\x1B[95m[${this.name}]\x1B[m`, ...msg);
  }
};
var logger_default = Logger;
export {
  Logger,
  logger_default as default
};
