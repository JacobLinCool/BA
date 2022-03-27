var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/.pnpm/tsup@5.11.13_typescript@4.5.2/node_modules/tsup/assets/esm_shims.js
var init_esm_shims = __esm({
  "node_modules/.pnpm/tsup@5.11.13_typescript@4.5.2/node_modules/tsup/assets/esm_shims.js"() {
  }
});

// src/modules/test/video.ts
var video_exports = {};
__export(video_exports, {
  default: () => video_default
});
async function video_default(page, logger) {
  const supported = await page.evaluate(function() {
    return !!document.createElement("video").canPlayType("video/mp4; codecs=avc1.42E01E,mp4a.40.2");
  });
  if (supported) {
    logger.log("\u652F\u63F4 MP4");
  } else {
    logger.warn("\u4E0D\u652F\u63F4 MP4");
  }
}
var init_video = __esm({
  "src/modules/test/video.ts"() {
    init_esm_shims();
  }
});

// src/modules/test/index.ts
init_esm_shims();
var test_default = {
  name: "\u6E2C\u8A66\u7528\u6A21\u7D44",
  description: "\u6E2C\u8A66\u7528\u6A21\u7D44\uFF0C\u6E2C\u8A66\u700F\u89BD\u5668\u652F\u4E0D\u652F\u63F4 MP4",
  async run({ page, logger }) {
    await Promise.resolve().then(() => (init_video(), video_exports)).then((m) => m.default(page, logger));
  }
};
export {
  test_default as default
};
