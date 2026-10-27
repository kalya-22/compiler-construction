"""Comprehensive Unit Tests for FSM Comment and Whitespace Remover."""
import pytest
from fastapi.testclient import TestClient

from app.fsm.states import FSMState
from app.fsm.engine import FSMEngine
from app.fsm.table import get_fsm_definition
from app.main import app

client = TestClient(app)

# ----------------- FSM Unit Tests ----------------- #

def test_single_line_comment_removal():
    code = "int a = 10; // assign ten\nint b = 20;"
    engine = FSMEngine(whitespace_mode="normalize")
    cleaned, meta = engine.process(code)
    assert "// assign ten" not in cleaned
    assert "int a = 10;\nint b = 20;" == cleaned
    assert meta["single_line_comments_removed"] == 1


def test_multi_line_comment_removal():
    code = "int /* comment */ x = 5; /* another \n multi-line \n comment */"
    engine = FSMEngine(whitespace_mode="normalize")
    cleaned, meta = engine.process(code)
    assert "comment" not in cleaned
    assert meta["multi_line_comments_removed"] == 2
    assert "int x = 5;" in cleaned


def test_comment_removal_preserve_mode():
    code = "    int a = 10; // comment\n    int b = 20;"
    engine = FSMEngine(whitespace_mode="preserve")
    cleaned, meta = engine.process(code)
    assert "// comment" not in cleaned
    assert "    int a = 10; \n    int b = 20;" == cleaned


def test_division_operator_preserved():
    code = "float ratio = total / count / 2.0;"
    engine = FSMEngine(whitespace_mode="preserve")
    cleaned, meta = engine.process(code)
    assert cleaned == code
    assert meta["single_line_comments_removed"] == 0
    assert meta["multi_line_comments_removed"] == 0


def test_comments_inside_string_literals_preserved():
    code = 'char* url = "http://example.com/api//v1/*not_a_comment*/";'
    engine = FSMEngine(whitespace_mode="preserve")
    cleaned, meta = engine.process(code)
    assert cleaned == code
    assert meta["single_line_comments_removed"] == 0
    assert meta["multi_line_comments_removed"] == 0


def test_escaped_quotes_inside_string():
    code = 'char* str = "He said \\"// this is not a comment\\"" ;'
    engine = FSMEngine(whitespace_mode="preserve")
    cleaned, meta = engine.process(code)
    assert '// this is not a comment' in cleaned
    assert meta["single_line_comments_removed"] == 0


def test_character_constants():
    code = "char slash = '/'; char star = '*'; char quote = '\"';"
    engine = FSMEngine(whitespace_mode="preserve")
    cleaned, meta = engine.process(code)
    assert cleaned == code
    assert meta["single_line_comments_removed"] == 0
    assert meta["multi_line_comments_removed"] == 0


def test_whitespace_normalization():
    code = "int     a    =    5;   \n\n\nint    b = 10;"
    engine = FSMEngine(whitespace_mode="normalize")
    cleaned, meta = engine.process(code)
    assert "int a = 5;" in cleaned
    assert "int b = 10;" in cleaned
    assert meta["whitespace_chars_removed"] > 0


def test_whitespace_minify_mode():
    code = "int a = 1; \n\n  \n  int b = 2;\n"
    engine = FSMEngine(whitespace_mode="minify")
    cleaned, meta = engine.process(code)
    assert "\n\n" not in cleaned
    assert "int a = 1;\nint b = 2;" == cleaned


def test_trace_generation():
    code = "a / b"
    engine = FSMEngine(collect_trace=True, max_trace_steps=50)
    cleaned, meta = engine.process(code)
    assert meta["trace_steps_count"] > 0
    assert len(engine.trace) > 0
    # Verify slash transition state captured
    states = [step["to_state"] for step in engine.trace]
    assert FSMState.SLASH.value in states


def test_unterminated_block_comment_warning():
    code = "int a = 5; /* unterminated block"
    engine = FSMEngine()
    _, meta = engine.process(code)
    assert any("Unterminated block comment" in w for w in meta["warnings"])


def test_unterminated_string_warning():
    code = 'char* str = "unterminated string;'
    engine = FSMEngine()
    _, meta = engine.process(code)
    assert any("Unterminated string literal" in w for w in meta["warnings"])


# ----------------- API Endpoints Tests ----------------- #

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_api_fsm_definition():
    res = client.get("/api/fsm/definition")
    assert res.status_code == 200
    data = res.json()
    assert "machine_type" in data
    assert "states" in data
    assert "transitions" in data
    assert "mermaid_diagram" in data
    assert len(data["states"]) >= 10


def test_api_process_endpoint():
    payload = {
        "code": "int x = 10; // note\n/* block */ int y = 20;",
        "whitespace_mode": "normalize",
        "include_trace": True,
        "max_trace_steps": 100
    }
    res = client.post("/api/process", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "// note" not in data["cleaned_code"]
    assert "/* block */" not in data["cleaned_code"]
    assert data["metrics"]["single_line_comments_removed"] == 1
    assert data["metrics"]["multi_line_comments_removed"] == 1
    assert data["trace"] is not None
    assert len(data["trace"]) > 0
