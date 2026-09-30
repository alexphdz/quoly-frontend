#!/usr/bin/env node
// Fails if the locale JSON files don't share the exact same set of keys.
// Run with: node scripts/check-i18n-parity.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales')
const BASE = 'en'

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value && typeof value === 'object' ? flatten(value, path) : [path]
  })
}

function keysFor(locale) {
  const dir = join(root, locale)
  const keys = new Set()
  for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const ns = file.replace(/\.json$/, '')
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    for (const k of flatten(json)) keys.add(`${ns}:${k}`)
  }
  return keys
}

const locales = readdirSync(root)
const base = keysFor(BASE)
let failed = false

for (const locale of locales) {
  if (locale === BASE) continue
  const other = keysFor(locale)
  const missing = [...base].filter(k => !other.has(k))
  const extra = [...other].filter(k => !base.has(k))
  if (missing.length || extra.length) {
    failed = true
    console.error(`\n[${locale}] does not match [${BASE}]`)
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`)
    if (extra.length) console.error(`  extra:   ${extra.join(', ')}`)
  }
}

if (failed) {
  console.error('\ni18n key parity check FAILED')
  process.exit(1)
}
console.log('i18n key parity OK')
