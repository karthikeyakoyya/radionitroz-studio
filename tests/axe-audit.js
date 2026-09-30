const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const axeSource = fs.readFileSync(
  require.resolve("axe-core/axe.min.js"),
  "utf8"
);

const pages = [
  "public/index.html",
  "admin/index.html",
  "legacy/angularjs/index.html",
  "legacy/knockout/index.html",
];

(async () => {
  for (const rel of pages) {
    const full = path.join(__dirname, "..", rel);
    const html = fs.readFileSync(full, "utf8");
    const dom = new JSDOM(html, {
      runScripts: "outside-only",
      resources: "usable",
      url: "http://localhost/" + rel,
    });
    dom.window.eval(axeSource);

    const results = await dom.window.axe.run(dom.window.document, {
      // jsdom has no layout engine, so rules needing real rendering
      // (color contrast, visibility, focus order) cannot run here and are
      // disabled explicitly rather than silently skipped.
      rules: {
        "color-contrast": { enabled: false },
        "focus-order-semantics": { enabled: false },
      },
    });

    console.log("=== " + rel + " ===");
    console.log("Violations: " + results.violations.length);
    results.violations.forEach((v) => {
      console.log("  [" + v.impact + "] " + v.id + ": " + v.help + " (" + v.nodes.length + " node(s))");
    });
    console.log("Passes: " + results.passes.length);
    dom.window.close();
  }
})();
