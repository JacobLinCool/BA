// src/modules/test/video.ts
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
export {
  video_default as default
};
