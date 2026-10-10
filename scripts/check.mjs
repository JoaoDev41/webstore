import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const root = fileURLToPath(new URL("../", import.meta.url));
const html = readFileSync(resolve(root, "index.html"), "utf8");
execFileSync(process.execPath, ["--check", resolve(root, "script.js")]);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate HTML IDs");
const references = [
  ...html.matchAll(/\b(?:src|href|poster|data-src)="([^"]+)"/g),
].map((match) => match[1]);
for (const reference of references) {
  if (reference.startsWith("#"))
    assert(ids.includes(reference.slice(1)), `Missing anchor: ${reference}`);
  else if (!/^(?:https?:|mailto:|data:)/.test(reference))
    assert(
      existsSync(resolve(root, decodeURIComponent(reference))),
      `Missing asset: ${reference}`,
    );
}
const expected = new Map([
  ["iPhone 17 Pro", "11.499"],
  ["iPhone Air", "10.499"],
  ["iPhone 17", "7.999"],
  ["iPhone 17e", "5.799"],
  ["iPhone 16", "6.799"],
]);
const cards = [
  ...html.matchAll(
    /<article\b[^>]*class="product-card[^>]*>([\s\S]*?)<\/article>/g,
  ),
];
assert.equal(
  cards.length,
  5,
  "Five original models must remain in the catalog",
);
for (const [, card] of cards) {
  const name = card.match(/<h3>(.*?)<\/h3>/)?.[1];
  assert(expected.has(name), `Unexpected model: ${name}`);
  assert(
    card.includes(`R$ ${expected.get(name)}`),
    `Original price changed: ${name}`,
  );
}
console.log(
  `PASS: JavaScript syntax, ${ids.length} unique IDs, ${references.length} local references/anchors, five preserved models and prices.`,
);
