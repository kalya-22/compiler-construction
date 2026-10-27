import React from "react";
import { ArrowDownRight, MessageSquare, Code2, Space, AlertTriangle, CheckCircle } from "lucide-react";

export default function MetricsCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="space-y-3">
      {/* Warnings Banner if any lexical warnings detected */}
      {metrics.warnings && metrics.warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-3.5 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-amber-300">Lexical Preprocessor Warning:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-200/90 font-mono">
              {metrics.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Reduction Percentage */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Reduction</span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {metrics.reduction_percentage}%
            </span>
            <span className="text-xs text-slate-500">
              ({metrics.chars_removed} chars)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.reduction_percentage)}%` }}
            ></div>
          </div>
        </div>

        {/* Comments Removed */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Comments Stripped</span>
            <span className="p-1 rounded bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400 font-mono">
              {metrics.single_line_comments_removed + metrics.multi_line_comments_removed}
            </span>
            <span className="text-xs text-slate-400">total</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-slate-300 font-medium">{metrics.single_line_comments_removed}</span> single //,{" "}
            <span className="text-slate-300 font-medium">{metrics.multi_line_comments_removed}</span> block /* */
          </p>
        </div>

        {/* Code Size */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Stream Size</span>
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
              <Code2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300 font-mono">
              {metrics.cleaned_length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {metrics.original_length} B
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Lines: <span className="text-slate-300 font-medium">{metrics.original_lines}</span> →{" "}
            <span className="text-slate-300 font-medium">{metrics.cleaned_lines}</span>
          </p>
        </div>

        {/* Whitespaces Removed */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Whitespace Stripped</span>
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Space className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {metrics.whitespace_chars_removed}
            </span>
            <span className="text-xs text-slate-400">chars</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Redundant spaces, tabs & returns
          </p>
        </div>
      </div>
    </div>
  );
}
