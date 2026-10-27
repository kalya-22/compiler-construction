"""Lex / Flex Execution Bridge for Compiler Construction Backend."""
import subprocess
import json
import tempfile
from pathlib import Path
from typing import Dict, Any, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
LEX_EXE = PROJECT_ROOT / "lex" / "remover.exe"

def run_lex_remover(source_code: str, whitespace_mode: str = "normalize") -> Tuple[str, Dict[str, Any]]:
    """
    Executes the compiled Lex/Flex program (remover.exe) on the source code.
    Returns (cleaned_code, metrics_dict).
    """
    if not LEX_EXE.exists():
        raise FileNotFoundError(
            f"Compiled Lex executable not found at {LEX_EXE}. "
            "Please run 'compile.bat' in the 'lex' folder to build remover.exe."
        )

    # Write code to a temporary file for Lex's yyin file stream
    with tempfile.NamedTemporaryFile(mode="w", suffix=".c", delete=False, encoding="utf-8") as temp_file:
        temp_file.write(source_code)
        temp_path = temp_file.name

    try:
        process = subprocess.run(
            [str(LEX_EXE), "--json", "--mode", whitespace_mode.lower(), temp_path],
            capture_output=True,
            text=True,
            check=True
        )
        data = json.loads(process.stdout)
        cleaned_code = data.get("cleaned_code", "")
        metrics = data.get("metrics", {})

        metrics["original_lines"] = len(source_code.splitlines()) if source_code else 0
        metrics["cleaned_lines"] = len(cleaned_code.splitlines()) if cleaned_code else 0
        metrics["comment_chars_removed"] = max(0, metrics.get("chars_removed", 0) - metrics.get("whitespace_chars_removed", 0))
        metrics["engine"] = "Lex / Flex (remover.l -> remover.exe)"
        metrics["warnings"] = []
        metrics["trace_steps_count"] = 0
        metrics["trace_truncated"] = False

        return cleaned_code, metrics
    finally:
        try:
            Path(temp_path).unlink(missing_ok=True)
        except Exception:
            pass
