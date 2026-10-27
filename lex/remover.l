%{
/*
 * Compiler Construction Project
 * Module: Comment and Whitespace Remover Using Lex / Flex
 *
 * Description:
 *   This Lex program uses Exclusive Start Conditions (%x) to implement
 *   a Finite State Automata (FSM) that strips:
 *     1. Single-line comments (// ...)
 *     2. Multi-line block comments (/\* ... *\/)
 *     3. Redundant consecutive whitespaces and tabs
 *     4. Configurable whitespace handling:
 *        - Normalize: Condenses spaces, eliminates blank lines
 *        - Minify: Strips indentation, compresses lines, eliminates blank lines
 *        - Preserve: Preserves indentation, spacing, and newlines
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Statistics & Counters */
static int single_line_comments = 0;
static int multi_line_comments = 0;
static int whitespace_removed = 0;
static int total_chars_in = 0;
static int total_chars_out = 0;

static int json_mode = 0;
/* 0 = normalize, 1 = minify, 2 = preserve */
static int ws_mode = 0;

static char *output_buffer = NULL;
static size_t output_cap = 0;
static size_t output_len = 0;

/* Line buffer for normalize / minify modes */
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
        output_buffer[output_len] = '\0';
    } else {
        putchar(c);
    }
}

static void write_char(char c) {
    if (ws_mode == 2) {
        /* Preserve mode: emit character verbatim without filtering */
        emit_raw(c);
        return;
    }

    if (c == '\n') {
        int has_content = 0;
        for (size_t i = 0; i < line_len; i++) {
            if (line_buf[i] != ' ' && line_buf[i] != '\t' && line_buf[i] != '\r') {
                has_content = 1;
                break;
            }
        }
        if (has_content) {
            size_t start = 0;
            if (ws_mode == 1) {
                /* Minify mode: strip leading indentation */
                while (start < line_len && (line_buf[start] == ' ' || line_buf[start] == '\t')) {
                    start++;
                    whitespace_removed++;
                }
            }
            /* Strip trailing spaces from line */
            while (line_len > start && (line_buf[line_len - 1] == ' ' || line_buf[line_len - 1] == '\t' || line_buf[line_len - 1] == '\r')) {
                line_len--;
                whitespace_removed++;
            }
            for (size_t i = start; i < line_len; i++) {
                emit_raw(line_buf[i]);
            }
            emit_raw('\n');
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
    if (ws_mode == 2) {
        return;
    }

    if (line_len > 0) {
        int has_content = 0;
        for (size_t i = 0; i < line_len; i++) {
            if (line_buf[i] != ' ' && line_buf[i] != '\t' && line_buf[i] != '\r') {
                has_content = 1;
                break;
            }
        }
        if (has_content) {
            size_t start = 0;
            if (ws_mode == 1) {
                while (start < line_len && (line_buf[start] == ' ' || line_buf[start] == '\t')) {
                    start++;
                    whitespace_removed++;
                }
            }
            while (line_len > start && (line_buf[line_len - 1] == ' ' || line_buf[line_len - 1] == '\t' || line_buf[line_len - 1] == '\r')) {
                line_len--;
                whitespace_removed++;
            }
            for (size_t i = start; i < line_len; i++) {
                emit_raw(line_buf[i]);
            }
            emit_raw('\n');
        } else {
            whitespace_removed += (int)line_len;
        }
        line_len = 0;
    }
}

static void write_str(const char *s) {
    while (*s) {
        write_char(*s++);
    }
}
%}

%option noyywrap

/* Exclusive start states representing FSM states */
%x SINGLE_LINE_COMMENT
%x MULTI_LINE_COMMENT
%x STRING_LITERAL
%x CHAR_LITERAL

%%

    /* ======================================================== */
    /* 1. INITIAL STATE (Standard Source Code)                 */
    /* ======================================================== */

    /* Single-line comment start: // */
"//" {
    total_chars_in += yyleng;
    single_line_comments++;
    BEGIN(SINGLE_LINE_COMMENT);
}

    /* Multi-line block comment start: /* */
"/*" {
    total_chars_in += yyleng;
    multi_line_comments++;
    BEGIN(MULTI_LINE_COMMENT);
}

    /* Double-quoted string literal: "..." */
\" {
    total_chars_in += yyleng;
    write_char('"');
    BEGIN(STRING_LITERAL);
}

    /* Single-quoted character literal: '...' */
