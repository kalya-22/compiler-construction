# Comment and Whitespace Remover Using FSM & Lex

[![Course](https://img.shields.io/badge/Course-Compiler%20Construction-4F46E5?style=for-the-badge&logo=codeforces)](.)
[![Lex Engine](https://img.shields.io/badge/Engine-Lex%20%2F%20Flex%20(C)-EA580C?style=for-the-badge&logo=c)](.)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20(Python)-009688?style=for-the-badge&logo=fastapi)](.)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](.)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwindcss)](.)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](.)

> A full-stack **Compiler Construction** laboratory project implementing a formal **Mealy Finite State Machine (FSM)** and an industrial **Lex / Flex** lexical preprocessor that eliminates single-line comments (`//`), multi-line block comments (`/* ... */`), redundant whitespaces, and blank lines while preserving strings, character constants, and token boundaries.

---

## 🌟 Key Features

- **🚀 Native Lex / Flex Engine**: The core lexical analyzer is written in **Lex (`lex/remover.l`)** using **Exclusive Start Conditions (`%x`)** and compiled into a native C executable (`remover.exe`).
- **🛡️ Strict Syntax Preservation**:
  - **Strings & URLs**: Comments inside `"https://api.com//v1/*auth*/"` are preserved verbatim.
  - **Escaped Quotes**: Handles `\"` and `\'` without misinterpreting string boundaries.
  - **Division Operators**: Disambiguates arithmetic division (`a / b / 2.0`) from comment slashes.
  - **Token Boundaries**: Converts `int/*comment*/x;` into `int x;` rather than merged `intx;`.
- **🧹 Blank Line Elimination**: Emptied lines left behind by deleted comments are automatically detected via intelligent line buffering and completely eliminated.
- **⚡ Character-by-Character FSM Step Simulator**:
  - Interactive stepper (Play, Pause, Step Next, Step Back, Scrubbing Slider, Speed 0.5x–3x).
  - Live display of active input symbol $\Sigma$, state transition $\delta(q, \sigma) \to q'$, and emitted character $\Delta$.
- **📊 Real-Time Compiler Metrics**:
  - Reduction % with visual progress bar.
  - Total comments stripped (single-line vs. multi-line breakdown).
  - Stream size (original bytes vs. preprocessed bytes).
  - Whitespace & blank line characters eliminated.
- **▦ Formal State Transition Matrix ($\delta: Q \times \Sigma \to Q$)**: Searchable tabular view of all 10 states against character classes.
- **📄 Built-in Lex Viewer**: Complete syntax-highlighted view of `remover.l` with a 1-click copy button and compiler command cheat-sheet.

---

## 🏛️ System Architecture

```
[ Frontend: React + Vite + Tailwind (Port 5173) ]
                       │
                       ▼  HTTP POST /api/process (Source Code)
[ Backend Bridge: FastAPI (Port 8000) ]
                       │
                       ▼  Temporary File Stream / Pipe
[ Core Lex Engine: lex/remover.exe (Compiled from remover.l) ]
                       │
                       ├─► Evaluates %x Start Condition States
                       ├─► Strips // and /* ... */ Comments
                       ├─► Eliminates Blank Lines & Extra Spaces
                       ├─► Computes Lexical Reduction Metrics
                       ▼
[ Clean Preprocessed Code + Detailed Metrics returned to Web UI ]
```

---

## 📐 Formal Mealy Machine Specification

The preprocessor is formally modeled as a 6-tuple Mealy Machine:
$$M = \langle Q, \Sigma, \Delta, \delta, \lambda, q_0 \rangle$$

### 1. States $Q$ (10 States)
| State | Type | Description |
| :--- | :--- | :--- |
| `CODE` ($q_0$) | Initial / Accepting | Normal source code parsing |
| `SLASH` | Intermediate | Pending slash; disambiguating division vs. comment start |
| `LINE_COMMENT` | Comment | Inside single-line comment `// ...` |
| `BLOCK_COMMENT` | Comment | Inside multi-line block comment `/* ...` |
| `BLOCK_COMMENT_STAR` | Intermediate | Seen `*` inside block comment, testing next for `/` |
| `STRING_LITERAL` | Literal | Inside double quotes `"..."` (comments & spaces preserved) |
| `STRING_ESCAPE` | Literal | Escape sequence `\` inside string literal |
| `CHAR_LITERAL` | Literal | Inside single quotes `'...'` |
| `CHAR_ESCAPE` | Literal | Escape sequence `\` inside char literal |
| `WHITESPACE` | Accepting | Collapsing consecutive spaces and tabs |

---

## 📁 Repository Structure

```
compiler-construction-fsm/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── fsm/                   # Formal FSM Engine & Transition Matrix
│   │   │   ├── engine.py          # Character-by-character trace generator
│   │   │   ├── states.py          # 10 formal FSM states
│   │   │   └── table.py           # Formal transition matrix definition
│   │   ├── lex_engine.py          # Subprocess bridge executing remover.exe
│   │   ├── main.py                # FastAPI endpoints & CORS
│   │   └── models.py              # Pydantic schemas
│   ├── tests/
│   │   └── test_fsm.py            # Automated pytest test cases (100% passing)
│   ├── requirements.txt           # Python dependencies
│   └── run.py                     # Backend server launcher
│
├── frontend/                      # React + Vite Web UI
│   ├── src/
│   │   ├── api/client.js          # REST client communicating with FastAPI
│   │   ├── components/            # UI components (Panes, Stepper, Metrics, Matrix, LexViewer)
│   │   ├── utils/presets.js       # 5 built-in compiler test suites
│   │   ├── App.jsx                # Main application dashboard
│   │   └── index.css              # Tailwind CSS v4 styling
│   ├── package.json
│   └── vite.config.js
│
├── lex/                           # Core Compiler Lex / Flex Module
│   ├── remover.l                  # Formal Lex specification with %x states & JSON output
│   ├── remover.exe                # Native compiled binary
│   ├── input_test.c               # Comprehensive C test suite
│   ├── Makefile                   # Linux / macOS build script
│   ├── compile.bat                # Windows build script
│   └── README.md                  # Lex documentation & compilation guide
│
├── Project_Report.pdf             # Formal 3-page academic project report (PDF)
├── Project_Report.docx            # Formal academic project report (Word)
├── start_project.bat              # 1-Click launcher script for Windows
├── .gitignore
└── README.md                      # Project documentation
```

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launch (Windows)
Double-click **`start_project.bat`** in the root directory. It automatically:
1. Starts the FastAPI + Lex backend.
2. Starts the Vite React frontend.
3. Opens your browser to **http://127.0.0.1:5173**.

---

### Option 2: Manual Terminal Execution

#### 1. Start the Backend:
```bash
python backend/run.py
```
*API & Swagger UI: http://127.0.0.1:8000/docs*

#### 2. Start the Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Web Application: http://127.0.0.1:5173*

---

### Option 3: Running the Native Lex Engine from CLI
```bash
cd lex
remover.exe input_test.c
```
*Or with JSON output for tool integration:*
```bash
remover.exe --json input_test.c
```

---

## 🧪 Test Results & Benchmark

| Test Suite | Input Bytes | Output Bytes | Bytes Removed | Reduction % | Comments Stripped | Blank Lines Eliminated |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Mixed Comments** | 563 B | 312 B | 251 B | **44.58%** | 6 total | 7 lines |
| **2. Strings & URLs** | 486 B | 321 B | 165 B | **33.95%** | 3 total | 5 lines |
| **3. Division Operators** | 412 B | 288 B | 124 B | **30.10%** | 3 total | 4 lines |
| **4. Messy Whitespace** | 389 B | 168 B | 221 B | **56.81%** | 2 total | 12 lines |
| **5. Comprehensive Suite** | 805 B | 377 B | 428 B | **53.17%** | 8 total | 9 lines |

---

## 📜 Academic Documentation

The complete academic project report is available in the repository:
- **[Project_Report.pdf](Project_Report.pdf)** (Ready-to-print submission format)
- **[Project_Report.docx](Project_Report.docx)** (Editable Microsoft Word format)

---

## 📄 License
This project is open-source under the **MIT License**.
