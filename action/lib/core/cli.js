var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/core/cli.ts
import fs3 from "node:fs";
import path3 from "node:path";
import { createInterface } from "node:readline";
import { program } from "commander";

// src/core/automation.ts
import EventEmitter2 from "node:events";
import fs2 from "node:fs";
import path2 from "node:path";
import url from "node:url";
import { pathToFileURL } from "node:url";
import countapi from "countapi-js";
import yaml from "js-yaml";

// src/core/browser.ts
import EventEmitter from "node:events";
import playwright from "playwright";
var BRWOSER_TYPES = ["chromium", "firefox", "webkit"];
var Browser = class extends EventEmitter {
  constructor(browser_type = "firefox", browser_config) {
    super();
    this.browser_type = browser_type;
    this.browser_config = browser_config;
    if (!BRWOSER_TYPES.includes(browser_type)) {
      browser_type = "firefox";
    }
  }
  browser = null;
  context = null;
  user_agent = "";
  log(...arg) {
    this.emit("log", ...arg);
  }
  async launch() {
    if (!this.browser) {
      this.log(`\u4F7F\u7528 ${this.browser_type} \u700F\u89BD\u5668`);
      const target = playwright[this.browser_type];
      this.browser = await target.launch(this.browser_config);
      this.emit("launched", this.browser);
    }
    if (!this.context) {
      const temp_page = await this.browser.newPage();
      this.user_agent = (await temp_page.evaluate(() => navigator.userAgent)).replace("Headless", "") + " BA/1";
      await temp_page.close();
      this.log("User-Agent:", this.user_agent);
      this.context = await this.browser.newContext({ userAgent: this.user_agent });
      this.emit("context_created", this.context);
    }
    return this;
  }
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.user_agent = "";
      this.emit("closed");
    }
    return this;
  }
  async new_page() {
    if (!this.context) {
      throw new Error("No Context.");
    }
    const page = await this.context.newPage();
    this.emit("new_page", page);
    return page;
  }
};

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

