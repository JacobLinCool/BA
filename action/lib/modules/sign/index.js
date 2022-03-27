// src/modules/sign/index.ts
import countapi from "countapi-js";

// src/modules/utils/goto.ts
var locations = {
  home: "https://www.gamer.com.tw/",
  login: "https://user.gamer.com.tw/login.php",
  anime: "https://ani.gamer.com.tw/",
  fuli: "https://fuli.gamer.com.tw/",
  user: "https://home.gamer.com.tw/homeindex.php?owner=<owner>"
};
function goto(page, location, ...args) {
  let url = locations[location];
  if (/<\w+>/.test(url)) {
    url = url.replace(/<(\w+)>/g, (_, key) => args.shift());
  }
  return page.goto(url);
}

// src/modules/sign/index.ts
var sign_default = {
  name: "\u7C3D\u5230",
  description: "\u7C3D\u5230\u6A21\u7D44",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u6CD5\u7C3D\u5230");
    logger.log(`\u958B\u59CB\u57F7\u884C`);
    await goto(page, "home");
    await page.waitForTimeout(2e3);
    let { days, finished_ad, signin } = await sign_status(page);
    const initial_signin = signin;
    logger.info(`\u5DF2\u9023\u7E8C\u7C3D\u5230\u5929\u6578: ${days}`);
    if (!signin) {
      logger.warn("\u4ECA\u65E5\u5C1A\u672A\u7C3D\u5230 \x1B[91m\u2718\x1B[m");
      logger.log("\u6B63\u5728\u5617\u8A66\u7C3D\u5230");
      await page.click("a#signin-btn").catch((err) => logger.error(err));
      await page.waitForTimeout(5e3);
      logger.success("\u6210\u529F\u7C3D\u5230 \x1B[92m\u2714\x1B[m");
    } else {
      logger.info("\u4ECA\u65E5\u5DF2\u7C3D\u5230 \x1B[92m\u2714\x1B[m");
    }
    if (shared.ad_handler) {
      const max_attempts = +params.double_max_attempts || 3;
      for (let attempts = 0; attempts < max_attempts; attempts++) {
        try {
          logger.log(`\u6B63\u5728\u6AA2\u6E2C\u96D9\u500D\u7C3D\u5230\u734E\u52F5\u72C0\u614B`);
          await goto(page, "home");
          await page.waitForSelector("a#signin-btn");
          await page.waitForTimeout(50);
          await page.click("a#signin-btn");
          await page.waitForSelector("text=\u9818\u53D6\u96D9\u500D\u5DF4\u5E63");
          await page.waitForTimeout(50);
          if (!finished_ad) {
            logger.log("\u5C1A\u672A\u7372\u5F97\u96D9\u500D\u7C3D\u5230\u734E\u52F5 \x1B[91m\u2718\x1B[m");
            if (await page.$("div.popup-dailybox__bottom > button[disabled]")) {
              throw new Error("Button disabled");
            }
            logger.log("\u5617\u8A66\u89C0\u770B\u5EE3\u544A\u4EE5\u7372\u5F97\u96D9\u500D\u734E\u52F5\uFF0C\u53EF\u80FD\u9700\u8981\u591A\u9054 1 \u5206\u9418");
            await page.click("text=\u9818\u53D6\u96D9\u500D\u5DF4\u5E63");
            await Promise.all([
              page.waitForResponse(/\gampad\/ads/),
              page.click("text=\u9818\u53D6\u96D9\u500D\u5DF4\u5E63")
            ]);
            await page.waitForTimeout(50);
            if (await page.$("text=\u5EE3\u544A\u80FD\u91CF\u88DC\u5145\u4E2D \u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")) {
              throw new Error("\u5EE3\u544A\u80FD\u91CF\u88DC\u5145\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66");
            }
            await page.waitForSelector("button[type=submit]");
            await page.waitForTimeout(100);
            await page.click("button[type=submit]");
            await page.waitForTimeout(3e3);
            await page.waitForSelector("ins iframe");
            const ad_iframe = await page.$("ins iframe");
            const ad_frame = await ad_iframe.contentFrame();
            await shared.ad_handler({ ad_frame });
            finished_ad = (await sign_status(page)).finishedAd;
            if (finished_ad) {
              logger.success("\u5DF2\u89C0\u770B\u96D9\u500D\u734E\u52F5\u5EE3\u544A \x1B[92m\u2714\x1B[m");
              break;
            }
            throw new Error("\u89C0\u770B\u96D9\u500D\u734E\u52F5\u5EE3\u544A\u904E\u7A0B\u767C\u751F\u672A\u77E5\u932F\u8AA4");
          } else {
            logger.info("\u5DF2\u7372\u5F97\u96D9\u500D\u7C3D\u5230\u734E\u52F5 \x1B[92m\u2714\x1B[m");
            break;
          }
        } catch (err) {
          logger.error(err);
          logger.error(`\u89C0\u770B\u96D9\u500D\u734E\u52F5\u5EE3\u544A\u904E\u7A0B\u767C\u751F\u932F\u8AA4\uFF0C\u5C07\u518D\u91CD\u8A66 ${max_attempts - attempts - 1} \u6B21 \x1B[91m\u2718\x1B[m`);
        }
      }
    } else {
      logger.warn("\u96D9\u500D\u7C3D\u5230\u734E\u52F5\u9700\u4F7F\u7528 ad_handler \u6A21\u7D44");
    }
    const final = await sign_status(page);
    if (!initial_signin && final.signin) {
      countapi.update("Bahamut-Automation", "sign", 1);
    }
    const result = {
      signed: !!final.signin,
      doubled: !!final.finished_ad,
      days: final.days
    };
    if (shared.report) {
      shared.report.reports["\u7C3D\u5230"] = report(result);
    }
    logger.log(`\u57F7\u884C\u5B8C\u7562 \u2728`);
    return result;
  }
};
async function sign_status(page) {
  const { data } = await page.evaluate(async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3e4);
    const r = await fetch("https://www.gamer.com.tw/ajax/signin.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "action=2",
      signal: controller.signal
    });
    return r.json();
  });
  return data;
}
function report({ days, signed, doubled }) {
  let body = `# \u7C3D\u5230

`;
  body += `\u2728\u2728\u2728 \u5DF2\u9023\u7E8C\u7C3D\u5230 ${days} \u5929 \u2728\u2728\u2728
`;
  if (signed)
    body += `\u{1F7E2} \u4ECA\u65E5\u5DF2\u7C3D\u5230
`;
  else
    body += `\u274C \u4ECA\u65E5\u5C1A\u672A\u7C3D\u5230
`;
  if (doubled)
    body += `\u{1F7E2} \u5DF2\u7372\u5F97\u96D9\u500D\u7C3D\u5230\u734E\u52F5
`;
  else
    body += `\u274C \u5C1A\u672A\u7372\u5F97\u96D9\u500D\u7C3D\u5230\u734E\u52F5
`;
  body += "\n";
  return body;
}
export {
  sign_default as default
};
