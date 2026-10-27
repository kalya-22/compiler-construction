# Comment and Whitespace Remover Using Lex / Flex

A Compiler Construction project module implementing a Lexical Analyzer (Lexer) using **Lex / Flex** with **Exclusive Start Conditions (`%x`)** to strip comments and redundant whitespaces.

---

## 1. How Lex Implements FSM States

In Lex/Flex, finite state automata (FSM) states are implemented using **Start Conditions** (`%x` for exclusive start states). This mirrors the Mealy Machine states:

| Lex Start State | Corresponding FSM State | Description |
|-----------------|-------------------------|-------------|
| `INITIAL` (default) | `CODE` | Normal source code scanning |
| `%x SINGLE_LINE_COMMENT` | `LINE_COMMENT` | Triggered by `"//"`, consumes chars until `\n` |
| `%x MULTI_LINE_COMMENT` | `BLOCK_COMMENT` | Triggered by `"/*"`, consumes chars until `"*/"` |
| `%x STRING_LITERAL` | `STRING_LITERAL` | Triggered by `\"`, preserves content and escapes `\"` |
| `%x CHAR_LITERAL` | `CHAR_LITERAL` | Triggered by `\'`, preserves character literals |

---

## 2. Directory Structure

```
lex/
├── remover.l        # Complete Lex/Flex specification file
├── input_test.c     # Test C program containing comments, strings, division, and whitespaces
├── Makefile         # Standard makefile for Linux / macOS / WSL
├── compile.bat      # Windows batch compilation script
└── README.md        # Documentation and guide
```

---

## 3. How to Compile and Run

### On Linux / macOS / WSL:
```bash
# 1. Generate C lexer code from Lex specification
flex remover.l

# 2. Compile generated C code with GCC
gcc lex.yy.c -o remover

# 3. Run against test file
./remover input_test.c
```
Or simply:
```bash
make run
```

### On Windows:
If you have **MinGW** and **WinFlexBison** or **Flex** installed:
```cmd
flex remover.l
gcc lex.yy.c -o remover.exe
remover.exe input_test.c
```
Or run `compile.bat`.

### Using Online Lex/Flex Compilers (e.g. OnlineGDB):
1. Go to [onlinegdb.com](https://www.onlinegdb.com/) or any online Lex/Flex compiler.
2. Select Language: **Lex / Flex** (or C with Flex enabled).
3. Paste the contents of `remover.l`.
4. Run!

---

## 4. Sample Output

When executed on `input_test.c`, the program produces:

```
=========================================================
  Compiler Construction: Comment & Whitespace Remover   
  Module: Lex / Flex Implementation                     
=========================================================

[INFO] Processing file: input_test.c

--- [CLEANED OUTPUT STREAM START] ---
#include <stdio.h>

int compute(int a, int b) {
    double ratio = (double)a / b / 2.0;
    int result = a + b;
    return result;
}

int main() {
    char* url = "https://api.example.com/v1/auth//tokens/*debug*/";
    char* note = "He said, \"Look at // this not a comment!\"";
    char slash = '/';
    char star = '*';
    int val = compute( 100, 20 );
    printf("Result: %d\n", val);
    return 0;
}
--- [CLEANED OUTPUT STREAM END] ---

=========================================================
              COMPILER PREPROCESSOR METRICS              
=========================================================
  Original Characters:           738
  Cleaned Characters:            465
  Characters Removed:            273
  Reduction Percentage:          36.99%
  Single-Line Comments (//):     3 removed
  Multi-Line Comments (/* */):   3 removed
  Whitespace Normalizations:     62 chars reduced
=========================================================
```
