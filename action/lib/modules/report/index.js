// src/modules/report/index.ts
import { convert as html_to_text } from "html-to-text";
import markdownIt from "markdown-it";
import TurndownService from "turndown";

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

// src/modules/report/index.ts
var md = markdownIt();
var td = new TurndownService({ headingStyle: "atx" });
var DEFAULT_CONFIG = {
  title: "\u5DF4\u54C8\u81EA\u52D5\u5316\uFF01 \u5831\u544A $time$",
  ignore: ["login", "logout", "report"],
  only_failed: false
};
var report_default = {
  name: "Report",
  description: "\u5831\u544A",
  async run({ params, shared, logger }) {
    const config = Object.assign({}, DEFAULT_CONFIG, JSON.parse(JSON.stringify(params)));
    if (typeof config.ignore === "string")
      config.ignore = config.ignore.split(",");
    logger.log("DONE");
    const reports = {};
    return {
      title: template(config.title),
      reports,
      text: () => text(reports, config),
      markdown: () => markdown(reports, config),
      html: () => html(reports, config)
    };
  }
};
async function text(reports, config) {
  const { html: html2 } = await normalize(reports, config);
  const text2 = html_to_text(html2).replace(/\n\n\n+/g, "\n\n");
  return config.only_failed && !text2.includes("\u274C") ? "" : text2;
}
async function markdown(reports, config) {
  const { markdown: markdown2 } = await normalize(reports, config);
  return config.only_failed && !markdown2.includes("\u274C") ? "" : markdown2;
}
async function html(reports, config) {
  const { html: html2 } = await normalize(reports, config);
  return config.only_failed && !html2.includes("\u274C") ? "" : html2;
}
async function normalize(reports, config) {
  let report = "";
  report += `# ${config.title}

`;
  for (const module in reports) {
    if (config.ignore.includes(module))
      continue;
    if (!reports[module])
      continue;
    report += `## ${module}
`;
    const module_report = reports[module];
    if (typeof module_report === "string") {
      report += module_report + "\n";
    } else if (typeof module_report === "function") {
      report += await module_report() + "\n";
    }
  }
  const raw_md = template(report);
  const html2 = md.render(raw_md, {
    html: true,
    linkify: true,
    typographer: true
  });
  const markdown2 = td.turndown(html2);
  return { html: html2, markdown: markdown2 };
}
export {
  report_default as default
};
