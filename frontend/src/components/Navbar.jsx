import React from "react";
import { Play, RotateCcw, Cpu, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { CODE_PRESETS } from "../utils/presets";

export default function Navbar({
  selectedPreset,
  onSelectPreset,
  whitespaceMode,
  setWhitespaceMode,
  onRun,
  onReset,
  loading,
  backendOnline,
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                FSM Lexical Preprocessor
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">
                Compiler Construction
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-950 text-amber-300 border border-amber-800">
                Engine: Lex / Flex (C)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Comment &amp; Whitespace Remover using Lex FSM Start Conditions (%x)
            </p>
          </div>
        </div>

        {/* Center Controls: Presets & Mode */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">Preset:</span>
            <select
              value={selectedPreset}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {CODE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Whitespace Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            {[
              { id: "normalize", label: "Normalize", desc: "Single spaces" },
              { id: "minify", label: "Minify", desc: "Strip blank lines" },
              { id: "preserve", label: "Preserve", desc: "Keep formatting" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setWhitespaceMode(mode.id)}
                title={mode.desc}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  whitespaceMode === mode.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Server Status indicator */}
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800/50"
            title={backendOnline ? "Backend connected (http://127.0.0.1:8000)" : "Connecting to backend..."}
          >
            {backendOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-medium">Backend Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-amber-400 font-medium">Connecting...</span>
              </>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Reset code to preset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Run FSM Button */}
          <button
            onClick={onRun}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-4 h-4 ${loading ? "animate-spin" : "fill-current"}`} />
            {loading ? "Running FSM..." : "Run FSM"}
          </button>
        </div>
      </div>
    </header>
  );
}
