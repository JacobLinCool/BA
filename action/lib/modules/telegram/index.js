// src/modules/telegram/index.ts
import fetch from "node-fetch";
var telegram_default = {
  name: "Telegram \u901A\u77E5",
  description: "\u900F\u904E Telegram \u6A5F\u5668\u4EBA\u767C\u9001\u901A\u77E5",
  async run({ shared, params, logger }) {
    if (!shared.report) {
      logger.error("\u8ACB\u8A2D\u5B9A report \u6A21\u7D44");
      return;
    }
    if (!params.channel) {
      logger.error("\u8ACB\u8A2D\u5B9A Telegram Channel ID (channel)");
      return;
    }
    if ((await shared.report.text()).length === 0) {
      logger.info("\u6C92\u6709\u5831\u544A\u5167\u5BB9");
      return;
    }
    const msg = (await shared.report.markdown()).replace(/^#+([^#].*)/gm, (match) => `**${match.replace(/^#+/, "").trim()}**`);
    const { ok } = await fetch("https://automia.jacob.workers.dev/", {
      method: "POST",
      body: JSON.stringify({ id: params.channel, send: msg })
    }).then((r) => r.json());
    if (ok) {
      logger.success("\u5DF2\u767C\u9001 Telegram \u5831\u544A\uFF01");
    } else {
      logger.error(msg);
      logger.error("\u767C\u9001 Telegram \u5831\u544A\u5931\u6557\uFF01");
    }
  }
};
export {
  telegram_default as default
};