// src/core/utils.ts
import fs from "node:fs";
import path from "node:path";
function get_version(dirname2) {
  try {
    let depth = 5;
    let package_path = path.resolve(dirname2, "package.json");
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

// src/core/automation.ts
process.env.TZ = "Asia/Taipei";
var dirname = url.fileURLToPath(import.meta.url);
var VERSION = get_version(dirname);
function resolve_module(id) {
  const module_path = path2.resolve(id);
  if (fs2.existsSync(module_path)) {
    return { location: module_path, builtin: false };
  }
  return {
    location: path2.resolve(dirname, "..", "..", "modules", id, "index.js"),
    builtin: true
  };
}
var BahamutAutomation = class extends EventEmitter2 {
  config;
  logger;
  start_time = null;
  end_time = null;
  browser;
  constructor(config, logger = new Logger("Automation")) {
    super();
    this.config = {
      shared: { flags: {}, ...config?.shared },
      modules: { utils: {}, ...config?.modules },
      browser: { type: "firefox", headless: true, ...config?.browser }
    };
    this.logger = logger;
    this.on("error", (...arg) => this?.logger?.error(...arg));
    this.on("warn", (...arg) => this?.logger?.warn(...arg));
    this.on("info", (...arg) => this?.logger?.info(...arg));
    this.on("log", (...arg) => this?.logger?.log(...arg));
  }
  setup_listeners() {
    const self = this;
    this.on("start", () => {
      self.emit("log", `\u958B\u59CB\u57F7\u884C\u5DF4\u54C8\u59C6\u7279\u81EA\u52D5\u5316 ${VERSION}`);
      countapi.update("Bahamut-Automation", "run", 1);
    });
    this.on("module_start", (module_name, module_path) => {
      self.emit("log", `\u57F7\u884C ${module_name} \u6A21\u7D44 (${module_path})`);
      console.group();
    });
    this.on("module_finished", (module_name) => {
      console.groupEnd();
      self.emit("log", `\u6A21\u7D44 ${module_name} \u57F7\u884C\u5B8C\u7562`);
    });
    this.on("module_failed", (module_name, err) => {
      console.groupEnd();
      self.emit("error", `\u6A21\u7D44 ${module_name} \u57F7\u884C\u5931\u6557`, err);
    });
    this.on("finished", (outputs, time) => {
      self.emit("log", `\u57F7\u884C\u5B8C\u7562 \u6642\u9593: ${second_to_time(time)}
\u8F38\u51FA: ${outputs}`, outputs, time);
    });
    this.on("fatal", (err) => {
      if (self.browser) {
        self.browser.close();
      }
      self.emit("error", "\u5DF4\u54C8\u59C6\u7279\u81EA\u52D5\u5316\u57F7\u884C\u5931\u6557", err);
    });
  }
  async run() {
    try {
      this.start_time = Date.now();
      this.emit("start");
      this.browser = new Browser(this.config.browser.type || "firefox", this.config.browser);
      this.browser.on("log", (...arg) => this.emit("log", ...arg));
      await this.browser.launch();
      this.emit("browser_opened");
      const shared = this.config.shared;
      const outputs = {};
      for (const [module_id, module_params] of Object.entries(this.config.modules)) {
        const page = await this.browser.new_page();
        try {
          const { location, builtin } = resolve_module(module_id);
          if (!fs2.existsSync(location)) {
            throw new Error(`\u6A21\u7D44 ${module_id} (${location}) \u4E0D\u5B58\u5728`);
          }
          const _module = await import(pathToFileURL(location).toString());
          const module = _module.default || _module;
          this.emit("module_start", module.name || module_id, builtin ? "Built-in" : location);
          outputs[module_id] = await module.run({
            page,
            shared: { ...shared, ...outputs },
            params: module_params || {},
            logger: new Logger(module.name || module_id)
          });
          this.emit("module_finished", module_id);
        } catch (err) {
          this.emit("module_failed", module_id, err);
        }
        if (page && page.close) {
          await page.close();
        }
      }
      await this.browser.close();
      this.end_time = Date.now();
      const time = Math.floor((this.end_time - this.start_time) / 1e3);
      this.emit("finished", JSON.parse(JSON.stringify(outputs)), time);
      return { outputs: JSON.parse(JSON.stringify(outputs)), time };
    } catch (err) {
      this.emit("fatal", err);
      return null;
    }
  }
  static from(config_path) {
    switch (path2.extname(config_path)) {
      case ".yml":
      case ".yaml":
        return new BahamutAutomation(yaml.load(fs2.readFileSync(config_path, "utf8")));
      case ".json":
        return new BahamutAutomation(JSON.parse(fs2.readFileSync(config_path, "utf8")));
      case ".js":
      case ".cjs":
        return new BahamutAutomation(__require(config_path));
      default:
        throw new Error("\u4E0D\u652F\u63F4\u7684\u8A2D\u5B9A\u6A94\u683C\u5F0F");
    }
  }
};
var automation_default = BahamutAutomation;

// src/core/cli.ts
var readline = createInterface({
  input: process.stdin,
  output: process.stdout
});
program.option("-m, --mode <mode>", "\u8A2D\u5B9A\u6A94\u57F7\u884C\u6A21\u5F0F (1 or 2)").option("-c, --config <path>", "\u8A2D\u5B9A\u6A94\u4F4D\u7F6E").addHelpText("after", "\nExample: bahamut-automation -m 1 -c ./config.yml").action(main).parse();
async function main() {
  const opts = program.opts();
  let mode = opts.mode ? +opts.mode : null;
  let config_path = opts.config || null;
  if (mode !== 1 && mode !== 2) {
    while (true) {
      mode = +(await ask(["\u9078\u64C7\u6A21\u5F0F: ", "1. \u8A2D\u5B9A\u6A94\u57F7\u884C", "2. \u76F4\u63A5\u57F7\u884C", ">> "].join("\n"))).trim();
      if (mode === 1 || mode === 2)
        break;
    }
  }
  if (mode === 1) {
    if (config_path) {
      config_path = path3.resolve(config_path);
    }
    while (!fs3.existsSync(config_path)) {
      config_path = path3.resolve(remove_quotes((await ask("\u8ACB\u8F38\u5165\u8A2D\u5B9A\u6A94\u4F4D\u7F6E: ")).trim()));
      if (fs3.existsSync(config_path)) {
        break;
      }
      console.log("\u8A2D\u5B9A\u6A94\u4E0D\u5B58\u5728", config_path);
    }
    const automation = automation_default.from(config_path);
    automation.setup_listeners();
    await automation.run();
  } else if (mode === 2) {
    console.log("\u62B1\u6B49\uFF0C\u6211\u9084\u6C92\u5BE6\u4F5C\u9019\u500B\u529F\u80FD\u3002 :(");
  }
  console.log("\u7A0B\u5F0F\u57F7\u884C\u5B8C\u7562");
  process.exit(0);
}
function ask(question = "") {
  return new Promise((resolve) => readline.question(question, resolve));
}
function remove_quotes(str) {
  if (str && (str.startsWith('"') && str.endsWith('"') || str.startsWith("'") && str.endsWith("'"))) {
    return str.substring(1, str.length - 1);
  }
  return str;
}
