import React, { useState } from "react";
import { Copy, Check, FileCode2, BookOpen } from "lucide-react";

const LEX_CODE = `%{
/*
 * Compiler Construction Project
 * Module: Comment and Whitespace Remover Using Lex / Flex
 *
 * Description:
 *   This Lex program uses Exclusive Start Conditions (%x) to implement
 *   a Finite State Automata (FSM) that strips:
 *     1. Single-line comments (// ...)
 *     2. Multi-line block comments (/* ... */)
 *     3. Redundant consecutive whitespaces and tabs
 *     4. All blank / empty lines (including lines left empty by deleted comments)
 *
 *   While strictly preserving:
 *     - String literals ("...") including nested comment symbols
 *     - Character literals ('...')
 *     - Escaped characters (\\", \\', \\\\)
 *     - Token boundaries (int/*comment*/x -> int x)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int single_line_comments = 0;
static int multi_line_comments = 0;
static int whitespace_removed = 0;
static int total_chars_in = 0;
static int total_chars_out = 0;

static int json_mode = 0;
static char *output_buffer = NULL;
static size_t output_cap = 0;
static size_t output_len = 0;

/* Line buffer to filter out blank/empty lines */
static char line_buf[16384];
static size_t line_len = 0;

static void emit_raw(char c) {
    total_chars_out++;
    if (json_mode) {
        if (output_len + 2 >= output_cap) {
            output_cap = output_cap ? output_cap * 2 : 4096;
            output_buffer = (char *)realloc(output_buffer, output_cap);
        }
        output_buffer[output_len++] = c;
        output_buffer[output_len] = '\\0';
    } else {
        putchar(c);
    }
}

static void write_char(char c) {
    if (c == '\\n') {
        int has_content = 0;
        for (size_t i = 0; i < line_len; i++) {
            if (line_buf[i] != ' ' && line_buf[i] != '\\t' && line_buf[i] != '\\r') {
                has_content = 1;
                break;
            }
        }
        if (has_content) {
            while (line_len > 0 && (line_buf[line_len - 1] == ' ' || line_buf[line_len - 1] == '\\t' || line_buf[line_len - 1] == '\\r')) {
                line_len--;
                whitespace_removed++;
            }
            for (size_t i = 0; i < line_len; i++) {
                emit_raw(line_buf[i]);
            }
            emit_raw('\\n');
        } else {
            /* Blank line eliminated */
            whitespace_removed += (int)(line_len + 1);
        }
        line_len = 0;
    } else {
        if (line_len + 1 < sizeof(line_buf)) {
            line_buf[line_len++] = c;
        }
    }
}

static void flush_remaining_line(void) {
    if (line_len > 0) {
        int has_content = 0;
        for (size_t i = 0; i < line_len; i++) {
            if (line_buf[i] != ' ' && line_buf[i] != '\\t' && line_buf[i] != '\\r') {
                has_content = 1;
                break;
            }
        }
        if (has_content) {
            while (line_len > 0 && (line_buf[line_len - 1] == ' ' || line_buf[line_len - 1] == '\\t' || line_buf[line_len - 1] == '\\r')) {
                line_len--;
                whitespace_removed++;
            }
            for (size_t i = 0; i < line_len; i++) {
                emit_raw(line_buf[i]);
            }
            emit_raw('\\n');
        } else {
            whitespace_removed += (int)line_len;
        }
        line_len = 0;
    }
}
%}

%option noyywrap

%x SINGLE_LINE_COMMENT
%x MULTI_LINE_COMMENT
%x STRING_LITERAL
%x CHAR_LITERAL

%%

"//" {
    total_chars_in += yyleng;
    single_line_comments++;
    BEGIN(SINGLE_LINE_COMMENT);
}

"/*" {
    total_chars_in += yyleng;
    multi_line_comments++;
    BEGIN(MULTI_LINE_COMMENT);
}

\\" {
    total_chars_in += yyleng;
    write_char('"');
    BEGIN(STRING_LITERAL);
}

\\' {
    total_chars_in += yyleng;
    write_char('\\'');
    BEGIN(CHAR_LITERAL);
}

[ \\t]+ {
    total_chars_in += yyleng;
    write_char(' ');
    whitespace_removed += (yyleng - 1);
}

\\r?\\n {
    total_chars_in += yyleng;
    write_char('\\n');
}

. {
    total_chars_in += yyleng;
    write_char(yytext[0]);
}

<SINGLE_LINE_COMMENT>\\r?\\n {
    total_chars_in += yyleng;
    write_char('\\n');
    BEGIN(INITIAL);
}

<SINGLE_LINE_COMMENT>. {
    total_chars_in += yyleng;
}

<MULTI_LINE_COMMENT>"*/" {
    total_chars_in += yyleng;
    write_char(' ');
    BEGIN(INITIAL);
}

<MULTI_LINE_COMMENT>\\r?\\n {
    total_chars_in += yyleng;
}

<MULTI_LINE_COMMENT>. {
    total_chars_in += yyleng;
}

<MULTI_LINE_COMMENT><<EOF>> {
    BEGIN(INITIAL);
}

<STRING_LITERAL>\\\\\\" {
    total_chars_in += yyleng;
    write_char('\\\\');
    write_char('"');
}

<STRING_LITERAL>\\" {
    total_chars_in += yyleng;
    write_char('"');
    BEGIN(INITIAL);
}

<STRING_LITERAL>\\r?\\n {
    total_chars_in += yyleng;
    write_char('\\n');
}

<STRING_LITERAL>. {
    total_chars_in += yyleng;
    write_char(yytext[0]);
}

<CHAR_LITERAL>\\\\\\' {
    total_chars_in += yyleng;
    write_char('\\\\');
    write_char('\\'');
}

<CHAR_LITERAL>\\' {
    total_chars_in += yyleng;
    write_char('\\'');
    BEGIN(INITIAL);
}

<CHAR_LITERAL>. {
    total_chars_in += yyleng;
    write_char(yytext[0]);
}

%%

int main(int argc, char **argv) {
    if (argc > 1) {
        FILE *fp = fopen(argv[1], "r");
        if (fp) yyin = fp;
    }
    yylex();
    flush_remaining_line();
    return 0;
}`;

export default function LexViewer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(LEX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Explanation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 shadow-lg">
        <div className="flex items-center gap-2 font-semibold text-indigo-300 text-sm mb-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>FSM Implementation in Lex / Flex (Compiler Construction)</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          In compiler construction, the FSM states are implemented in Lex using{" "}
          <strong className="text-slate-200">Exclusive Start Conditions (`%x`)</strong>. Transitions occur via the{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">BEGIN(state)</code> macro when
          matching patterns like <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">&quot;//&quot;</code> or{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">&quot;/*&quot;</code>.
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-[11px]">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">1. Generate C Lexer:</span>
            <code className="text-slate-300">flex remover.l</code>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">2. Compile with GCC:</span>
            <code className="text-slate-300">gcc lex.yy.c -o remover</code>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">3. Execute:</span>
            <code className="text-slate-300">./remover input.c</code>
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <FileCode2 className="w-4 h-4 text-amber-400" />
            <span>lex/remover.l</span>
            <span className="text-slate-500 font-mono">(Lex / Flex Specification - Blank Lines Eliminated)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy .l File</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 font-mono text-xs text-amber-200/90 leading-5 overflow-auto max-h-[500px]">
          {LEX_CODE}
        </pre>
      </div>
    </div>
  );
}
