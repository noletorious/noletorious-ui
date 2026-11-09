#!/usr/bin/env node
// Compare tokens/*.json with the last read of the Figma variables (tokens/figma/snapshot.json).
//
//   npm run tokens:figma-diff
//
// Checks every core color (as 0-255 RGB) and every semantic alias in light and dark.
// Figma Starter allows one mode, so light and dark are separate collections there:
// "semantic-light" and "semantic-dark". Exits 1 on any mismatch, missing or extra variable.
//
// The snapshot is refreshed by an agent through the Figma MCP (tokens/figma/read-variables.js).
// This script never calls Figma itself.
import { readFileSync } from 'node:fs'

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const core = read('tokens/core.json').core
const themes = { 'semantic-light': read('tokens/light.json').color, 'semantic-dark': read('tokens/dark.json').color }
const snapshot = read('tokens/figma/snapshot.json')
const figma = snapshot.collections

function hslToRgb255(value) {
  const [h, s, l] = value.match(/[\d.]+/g).map(Number)
  const S = s / 100
  const L = l / 100
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S
  const p = 2 * L - q
  const channel = (t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [channel(h / 360 + 1 / 3), channel(h / 360), channel(h / 360 - 1 / 3)].map((x) => Math.round(x * 255))
}

const problems = []
let checked = 0

// Core: repo `core.blue.53` is Figma `core` collection variable `blue/53`.
const expectedCore = {}
for (const [family, steps] of Object.entries(core)) {
  for (const [step, token] of Object.entries(steps)) expectedCore[`${family}/${step}`] = hslToRgb255(token.$value)
}
for (const [name, rgb] of Object.entries(expectedCore)) {
  checked++
  const got = figma.core?.[name]
  if (!got) problems.push(`core ${name}: missing in Figma`)
  else if (got.join() !== rgb.join()) problems.push(`core ${name}: repo ${rgb} vs Figma ${got}`)
}
for (const name of Object.keys(figma.core ?? {})) {
  if (!expectedCore[name]) problems.push(`core ${name}: in Figma, not in repo`)
}

// Semantic: repo `"{core.blue.53}"` is Figma alias to `blue/53`.
for (const [collection, tokens] of Object.entries(themes)) {
  for (const [name, token] of Object.entries(tokens)) {
    checked++
    const expected = token.$value.replace(/^\{core\.|\}$/g, '').replace('.', '/')
    const got = figma[collection]?.[name]
    if (!got) problems.push(`${collection} ${name}: missing in Figma`)
    else if (got !== expected) problems.push(`${collection} ${name}: repo ${expected} vs Figma ${got}`)
  }
  for (const name of Object.keys(figma[collection] ?? {})) {
    if (!tokens[name]) problems.push(`${collection} ${name}: in Figma, not in repo`)
  }
}

console.log(`Figma file ${snapshot.fileKey}, read ${snapshot.readAt}. Checked ${checked} variables.`)
for (const p of problems) console.log(`  DRIFT  ${p}`)
console.log(problems.length ? `\n${problems.length} difference(s).` : 'No drift.')
process.exit(problems.length ? 1 : 0)
