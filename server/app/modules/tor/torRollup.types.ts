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
  sortOrder?: number;
  collectionAllocated?: number;
  collectionObtained?: number;
  analysisAllocated?: number;
  analysisObtained?: number;
  dataCollectionAllocated: number;
  dataAnalysisAllocated: number;
  totalAllocated: number;
  dataCollectionObtained: number;
  dataAnalysisObtained: number;
  totalObtained: number;
  achievementPercentage?: number;
}

export interface IStreamScorecardData {
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

export interface IProjectScorecardResponse {
  projectId: string;
  projectName?: string;
  clientWeight?: number;
  auditeeWeight?: number;
  pmWeight?: number;
  pmObtainedMarks?: number;
  pmEvaluationNotes?: string | null;
  pmEvaluatedAt?: Date | null;
  pmEvaluatedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  fhlScorecard?: IStreamScorecardData;
  btrcScorecard?: IStreamScorecardData;
  combinedAuditTotalMarks?: number;
  finalProjectScore?: number;
  totalProjectMarks?: number;
  fhl: {
    allocated: { collection: number; analysis: number; total: number };
    obtained: { collection: number; analysis: number; total: number };
    rows: IScorecardRow[];
  };
  btrc: {
    allocated: { collection: number; analysis: number; total: number };
    obtained: { collection: number; analysis: number; total: number };
    rows: IScorecardRow[];
  };
  pm: {
    allocated: number;
    obtained: number;
    notes?: string | null;
    evaluatedAt?: Date | null;
  };
  grandTotal: {
    allocated: number;
    obtained: number;
  };
}
