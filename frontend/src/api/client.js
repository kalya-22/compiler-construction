/**
 * API client to communicate with the FastAPI backend.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function processCode({ code, whitespaceMode = "normalize", includeTrace = true, maxTraceSteps = 1000 }) {
  const response = await fetch(`${BASE_URL}/api/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      whitespace_mode: whitespaceMode,
      include_trace: includeTrace,
      max_trace_steps: maxTraceSteps,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Unknown server error" }));
    throw new Error(errorData.detail || `Server responded with status ${response.status}`);
  }

  return await response.json();
}

export async function fetchFSMDefinition() {
  const response = await fetch(`${BASE_URL}/api/fsm/definition`);
  if (!response.ok) {
    throw new Error(`Failed to fetch FSM definition: ${response.status}`);
  }
  return await response.json();
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}
