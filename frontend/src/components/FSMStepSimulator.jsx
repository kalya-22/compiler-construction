import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowRight,
  Sliders,
} from "lucide-react";

export default function FSMStepSimulator({
  trace,
  currentStepIndex,
  setCurrentStepIndex,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(150); // ms per step
  const timerRef = useRef(null);

  const totalSteps = trace ? trace.length : 0;
  const currentStep = trace && totalSteps > 0 ? trace[currentStepIndex] : null;

  // Auto playback effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps, setCurrentStepIndex]);

  if (!trace || totalSteps === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 text-indigo-400" />
        <p className="text-sm">Run the FSM to generate character-by-character execution trace steps.</p>
      </div>
    );
  }

  const getStateColor = (stateName) => {
    switch (stateName) {
      case "CODE":
        return "bg-emerald-950 text-emerald-300 border-emerald-700";
      case "SLASH":
        return "bg-amber-950 text-amber-300 border-amber-700";
      case "LINE_COMMENT":
      case "BLOCK_COMMENT":
      case "BLOCK_COMMENT_STAR":
        return "bg-rose-950 text-rose-300 border-rose-700";
      case "STRING_LITERAL":
      case "STRING_ESCAPE":
      case "CHAR_LITERAL":
      case "CHAR_ESCAPE":
        return "bg-purple-950 text-purple-300 border-purple-700";
      case "WHITESPACE":
        return "bg-cyan-950 text-cyan-300 border-cyan-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">
            FSM Mealy Machine Character-by-Character Step Simulator
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Skip to Start */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            title="Beginning"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Step Backward */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentStepIndex <= 0}
            title="Previous Step"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Step Forward */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
            }}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Next Step"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Skip to End */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(totalSteps - 1);
            }}
            title="End"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-700 pl-3">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded px-1.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value={400}>0.5x (Slow)</option>
              <option value={150}>1x (Normal)</option>
              <option value={40}>3x (Fast)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrubbing Range Slider */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStepIndex(Number(e.target.value));
          }}
          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <span className="text-xs font-mono text-slate-400 shrink-0">
          {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
        </span>
      </div>

      {/* Active Step Details Banner */}
      {currentStep && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/90 text-xs font-mono border-b border-slate-800">
          {/* Current Input Character */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-500 text-[11px] mb-1">Input Symbol (Σ)</div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-950 text-indigo-300 font-bold border border-indigo-700 rounded text-sm">
                {currentStep.char}
              </span>
              <span className="text-slate-400 text-[11px]">
                Line {currentStep.line}, Col {currentStep.col}
              </span>
            </div>
          </div>

          {/* Transition: from_state -> to_state */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 md:col-span-2">
            <div className="text-slate-500 text-[11px] mb-1">State Transition δ(q, σ) → q&apos;</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getStateColor(currentStep.from_state)}`}>
                {currentStep.from_state}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getStateColor(currentStep.to_state)}`}>
                {currentStep.to_state}
              </span>
            </div>
          </div>

          {/* Emitted Output Character */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-500 text-[11px] mb-1">Emitted Output (Δ)</div>
            <div className="flex items-center gap-2">
              {currentStep.emitted ? (
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold border border-emerald-700 rounded text-xs">
                  {currentStep.emitted}
                </span>
              ) : (
                <span className="text-slate-500 italic text-[11px]">ε (Discarded)</span>
              )}
            </div>
          </div>

          {/* Full Action Explanation */}
          <div className="md:col-span-4 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-indigo-400 font-semibold shrink-0">Action λ(q, σ):</span>
            <span className="text-slate-300 font-sans text-xs">{currentStep.action}</span>
          </div>
        </div>
      )}

      {/* Mini Trace Window (Recent 5 steps) */}
      <div className="max-h-48 overflow-y-auto font-mono text-[11px] divide-y divide-slate-800/60">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50 text-slate-400 sticky top-0">
            <tr>
              <th className="py-1.5 px-3">Step</th>
              <th className="py-1.5 px-3">Pos</th>
              <th className="py-1.5 px-3">Symbol</th>
              <th className="py-1.5 px-3">Current State</th>
              <th className="py-1.5 px-3">Next State</th>
              <th className="py-1.5 px-3">Emitted</th>
              <th className="py-1.5 px-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {trace.slice(Math.max(0, currentStepIndex - 3), Math.min(totalSteps, currentStepIndex + 4)).map((s) => (
              <tr
                key={s.step}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(s.step - 1);
                }}
                className={`cursor-pointer transition-colors ${
                  s.step - 1 === currentStepIndex
                    ? "bg-indigo-950/60 text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-800/40"
                }`}
              >
                <td className="py-1 px-3 text-slate-500">#{s.step}</td>
                <td className="py-1 px-3 text-slate-400">
                  {s.line}:{s.col}
                </td>
                <td className="py-1 px-3 text-indigo-300 font-bold">{s.char}</td>
                <td className="py-1 px-3">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getStateColor(s.from_state)}`}>
                    {s.from_state}
                  </span>
                </td>
                <td className="py-1 px-3">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getStateColor(s.to_state)}`}>
                    {s.to_state}
                  </span>
                </td>
                <td className="py-1 px-3 text-emerald-400">{s.emitted || "ε"}</td>
                <td className="py-1 px-3 truncate max-w-xs text-slate-300 font-sans">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
