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
var browser_default = Browser;
export {
  Browser,
  browser_default as default
};
