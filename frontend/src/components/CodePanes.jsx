import React, { useState } from "react";
import { Copy, Check, FileCode, Sparkles, Terminal } from "lucide-react";

export default function CodePanes({
  inputCode,
  setInputCode,
  cleanedCode,
  loading,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!cleanedCode) return;
    navigator.clipboard.writeText(cleanedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputLineCount = (inputCode || "").split("\n").length;
  const cleanedLineCount = (cleanedCode || "").split("\n").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Pane: Input Source Code */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        {/* Pane Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Source Code (Raw Input Stream)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>{inputLineCount} lines</span>
            <span>•</span>
            <span>{inputCode.length} chars</span>
          </div>
        </div>

        {/* Textarea Editor with Line Numbers */}
        <div className="relative flex flex-1 min-h-[380px] bg-slate-950 font-mono text-xs">
          {/* Line Numbers gutter */}
          <div className="w-12 py-3 select-none text-right pr-3 text-slate-600 bg-slate-950/70 border-r border-slate-800/60">
            {Array.from({ length: Math.max(1, inputLineCount) }).map((_, i) => (
              <div key={i} className="leading-5">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Editable Textarea */}
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Type or paste your C/C++/Java/JS code here..."
            spellCheck="false"
            className="flex-1 p-3 bg-transparent text-slate-200 resize-none focus:outline-none leading-5 font-mono selection:bg-indigo-500/30 overflow-auto whitespace-pre"
          />
        </div>
      </div>

      {/* Right Pane: Cleaned Preprocessor Output */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        {/* Pane Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>FSM Output (Comments & Redundant Whitespace Stripped)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {cleanedCode ? `${cleanedLineCount} lines • ${cleanedCode.length} chars` : "0 lines"}
            </span>
            <button
              onClick={handleCopy}
              disabled={!cleanedCode}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Read-only Preprocessor Output with Line Numbers */}
        <div className="relative flex flex-1 min-h-[380px] bg-slate-950 font-mono text-xs overflow-auto">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-slate-500 gap-2">
              <Terminal className="w-5 h-5 animate-pulse text-indigo-400" />
              <span>Simulating FSM Mealy Machine transitions...</span>
            </div>
          ) : cleanedCode ? (
            <>
              {/* Line numbers gutter */}
              <div className="w-12 py-3 select-none text-right pr-3 text-slate-600 bg-slate-950/70 border-r border-slate-800/60 shrink-0">
                {Array.from({ length: Math.max(1, cleanedLineCount) }).map((_, i) => (
                  <div key={i} className="leading-5">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Cleaned Code display */}
              <pre className="flex-1 p-3 text-emerald-300/90 leading-5 font-mono selection:bg-emerald-500/20 whitespace-pre overflow-x-auto m-0">
                {cleanedCode}
              </pre>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-500 text-center p-6">
              Click &quot;Run FSM&quot; to execute the preprocessor and inspect the output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
