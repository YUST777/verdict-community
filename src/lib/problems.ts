// Training Sheets & Problems Data
// Codeforces-style problem definitions with test cases

export interface TestCase {
    input: string;
    expectedOutput: string;
}

export interface Example {
    input: string;
    output: string;
}

export interface Problem {
    id: string;
    title: string;
    timeLimit: number; // ms
    memoryLimit: number; // MB
    statement: string;
    inputFormat: string;
    outputFormat: string;
    examples: Example[];
    testCases: TestCase[];
    note?: string;
}

export interface TrainingSheet {
    id: string;
    title: string;
    description: string;
    problems: string[]; // Problem IDs (A, B, C, ...)
    totalProblems: number;
}

// ============================================
// TRAINING SHEETS
// ============================================

export const trainingSheets: Record<string, TrainingSheet> = {
    'sheet-1': {
        id: 'sheet-1',
        title: 'Sheet 1 - Say Hello With C++',
        description: 'Learn C++ basics: input/output, data types, and simple arithmetic operations.',
        problems: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        totalProblems: 26
    }
};

// ============================================
// PROBLEMS - Sheet 1: Data Types
// ============================================

export const problems: Record<string, Problem> = {
    // ==========================================
    // PROBLEM A: Say Hello With C++
    // ==========================================
    'sheet-1-A': {
        id: 'A',
        title: 'Say Hello With C++',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a name S. Print "Hello, (name)" without parentheses.`,
        inputFormat: `Only one line containing a string S.`,
        outputFormat: `Print "Hello, " without quotes, then print name.`,
        examples: [
            { input: 'programmer', output: 'Hello, programmer' }
        ],
        testCases: [
            { input: 'programmer', expectedOutput: 'Hello, programmer' },
            { input: 'world', expectedOutput: 'Hello, world' },
            { input: 'Alice', expectedOutput: 'Hello, Alice' },
            { input: 'Codeforces', expectedOutput: 'Hello, Codeforces' },
            { input: 'ICPC', expectedOutput: 'Hello, ICPC' },
        ]
    },

    // ==========================================
    // PROBLEM B: Basic Data Types
    // ==========================================
    'sheet-1-B': {
        id: 'B',
        title: 'Basic Data Types',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `The following lines show some C++ data types, their format specifiers and their most common bit widths:

**int** : 32 Bit integer.
**long long** : 64 bit integer.
**char** : 8 bit Characters & symbols.
**float** : 32 bit real value.
**double** : 64 bit real value.

**Reading**
To read a data type, use the following syntax:
\`\`\`cpp
cin >> VariableName;
\`\`\`

For example, to read a character followed by a double:
\`\`\`cpp
char ch;
double d;
cin >> ch >> d;
\`\`\`

**Printing**
To print a data type, use the following syntax:
\`\`\`cpp
cout << VariableName;
\`\`\`

For example, to print a character followed by a double:
\`\`\`cpp
char ch = 'd';
double d = 234.432;
cout << ch << " " << d;
\`\`\``,
        inputFormat: `Only one line containing the following space-separated values: int, long long, char, float and double respectively.`,
        outputFormat: `Print each element on a new line in the same order it was received as input.

Don't print any extra spaces.`,
        examples: [
            {
                input: '3 12345678912345 a 334.23 14049.30493',
                output: '3\n12345678912345\na\n334.23\n14049.3'
            }
        ],
        testCases: [
            { input: '3 12345678912345 a 334.23 14049.30493', expectedOutput: '3\n12345678912345\na\n334.23\n14049.3' },
            { input: '42 9876543210123 x 123.45 678.901', expectedOutput: '42\n9876543210123\nx\n123.45\n678.901' },
            { input: '0 1 z 0.0 0.0', expectedOutput: '0\n1\nz\n0\n0' },
            { input: '100 99999999999999 M 50.5 100.25', expectedOutput: '100\n99999999999999\nM\n50.5\n100.25' },
        ]
    },

    // ==========================================
    // PROBLEM C: Simple Calculator
    // ==========================================
    'sheet-1-C': {
        id: 'C',
        title: 'Simple Calculator',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given two numbers X and Y. Print the summation and multiplication and subtraction of these 2 numbers.`,
        inputFormat: `Only one line containing two separated numbers X, Y (1 ≤ X, Y ≤ 10^5).`,
        outputFormat: `Print 3 lines that contain the following in the same order:

- "X + Y = summation result" without quotes.
- "X * Y = multiplication result" without quotes.
- "X - Y = subtraction result" without quotes.`,
        examples: [
            {
                input: '5 10',
                output: '5 + 10 = 15\n5 * 10 = 50\n5 - 10 = -5'
            }
        ],
        testCases: [
            { input: '5 10', expectedOutput: '5 + 10 = 15\n5 * 10 = 50\n5 - 10 = -5' },
            { input: '10 5', expectedOutput: '10 + 5 = 15\n10 * 5 = 50\n10 - 5 = 5' },
            { input: '1 1', expectedOutput: '1 + 1 = 2\n1 * 1 = 1\n1 - 1 = 0' },
            { input: '100 200', expectedOutput: '100 + 200 = 300\n100 * 200 = 20000\n100 - 200 = -100' },
            { input: '99999 1', expectedOutput: '99999 + 1 = 100000\n99999 * 1 = 99999\n99999 - 1 = 99998' },
            // Overflow test cases - will fail if using int instead of long long
            { input: '100000 100000', expectedOutput: '100000 + 100000 = 200000\n100000 * 100000 = 10000000000\n100000 - 100000 = 0' },
            { input: '50000 50000', expectedOutput: '50000 + 50000 = 100000\n50000 * 50000 = 2500000000\n50000 - 50000 = 0' },
        ],
        note: 'Be careful with spaces.'
    },

    // ==========================================
    // PROBLEM D: Difference
    // ==========================================
    'sheet-1-D': {
        id: 'D',
        title: 'Difference',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given four numbers A, B, C and D. Print the result of the following equation:

**X = (A * B) - (C * D)**`,
        inputFormat: `Only one line containing 4 separated numbers A, B, C and D (-10^5 ≤ A, B, C, D ≤ 10^5).`,
        outputFormat: `Print "Difference = " without quotes followed by the equation result.`,
        examples: [
            { input: '1 2 3 4', output: 'Difference = -10' },
            { input: '2 3 4 5', output: 'Difference = -14' },
            { input: '4 5 2 3', output: 'Difference = 14' }
        ],
        testCases: [
            { input: '1 2 3 4', expectedOutput: 'Difference = -10' },
            { input: '2 3 4 5', expectedOutput: 'Difference = -14' },
            { input: '4 5 2 3', expectedOutput: 'Difference = 14' },
            { input: '0 0 0 0', expectedOutput: 'Difference = 0' },
            { input: '10 10 5 5', expectedOutput: 'Difference = 75' },
            { input: '-5 2 3 -4', expectedOutput: 'Difference = 2' },
            // Overflow test cases - will fail if using int instead of long long
            { input: '100000 100000 1 1', expectedOutput: 'Difference = 9999999999' },
            { input: '100000 100000 100000 100000', expectedOutput: 'Difference = 0' },
            { input: '-100000 100000 100000 100000', expectedOutput: 'Difference = -20000000000' },
        ]
    },

    // ==========================================
    // PROBLEM E: Area of a Circle
    // ==========================================
    'sheet-1-E': {
        id: 'E',
        title: 'Area of a Circle',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a number R calculate the area of a circle using the following formula:

**Area = π * R²**

Note: consider π = 3.141592653`,
        inputFormat: `Only one line containing the number R (1 ≤ R ≤ 100).`,
        outputFormat: `Print the calculated area, with 9 digits after the decimal point.`,
        examples: [
            { input: '2.00', output: '12.566370612' }
        ],
        testCases: [
            { input: '2.00', expectedOutput: '12.566370612' },
            { input: '1', expectedOutput: '3.141592653' },
            { input: '5', expectedOutput: '78.539816325' },
            { input: '10', expectedOutput: '314.159265300' },
            { input: '3.5', expectedOutput: '38.484509999' },
        ],
        note: `* Use the data type double for this problem.
** Use setprecision(9) to print 9 digits after decimal point.
*** You can use function setprecision from #include<iomanip> library.`
    },

    // ==========================================
    // PROBLEM F: Digits Summation
    // ==========================================
    'sheet-1-F': {
        id: 'F',
        title: 'Digits Summation',
        timeLimit: 250,
        memoryLimit: 64,
        statement: `Given two numbers N and M. Print the summation of their last digits.`,
        inputFormat: `Only one line containing two numbers N, M (0 ≤ N, M ≤ 10^18).`,
        outputFormat: `Print the answer of the problem.`,
        examples: [
            { input: '13 12', output: '5' }
        ],
        testCases: [
            { input: '13 12', expectedOutput: '5' },
            { input: '99 99', expectedOutput: '18' },
            { input: '10 20', expectedOutput: '0' },
            { input: '123456789 987654321', expectedOutput: '10' },
            { input: '0 0', expectedOutput: '0' },
            { input: '5 5', expectedOutput: '10' },
            // Large numbers requiring long long
            { input: '999999999999999999 999999999999999999', expectedOutput: '18' },
            { input: '1000000000000000000 1', expectedOutput: '1' },
        ],
        note: `Last digit in the first number is 3 and last digit in the second number is 2. So the answer is: (3 + 2 = 5)`
    },

    // ==========================================
    // PROBLEM G: Summation from 1 to N
    // ==========================================
    'sheet-1-G': {
        id: 'G',
        title: 'Summation from 1 to N',
        timeLimit: 250,
        memoryLimit: 256,
        statement: `Given a number N. Print the summation of the numbers that are between 1 and N (inclusive).

∑(i=1 to N) i`,
        inputFormat: `Only one line containing a number N (1 ≤ N ≤ 10^9).`,
        outputFormat: `Print the summation of the numbers that are between 1 and N (inclusive).`,
        examples: [
            { input: '3', output: '6' },
            { input: '10', output: '55' }
        ],
        testCases: [
            { input: '3', expectedOutput: '6' },
            { input: '10', expectedOutput: '55' },
            { input: '1', expectedOutput: '1' },
            { input: '100', expectedOutput: '5050' },
            { input: '1000000', expectedOutput: '500000500000' },
            { input: '1000000000', expectedOutput: '500000000500000000' },
        ],
        note: `The numbers between 1 and 3 are 1, 2, 3. So the answer is: (1 + 2 + 3 = 6). Use the formula N*(N+1)/2 to avoid TLE.`
    },

    // ==========================================
    // PROBLEM H: Two Numbers
    // ==========================================
    'sheet-1-H': {
        id: 'H',
        title: 'Two Numbers',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given 2 numbers A and B. Print floor, ceil and round of A/B.

**Floor**: Is a mathematical function that takes a real number X and its output is the greatest integer less than or equal to X.

**Ceil**: Is a mathematical function that takes a real number X and its output is the smallest integer larger than or equal to X.

**Round**: Is a mathematical function that takes a real number X and its output is the closest integer to that number X.`,
        inputFormat: `Only one line containing two numbers A and B (1 ≤ A, B ≤ 10^9).`,
        outputFormat: `Print three space-separated values: floor, ceil, and round of A/B.`,
        examples: [
            { input: '10 3', output: '3 4 3' },
            { input: '7 2', output: '3 4 4' }
        ],
        testCases: [
            { input: '10 3', expectedOutput: '3 4 3' },
            { input: '7 2', expectedOutput: '3 4 4' },
            { input: '5 2', expectedOutput: '2 3 3' },
            { input: '10 5', expectedOutput: '2 2 2' },
            { input: '1 2', expectedOutput: '0 1 1' },
            { input: '99 10', expectedOutput: '9 10 10' },
        ],
        note: `Use floor(), ceil(), and round() functions from <cmath> library.`
    },
    // ==========================================
    // PROBLEM I: Welcome for you with Conditions
    // ==========================================
    'sheet-1-I': {
        id: 'I',
        title: 'Welcome for you with Conditions',
        timeLimit: 1000,
        memoryLimit: 64,
        statement: `Given two numbers A and B. Print "Yes" if A is greater than or equal to B. Otherwise print "No".`,
        inputFormat: `Only one line containing two numbers A and B (0 ≤ A, B ≤ 100).`,
        outputFormat: `Print "Yes" or "No" according to the statement.`,
        examples: [
            { input: '10 9', output: 'Yes' },
            { input: '5 5', output: 'Yes' },
            { input: '5 7', output: 'No' }
        ],
        testCases: [
            { input: '10 9', expectedOutput: 'Yes' },
            { input: '5 5', expectedOutput: 'Yes' },
            { input: '5 7', expectedOutput: 'No' },
            { input: '0 0', expectedOutput: 'Yes' },
            { input: '100 50', expectedOutput: 'Yes' },
            { input: '1 100', expectedOutput: 'No' },
        ]
    },

    // ==========================================
    // PROBLEM J: Multiples
    // ==========================================
    'sheet-1-J': {
        id: 'J',
        title: 'Multiples',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given two numbers A and B. Print "Multiples" if A is multiple of B or vice versa. Otherwise print "No Multiples".

**A is said to be Multiple of B if B is divisible by A.**`,
        inputFormat: `Only one line containing two numbers A, B (1 ≤ A, B ≤ 10^6).`,
        outputFormat: `Print "Multiples" or "No Multiples" corresponding to the read numbers.`,
        examples: [
            { input: '9 3', output: 'Multiples' },
            { input: '6 24', output: 'Multiples' },
            { input: '12 5', output: 'No Multiples' }
        ],
        testCases: [
            { input: '9 3', expectedOutput: 'Multiples' },
            { input: '6 24', expectedOutput: 'Multiples' },
            { input: '12 5', expectedOutput: 'No Multiples' },
            { input: '1 1', expectedOutput: 'Multiples' },
            { input: '100 10', expectedOutput: 'Multiples' },
            { input: '7 13', expectedOutput: 'No Multiples' },
        ],
        note: `9 is divisible by 3, so the answer is Multiples. 6 is not divisible by 24 but 24 is divisible by 6, so the answer is Multiples.`
    },

    // ==========================================
    // PROBLEM K: Max and Min
    // ==========================================
    'sheet-1-K': {
        id: 'K',
        title: 'Max and Min',
        timeLimit: 250,
        memoryLimit: 64,
        statement: `Given 3 numbers A, B and C, Print the minimum and the maximum numbers.`,
        inputFormat: `Only one line containing 3 numbers A, B and C (-10^5 ≤ A, B, C ≤ 10^5).`,
        outputFormat: `Print the minimum number followed by a single space then print the maximum number.`,
        examples: [
            { input: '1 2 3', output: '1 3' },
            { input: '-1 -2 -3', output: '-3 -1' },
            { input: '10 20 -5', output: '-5 20' }
        ],
        testCases: [
            { input: '1 2 3', expectedOutput: '1 3' },
            { input: '-1 -2 -3', expectedOutput: '-3 -1' },
            { input: '10 20 -5', expectedOutput: '-5 20' },
            { input: '5 5 5', expectedOutput: '5 5' },
            { input: '0 -100 100', expectedOutput: '-100 100' },
            { input: '99999 1 50000', expectedOutput: '1 99999' },
        ]
    },

    // ==========================================
    // PROBLEM L: The Brothers
    // ==========================================
    'sheet-1-L': {
        id: 'L',
        title: 'The Brothers',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given two person names. Each person has {the first name + the second name}.

Determine whether they are brothers or not.

**Note:** The two persons are brothers if they share the same second name.`,
        inputFormat: `First line will contain two Strings F1, S1 which donates the first and second name of the 1st person.
Second line will contain two Strings F2, S2 which donates the first and second name of the 2nd person.`,
        outputFormat: `Print "ARE Brothers" if they are brothers otherwise print "NOT".`,
        examples: [
            { input: 'bassam ramadan\nahmed ramadan', output: 'ARE Brothers' },
            { input: 'ali salah\nayman salah', output: 'ARE Brothers' },
            { input: 'ali kamel\nali salah', output: 'NOT' }
        ],
        testCases: [
            { input: 'bassam ramadan\nahmed ramadan', expectedOutput: 'ARE Brothers' },
            { input: 'ali salah\nayman salah', expectedOutput: 'ARE Brothers' },
            { input: 'ali kamel\nali salah', expectedOutput: 'NOT' },
            { input: 'john doe\njane doe', expectedOutput: 'ARE Brothers' },
            { input: 'alice smith\nbob jones', expectedOutput: 'NOT' },
            { input: 'x y\nz y', expectedOutput: 'ARE Brothers' },
        ]
    },

    // ==========================================
    // PROBLEM M: Capital or Small or Digit
    // ==========================================
    'sheet-1-M': {
        id: 'M',
        title: 'Capital or Small or Digit',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a letter X. Determine whether X is Digit or Alphabet and if it is Alphabet determine if it is Capital Case or Small Case.

**Note:**
- Digits in ASCII: '0' = 48, '1' = 49, etc.
- Capital letters in ASCII: 'A' = 65, 'B' = 66, etc.
- Small letters in ASCII: 'a' = 97, 'b' = 98, etc.`,
        inputFormat: `Only one line containing a character X which will be a capital or small letter or digit.`,
        outputFormat: `Print "IS DIGIT" if X is digit otherwise, print "ALPHA" in the first line followed by a new line that contains "IS CAPITAL" if X is a capital letter and "IS SMALL" if X is a small letter.`,
        examples: [
            { input: 'A', output: 'ALPHA\nIS CAPITAL' },
            { input: '9', output: 'IS DIGIT' },
            { input: 'a', output: 'ALPHA\nIS SMALL' }
        ],
        testCases: [
            { input: 'A', expectedOutput: 'ALPHA\nIS CAPITAL' },
            { input: '9', expectedOutput: 'IS DIGIT' },
            { input: 'a', expectedOutput: 'ALPHA\nIS SMALL' },
            { input: 'Z', expectedOutput: 'ALPHA\nIS CAPITAL' },
            { input: '0', expectedOutput: 'IS DIGIT' },
            { input: 'z', expectedOutput: 'ALPHA\nIS SMALL' },
        ],
        note: `Recommended to read about ASCII Code: https://www.javatpoint.com/ascii`
    },

    // ==========================================
    // PROBLEM N: Char
    // ==========================================
    'sheet-1-N': {
        id: 'N',
        title: 'Char',
        timeLimit: 250,
        memoryLimit: 64,
        statement: `Given a letter X. If the letter is lowercase print the letter after converting it from lowercase letter to uppercase letter. Otherwise print the letter after converting it from uppercase letter to lowercase letter.

**Note:** difference between 'a' and 'A' in ASCII is 32.`,
        inputFormat: `Only one line containing a character X which will be a capital or small letter.`,
        outputFormat: `Print the answer to this problem.`,
        examples: [
            { input: 'a', output: 'A' },
            { input: 'A', output: 'a' }
        ],
        testCases: [
            { input: 'a', expectedOutput: 'A' },
            { input: 'A', expectedOutput: 'a' },
            { input: 'z', expectedOutput: 'Z' },
            { input: 'Z', expectedOutput: 'z' },
            { input: 'm', expectedOutput: 'M' },
            { input: 'M', expectedOutput: 'm' },
        ]
    },

    // ==========================================
    // PROBLEM O: Calculator
    // ==========================================
    'sheet-1-O': {
        id: 'O',
        title: 'Calculator',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a mathematical expression. The expression will be one of the following expressions: A+B, A-B, A*B and A/B.

Print the result of the mathematical expression.`,
        inputFormat: `Only one line contains A, S and B (1 ≤ A, B ≤ 10^4), S is either (+, -, *, /).`,
        outputFormat: `Print the result of the mathematical expression.`,
        examples: [
            { input: '7+54', output: '61' },
            { input: '17*10', output: '170' }
        ],
        testCases: [
            { input: '7+54', expectedOutput: '61' },
            { input: '17*10', expectedOutput: '170' },
            { input: '100-50', expectedOutput: '50' },
            { input: '20/4', expectedOutput: '5' },
            { input: '10+10', expectedOutput: '20' },
            { input: '7/2', expectedOutput: '3' },
            // Edge cases
            { input: '10000*10000', expectedOutput: '100000000' },
            { input: '1-10000', expectedOutput: '-9999' },
            { input: '9999/1', expectedOutput: '9999' },
        ],
        note: `For the dividing operation you should print the division without any fractions (integer division).`
    },

    // ==========================================
    // PROBLEM P: First digit !
    // ==========================================
    'sheet-1-P': {
        id: 'P',
        title: 'First digit !',
        timeLimit: 250,
        memoryLimit: 64,
        statement: `Given a number X. Print "EVEN" if the first digit of X is even number. Otherwise print "ODD".

For example: In 4569 the first digit is 4, the second digit is 5, the third digit is 6 and the fourth digit is 9.`,
        inputFormat: `Only one line containing a number X (999 < X ≤ 9999).`,
        outputFormat: `If the first digit is even print "EVEN" otherwise print "ODD".`,
        examples: [
            { input: '4569', output: 'EVEN' },
            { input: '3569', output: 'ODD' }
        ],
        testCases: [
            { input: '4569', expectedOutput: 'EVEN' },
            { input: '3569', expectedOutput: 'ODD' },
            { input: '2000', expectedOutput: 'EVEN' },
            { input: '1111', expectedOutput: 'ODD' },
            { input: '8888', expectedOutput: 'EVEN' },
            { input: '9999', expectedOutput: 'ODD' },
        ],
        note: `In 3569 the first digit is 3 and it's ODD.`
    },

    // ==========================================
    // PROBLEM Q: Quadrant
    // ==========================================
    'sheet-1-Q': {
        id: 'Q',
        title: 'Quadrant',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given two numbers X, Y which donate coordinates of a point in 2D plan. Determine in which quarter does it belong.

**Note:**
- Print Q1, Q2, Q3, Q4 according to the quarter in which the point belongs to.
- Print "Origem" if the point is at the origin.
- Print "Eixo X" if the point is over X axis.
- Print "Eixo Y" if the point is over Y axis.`,
        inputFormat: `Only one line containing two numbers X, Y (-1000 ≤ X, Y ≤ 1000).`,
        outputFormat: `Print the answer to the problem above.`,
        examples: [
            { input: '4.5 -2.2', output: 'Q4' },
            { input: '0.1 0.1', output: 'Q1' }
        ],
        testCases: [
            { input: '4.5 -2.2', expectedOutput: 'Q4' },
            { input: '0.1 0.1', expectedOutput: 'Q1' },
            { input: '-5 5', expectedOutput: 'Q2' },
            { input: '-3 -3', expectedOutput: 'Q3' },
            { input: '0 0', expectedOutput: 'Origem' },
            { input: '5 0', expectedOutput: 'Eixo X' },
            { input: '0 5', expectedOutput: 'Eixo Y' },
        ]
    },

    // ==========================================
    // PROBLEM R: Age in Days
    // ==========================================
    'sheet-1-R': {
        id: 'R',
        title: 'Age in Days',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a Number N corresponding to a person's age (in days). Print his age in years, months and days, followed by its respective message "years", "months", "days".

**Note:** consider the whole year has 365 days and 30 days per month.`,
        inputFormat: `Only one line containing a number N (0 ≤ N ≤ 10^6).`,
        outputFormat: `Print the output, like the following examples.`,
        examples: [
            { input: '400', output: '1 years\n1 months\n5 days' },
            { input: '800', output: '2 years\n2 months\n10 days' },
            { input: '30', output: '0 years\n1 months\n0 days' }
        ],
        testCases: [
            { input: '400', expectedOutput: '1 years\n1 months\n5 days' },
            { input: '800', expectedOutput: '2 years\n2 months\n10 days' },
            { input: '30', expectedOutput: '0 years\n1 months\n0 days' },
            { input: '365', expectedOutput: '1 years\n0 months\n0 days' },
            { input: '0', expectedOutput: '0 years\n0 months\n0 days' },
            { input: '395', expectedOutput: '1 years\n1 months\n0 days' },
        ]
    },

    // ==========================================
    // PROBLEM S: Interval
    // ==========================================
    'sheet-1-S': {
        id: 'S',
        title: 'Interval',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a number X. Determine in which of the following intervals the number X belongs to:

[0,25], (25,50], (50,75], (75,100]

**Note:**
- If X belongs to any of the above intervals print "Interval " followed by the interval.
- If X does not belong to any of the above intervals print "Out of Intervals".
- '[' represents greater than or equal, ']' represents smaller than or equal.
- '(' represents greater than, ')' represents smaller than.`,
        inputFormat: `Only one line containing a number X (-1000 ≤ X ≤ 1000).`,
        outputFormat: `Print the answer to the problem above.`,
        examples: [
            { input: '25.1', output: 'Interval (25,50]' },
            { input: '25.0', output: 'Interval [0,25]' },
            { input: '100.0', output: 'Interval (75,100]' },
            { input: '-25.2', output: 'Out of Intervals' }
        ],
        testCases: [
            { input: '25.1', expectedOutput: 'Interval (25,50]' },
            { input: '25.0', expectedOutput: 'Interval [0,25]' },
            { input: '100.0', expectedOutput: 'Interval (75,100]' },
            { input: '-25.2', expectedOutput: 'Out of Intervals' },
            { input: '0', expectedOutput: 'Interval [0,25]' },
            { input: '50', expectedOutput: 'Interval (25,50]' },
            { input: '75', expectedOutput: 'Interval (50,75]' },
        ]
    },

    // ==========================================
    // PROBLEM T: Sort Numbers
    // ==========================================
    'sheet-1-T': {
        id: 'T',
        title: 'Sort Numbers',
        timeLimit: 250,
        memoryLimit: 256,
        statement: `Given three numbers A, B, C. Print these numbers in ascending order followed by a blank line and then the values in the sequence as they were read.`,
        inputFormat: `Only one line containing three numbers A, B, C (-10^6 ≤ A, B, C ≤ 10^6).`,
        outputFormat: `Print the values in ascending order followed by a blank line and then the values in the sequence as they were read.`,
        examples: [
            { input: '3 -2 1', output: '-2\n1\n3\n\n3\n-2\n1' },
            { input: '-2 10 0', output: '-2\n0\n10\n\n-2\n10\n0' }
        ],
        testCases: [
            { input: '3 -2 1', expectedOutput: '-2\n1\n3\n\n3\n-2\n1' },
            { input: '-2 10 0', expectedOutput: '-2\n0\n10\n\n-2\n10\n0' },
            { input: '1 2 3', expectedOutput: '1\n2\n3\n\n1\n2\n3' },
            { input: '5 5 5', expectedOutput: '5\n5\n5\n\n5\n5\n5' },
        ]
    },

    // ==========================================
    // PROBLEM U: Float or int
    // ==========================================
    'sheet-1-U': {
        id: 'U',
        title: 'Float or int',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a number N. Determine whether N is float number or integer number.

**Note:**
- If N is float number then print "float" followed by the integer part followed by decimal part separated by space.
- If N is integer number then print "int" followed by the integer part separated by space.`,
        inputFormat: `Only one line containing a number N (1 ≤ N ≤ 10^3).`,
        outputFormat: `Print the answer required above.`,
        examples: [
            { input: '234.000', output: 'int 234' },
            { input: '534.958', output: 'float 534 0.958' }
        ],
        testCases: [
            { input: '234.000', expectedOutput: 'int 234' },
            { input: '534.958', expectedOutput: 'float 534 0.958' },
            { input: '100.5', expectedOutput: 'float 100 0.5' },
            { input: '1.0', expectedOutput: 'int 1' },
            { input: '999.999', expectedOutput: 'float 999 0.999' },
        ]
    },

    // ==========================================
    // PROBLEM V: Comparison
    // ==========================================
    'sheet-1-V': {
        id: 'V',
        title: 'Comparison',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given a comparison symbol S between two numbers A and B. Determine whether it is Right or Wrong.

The comparison is as follows: A < B, A > B, A = B.`,
        inputFormat: `Only one line containing A, S and B respectively (-100 ≤ A, B ≤ 100), S can be ('<', '>', '=') without the quotes.`,
        outputFormat: `Print "Right" if the comparison is true, "Wrong" otherwise.`,
        examples: [
            { input: '5 > 4', output: 'Right' },
            { input: '9 < 1', output: 'Wrong' },
            { input: '4 = 4', output: 'Right' }
        ],
        testCases: [
            { input: '5 > 4', expectedOutput: 'Right' },
            { input: '9 < 1', expectedOutput: 'Wrong' },
            { input: '4 = 4', expectedOutput: 'Right' },
            { input: '0 < 0', expectedOutput: 'Wrong' },
            { input: '-5 < 5', expectedOutput: 'Right' },
            { input: '100 > 99', expectedOutput: 'Right' },
        ]
    },

    // ==========================================
    // PROBLEM W: Mathematical Expression
    // ==========================================
    'sheet-1-W': {
        id: 'W',
        title: 'Mathematical Expression',
        timeLimit: 250,
        memoryLimit: 256,
        statement: `Given a mathematical expression: A + B = C, A - B = C, or A * B = C.

Print "Yes" if the expression is Right, otherwise print the right answer of the expression.`,
        inputFormat: `Only one line containing the expression: A, S, B, Q, C respectively (0 ≤ A, B ≤ 100, -10^5 ≤ C ≤ 10^5) and S can be ('+', '-', '*').`,
        outputFormat: `Output either "Yes" or the right answer depending on the statement.`,
        examples: [
            { input: '5 + 10 = 15', output: 'Yes' },
            { input: '3 - 1 = 2', output: 'Yes' },
            { input: '2 * 10 = 19', output: '20' }
        ],
        testCases: [
            { input: '5 + 10 = 15', expectedOutput: 'Yes' },
            { input: '3 - 1 = 2', expectedOutput: 'Yes' },
            { input: '2 * 10 = 19', expectedOutput: '20' },
            { input: '10 + 5 = 16', expectedOutput: '15' },
            { input: '7 * 7 = 49', expectedOutput: 'Yes' },
            { input: '100 - 50 = 60', expectedOutput: '50' },
        ]
    },

    // ==========================================
    // PROBLEM X: Two intervals
    // ==========================================
    'sheet-1-X': {
        id: 'X',
        title: 'Two intervals',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given the boundaries of 2 intervals. Print the boundaries of their intersection.

**Note:** Boundaries mean the two ends of an interval which are the starting number and the ending number.`,
        inputFormat: `Only one line contains two intervals [l1,r1], [l2,r2] where (1 ≤ l1, l2, r1, r2 ≤ 10^9), (l1 ≤ r1, l2 ≤ r2).`,
        outputFormat: `If there is an intersection between these 2 intervals print its boundaries, otherwise print -1.`,
        examples: [
            { input: '1 15 5 27', output: '5 15' },
            { input: '2 5 6 12', output: '-1' }
        ],
        testCases: [
            { input: '1 15 5 27', expectedOutput: '5 15' },
            { input: '2 5 6 12', expectedOutput: '-1' },
            { input: '1 10 5 8', expectedOutput: '5 8' },
            { input: '10 20 15 25', expectedOutput: '15 20' },
            { input: '1 5 5 10', expectedOutput: '5 5' },
        ]
    },

    // ==========================================
    // PROBLEM Y: The last 2 digits
    // ==========================================
    'sheet-1-Y': {
        id: 'Y',
        title: 'The last 2 digits',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given 4 numbers A, B, C and D. Print the last 2 digits from their Multiplication.`,
        inputFormat: `Only one line containing four numbers A, B, C and D (2 ≤ A, B, C, D ≤ 10^9).`,
        outputFormat: `Print the last 2 digits from their Multiplication.`,
        examples: [
            { input: '5 7 2 4', output: '80' },
            { input: '3 9 9 9', output: '87' }
        ],
        testCases: [
            { input: '5 7 2 4', expectedOutput: '80' },
            { input: '3 9 9 9', expectedOutput: '87' },
            { input: '10 10 10 10', expectedOutput: '00' },
            { input: '2 2 2 2', expectedOutput: '16' },
            { input: '99 99 99 99', expectedOutput: '01' },
            // Large numbers requiring modular arithmetic - will overflow without % 100
            { input: '1000000000 1000000000 1000000000 1000000000', expectedOutput: '00' },
            { input: '123456789 987654321 111111111 999999999', expectedOutput: '41' },
        ],
        note: `The multiplication of 5 * 7 * 2 * 4 = 280, so the answer is the last 2 digits: 80.`
    },

    // ==========================================
    // PROBLEM Z: Hard Compare
    // ==========================================
    'sheet-1-Z': {
        id: 'Z',
        title: 'Hard Compare',
        timeLimit: 1000,
        memoryLimit: 256,
        statement: `Given 4 numbers A, B, C and D. If A^B > C^D print "YES" otherwise, print "NO".`,
        inputFormat: `Only one line containing 4 numbers A, B, C and D (1 ≤ A, C ≤ 10^7), (1 ≤ B, D ≤ 10^12).`,
        outputFormat: `Print "YES" or "NO" according to the problem above.`,
        examples: [
            { input: '3 2 5 4', output: 'NO' },
            { input: '5 2 4 2', output: 'YES' },
            { input: '5 2 5 2', output: 'NO' }
        ],
        testCases: [
            { input: '3 2 5 4', expectedOutput: 'NO' },
            { input: '5 2 4 2', expectedOutput: 'YES' },
            { input: '5 2 5 2', expectedOutput: 'NO' },
            { input: '2 10 3 6', expectedOutput: 'YES' },
            { input: '10 1 2 4', expectedOutput: 'NO' },
        ],
        note: `3^2 = 9 and 5^4 = 625, since 9 < 625 the answer is NO. Use logarithms to avoid overflow: B*log(A) vs D*log(C).`
    },
};

// Helper functions
export function getSheet(sheetId: string): TrainingSheet | undefined {
    return trainingSheets[sheetId];
}

export function getProblem(sheetId: string, problemId: string): Problem | undefined {
    const key = sheetId + '-' + problemId;
    return problems[key];
}

export function getAllSheets(): TrainingSheet[] {
    return Object.values(trainingSheets);
}

export function isProblemAvailable(sheetId: string, problemId: string): boolean {
    const problem = getProblem(sheetId, problemId);
    return problem !== undefined && problem.title !== 'Coming Soon';
}
