// src/modules/utils/time.ts
function time() {
  const TZ = process.env.TZ;
  process.env.TZ = "Asia/Taipei";
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  process.env.TZ = TZ;
  return [year, month, day, hour, minute, second];
}

// src/modules/utils/template.ts
var PRESETS = {
  time() {
    const t = time();
    const rules = [
      [/\$time\$/g, `$year$/$month$/$day$ $hour$:$minute$:$second$`],
      [/\$year\$/g, t[0].toString()],
      [/\$month\$/g, t[1].toString()],
      [/\$day\$/g, t[2].toString()],
      [/\$hour\$/g, t[3].toString()],
      [/\$minute\$/g, t[4].toString()],
      [/\$second\$/g, t[5].toString()]
    ];
    return rules;
  }
};
function template(template2, presets = ["time"], custom_rules = []) {
  const rules = [...custom_rules];
  for (const preset of presets) {
    rules.push(...PRESETS[preset]?.());
  }
  let result = template2;
  for (let i = 0; i < rules.length; i++) {
    result = result.replace(rules[i][0], rules[i][1]);
  }
  return result;
}

// src/modules/builder/index.ts
var builder_default = {
  name: "\u81EA\u52D5\u56DE\u6587",
  description: "\u81EA\u52D5\u56DE\u6587\u6A21\u7D44\uFF0C\u84CB\u6A13\uFF1F",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged) {
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u6CD5\u767C\u4F48\u52C7\u8005\u5927\u8072\u8AAA");
    }
    const builder = params.posts;
    if (builder.length < 1)
      return { success: false };
    for (let i = 0; i < builder.length; i++) {
      try {
        const { bsn, snA, content } = builder[i];
        logger.log(`\u6B63\u5617\u8A66\u5728 https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA} \u56DE\u6587`);
        await page.goto(`https://forum.gamer.com.tw/post1.php?bsn=${bsn}&snA=${snA}&type=2`);
        await page.waitForTimeout(2e3);
        if (await page.$("dialog")) {
          await page.click("dialog button");
        }
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          if (onTipsClick)
            onTipsClick();
        });
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          if (document.querySelector("#source").style.display === "none") {
            bahaRte.toolbar.alternateView(true);
          }
        });
        await page.waitForTimeout(300);
        await page.$eval("#source", (elm) => {
          elm.value = "";
        });
        await page.type("#source", template(content), { delay: 11 });
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          Forum.Post.post();
        });
        await page.waitForTimeout(300);
        await page.click("form[method=dialog] button[type=submit]");
        await page.waitForTimeout(5e3);
        logger.success(`\u5DF2\u5728 https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA} \u56DE\u6587`);
        if (i + 1 < builder.length) {
          logger.log(`\u7B49\u5F85\u767C\u6587\u51B7\u537B 1 \u5206\u9418`);
          await page.waitForTimeout(60 * 1e3);
        }
      } catch (err) {
        logger.error(err);
      }
    }
    return { success: true };
  }
};
export {
  builder_default as default
};
