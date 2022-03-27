// src/modules/guild/index.ts
var guild_default = {
  name: "\u516C\u6703\u7C3D\u5230",
  description: "\u516C\u6703\u7C3D\u5230\u6A21\u7D44\uFF0C\u7C3D\u5230\u5DF2\u52A0\u5165\u7684\u516C\u6703",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u6CD5\u9032\u884C\u516C\u6703\u7C3D\u5230");
    let retry = +params.max_attempts || +shared.max_attempts || 3;
    while (retry--) {
      try {
        await page.goto("https://home.gamer.com.tw/joinGuild.php");
        await page.waitForTimeout(2e3);
        const guilds = await page.evaluate(() => {
          return [
            ...document.querySelectorAll(".acgbox .acgboximg a")
          ].map((a) => a.href);
        });
        logger.log(`\u5DF2\u52A0\u5165 ${guilds.length} \u500B\u516C\u6703`);
        for (let _guild of guilds) {
          try {
            await page.goto(_guild);
            await page.waitForTimeout(1e3);
            const name = await page.evaluate(() => {
              guild.sign();
              return document.querySelector(".main-container_header_info h1").innerText;
            });
            await page.waitForTimeout(2e3);
            logger.log(`\u5DF2\u7C3D\u5230 ${name}`);
          } catch (err) {
            logger.error(err);
          }
        }
        break;
      } catch (err) {
        logger.error(err);
        await page.waitForTimeout(500);
      }
    }
    if (shared.report) {
      shared.report.reports["\u516C\u6703\u7C3D\u5230"] = report();
    }
    return { report };
  }
};
function report() {
  let body = `# \u516C\u6703\u7C3D\u5230

`;
  body += `\u{1F7E2} \u5DF2\u57F7\u884C

`;
  return body;
}
export {
  guild_default as default
};
