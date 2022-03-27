// src/modules/lottery/index.ts
import countapi from "countapi-js";
import { Pool } from "@jacoblincool/puddle";
var lottery_default = {
  name: "\u798F\u5229\u793E",
  description: "\u798F\u5229\u793E\u62BD\u734E",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u6CD5\u62BD\u734E");
    if (!shared.ad_handler)
      throw new Error("\u9700\u4F7F\u7528 ad_handler \u6A21\u7D44");
    logger.log(`\u958B\u59CB\u57F7\u884C`);
    let lottery = 0;
    logger.log("\u6B63\u5728\u5C0B\u627E\u62BD\u62BD\u6A02");
    const draws = await getList(page, logger);
    logger.log(`\u627E\u5230 ${draws.length} \u500B\u62BD\u62BD\u6A02`);
    const unfinished = {};
    draws.forEach(({ name, link }, i) => {
      logger.log(`${i + 1}: ${name}`);
      unfinished[name] = link;
    });
    const parrallel = +params.max_parallel || 1;
    const max_attempts = +params.max_attempts || +shared.max_attempts || 20;
    const context = page.context();
    const pool = new Pool(parrallel);
    for (let i = 0; i < draws.length; i++) {
      pool.push(async () => {
        const idx = i;
        const { link, name } = draws[idx];
        const task_page = await context.newPage();
        for (let attempts = 1; attempts <= max_attempts; attempts++) {
          try {
            await task_page.goto(link);
            await task_page.waitForSelector("#BH-master > .BH-lbox.fuli-pbox h1");
            await task_page.waitForTimeout(100);
            if (await task_page.$(".btn-base.c-accent-o.is-disable")) {
              logger.log(`${name} \u7684\u5EE3\u544A\u514D\u8CBB\u6B21\u6578\u5DF2\u7528\u5B8C \x1B[92m\u2714\x1B[m`);
              delete unfinished[name];
              break;
            }
            logger.log(`[${idx + 1} / ${draws.length}] (${attempts}) ${name}`);
            await Promise.all([
              task_page.waitForResponse(/ajax\/check_ad.php/, { timeout: 5e3 }).catch(() => {
              }),
              task_page.click("text=\u770B\u5EE3\u544A\u514D\u8CBB\u514C\u63DB").catch(() => {
              })
            ]);
            if (await task_page.$eval(".dialogify", (elm) => elm.textContent.includes("\u52C7\u8005\u554F\u7B54\u8003\u9A57")).catch(() => {
            })) {
              logger.info(`\u9700\u8981\u56DE\u7B54\u554F\u984C\uFF0C\u6B63\u5728\u56DE\u7B54\u554F\u984C`);
              await task_page.$$eval("#dialogify_1 .dialogify__body a", (options) => {
                options.forEach((option) => {
                  if (option.dataset.option == option.dataset.answer)
                    option.click();
                });
              });
              await task_page.waitForSelector("#btn-buy");
              await task_page.waitForTimeout(100);
              await task_page.click("#btn-buy");
            }
            await Promise.all([
              task_page.waitForResponse(/file\.(mp4|webm)/, { timeout: 5e3 }).catch(() => {
              }),
              task_page.waitForSelector(".dialogify .dialogify__body p", { timeout: 5e3 }).catch(() => {
              })
            ]);
            let ad_status = await task_page.$eval(".dialogify .dialogify__body p", (elm) => elm.innerText).catch(() => {
            }) || "";
            let ad_frame;
            if (ad_status.includes("\u5EE3\u544A\u80FD\u91CF\u88DC\u5145\u4E2D")) {
              logger.error("\u5EE3\u544A\u80FD\u91CF\u88DC\u5145\u4E2D");
              await task_page.reload().catch((...args) => logger.error(...args));
              continue;
            } else if (ad_status.includes("\u89C0\u770B\u5EE3\u544A")) {
              logger.log(`\u6B63\u5728\u89C0\u770B\u5EE3\u544A`);
              await task_page.click("text=\u78BA\u5B9A");
              await task_page.waitForSelector("ins iframe").catch((...args) => logger.error(...args));
              await task_page.waitForTimeout(1e3);
              const ad_iframe = await task_page.$("ins iframe").catch((...args) => logger.error(...args));
              try {
                ad_frame = await ad_iframe.contentFrame();
                await shared.ad_handler({ ad_frame });
              } catch (err) {
                logger.error(err);
              }
              await task_page.waitForTimeout(1e3);
            } else if (ad_status) {
              logger.log(ad_status);
            }
            const final_url = task_page.url();
            if (final_url.includes("/buyD.php") && final_url.includes("ad=1")) {
              logger.log(`\u6B63\u5728\u78BA\u8A8D\u7D50\u7B97\u9801\u9762`);
              await checkInfo(task_page, logger).catch((...args) => logger.error(...args));
              await confirm(task_page, logger).catch((...args) => logger.error(...args));
              if (await task_page.$(".card > .section > p") && await task_page.$eval(".card > .section > p", (elm) => elm.innerText.includes("\u6210\u529F"))) {
                logger.success("\u5DF2\u5B8C\u6210\u4E00\u6B21\u62BD\u62BD\u6A02\uFF1A" + name + " \x1B[92m\u2714\x1B[m");
                lottery++;
              } else {
                logger.error("\u767C\u751F\u932F\u8AA4\uFF0C\u91CD\u8A66\u4E2D \x1B[91m\u2718\x1B[m");
              }
            } else {
              logger.warn(final_url);
              logger.error("\u672A\u9032\u5165\u7D50\u7B97\u9801\u9762\uFF0C\u91CD\u8A66\u4E2D \x1B[91m\u2718\x1B[m");
            }
          } catch (err) {
            logger.error("!", err);
          }
        }
        await task_page.close();
      });
    }
    await pool.go();
    await page.waitForTimeout(2e3);
    logger.log(`\u57F7\u884C\u5B8C\u7562 \u2728`);
    if (lottery) {
      countapi.update("Bahamut-Automation", "lottery", lottery);
    }
    if (shared.report) {
      shared.report.reports["\u798F\u5229\u793E\u62BD\u734E"] = report({ lottery, unfinished });
    }
    return { lottery, unfinished };
  }
};
async function getList(page, logger) {
  let draws;
  let attempts = 3;
  while (attempts-- > 0) {
    draws = [];
    try {
      await page.goto("https://fuli.gamer.com.tw/shop.php?page=1");
      let items = await page.$$("a.items-card");
      for (let i = items.length - 1; i >= 0; i--) {
        let is_draw = await items[i].evaluate((elm) => elm.innerHTML.includes("\u62BD\u62BD\u6A02"));
        if (is_draw) {
          draws.push({
            name: await items[i].evaluate((node) => node.querySelector(".items-title").innerHTML),
            link: await items[i].evaluate((elm) => elm.href)
          });
        }
      }
      while (await page.$eval("a.pagenow", (elm) => elm.nextSibling ? true : false)) {
        await page.goto("https://fuli.gamer.com.tw/shop.php?page=" + await page.$eval("a.pagenow", (elm) => elm.nextSibling.innerText));
        let items2 = await page.$$("a.items-card");
        for (let i = items2.length - 1; i >= 0; i--) {
          let is_draw = await items2[i].evaluate((node) => node.innerHTML.includes("\u62BD\u62BD\u6A02"));
          if (is_draw) {
            draws.push({
              name: await items2[i].evaluate((node) => node.querySelector(".items-title").innerHTML),
              link: await items2[i].evaluate((elm) => elm.href)
            });
          }
        }
      }
      break;
    } catch (err) {
      logger.error(err);
    }
  }
  return draws;
}
async function checkInfo(page, logger) {
  try {
    const name = await page.$eval("#name", (elm) => elm.value);
    const tel = await page.$eval("#tel", (elm) => elm.value);
    const city = await page.$eval("[name=city]", (elm) => elm.value);
    const country = await page.$eval("[name=country]", (elm) => elm.value);
    const address = await page.$eval("#address", (elm) => elm.value);
    if (!name)
      logger.log("\u7121\u6536\u4EF6\u4EBA\u59D3\u540D");
    if (!tel)
      logger.log("\u7121\u6536\u4EF6\u4EBA\u96FB\u8A71");
    if (!city)
      logger.log("\u7121\u6536\u4EF6\u4EBA\u57CE\u5E02");
    if (!country)
      logger.log("\u7121\u6536\u4EF6\u4EBA\u5340\u57DF");
    if (!address)
      logger.log("\u7121\u6536\u4EF6\u4EBA\u5730\u5740");
    if (!name || !tel || !city || !country || !address)
      throw new Error("\u8B66\u544A\uFF1A\u6536\u4EF6\u4EBA\u8CC7\u6599\u4E0D\u5168");
  } catch (err) {
    logger.error(err);
  }
}
async function confirm(page, logger) {
  try {
    await page.waitForSelector("input[name='agreeConfirm']");
    if (await (await page.$("input[name='agreeConfirm']")).getAttribute("checked") === null) {
      await page.check("input[name='agreeConfirm']");
    }
    await page.waitForTimeout(100);
    await page.waitForSelector("a:has-text('\u78BA\u8A8D\u514C\u63DB')");
    await page.waitForTimeout(100);
    await page.click("a:has-text('\u78BA\u8A8D\u514C\u63DB')");
    await page.waitForSelector("button:has-text('\u78BA\u5B9A')");
    await page.waitForTimeout(100);
    await Promise.all([page.waitForNavigation(), page.click("button:has-text('\u78BA\u5B9A')")]);
    await page.waitForTimeout(300);
  } catch (err) {
    logger.error(page.url());
    logger.error(err);
  }
}
function report({ lottery, unfinished }) {
  let body = "# \u798F\u5229\u793E\u62BD\u62BD\u6A02 \n\n";
  if (lottery) {
    body += `\u2728\u2728\u2728 \u7372\u5F97 **${lottery}** \u500B\u62BD\u734E\u6A5F\u6703\uFF0C\u50F9\u503C **${(lottery * 500).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}** \u5DF4\u5E63 \u2728\u2728\u2728
`;
  }
  if (Object.keys(unfinished).length === 0) {
    body += "\u{1F7E2} \u6240\u6709\u62BD\u734E\u7686\u5DF2\u5B8C\u6210\n";
  }
  Object.keys(unfinished).forEach((key) => {
    if (unfinished[key] === void 0)
      return;
    body += `\u274C \u672A\u80FD\u81EA\u52D5\u5B8C\u6210\u6240\u6709 ***[${key}](${unfinished[key]})*** \u7684\u62BD\u734E
`;
  });
  body += "\n";
  return body;
}
export {
  lottery_default as default
};