\' {
    total_chars_in += yyleng;
    write_char('\'');
    BEGIN(CHAR_LITERAL);
}

    /* Spaces and tabs handling */
[ \t]+ {
    total_chars_in += yyleng;
    if (ws_mode == 2) {
        /* Preserve mode: emit all spaces/tabs exactly */
        for (int k = 0; k < yyleng; k++) {
            write_char(yytext[k]);
        }
    } else {
        /* Normalize/Minify: collapse to single space */
        write_char(' ');
        whitespace_removed += (yyleng - 1);
    }
}

    /* Newline handling */
\r?\n {
    total_chars_in += yyleng;
    write_char('\n');
}

    /* Standard code characters */
. {
    total_chars_in += yyleng;
    write_char(yytext[0]);
}

    /* ======================================================== */
    /* 2. SINGLE_LINE_COMMENT STATE                             */
    /* ======================================================== */

<SINGLE_LINE_COMMENT>\r?\n {
    total_chars_in += yyleng;
    write_char('\n');
    BEGIN(INITIAL);
}

<SINGLE_LINE_COMMENT>. {
    total_chars_in += yyleng;
}

    /* ======================================================== */
    /* 3. MULTI_LINE_COMMENT STATE                              */
    /* ======================================================== */

<MULTI_LINE_COMMENT>"*/" {
    total_chars_in += yyleng;
    if (ws_mode != 2) {
        write_char(' ');
    }
    BEGIN(INITIAL);
}

<MULTI_LINE_COMMENT>\r?\n {
    total_chars_in += yyleng;
}

<MULTI_LINE_COMMENT>. {
    total_chars_in += yyleng;
}

<MULTI_LINE_COMMENT><<EOF>> {
    if (!json_mode) {
        fprintf(stderr, "\n[LEXICAL WARNING] Unterminated block comment '/*' reached EOF!\n");
    }
    BEGIN(INITIAL);
}

    /* ======================================================== */
    /* 4. STRING_LITERAL STATE (Preserve verbatim)             */
    /* ======================================================== */

<STRING_LITERAL>\\\" {
    total_chars_in += yyleng;
    write_str("\\\"");
}

<STRING_LITERAL>\\\\ {
    total_chars_in += yyleng;
    write_str("\\\\");
}

<STRING_LITERAL>\" {
    total_chars_in += yyleng;
    write_char('"');
    BEGIN(INITIAL);
}

<STRING_LITERAL>\r?\n {
    total_chars_in += yyleng;
    write_char('\n');
}

<STRING_LITERAL>. {
    total_chars_in += yyleng;
    write_char(yytext[0]);
}

<STRING_LITERAL><<EOF>> {
    if (!json_mode) {
        fprintf(stderr, "\n[LEXICAL WARNING] Unterminated string literal '\"' reached EOF!\n");
    }
    BEGIN(INITIAL);
}

    /* ======================================================== */
    /* 5. CHAR_LITERAL STATE (Preserve verbatim)               */
    /* ======================================================== */

<CHAR_LITERAL>\\\' {
    total_chars_in += yyleng;
    write_str("\\\'");
}

<CHAR_LITERAL>\\\\ {
    total_chars_in += yyleng;
    write_str("\\\\");
}

<CHAR_LITERAL>\' {
    total_chars_in += yyleng;
    write_char('\'');
    BEGIN(INITIAL);
}

<CHAR_LITERAL>. {
    total_chars_in += yyleng;
    write_char(yytext[0]);
}

%%

