# Product Requirements Document (PRD): Zio Tech GRC

## 1. What to Build
**Zio Tech GRC** is an enterprise-grade, multi-tenant SaaS platform engineered to digitize, automate, and orchestrate complex Information Systems (IS) and regulatory compliance audits. Replacing fragmented Excel-based tracking, the system provides a centralized workspace featuring a 4-team collaborative architecture, self-referencing Terms of Reference (ToR) Work Breakdown Structures, automated Data Request Tracking (DRT) tickets, and a real-time mathematical engine calculating compliance scores based on multi-year revenue weights and submission review statuses.

---

## 2. Target Users & Stakeholders
1. **Primary Users (Auditing Firm):**
   - **Super Admin / Org Admin:** Manages organizations, invites team members, provisions credentials, configures knowledge bases, and freezes progress snapshots.
   - **Lead Auditor & Audit Managers:** Constructs ToR trees, allocates baseline weights, reviews evidence submissions, and inputs analysis marks.
   - **Audit Field Staff (Org Team 1 & Org Team 2):** Dispatches DRT tickets, communicates in threaded tickets, and marks review outcomes.
2. **Secondary Users (Regulators & Auditees):**
   - **Client Team 1 (Regulator - e.g., BTRC):** Receives macro compliance visibility, tracks high-level progress, and fulfills regulatory requests.
   - **Client Team 2 (Auditee - e.g., Fiber@Home Limited):** Organized into functional departments (Marketing, Sales, IT, Legal, Engineering). Department staff receive tickets, upload evidence files, and respond to clarification requests.

---

## 3. Core Architectural Modules

### 3.1. Identity, Access & SaaS Tenancy
- **Global User Identity:** Unified user model with per-organization and per-project roles.
- **Tenant Isolation:** Multi-tenant boundaries enforcing strict `orgId` scoping on all queries.
- **Dual Provisioning:** Supports secure invitation links as well as direct creation with initial credentials by Org Admins.
- **Authentication:** Custom JWT-based authentication in Express using argon2 password hashing, short-lived access tokens, and rotating httpOnly refresh cookies.
- **Database & ORM:** Neon DB (Serverless PostgreSQL) connected via Prisma ORM providing tenant-scoped queries, migrations, and connection pooling.

### 3.2. Project & 4-Team Collaborative Architecture
- **Reusable CRM Directory:** Centralized `EntityCRM` storing Client and Auditee profiles across multiple audits.
- **4 Collaborative Buckets:** 
  - `ORG_TEAM_1` (Regulatory focus) $\leftrightarrow$ `CLIENT_TEAM_1` (Regulator)
  - `ORG_TEAM_2` (Operational focus) $\leftrightarrow$ `CLIENT_TEAM_2` (Auditee)
- **Departmental Routing:** Subdivisions within Client Team 2 enabling tickets to be routed to exact corporate departments.

### 3.3. Hierarchical Task Execution (ToR WBS) & DRT Engine
- **Recursive WBS Tree:** Self-referencing tree structure supporting infinite nesting (Main ToR $\rightarrow$ ToR $\rightarrow$ Activity).
- **Automated DRT Ticketing:** Human-readable codes (`M1001`, `L1001`) with many-to-many linkages to leaf ToRs.
- **Split-View Operations:** Dense data table for spreadsheet-level audit management alongside Kanban boards.
- **Lifecycle & Review Dual Statuses:**
  - *Lifecycle:* `OPEN` $\rightarrow$ `SUBMITTED` $\rightarrow$ `REVISION_REQUESTED` $\rightarrow$ `ACCEPTED`.
  - *Auditor Review:* `PENDING` (0.0), `PARTIAL` (0.5), `DONE` (1.0), `NOT_AVAILABLE` (0.0), `NOT_APPLICABLE` (excluded with automatic redistribution).
- **SLA & Delay Tracking:** Real-time computation of `excessDays` against expected receipt dates.

### 3.4. Mathematical Scoring Engine & Progress Snapshots
- **Dynamic Weighting Engine:** Recalculates obtained scores live upon evidence status updates.
- **Assessment Periods (Year-wise Weighting):** Optional multi-year weighting normalized to 100% based on annual revenue numbers.
- **Milestone Scoring:** Fixed milestone marks (e.g. Kick-off, Mobilization) tracking project-level compliance.
- **Stream-Specific Split:** Separates Data Collection vs. Data Analysis marks for both regulatory and operational streams.
- **Progress Report Freezing:** Point-in-time snapshots (e.g., "3rd Progress Report", "4th Progress Report") capturing immutable scores, delta comparisons, and structured audit findings.

### 3.5. Evidence Management & Regulatory Compliance Trail
- **Cloudflare R2 Object Storage:** S3-compatible private storage using presigned upload/download URLs, 100MB limits, and SHA-256 integrity checksums.
- **Threaded Communications:** In-ticket discussions with auditor-only internal note toggling.
- **Tamper-Evident Audit Trail:** Service-layer activity logging capturing before/after JSON diffs linked via SHA-256 hash chains.
- **Pilot Migration Wizard:** Automated import tool for ingesting existing Excel audit matrices into structured tables.