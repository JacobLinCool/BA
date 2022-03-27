// src/modules/issue/index.ts
import github from "@actions/github";
import { Octokit } from "@octokit/core";

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

// src/modules/issue/index.ts
var octokit;
var context;
var DEFAULT_LABELS = ["\u81EA\u52D5\u5316\u5831\u544A"];
var issue_default = {
  name: "GitHub Issue \u901A\u77E5",
  description: "\u767C\u9001 GitHub Issue \u901A\u77E5",
  async run({ shared, params, logger }) {
    if (!shared.report) {
      logger.error("\u8ACB\u8A2D\u5B9A report \u6A21\u7D44");
      return;
    }
    if (!params.pat) {
      logger.error("\u8ACB\u8A2D\u5B9A GitHub Personal Access Token (pat)");
      return;
    }
    if ((await shared.report.text()).length == 0) {
      logger.log("\u6C92\u6709\u5831\u544A\u5167\u5BB9");
      return;
    }
    const labels = [...DEFAULT_LABELS, ...params.labels];
    octokit = new Octokit({ auth: params.gh_pat });
    context = github.context;
    if (shared.issue && shared.issue.number) {
      await updateIssue(shared.issue.number, shared.report).then(() => {
        logger.log("Report Updated.");
      });
      return shared.issue;
    } else {
      const res = await createIssue(shared.report, labels);
      if (res && res.data && res.data.number)
        logger.log(`Report: https://github.com/${context.repo.owner}/${context.repo.repo}/issues/${res.data.number}`);
      return { number: res.data.number };
    }
  }
};
async function createIssue(report, labels) {
  return await octokit.request("POST /repos/{owner}/{repo}/issues", {
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: report.title,
    body: await report.markdown(),
    labels: labels.map((x) => template(x.trim()))
  });
}
async function updateIssue(number, report) {
  return await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: number,
    body: await report.markdown()
  });
}
export {
  issue_default as default
};
