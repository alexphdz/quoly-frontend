# End-to-end tests (Playwright)

**Run:** from `Frontend/`, `npm run test:e2e` (starts or reuses API + Vite via `playwright.config.ts`).

## Auth credentials

Create **`Frontend/.env.e2e.local`** (gitignored). Required variables:

```env
E2E_EMAIL=your-confirmed-supabase-user@example.com
E2E_PASSWORD=your-password
```

Use a Supabase Auth user that can sign in at `/login`. Passwords with `*` or spaces are fine in this file; if you `source` it in bash, quote the password.

Playwright always loads `.env.e2e.local` over stale shell exports.

## Demo workspace screenshots

Docs screenshots (`e2e/design-system/screenshots.spec.ts`) use a **separate** buyer, not the E2E account. Create **`Frontend/.env.demo.local`** (gitignored):

```env
DEMO_EMAIL=your-confirmed-demo-user@example.com
DEMO_PASSWORD=your-password
```

Register via `/register` (or `POST /api/v1/auth/register`), confirm the email in Supabase Auth if required, then seed:

`Backend/.venv/bin/python scripts/seed_demo.py --email <DEMO_EMAIL> --reset`

Capture: `QUOLY_SCREENSHOTS=1 npx playwright test e2e/design-system/screenshots.spec.ts` from `Frontend/`.

**Specs:** `rfq-corrugated-create.spec.ts` (CRE-01, CRE-04). Test plan: `features/rfq-generator/context/qa/test-plan.md`.  
**Commercial RFQ (module 1):** `commercial-rfq-qa.spec.ts` (CR-01).  
**Supplier stages (module 2):** `supplier-stages-qa.spec.ts` (SS-01).  
**Buyer actions (module 4):** `buyer-actions-qa.spec.ts` (BA-01) — seeds via `Backend/scripts/seed_e2e_buyer_action.py` against the same `DATABASE_URL` as the API.  
**Quotation shape (module 5):** `quotation-shape-qa.spec.ts` (QS-01 comparison columns, QS-02 include from quote detail) — `Backend/scripts/seed_e2e_partial_quote.py` (`--status draft|confirmed`).  
**Documents (module 6):** `documents-qa.spec.ts` (DOC-01–03) — fixture `e2e/fixtures/e2e-reference-spec.pdf`.  
**Spec evidence (module 7):** `spec-evidence-qa.spec.ts` (SE-01) — `Backend/scripts/seed_e2e_spec_evidence.py`.  
**Directory cleanup (module 8):** `directory-cleanup-qa.spec.ts` (DIR-01). Legacy full directory flow: `providers-directory.spec.ts`.

**Enum parity:** `npm run enums:check` (Backend `corrugated_enums.py` ↔ Frontend `corrugatedOptions.ts`).
