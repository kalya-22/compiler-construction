"""Formal FSM Transition Table and Metadata for Compiler Construction."""
from typing import Dict, Any, List
from .states import FSMState

# Character classes for the transition matrix
CHAR_CLASSES = [
    {"id": "slash", "label": "/", "example": "/"},
    {"id": "star", "label": "*", "example": "*"},
    {"id": "quote", "label": '"', "example": '"'},
    {"id": "single_quote", "label": "'", "example": "'"},
    {"id": "backslash", "label": "\\", "example": "\\"},
    {"id": "newline", "label": "\\n", "example": "\n"},
    {"id": "whitespace", "label": "[ \\t]", "example": " "},
    {"id": "other", "label": "other", "example": "a-z, 0-9, etc."}
]

# Transition table mapping: (current_state, char_class) -> (next_state, action_description)
TRANSITION_TABLE: Dict[str, Dict[str, Dict[str, str]]] = {
    FSMState.CODE.value: {
        "slash": {"next": FSMState.SLASH.value, "action": "Buffer '/' without emitting"},
        "star": {"next": FSMState.CODE.value, "action": "Emit '*'"},
        "quote": {"next": FSMState.STRING_LITERAL.value, "action": "Emit '\"'"},
        "single_quote": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit '\\''"},
        "backslash": {"next": FSMState.CODE.value, "action": "Emit '\\\\'"},
        "newline": {"next": FSMState.CODE.value, "action": "Emit '\\n'"},
        "whitespace": {"next": FSMState.WHITESPACE.value, "action": "Emit ' ' (normalize mode)"},
        "other": {"next": FSMState.CODE.value, "action": "Emit char"}
    },
    FSMState.SLASH.value: {
        "slash": {"next": FSMState.LINE_COMMENT.value, "action": "Discard buffered '/'; start line comment"},
        "star": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard buffered '/'; start block comment"},
        "quote": {"next": FSMState.STRING_LITERAL.value, "action": "Emit buffered '/' + '\"'"},
        "single_quote": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit buffered '/' + '\\''"},
        "backslash": {"next": FSMState.CODE.value, "action": "Emit buffered '/' + '\\\\'"},
        "newline": {"next": FSMState.CODE.value, "action": "Emit buffered '/' + '\\n'"},
        "whitespace": {"next": FSMState.WHITESPACE.value, "action": "Emit buffered '/' + ' '"},
        "other": {"next": FSMState.CODE.value, "action": "Emit buffered '/' + char (division operator)"}
    },
    FSMState.LINE_COMMENT.value: {
        "slash": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"},
        "star": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"},
        "quote": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"},
        "single_quote": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"},
        "backslash": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"},
        "newline": {"next": FSMState.CODE.value, "action": "Emit '\\n' (end of line comment)"},
        "whitespace": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"},
        "other": {"next": FSMState.LINE_COMMENT.value, "action": "Discard char"}
    },
    FSMState.BLOCK_COMMENT.value: {
        "slash": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char"},
        "star": {"next": FSMState.BLOCK_COMMENT_STAR.value, "action": "Discard char, check next for '/'"},
        "quote": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char"},
        "single_quote": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char"},
        "backslash": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char"},
        "newline": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char (or track line count)"},
        "whitespace": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char"},
        "other": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char"}
    },
    FSMState.BLOCK_COMMENT_STAR.value: {
        "slash": {"next": FSMState.CODE.value, "action": "Emit ' ' (token separator); end block comment"},
        "star": {"next": FSMState.BLOCK_COMMENT_STAR.value, "action": "Discard char, stay in star check"},
        "quote": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char, return to block body"},
        "single_quote": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char, return to block body"},
        "backslash": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char, return to block body"},
        "newline": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char, return to block body"},
        "whitespace": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char, return to block body"},
        "other": {"next": FSMState.BLOCK_COMMENT.value, "action": "Discard char, return to block body"}
    },
    FSMState.STRING_LITERAL.value: {
        "slash": {"next": FSMState.STRING_LITERAL.value, "action": "Emit '/' (preserve in string)"},
        "star": {"next": FSMState.STRING_LITERAL.value, "action": "Emit '*' (preserve in string)"},
        "quote": {"next": FSMState.CODE.value, "action": "Emit '\"' (closing string quote)"},
        "single_quote": {"next": FSMState.STRING_LITERAL.value, "action": "Emit '\\'' (preserve in string)"},
        "backslash": {"next": FSMState.STRING_ESCAPE.value, "action": "Emit '\\\\' (start escape sequence)"},
        "newline": {"next": FSMState.STRING_LITERAL.value, "action": "Emit '\\n' (preserve in string)"},
        "whitespace": {"next": FSMState.STRING_LITERAL.value, "action": "Emit whitespace verbatim"},
        "other": {"next": FSMState.STRING_LITERAL.value, "action": "Emit char verbatim"}
    },
    FSMState.STRING_ESCAPE.value: {
        "slash": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped '/'"},
        "star": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped '*'"},
        "quote": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped '\"'"},
        "single_quote": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped '\\''"},
        "backslash": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped '\\\\'"},
        "newline": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped '\\n'"},
        "whitespace": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped whitespace"},
        "other": {"next": FSMState.STRING_LITERAL.value, "action": "Emit escaped char"}
    },
    FSMState.CHAR_LITERAL.value: {
        "slash": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit '/' (preserve in char literal)"},
        "star": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit '*' (preserve in char literal)"},
        "quote": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit '\"' (preserve in char literal)"},
        "single_quote": {"next": FSMState.CODE.value, "action": "Emit '\\'' (closing char quote)"},
        "backslash": {"next": FSMState.CHAR_ESCAPE.value, "action": "Emit '\\\\' (start escape sequence)"},
        "newline": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit '\\n'"},
        "whitespace": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit whitespace verbatim"},
        "other": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit char verbatim"}
    },
    FSMState.CHAR_ESCAPE.value: {
        "slash": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped '/'"},
        "star": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped '*'"},
        "quote": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped '\"'"},
        "single_quote": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped '\\''"},
        "backslash": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped '\\\\'"},
        "newline": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped '\\n'"},
        "whitespace": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped whitespace"},
        "other": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit escaped char"}
    },
    FSMState.WHITESPACE.value: {
        "slash": {"next": FSMState.SLASH.value, "action": "Buffer '/'"},
        "star": {"next": FSMState.CODE.value, "action": "Emit '*'"},
        "quote": {"next": FSMState.STRING_LITERAL.value, "action": "Emit '\"'"},
        "single_quote": {"next": FSMState.CHAR_LITERAL.value, "action": "Emit '\\''"},
        "backslash": {"next": FSMState.CODE.value, "action": "Emit '\\\\'"},
        "newline": {"next": FSMState.CODE.value, "action": "Emit '\\n'"},
        "whitespace": {"next": FSMState.WHITESPACE.value, "action": "Discard consecutive whitespace"},
        "other": {"next": FSMState.CODE.value, "action": "Emit char"}
    }
}

