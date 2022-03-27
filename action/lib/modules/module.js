// src/modules/module.js
var module_default = {
  name: "Example Module",
  description: "\u9019\u662F\u500B\u7BC4\u4F8B\u6A21\u7D44\uFF0C\u4E0D\u8981\u7528\u5B83\uFF0C\u770B\u5C31\u597D",
  async run({ page, params, shared, logger }) {
    await page.goto("https://www.google.com");
    const { a, b } = params;
    const utils = shared.utils;
    shared.flags.installed = { ...shared.flags?.installed, example: true };
    shared.flags.i_am_a_flag = "I am a flag";
    const logged_in = shared.flags?.logged;
    logger.log("\u7D00\u9304");
    logger.info("\u8A0A\u606F\uFF01");
    logger.warn("\u8B66\u544A\uFF01\uFF01");
    logger.error("\u932F\u8AA4\uFF01\uFF01\uFF01");
    logger.success("\u6210\u529F\uFF01\uFF01\uFF01\uFF01");
    logger.info(`a = ${a}, b = ${b}`);
    logger.info(`\u6642\u9593\uFF1A${utils.template("$year$/$month$/$day$ $hour$:$minute$:$second$")}`);
    return { hi: "Hello World", logged_in };
  }
};
export {
  module_default as default
};
