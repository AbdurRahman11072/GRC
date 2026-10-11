// schema.prisma
// Configured for Neon DB (Serverless PostgreSQL)
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -----------------------------------------------------------------------------
// 1. IDENTITY & TENANCY LAYER
// -----------------------------------------------------------------------------

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  phone        String?
  nid          String?
  designation  String?
  isSuperAdmin Boolean   @default(false)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  createdOrgs       Organization[]       @relation("OrgCreator")
  orgMemberships    OrganizationMember[]
  projectMemberships ProjectMember[]
  createdTors       Tor[]                @relation("TorCreator")
  drtSubmissions    DRTSubmission[]
  drtComments       DRTComment[]
  activityLogs      SystemActivityLog[]
  attachments       Attachment[]

  @@index([email])
}

model Organization {
  id               String   @id @default(uuid())
  orgName          String
  orgType          String
  orgAddress       String?
  orgPhone         String?
  orgEmail         String?
  orgWebsite       String?
  orgLinkedIn      String?
  numberOfEmployee Int?
  createdById      String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  creator      User                 @relation("OrgCreator", fields: [createdById], references: [id])
  members      OrganizationMember[]
  crmEntities  EntityCRM[]
  projects     Project[]
  activityLogs SystemActivityLog[]

  @@index([createdById])
}

enum OrgRole {
  OWNER
  ADMIN
  AUDITOR
  MEMBER
}

model OrganizationMember {
  id        String   @id @default(uuid())
  orgId     String
  userId    String
  orgRole   OrgRole  @default(AUDITOR)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([orgId, userId])
  @@index([orgId])
  @@index([userId])
}

// -----------------------------------------------------------------------------
// 2. PROJECT, CRM & TEAM ARCHITECTURE
// -----------------------------------------------------------------------------

enum CRMEntityType {
  CLIENT
  AUDITEE
}

model EntityCRM {
  id             String        @id @default(uuid())
  orgId          String
  entityType     CRMEntityType
  name           String
  address        String?
  website        String?
  phone          String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  organization   Organization  @relation(fields: [orgId], references: [id], onDelete: Cascade)
  clientProjects Project[]     @relation("ProjectClient")
  auditeeProjects Project[]    @relation("ProjectAuditee")

  @@index([orgId])
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ON_HOLD
}

model Project {
  id                String        @id @default(uuid())
  orgId             String
  clientId          String
  auditeeId         String
  projectName       String
  projectType       String
  startDate         DateTime?
  endDate           DateTime?
  projectObjective  String?
  projectScope      String?
  status            ProjectStatus @default(DRAFT)
  isDeleted         Boolean       @default(false)
  deletedAt         DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  organization      Organization            @relation(fields: [orgId], references: [id], onDelete: Cascade)
  client            EntityCRM               @relation("ProjectClient", fields: [clientId], references: [id])
  auditee           EntityCRM               @relation("ProjectAuditee", fields: [auditeeId], references: [id])
  members           ProjectMember[]
  departments       ProjectDepartment[]
  tors              Tor[]
  drtTickets        DRTTicket[]
  assessmentPeriods AssessmentPeriod[]
  milestones        ProjectMilestone[]
  snapshots         ProgressReportSnapshot[]
  activityLogs      SystemActivityLog[]

  @@index([orgId])
  @@index([clientId])
  @@index([auditeeId])
  @@index([status])
}

enum TeamBucket {
  ORG_TEAM_1
  ORG_TEAM_2
  CLIENT_TEAM_1
  CLIENT_TEAM_2
}

model ProjectDepartment {
  id          String   @id @default(uuid())
  projectId   String
  name        String   // e.g. "Marketing", "Sales", "Engineering", "IT", "Legal", "Finance"
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project    Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  members    ProjectMember[]
  drtTickets DRTTicket[]

  @@unique([projectId, name])
  @@index([projectId])
}

