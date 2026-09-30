#!/usr/bin/env node
/**
 * Compare Backend corrugated StrEnum values with Frontend constants/corrugatedOptions.ts.
 * Run: npm run enums:check
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(frontendRoot, '..')
const backendRoot = join(repoRoot, 'Backend')
const python = join(backendRoot, '.venv', 'bin', 'python')
const exporter = join(backendRoot, 'scripts', 'export_corrugated_enums.py')
const tsPath = join(frontendRoot, 'src', 'constants', 'corrugatedOptions.ts')

/** Python StrEnum class name → TS `export const` array name */
const PY_TO_TS = {
  BoxStyle: 'BOX_STYLES',
  WallConstruction: 'WALL_CONSTRUCTIONS',
  FluteProfile: 'FLUTE_PROFILES',
  StrengthMetricType: 'STRENGTH_METRIC_TYPES',
  StrengthUnit: 'STRENGTH_UNITS',
  FoodContact: 'FOOD_CONTACT_OPTIONS',
  SubstitutionPolicy: 'SUBSTITUTION_POLICIES',
  PrintMethod: 'PRINT_METHODS',
  ClosureMethod: 'CLOSURE_METHODS',
  DimensionBasis: 'DIMENSION_BASES',
  DimensionUnit: 'DIMENSION_UNITS',
  DefaultCurrency: 'DEFAULT_CURRENCIES',
  VolumeTierUnit: 'VOLUME_TIER_UNITS',
  IncotermRule: 'INCOTERM_RULES',
  Fragility: 'FRAGILITY_OPTIONS',
  StackingScenario: 'STACKING_SCENARIOS',
  ShippingMode: 'SHIPPING_MODES',
  ProductWeightUnit: 'PRODUCT_WEIGHT_UNITS',
  GrossWeightUnit: 'GROSS_WEIGHT_UNITS',
  PreferredResponseFormat: 'PREFERRED_RESPONSE_FORMATS',
  AttachmentKind: 'CORRUGATED_ATTACHMENT_KINDS',
  ResponseFieldKey: 'ALL_RESPONSE_FIELD_KEYS',
}

function loadBackendEnums() {
  if (!existsSync(python)) {
    console.error(`Missing Backend venv Python: ${python}`)
    console.error('Run: cd Backend && python -m venv .venv && pip install -r requirements.txt')
    process.exit(1)
  }
  const result = spawnSync(python, [exporter], {
    cwd: backendRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  })
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || 'Failed to export backend enums')
    process.exit(1)
  }
  return JSON.parse(result.stdout)
}

function extractTsConstArray(source, exportName) {
  const re = new RegExp(
    `export const ${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`,
    'm',
  )
  const match = source.match(re)
  if (!match) {
    return null
  }
  const inner = match[1]
  const values = []
  for (const m of inner.matchAll(/'([^']+)'|"([^"]+)"/g)) {
    values.push(m[1] ?? m[2])
  }
  // Handle spread: ...REQUIRED_RESPONSE_FIELD_KEYS, ...OPTIONAL_RESPONSE_FIELD_KEYS
  if (inner.includes('...')) {
    return null
  }
  return values
}

function extractAllResponseFieldKeys(source) {
  const required = extractTsConstArray(source, 'REQUIRED_RESPONSE_FIELD_KEYS')
  const optional = extractTsConstArray(source, 'OPTIONAL_RESPONSE_FIELD_KEYS')
  if (!required || !optional) {
    throw new Error('Could not parse REQUIRED_RESPONSE_FIELD_KEYS / OPTIONAL_RESPONSE_FIELD_KEYS')
  }
  return [...required, ...optional]
}

function sortedSet(values) {
  return [...values].sort()
}

function diffSets(label, backend, frontend) {
  const b = new Set(backend)
  const f = new Set(frontend)
  const missingInFrontend = backend.filter(v => !f.has(v))
  const extraInFrontend = frontend.filter(v => !b.has(v))
  if (!missingInFrontend.length && !extraInFrontend.length) {
    return true
  }
  console.error(`\n${label}`)
  if (missingInFrontend.length) {
    console.error(`  missing in Frontend: ${missingInFrontend.join(', ')}`)
  }
  if (extraInFrontend.length) {
    console.error(`  extra in Frontend:   ${extraInFrontend.join(', ')}`)
  }
  return false
}

const backend = loadBackendEnums()
const tsSource = readFileSync(tsPath, 'utf8')

let ok = true
for (const [pyName, tsName] of Object.entries(PY_TO_TS)) {
  const pyValues = backend[pyName]
  if (!pyValues) {
    console.error(`Backend export missing class: ${pyName}`)
    ok = false
    continue
  }
  let tsValues
  if (tsName === 'ALL_RESPONSE_FIELD_KEYS') {
    tsValues = extractAllResponseFieldKeys(tsSource)
  } else {
    tsValues = extractTsConstArray(tsSource, tsName)
  }
  if (!tsValues?.length) {
    console.error(`Could not parse Frontend export const ${tsName}`)
    ok = false
    continue
  }
  if (!diffSets(`${pyName} ↔ ${tsName}`, sortedSet(pyValues), sortedSet(tsValues))) {
    ok = false
  }
}

if (!ok) {
  console.error('\ncorrugated enum parity check FAILED')
  console.error('Update Backend/app/schemas/corrugated_enums.py and Frontend/src/constants/corrugatedOptions.ts together.')
  process.exit(1)
}

console.log(`corrugated enum parity OK (${Object.keys(PY_TO_TS).length} lists)`)
