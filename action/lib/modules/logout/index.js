// src/modules/logout/index.ts
var logout_default = {
  name: "\u767B\u51FA",
  description: "\u767B\u51FA\u5DF4\u54C8\u59C6\u7279",
  run: async ({ page, shared, logger }) => {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u9700\u767B\u51FA");
    logger.log(`\u958B\u59CB\u57F7\u884C`);
    await page.goto("https://user.gamer.com.tw/logout.php");
    await page.waitForSelector("div.wrapper.wrapper-prompt > div > div > div.form__buttonbar > button");
    await page.click("div.wrapper.wrapper-prompt > div > div > div.form__buttonbar > button");
    await page.waitForSelector("div.TOP-my.TOP-nologin").catch((...args) => logger.error(...args));
    logger.log(`\u5E33\u865F\u5DF2\u767B\u51FA`);
    shared.flags.logged = false;
  }
};
export {
  logout_default as default
};
