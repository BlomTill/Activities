#!/usr/bin/env node
/**
 * fix-swissactivities-types.mjs
 *
 * The SwissActivities import wrote nested objects where the Activity
 * schema expects flat strings. This breaks `tsc` and the Vercel build.
 *
 * Patterns to fix in src/data/activities.ts:
 *
 *   subcategory: {"id":"...","title":"X","slug":"...","description":"..."}
 *     → subcategory: "X"
 *
 *   region: {"id":"...","title":"Y"}
 *     → region: "Y"
 *
 *   gallery: [{"alternativeText":"...","caption":"...","url":"X"}, ...]
 *     → gallery: ["X", ...]
 *
 * Idempotent — safe to re-run.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FILE = resolve(ROOT, "src", "data", "activities.ts");

let text = readFileSync(FILE, "utf8");
const before = text.length;

let subcatFixed = 0;
let regionFixed = 0;
let galleryFixed = 0;

// 1. subcategory: {"id":"...","title":"<TITLE>",...}  → subcategory: "<TITLE>"
text = text.replace(
  /subcategory:\s*\{[^{}]*?"title":"([^"]+)"[^{}]*?\}/g,
  (_m, title) => {
    subcatFixed++;
    return `subcategory: ${JSON.stringify(title)}`;
  }
);

// 2. region: {"id":"...","title":"<TITLE>"}  → region: "<TITLE>"
text = text.replace(
  /region:\s*\{[^{}]*?"title":"([^"]+)"[^{}]*?\}/g,
  (_m, title) => {
    regionFixed++;
    return `region: ${JSON.stringify(title)}`;
  }
);

// 3. gallery: [...]  → gallery: ["url1", "url2", ...]
//    Walk the file character by character to find balanced `[...]`
//    starting after `gallery:`. Robust against nested objects, commas,
//    quotes, etc.
function fixGalleries(src) {
  const out = [];
  let i = 0;
  const needle = /gallery:\s*\[/g;
  while (true) {
    needle.lastIndex = i;
    const m = needle.exec(src);
    if (!m) {
      out.push(src.slice(i));
      break;
    }
    // Append everything up to the start of `[`
    const startBracket = m.index + m[0].length - 1; // index of `[`
    out.push(src.slice(i, m.index + "gallery: ".length));
    // Walk to find balanced `]`
    let depth = 0;
    let j = startBracket;
    let inStr = false;
    let escape = false;
    for (; j < src.length; j++) {
      const c = src[j];
      if (escape) { escape = false; continue; }
      if (c === "\\") { escape = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === "[") depth++;
      else if (c === "]") {
        depth--;
        if (depth === 0) { j++; break; }
      }
    }
    const arrText = src.slice(startBracket, j); // includes `[` and `]`
    // Pull urls; tolerate quoted strings already (only top-level objects)
    const urls = [...arrText.matchAll(/"url":"([^"\\]|\\.)+"/g)].map((mm) => {
      // mm[0] = `"url":"..."`; extract the value
      const val = mm[0].slice('"url":"'.length, -1);
      return val.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    });
    galleryFixed++;
    out.push(JSON.stringify(urls));
    i = j;
  }
  return out.join("");
}

text = fixGalleries(text);

writeFileSync(FILE, text);
console.log(`✅ Fixed ${FILE}`);
console.log(`   subcategory objects flattened: ${subcatFixed}`);
console.log(`   region objects flattened:      ${regionFixed}`);
console.log(`   gallery objects flattened:     ${galleryFixed}`);
console.log(`   file size: ${before} → ${text.length} chars`);
