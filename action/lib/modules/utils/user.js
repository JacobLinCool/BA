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
export {
  user_default as default,
  user
};
