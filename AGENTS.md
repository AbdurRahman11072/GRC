# AGENTS.md — Zio Tech GRC Engineering Guidelines & Architecture Playbook

## 1. System Overview & Scope
**Zio Tech GRC** is an enterprise-grade, multi-tenant SaaS platform built to digitize and automate Information Systems (IS) audits and regulatory compliance workflows.
- **Repository Pattern:** Unified Next.js 16 + Express.js Hybrid Architecture in a single project (Express powers `/api/v1/*` routes while Next.js App Router powers frontend UI and SSR pages via `server/index.ts`).
- **Primary Pilot:** Bangladesh Telecommunication Regulatory Commission (BTRC) & Fiber@Home Limited (FHL) IS Audit (2009–2024).
- **Core Engine:** Real-time mathematical scoring engine with multi-year revenue weighting, hierarchical Terms of Reference (ToR) WBS, Data Request Tracking (DRT) tickets, 4-team collaborative boundaries, and Cloudflare R2 evidence storage.

---

## 2. Technical Stack & Standards

### Hybrid Architecture & Server Layer (`/server`)
- **Server Framework:** Express.js (TypeScript, modular architecture in `server/app/modules/{feature}/{service,controller,routes}.ts`).
- **Unified Entry:** `server/index.ts` initializes Next.js (`next({ dev })`), mounts Express middlewares & `/api/v1/*` routes, then delegates remaining requests to the Next.js request handler.
- **ORM & Data Layer:** Prisma ORM connected to Neon DB (Serverless PostgreSQL with connection pooling via `@prisma/adapter-pg` or connection pool string).
- **Authentication:** Custom JWT auth in Express (argon2 password hashing, short-lived access tokens, httpOnly rotating refresh cookies). Supports email invites and direct credential provisioning by Org Admins.
- **Storage:** Cloudflare R2 (S3-compatible, private bucket, presigned upload/download URLs, SHA-256 integrity verification, 100MB limit).
- **Audit Logging:** Tamper-evident SHA-256 hash-chained `SystemActivityLog` on all state-mutating service operations.

### Frontend App Layer (`/src`)
- **Framework:** Next.js 16 (App Router, React 19, TypeScript in `src/app`).
- **Styling & UI:** Tailwind CSS v4, Base UI / shadcn/ui components, Lucide icons.
- **Data Fetching:** Typed API client fetch services (`src/services/*.ts`) and TanStack Query (`@tanstack/react-query`).
- **Views:** Expandable ToR Tree with inline weight editors, hybrid Kanban & dense spreadsheet table for DRT tickets, live compliance dashboards, and a dedicated Client Upload Portal.

---

## 3. Core Domain Architecture & Rules

### 3.1. Multi-Tenancy & Identity
- **Global User Identity:** One `User` record per email.
- **Tenant Isolation:** All firm data is strictly scoped by `orgId` via `tenantMiddleware` and tenant context validation.
- **RBAC Roles:**
  - `OrganizationMember.orgRole`: `OWNER`, `ADMIN`, `AUDITOR`.
  - `ProjectMember`: Assigned to one of four team buckets (`ORG_TEAM_1`, `ORG_TEAM_2`, `CLIENT_TEAM_1`, `CLIENT_TEAM_2`).

### 3.2. The 4-Team Architecture & Department Routing
1. `ORG_TEAM_1` $\leftrightarrow$ `CLIENT_TEAM_1`: Auditing firm regulatory unit interfacing with the Regulator (BTRC).
2. `ORG_TEAM_2` $\leftrightarrow$ `CLIENT_TEAM_2`: Auditing firm operational unit interfacing with the Auditee (FHL).
3. **Auditee Departments:** Client Team 2 is divided into functional departments (`ProjectDepartment`: Marketing, Sales, Engineering, IT, Legal, Finance, etc.). DRT tickets are addressed directly to departments.
4. **Visibility Rules:**
   - Org Admins & Lead Auditors have universal visibility across all streams.
   - Client Team 1 (Regulator) has read-only oversight across all tickets and macro scores.
   - Client Team 2 department staff only see DRT tickets and SLAs assigned to their department. Internal auditor notes (`isInternalOnly`) are hidden from all client teams.

### 3.3. Work Breakdown Structure (ToR) & DRT Tickets
- **ToR Hierarchy:** Self-referencing tree (`parentId`, `code`, `title`, `sortOrder`).
- **DRT Linkage:** Many-to-many junction (`DRTTicketToR`) allowing a single data request (e.g., `M1003`) to satisfy multiple ToR activities.
- **Human-Readable Codes:** Unique per project (e.g., `M1001`, `S2001`, `L1001`).
- **Two-Tier Status Model:**
  - *Workflow Lifecycle:* `OPEN` $\rightarrow$ `SUBMITTED` $\rightarrow$ `REVISION_REQUESTED` $\rightarrow$ `ACCEPTED`.
  - *Auditor Review Outcome:* `PENDING` (0.0), `PARTIAL` (0.5), `DONE` (1.0), `NOT_AVAILABLE` (0.0), `NOT_APPLICABLE` (excluded, weight redistributed).
- **SLA Tracking:** Automated `excessDays` calculation against `expectedDateOfReceipt`.

### 3.4. Mathematical Scoring Engine
- **Multi-Year Weighting:** `AssessmentPeriod` records (e.g., 2009–2024) with revenue-normalized percentage weights ($\sum Weight = 1.0$).
- **Period Status Grid:** Each DRT ticket has per-year status entries (`SHARED`, `PARTIAL`, `NOT_SHARED`, `NOT_APPLICABLE`).
- **ToR Stream Split:** Each ToR node has separate Data Collection marks and Data Analysis marks.
- **Progress Snapshots:** Immutable frozen checkpoints (`ProgressReportSnapshot`) enabling ToR-level variance ($\Delta$) comparisons across progress reports, linked with structured `AuditFinding` records.

---

## 4. Development & Coding Conventions

### Monorepo & Windows OS Execution
- **Shell Commands:** On Windows, execute package manager commands through `cmd.exe /c "npm ..."` or `cmd.exe /c "pnpm ..."` to prevent PowerShell script execution policy errors (`.ps1` restrictions).
- **Path References:** Always use forward slashes `/` when creating markdown file links.

### Code Style & Best Practices
- **Strict Typing:** Avoid `any`. Define and maintain comprehensive TypeScript interfaces and DTOs.
- **Validation:** Enforce validation on all incoming API requests and environment variables using **Zod** (`zod` with reusable Express validation middleware: `validateBody`, `validateQuery`, `validateParams`).
- **Database Consistency:** Follow Prisma naming conventions (models PascalCase, fields camelCase, relational indexes explicitly defined).
- **Error Handling:** Use centralized Express error middleware with custom HTTP exception classes (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `UnauthorizedException`).
- **Preserve Documentation:** Do not remove existing docstrings, schemas, or architectural decision logs.

### Sub-task Execution & GitHub Push Protocol
- **Granular Execution:** Work on only one discrete sub-task at a time; never bulk-generate future modules or files.
- **Mandatory Review Gate:** After implementing and compiling/testing each sub-task, pause and ask the user for their review.
- **Push to GitHub upon Approval:** Only when the user explicitly approves the review ("review is good"), commit the code with a semantic message and push to GitHub.
- **Sequential Progression:** Proceed to the next sub-task only after the previous one is approved, committed, and pushed.
