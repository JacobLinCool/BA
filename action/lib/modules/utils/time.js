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
export {
  time as default
};
