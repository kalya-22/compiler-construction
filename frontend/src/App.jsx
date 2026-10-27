import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import MetricsCards from "./components/MetricsCards";
import CodePanes from "./components/CodePanes";
import FSMStepSimulator from "./components/FSMStepSimulator";
import StateGraph from "./components/StateGraph";
import TransitionTable from "./components/TransitionTable";
import LexViewer from "./components/LexViewer";
import { CODE_PRESETS } from "./utils/presets";
import { processCode, fetchFSMDefinition, checkBackendHealth } from "./api/client";
import { Code, Activity, Table, FileCode, AlertCircle } from "lucide-react";

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState("basic");
  const [inputCode, setInputCode] = useState(CODE_PRESETS[0].code);
  const [whitespaceMode, setWhitespaceMode] = useState("normalize");

  const [cleanedCode, setCleanedCode] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [trace, setTrace] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [fsmDefinition, setFsmDefinition] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("editor"); // "editor", "simulator", "matrix"

  // Check health and load FSM definition
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
      if (isOnline) {
        try {
          const def = await fetchFSMDefinition();
          setFsmDefinition(def);
        } catch (err) {
          console.error("Failed to load FSM definition", err);
        }
      }
    }
    init();

    const interval = setInterval(async () => {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Run the FSM processor
  const handleRunFSM = useCallback(
    async (codeToProcess = inputCode, mode = whitespaceMode) => {
      setLoading(true);
      setError(null);
      try {
        const res = await processCode({
          code: codeToProcess,
          whitespaceMode: mode,
          includeTrace: true,
          maxTraceSteps: 1500,
        });

        setCleanedCode(res.cleaned_code);
        setMetrics(res.metrics);
        setTrace(res.trace || []);
        setCurrentStepIndex(0);
        setBackendOnline(true);
      } catch (err) {
        setError(err.message || "Failed to process code");
        setBackendOnline(false);
      } finally {
        setLoading(false);
      }
    },
    [inputCode, whitespaceMode]
  );

  // Auto-run once on initial mount
  useEffect(() => {
    handleRunFSM(CODE_PRESETS[0].code, "normalize");
  }, []);

  // Preset switch handler
  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    const found = CODE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setInputCode(found.code);
      handleRunFSM(found.code, whitespaceMode);
    }
  };

  // Reset current preset
  const handleReset = () => {
    const found = CODE_PRESETS.find((p) => p.id === selectedPreset);
    if (found) {
      setInputCode(found.code);
      handleRunFSM(found.code, whitespaceMode);
    }
  };

  // Mode change handler
  const handleModeChange = (mode) => {
    setWhitespaceMode(mode);
    handleRunFSM(inputCode, mode);
  };

  // Active state for state graph
  const activeState =
    trace && trace.length > 0 && trace[currentStepIndex]
      ? trace[currentStepIndex].to_state
      : "CODE";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <Navbar
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        whitespaceMode={whitespaceMode}
        setWhitespaceMode={handleModeChange}
        onRun={() => handleRunFSM(inputCode, whitespaceMode)}
        onReset={handleReset}
        loading={loading}
        backendOnline={backendOnline}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-600/60 rounded-xl p-4 flex items-center gap-3 text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-rose-300">Connection Error: </span>
              {error} — Make sure the FastAPI backend is running (`python backend/run.py`).
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && <MetricsCards metrics={metrics} />}

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Dual-Pane Preprocessor</span>
            </button>

            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === "simulator"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>FSM Step Simulator</span>
              {trace && trace.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300">
                  {trace.length} steps
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === "matrix"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Transition Matrix (δ)</span>
            </button>

            <button
              onClick={() => setActiveTab("lex")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === "lex"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Lex / Flex (.l)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>FSM State:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
              {activeState}
            </span>
          </div>
        </div>

        {/* Tab 1: Dual-Pane Code Editor */}
        {activeTab === "editor" && (
          <div className="space-y-4">
            <CodePanes
              inputCode={inputCode}
              setInputCode={setInputCode}
              cleanedCode={cleanedCode}
              loading={loading}
            />
            {/* Real-time State Space Overview */}
            <StateGraph activeState={activeState} />
          </div>
        )}

        {/* Tab 2: Interactive FSM Character-by-Character Stepper */}
        {activeTab === "simulator" && (
          <div className="space-y-4">
            <FSMStepSimulator
              trace={trace}
              currentStepIndex={currentStepIndex}
              setCurrentStepIndex={setCurrentStepIndex}
            />
            <StateGraph activeState={activeState} />
          </div>
        )}

        {/* Tab 3: Formal Transition Matrix (Theory & Academic) */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <TransitionTable definition={fsmDefinition} />
            <StateGraph activeState={activeState} />
          </div>
        )}

        {/* Tab 4: Lex / Flex Source Code & Guide */}
        {activeTab === "lex" && (
          <div className="space-y-4">
            <LexViewer />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-auto text-center text-xs text-slate-500">
        <p>
          Compiler Construction Lab Project • Lexical Analysis Stage • Mealy Machine Finite State Automata
        </p>
      </footer>
    </div>
  );
}
