# Point of Sale Project Roadmap

Last updated: 2026-06-18

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

### POS-203: Ownership checks (10h)
Acceptance criteria:
- Cashier/manager can access only assigned POS data.
- Admin can access all POS data.
- Ownership violations return 403 with clear messages.

### POS-204: Admin-only user management routes (8h)
Acceptance criteria:
- Admin can list users and update role/assignedPos.
- Non-admin requests are blocked with 403.
- Input and id validation follow standard rules.

### POS-205: Authorization tests (6h)
Acceptance criteria:
- Automated tests cover role and ownership positive/negative cases.
- Tests cover at least one protected endpoint per entity group.

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

### POS-304: Category management UI (8h)
Acceptance criteria:
- User can create/edit/delete/list categories.
- Category is selectable and validated by POS context.

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
