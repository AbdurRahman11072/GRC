'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
} from 'lucide-react';

export interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Type evidence requirements and specific document instructions...',
  error,
  minHeight = '140px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      <div
        className={`rounded-lg border bg-white transition-colors focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 ${
          error ? 'border-rose-500' : 'border-slate-200'
        }`}
      >
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/90 px-2.5 py-1.5 rounded-t-lg">
          <button
            type="button"
            title="Bold"
            onClick={() => executeCommand('bold')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => executeCommand('italic')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Underline"
            onClick={() => executeCommand('underline')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            type="button"
            title="Heading"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Bulleted List"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Quote"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            type="button"
            title="Clear Formatting"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-auto"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ContentEditable Body */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="px-3 py-2.5 text-xs text-slate-800 outline-none leading-relaxed prose prose-xs max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        />
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
