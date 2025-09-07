#!/usr/bin/env node
/** Simple engine check to help avoid odd npm tarball errors on older Node/npm. */
const currentNode = process.versions.node; // e.g., "18.20.8"

function parse(v) {
  const [maj, min, patch] = v.split(".").map((n) => parseInt(String(n).replace(/[^0-9]/g, ""), 10) || 0);
  return { maj, min, patch };
}
function cmp(a, b) {
  if (a.maj !== b.maj) return a.maj - b.maj;
  if (a.min !== b.min) return a.min - b.min;
  return a.patch - b.patch;
}
function gte(a, b) { return cmp(parse(a), parse(b)) >= 0; }
function lt(a, b) { return cmp(parse(a), parse(b)) < 0; }

const min = "18.20.0";
const nextMajor = "19.0.0";

function fail(msg) {
  console.error(`\n[engines] ${msg}\n`);
  process.exit(1);
}

if (!gte(currentNode, min)) {
  fail(`Node ${currentNode} detected. Please use Node >= ${min}.`);
}
if (!lt(currentNode, nextMajor)) {
  console.warn(`\n[engines] Node ${currentNode} detected. Project is tested on Node 18 LTS.`);
}

// Optional: warn for very old npm
try {
  const cp = require("child_process");
  const npmVersion = cp.execSync("npm -v").toString().trim();
  const npmMajor = parseInt(npmVersion.split(".")[0], 10) || 0;
  if (npmMajor < 9) {
    console.warn(`[engines] npm ${npmVersion} detected. Recommend npm >= 9 for best compatibility.`);
  }
} catch {}
