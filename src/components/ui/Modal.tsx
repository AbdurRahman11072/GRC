'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { stripHtml } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '80%' | 'full';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'w-[94vw] max-w-4xl',
  '80%': 'w-[94vw] md:w-[80vw] max-w-5xl',
  full: 'w-[96vw] max-w-[96vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between">
            <div className="space-y-1">
              {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
              {description && (
                <p className="text-xs text-slate-500 line-clamp-3">
                  {typeof description === 'string' ? stripHtml(description) : description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 max-h-[calc(85vh-130px)] overflow-y-auto">{children}</div>

        {footer && (
          <div className="p-4 px-6 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
