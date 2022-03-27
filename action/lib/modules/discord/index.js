// src/modules/discord/index.ts
import fetch from "node-fetch";
var discord_default = {
  name: "Discord \u901A\u77E5",
  description: "\u767C\u9001\u901A\u77E5\u81F3 Discord \u804A\u5929\u5BA4",
  async run({ shared, params, logger }) {
    if (!shared.report) {
      logger.error("\u8ACB\u8A2D\u5B9A report \u6A21\u7D44");
      return;
    }
    if (!params.webhook) {
      logger.error("\u8ACB\u8A2D\u5B9A Discord Webhook (webhook)");
      return;
    }
    if ((await shared.report.text()).length == 0) {
      logger.log("\u6C92\u6709\u5831\u544A\u5167\u5BB9");
      return;
    }
    const msg = (await shared.report.markdown()).replace(/^#+([^#].*)/gm, (match) => `**${match.replace(/^#+/, "").trim()}**`);
    const { ok } = await fetch(params.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: null,
        embeds: [{ title: shared.report.title, color: 1146518, description: msg }]
      })
    });
    if (ok) {
      logger.success("\u5DF2\u767C\u9001 Discord \u5831\u544A\uFF01");
    } else {
      logger.error(msg);
      logger.error("\u767C\u9001 Discord \u5831\u544A\u5931\u6557\uFF01");
    }
  }
};
export {
  discord_default as default
};
