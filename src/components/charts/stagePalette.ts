// RFQ stage chart palette — Graphite + Ice Blue.
// The old brand-blue ramp migrated into the new Ice family; genuine category
// hues (attention amber, quote green, declined red, neutral grey) kept as
// semantic meaning but aligned to the editorial palette. Mid-tones chosen to
// read on both light and dark canvases.
export const STAGE_COLORS: Record<string, string> = {
  buyer_action_required: '#cc9a3f', // attention amber
  partial_response: '#9cc6d4',      // light ice
  quote_received: '#4f8a6d',        // success green
  awaiting_response: '#4e7f90',     // deep ice
  not_contacted: '#c6ccca',         // neutral
  declined: '#b9635b',              // danger red
  closed: '#969d9f',                // muted neutral
  pending: '#c6ccca',               // neutral
  requested: '#4e7f90',             // deep ice
  quoted: '#4f8a6d',                // success green
}

export const MIX_COLORS = {
  open: '#356b7c',    // ice ink
  draft: '#9cc6d4',   // light ice
  closed: '#c6ccca',  // neutral
} as const
