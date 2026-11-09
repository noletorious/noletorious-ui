#!/usr/bin/env node
// WCAG 2.1 contrast check for the design tokens, light and dark.
//
//   npm run contrast                         check the library tokens
//   npm run contrast -- --brand ../app/src/brand.css   also apply an app's accent overrides
//
// Text pairs need 4.5:1. UI boundaries (input border, focus ring) need 3:1.
// Exits 1 if any pair fails.
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const brandFiles = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--brand' && args[i + 1]) brandFiles.push(args[++i])
}

const TEXT = 4.5
const UI = 3.0

// [foreground token, background token, minimum ratio, label]
const PAIRS = [
  ['foreground', 'background', TEXT, 'text on page'],
  ['foreground', 'card', TEXT, 'text on card'],
  ['card-foreground', 'card', TEXT, 'card text'],
  ['popover-foreground', 'popover', TEXT, 'menu text'],
  ['muted-foreground', 'background', TEXT, 'muted text on page'],
  ['muted-foreground', 'card', TEXT, 'muted text on card'],
  ['muted-foreground', 'muted', TEXT, 'muted text on muted'],
  ['primary-foreground', 'primary', TEXT, 'primary button text'],
  ['secondary-foreground', 'secondary', TEXT, 'secondary button text'],
  ['accent-foreground', 'accent', TEXT, 'accent text'],
  ['destructive-foreground', 'destructive', TEXT, 'destructive text'],
  ['primary', 'background', TEXT, 'link text'],
  ['input', 'background', UI, 'input border on page'],
  ['input', 'card', UI, 'input border on card'],
  ['ring', 'background', UI, 'focus ring on page'],
  ['ring', 'card', UI, 'focus ring on card'],
]

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function declarations(block) {
  const out = {}
  for (const match of block.matchAll(/--color-([a-z-]+)\s*:\s*([^;]+);/g)) {
    out[match[1]] = match[2].trim()
  }
  return out
}

// Light tokens come from @theme / :root blocks, dark overrides from .dark blocks.
function parseTokens(css) {
  const clean = stripComments(css)
  const light = {}
  const dark = {}
  for (const m of clean.matchAll(/(?:@theme(?:\s+static)?|:root)\s*\{([^}]*)\}/g)) {
    Object.assign(light, declarations(m[1]))
  }
  for (const m of clean.matchAll(/\.dark\s*\{([^}]*)\}/g)) {
    Object.assign(dark, declarations(m[1]))
  }
  return { light, dark }
}

function hslToRgb(value) {
  const m = value.match(/^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/)
  if (!m) throw new Error(`Unsupported color "${value}". Use hsl(H S% L%).`)
  const h = Number(m[1]) / 360
  const s = Number(m[2]) / 100
  const l = Number(m[3]) / 100
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)]
}

function luminance([r, g, b]) {
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function ratio(a, b) {
  const la = luminance(hslToRgb(a))
  const lb = luminance(hslToRgb(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const base = parseTokens(readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'))
let light = { ...base.light }
let dark = { ...base.light, ...base.dark }

for (const file of brandFiles) {
  const brand = parseTokens(readFileSync(file, 'utf8'))
  light = { ...light, ...brand.light }
  dark = { ...dark, ...brand.dark }
}

let failures = 0
for (const [name, tokens] of [['light', light], ['dark', dark]]) {
  console.log(`\n${name.toUpperCase()}`)
  for (const [fg, bg, min, label] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      console.log(`  ??  ${label.padEnd(24)} missing token ${!tokens[fg] ? fg : bg}`)
      failures++
      continue
    }
    const r = ratio(tokens[fg], tokens[bg])
    const ok = r >= min
    if (!ok) failures++
    console.log(
      `  ${ok ? 'ok' : 'FAIL'}  ${label.padEnd(24)} ${r.toFixed(2).padStart(5)}:1  (needs ${min}:1)  ${fg} on ${bg}`
    )
  }
}

console.log(failures ? `\n${failures} failing pair(s).` : '\nAll pairs pass.')
process.exit(failures ? 1 : 0)
