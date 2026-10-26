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
  dataCollectionAllocated: number;
  dataAnalysisAllocated: number;
  totalAllocated: number;
  dataCollectionObtained: number;
  dataAnalysisObtained: number;
  totalObtained: number;
}

export interface IProjectScorecardResponse {
  projectId: string;
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
