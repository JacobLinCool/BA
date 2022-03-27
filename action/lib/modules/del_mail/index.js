// src/modules/del_mail/index.ts
var del_mail_default = {
  name: "\u6E05\u9664\u7AD9\u5167\u4FE1",
  description: "\u4F9D\u7D66\u5B9A pattern \u6E05\u9664\u7AD9\u5167\u4FE1",
  async run({ page, shared, params, logger }) {
    if (!shared.flags.logged)
      throw new Error("\u4F7F\u7528\u8005\u672A\u767B\u5165");
    const del_mail_match = params.match;
    if (del_mail_match.length < 1)
      return { success: false };
    await Promise.all([
      page.waitForResponse("https://mailbox.gamer.com.tw/ajax/inboxList.php"),
      page.goto("https://mailbox.gamer.com.tw/?l=1")
    ]);
    logger.log("\u6B63\u5728\u641C\u96C6\u7AD9\u5167\u4FE1... ");
    let mails = filtered_mails(await get_mails(page), del_mail_match).map((mail) => mail.id);
    while ((await page.$$(".nextPage")).length > 0 && mails.length < 1e4) {
      logger.log(`\u5DF2\u641C\u96C6 ${mails.length} \u5C01\u7B26\u5408\u689D\u4EF6\u7684\u7AD9\u5167\u4FE1`);
      await Promise.all([
        page.waitForResponse("https://mailbox.gamer.com.tw/ajax/inboxList.php"),
        page.click(".nextPage")
      ]);
      mails = [
        ...mails,
        ...filtered_mails(await get_mails(page), del_mail_match).map((mail) => mail.id)
      ];
    }
    logger.log(`\u5DF2\u641C\u96C6 ${mails.length} \u5C01\u7B26\u5408\u689D\u4EF6\u7684\u7AD9\u5167\u4FE1`);
    const csrf = await (await page.$("#delFrm input[name='csrfToken']")).getAttribute("value");
    for (let i = 0; i < mails.length; i += 100) {
      logger.log(`\u6B63\u5728\u522A\u9664\u7B2C ${i + 1} \u5230 ${Math.min(i + 100, mails.length)} \u5C01\u7AD9\u5167\u4FE1...`);
      const res = await delete_mails(page, mails.slice(i, i + 100), csrf);
      if (res.code === 0) {
        logger.log(`\u5DF2\u6210\u529F\u522A\u9664\u7B2C ${i + 1} \u5230 ${Math.min(i + 100, mails.length)} \u5C01\u7AD9\u5167\u4FE1`);
      } else {
        logger.error(`\u522A\u9664\u7B2C ${i + 1} \u5230 ${Math.min(i + 100, mails.length)} \u5C01\u7AD9\u5167\u4FE1\u5931\u6557 (${res.code})`);
      }
    }
    return { success: true, deleted: mails.length };
  }
};
async function get_mails(page) {
  const Mails = [];
  const mails = await page.$$(".readR, .readU");
  for (const mail of mails) {
    const sender = (await (await mail.$(".ML-tb1B")).textContent()).trim();
    const title = (await (await mail.$(".mailTitle")).textContent()).trim();
    const time = new Date((await (await mail.$("[nowrap='nowrap']")).textContent()).trim());
    const checkbox = await mail.$("input[type='checkbox']");
    const id = await checkbox.getAttribute("value");
    Mails.push({ id, sender, title, time, checkbox });
  }
  return Mails;
}
function filtered_mails(mails, matches) {
  const filtered = [];
  for (const mail of mails) {
    const { sender, title, time } = mail;
    for (const match of matches) {
      let passed = true;
      const {
        title: title_match,
        sender: sender_match,
        before: before_match,
        after: after_match
      } = match;
      if (title_match && !title.includes(title_match))
        passed = false;
      if (sender_match && !sender.includes(sender_match))
        passed = false;
      if (before_match && time.getTime() > new Date(before_match).getTime())
        passed = false;
      if (after_match && time.getTime() < new Date(after_match).getTime())
        passed = false;
      if (passed) {
        filtered.push(mail);
        break;
      }
    }
  }
  return filtered;
}
async function delete_mails(page, mails, csrf) {
  return page.evaluate(async ({ mails: mails2, csrf: csrf2 }) => {
    const res = await fetch("https://mailbox.gamer.com.tw/ajax/inboxDel.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `csrfToken=${csrf2}${mails2.map((id) => `&del%5B%5D=${id}`).join("")}`
    });
    return await res.json();
  }, { mails, csrf });
}
export {
  del_mail_default as default
};
