'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface DepartmentItem {
  name: string;
  code: string;
}

export const defaultDeptList: DepartmentItem[] = [
  { name: 'Information Technology', code: 'IT' },
  { name: 'Core Engineering & Transmission', code: 'ENG' },
  { name: 'Legal & Regulatory Compliance', code: 'LEGAL' },
  { name: 'Finance & Accounts', code: 'FIN' },
  { name: 'Sales & Commercial Operations', code: 'SALES' },
  { name: 'Marketing & Public Relations', code: 'MKT' },
];

interface StepDepartmentsProps {
  selectedDepts: string[];
  onToggleDept: (code: string) => void;
}

export const StepDepartments: React.FC<StepDepartmentsProps> = ({
  selectedDepts,
  onToggleDept,
}) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Select standard departments to initialize for routing DRT tickets:
      </p>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {defaultDeptList.map((dept) => {
          const isSelected = selectedDepts.includes(dept.code);
          return (
            <button
              key={dept.code}
              type="button"
              onClick={() => onToggleDept(dept.code)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                  isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
              <span className="truncate">{dept.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