int main(int argc, char **argv) {
    const char *input_path = NULL;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--json") == 0 || strcmp(argv[i], "-j") == 0) {
            json_mode = 1;
        } else if (strcmp(argv[i], "--mode") == 0 && i + 1 < argc) {
            i++;
            if (strcmp(argv[i], "preserve") == 0) {
                ws_mode = 2;
            } else if (strcmp(argv[i], "minify") == 0) {
                ws_mode = 1;
            } else {
                ws_mode = 0;
            }
        } else if (!input_path) {
            input_path = argv[i];
        }
    }

    if (input_path) {
        FILE *fp = fopen(input_path, "r");
        if (!fp) {
            if (json_mode) {
                printf("{\"success\":false,\"error\":\"Could not open input file\"}\n");
            } else {
                perror("Error opening input file");
            }
            return 1;
        }
        yyin = fp;
    }

    if (!json_mode) {
        printf("=========================================================\n");
        printf("  Compiler Construction: Comment & Whitespace Remover   \n");
        printf("  Module: Lex / Flex Implementation                     \n");
        printf("=========================================================\n\n");

        if (input_path) {
            printf("[INFO] Processing file: %s (Mode: %s)\n\n", input_path, 
                   ws_mode == 2 ? "Preserve" : (ws_mode == 1 ? "Minify" : "Normalize"));
        } else {
            printf("[INFO] Reading from standard input (stdin)...\n\n");
        }

        printf("--- [CLEANED OUTPUT STREAM START] ---\n");
    }

    yylex();
    flush_remaining_line();

    if (!json_mode) {
        printf("--- [CLEANED OUTPUT STREAM END] ---\n\n");
        printf("=========================================================\n");
        printf("              COMPILER PREPROCESSOR METRICS              \n");
        printf("=========================================================\n");
        printf("  Original Characters:           %d\n", total_chars_in);
        printf("  Cleaned Characters:            %d\n", total_chars_out);
        printf("  Characters Removed:            %d\n", total_chars_in - total_chars_out);
        if (total_chars_in > 0) {
            float reduction = ((float)(total_chars_in - total_chars_out) / total_chars_in) * 100.0f;
            printf("  Reduction Percentage:          %.2f%%\n", reduction);
        }
        printf("  Single-Line Comments (//):     %d removed\n", single_line_comments);
        printf("  Multi-Line Comments (/* */):   %d removed\n", multi_line_comments);
        printf("  Whitespace Normalizations:     %d chars reduced\n", whitespace_removed);
        printf("=========================================================\n");
    } else {
        printf("{\n");
        printf("  \"success\": true,\n");
        printf("  \"engine\": \"Lex / Flex (remover.exe)\",\n");
        printf("  \"mode\": \"%s\",\n", ws_mode == 2 ? "preserve" : (ws_mode == 1 ? "minify" : "normalize"));
        printf("  \"cleaned_code\": \"");
        if (output_buffer) {
            for (size_t i = 0; i < output_len; i++) {
                char ch = output_buffer[i];
                if (ch == '\\') printf("\\\\");
                else if (ch == '"') printf("\\\"");
                else if (ch == '\n') printf("\\n");
                else if (ch == '\r') printf("\\r");
                else if (ch == '\t') printf("\\t");
                else putchar(ch);
            }
        }
        printf("\",\n");
        printf("  \"metrics\": {\n");
        printf("    \"original_length\": %d,\n", total_chars_in);
        printf("    \"cleaned_length\": %d,\n", total_chars_out);
        printf("    \"chars_removed\": %d,\n", total_chars_in - total_chars_out);
        float red = total_chars_in > 0 ? ((float)(total_chars_in - total_chars_out) / total_chars_in) * 100.0f : 0.0f;
        printf("    \"reduction_percentage\": %.2f,\n", red);
        printf("    \"single_line_comments_removed\": %d,\n", single_line_comments);
        printf("    \"multi_line_comments_removed\": %d,\n", multi_line_comments);
        printf("    \"whitespace_chars_removed\": %d\n", whitespace_removed);
        printf("  }\n");
        printf("}\n");

        if (output_buffer) {
            free(output_buffer);
        }
    }

    return 0;
}
