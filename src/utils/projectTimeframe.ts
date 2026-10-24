import type { IProject } from '../types/project.types';

/**
 * Extracts the exact assessment / historical coverage years for an audit project.
 * Priority:
 * 1. Normalized AssessmentPeriod records from database
 * 2. Parsed "Audit Data Coverage: YYYY–YYYY" from projectScope
 * 3. Date range from project.startDate and project.endDate
 * 4. Fallback default range
 */
export function getProjectAuditYears(project?: IProject | null): string[] {
  if (!project) {
    return ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  }

  // 1. Direct AssessmentPeriod records from DB
  if (project.assessmentPeriods && project.assessmentPeriods.length > 0) {
    const sorted = [...project.assessmentPeriods].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.periodKey.localeCompare(b.periodKey, undefined, { numeric: true });
    });
    const keys = sorted.map((p) => p.periodKey.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }

  // 2. Parse from projectScope (e.g. "Audit Data Coverage: 2016–2021")
  if (project.projectScope) {
    const scopeMatch = project.projectScope.match(/(?:Audit Data Coverage:|\bCoverage:?)\s*(\d{4})\s*[–\-—]\s*(\d{4})/i)
      || project.projectScope.match(/(\d{4})\s*[–\-—]\s*(\d{4})/);

    if (scopeMatch) {
      const startYear = parseInt(scopeMatch[1], 10);
      const endYear = parseInt(scopeMatch[2], 10);
      if (!isNaN(startYear) && !isNaN(endYear) && startYear <= endYear && endYear - startYear <= 40) {
        const years: string[] = [];
        for (let y = startYear; y <= endYear; y++) {
          years.push(String(y));
        }
        return years;
      }
    }
  }

  // 3. Fallback to start / end engagement dates
  if (project.startDate && project.endDate) {
    try {
      const start = new Date(project.startDate).getFullYear();
      const end = new Date(project.endDate).getFullYear();
      if (!isNaN(start) && !isNaN(end) && start <= end && end - start <= 40) {
        const years: string[] = [];
        for (let y = start; y <= end; y++) {
          years.push(String(y));
        }
        return years;
      }
    } catch {
      // Ignore parse failure
    }
  }

  return ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
}
