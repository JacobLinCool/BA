// src/modules/line_notify/index.ts
import fetch from "node-fetch";
var line_notify_default = {
  name: "Line Notify \u901A\u77E5",
  description: "\u767C\u9001 Line Notify \u901A\u77E5",
  async run({ shared, params, logger }) {
    if (!shared.report) {
      logger.error("\u8ACB\u8A2D\u5B9A report \u6A21\u7D44");
      return;
    }
    if (!params.token) {
      logger.error("\u8ACB\u8A2D\u5B9A Line Notify Token (token)");
      return;
    }
    if ((await shared.report.text()).length == 0) {
      logger.log("\u6C92\u6709\u5831\u544A\u5167\u5BB9");
      return;
    }
    const msg = await shared.report.markdown();
    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.token}` },
      body: new URLSearchParams({ message: `${shared.report.title}
${msg}` })
    }).then((res) => res.json());
    if (response.status === 200) {
      logger.success("\u5DF2\u767C\u9001 Line Notify");
    } else {
      logger.error("\u767C\u9001 Line Notify \u5931\u6557\uFF01", response, msg);
    }
  }
};
export {
  line_notify_default as default
};