def generate_mermaid_diagram() -> str:
    """Generate Mermaid state diagram string for frontend visualization."""
    return """stateDiagram-v2
    [*] --> CODE
    CODE --> SLASH: '/' [buffer '/']
    CODE --> STRING_LITERAL: '\"' [emit '\"']
    CODE --> CHAR_LITERAL: '\'' [emit '\'']
    CODE --> WHITESPACE: space/tab [emit single ' ']
    CODE --> CODE: other / newline [emit]

    SLASH --> LINE_COMMENT: '/' [discard '//']
    SLASH --> BLOCK_COMMENT: '*' [discard '/*']
    SLASH --> CODE: other [emit '/' + char]
    SLASH --> STRING_LITERAL: '\"' [emit '/' + '\"']
    SLASH --> CHAR_LITERAL: '\'' [emit '/' + '\'']
    SLASH --> WHITESPACE: space/tab [emit '/' + ' ']

    LINE_COMMENT --> CODE: '\\n' [emit '\\n']
    LINE_COMMENT --> LINE_COMMENT: other [discard]

    BLOCK_COMMENT --> BLOCK_COMMENT_STAR: '*' [check closing]
    BLOCK_COMMENT --> BLOCK_COMMENT: other [discard]

    BLOCK_COMMENT_STAR --> CODE: '/' [emit ' '; close block]
    BLOCK_COMMENT_STAR --> BLOCK_COMMENT_STAR: '*' [discard]
    BLOCK_COMMENT_STAR --> BLOCK_COMMENT: other [discard]

    STRING_LITERAL --> STRING_ESCAPE: '\\\\' [emit '\\\\']
    STRING_LITERAL --> CODE: '\"' [emit '\"']
    STRING_LITERAL --> STRING_LITERAL: other [emit]

    STRING_ESCAPE --> STRING_LITERAL: any char [emit escaped char]

    CHAR_LITERAL --> CHAR_ESCAPE: '\\\\' [emit '\\\\']
    CHAR_LITERAL --> CODE: '\'' [emit '\'']
    CHAR_LITERAL --> CHAR_LITERAL: other [emit]

    CHAR_ESCAPE --> CHAR_LITERAL: any char [emit escaped char]

    WHITESPACE --> WHITESPACE: space/tab [discard]
    WHITESPACE --> SLASH: '/' [buffer '/']
    WHITESPACE --> CODE: newline/other [emit char]
    WHITESPACE --> STRING_LITERAL: '\"' [emit '\"']
    WHITESPACE --> CHAR_LITERAL: '\'' [emit '\'']
"""

