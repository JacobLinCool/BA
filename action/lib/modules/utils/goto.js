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
export {
  goto_default as default,
  goto,
  locations
};
