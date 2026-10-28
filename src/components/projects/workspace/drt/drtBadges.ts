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

export const statusBadgeStyles: Record<string, string> = {
  DONE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  PARTIAL: 'bg-amber-100 text-amber-900 border-amber-300',
  PENDING: 'bg-rose-100 text-rose-800 border-rose-300',
  OPEN: 'bg-rose-100 text-rose-800 border-rose-300',
  REVISION_REQUESTED: 'bg-rose-100 text-rose-800 border-rose-300',
  SUBMITTED: 'bg-sky-100 text-sky-800 border-sky-300',
  NOT_AVAILABLE: 'bg-slate-100 text-slate-600 border-slate-300',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const periodCellStyles: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-800 font-semibold',
  SHARED: 'bg-emerald-50 text-emerald-800 font-semibold',
  PARTIAL: 'bg-amber-50 text-amber-900 font-semibold',
  IN_PROGRESS: 'bg-amber-50/60 text-amber-800',
  NOT_APPLICABLE: 'bg-slate-50 text-slate-400',
  NOT_SHARED: 'bg-rose-50 text-rose-800',
};

