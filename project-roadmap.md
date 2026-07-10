# Point of Sale Project Roadmap

Last updated: 2026-07-06

## Project Goal
Ship a secure, role-based POS web app where authenticated users can manage POS stores, items, categories, and checkout transactions, then monitor sales through dashboard reporting.

## Current Snapshot
- Architecture: Node.js + Express + MongoDB backend, React + Vite frontend.
- Current strengths: auth foundation exists, core entity models/routes exist, page structure exists in frontend.
- Main gaps: CRUD completion, ownership and RBAC enforcement, transaction flow, test coverage, release readiness.

## Planning Assumptions
- Sprint length: 1 week.
- Team capacity: 35-45 hours per sprint.
- Estimate includes coding, testing, code review, and bug fixes.

## Phase 1: Stabilize Core Backend (Sprint 1, 40h)

### POS-101: Item CRUD hardening (8h) - Completed
Completion date: 2026-06-18
Verification note: Implemented and validated in backend route code; run Postman smoke checks to confirm in environment.

Acceptance criteria:
- Create/list/get by id/update/delete all work.
- Invalid ObjectId returns 400.
- Missing required fields return 400.
- Non-existent valid id returns 404.

### POS-102: Category CRUD hardening with POS linkage (10h) - Completed
Completion date: 2026-06-22
Verification note: Full CRUD implemented in new.category.routes.js with POS linkage validation.

Acceptance criteria:
- Full CRUD works for categories.
- Categories are linked to a specific POS.
- Filtering by POS is supported.
- Invalid and missing data return clear 400 responses.

### POS-103: Standardized API error responses (8h) - Completed
Completion date: 2026-06-22
Verification note: error-handler.js middleware standardizes all errors across all routes.

Acceptance criteria:
- All routes return errors in this shape: { "message": "..." }.
- Status codes are consistent: 400, 401, 403, 404, 500.
- Validation and cast errors no longer leak as generic 500.

### POS-104: Shared validation helpers (8h) - Completed
Completion date: 2026-06-22
Verification note: ObjectId validator middleware implemented in object-id-handler.js; applied in item and category routes.

Acceptance criteria:
- Reusable ObjectId validator middleware/helper exists.
- Reusable required-field validation pattern exists.
- Routes for POS/items/categories/auth apply shared validation.

### POS-105: Backend smoke test collection (6h) - Completed
Completion date: 2026-06-23
Verification note: Smoke collection executed with happy and failure paths; environment variables configured and full run completed within target time.

Acceptance criteria:
- Postman (or equivalent) collection covers happy and failure paths.
- Environment variables include baseUrl, token, posId, itemId, categoryId.
- Full smoke run completes in under 10 minutes.

## Phase 2: Security and Ownership (Sprint 2, 42h)

### RBAC Security Baseline (Step 1) - Confirmed 2026-06-25
Security rules:
- Only admin can create users.
- Only admin can assign roles.
- Manager and cashier do not require assigned POS at all times.
- Admin does not require assigned POS.
- Public sign-up does not allow privileged account creation.

API response rules:
- 400 = invalid input.
- 401 = missing or invalid token.
- 403 = authenticated but not authorized.
- 404 = resource not found.

Token rule:
- JWT payload must include user id, role, and assignedPos.

### User Data Contract (Step 2) - Confirmed 2026-06-25
Contract in User model:
- Role values are exactly: admin, manager, cashier.
- assignedPos field exists and is optional (default null).
- Legacy behavior defaults: role is cashier, assignedPos is null.

### POS-201: Add role and assigned POS to user (8h)
Acceptance criteria:
- User model includes role enum: admin, manager, cashier.
- User model includes assignedPos reference.
- Existing users remain usable after migration/update.

### POS-202: JWT payload and role middleware (10h) - Completed
Completion date: 2026-06-25
Verification note: JWT payload includes user id and role (plus assignedPos), role middleware is implemented and applied to protected routes, and unauthorized role access returns 403.

Acceptance criteria:
- JWT includes user id and role.
- Middleware supports role checks by route.
- Unauthorized role access returns 403.

### POS-203: Ownership checks (10h) - Completed
Completion date: 2026-07-04
Verification note: Ownership restrictions validated with POS-203 smoke and integration coverage; manager/cashier are limited to assigned POS data and admin retains cross-POS access.

Acceptance criteria:
- Cashier/manager can access only assigned POS data.
- Admin can access all POS data.
- Ownership violations return 403 with clear messages.

mar### POS-204: Admin user management full CRUD (12h) - Completed
Completion date: 2026-07-07
Verification note: Backend routes fully implemented with all guardrails; frontend pages complete with professional styling and full CRUD UI.

Acceptance criteria:
- ✅ Admin can list users, get user by id, create users, update role/assignedPos, and delete users.
- ✅ Non-admin requests are blocked with 403 on all admin user endpoints.
- ✅ Input and id validation follow standard rules.
- ✅ Self-delete and deleting the last admin account are blocked.
- ✅ Frontend admin users page supports full CRUD with clear loading/error/success states.

### POS-205: Authorization tests (6h)
Acceptance criteria:
- Automated tests cover role and ownership positive/negative cases.
- Tests cover at least one protected endpoint per entity group.

### POS-206: Admin user management test matrix (6h)
Acceptance criteria:
- Automated tests cover admin user CRUD success and failure scenarios.
- Tests include non-admin access denied (403), invalid id (400), missing data (400), and not found (404).
- Tests include guardrails for self-delete and last-admin delete constraints.

## Phase 3: POS and Catalog UI (Sprint 3, 44h)

### POS-301: Complete POS backend management (10h)
Acceptance criteria:
- POS update and delete routes are implemented.
- Endpoint to list current user POS records exists.
- Ownership and role checks are enforced.

