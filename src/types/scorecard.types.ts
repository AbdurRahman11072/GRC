export interface ITorMarksSummary {
  collectionAllocated: number;
  collectionObtained: number;
  analysisAllocated: number;
  analysisObtained: number;
}

export interface IScorecardRow {
  torId: string;
  code: string;
  title: string;
  sortOrder: number;
  collectionAllocated: number;
  collectionObtained: number;
  analysisAllocated: number;
  analysisObtained: number;
  totalAllocated: number;
  totalObtained: number;
  achievementPercentage: number;
}

export interface IStreamScorecard {
  streamBucket: 'AUDITEE' | 'CLIENT';
  title: string;
  totalAllocatedMarks: number;
  totalObtainedMarks: number;
  collectionAllocated: number;
  collectionObtained: number;
  analysisAllocated: number;
  analysisObtained: number;
  achievementRate: number;
  rows: IScorecardRow[];
}

export interface IProjectScorecard {
  projectId: string;
  projectName: string;
  clientWeight: number;
  auditeeWeight: number;
  pmWeight: number;
  pmObtainedMarks: number;
  pmEvaluationNotes?: string | null;
  pmEvaluatedAt?: string | null;
  pmEvaluatedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  fhlScorecard: IStreamScorecard;
  btrcScorecard: IStreamScorecard;
  combinedAuditTotalMarks: number;
  finalProjectScore: number;
  totalProjectMarks: number;
}

export interface IUpdateProjectWeightsPayload {
  clientWeight: number;
  auditeeWeight: number;
  pmWeight?: number;
}

export interface IEvaluatePmPayload {
  obtainedMarks: number;
  evaluationNotes?: string;
}
