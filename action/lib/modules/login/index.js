// src/modules/login_v2/index.ts
import fetch from "node-fetch";
import { authenticator } from "otplib";

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

// src/modules/login_v2/index.ts
var login_v2_default = {
  name: "Login",
  description: "\u767B\u5165",
  run: async ({ page, params, shared, logger }) => {
    logger.log(`Login started`);
    let result = {};
    let bahaRune = "";
    let bahaEnur = "";
    const max_attempts = +params.max_attempts || +shared.max_attempts || 3;
    for (let i = 0; i < max_attempts; i++) {
      const query = new URLSearchParams();
      query.append("uid", params.username);
      query.append("passwd", params.password);
      query.append("vcode", "6666");
      if (params.twofa?.length) {
        query.append("twoStepAuth", authenticator.generate(params.twofa));
      }
      try {
        const res = await fetch("https://api.gamer.com.tw/mobile_app/user/v3/do_login.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: "ckAPP_VCODE=6666"
          },
          body: query.toString()
        });
        const body = await res.json();
        if (body.userid) {
          const cookies = res.headers.get("set-cookie");
          bahaRune = cookies.split(/(BAHARUNE=\w+)/)[1].split("=")[1];
          bahaEnur = cookies.split(/(BAHAENUR=\w+)/)[1].split("=")[1];
          logger.success(`\u2705 \u767B\u5165\u6210\u529F`);
          break;
        } else {
          result = body.message;
        }
      } catch (err) {
        logger.error(err);
        result.error = err;
      }
      logger.error(`\u274C \u767B\u5165\u5931\u6557: `, result.error);
      await page.waitForTimeout(1e3);
    }
    if (bahaRune && bahaEnur) {
      await goto(page, "home");
      const context = page.context();
      await context.addInitScript(([BAHAID, BAHARUNE, BAHAENUR]) => {
        document.cookie = `BAHAID=${BAHAID}; path=/; domain=.gamer.com.tw`;
        document.cookie = `BAHARUNE=${BAHARUNE}; path=/; domain=.gamer.com.tw`;
        document.cookie = `BAHAENUR=${BAHAENUR}; path=/; domain=.gamer.com.tw`;
      }, [params.username, bahaRune, bahaEnur]);
      await goto(page, "home");
      await page.waitForTimeout(1e3);
      logger.success(`\u2705 \u767B\u5165 Cookie \u5DF2\u8F09\u5165`);
      result.success = true;
    } else {
      result.success = false;
    }
    if (result.success) {
      shared.flags.logged = true;
    }
    return result;
  }
};

// src/modules/login/index.ts
var login_default = login_v2_default;
export {
  login_default as default
};