### POS-302: Frontend API service layer (8h)
Acceptance criteria:
- Centralized axios client handles token, refresh behavior (if added later), and normalized errors.
- API modules for auth, POS, items, categories are unified.

### POS-303: Item management UI (10h)
Acceptance criteria:
- User can create/edit/delete/list items.
- Form validation mirrors backend constraints.
- UI updates correctly after mutations.

### POS-304A: Embedded categories in POS creation flow (8h)
Acceptance criteria:
- Create POS page supports adding/removing category rows before submit.
- POS is created first, then categories are created automatically using returned POS id.
- User is not required to manually enter POS id for category creation.
- Partial failure states are surfaced clearly and allow retry.

### POS-304B: Category management UI (maintenance mode) (6h)
Acceptance criteria:
- Categories page is used for edit/delete/list and filtering only.
- Category create action remains available for maintenance but defaults POS context from selected/store context.
- Category operations enforce role and POS ownership constraints.

### POS-305: Role-based UI visibility and route guards (8h)
Acceptance criteria:
- UI actions are shown/hidden per role.
- Direct navigation to unauthorized routes is blocked.

## Phase 4: Checkout and Transactions (Sprint 4, 42h)

### POS-401: Transaction data model and APIs (12h)
Acceptance criteria:
- Transaction schema includes POS, cashier, line items, totals, payment method, timestamp.
- Create and list endpoints are implemented and protected.

### POS-402: Checkout page flow (12h)
Acceptance criteria:
- Cashier can add/remove/update cart items.
- Totals (subtotal/tax/total) are computed accurately.
- Successful checkout persists transaction and resets cart.

### POS-403: Inventory consistency (8h)
Acceptance criteria:
- If stock is tracked, checkout enforces stock limits.
- Sale write operation is consistent and failure-safe.

### POS-404: Checkout integration tests (10h)
Acceptance criteria:
- Tests cover valid checkout, invalid payload, auth failures.
- One full login to checkout flow is validated.

## Phase 5: Reporting and Release (Sprint 5, 38h)

### POS-501: Reporting APIs (10h)
Acceptance criteria:
- Daily and weekly totals endpoint.
- Top-selling items endpoint.
- Date range and POS filters.

### POS-502: Dashboard widgets (10h)
Acceptance criteria:
- Dashboard shows revenue, transaction count, top items.
- Loading, empty, and error states are clear.

### POS-503: Test suite expansion and CI baseline (10h)
Acceptance criteria:
- Automated tests cover auth, POS, items, categories, transactions.
- CI (or local equivalent) fails on test failures.

### POS-504: Production readiness docs (8h)
Acceptance criteria:
- Environment variable and setup documentation is complete.
- Deployment and rollback checklist is documented.

## Dependency Order (Do Not Break)
1. Backend contracts for categories/items/POS.
2. Validation and error standardization.
3. RBAC and ownership.
4. Frontend management screens.
5. Transactions and checkout.
6. Reporting.
7. Final hardening and release.

## Immediate 2-Week Execution Plan

### Week 1
1. Finish category CRUD and POS association.
2. Add item update/delete and category reference on items.
3. Introduce shared id/payload validation utilities.
4. Standardize error responses across auth/item/category routes.

### Week 2
1. Add User role and assignedPos fields.
2. Add role-based middleware and ownership checks.
3. Protect existing POS/item/category routes.
4. Build authorization test matrix and smoke regression run.

## Next Implementation Sequence (Updated)
1. ✅ POS-204 COMPLETE: admin user management full CRUD (backend + frontend).
2. Refactor create POS page to embed category creation in the same flow.
3. Keep categories page for maintenance actions (edit/delete/list) with POS context defaults.
4. Add POS-206 test coverage for admin user CRUD and edge-case guardrails.
5. Add POS-205 authorization test matrix for role and ownership checks.

## Sprint Rebalance (From POS-204 Onward)
Use this allocation as the execution source of truth for upcoming work. It keeps each sprint within the 35-45 hour capacity target.

### Sprint 3 (42h)
1. ✅ POS-204 (Completed 2026-07-07) - freed 16h capacity
2. POS-206 admin user management test matrix - 6h
3. POS-302 frontend API service layer - 8h
4. POS-305 role-based UI visibility and route guards - 8h
5. Category/POS flow refactoring and integration - 10h
6. Stabilization and bug-fix buffer - 4h

### Sprint 4 (40h)
1. POS-301 complete POS backend management - 10h
2. POS-304A embedded categories in POS creation flow - 8h
3. POS-304B categories maintenance UI (edit/delete/list) - 6h
4. POS-303 item management UI - 10h
5. Integration polish and regression buffer - 6h

### Sprint 5 (42h)
1. POS-401 transaction data model and APIs - 12h
2. POS-402 checkout page flow - 12h
3. POS-403 inventory consistency - 8h
4. POS-404 checkout integration tests - 10h

### Sprint 6 (38h)
1. POS-501 reporting APIs - 10h
2. POS-502 dashboard widgets - 10h
3. POS-503 test suite expansion and CI baseline - 10h
4. POS-504 production readiness docs - 8h

## Definition of Done
- Endpoint has validation, auth checks, ownership checks, and consistent error shape.
- Frontend feature is connected to live API and handles loading/error/empty states.
- Feature includes at least one regression test path.
- README or docs updated if route contracts changed.

## Key Risks and Mitigations
- Risk: Route contract drift breaks frontend.
Mitigation: Freeze response contracts after Phase 1 and document changes.

- Risk: Role/ownership bugs expose cross-POS data.
Mitigation: Build explicit authorization matrix tests before expanding UI scope.

- Risk: Checkout complexity delays reporting.
Mitigation: Ship transaction capture first, then layer stock enforcement as incremental work.
