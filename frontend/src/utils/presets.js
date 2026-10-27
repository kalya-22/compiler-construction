export const CODE_PRESETS = [
  {
    id: "basic",
    name: "1. Mixed Comments",
    description: "Standard C program with single-line (//) and multi-line (/* */) comments",
    code: `// Program to calculate factorial
#include <stdio.h>

/* Multi-line comment:
   Factorial computes n!
   using an iterative approach */
int factorial(int n) {
    // Check base condition
    if (n <= 1) {
        return 1; // 0! and 1! are 1
    }

    int result = 1; /* accumulator variable */
    for (int i = 2; i <= n; i++) {
        result *= i; // multiply step
    }
    return result;
}

int main() {
    int num = 5; // test value
    printf("Factorial of %d is %d\\n", num, factorial(num));
    return 0;
}
`
  },
  {
    id: "strings",
    name: "2. Strings & URLs",
    description: "Tests that comments inside quotes & URLs are strictly preserved",
    code: `#include <stdio.h>

int main() {
    // The comments below are inside string literals and MUST NOT be removed!
    char* endpoint = "https://api.example.com/v1/auth//tokens/*debug*/";
    char* msg = "Notice: // this is a string literal, not a comment!";
    char* quote_escape = "He shouted: \\"// Look at /* this */ text!\\"";

    // Character literals
    char slash = '/';
    char star = '*';

    printf("%s\\n%s\\n", endpoint, msg);
    return 0;
}
`
  },
  {
    id: "division",
    name: "3. Division Operators",
    description: "Disambiguates division operator (/) from comment start (// or /*)",
    code: `#include <stdio.h>

int main() {
    double total = 500.0;
    double count = 10.0;
    double divisor = 2.0;

    // Notice chained division operations
    double avg = total / count / divisor; // calculated average

    // Division followed immediately by whitespace and expressions
    int a = 100 / 5;
    int b = 20 / /* divisor */ 4;

    printf("Avg: %f, a: %d, b: %d\\n", avg, a, b);
    return 0;
}
`
  },
  {
    id: "whitespace",
    name: "4. Messy Whitespace & Tabs",
    description: "Consecutive spaces, tabs, and multiple blank lines to normalize/minify",
    code: `#include <stdio.h>



int   compute( int   x,    int   y )   {
        // compute sum with irregular indentation
        int      sum    =    x    +    y;    


        return    sum;
}



int   main()   {
    int    val    =    compute(  10,     20  );   // result
    printf( "Result: %d\\n",   val );
    return   0;
}
`
  },
  {
    id: "unterminated",
    name: "5. Unterminated Block (Warning)",
    description: "Triggers a lexical compiler warning for an unclosed block comment",
    code: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;

    /* This block comment was never closed before End-of-File!
    Compiler should report a Lexical Warning!
    printf("%d", a + b);
`
  }
];