def get_fsm_definition() -> Dict[str, Any]:
    """
    Return formal 6-tuple definition and visualization metadata for Compiler Construction:
    M = (Q, Sigma, Delta, delta, lambda, q0)
    """
    states_meta = [
        {"id": FSMState.CODE.value, "label": "Normal Code", "description": "Processing standard program tokens", "initial": True, "accepting": True},
        {"id": FSMState.SLASH.value, "label": "Pending Slash", "description": "Encountered '/' - disambiguating division vs comment start", "initial": False, "accepting": False},
        {"id": FSMState.LINE_COMMENT.value, "label": "Line Comment", "description": "Consuming '//' single-line comment until newline", "initial": False, "accepting": False},
        {"id": FSMState.BLOCK_COMMENT.value, "label": "Block Comment", "description": "Consuming '/*' multi-line comment", "initial": False, "accepting": False},
        {"id": FSMState.BLOCK_COMMENT_STAR.value, "label": "Block Comment Star", "description": "Encountered '*' inside block comment; testing for '/' closing", "initial": False, "accepting": False},
        {"id": FSMState.STRING_LITERAL.value, "label": "String Literal", "description": "Inside double quotes; preserving comments and whitespaces intact", "initial": False, "accepting": False},
        {"id": FSMState.STRING_ESCAPE.value, "label": "String Escape", "description": "Encountered '\\' escape inside string literal", "initial": False, "accepting": False},
        {"id": FSMState.CHAR_LITERAL.value, "label": "Character Literal", "description": "Inside single quotes; preserving characters verbatim", "initial": False, "accepting": False},
        {"id": FSMState.CHAR_ESCAPE.value, "label": "Char Escape", "description": "Encountered '\\' escape inside character literal", "initial": False, "accepting": False},
        {"id": FSMState.WHITESPACE.value, "label": "Whitespace Reducer", "description": "Collapsing consecutive whitespaces and tabs", "initial": False, "accepting": True},
    ]

    return {
        "machine_type": "Mealy Machine (M = <Q, Σ, Δ, δ, λ, q0>)",
        "initial_state": FSMState.CODE.value,
        "accepting_states": [FSMState.CODE.value, FSMState.WHITESPACE.value],
        "states": states_meta,
        "char_classes": CHAR_CLASSES,
        "transitions": TRANSITION_TABLE,
        "mermaid_diagram": generate_mermaid_diagram()
    }
