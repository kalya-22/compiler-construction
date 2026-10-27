# Comment & Whitespace Remover Using Finite State Machine (FSM) - Backend

Compiler Construction Project - Lexical Preprocessor / Lexer Stage.

## Overview
This backend implements a formal **Mealy Machine (Finite State Machine)** designed to strip single-line comments (`//`), multi-line comments (`/* ... */`), and redundant whitespaces while preserving:
- String literals (`"..."`) including nested comment markers and escape sequences (`\"`, `\\`)
- Character literals (`'...'`) including escape sequences (`\'`)
- Division operators (`/` and `/=`)
- Syntactic token boundaries (e.g. converting `int/*comment*/x` to `int x`)

---

## Formal FSM Specification

The preprocessor is formally modeled as a 6-tuple:
$$M = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$$

- **$Q$ (States)**:
  - `CODE` ($q_0$, Initial State): Processing normal program code tokens.
  - `SLASH`: Read `/`, pending disambiguation between division operator `/`, line comment `//`, or block comment `/*`.
  - `LINE_COMMENT`: Inside `//`, consuming characters until `\n`.
  - `BLOCK_COMMENT`: Inside `/*`, consuming characters until `*`.
  - `BLOCK_COMMENT_STAR`: Inside `/* ... *`, testing if next character is `/` to terminate block.
  - `STRING_LITERAL`: Inside `"..."`, preserving whitespace and comment markers.
  - `STRING_ESCAPE`: Escaping next character in string (`\"`, `\\`).
  - `CHAR_LITERAL`: Inside `'...'`, preserving character constant.
  - `CHAR_ESCAPE`: Escaping next character in character literal (`\'`).
  - `WHITESPACE`: Collapsing multiple spaces and tabs.
- **$\Sigma$ (Input Alphabet)**: ASCII & UTF-8 character stream.
- **$\Delta$ (Output Alphabet)**: Emitted characters for preprocessed stream.
- **$\delta$ (Transition Function)**: $\delta: Q \times \Sigma \to Q$
- **$\lambda$ (Output Function)**: $\lambda: Q \times \Sigma \to \Delta^*$
- **$q_0$**: `CODE`

---

## Installation & Running

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Start the Backend Server
```bash
python backend/run.py
```
Or with uvicorn directly:
```bash
uvicorn backend.app.main:app --reload --port 8000
```

The interactive API documentation (Swagger UI) is available at:
**[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

### 3. Run Automated Tests
```bash
python -m pytest backend/tests -v -o pythonpath=backend
```

---

## API Endpoints

### 1. `POST /api/process`
Preprocesses source code using the FSM.

**Request Body:**
```json
{
  "code": "int a = 10; // set value\n/* multi\nline */ float ratio = a / 2.0;",
  "whitespace_mode": "normalize",
  "include_trace": true,
  "max_trace_steps": 500
}
```
- `whitespace_mode`: `"preserve"` | `"normalize"` | `"minify"`
- `include_trace`: `true` to receive character-by-character transition trace steps for visualization.

**Response Body:**
```json
{
  "success": true,
  "cleaned_code": "int a = 10;\nfloat ratio = a / 2.0;",
  "metrics": {
    "original_length": 65,
    "cleaned_length": 36,
    "chars_removed": 29,
    "reduction_percentage": 44.62,
    "single_line_comments_removed": 1,
    "multi_line_comments_removed": 1,
    "comment_chars_removed": 28,
    "whitespace_chars_removed": 1,
    "original_lines": 3,
    "cleaned_lines": 2,
    "warnings": []
  },
  "trace": [
    {
      "step": 1,
      "line": 1,
      "col": 1,
      "char": "i",
      "from_state": "CODE",
      "to_state": "CODE",
      "action": "Emit standard token char 'i'",
      "emitted": "i"
    }
  ]
}
```

### 2. `GET /api/fsm/definition`
Returns the formal machine definition, state lists, character classes, transition matrix, and Mermaid diagram code for frontend rendering.

### 3. `GET /api/health`
Health check endpoint returning `{"status": "ok", "service": "fsm-backend"}`.
