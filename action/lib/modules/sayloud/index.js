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

// src/modules/sayloud/index.ts
var sayloud_default = {
  name: "\u52C7\u8005\u5927\u8072\u8AAA",
  description: "\u767C\u4F48\u52C7\u8005\u5927\u8072\u8AAA",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165\uFF0C\u7121\u6CD5\u767C\u4F48\u52C7\u8005\u5927\u8072\u8AAA");
    const sayloud = params.sayloud;
    if (sayloud.length < 1)
      return { success: false };
    await goto(page, "user", "");
    const item = sayloud[Math.floor(Math.random() * sayloud.length)];
    const to = template(item.to);
    const text = template(item.text);
    const status = await page.evaluate(async ({ to: to2, text: text2 }) => {
      const form = await fetch("https://home.gamer.com.tw/ajax/sayloud1.php?re=0", {
        method: "POST",
        body: new URLSearchParams()
      }).then((r) => r.text());
      if (form.includes("\u76EE\u524D\u4ECD\u6709\u5927\u8072\u8AAA\u5728\u653E\u9001")) {
        return 2;
      }
      const div = document.createElement("div");
      div.innerHTML = form;
      const token = div.querySelector("[name=token]").value;
      const send = await fetch("https://home.gamer.com.tw/ajax/sayloud2.php", {
        method: "POST",
        body: new URLSearchParams({ idType: "2", nick: to2, content: text2, token })
      }).then((r) => r.text());
      return send;
    }, { to, text });
    if (status === 2) {
      logger.warn("\u76EE\u524D\u4ECD\u6709\u5927\u8072\u8AAA\u5728\u653E\u9001");
      return {
        success: false,
        reason: "\u76EE\u524D\u4ECD\u6709\u5927\u8072\u8AAA\u5728\u653E\u9001",
        report: "\u52C7\u8005\u5927\u8072\u8AAA\uFF1A \u767C\u9001\u5931\u6557 "
      };
    } else {
      logger.success("\u653E\u9001\u6210\u529F \u6642\u9593\uFF1A" + status);
    }
    return { success: true, time: status, report: "\u52C7\u8005\u5927\u8072\u8AAA\uFF1A \u767C\u9001\u6210\u529F " + status };
  }
};
export {
  sayloud_default as default
};
