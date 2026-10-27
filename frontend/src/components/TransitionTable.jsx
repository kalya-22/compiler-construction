import React, { useState } from "react";
import { Table, Search, BookOpen } from "lucide-react";

export default function TransitionTable({ definition }) {
  const [filter, setFilter] = useState("");

  if (!definition || !definition.transitions) {
    return null;
  }

  const { states, char_classes, transitions, machine_type } = definition;

  const filteredStates = states.filter(
    (st) =>
      st.id.toLowerCase().includes(filter.toLowerCase()) ||
      st.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Formal State Transition Matrix δ: Q × Σ → Q
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
            {machine_type}
          </span>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Search state..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96 font-mono text-[11px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950 text-slate-300 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 border-r border-slate-800 bg-slate-950/90 min-w-[140px]">
                State (q ∈ Q)
              </th>
              {char_classes.map((cls) => (
                <th
                  key={cls.id}
                  className="py-2.5 px-2.5 border-r border-slate-800 text-center min-w-[120px]"
                >
                  <span className="text-indigo-400 font-bold">{cls.label}</span>
                  <span className="block text-[10px] text-slate-500 font-normal">
                    {cls.example}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStates.map((st) => {
              const stateTransitions = transitions[st.id] || {};
              return (
                <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-3 border-r border-slate-800 font-bold text-slate-200 bg-slate-950/40">
                    <div>{st.id}</div>
                    <div className="text-[10px] font-normal text-slate-400">{st.label}</div>
                  </td>
                  {char_classes.map((cls) => {
                    const trans = stateTransitions[cls.id];
                    if (!trans) {
                      return (
                        <td
                          key={cls.id}
                          className="py-2 px-2 border-r border-slate-800 text-center text-slate-600"
                        >
                          -
                        </td>
                      );
                    }
                    const isSelf = trans.next === st.id;
                    return (
                      <td
                        key={cls.id}
                        className="py-1.5 px-2 border-r border-slate-800 text-[10px]"
                      >
                        <div
                          className={`font-semibold ${
                            isSelf ? "text-slate-400" : "text-amber-300"
                          }`}
                        >
                          → {trans.next}
                        </div>
                        <div className="text-[9px] text-slate-400 font-sans leading-tight mt-0.5 line-clamp-2">
                          {trans.action}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
