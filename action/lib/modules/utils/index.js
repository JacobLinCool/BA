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
var goto_default = goto;

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
var template_default = template;

// src/modules/utils/user.ts
async function user(page, username) {
  const context = await page.context().browser().newContext();
  const private_page = await context.newPage();
  await goto_default(private_page, "user", username);
  const block_top = await private_page.evaluate(() => {
    const block = document.querySelector("#BH-slave > div.BH-rbox.MSG-list2 > ul.MSG-mydata1");
    const nickname = block.children[1].textContent.replace("\u66B1\u7A31\uFF1A", "").trim();
    const title = block.children[2].textContent.replace("\u7A31\u865F\uFF1A", "").trim();
    const level = parseInt(block.children[3].textContent.replace(/\D/g, ""));
    const balance = parseInt(block.children[4].textContent.replace(/\D/g, ""));
    const gp = parseInt(block.children[5].textContent.replace(/\D/g, ""));
    const sponsored = parseInt(block.children[6].textContent.replace(/\D/g, ""));
    return { nickname, title, level, balance, gp, sponsored };
  });
  const block_bottom = await private_page.evaluate(() => {
    const block = document.querySelector("#BH-slave > div.BH-rbox.BH-list1 > ul");
    const verified = block.children[2].textContent.includes("\u624B\u6A5F\u8A8D\u8B49\uFF1A\u6709");
    const registered_at = new Date(block.children[3].textContent.replace(/[^\d-]/g, ""));
    const last_login_at = new Date(block.children[5].textContent.replace(/[^\d-]/g, ""));
    return { verified, registered_at, last_login_at };
  });
  await private_page.close();
  await context.close();
  return { username, ...block_top, ...block_bottom };
}
var user_default = user;

// src/modules/utils/index.ts
var utils_default = {
  name: "Utils",
  description: "\u901A\u7528\u51FD\u5F0F\u5EAB",
  async run({ logger, shared }) {
    shared.flags.installed = { ...shared.flags?.installed, utils: true };
    logger.info("\u5DF2\u8A3B\u518A\u901A\u7528\u51FD\u5F0F\u5EAB");
    return { goto: goto_default, template: template_default, time, user: user_default };
  }
};
export {
  utils_default as default,
  goto,
  locations,
  template,
  user
};
