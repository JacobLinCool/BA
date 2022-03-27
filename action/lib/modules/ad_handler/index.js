// src/modules/ad_handler/index.ts
var _logger;
var ad_handler_default = {
  name: "Google AD \u8655\u7406\u7A0B\u5F0F",
  description: "\u8A3B\u518A\u8655\u7406 Google AD \u7684\u7A0B\u5F0F",
  async run({ page, logger }) {
    _logger = logger;
    await page.exposeFunction("ad_handler", ad_handler);
    logger.info("\u5DF2\u8A3B\u518A Google AD \u8655\u7406\u7A0B\u5F0F");
    return ad_handler;
  }
};
async function ad_handler({ ad_frame, timeout = 60 }) {
  _logger.log("Google AD \u8655\u7406\u7A0B\u5F0F: Start");
  const result = await Promise.race([
    sleep(timeout * 1e3, "timed out"),
    (async () => {
      try {
        await ad_frame.waitForTimeout(1e3);
        if (await ad_frame.$(".rewardDialogueWrapper:not([style*=none]) .rewardResumebutton"))
          await ad_frame.click(".rewardDialogueWrapper:not([style*=none]) .rewardResumebutton");
        await Promise.race([
          ad_frame.waitForSelector(".videoAdUiSkipContainer.html5-stop-propagation > button", { timeout: 35e3 }),
          checkTopRightClose(ad_frame),
          checkVideoEnded(ad_frame)
        ]).catch(() => {
        });
        await ad_frame.waitForTimeout(1e3);
        if (await ad_frame.$(".videoAdUiSkipContainer.html5-stop-propagation > button"))
          await ad_frame.click(".videoAdUiSkipContainer.html5-stop-propagation > button");
        else if (await ad_frame.$("div#close_button_icon"))
          await ad_frame.click("div#close_button_icon");
        else if (await ad_frame.$("#google-rewarded-video > img:nth-child(4)"))
          await ad_frame.click("#google-rewarded-video > img:nth-child(4)");
        else if (await checkVideoEnded(ad_frame)) {
        } else
          throw new Error("\u767C\u73FE\u672A\u77E5\u985E\u578B\u7684\u5EE3\u544A");
        await ad_frame.waitForTimeout(2e3);
      } catch (err) {
        _logger.error(err);
      }
    })()
  ]);
  if (result === "timed out") {
    _logger.log("Google AD \u8655\u7406\u7A0B\u5F0F: Timed Out");
  } else {
    _logger.log("Google AD \u8655\u7406\u7A0B\u5F0F: Finished");
  }
}
async function checkVideoEnded(ad_frame) {
  const videoElement = await ad_frame.waitForSelector("video");
  if (await videoElement.evaluate((elm) => elm.ended))
    return true;
  return videoElement.evaluate((elm) => {
    return new Promise((r) => elm.addEventListener("ended", () => r(true)));
  });
}
function checkTopRightClose(ad_frame) {
  return new Promise(async (r) => {
    try {
      const count_down = await ad_frame.$("#count_down");
      if (count_down) {
        const seconds = +(await count_down.evaluate((elm) => elm.innerText)).replace(/[^0-9]/g, "");
        setTimeout(r, (seconds + 1) * 1e3);
      } else {
        setTimeout(r, 35 * 1e3);
      }
    } catch (err) {
      setTimeout(r, 35 * 1e3);
    }
  });
}
function sleep(t = 1e3, msg) {
  return new Promise((r) => setTimeout(() => r(msg), t));
}
export {
  ad_handler_default as default
};
