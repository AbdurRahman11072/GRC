export const periodColorMap: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SHARED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-sky-50 text-sky-700 border-sky-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 border-slate-200',
  NOT_SHARED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const gDriveColorMap: Record<string, string> = {
  UPLOADED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  NOT_UPLOADED: 'bg-rose-50 text-rose-700 border-rose-200',
  NA: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const auditeeStatusColorMap: Record<string, string> = {
  SHARED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COLLECTING_DATA: 'bg-amber-50 text-amber-700 border-amber-200',
  PARTIALLY_SHARED: 'bg-sky-50 text-sky-700 border-sky-200',
  NOT_SHARED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const auditorReviewColorMap: Record<string, string> = {
  DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-rose-50 text-rose-700 border-rose-200',
  NOT_AVAILABLE: 'bg-rose-50 text-rose-700 border-rose-200',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 border-slate-200',
};