model ProjectMember {
  id           String             @id @default(uuid())
  projectId    String
  userId       String
  teamBucket   TeamBucket
  departmentId String?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  project    Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  department ProjectDepartment? @relation(fields: [departmentId], references: [id], onDelete: SetNull)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

// -----------------------------------------------------------------------------
// 3. WORK BREAKDOWN STRUCTURE (ToR) & DATA REQUEST TRACKING (DRT)
// -----------------------------------------------------------------------------

model Tor {
  id          String   @id @default(uuid())
  projectId   String
  parentId    String?
  code        String   // e.g., "1.1", "1.1.2"
  title       String
  description String?
  sortOrder   Int      @default(0)
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project       Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent        Tor?              @relation("TorHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children      Tor[]             @relation("TorHierarchy")
  creator       User              @relation("TorCreator", fields: [createdById], references: [id])
  streamWeights TorStreamWeight[]
  drtMappings   DRTTicketToR[]
  findings      AuditFinding[]

  @@index([projectId])
  @@index([parentId])
  @@index([code])
}

model TorStreamWeight {
  id                         String     @id @default(uuid())
  torId                      String
  streamBucket               TeamBucket // CLIENT_TEAM_1 or CLIENT_TEAM_2
  dataCollectionAllocated    Float      @default(0.0)
  dataAnalysisAllocated      Float      @default(0.0)
  dataAnalysisObtained       Float      @default(0.0)
  createdAt                  DateTime   @default(now())
  updatedAt                  DateTime   @updatedAt

  tor Tor @relation(fields: [torId], references: [id], onDelete: Cascade)

  @@unique([torId, streamBucket])
  @@index([torId])
}

enum DRTLifecycleStatus {
  OPEN
  SUBMITTED
  REVISION_REQUESTED
  ACCEPTED
}

enum DRTReviewStatus {
  PENDING
  PARTIAL
  DONE
  NOT_AVAILABLE
  NOT_APPLICABLE
}

model DRTTicket {
  id                    String             @id @default(uuid())
  projectId             String
  requestCode           String             // e.g., "M1001", "L1001"
  assignedTeamBucket    TeamBucket         // CLIENT_TEAM_1 or CLIENT_TEAM_2
  departmentId          String?
  description           String
  dateOfRequest         DateTime?
  expectedDateOfReceipt DateTime?
  actualDateOfReceipt   DateTime?
  lifecycleStatus       DRTLifecycleStatus @default(OPEN)
  reviewStatus          DRTReviewStatus    @default(PENDING)
  allocatedWeight       Float              @default(0.0) // Auto-shared or manually allocated
  excessDays            Int                @default(0)
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  project       Project                 @relation(fields: [projectId], references: [id], onDelete: Cascade)
  department    ProjectDepartment?      @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  torMappings   DRTTicketToR[]
  periodStatuses DRTTicketPeriodStatus[]
  submissions   DRTSubmission[]
  comments      DRTComment[]

  @@unique([projectId, requestCode])
  @@index([projectId])
  @@index([assignedTeamBucket])
  @@index([departmentId])
  @@index([lifecycleStatus])
  @@index([reviewStatus])
}

model DRTTicketToR {
  id        String @id @default(uuid())
  ticketId  String
  torId     String

  ticket    DRTTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  tor       Tor       @relation(fields: [torId], references: [id], onDelete: Cascade)

  @@unique([ticketId, torId])
  @@index([ticketId])
  @@index([torId])
}

// -----------------------------------------------------------------------------
// 4. ASSESSMENT PERIODS & MULTI-YEAR WEIGHTING
// -----------------------------------------------------------------------------

model AssessmentPeriod {
  id            String   @id @default(uuid())
  projectId     String
  periodKey     String   // e.g. "2024", "2023", "Period-1"
  weight        Float    // Normalised decimal weight (sum to 1.0)
  revenueAmount Float?   // Optional revenue metric used to calculate weight
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  project        Project                 @relation(fields: [projectId], references: [id], onDelete: Cascade)
  ticketStatuses DRTTicketPeriodStatus[]

  @@unique([projectId, periodKey])
  @@index([projectId])
}

enum PeriodEvidenceStatus {
  SHARED
  PARTIAL
  NOT_SHARED
  NOT_APPLICABLE
}

model DRTTicketPeriodStatus {
  id             String               @id @default(uuid())
  ticketId       String
  periodId       String
  evidenceStatus PeriodEvidenceStatus @default(NOT_SHARED)
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  ticket DRTTicket        @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  period AssessmentPeriod @relation(fields: [periodId], references: [id], onDelete: Cascade)

  @@unique([ticketId, periodId])
  @@index([ticketId])
  @@index([periodId])
}

model ProjectMilestone {
  id             String   @id @default(uuid())
  projectId      String
  name           String   // e.g. "Team Mobilization", "BTRC Kick-off Meeting"
  allocatedMarks Float    @default(0.0)
  isCompleted    Boolean  @default(false)
  completedAt    DateTime?
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}

// -----------------------------------------------------------------------------
// 5. EVIDENCE SUBMISSIONS, COMMENTS & CLOUDFLARE R2 ATTACHMENTS
// -----------------------------------------------------------------------------

model DRTSubmission {
  id            String    @id @default(uuid())
  ticketId      String
  submittedById String
  version       Int       @default(1)
  comments      String?
  createdAt     DateTime  @default(now())

  ticket      DRTTicket    @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  submittedBy User         @relation(fields: [submittedById], references: [id])
  attachments Attachment[]

  @@index([ticketId])
  @@index([submittedById])
}

model DRTComment {
  id             String   @id @default(uuid())
  ticketId       String
  userId         String
  commentText    String
  isInternalOnly Boolean  @default(false) // Hidden from client teams
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  ticket DRTTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user   User      @relation(fields: [userId], references: [id])

  @@index([ticketId])
  @@index([userId])
}

model Attachment {
  id           String   @id @default(uuid())
  recordType   String   // "DRTSubmission", "ProjectAgreement", "ToRInstruction"
  recordId     String
  r2Key        String   // Cloudflare R2 Object Key
  fileName     String
  fileType     String
  fileSizeBytes Int
  sha256Hash   String
  uploadedById String
  createdAt    DateTime @default(now())

  submission   DRTSubmission? @relation(fields: [recordId], references: [id], onDelete: Cascade)
  uploadedBy   User           @relation(fields: [uploadedById], references: [id])

  @@index([recordType, recordId])
  @@index([uploadedById])
}

// -----------------------------------------------------------------------------
// 6. PROGRESS REPORT SNAPSHOTS & AUDIT FINDINGS
// -----------------------------------------------------------------------------

model ProgressReportSnapshot {
  id           String         @id @default(uuid())
  projectId    String
  reportNumber Int            // e.g. 1, 2, 3, 4
  reportName   String         // e.g. "4th Progress Report"
  frozenAt     DateTime       @default(now())
  scorePayload Json           // Full snapshot of calculated scores across all ToRs
  findings     AuditFinding[]

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, reportNumber])
  @@index([projectId])
}

