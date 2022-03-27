// src/modules/answer/index.ts
import countapi from "countapi-js";
import node_fetch from "node-fetch";
var answer_default = {
  name: "\u52D5\u756B\u760B\u7B54\u984C",
  description: "\u81EA\u52D5\u56DE\u7B54\u52D5\u756B\u760B\u4ECA\u65E5\u554F\u984C",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u6CD5\u7B54\u984C");
    let reward = 0;
    let question = {};
    logger.log(`\u958B\u59CB\u57F7\u884C`);
    const max_attempts = +params.max_attempts || +shared.max_attempts || 3;
    for (let attempts = 0; attempts < max_attempts; attempts++) {
      try {
        logger.log("\u6B63\u5728\u6AA2\u6E2C\u7B54\u984C\u72C0\u614B");
        await page.goto("https://ani.gamer.com.tw/");
        await page.waitForTimeout(200);
        question = await page.evaluate(() => {
          return fetch("/ajax/animeGetQuestion.php?t=" + Date.now()).then((r) => r.json());
        });
        if (question.question) {
          const options = [null, question.a1, question.a2, question.a3, question.a4];
          logger.log("\u5C1A\u672A\u56DE\u7B54\u4ECA\u65E5\u984C\u76EE\uFF0C\u5617\u8A66\u7B54\u984C\u4E2D");
          logger.info(`\u4ECA\u5929\u7684\u554F\u984C\uFF1A${question.question}`);
          logger.info(`\u9078\u9805\uFF1A${options.filter(Boolean).join(", ")}`);
          logger.log(`\u6B63\u5728\u5C0B\u627E\u7B54\u6848`);
          const token = question.token;
          const sn = await node_fetch("https://api.gamer.com.tw/mobile_app/bahamut/v1/home.php?owner=blackXblue&page=1").then((r) => r.json()).then((d) => d.creation[0].sn);
          const ans = await node_fetch("https://api.gamer.com.tw/mobile_app/bahamut/v1/home_creation_detail.php?sn=" + sn).then((r) => r.json()).then((d) => d.content.match(/<body[\s\w"-=]*>([\s\S]*)<\/body>/)[0].match(/A[:：](\d)/gi)[0].match(/\d/)[0]).then(parseInt);
          logger.log(`\u7B54\u6848\u662F ${ans}. ${options[ans]} \uFF01`);
          logger.log(`\u6B63\u5728\u5617\u8A66\u56DE\u7B54`);
          const result2 = await page.evaluate(async ({ ans: ans2, token: token2 }) => {
            const r = await fetch("/ajax/animeAnsQuestion.php", {
              headers: {
                accept: "*/*",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
              },
              method: "POST",
              body: new URLSearchParams({
                token: token2,
                ans: ans2.toString(),
                t: Date.now().toString()
              })
            });
            return r.json();
          }, { ans, token });
          if (result2.error)
            logger.error("\u56DE\u7B54\u554F\u984C\u6642\u767C\u751F\u932F\u8AA4 " + result2.msg + " \x1B[91m\u2718\x1B[m");
          if (result2.ok) {
            logger.success("\u5DF2\u56DE\u7B54\u554F\u984C " + result2.gift + " \x1B[92m\u2714\x1B[m");
            reward = +result2.gift.match(/\d{2,4}/)[0];
          }
        } else if (question.error === 1 && question.msg === "\u4ECA\u65E5\u5DF2\u7D93\u7B54\u904E\u984C\u76EE\u4E86\uFF0C\u4E00\u5929\u50C5\u9650\u4E00\u6B21\u6A5F\u6703") {
          logger.info("\u4ECA\u65E5\u5DF2\u7D93\u7B54\u904E\u984C\u76EE\u4E86 \x1B[92m\u2714\x1B[m");
        } else {
          logger.error("\u767C\u751F\u672A\u77E5\u932F\u8AA4\uFF1A" + question.msg + " \x1B[91m\u2718\x1B[m");
        }
        await page.waitForTimeout(1e3);
        break;
      } catch (err) {
        logger.error(err);
        logger.error("\u767C\u751F\u932F\u8AA4\uFF0C\u91CD\u8A66\u4E2D \x1B[91m\u2718\x1B[m");
      }
    }
    logger.log(`\u57F7\u884C\u5B8C\u7562 \u2728`);
    if (reward) {
      countapi.update("Bahamut-Automation", "answer", reward);
    }
    const result = { answered: question.error === 1 || !!reward, reward };
    if (shared.report) {
      shared.report.reports.answer = report(result);
    }
    return result;
  }
};
function report({ reward, answered }) {
  let body = "# \u52D5\u756B\u760B\u7B54\u984C\n\n";
  if (reward)
    body += `\u2728\u2728\u2728 \u7372\u5F97 ${reward} \u5DF4\u5E63 \u2728\u2728\u2728
`;
  if (answered)
    body += `\u{1F7E2} \u4ECA\u65E5\u5DF2\u7B54\u984C
`;
  else
    body += `\u274C \u4ECA\u65E5\u5C1A\u672A\u7B54\u984C
`;
  body += "\n";
  return body;
}
export {
  answer_default as default
};
