import React from "react";
import { CircleDot, GitCommit, HelpCircle } from "lucide-react";

export default function StateGraph({ activeState }) {
  const states = [
    {
      id: "CODE",
      name: "CODE (q0)",
      category: "main",
      desc: "Default source code parsing state",
      isInitial: true,
      isAccepting: true,
    },
    {
      id: "SLASH",
      name: "SLASH",
      category: "decision",
      desc: "Pending slash - checks if comment or division",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "LINE_COMMENT",
      name: "LINE_COMMENT",
      category: "comment",
      desc: "Consuming single-line comment (//)",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "BLOCK_COMMENT",
      name: "BLOCK_COMMENT",
      category: "comment",
      desc: "Consuming multi-line comment (/*)",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "BLOCK_COMMENT_STAR",
      name: "BLOCK_COMMENT_STAR",
      category: "comment",
      desc: "Seen '*' inside block comment - checks for '/'",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "STRING_LITERAL",
      name: "STRING_LITERAL",
      category: "literal",
      desc: "Inside double-quoted string literal \"...\"",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "STRING_ESCAPE",
      name: "STRING_ESCAPE",
      category: "literal",
      desc: "Escaped character in string literal (\\)",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "CHAR_LITERAL",
      name: "CHAR_LITERAL",
      category: "literal",
      desc: "Inside single-quoted char literal '...'",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "CHAR_ESCAPE",
      name: "CHAR_ESCAPE",
      category: "literal",
      desc: "Escaped character in char literal (\\)",
      isInitial: false,
      isAccepting: false,
    },
    {
      id: "WHITESPACE",
      name: "WHITESPACE",
      category: "whitespace",
      desc: "Collapsing duplicate spaces & tabs",
      isInitial: false,
      isAccepting: true,
    },
  ];

  const getCategoryStyles = (category, isActive) => {
    if (isActive) {
      return "border-amber-400 bg-amber-950/80 text-amber-100 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-amber-500/20";
    }
    switch (category) {
      case "main":
        return "border-emerald-700/60 bg-emerald-950/30 text-emerald-300 hover:border-emerald-500";
      case "decision":
        return "border-amber-700/60 bg-amber-950/30 text-amber-300 hover:border-amber-500";
      case "comment":
        return "border-rose-700/60 bg-rose-950/30 text-rose-300 hover:border-rose-500";
      case "literal":
        return "border-purple-700/60 bg-purple-950/30 text-purple-300 hover:border-purple-500";
      case "whitespace":
        return "border-cyan-700/60 bg-cyan-950/30 text-cyan-300 hover:border-cyan-500";
      default:
        return "border-slate-700 bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            FSM State Space Q (10 States)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal/Accepting
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Comments
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Literals
          </span>
        </div>
      </div>

      {/* Grid of State Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 font-mono text-xs">
        {states.map((st) => {
          const isActive = activeState === st.id;
          return (
            <div
              key={st.id}
              className={`p-2.5 rounded-lg border transition-all duration-200 relative ${getCategoryStyles(
                st.category,
                isActive
              )}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px]">{st.name}</span>
                {isActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-tight line-clamp-2">
                {st.desc}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400">
                {st.isInitial && (
                  <span className="px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                    Start (q0)
                  </span>
                )}
                {st.isAccepting && (
                  <span className="px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    Accepting
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
