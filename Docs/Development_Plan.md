# Granular Development Plan & Implementation Roadmap

This plan establishes a clear, step-by-step engineering roadmap for building **Zio Tech GRC** based on our confirmed architectural decisions.

---

## Phase 1: Backend Foundation & Identity Layer (Express + Prisma + Neon DB + Auth)

### Milestone 1: Monorepo Backend Scaffolding
- Initialize the `/backend` directory with Express.js, TypeScript, and standard development tooling (`tsx`/`ts-node-dev`).
- Configure TypeScript (`tsconfig.json`), ESLint, Prettier, and environment variable validation using `dotenv` and `zod`.
- Set up Prisma ORM with Neon DB (Serverless PostgreSQL) connection pooling (`DATABASE_URL` and `DIRECT_URL`), and generate baseline migrations from [Schema.md](file:///c:/Users/ADMIN/Desktop/Zio%20Tech%20GRC/Docs/Schema.md).
- Establish singleton `prisma` client service, global Express error handling middleware, and Zod request validation middlewares (`validateBody`, `validateQuery`).

### Milestone 2: Identity & Authentication Module
- Implement password hashing with `argon2`.
- Build JWT authentication module (`auth.router.ts`, `auth.controller.ts`, `auth.service.ts`, `authenticate` middleware).
- Implement short-lived Access Tokens (Authorization header) + Rotating Refresh Tokens (`httpOnly` cookies via `cookie-parser`).
- Implement User registration, login, profile retrieval (`GET /auth/me`), and Org Admin direct user creation (email + password provisioning).
- Implement `req.user` context injection and role authorization middleware (`requireRole`, `requireOrgRole`).

---

## Phase 2: Tenancy, CRM & 4-Team Project Collaboration

### Milestone 3: Multi-Tenant Boundary & Organization Module
- Create `organization.router.ts`, controller, and service with Prisma CRUD operations.
- Implement `tenantMiddleware` to enforce strict `orgId` tenant scoping across all entity operations.
- Implement Organization member management for inviting and managing firm staff with `OWNER`, `ADMIN`, `AUDITOR` roles.

### Milestone 4: EntityCRM & Reusable Directory
- Implement `EntityCrmModule` with isolation by `orgId`.
- Support entity typing (`CLIENT`, `AUDITEE`), contact info, and directory search.

### Milestone 5: Project & 4-Team Assembly Module
- Build `ProjectModule` with soft delete support.
- Implement `ProjectDepartmentModule` allowing Client Team 2 to define functional units (Marketing, Sales, Engineering, IT, Legal, etc.).
- Build batch member assignment to the 4 collaborative team buckets (`ORG_TEAM_1`, `ORG_TEAM_2`, `CLIENT_TEAM_1`, `CLIENT_TEAM_2`) linked to departments.

---

## Phase 3: Work Breakdown Structure (ToR) & DRT Ticketing Engine

### Milestone 6: Hierarchical ToR (Terms of Reference) Tree
- Build `TorModule` supporting infinite self-referencing hierarchy (`parentId`, `code`, `title`, `sortOrder`).
- Implement recursive tree fetch endpoint (`GET /projects/:id/tors/tree`) and branch reordering.
- Implement stream weight allocation per ToR node (`TorStreamWeight`).

### Milestone 7: Data Request Tracking (DRT) Engine
- Build `DrtTicketModule` managing human-readable request codes (e.g., `M1001`, `L1001`).
- Implement many-to-many junction mapping between tickets and ToRs (`DRTTicketToR`).
- Route tickets to specific team buckets and departments with due date tracking and automated `excessDays` calculation.
- Support lifecycle transitions (`OPEN` → `SUBMITTED` → `REVISION_REQUESTED` → `ACCEPTED`) and auditor review outcomes (`PENDING`, `PARTIAL`, `DONE`, `NOT_AVAILABLE`, `NOT_APPLICABLE`).

### Milestone 8: Cloudflare R2 Polymorphic Storage & Submissions
- Implement `StorageModule` integrating Cloudflare R2 via `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
- Presigned upload URL generation with MIME validation, file size limits (100MB), and SHA-256 integrity verification.
- Implement `DRTSubmission` versioning and file attachment associations.
- Implement `DRTCommentModule` supporting client-auditor threads and auditor-only internal notes.

---

## Phase 4: Mathematical Scoring Engine & Snapshots

### Milestone 9: Scoring Calculation Engine
- Implement `ScoringModule` calculating live compliance scores:
  - Base calculations: $Allocated \times StatusFactor$ (Done = 1.0, Partial = 0.5, Pending = 0, NA excluded with redistribution).
  - Multi-year assessment periods: $\sum (PeriodWeight \times EvidenceStatusFactor)$.
  - Project milestone mark rollups (Kick-off, Mobilization).
  - ToR tree recursive rollups from leaf activities to parent sections.
- Expose macro and departmental dashboard analytics endpoints.

### Milestone 10: Progress Report Snapshots & Finding Tracking
- Implement `SnapshotModule` allowing admins to freeze immutable point-in-time score checkpoints (e.g., "3rd Progress Report", "4th Progress Report").
- Store and compare snapshots to compute ToR-by-ToR score variance ($\Delta$).
- Link structured audit findings (`AuditFinding`) directly to ToR nodes and snapshot reports.

---

## Phase 5: Audit Trail & Excel Pilot Migration

### Milestone 11: Tamper-Evident Hash Chain Audit Log
- Implement `ActivityLogService` recording before/after JSON diffs on all state-mutating operations.
- Calculate cryptographic SHA-256 hash chains (`previousHash` + payload) to guarantee non-repudiation.

### Milestone 12: Pilot Excel Onboarding & Migration Wizard
- Build backend parser for `FHL_Mark_distribution_01_10_2026.xlsx`.
- Automatically ingest ToR tree, DRT tickets, period weights (2009–2024), and current audit statuses into database tables.
- Build generic CSV/Excel export services for reports and compliance submissions.

---

## Phase 6: Frontend Integration & Live Dashboards

### Milestone 13: Next.js Client Monorepo Integration
- Connect Next.js 16 frontend with backend REST endpoints using TanStack Query.
- Implement authentication state, session storage, and route guards.

### Milestone 14: Interactive Execution Interfaces
- Build dynamic Expandable ToR Tree UI with inline weight editors.
- Build dual-view DRT interface: Kanban board for operational velocity and dense spreadsheet table for bulk reviews.
- Build Client Evidence Upload Portal with drag-and-drop and Cloudflare R2 direct uploads.
- Build real-time scoring dashboard with departmental drill-downs and snapshot comparison charts.