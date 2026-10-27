"""Data models and schemas for the FSM Compiler Preprocessor API."""
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

class ProcessRequest(BaseModel):
    code: str = Field(..., description="Source code text to be preprocessed by FSM")
    whitespace_mode: Literal["preserve", "normalize", "minify"] = Field(
        default="normalize",
        description="Whitespace handling strategy: preserve (leave spaces as is), normalize (single space, clean lines), or minify (strip excess lines/spaces)"
    )
    include_trace: bool = Field(
        default=False,
        description="Whether to generate character-by-character FSM execution trace steps"
    )
    max_trace_steps: int = Field(
        default=500,
        ge=1,
        le=5000,
        description="Maximum number of transition steps to capture in the trace"
    )

class TraceStepItem(BaseModel):
    step: int
    line: int
    col: int
    char: str
    from_state: str
    to_state: str
    action: str
    emitted: str

class Metrics(BaseModel):
    original_length: int
    cleaned_length: int
    chars_removed: int
    reduction_percentage: float
    single_line_comments_removed: int
    multi_line_comments_removed: int
    comment_chars_removed: int
    whitespace_chars_removed: int
    original_lines: int
    cleaned_lines: int
    warnings: List[str] = Field(default_factory=list)
    trace_steps_count: int = 0
    trace_truncated: bool = False

class ProcessResponse(BaseModel):
    success: bool = True
    cleaned_code: str
    metrics: Metrics
    trace: Optional[List[TraceStepItem]] = None

class StateMeta(BaseModel):
    id: str
    label: str
    description: str
    initial: bool
    accepting: bool

class CharClassMeta(BaseModel):
    id: str
    label: str
    example: str

class FSMDefinitionResponse(BaseModel):
    machine_type: str
    initial_state: str
    accepting_states: List[str]
    states: List[StateMeta]
    char_classes: List[CharClassMeta]
    transitions: Dict[str, Dict[str, Dict[str, str]]]
    mermaid_diagram: str
