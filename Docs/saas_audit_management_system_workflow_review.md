# SaaS Audit Management System: Workflow & Process Review

This document outlines the end-to-end lifecycle of an audit project within the proposed SaaS platform, resolving functional mismatches between ToR assignment and Data Request generation.

## Phase 1: Onboarding & Knowledge Base Setup

1. **Organization Registration:** A user logs into the SaaS platform and registers their auditing firm, automatically becoming the Organization Super Admin.

2. **Team Member Onboarding:** The Super Admin invites internal staff members to join the Organization's workspace.

3. **Guideline Configuration (Independent Knowledge Base):**

   * The Admin creates **Guideline Categories**.

   * The Admin populates these categories with specific **Guidelines** (instructional rules for data collection).

4. **Subscription Activation:** The Organization purchases a SaaS subscription to unlock active Audit Projects.

## Phase 2: Project Initiation & Team Assembly

1. **Create Audit Project:** The Admin initializes a new Audit Project (e.g., "FHL IS Audit 2009-2024").

2. **Input Weighting Variables:** The Admin inputs the project-specific financial variables required for automated scoring (e.g., entering the yearly *BTRC Revenue Sharing* percentages).

3. **The Four-Team Structure:** The Admin assigns users into four predefined collaborative units:

   * **Org Team 1 (Regulatory Focus):** Auditing Firm team mapped to interface with BTRC.

   * **Org Team 2 (Operational Focus):** Auditing Firm team mapped to interface with FHL.

   * **Client Team 1 (BTRC):** The Regulator (Primary function: Monitoring & providing regulatory baselines).

   * **Client Team 2 (FHL):** The Auditee. *Crucially, this team is subdivided by Department (Marketing, Sales, IT).*

## Phase 3: ToR Distribution & DRT Generation (The Ticket System)

1. **ToR Creation:** The Admin creates Terms of Reference (ToRs), defining the task description and baseline marks.

2. **ToR Assignment:** ToRs are assigned to the relevant Org Teams (e.g., Operational ToRs go to Org Team 2).

3. **Publish & Notify:** The Admin clicks **Publish**. The system activates the ToRs.

4. **DRT Generation (The Fix):** The assigned Org Teams review their ToRs and generate specific **Data Request Tracker (DRT) Tickets**.
   * *Example:* For ToR 1.2.1, Org Team 2 creates a DRT ticket asking for "Customer Charter" and assigns it directly to the *Marketing Department* within Client Team 2 (FHL), setting an **Expected Date of Receipt**.

## Phase 4: Collaborative Data Collection & Live Scoring

1. **Data Submission:** The specific FHL department (Client Team 2) receives the DRT ticket, gathers the required evidence, and uploads it.

2. **Review & Feedback Loop:** The assigning Org Team reviews the submission.

   * If incorrect/incomplete: The Org Team requests revisions, keeping the SLA timer running.

   * If accepted: The Org Team assigns a definitive status (e.g., Done, Partial).

3. **Delay Tracking:** The system automatically calculates **"Excess Time (days)"** if submissions pass the Expected Date of Receipt.

4. **Automated Weighting Engine:** Upon status assignment, the backend instantly calculates the final score (applying the ToR baseline mark and the BTRC revenue-sharing variables).

## Phase 5: Reporting & Conclusion

1. **Universal Visibility:** The centralized dashboard displays live progress, delays, and automated scores. *Role-based views ensure BTRC sees high-level compliance, while FHL sees departmental bottlenecks.*

2. **Final Sign-off & Export:** Once all DRTs are resolved, the Super Admin finalizes the project, locking the scores and exporting the official Audit Report (PDF/Excel) for BTRC and FHL records.