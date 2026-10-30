# Redesign Gap Implementation Plan

Reviewed: 2026-10-29  
Scope: the three backend or behavior gaps recorded in `ReDesign/REDESIGN_STATUS.md`, with the product decisions made in this session.

## Approved decisions

| Gap | Decision | Consequence |
|---|---|---|
| Phase 06 — technical evidence verdict | Keep the matrix read-only and accept the prototype difference. | No verdict mutation endpoint or frontend editing controls. Preserve the computed verdict and evidence response. |
| Phase 07 — award and request status | Treat `decided` as a closed request. | Preserve the backend's existing `decided` transition; make every frontend surface present it as closed and prevent further request editing. This decision overrides the prototype's “closing is separate from awarding” behavior. |
| Phase 09 — supplier request count and history | Add a supplier history endpoint. | Return the linked RFQs and their participation state, then use this response in the supplier directory and supplier detail page. |

## Findings from the Backend review

- `Supplier.supplier_company_id` already links an RFQ supplier record to `SupplierCompany`; it is nullable for manually entered or older records. No new table is needed for linked history.
- `GET /api/v1/suppliers/{supplier_id}` is owner-scoped, but `SupplierCompanyRead` does not contain request counts or history. `GET /api/v1/rfqs` returns request summaries without supplier associations; `GET /api/v1/rfqs/{rfq_id}` includes them, which would require one request-detail fetch per RFQ to build supplier history.
- The association query must scope both the supplier company and RFQs to the authenticated user. Do not infer an association from email alone: a contact email is not a stable, unambiguous company-to-RFQ link.
- `create_decision` already sets `RFQ.status = "decided"`; backend tests assert that status. Mailbox background services also skip decided RFQs. No backend status behavior change is needed for the selected decision.
- Frontend helpers and most request tabs already bucket `decided` as closed. `OverviewTab` currently makes the reference specification read-only only for status `closed`; it must also treat `decided` as closed. Audit other status badges and edit actions for the same inconsistency.
- Technical evidence is currently computed by `GET /quotes/{quote_id}/spec-evidence`; there is no persistence path for a manual verdict. That remains intentional under the selected decision.

## Implementation sequence

### 1. Align Phase 07 with the approved closed-state decision

**Repository:** Frontend.  
**Backend changes:** none expected.

1. Audit all `decided` and `closed` handling in request lists, dashboard counts, request detail tabs, comparison, quote review, and reference-spec editing.
2. Ensure `decided` is consistently shown as a closed request in status labels, filters, and supplier-history state labels. Keep the award outcome and award date visible in the comparison/decision record.
3. Ensure all request mutations and editing affordances are disabled for decided requests. At minimum, update `OverviewTab`'s reference-spec `readOnly` condition to include `decided` and render supplier questions as read-only without generating reply suggestions or allowing replies/resolution actions.
4. Add or update focused tests for status bucketing and read-only behavior. Keep the existing backend contract that a successful award changes the status to `decided`.

**Acceptance criteria**

- A decided request appears in the closed bucket and is labeled closed in both locales.
- No request editing or reference-spec mutation remains available after the decision is recorded.
- The decision record still identifies the awarded quote and supplier.
- Existing backend decision tests continue to pass unchanged.

### 2. Add supplier request history in the Backend

**Proposed route:** `GET /api/v1/suppliers/{supplier_id}/rfqs` (final naming can follow the router convention).  
**Database migration:** none expected for the response itself.

