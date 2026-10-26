'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import type { IStreamScorecard } from '../../../../types/scorecard.types';

interface ScorecardTableProps {
  scorecard: IStreamScorecard;
  accentColor: 'blue' | 'violet';
}

export const ScorecardTable: React.FC<ScorecardTableProps> = ({ scorecard, accentColor }) => {
  const isBlue = accentColor === 'blue';
  const borderHeader = isBlue ? 'border-blue-500/30' : 'border-violet-500/30';
  const bgHeader = isBlue ? 'bg-blue-950/20 text-blue-300' : 'bg-violet-950/20 text-violet-300';
  const badgeTheme = isBlue
    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    : 'bg-violet-500/10 text-violet-400 border-violet-500/20';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Stream Title Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${borderHeader} ${bgHeader}`}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">{scorecard.title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Total Allocated:{' '}
            <strong className="text-slate-100 font-semibold">{scorecard.totalAllocatedMarks.toFixed(2)}</strong>
          </span>
          <span className="text-slate-400">
            Total Obtained:{' '}
            <strong className="text-slate-100 font-semibold">{scorecard.totalObtainedMarks.toFixed(2)}</strong>
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeTheme}`}>
            {scorecard.achievementRate}% Achieved
          </span>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center">SL</th>
              <th className="py-2.5 px-3 min-w-[200px]">ToR Activities</th>
              <th className="py-2.5 px-3 text-right">Data Collection Allocated</th>
              <th className="py-2.5 px-3 text-right">Data Collection Obtained</th>
              <th className="py-2.5 px-3 text-right">Data Analysis Allocated</th>
              <th className="py-2.5 px-3 text-right">Data Analysis Obtained</th>
              <th className="py-2.5 px-3 text-right">Total Allocated</th>
              <th className="py-2.5 px-3 text-right">Total Obtained</th>
              <th className="py-2.5 px-3 text-right w-24">Achievement %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {scorecard.rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  No ToR activity nodes found in this project.
                </td>
              </tr>
            ) : (
              scorecard.rows.map((row, idx) => (
                <tr
                  key={row.torId}
                  className="hover:bg-slate-800/40 transition-colors text-slate-200"
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-mono text-emerald-400 text-[11px] mr-1.5">{row.code}</span>
                    <span className="font-medium text-slate-100">{row.title}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {row.collectionAllocated.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {row.collectionObtained.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {row.analysisAllocated.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {row.analysisObtained.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100">
                    {row.totalAllocated.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-300">
                    {row.totalObtained.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        row.achievementPercentage >= 80
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : row.achievementPercentage >= 50
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.achievementPercentage}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700 bg-slate-950 font-bold text-slate-100 text-xs">
              <td colSpan={2} className="py-3 px-4 text-left uppercase tracking-wider text-slate-300">
                Total {scorecard.streamBucket === 'AUDITEE' ? 'FHL' : 'BTRC'} Marks
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-200">
                {scorecard.collectionAllocated.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-400">
                {scorecard.collectionObtained.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-200">
                {scorecard.analysisAllocated.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-400">
                {scorecard.analysisObtained.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-white text-sm">
                {scorecard.totalAllocatedMarks.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-300 text-sm font-extrabold">
                {scorecard.totalObtainedMarks.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono">
                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${badgeTheme}`}>
                  {scorecard.achievementRate}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
