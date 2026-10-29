'use client';

import React from 'react';
import { History, User, Clock, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Modal } from '../../../../ui/Modal';
import { Button } from '../../../../ui/Button';

export interface IDRTRemarkVersion {
  version: number;
  authorName: string;
  authorRole?: string;
  createdAt: string;
  content: string;
  isCurrent?: boolean;
}

export interface DrtRemarkVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  stakeholderType: 'AUDITOR' | 'AUDITEE' | 'CLIENT';
  stakeholderName?: string;
  versions: IDRTRemarkVersion[];
}

export const DrtRemarkVersionModal: React.FC<DrtRemarkVersionModalProps> = ({
  isOpen,
  onClose,
  title,
  stakeholderType,
  stakeholderName,
  versions,
}) => {
  if (!isOpen) return null;

  const isAuditor = stakeholderType === 'AUDITOR';
  const isClient = stakeholderType === 'CLIENT';

  const badgeTheme = isAuditor
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : isClient
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const IconComponent = isAuditor ? ShieldCheck : isClient ? Building2 : Building2;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="2xl">
      <div className="space-y-4">
        {/* Header Summary Pill */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md border ${badgeTheme}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {stakeholderName || (isAuditor ? 'Lead Audit Team' : 'Auditee Focal Point')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Remark Revisions & Review Cycle Audit Log
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>{versions.length} {versions.length === 1 ? 'version' : 'versions'}</span>
          </div>
        </div>

        {/* Timeline list */}
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {versions.map((ver, idx) => {
            const isLatest = ver.isCurrent || idx === 0;
            return (
              <div
                key={ver.version}
                className={`relative pl-6 pb-2 border-l-2 ${
                  isLatest
                    ? 'border-indigo-500 dark:border-indigo-400'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Timeline Node Dot */}
                <span
                  className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 ${
                    isLatest
                      ? 'bg-indigo-600 border-white dark:border-slate-900 shadow-sm ring-2 ring-indigo-200 dark:ring-indigo-900/60'
                      : 'bg-slate-300 dark:bg-slate-600 border-white dark:border-slate-900'
                  }`}
                />

                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    isLatest
                      ? 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isLatest
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        v{ver.version}
                      </span>
                      {isLatest && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          Latest / Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{ver.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {ver.content}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {ver.authorName}
                      </span>
                      {ver.authorRole && (
                        <span className="text-slate-400 dark:text-slate-500">
                          • {ver.authorRole}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="text-xs px-4 py-1.5">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