1. Add response schemas for a supplier-history item and its collection. Each item should include the minimum data needed by the approved screen: RFQ ID, product/request name, RFQ status, supplier participation status, and useful dates (`created_at` and `requested_at` where available). The collection should include a total count.
2. Add an aggregated `rfq_count` to supplier directory list results so the directory can show counts without issuing one history request per supplier. Keep the detail-history endpoint for per-supplier request rows; do not fetch detail history for every supplier in the list.
3. Add a service query joining `Supplier` to `RFQ` by `rfq_id`, selecting rows with the requested `supplier_company_id`, and enforcing `SupplierCompany.user_id == current_user.id` and `RFQ.user_id == current_user.id`.
4. Return 404 for a supplier company not owned by the caller. Return an empty collection and count zero when the owned supplier has no linked RFQs. Include archived suppliers' history.
5. Return one history item per RFQ. Since the schema permits multiple supplier rows for one company on one RFQ, define and test a deterministic stage aggregation/precedence instead of duplicating that request in the UI.
6. Order history newest first. Keep RFQ status values canonical (`draft`, `open`, `decided`); the frontend maps `decided` to the approved closed label.
7. Identify existing RFQ supplier rows with a null company link. Exclude them from company history unless a safe, unambiguous backfill rule is approved; do not silently associate by email.
8. Add API tests for linked rows, count, empty history, status/date fields, deduplication, archived companies, ownership isolation, and non-owned supplier IDs.

**Acceptance criteria**

- The endpoint returns all and only RFQs linked to a supplier company owned by the caller.
- The list response includes an aggregate count, and the detail endpoint includes enough fields to render related requests without fetching each RFQ separately.
- No email-based guesswork or cross-user RFQ data is exposed.
- Backend tests cover the endpoint's response and isolation behavior.

### 3. Connect supplier history in the Frontend

1. Add typed client and query-hook support for the new endpoint.
2. Show each supplier's related-RFQ count in the directory (desktop and mobile layouts).
3. Add the related-requests section to supplier detail, including loading, error/retry, and empty states. Show participation and request status, and link each row to `/rfqs/{rfq_id}`.
4. Map supplier stages through the existing i18n vocabulary and map `decided` to the closed label selected for Phase 07. Preserve history when a supplier is archived.
5. Add EN/ES translations and update supplier page/e2e coverage.

**Acceptance criteria**

- Directory counts match the endpoint total, including on mobile.
- Supplier detail shows one row per related request, with an accurate stage and closed/open state.
- Selecting a history row opens the matching request.
- Loading, empty, and API error states are usable and localized.

### 4. Close the accepted Phase 06 gap without expanding scope

1. Keep technical verdicts read-only; do not add a PATCH endpoint or database override model.
2. Verify that the frontend exposes no control that implies verdict changes are persisted.
3. Record the accepted prototype difference in release notes or the redesign decision log when the supplier-history work is shipped.

## Verification plan

- Backend: focused supplier-directory API tests, existing decision tests, and the full relevant pytest selection before calling the backend work complete.
- Frontend: `npx tsc -b`, `npx oxlint` on changed files, `npm run -s i18n:check`, build, and supplier/request Playwright coverage.
- Visual review: supplier directory and supplier detail at desktop and mobile sizes, with linked, empty, loading, and error states; request detail after an award.
- Update the Backend feature tracking documents required by its `AGENTS.md` when implementation begins. This plan was written in Frontend because this session has write access only to that repository.

## Out of scope

- Making technical evidence verdicts editable.
- Guessing historical supplier associations from email addresses.
- Changing the backend's existing `decided` transition.
- Adding unrelated supplier or award workflow features.

## Implementation status — 2026-10-29

- **Phase 06:** accepted as read-only; no manual verdict mutation was introduced.
- **Phase 07:** awarded requests (`decided`) are treated as closed in the remaining specification and supplier-question surfaces. Supplier questions no longer offer reply generation, editing, or resolution actions after award.
- **Phase 09:** Backend returns `rfq_count` in the directory list and provides owner-scoped related RFQ history with deterministic per-request stage aggregation. Frontend shows counts in desktop/mobile directory layouts and a localized history section on supplier detail.
- **Verification:** relevant Backend suite passed (34 tests); Frontend TypeScript, scoped lint, and i18n checks passed. Focused desktop/mobile browser captures were reviewed.
- **Still pending:** dedicated browser E2E for the new history and awarded read-only flow, full build/full lint, and deployment/QA rollout.
