from enum import Enum

class FSMState(str, Enum):
    """
    States for the Comment and Whitespace Remover Mealy Machine.
    """
    CODE = "CODE"                         # Default source code state
    SLASH = "SLASH"                       # Encountered '/' in CODE, pending next char
    LINE_COMMENT = "LINE_COMMENT"         # Inside '//' single-line comment
    BLOCK_COMMENT = "BLOCK_COMMENT"       # Inside '/*' multi-line comment
    BLOCK_COMMENT_STAR = "BLOCK_COMMENT_STAR"  # Inside '/*' and encountered '*'
    STRING_LITERAL = "STRING_LITERAL"     # Inside double-quoted string "..."
    STRING_ESCAPE = "STRING_ESCAPE"       # Inside string following a backslash '\'
    CHAR_LITERAL = "CHAR_LITERAL"         # Inside single-quoted char '...'
    CHAR_ESCAPE = "CHAR_ESCAPE"           # Inside char literal following a backslash '\'
    WHITESPACE = "WHITESPACE"             # Collapsing consecutive spaces / tabs
