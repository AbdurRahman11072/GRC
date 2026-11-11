'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import type { IStreamScorecard } from '../../../../types/scorecard.types';

interface ScorecardTableProps {
  scorecard: IStreamScorecard;
  accentColor: 'blue' | 'violet';
}

export const ScorecardTable: React.FC<ScorecardTableProps> = ({ scorecard, accentColor }) => {
  if (!scorecard) return null;

  const isAuditee = scorecard.streamBucket === 'AUDITEE';
  const borderHeader = isAuditee ? 'border-emerald-200' : 'border-sky-200';
  const bgHeader = isAuditee
    ? 'bg-emerald-50/70 text-emerald-950'
    : 'bg-sky-50/70 text-sky-950';
  const iconColor = isAuditee ? 'text-emerald-700' : 'text-sky-700';
  const badgeTheme = isAuditee
    ? 'bg-white text-emerald-700 border-emerald-300 shadow-2xs'
    : 'bg-white text-sky-700 border-sky-300 shadow-2xs';

  const rows = scorecard.rows || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Stream Title Header Bar */}
      <div className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${borderHeader} ${bgHeader}`}>
        <div className="flex items-center gap-2">
          <Building2 className={`w-4 h-4 ${iconColor}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider">{scorecard.title || 'Stream Scorecard'}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="text-slate-600 font-medium">
            Total Allocated:{' '}
            <strong className="text-slate-900 font-mono font-bold">{(scorecard.totalAllocatedMarks ?? 0).toFixed(2)}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">
            Total Obtained:{' '}
            <strong className="text-emerald-700 font-mono font-bold">{(scorecard.totalObtainedMarks ?? 0).toFixed(2)}</strong>
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeTheme}`}>
            {scorecard.achievementRate ?? 0}% Achieved
          </span>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200">SL</th>
              <th className="py-2.5 px-3 min-w-[240px] border-r border-slate-200">ToR Activities</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200">Data Collection Allocated</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200">Data Collection Obtained</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200">Data Analysis Allocated</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200">Data Analysis Obtained</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200">Total Allocated</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200">Total Obtained</th>
              <th className="py-2.5 px-3 text-right w-28">Achievement %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                  No ToR activity nodes found in this project.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rowAny = row as any;
                const colAlloc = row.collectionAllocated ?? rowAny.dataCollectionAllocated ?? 0;
                const colObt = row.collectionObtained ?? rowAny.dataCollectionObtained ?? 0;
                const anaAlloc = row.analysisAllocated ?? rowAny.dataAnalysisAllocated ?? 0;
                const anaObt = row.analysisObtained ?? rowAny.dataAnalysisObtained ?? 0;
                const totAlloc = row.totalAllocated ?? (colAlloc + anaAlloc);
                const totObt = row.totalObtained ?? (colObt + anaObt);
                const achPct = row.achievementPercentage ?? (totAlloc > 0 ? Math.round((totObt / totAlloc) * 100) : 0);

                return (
                  <tr
                    key={row.torId}
                    className="hover:bg-slate-50/80 transition-colors text-slate-800"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100">
                      <span className="font-mono text-indigo-700 font-bold mr-1.5 text-[11px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        {row.code}
                      </span>
                      <span className="text-slate-800 font-semibold">{row.title}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                      {colAlloc.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold border-r border-slate-100">
                      {colObt > 0 ? colObt.toFixed(2) : <span className="text-slate-400">0.00</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                      {anaAlloc.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold border-r border-slate-100">
                      {anaObt > 0 ? anaObt.toFixed(2) : <span className="text-slate-400">0.00</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                      {totAlloc.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 border-r border-slate-100">
                      {totObt > 0 ? totObt.toFixed(2) : <span className="text-slate-400">0.00</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                          achPct === 100
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : achPct >= 50
                            ? 'bg-sky-50 text-sky-700 border-sky-300'
                            : achPct > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {achPct}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100/95 font-bold text-slate-900 text-xs">
              <td colSpan={2} className="py-3 px-4 text-left uppercase tracking-wider text-slate-800 border-r border-slate-200">
                Total {scorecard.streamBucket === 'AUDITEE' ? 'FHL (Auditee)' : 'BTRC (Client)'} Marks
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-800 border-r border-slate-200">
                {(scorecard.collectionAllocated ?? 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-700 font-extrabold border-r border-slate-200">
                {(scorecard.collectionObtained ?? 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-800 border-r border-slate-200">
                {(scorecard.analysisAllocated ?? 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-700 font-extrabold border-r border-slate-200">
                {(scorecard.analysisObtained ?? 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-900 font-black text-sm border-r border-slate-200">
                {(scorecard.totalAllocatedMarks ?? 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-700 font-black text-sm border-r border-slate-200">
                {(scorecard.totalObtainedMarks ?? 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeTheme}`}>
                  {scorecard.achievementRate ?? 0}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
