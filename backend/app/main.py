"""FastAPI Application for FSM Comment and Whitespace Remover Powered by Lex / Flex."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import ProcessRequest, ProcessResponse, FSMDefinitionResponse
from .lex_engine import run_lex_remover
from .fsm.engine import FSMEngine
from .fsm.table import get_fsm_definition

app = FastAPI(
    title="FSM Lexical Preprocessor API (Lex Engine)",
    description="Compiler Construction Project: Comment and Whitespace Remover Powered by Lex / Flex",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def root():
    return {
        "project": "Comment and Whitespace Remover Using FSM & Lex",
        "course": "Compiler Construction",
        "engine": "Lex / Flex (remover.l)",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "process": "POST /api/process",
            "fsm_definition": "GET /api/fsm/definition",
            "health": "GET /api/health"
        }
    }

@app.get("/api/health", tags=["General"])
def health_check():
    return {"status": "ok", "service": "fsm-backend", "engine": "lex-flex"}

@app.get("/api/fsm/definition", response_model=FSMDefinitionResponse, tags=["FSM"])
def get_fsm_metadata():
    """
    Returns the formal definition of the Mealy Machine / Lex Start States:
    - Set of states Q (mapped to Lex %x start states)
    - Alphabet categories Sigma
    - Transition matrix delta
    - Initial and accepting states
    - Mermaid diagram syntax for visualization
    """
    return get_fsm_definition()

@app.post("/api/process", response_model=ProcessResponse, tags=["FSM"])
def process_code(request: ProcessRequest):
    """
    Runs the compiled Lex engine (remover.exe) on the source code.
    Extracts cleaned code, lexical reduction metrics, and FSM transition trace.
    """
    try:
        # Run the core C / Lex compiler engine directly!
        cleaned_code, metrics = run_lex_remover(request.code, request.whitespace_mode)

        # Generate character-by-character transition trace for the visual FSM stepper
        trace_data = None
        if request.include_trace:
            engine = FSMEngine(
                whitespace_mode=request.whitespace_mode,
                collect_trace=True,
                max_trace_steps=request.max_trace_steps
            )
            _, fsm_meta = engine.process(request.code)
            trace_data = engine.trace
            metrics["trace_steps_count"] = len(trace_data)

        return ProcessResponse(
            success=True,
            cleaned_code=cleaned_code,
            metrics=metrics,
            trace=trace_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lex Preprocessor Engine Error: {str(e)}")