model AuditFinding {
  id          String   @id @default(uuid())
  snapshotId  String
  torId       String
  findingCode String   // e.g. "1.1.1", "1.3.2"
  title       String
  details     String
  severity    String?  // "CRITICAL", "HIGH", "MEDIUM", "LOW"
  createdAt   DateTime @default(now())

  snapshot ProgressReportSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
  tor      Tor                    @relation(fields: [torId], references: [id], onDelete: Cascade)

  @@index([snapshotId])
  @@index([torId])
}

// -----------------------------------------------------------------------------
// 7. IMMUTABLE SYSTEM ACTIVITY LOG (HASH CHAIN AUDIT TRAIL)
// -----------------------------------------------------------------------------

model SystemActivityLog {
  id           String   @id @default(uuid())
  orgId        String
  projectId    String?
  actorId      String
  action       String   // e.g. "DRT_STATUS_CHANGED", "EVIDENCE_SUBMITTED"
  targetEntity String   // e.g. "DRTTicket", "DRTSubmission"
  targetId     String
  diffPayload  Json     // { before: {...}, after: {...} }
  ipAddress    String?
  userAgent    String?
  previousHash String?  // Hash of previous row in the chain
  currentHash  String   // SHA-256 (previousHash + log data)
  createdAt    DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  project      Project?     @relation(fields: [projectId], references: [id], onDelete: SetNull)
  actor        User         @relation(fields: [actorId], references: [id])

  @@index([orgId])
  @@index([projectId])
  @@index([actorId])
  @@index([createdAt])
}