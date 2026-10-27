"""Core Finite State Machine (Mealy Machine) for Comment and Whitespace Removal."""
from typing import List, Dict, Any, Optional, Tuple
from .states import FSMState

class TraceStep:
    def __init__(
        self,
        step: int,
        line: int,
        col: int,
        char: str,
        from_state: str,
        to_state: str,
        action: str,
        emitted: str = ""
    ):
        self.step = step
        self.line = line
        self.col = col
        self.char = char
        self.from_state = from_state
        self.to_state = to_state
        self.action = action
        self.emitted = emitted

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step": self.step,
            "line": self.line,
            "col": self.col,
            "char": self.char,
            "from_state": self.from_state,
            "to_state": self.to_state,
            "action": self.action,
            "emitted": self.emitted
        }

class FSMEngine:
    """
    Finite State Machine for lexical preprocessing (comment and whitespace removal).
    Modeled as a Mealy Machine with output emitted on state transitions.
    """

    def __init__(
        self,
        whitespace_mode: str = "normalize",  # "preserve", "normalize", "minify"
        collect_trace: bool = False,
        max_trace_steps: int = 500
    ):
        self.whitespace_mode = whitespace_mode.lower()
        self.collect_trace = collect_trace
        self.max_trace_steps = max_trace_steps

        # State tracking
        self.state: FSMState = FSMState.CODE
        self.line: int = 1
        self.col: int = 1
        self.step_counter: int = 0

        # Output buffer
        self.output_buffer: List[str] = []
        self.trace: List[Dict[str, Any]] = []

        # Statistics and counters
        self.single_line_comments_count: int = 0
        self.multi_line_comments_count: int = 0
        self.comment_chars_removed: int = 0
        self.whitespace_chars_removed: int = 0

        # Syntax / Lexical warnings
        self.warnings: List[str] = []

    def _format_char(self, ch: str) -> str:
        if ch == "\n":
            return "\\n"
        if ch == "\t":
            return "\\t"
        if ch == "\r":
            return "\\r"
        if ch == " ":
            return "[space]"
        return ch

    def _record_step(
        self,
        char: str,
        from_state: FSMState,
        to_state: FSMState,
        action: str,
        emitted: str = ""
    ) -> None:
        if not self.collect_trace:
            return
        if self.step_counter >= self.max_trace_steps:
            return
        self.step_counter += 1
        step = TraceStep(
            step=self.step_counter,
            line=self.line,
            col=self.col,
            char=self._format_char(char),
            from_state=from_state.value,
            to_state=to_state.value,
            action=action,
            emitted=self._format_char(emitted) if emitted else ""
        )
        self.trace.append(step.to_dict())

    def _emit(self, text: str) -> None:
        self.output_buffer.append(text)

    def process(self, source_code: str) -> Tuple[str, Dict[str, Any]]:
        """
        Executes the FSM over the input character stream.
        Returns cleaned source code string and execution statistics/trace.
        """
        self.state = FSMState.CODE
        self.line = 1
        self.col = 1
        self.step_counter = 0
        self.output_buffer = []
        self.trace = []
        self.warnings = []
        self.single_line_comments_count = 0
        self.multi_line_comments_count = 0
        self.comment_chars_removed = 0
        self.whitespace_chars_removed = 0

        i = 0
        n = len(source_code)

        while i < n:
            ch = source_code[i]
            prev_state = self.state

            # Coordinate updates
            current_line = self.line
            current_col = self.col
            if ch == "\n":
                self.line += 1
                self.col = 1
            else:
                self.col += 1

            if self.state == FSMState.CODE:
                if ch == "/":
                    self.state = FSMState.SLASH
                    self._record_step(ch, prev_state, self.state, "Buffer '/' pending comment disambiguation")
                elif ch == '"':
                    self.state = FSMState.STRING_LITERAL
                    self._emit('"')
                    self._record_step(ch, prev_state, self.state, "Enter double-quoted string literal", '"')
                elif ch == "'":
                    self.state = FSMState.CHAR_LITERAL
                    self._emit("'")
                    self._record_step(ch, prev_state, self.state, "Enter character literal", "'")
                elif ch in (" ", "\t"):
                    if self.whitespace_mode == "preserve":
                        self._emit(ch)
                        self._record_step(ch, prev_state, self.state, "Preserve whitespace verbatim", ch)
                    else:
                        # Normalize or Minify: emit single space, enter WHITESPACE state to suppress consecutive
                        self.state = FSMState.WHITESPACE
                        self._emit(" ")
                        self._record_step(ch, prev_state, self.state, "Emit normalized single space", " ")
                elif ch == "\r":
                    # Ignore carriage return in normalization
                    if self.whitespace_mode == "preserve":
                        self._emit(ch)
                    else:
                        self.whitespace_chars_removed += 1
                elif ch == "\n":
                    self._emit("\n")
                    self._record_step(ch, prev_state, self.state, "Emit newline", "\n")
                else:
                    self._emit(ch)
                    self._record_step(ch, prev_state, self.state, f"Emit standard token char '{ch}'", ch)

            elif self.state == FSMState.SLASH:
                if ch == "/":
                    # Single-line comment started: //
                    self.single_line_comments_count += 1
                    self.comment_chars_removed += 2  # for both slashes
                    self.state = FSMState.LINE_COMMENT
                    self._record_step(ch, prev_state, self.state, "Start single-line comment '//'; discard slashes")
                elif ch == "*":
                    # Multi-line block comment started: /*
                    self.multi_line_comments_count += 1
                    self.comment_chars_removed += 2  # for /*
                    self.state = FSMState.BLOCK_COMMENT
                    self._record_step(ch, prev_state, self.state, "Start block comment '/*'; discard '/*'")
                else:
                    # It was a division operator '/'
                    # Emit the buffered '/'
                    self._emit("/")
                    # Handle ch in CODE state
                    if ch == '"':
                        self.state = FSMState.STRING_LITERAL
                        self._emit('"')
                        self._record_step(ch, prev_state, self.state, "Emit '/' (division) then enter string", '/"')
                    elif ch == "'":
                        self.state = FSMState.CHAR_LITERAL
                        self._emit("'")
                        self._record_step(ch, prev_state, self.state, "Emit '/' (division) then enter char literal", "/'")
                    elif ch in (" ", "\t"):
                        if self.whitespace_mode == "preserve":
                            self._emit(ch)
                            self.state = FSMState.CODE
                            self._record_step(ch, prev_state, self.state, "Emit '/' (division) and whitespace", f"/{ch}")
                        else:
                            self._emit(" ")
                            self.state = FSMState.WHITESPACE
                            self._record_step(ch, prev_state, self.state, "Emit '/' (division) and enter WHITESPACE", "/ ")
                    elif ch == "/":
                        # Two slashes separated? Stay in SLASH
                        self.state = FSMState.SLASH
                        self._record_step(ch, prev_state, self.state, "Emit previous '/', buffer new '/'", "/")
                    elif ch == "\n":
                        self._emit("\n")
                        self.state = FSMState.CODE
                        self._record_step(ch, prev_state, self.state, "Emit '/' (division) and newline", "/\n")
                    else:
                        self._emit(ch)
                        self.state = FSMState.CODE
                        self._record_step(ch, prev_state, self.state, f"Emit '/' (division) + '{ch}'", f"/{ch}")

            elif self.state == FSMState.LINE_COMMENT:
                if ch == "\n":
                    # End of single line comment. Keep newline to preserve code line structure.
                    self.state = FSMState.CODE
                    self._emit("\n")
                    self._record_step(ch, prev_state, self.state, "End of line comment; emit newline", "\n")
                else:
                    self.comment_chars_removed += 1
                    self._record_step(ch, prev_state, self.state, "Discard line comment content")

            elif self.state == FSMState.BLOCK_COMMENT:
                if ch == "*":
                    self.comment_chars_removed += 1
                    self.state = FSMState.BLOCK_COMMENT_STAR
                    self._record_step(ch, prev_state, self.state, "Encountered '*' in block comment; test next for '/'")
                else:
                    self.comment_chars_removed += 1
                    self._record_step(ch, prev_state, self.state, "Discard block comment content")

            elif self.state == FSMState.BLOCK_COMMENT_STAR:
                if ch == "/":
                    # End of block comment */
                    self.comment_chars_removed += 1
                    # In compiler lexical analysis, block comments separate tokens: e.g. int/*comment*/x -> int x
                    if self.whitespace_mode != "preserve":
                        if not self.output_buffer or not self.output_buffer[-1].endswith((" ", "\t", "\n")):
                            self._emit(" ")
                            self.state = FSMState.WHITESPACE
                            self._record_step(ch, prev_state, self.state, "End block comment '*/'; emit token boundary space", " ")
                        else:
                            self.state = FSMState.WHITESPACE
                            self._record_step(ch, prev_state, self.state, "End block comment '*/'")
                    else:
                        self.state = FSMState.CODE
                        self._record_step(ch, prev_state, self.state, "End block comment '*/'")
                elif ch == "*":
                    # Consecutive stars e.g. /***
                    self.comment_chars_removed += 1
                    self.state = FSMState.BLOCK_COMMENT_STAR
                    self._record_step(ch, prev_state, self.state, "Consecutive '*' in block comment; stay in check")
                else:
                    self.comment_chars_removed += 1
                    self.state = FSMState.BLOCK_COMMENT
                    self._record_step(ch, prev_state, self.state, "Not closing block comment; return to block comment")

            elif self.state == FSMState.STRING_LITERAL:
                self._emit(ch)
                if ch == "\\":
                    self.state = FSMState.STRING_ESCAPE
                    self._record_step(ch, prev_state, self.state, "Escape character '\\' in string literal", "\\")
                elif ch == '"':
                    self.state = FSMState.CODE
                    self._record_step(ch, prev_state, self.state, "Closing quote '\"'; return to CODE", '"')
                else:
                    self._record_step(ch, prev_state, self.state, f"Preserve character '{ch}' in string verbatim", ch)

            elif self.state == FSMState.STRING_ESCAPE:
                self._emit(ch)
                self.state = FSMState.STRING_LITERAL
                self._record_step(ch, prev_state, self.state, f"Emit escaped char '{ch}' in string literal", ch)

            elif self.state == FSMState.CHAR_LITERAL:
                self._emit(ch)
                if ch == "\\":
                    self.state = FSMState.CHAR_ESCAPE
                    self._record_step(ch, prev_state, self.state, "Escape character '\\' in character literal", "\\")
                elif ch == "'":
                    self.state = FSMState.CODE
                    self._record_step(ch, prev_state, self.state, "Closing quote '\\''; return to CODE", "'")
                else:
                    self._record_step(ch, prev_state, self.state, f"Preserve char '{ch}' in char literal verbatim", ch)

            elif self.state == FSMState.CHAR_ESCAPE:
                self._emit(ch)
                self.state = FSMState.CHAR_LITERAL
                self._record_step(ch, prev_state, self.state, f"Emit escaped char '{ch}' in char literal", ch)

            elif self.state == FSMState.WHITESPACE:
                if ch in (" ", "\t"):
                    # Discard consecutive whitespace
                    self.whitespace_chars_removed += 1
                    self._record_step(ch, prev_state, self.state, "Discard redundant consecutive whitespace")
                elif ch == "\r":
                    self.whitespace_chars_removed += 1
                elif ch == "\n":
                    self.state = FSMState.CODE
                    self._emit("\n")
                    self._record_step(ch, prev_state, self.state, "Newline encountered; emit newline and return to CODE", "\n")
                elif ch == "/":
                    self.state = FSMState.SLASH
                    self._record_step(ch, prev_state, self.state, "Buffer '/' pending comment check")
                elif ch == '"':
                    self.state = FSMState.STRING_LITERAL
                    self._emit('"')
                    self._record_step(ch, prev_state, self.state, "Enter string literal from whitespace", '"')
                elif ch == "'":
                    self.state = FSMState.CHAR_LITERAL
                    self._emit("'")
                    self._record_step(ch, prev_state, self.state, "Enter character literal from whitespace", "'")
                else:
                    self.state = FSMState.CODE
                    self._emit(ch)
                    self._record_step(ch, prev_state, self.state, f"Emit token char '{ch}' and return to CODE", ch)

            i += 1

        # EOF Handling (End of stream)
        if self.state == FSMState.SLASH:
            self._emit("/")
            self._record_step("<EOF>", self.state, FSMState.CODE, "EOF reached with buffered '/'; emit '/'", "/")
            self.state = FSMState.CODE
        elif self.state in (FSMState.BLOCK_COMMENT, FSMState.BLOCK_COMMENT_STAR):
            self.warnings.append("Lexical Warning: Unterminated block comment '/*' at End of File.")
        elif self.state in (FSMState.STRING_LITERAL, FSMState.STRING_ESCAPE):
            self.warnings.append("Lexical Warning: Unterminated string literal '\"' at End of File.")
        elif self.state in (FSMState.CHAR_LITERAL, FSMState.CHAR_ESCAPE):
            self.warnings.append("Lexical Warning: Unterminated character literal '\\'' at End of File.")

        raw_cleaned = "".join(self.output_buffer)

        # Post-processing according to whitespace mode
        cleaned_result = self._post_process_whitespace(raw_cleaned)

        original_size = len(source_code)
        cleaned_size = len(cleaned_result)
        chars_removed = max(0, original_size - cleaned_size)
        reduction_pct = (chars_removed / original_size * 100.0) if original_size > 0 else 0.0

        metadata = {
            "original_length": original_size,
            "cleaned_length": cleaned_size,
            "chars_removed": chars_removed,
            "reduction_percentage": round(reduction_pct, 2),
            "single_line_comments_removed": self.single_line_comments_count,
            "multi_line_comments_removed": self.multi_line_comments_count,
            "comment_chars_removed": self.comment_chars_removed,
            "whitespace_chars_removed": self.whitespace_chars_removed,
            "original_lines": len(source_code.splitlines()) if source_code else 0,
            "cleaned_lines": len(cleaned_result.splitlines()) if cleaned_result else 0,
            "warnings": self.warnings,
            "trace_steps_count": len(self.trace),
            "trace_truncated": self.step_counter > self.max_trace_steps
        }

        return cleaned_result, metadata

    def _post_process_whitespace(self, code: str) -> str:
        """Applies line-level normalization or minification."""
        if self.whitespace_mode == "preserve":
            return code

        lines = code.splitlines()

        if self.whitespace_mode == "normalize":
            processed_lines = []
            prev_blank = False
            for line in lines:
                stripped = line.strip()
                if not stripped:
                    if not prev_blank and processed_lines:
                        processed_lines.append("")
                        prev_blank = True
                else:
                    processed_lines.append(line.rstrip())
                    prev_blank = False
            return "\n".join(processed_lines)

        elif self.whitespace_mode == "minify":
            # Minify: remove leading/trailing whitespace and blank lines
            processed_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped:
                    processed_lines.append(stripped)
            return "\n".join(processed_lines)

        return code
