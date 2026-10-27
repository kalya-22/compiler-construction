// Test file for Lex / Flex Comment and Whitespace Remover
#include <stdio.h>

/* Multi-line comment:
   This program tests edge cases in lexical analysis. */

int   compute( int   a,    int   b )   {
    // Chained division operations: must preserve '/' operator!
    double ratio = (double)a / b / 2.0;

    /* Inline block comment */ int result = a + b; // addition

    return result;
}

int main() {
    // Strings containing comment-like markers that MUST NOT be removed:
    char* url = "https://api.example.com/v1/auth//tokens/*debug*/";
    char* note = "He said, \"Look at // this not a comment!\"";

    // Character literals
    char slash = '/';
    char star = '*';

    /* Block comment before division */
    int val = compute( 100, 20 );

    printf("Result: %d\n", val);
    return 0;
}
