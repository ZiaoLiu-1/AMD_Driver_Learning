// ============================================================
// AMD Linux Driver Learning Platform - Module 0.7 Micro-Lessons (EN)
// Module 0.7: C/C++ Foundations
// Group 0: C from Zero — 7 lessons
// Group 1: C Core Review — 7 lessons
// Group 2: C++ Training — 6 lessons
// Group 3: Kernel C Idioms in Practice — 6 lessons
// Every lesson pairs with Code Lab practice (/code-lab, 72 problems).
// Foundations-first; amdgpu/kernel cases as extensions. Format A.
// Mirrors c_cpp_micro_lessons.ts (same ids, same order).
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const cCppMicroLessonsEn: MicroLessonModule = {
  moduleId: 'c-cpp',
  groups: [
    {
      id: 'cc-c0',
      number: '0.7.0',
      title: 'C from Zero',
      titleEn: 'C from Zero',
      icon: 'BookOpen',
      description: 'A C on-ramp that assumes no programming experience: from your first function, expressions and printf, through branches, loops, arrays, pointers and strings, to heap memory and ownership. Every lesson pairs with Code Lab warm-up drills (the C Preflight track at /code-lab) — learn one lesson, drill it immediately. If you already write C functions on your own, skip straight to the systematic review in 0.7.1.',
      lessons: [
        {
          id: 'cc-c0-1',
          number: '0.7.0.1',
          title: 'First C: Functions, Variables, return & printf',
          titleEn: 'First C: Functions, Variables, return & printf',
          duration: 14,
          tags: ['C', 'basics', 'functions'],
          concept: {
            summary: 'A C program is made of functions; a function takes parameters, computes a result, and hands it back with return. Variables must be declared with a type before use; printf typesets values into text output. main is merely the program entry point.',
            explanation: [
              'Think of a function as a small machine: raw material goes in on the left (parameters), the product drops out on the right (the return value). The nameplate line int add3(int a, int b, int c) — the signature — says: three ints in, one int out. The body lives inside braces, and return expression; delivers the product — the instant return runs, the machine stops; nothing after it executes.',
              'A variable is a named storage slot, and you must declare what type it holds before using it: int count = 0; declares an integer slot and puts 0 in it. Declaration (int count), initialization (= 0) and assignment (count = 5) are three distinct acts; a local variable that is declared but never initialized holds garbage — reading it is a classic bug source, so the habit in this course is to initialize at declaration.',
              'printf("count = %d\\n", count) typesets a value into text: %d inside the format string is a placeholder meaning "insert an integer here", and the following arguments fill the slots in order. Four to know: %d for int, %f for double, %s for strings, %c for a single character; \\n is a newline. Placeholder and argument types must match — %d fed a double is a bug, and the compiler warns about it under -Wall. On success printf returns the number of characters written; an output error returns a negative value. Warm-up w-04 focuses only on exact text, while real programs can inspect that return to catch I/O failure.',
              'main is the entry point: the operating system starts your program at main. In the Code Lab the judge already provides main (it calls your function and checks the results), so you focus on implementing the one function the problem asks for — which mirrors real engineering: most days you write functions that other code calls, not main.',
              'Compilation translates the .c text into an executable: gcc prog.c -o prog && ./prog. When an error message looks scary, grab two things first: the file:line pair, and the FIRST error — later errors are often a chain reaction of the first one.',
            ],
            keyPoints: [
              'A signature is a usage contract: return type + name + parameter list',
              'return ends the function immediately and delivers the result',
              'Initialize locals at declaration; uninitialized values are garbage',
              'printf placeholders must match argument types; success returns a character count, failure a negative value',
            ],
          },
          diagram: {
            title: 'Anatomy of a C source file',
            content: `  #include <stdio.h>        <- pull in library declarations (printf)

  int add3(int a, int b, int c)   <- signature: return type name(params)
  {                                <- body begins
      int sum = a + b + c;         <- declare + initialize
      return sum;                  <- deliver result, function ends
  }

  int main(void)                   <- program entry point
  {
      printf("%d\\n", add3(1, 2, 3));  <- call the function, print the result
      return 0;                    <- tell the OS: clean exit
  }`,
            caption: 'Top to bottom: include brings declarations, ordinary functions do the work, main is just the entry. In the Code Lab, main is supplied by the judge.',
          },
          codeWalk: {
            title: 'From call to return: how values travel',
            file: 'first.c',
            language: 'c',
            code: `#include <stdio.h>

int square_plus(int x, int bonus)   /* 1 signature: two ints in, one int out */
{
    int result = x * x + bonus;     /* 2 local variable: initialized at declaration */
    return result;                  /* 3 deliver; the function is over */
}

int main(void)
{
    int a = 4;
    int r = square_plus(a, 10);     /* 4 the VALUE of a is copied into parameter x */
    printf("r = %d\\n", r);          /* 5 %d receives r -> prints r = 26 */
    return 0;
}`,
            annotations: [
              'Reading the signature: int (out) square_plus (name) (int x, int bonus) (in).',
              'Parameters x/bonus are the function’s own slots, holding values copied at the call.',
              'Code after return never runs (compilers often warn: unreachable).',
              'At the call site square_plus(a, 10): evaluate first, copy, then enter the function.',
              '%d pairs with int; printing a double takes %f.',
            ],
            explanation: 'Remember the journey of a value: the caller’s a merely copies 4 into parameter x — however the function changes x, a is untouched. That fact becomes the protagonist in Stage 4: to let a function modify the caller’s variable, you hand over its address.',
          },
          miniLab: {
            title: 'Write your first function in the Code Lab',
            objective: 'Solve warm-ups w-01 (sum of three) and w-04 (print one addition line) to feel the full implement → compile → judge loop.',
            steps: [
              'Open /code-lab and enter Stage 0 of the C Preflight track.',
              'Do w-01 first: change only the return line, then hit Run.',
              'Deliberately delete a semicolon and run once more — read the file:line format of the compile error.',
              'Then do w-04: the printf format string must match the expected output character for character (spaces and newline included).',
            ],
            expectedOutput: 'w-01 and w-04 fully green (RESULT n/n + exit 0).',
            hint: 'Read the first compile error first; on output mismatches, compare spaces and \\n character by character.',
          },
          debugExercise: {
            title: 'Two beginner mistakes',
            language: 'c',
            question: 'This function should return the integer part of the average of two numbers. It contains two mistakes plus one habit worth improving. Find them all.',
            buggyCode: `int average(int a, int b)
{
    int sum;
    sum = a + b
    return Sum / 2;
}`,
            hint: 'One punctuation, one capitalization, one "what value gets read".',
            answer: 'Two mistakes: (1) sum = a + b is missing its semicolon; (2) C is case-sensitive — Sum is not sum, it is an undeclared name. One improvement: int sum; followed by assignment is legal, but int sum = a + b; at declaration is harder to get wrong. Fixed: int sum = a + b; return sum / 2; (integer division truncates toward zero — 10/4 gives 2; a feature, not a bug, drilled in w-02.)',
          },
          interviewQ: {
            question: 'Self-check: in int add3(int a, int b, int c), what does each part tell the caller? And what happens if the body is written as return a + b;?',
            difficulty: 'easy',
            hint: 'Signature = contract; behavior of return.',
            answer: 'The return type int promises the caller an integer back; the name add3 is what you call; the parameter list (int a, int b, int c) says pass three integers whose order carries meaning. With return a + b;, parameter c never participates — the compiler may warn about an unused parameter, and the function quietly returns a wrong result. The signature is unchanged, yet the implementation silently broke the contract: exactly why the judge (and real-world tests) check behavior, not just signatures.',
          },
        },
        {
          id: 'cc-c0-2',
          number: '0.7.0.2',
          title: 'Expressions, Types & Conversions',
          titleEn: 'Expressions, Types & Conversions',
          duration: 14,
          tags: ['C', 'types', 'operators'],
          concept: {
            summary: 'Operators combine values into expressions; the operand types decide the rules of the operation. There is exactly one giant beginner trap: dividing two integers stays an integer — the fraction is simply thrown away.',
            explanation: [
              'Four operator families you will use daily: arithmetic + - * / %; comparison == != < <= > >= (result is 1 or 0); logical && || ! (combining conditions, with short-circuit evaluation: the right side never runs when the left side already decides); assignment =. Note that == compares while = assigns — if (x = 5) is legal C and almost always a bug (-Wall warns).',
              'Integer division: in 5 / 9 both operands are int, so the result follows int rules — 0.555 truncates to 0, toward zero (-7/2 gives -3). Its sibling % yields the remainder: 17 % 5 is 2. For a fractional result, at least one operand must be floating point: 5.0 / 9, or (double)5 / 9. This one rule hides inside countless conversion bugs (w-02 has you step in it once, then fix it).',
              'Conversions come in two kinds: implicit — mixing int with double promotes the int to double; explicit — (double)x, a cast. The reverse (int)3.9 truncates to 3; it does not round. Principle: make conversions visible so readers never have to guess.',
              'bool: since C99, #include <stdbool.h> provides bool/true/false. Underneath they are still integers (0 false, nonzero true), but putting yes/no into the type makes signatures honest: bool is_even(int n) says more than int is_even(int n).',
              'The minimal XOR bridge for w-30: ^ is bitwise exclusive-or — equal bits give 0, differing bits give 1. Three corollaries suffice: x ^ x == 0, x ^ 0 == x, and XOR is commutative and associative. The full bit-ops world lives in 0.7.1.2 and c-04~c-06.',
            ],
            keyPoints: [
              'int / int = int (truncated toward zero); % yields the remainder',
              'Want fractions? Make one operand floating point, or cast explicitly with (double)',
              '== compares, = assigns; comparisons evaluate to 1/0',
              'bool from <stdbool.h> puts yes/no into the type system',
            ],
          },
          diagram: {
            title: 'Integer division: where the value is lost',
            content: `  c * 9 / 5 + 32     (c is double)          c * (9 / 5) + 32
      |                                          |
      v left to right                            v parentheses first
  (c*9) -> double OK                       9 / 5 -> int division = 1 BUG
      |                                          |
  double / 5 -> double OK                  c * 1 + 32  -> wrong result
      |
  right: 100C -> 212F                      wrong: 100C -> 132F

  rule: evaluate one step at a time; the operands set the type`,
            caption: 'In c * 9 / 5 every step involves a double — safe; the moment you write (9 / 5), the parentheses hold a pure int division, 1.8 collapses to 1, and the bug is baked in.',
          },
          codeWalk: {
            title: 'Three spellings of one formula',
            file: 'convert.c',
            language: 'c',
            code: `double c2f_ok(double c)
{
    return c * 9 / 5 + 32;        /* 1 c is double and "infects" each step */
}

double c2f_also_ok(double c)
{
    return c * (9.0 / 5.0) + 32;  /* 2 the parentheses already hold 1.8 */
}

double c2f_wrong(double c)
{
    return c * (9 / 5) + 32;      /* 3 BUG: 9/5 is int division = 1 */
}`,
            annotations: [
              'Multiplication happens first: double * int promotes the int.',
              'The decimal point makes 9.0 a double literal.',
              'Parentheses reorder evaluation — the pure-int division becomes 1 first.',
            ],
            explanation: 'Three identical signatures; the third is silently wrong — no compiler error (every type is legal), only behavior checks catch it. w-02’s judge compares floats with a tolerance rather than exact == — the universal floating-point discipline.',
          },
          miniLab: {
            title: 'Step in integer division once',
            objective: 'Solve w-02 (Celsius to Fahrenheit) and w-03 (even check), experiencing the write-wrong → read-failures → fix loop.',
            steps: [
              'Open w-02 in Stage 0, write the intuitive c * (9 / 5) + 32 first, run, and see which cases fail.',
              'Fix it with either correct spelling; once green, read the three-way comparison in the solution notes.',
              'w-03: implement is_even with % — negative evens like -4 must return true too.',
            ],
            expectedOutput: 'w-02 first run fails cases like -40/37; after the fix, RESULT fully green.',
            hint: '0 and 100 pass while 37 fails? Then only the integer part is right.',
          },
          debugExercise: {
            title: 'Why is the average always whole',
            language: 'c',
            question: 'This function should return the average of three scores (fractions allowed) yet always returns a whole number. Why, and how to fix it?',
            buggyCode: `double average3(int a, int b, int c)
{
    return (a + b + c) / 3;
}`,
            hint: 'The double return type is fine — the problem lives inside the expression after return.',
            answer: 'Both (a+b+c) and 3 are int, so the division truncates first, and only the already-truncated integer is converted to double on return — the conversion arrives too late. Fix either way: divide by 3.0, or (double)(a + b + c) / 3. Lesson: a return type cannot rescue an integer division buried inside the expression.',
          },
          interviewQ: {
            question: 'Self-check: what are -7 / 2 and -7 % 2 in C11, and why?',
            difficulty: 'easy',
            hint: 'Which way does division truncate? The identity a == (a/b)*b + a%b always holds.',
            answer: 'C11 defines integer division as truncation toward zero: -7 / 2 = -3 (not floor’s -4). The remainder satisfies a == (a/b)*b + a%b, so -7 % 2 = -7 - (-3)*2 = -1 — the remainder takes the dividend’s sign. Corollary: test oddness with n % 2 != 0 rather than n % 2 == 1, because a negative odd n gives n % 2 == -1.',
          },
        },
        {
          id: 'cc-c0-3',
          number: '0.7.0.3',
          title: 'Branches & Loops',
          titleEn: 'Branches & Loops',
          duration: 15,
          tags: ['C', 'if', 'loops'],
          concept: {
            summary: 'if/else routes the program down different paths; while/for repeats a block. All the craft in loops lives at the boundaries: where you start, where you stop, and whether zero iterations is handled.',
            explanation: [
              'Branching: if (condition) { ... } else if (another) { ... } else { ... }. A condition is any expression; nonzero means true. Multi-way dispatch on equal values can use switch (x) { case 1: ...; break; ... default: ...; } — remember the break ending each case; omitting it "falls through" into the next case (occasionally a deliberate trick, usually a bug).',
              'The loop brothers: while (condition) { ... } tests first, runs after — possibly zero times; for (init; condition; step) { ... } folds the counting trio into one line and is the standard "repeat n times" shape: for (int i = 0; i < n; i++). do { ... } while (condition); runs first, tests after — at least once; rarer, but recognize it.',
              'break exits the whole loop immediately; continue skips the rest of this iteration and proceeds to the next test. Both act on the innermost loop only.',
              'Loop correctness rests on two questions: does it terminate (does the condition eventually turn false)? and are the boundaries right? The classic chant i < n, not i <= n: the former runs exactly n times. Off-by-one is the most common bug in the universe — the antidote is walking the smallest inputs: n=0 should never enter the loop, n=1 exactly once.',
              'Zero iterations is a legal state: sum_to(0) runs the body 0 times and returns the initial 0 — by design, not as a special case. When zero-trip loops are naturally correct, half your ifs disappear.',
            ],
            keyPoints: [
              'if/else if/else takes the first true branch top-down; switch needs break',
              'for (int i = 0; i < n; i++) runs exactly n times — i < n, not i <= n',
              'break leaves the loop; continue starts the next iteration',
              'Validate boundaries with n=0 and n=1; zero-trip loops should be naturally correct',
            ],
          },
          diagram: {
            title: 'while and for: two spellings of one loop',
            content: `  int i = 0;                       for (int i = 0; i < n; i++) {
  while (i < n) {                      /* body */
      /* body */                    }
      i++;                          +-------------------------+
  }                                 | init -> test -> body -> |
                                    |    step -> test -> ...  |
  trace for n=3:                    +-------------------------+
  i=0 test(0<3) T -> body -> i=1
  i=1 test(1<3) T -> body -> i=2    trace for n=0:
  i=2 test(2<3) T -> body -> i=3    i=0 test(0<0) F -> never enters
  i=3 test(3<3) F -> done           (correct behavior, not a bug)`,
            caption: 'for merely folds while’s trio into one line. Test-before-body means zero iterations is naturally legal — a good loop makes n=0 correct automatically.',
          },
          codeWalk: {
            title: 'The four parts of a loop',
            file: 'digits.c',
            language: 'c',
            code: `int count_digits(int n)      /* contract: n >= 0 */
{
    if (n == 0)               /* 1 boundary: zero still has one digit */
        return 1;

    int count = 0;            /* 2 accumulator: initialized */
    while (n > 0) {           /* 3 condition: n will reach 0 */
        n = n / 10;           /* 4 step: shave one digit per pass */
        count++;
    }
    return count;
}`,
            annotations: [
              '0 needs its own case: otherwise the loop runs zero times and wrongly reports 0 digits.',
              'Initialize the accumulator at declaration — garbage plus a loop equals random results.',
              'n/10 strictly shrinks n each pass, guaranteeing termination.',
              'Step and count sit together; it reads as "shave a digit, count a digit".',
            ],
            explanation: 'Read every loop through this four-piece frame: initial state, continue-condition, per-pass work, and what guarantees termination. w-08~w-10 each drill one variant; the same frame is reused verbatim for array traversal in Stage 3.',
          },
          miniLab: {
            title: 'The branch-and-loop six-pack',
            objective: 'Solve, in order: w-05 (max of two), w-06 (clamp), w-07 (sign), w-08 (sum to n), w-09 (digit count), w-10 (integer power).',
            steps: [
              'Stage 1’s three are pure branching: w-07’s three branches must be exclusive and exhaustive.',
              'Stage 2’s three are pure loops: after writing each, ask how many passes n=0 (or exp=0) takes.',
              'When one fails, take the input from the failure message and hand-run your loop on paper.',
            ],
            expectedOutput: 'All six green; w-09’s 0 case and w-10’s exp=0 case are the boundary-thinking litmus tests.',
            hint: 'Paper-running a loop = one column for i, one for the test result, one for the accumulator.',
          },
          debugExercise: {
            title: 'Where is this loop off by one?',
            language: 'c',
            question: 'This should compute 1+2+...+n, yet sum_to(3) returns 3 instead of 6. What went wrong?',
            buggyCode: `long sum_to(int n)
{
    long sum = 0;
    for (int i = 1; i < n; i++)
        sum = sum + i;
    return sum;
}`,
            hint: 'Write out every pass for n=3: which values did i actually take?',
            answer: 'i < n stops the loop before i==n: for n=3, i takes only 1 and 2, skipping 3 itself — returning 1+2=3. Either i <= n, or i < n + 1. This is the standard face of off-by-one: the intent says "including n", the condition says "excluding n". The chant "i < n runs n times" applies to counting n items from 0; counting 1 through n inclusive is i <= n. Boundaries always come back to the problem statement.',
          },
          interviewQ: {
            question: 'Self-check: what is the essential difference between while (cond) and do { } while (cond);? Give one natural use case for each.',
            difficulty: 'easy',
            hint: 'Does the test happen before or after the body? What is the minimum number of executions?',
            answer: 'while tests first — minimum zero runs; do-while runs first — minimum one. Natural fits: while suits "there may be nothing to do at all" — processing items from a possibly-empty queue; do-while suits "act once, then decide whether to repeat" — prompting for input until it is valid. Rule of thumb: default to while; reach for do-while only when "the first execution happens unconditionally" is itself the requirement.',
          },
        },
        {
          id: 'cc-c0-4',
          number: '0.7.0.4',
          title: 'Arrays, Pass-by-Value & Length Parameters',
          titleEn: 'Arrays, Pass-by-Value & Length Parameters',
          duration: 15,
          tags: ['C', 'arrays', 'functions'],
          concept: {
            summary: 'An array is a row of same-typed elements accessed by indices 0..n-1. C arrays do not know their own length, so functions that take arrays always take a length too. Parameters are passed by copying values — but an array parameter copies the location, not the contents.',
            explanation: [
              'Declaration and access: int a[5] lays out five consecutive ints, indexed 0 through 4 — a[0] is first, a[4] is last, a[5] does not exist. Out-of-bounds access is undefined behavior (UB): C promises no diagnostic, so it may silently corrupt memory, produce strange values, or crash. Start the habit on day one: the legal range is always 0 <= i < n.',
              'Traversal is cc-c0-3’s loop skeleton wearing an index: for (int i = 0; i < n; i++) using a[i]. Here i < n stops being a chant and becomes the safety line.',
              'Pass-by-value: ordinary parameters are copies. Changing x inside void f(int x) leaves the caller’s variable untouched (seen in cc-c0-1’s code walk). Protection and limitation at once — making a function modify the caller’s data will take pointers (next lesson).',
              'The array-parameter exception: with int a[] in a parameter list, what travels is not a copy of five elements but the array’s **location** — so assigning a[i] inside the function really changes the caller’s array (w-14’s in-place reverse depends on it). And because only the location traveled, the length is lost: C’s convention pairs every array parameter with a length parameter int n. The a[] spelling is equivalent to a pointer — the details are unveiled next lesson.',
              'An empty array (n==0) is legal input: zero loop trips, return the initial value. Picking initial values — 0 for sums/counts, and first-element-not-zero for maxima (w-12 drills it) — plus the empty/single-element paths are the entire difficulty of array problems.',
            ],
            keyPoints: [
              'Legal indices: 0 <= i < n; out of bounds is UB and may corrupt silently or crash',
              'The traversal template: for (int i = 0; i < n; i++) with a[i]',
              'Ordinary parameters copy values; array parameters carry the location — functions can modify the real array',
              'Arrays carry no length: signatures always pair (type a[], int n)',
            ],
          },
          diagram: {
            title: 'Pass-by-value vs an array parameter',
            content: `  void twice(int x)  { x *= 2; }        void fill7(int a[], int n) { a[0] = 7; }

  int v = 10;                            int arr[3] = {1, 2, 3};
  twice(v);        v is still 10         fill7(arr, 3);   arr[0] becomes 7 !
      |                                      |
      v                                      v
  +--------+   copy value +--------+      +-----------+ copy "location" +----+
  | v = 10 | -----------> | x = 10 |      | [1][2][3] | <-------------- | a *|
  +--------+  x's changes +--------+      +-----------+  a[i] lands on  +----+
               stay local                   the original array`,
            caption: 'Ordinary parameters copy the value — the function edits its own duplicate; array parameters copy the location — the function reaches back into the caller’s real row of elements.',
          },
          codeWalk: {
            title: 'The standard face of an array function',
            file: 'scan.c',
            language: 'c',
            code: `int array_max(const int a[], int n)   /* 1 contract: n >= 1 */
{
    int best = a[0];                   /* 2 seed with the first element, not 0 */
    for (int i = 1; i < n; i++) {      /* 3 start at 1: a[0] is already seen */
        if (a[i] > best)
            best = a[i];               /* 4 the champion swaps on any stronger challenger */
    }
    return best;
}`,
            annotations: [
              'const declares "this function promises read-only" — write it whenever true; free insurance for callers.',
              'Seeding with 0 fails on all-negative arrays: the max of {-5,-2,-9} is -2, never 0.',
              'Starting at i=1 avoids re-comparing the seed (0 also works, one wasted pass).',
              'The champion-variable pattern: max, min, longest… all cast from this mold.',
            ],
            explanation: 'An array problem = the loop skeleton + two decisions: what seeds the accumulator/champion, and which path empty or single-element input takes. w-11~w-15 each turn one knob: sum, max, count, in-place mutation, search.',
          },
          miniLab: {
            title: 'The array five-pack',
            objective: 'Solve w-11 (sum), w-12 (max), w-13 (count positives), w-14 (in-place reverse), w-15 (linear search).',
            steps: [
              'w-11 through w-13 are read-only traversals: the const in the signature audits "changed what I only meant to read".',
              'w-14 is your first in-place mutation: draw five boxes on paper and walk the two indices toward the middle first.',
              'w-15 returns upon finding — feel the difference between early exit and full scan.',
            ],
            expectedOutput: 'All five green; w-12’s all-negative case and w-14’s odd/even-length cases are this lesson’s boundary checkpoints.',
            hint: 'Before coding each: what does n==0 return, and why is the seed what it is?',
          },
          debugExercise: {
            title: 'Where the max went wrong',
            language: 'c',
            question: 'array_max({-5, -2, -9}, 3) returned 0 instead of -2. Find both problems.',
            buggyCode: `int array_max(const int a[], int n)
{
    int best = 0;
    for (int i = 0; i <= n; i++) {
        if (a[i] > best)
            best = a[i];
    }
    return best;
}`,
            hint: 'What happens to that seed on an all-negative array? And where does the final i <= n pass read?',
            answer: 'Two problems: (1) best starts at 0 — no element of an all-negative array beats 0, so the function returns a value that is not even in the array; seed with a[0] (n>=1 is guaranteed). (2) i <= n makes the last pass read a[n] — out of bounds, unpredictable ("happened not to crash" is precisely the most dangerous form of OOB). Fix: best = a[0], loop i = 1; i < n.',
          },
          interviewQ: {
            question: 'Self-check: why do C array functions always pair (int a[], int n)? Can sizeof recover the length inside the function?',
            difficulty: 'easy',
            hint: 'What does an array parameter actually carry? What does sizeof measure on a "location"?',
            answer: 'Because an array argument passes only the location of its first element — the length does not travel. Inside the function, sizeof(a) measures the size of a location (a pointer, e.g. 8 bytes), not the array’s byte count, so dividing by sizeof(a[0]) cannot yield the element count. The caller must pass the length explicitly. This is the root of the kernel’s pointer-plus-length interface convention; next lesson replaces the word "location" with its real name: a pointer.',
          },
        },
        {
          id: 'cc-c0-5',
          number: '0.7.0.5',
          title: 'Pointers & C Strings',
          titleEn: 'Pointers & C Strings',
          duration: 16,
          tags: ['C', 'pointers', 'strings'],
          concept: {
            summary: 'A pointer is a variable that stores an address: & takes an address, * follows it back to the real thing. Pointers are how functions modify the caller’s variables. A C string is a char array with a terminating \\0 marker.',
            explanation: [
              'Every variable lives at some memory address. &v extracts v’s address; int *p = &v declares a pointer holding it; *p is "the variable found by following p" — reading *p reads v, writing *p = 9 writes v. The two operators are inverses: *(&v) is v.',
              'Pointers close the gap pass-by-value left open: swap(int *a, int *b) receives two addresses and, via *a and *b, operates directly on the caller’s variables — the generalization of last lesson’s "array parameters carry a location". Call it as swap(&x, &y): hand the addresses in.',
              'NULL is the special null-pointer value meaning “points at no object”. Dereferencing NULL is undefined behavior (UB); common systems often crash, but C does not guarantee one particular failure mode. Discipline: a function taking pointers either guarantees non-NULL in its contract or checks before use.',
              'A C string = a char array + the terminating sentinel \\0 (the character with value 0). "gfx" occupies four bytes: g f x \\0. Every string function relies on \\0 to know where the string ends — strlen counts up to (not including) it. Lose the \\0 and string functions read straight into memory that is not yours.',
              'Last lesson’s cliffhanger resolved: int a[] in a parameter list IS int *a — array parameters "decay" into a pointer to the first element. a[i] and *(a + i) are fully equivalent (pointer plus i advances i elements). Which re-explains why the length must travel separately.',
              'Preview: w-23’s signature is int **arr — a pointer to a pointer. Same logic throughout: to modify an int pass int*; to modify an int* pass int**. It earns its keep in the heap lesson (next).',
            ],
            keyPoints: [
              '& takes an address, * dereferences; *(&v) is v',
              'To let a function change the caller’s variable: pass the address, operate through *',
              'Dereferencing NULL is UB (often a crash); contracts either guarantee non-NULL or check first',
              'C strings end at \\0; array parameters decay to pointers, a[i] == *(a+i)',
            ],
          },
          diagram: {
            title: 'The address journey of swap',
            content: `  main:  int x = 3, y = 9;      swap(&x, &y);

    addr 0x100    addr 0x104          swap's parameters
    +---------+  +---------+       +----------+ +----------+
    | x = 3   |  | y = 9   |       | a = 0x100| | b = 0x104|
    +----^----+  +----^----+       +----|-----+ +----|-----+
         |            |                 |            |
         +------------+------ *a -------+            |
                      +------ *b --------------------+

  inside swap: int t = *a;  *a = *b;  *b = t;
  result:      x == 9, y == 3   (really changed!)`,
            caption: 'Pointers a and b are remote controls: the function holds copies of the addresses, but pressing * follows them back to the real variables in main.',
          },
          codeWalk: {
            title: 'strlen by hand: discovering \\0',
            file: 'strlen.c',
            language: 'c',
            code: `#include <stddef.h>

size_t my_strlen(const char *s)   /* 1 a string parameter is a char pointer */
{
    size_t len = 0;               /* 2 size_t: the standard "length type" */
    while (s[len] != '\\0')        /* 3 sentinel not seen yet: keep counting */
        len++;
    return len;                   /* 4 len is the count excluding the \0 */
}`,
            annotations: [
              'When "gfx" is passed, s points at the character g.',
              'size_t is the unsigned type dedicated to sizes/lengths — standard strlen returns it.',
              "'\\0' is just the value 0, so the condition can read while (s[len]).",
              'For the empty string "", s[0] is already \\0: zero trips, return 0.',
            ],
            explanation: 'Read the same code through two lenses: the index lens s[len] (last lesson’s habit) or the pointer lens *(s + len) — equivalent. Real codebases use both, so recognize both. Everything in string traversal (w-17~w-19) is a variation of this one loop.',
          },
          miniLab: {
            title: 'The pointer-and-string four-pack',
            objective: 'Solve w-16 (pointer swap), w-17 (strlen by hand), w-18 (count a character), w-19 (string equality).',
            steps: [
              'w-16: no arrays in this signature — pure pointers. Afterwards, reason out why swap(&x, &x) is also correct.',
              'w-17: write the while version first, then try the pointer-stepping version (p walks until \\0).',
              'w-18/w-19: both are "traverse until \\0" variants; w-19 advances two pointers in lock-step.',
            ],
            expectedOutput: 'All four green; w-19’s prefix case ("abc" vs "abcd") is the classic slip.',
            hint: 'Draw boxes on paper: sketch the string as bytes ending in \\0, then walk the pointer.',
          },
          debugExercise: {
            title: 'Why did this swap not swap',
            language: 'c',
            question: 'After calling swap(x, y), x and y are unchanged. Where are the two mistakes?',
            buggyCode: `void swap(int a, int b)
{
    int t = a;
    a = b;
    b = t;
}

/* call site: swap(x, y); */`,
            hint: 'What type are the parameters? Whose values actually got exchanged?',
            answer: '(1) The parameters are int, not int* — pass-by-value copied x and y, so the function swapped its own two copies while the caller’s variables never moved; (2) correspondingly the call site passed values. Fix: void swap(int *a, int *b) operating via *a and *b, called as swap(&x, &y). The rule of thumb: for a function to reach outside, the signature must show * and the call site must show & (arrays are the exception, carrying their location by nature).',
          },
          interviewQ: {
            question: 'Self-check: which 4 bytes does char s[4] = "gfx" occupy? What is strlen(s)? And what happens with char s[3]?',
            difficulty: 'easy',
            hint: 'What terminator does a string literal carry? Where does strlen stop?',
            answer: 'The four bytes are g, f, x, \\0 — the literal "gfx" carries its own sentinel. strlen(s) is 3: it stops at \\0 and excludes it. char s[3] = "gfx" is legal C but dangerous: the three characters fill the array exactly and the \\0 is squeezed out — it is no longer a valid C string, and strlen/printf will read past the end until they happen upon some other zero byte. Lesson: size string arrays with one extra byte, always; this is also the origin of strscpy’s capacity semantics in c-09.',
          },
        },
        {
          id: 'cc-c0-6',
          number: '0.7.0.6',
          title: 'Heap Memory & Ownership',
          titleEn: 'Heap Memory & Ownership',
          duration: 16,
          tags: ['C', 'malloc', 'ownership'],
          concept: {
            summary: 'Locals vanish when their function returns; for data that must outlive a function — or whose size is only known at runtime — you rent memory from the heap: malloc rents, free returns. Whoever must return it holds the "ownership".',
            explanation: [
              'So far your variables lived on the stack: the function returns, they vanish. The heap is different memory: you rent it explicitly with malloc(byte_count) and return it explicitly with free(pointer); its lifetime is entirely yours. Renting 10 ints, canonically: int *p = malloc(10 * sizeof(int)); — sizeof keeps the byte math tied to the type.',
              'malloc can fail: when memory is short it returns NULL, so the first act after renting is a check: if (!p) return NULL; (or another failure path). What you rent you must free — forgetting is a leak; freeing twice is a double free (serious); using after freeing is use-after-free (UAF, equally serious). A cheap vaccine: set p = NULL; right after free, because free(NULL) is a legal no-op.',
              'Three relatives: calloc(n, size) rents n elements AND zeroes them (malloc contents are garbage); realloc(p, new_bytes) resizes a rented block — success returns the new address (contents moved for you), failure returns NULL while the old block stays intact. The realloc iron rule: catch the result in a temporary pointer first; with if (!tmp) the old pointer is still alive. Writing p = realloc(p, n) loses your only copy of the address on failure — a leak, and the data becomes unreachable.',
              '"Ownership" is the core question when reading C: who manages this block right now, and who must free it? Two everyday contracts: a function returning a malloc’d pointer = ownership transferred to the caller (caller frees — w-20’s make_range); a function that merely reads/writes a pointer you passed = borrowing, and must not free. Names hint at contracts: create/make/dup transfer; print/sum/find merely borrow.',
              'The professional tools for hunting memory bugs (ASan, valgrind) come later; for now the Code Lab judge plays that role — it counts whether every malloc/free balances, and injects a realloc failure to inspect your failure path.',
            ],
            keyPoints: [
              'malloc rents / free returns; check NULL after renting, set NULL after freeing',
              'calloc = rent + zero; realloc resizes and leaves the old block valid on failure',
              'realloc lands in a temporary first — p = realloc(p, n) is the classic accident',
              'The ownership question: who frees this block? Returned pointer = transfer; passed-in pointer = borrow',
            ],
          },
          diagram: {
            title: 'Stack vs heap: two lifetimes',
            content: `  during the call                 after the function returns
  +-stack-----------+             +-stack-----------+
  | int n = 4;      |   ->        | (gone, automatic)|
  | int *p = *----+ |             |                  |
  +---------------|-+             +------------------+
  +-heap----------v-+             +-heap------------+
  | [0][1][2][3]    |   ->        | [0][1][2][3]     | <- still alive!
  | malloc(4*sizeof(int))|        | until someone    |
  +-----------------+             |      frees it    |
  stack: automatic reclaim        heap: manual, free reclaims`,
            caption: 'The pointer p itself lives on the stack; the memory it points to lives on the heap. After return, p is gone but the block remains — which is why "who holds the address, who frees" must be part of the contract.',
          },
          codeWalk: {
            title: 'One full rent-use-return cycle, failure path included',
            file: 'own.c',
            language: 'c',
            code: `#include <stdlib.h>

int *make_squares(int n)            /* contract: ownership transfers to caller */
{
    int *p = malloc((size_t)n * sizeof(int));  /* 1 rent */
    if (!p)                          /* 2 may fail: check first */
        return NULL;
    for (int i = 0; i < n; i++)
        p[i] = i * i;                /* 3 use */
    return p;                        /* 4 transfer: caller must free */
}

int use_it(void)
{
    int *sq = make_squares(8);
    if (!sq)
        return -1;                   /* 5 propagate failure upward */
    int last = sq[7];
    free(sq);                        /* 6 return the memory */
    sq = NULL;                       /* 7 vaccine: no accidental reuse */
    return last;
}`,
            annotations: [
              'sizeof(int) keeps byte math independent of platform trivia.',
              'Every malloc may return NULL — the failure path is part of the contract.',
              'Rented contents are garbage; fill them yourself.',
              'Returning a heap pointer says explicitly: you free it.',
              'The caller checks NULL before using.',
              'free applies exactly once, and only to addresses from the malloc family.',
              'NULL after free: free(NULL) is legal, so an accidental second free is harmless.',
            ],
            explanation: 'This rent-check-use-return-null rhythm is the whole skeleton of C memory management. realloc merely resizes mid-"use" — its temporary-pointer discipline is drilled in isolation in w-23, and then c-15/c-16 put the same discipline inside real data structures.',
          },
          miniLab: {
            title: 'The heap four-pack in the Code Lab',
            objective: 'Solve w-20 (malloc an array), w-21 (calloc zeroing), w-22 (duplicate an array), w-23 (safe realloc) in order — the judge counts allocator balance and injects failures.',
            steps: [
              'Open Stage 5 of the C Preflight track at /code-lab.',
              'w-20/w-21: mind the n==0 convention (return NULL); pass malloc failure through as NULL.',
              'w-22: after copying, mutate the copy — the original must not move; this is the minimal form of a deep copy.',
              'w-23: write the three-line temporary-pointer pattern first; then deliberately change it to *arr = realloc(*arr, ...) and watch the injected failure catch you.',
            ],
            expectedOutput: 'All four green; w-23 passes "pointer untouched on failure" and "allocator fully balanced".',
            hint: 'Write every size as n * sizeof(type); never read a pointer after freeing it.',
          },
          debugExercise: {
            title: 'Find four memory problems',
            language: 'c',
            question: 'This code has two distinct leak paths, one use-after-free read, and one double free. Find all four.',
            buggyCode: `int demo(int n)
{
    int *a = malloc(n * sizeof(int));
    int *b = malloc(n * sizeof(int));
    if (!a || !b)
        return -1;
    a[0] = 1;
    free(a);
    int x = a[0];
    free(a);
    return x;
}`,
            hint: 'What does the failure path forget? What happens after free? Where did b go?',
            answer: 'Four: (1) at if (!a || !b) return -1, one allocation may already have succeeded, so the failure path leaks it (free(a); free(b); is safe even when one is NULL); (2) even when both allocations succeed, b is never freed on the normal path, a second leak; (3) int x = a[0] reads after free(a), a use-after-free; (4) the second free(a) is a double free. Repair with one cleanup exit, exactly one free per successful allocation, and no reads after free.',
          },
          interviewQ: {
            question: 'Why is p = realloc(p, n) dangerous? Exactly what is lost when it fails?',
            difficulty: 'easy',
            hint: 'What does realloc return on failure, and what state is the old block in?',
            answer: 'On failure realloc returns NULL while the old block remains valid. p = realloc(p, n) overwrites p with NULL — and the old address was the only key you had: the block becomes unreachable and unfreeable. Data lost, memory permanently leaked. The correct stance: int *tmp = realloc(p, n); if (!tmp) return error; p = tmp;. This one discipline carries from w-23 through c-15 all the way to kernel krealloc reviews.',
          },
        },
        {
          id: 'cc-c0-7',
          number: '0.7.0.7',
          title: 'POSIX Bridge: Pages, mmap & munmap',
          titleEn: 'POSIX Bridge: Pages, mmap & munmap',
          duration: 14,
          tags: ['POSIX', 'mmap', 'pages'],
          concept: {
            summary: 'malloc/free are the C standard library’s language-level interface; mmap/munmap are POSIX/Linux system-level interfaces that request memory from the kernel in page units. Separating these two layers is step one from C-the-language into systems programming.',
            explanation: [
              'Layers first: malloc belongs to ISO C — every platform’s C has it; mmap belongs to POSIX (the Unix-family system interface standard) — Linux/macOS have it, bare metal and native Windows do not. They are not rivals but upstream/downstream: many libc malloc implementations use mmap underneath, by policy, to buy memory wholesale from the kernel — an implementation detail, never an ISO C guarantee.',
              'A page is the kernel’s smallest unit of memory management — commonly 4096 bytes but **never to be hardcoded**: query it at runtime with sysconf(_SC_PAGESIZE) (returns long; check > 0). GPU VRAM, DMA buffers and kernel mappings all think in pages; the word stays with you from here on.',
              'The anonymous-mapping call shape: mmap(NULL, len, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0) — ask the kernel directly for len bytes of read-write memory (backed by no file, hence "anonymous"). Two details that differ sharply from malloc: failure returns **MAP_FAILED ((void *)-1), not NULL**, so error checks must compare against MAP_FAILED; and you return memory with munmap(p, len) — carrying the length back, with munmap itself able to fail (returns -1).',
              'Which to use when: everyday allocation is always malloc/free (fast, cached, any size); mmap’s stage is page-aligned bulk memory, inter-process sharing, and mapping files into the address space — plus this course’s true destination: GPU drivers exposing VRAM/BOs to userspace (Module 4’s GEM/TTM) are an extension of mmap semantics. Note an anonymous mapping is **not** a PCI BAR/MMIO — register mappings use different machinery, unveiled in Modules 2/4.',
              'Practical note: scripts/probe-mmap-backends.mjs exercised the final harness on both judge sandboxes, and Godbolt plus Wandbox passed. Warm-up w-32 is therefore live in the browser with the same complete round trip. The local MiniLab remains useful for observing your own Linux/macOS page size.',
            ],
            keyPoints: [
              'malloc = ISO C library; mmap = POSIX system interface — layers, not substitutes',
              'Query page size via sysconf(_SC_PAGESIZE); never hardcode 4096',
              'mmap fails with MAP_FAILED (not NULL); munmap takes the length and can fail',
              'Anonymous mappings ≠ MMIO/PCI BARs; GPU BO mapping extends mmap semantics (Module 4)',
            ],
          },
          diagram: {
            title: 'Two layers of memory interface',
            content: `  your code
     | malloc(37)          any byte count, fast, cached
     v
  +------------------+
  | libc allocator   |  <- ISO C library layer
  | (heap mgmt/cache)|
  +--------+---------+
           | uses it by policy for big/bulk cases
           v
  +------------------+
  | mmap / munmap    |  <- POSIX system layer (page granularity)
  +--------+---------+
           v
  +------------------+
  | Linux kernel     |  page tables / physical memory
  +------------------+`,
            caption: 'Many Linux libc allocators hand large allocations to mmap by policy (an implementation detail, not an ISO C guarantee); calling mmap directly bypasses the libc allocator and requests pages straight from the kernel.',
          },
          codeWalk: {
            title: 'A full round trip through one anonymous page',
            file: 'page.c',
            language: 'c',
            code: `#define _DEFAULT_SOURCE          /* 1 must precede every #include */
#include <sys/mman.h>
#include <unistd.h>

int page_roundtrip(void)
{
    long raw = sysconf(_SC_PAGESIZE);   /* 2 ask for the page size */
    if (raw <= 0)
        return -1;
    size_t page = (size_t)raw;

    unsigned char *p = mmap(NULL, page,
                            PROT_READ | PROT_WRITE,
                            MAP_PRIVATE | MAP_ANONYMOUS,
                            -1, 0);
    if (p == MAP_FAILED)                /* 3 not NULL! */
        return -1;

    for (size_t i = 0; i < page; i++)   /* 4 the whole page is writable */
        p[i] = 0xAB;

    if (munmap(p, page) != 0)           /* 5 returning memory can fail too */
        return -1;
    return 0;
}`,
            annotations: [
              '_DEFAULT_SOURCE is a glibc feature-test macro that restores default/BSD-derived definitions (including MAP_ANONYMOUS) in strict standard modes; it is not a POSIX macro and must precede every system header.',
              'sysconf returns long; -1 signals query failure.',
              'MAP_FAILED is (void *)-1 — checking NULL misses real failures.',
              'PROT_* declares access rights; MAP_PRIVATE|MAP_ANONYMOUS means a private anonymous page.',
              'munmap works at page granularity; this example returns the same whole-page length it mapped (page-aligned partial unmapping is legal too — see the MiniLab).',
            ],
            explanation: 'This query-map-check-use-unmap round trip is the shared skeleton of every mmap scenario. Module 4 shows the GPU edition of the same skeleton: userspace mmaps a BO, and the reads and writes land in video memory.',
          },
          miniLab: {
            title: 'Verify a page locally',
            objective: 'Compile and run the round-trip code in any Linux environment (or a macOS terminal) and observe your page size.',
            steps: [
              'Save the code walk as page.c, add a main that prints page_roundtrip()’s return and sysconf(_SC_PAGESIZE).',
              'Build and run: gcc -std=c11 -Wall -Wextra page.c -o page && ./page.',
              'Map 2*page (two pages), return the first with munmap(p, page), then the second with munmap(p + page, page) — feel that a partial unmap must start on a page boundary. For ordinary pages, munmap’s length itself need not be a whole-page multiple; the system unmaps every page touched by the range, so production code should still pass a clear interval matching its mapping.',
              'Open Code Lab w-32 and repeat the round trip online with dual-backend judging, injected failure, and resource-balance checks.',
            ],
            expectedOutput: 'Returns 0; the page size usually prints 4096 (16384 on Apple Silicon — exactly why it is never hardcoded).',
            hint: 'On macOS the flag spells MAP_ANON as well; Linux accepts both.',
          },
          debugExercise: {
            title: 'Three system-layer misuses',
            language: 'c',
            question: 'This compiles, yet misuses mmap semantics in three places. Find them.',
            buggyCode: `#include <sys/mman.h>

void *get_page(void)
{
    void *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
                   MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (p == NULL)
        return NULL;
    return p;   /* caller should free(p) when done */
}`,
            hint: 'What value does the error check test? Where does 4096 come from? What returns the memory?',
            answer: '(1) mmap fails with MAP_FAILED ((void*)-1); p == NULL does not recognize that failure sentinel, so a failed mapping is handed out as a success; (2) 4096 hardcodes a page-size assumption — use sysconf(_SC_PAGESIZE); (3) the comment tells the caller to free() — mmap’d memory must be returned with munmap(p, len); freeing a non-malloc pointer is undefined behavior. Additionally, glibc’s strict -std=c11 mode may hide MAP_ANONYMOUS unless _DEFAULT_SOURCE is defined first.',
          },
          interviewQ: {
            question: 'Self-check: why is "malloc is just mmap underneath" inaccurate? What are the failure returns of each?',
            difficulty: 'easy',
            hint: 'The standard/implementation boundary; NULL vs MAP_FAILED.',
            answer: 'ISO C specifies malloc’s behavior (usable memory or NULL), not its mechanism; glibc-class implementations do use mmap for large blocks and brk/heap caches for small ones, but that is implementation policy — swap the libc or a threshold and it changes, so neither teaching nor code should rely on it. Failure returns: malloc → NULL; mmap → MAP_FAILED ((void*)-1). Treating mmap errors as NULL is the classic portability bug at this layer boundary.',
          },
        },
        // [c0-lessons-end]
      ],
    },
    {
      id: 'cc-c',
      number: '0.7.1',
      title: 'C Core Review',
      titleEn: 'C Core Review',
      icon: 'Terminal',
      description: 'A systematic REVIEW of the C you actually need for driver work: compilation & linking, types & integers, pointers, strings, structs, memory lifetime, and function pointers. If any of those words is new to you, start with 0.7.0 (C from Zero) and the C Preflight track in the Code Lab first.',
      lessons: [
        {
          id: 'cc-c-1',
          number: '0.7.1.1',
          title: 'Translation Units, Compilation & Linking',
          titleEn: 'Translation Units, Compilation & Linking',
          duration: 16,
          tags: ['C', 'compilation', 'linking'],
          concept: {
            summary: 'A .c file becomes an executable or kernel module through four stages: preprocess, compile, assemble, link. Understanding "declaration vs definition" is the key to reading any multi-file project.',
            explanation: [
              'Preprocessing (cpp) handles #include, #define, #if. #include literally pastes a header\'s text in place. One .c file plus all the headers it recursively pulls in forms a "translation unit" — the smallest complete unit the compiler actually sees.',
              'Compile + assemble (cc1 + as): each translation unit is compiled independently into an object file (.o). The key word is independently — when compiling amdgpu_device.c the compiler does not know the bodies of functions in amdgpu_ring.c; it only needs a declaration to emit a call, deferring symbol resolution to the link stage.',
              'Linking (ld) matches symbols (function and global-variable names) across .o files. One .o calls foo(), another defines foo(); the linker binds them. No definition found → "undefined reference to foo"; two definitions found → "multiple definition".',
              'A declaration tells the compiler "this name exists and has this type"; a definition actually allocates the entity (function body, variable storage). Convention: declarations go in headers, definitions go in .c files. That is the engineering form of the One Definition Rule (ODR).',
              'The linkage semantics of static and extern deserve their own spotlight: file-scope functions/variables marked static have internal linkage — the symbol never enters the global symbol table, so same-named static functions in different .c files cannot collide. This is how the kernel manages name pollution in a language without namespaces; the many static functions in amdgpu prefixed by IP-block names (gfx_v10_0_ring_emit_ib and friends) are visible only to their own file. An extern declaration announces "defined elsewhere" and the linker binds it; kernel modules add one more layer — EXPORT_SYMBOL — so only explicitly exported symbols are callable from other modules, a stricter boundary than extern.',
              'Two frequent traps. First, putting a definition in a header: once several .c files include it, every translation unit owns a copy and the link explodes with multiple definition (static inline functions are the exception — one private copy per unit, no exported symbol — which kernel headers use heavily). Second, believing header guards prevent link conflicts: guards only stop repeated inclusion within one translation unit, never duplicate definitions across units. The practical forensics tools are nm and objdump -t, which dump a .o symbol table directly: uppercase T/D are exported definitions, lowercase t/d are static, U is an unresolved reference.',
              'Drill note: this lesson has no dedicated problem — but every Code Lab (/code-lab) judge run IS a real "single translation unit compile + link": your code and the judge main are joined into one source file for gcc, so undefined reference, multiple definition and type-mismatch errors from this lesson appear verbatim in the compile output. Whenever a drill throws a linker-class error, come back here to match it.',
            ],
            keyPoints: [
              'Translation unit = one .c + every header it recursively #includes',
              'Each .o compiles independently; symbol resolution is deferred to link time',
              'undefined reference = no definition at link; multiple definition = duplicated definition',
              'Header guards #ifndef/#define/#endif or #pragma once prevent double inclusion',
              'static = internal linkage (file-private), extern = a reference to a definition elsewhere; the kernel gates inter-module visibility with EXPORT_SYMBOL',
            ],
          },
          diagram: {
            title: 'From source to a kernel module: the build pipeline',
            content: `  gpu_ring.c                 gpu_device.c
      │                          │
      ▼  preprocess cpp          ▼  (#include "gpu_ring.h" pasted in)
  gpu_ring.i                 gpu_device.i
      │  compile cc1             │
      ▼                          ▼
  gpu_ring.s                 gpu_device.s   (assembly)
      │  assemble as             │
      ▼                          ▼
  gpu_ring.o  ◄── symbols ──►  gpu_device.o
      └───────────┬───────────────┘
                  ▼  link ld (resolve symbols, bind calls)
            amdgpu.ko / a.out

  declarations in header   definitions in .c
  ┌──────────────┐    ┌────────────────────────┐
  │ gpu_ring.h:  │    │ gpu_ring.c:            │
  │ int ring_init│    │ int ring_init(...) {   │
  │   (..);      │    │   /* real body */      │
  │ // just decl │    │ }   // definition      │
  └──────────────┘    └────────────────────────┘`,
            caption: 'Each .c is an independently compiled translation unit; the linker stitches their symbols into one module. amdgpu.ko is hundreds of .o files linked together.',
          },
          codeWalk: {
            title: 'Declaration, definition and extern — how files share symbols',
            file: 'gpu_ring.h / gpu_ring.c / main.c',
            language: 'c',
            code: `/* ---------- gpu_ring.h (declarations only) ---------- */
#ifndef GPU_RING_H          /* 1 header guard begins */
#define GPU_RING_H

extern int g_active_rings;  /* 2 declare a global, allocate no storage */
int ring_init(int ring_id); /* 3 function declaration (prototype) */

#endif /* GPU_RING_H */

/* ---------- gpu_ring.c (definitions) ---------- */
#include "gpu_ring.h"
int g_active_rings = 0;     /* 4 storage actually allocated here */

static int compute_size(int id) { return id * 16; } /* 5 static: file-local */

int ring_init(int ring_id) {
    g_active_rings++;
    return compute_size(ring_id);
}

/* ---------- main.c ---------- */
#include "gpu_ring.h"
#include <stdio.h>
int main(void) {
    printf("size=%d, active=%d\\n", ring_init(4), g_active_rings);
    return 0;   /* compute_size is invisible here (static); ring_init is visible */
}`,
            annotations: [
              'Header guard: prevents re-expansion (and thus redefinition) if the header is #included more than once',
              'extern declares a global: tells every translation unit "it is defined elsewhere" and allocates no storage itself',
              'Function prototype: lets main.c emit a correct call without seeing the implementation',
              'The single definition of a global lives in exactly one .c — ODR in practice',
              'A static function has internal linkage; other files cannot see it, avoiding symbol pollution',
            ],
            explanation: 'The amdgpu driver has hundreds of .c files, all cooperating through this "declare in headers, define in .c, control visibility with extern/static" mechanism. The amdgpu-y += amdgpu_device.o amdgpu_ring.o ... lines in drivers/gpu/drm/amd/amdgpu/Makefile simply list every translation unit to compile and link into amdgpu.ko. Grasp this layer and you understand "why this function is only a prototype in the .h" and "why this function is marked static".',
          },
          miniLab: {
            title: 'Deliberately cause a link error',
            objective: 'By separating the compile and link stages, understand declaration vs definition and where "undefined reference" comes from',
            setup: 'mkdir -p ~/amd-labs/cc-c-1 && cd ~/amd-labs/cc-c-1',
            language: 'bash',
            code: `# Use the three files from the code walk: gpu_ring.h / gpu_ring.c / main.c
# 1) Compile only (no link) to get .o files
gcc -c gpu_ring.c -o gpu_ring.o
gcc -c main.c     -o main.o

# 2) Inspect symbols: T=defined here, U=undefined (await link), t=local(static)
nm gpu_ring.o
nm main.o

# 3) Link into an executable
gcc gpu_ring.o main.o -o ring && ./ring`,
            steps: [
              'First create gpu_ring.h, gpu_ring.c and main.c from the code walk',
              'Run the commands; note ring_init is U in main.o but T in gpu_ring.o',
              'Delete the body of ring_init in gpu_ring.c (keep only the declaration), relink, and observe "undefined reference to ring_init"',
              'Remove static from compute_size, run nm again, and watch it change from t to T (now externally visible)',
            ],
            expectedOutput: `# nm main.o shows:
                 U ring_init      # U = undefined, linker must find it elsewhere
# nm gpu_ring.o shows:
0000000000000000 T ring_init      # T = this file provides the definition
0000000000000000 t compute_size   # t = static, internal linkage
# Final run:
size=64, active=1`,
            hint: 'nm symbol types: uppercase = external linkage (visible to other files), lowercase = internal (static). U means the symbol is only referenced here and must be resolved against an uppercase definition at link time.',
          },
          debugExercise: {
            title: 'Find the link-time bug',
            description: 'A common beginner mistake: putting a global variable definition directly in a header that two .c files include.',
            buggyCode: `/* config.h */
#ifndef CONFIG_H
#define CONFIG_H
int g_debug_level = 0;   /* note: this is a DEFINITION, not a declaration */
#endif

/* a.c */            /* b.c */
#include "config.h"  #include "config.h"
/* ... */            /* ... */

/* Each .c compiles fine, but:
   gcc a.o b.o -o app
   /usr/bin/ld: multiple definition of 'g_debug_level' */`,
            language: 'c',
            question: 'Why does each file compile fine yet linking reports multiple definition?',
            hint: 'A header is "pasted" into every .c that includes it. Think about what a.o and b.o each end up containing.',
            answer: 'Because g_debug_level = 0 is a definition (it allocates storage and initializes it). After the header is pasted into a.c and b.c, both a.o and b.o contain a definition of g_debug_level, so the linker sees two external definitions and reports multiple definition. Fix: put only a declaration `extern int g_debug_level;` in the header, and put the actual definition `int g_debug_level = 0;` in exactly one .c (e.g. config.c). That is precisely what extern is for, and it is the standard way the kernel shares global symbols.',
          },
          interviewQ: {
            question: 'Why do kernel headers use static inline functions so heavily instead of ordinary function declarations? How does this relate to linking?',
            difficulty: 'medium',
            hint: 'Consider what happens if you put an ordinary function definition in a header, and the linkage of inline vs static.',
            answer: 'If you put an ordinary (non-inline) function definition in a header, every translation unit that includes it gets a copy of the definition, causing multiple definition at link time. static inline does two things at once: static gives it internal linkage so each translation unit has its own private copy with no conflict, and inline hints the compiler to expand it in place, avoiding call overhead. This lets short helper functions (register bitfield extraction, list operations) live directly in headers for everyone to include — no link conflicts, plus inlining performance. The countless static inline helpers throughout include/linux/ exist for exactly this reason.',
            amdContext: 'amdgpu headers (amdgpu.h, the per-IP-block headers) contain many static inline wrappers for register access and state queries. Understanding the linkage semantics of static inline is a prerequisite to reading them.',
          },
        },
        {
          id: 'cc-c-2',
          number: '0.7.1.2',
          title: 'Types, Integer Promotion & Fixed-Width Integers',
          titleEn: 'Types, Integer Promotion & Fixed-Width Integers',
          duration: 17,
          tags: ['C', 'types', 'integer'],
          concept: {
            summary: 'The sizes of C\'s basic integer types are implementation-defined; narrow integers first undergo integer promotion in expressions (normally to int; to unsigned int when int cannot hold every value); drivers use fixed-width types (u8/u16/u32/u64) to guarantee the exact widths hardware registers require.',
            explanation: [
              'The byte counts of char/short/int/long/long long are set by the platform ABI. Linux x86-64 uses LP64: int=4, long=8, pointer=8. Precisely because they are "uncertain", the kernel never uses bare int for hardware; it uses u8/u16/u32/u64 (i.e. uint8_t…). A GPU register is 32 bits, so it must be u32 — one bit off and you read it wrong.',
              'Integer promotion: any integer narrower than int (char, short, bitfields, u8, u16) is promoted before arithmetic — to int when int can represent every value of the original type (true of char/short/u8/u16), otherwise to unsigned int. So with u8 a=200, b=100; a+b is actually computed as 300 in int and does not wrap — frequently surprising.',
              'Usual arithmetic conversions: when signed and unsigned mix: with the unsigned side of rank at least the signed side, the signed operand converts to unsigned (int vs unsigned int); with the signed side of higher rank and able to represent every unsigned value (long long vs unsigned int), the pair converts to that signed type; with higher rank but unable to hold them all (long vs unsigned int on 32-bit), both convert to the unsigned counterpart of the signed type. Classic trap: unsigned a=0; a-1 is not -1 but 0xFFFFFFFF; if (a - b < 0) is always false when a and b are unsigned.',
              'Overflow semantics: signed integer overflow is undefined behavior (UB — the compiler may optimize aggressively or delete code); unsigned overflow is well-defined as wrap-around modulo 2^n. So masks, shifts, and hashes should use unsigned types.',
              'State the promotion rules precisely: types narrower than int (char, short, bit-fields) are promoted before arithmetic — to int if int can represent all their values, otherwise to unsigned int. Two operands of different types then meet the "usual arithmetic conversions": signed meeting unsigned of equal rank converts the signed side to unsigned; a higher-ranked unsigned type wins too; only when the signed type has higher rank **and** can represent every value of the unsigned type (long long vs. unsigned int, say) does the pair convert toward signed; and when that higher-ranked signed type still cannot hold every unsigned value (long vs. unsigned int on 32-bit targets), both convert to its unsigned counterpart. Nearly every incident stems from the "unsigned wins" branches: size_t (unsigned) minus int, u32 compared with -1 — a negative number instantly becomes astronomically large. When driver code shows an explicit (int) or (s32) cast, the author is usually strangling this rule by hand.',
              'Draw yourself three UB red lines: signed integer overflow is UB (unsigned wraparound is well-defined modular arithmetic — rings and fences run on it); shifting by at least the width of the left operand is UB (a 32-bit value shifted by 32); and a narrow type is promoted to int before shifting, so 1 << 31 is UB too (write 1u << 31 or BIT(31)). Companion drills: Code Lab c-02 (upper/lower 32 bits), c-03 (size_t underflow), c-04/c-05 (masks and fields), c-06 (fls), k-05 (ring buffer) and k-10 (fence wraparound) all orbit this lesson — compiled and run right in the browser.',
            ],
            keyPoints: [
              'int/long sizes are platform-dependent; hardware data always uses fixed-width u8/u16/u32/u64',
              'Integers narrower than int undergo promotion before arithmetic: normally to int, to unsigned int only when int cannot hold every value',
              'signed ⊕ unsigned mixing at equal rank → converts to unsigned (where negatives become huge positives); it converts toward signed only when the signed type has higher rank and fits every value',
              'signed overflow = UB; unsigned overflow = wrap mod 2^n; use unsigned for bit ops',
              'In the usual arithmetic conversions unsigned "infects" signed; unsigned wraparound is legal while signed overflow is UB — ring/fence wrap math relies on the former',
            ],
          },
          diagram: {
            title: 'Integer types and promotion under LP64',
            content: `  Type sizes (Linux x86-64, LP64)
  ┌───────────┬───────┬───────────────────────────────┐
  │ type      │ bytes │ kernel fixed-width alias      │
  ├───────────┼───────┼───────────────────────────────┤
  │ char      │  1    │ u8  / s8                      │
  │ short     │  2    │ u16 / s16                     │
  │ int       │  4    │ u32 / s32   ← GPU reg width   │
  │ long      │  8    │ u64 / s64 (x86-64)            │
  │ long long │  8    │ u64 / s64                     │
  │ void *    │  8    │ —                             │
  └───────────┴───────┴───────────────────────────────┘

  Promotion trap:
    uint8_t a = 0xFF, b = 0x01;
    (a + b)  →  each promoted to int  →  0xFF + 0x01 = 0x100 (256)
               NOT wrapped to 0! For 8-bit wrap, cast: (uint8_t)(a + b)

  signed/unsigned trap:
    unsigned u = 0;
    (u - 1)  →  0xFFFFFFFF (4294967295), not -1`,
            caption: 'Hardware register layouts demand exact bit widths, so drivers use u32 not int. Integer promotion and signed/unsigned conversion are among C\'s most insidious bug sources.',
          },
          codeWalk: {
            title: 'Extracting a bitfield from a 32-bit register — why unsigned fixed-width is mandatory',
            file: 'illustrative: register bitfield parsing',
            language: 'c',
            code: `#include <stdint.h>

/* A simplified 32-bit status register, like a trimmed-down GRBM_STATUS:
   bit[0]      : busy
   bit[8..11]  : active engine id (4 bits)
   bit[31]     : guilty (culprit of the last hang) */

#define BUSY_BIT      (1u << 0)          /* 1 use 1u (unsigned) for masks */
#define ENGINE_SHIFT  8
#define ENGINE_MASK   (0xFu << ENGINE_SHIFT)
#define GUILTY_BIT    (1u << 31)         /* 2 1<<31 is UB on int! use 1u */

static uint32_t engine_id(uint32_t reg) {
    return (reg & ENGINE_MASK) >> ENGINE_SHIFT;  /* 3 mask first, then shift */
}

int main(void) {
    uint32_t reg = 0x80000A01;          /* guilty=1, engine=0xA, busy=1 */
    /* 4 print as unsigned (%u/%x) so bit31 is not read as a sign bit */
    return (int)engine_id(reg);          /* = 0xA = 10 */
}`,
            annotations: [
              'Add the u suffix to mask literals (1u): keeps them unsigned, avoiding conversion when mixed with signed int',
              '1u << 31 is a valid unsigned shift; 1 << 31 hits signed overflow (UB) — a real compiler warning',
              'Standard bitfield extraction: & the mask to clear unrelated bits, then >> to the low end',
              'Printing/comparing register values must use unsigned semantics, or bit31 is treated as a sign bit and turns negative',
            ],
            explanation: 'In amdgpu, RREG32() returns u32, and every register bitfield macro (the thousands of *_MASK / *__SHIFT definitions under drivers/gpu/drm/amd/include/asic_reg/) is built on "unsigned + fixed-width". If you hold a register value in a signed int, the moment bit31 is set it is interpreted as negative and comparisons/shifts go haywire. These rules are not academic fussiness; they are bugs you guard against daily.',
          },
          miniLab: {
            title: 'See integer promotion and unsigned wrap with your own eyes',
            objective: 'Reproduce "promotion to int" and "unsigned wrap" with a minimal program to build muscle memory about types',
            setup: 'mkdir -p ~/amd-labs/cc-c-2 && cd ~/amd-labs/cc-c-2',
            language: 'c',
            code: `#include <stdio.h>
#include <stdint.h>

int main(void) {
    printf("sizeof(int)=%zu long=%zu ptr=%zu\\n",
           sizeof(int), sizeof(long), sizeof(void *));

    uint8_t a = 0xFF, b = 0x01;
    printf("a+b as int      = %d\\n", a + b);           /* 256, promoted */
    printf("(uint8_t)(a+b)  = %u\\n", (uint8_t)(a + b)); /* 0, explicit wrap */

    unsigned u = 0;
    printf("u - 1           = %u\\n", u - 1);            /* 4294967295 */
    printf("(u - 1 < 0)?    = %d\\n", (u - 1) < 0);      /* 0 (always false) */

    printf("1u << 31        = 0x%X\\n", 1u << 31);       /* 0x80000000 */
    return 0;
}`,
            steps: [
              'Save as lab.c, build/run with gcc -Wall -Wextra -o lab lab.c && ./lab',
              'Observe a+b prints 256, not 0 — proof the arithmetic happens in int',
              'Change unsigned u to int u and recheck (u-1<0) to contrast signed vs unsigned',
              'Change 1u << 31 to 1 << 31, rebuild with -fsanitize=undefined, and watch UBSan report the signed shift overflow',
            ],
            expectedOutput: `sizeof(int)=4 long=8 ptr=8
a+b as int      = 256
(uint8_t)(a+b)  = 0
u - 1           = 4294967295
(u - 1 < 0)?    = 0
1u << 31        = 0x80000000`,
            hint: 'Two iron rules: (1) integers narrower than int are promoted to int before arithmetic; (2) when signed meets unsigned, the result is usually unsigned. Always use unsigned fixed-width types for bit ops, masks, and registers.',
          },
          debugExercise: {
            title: 'Find why this loop never stops',
            description: 'This tries to iterate a register array in reverse, but the program hangs (infinite loop).',
            buggyCode: `#include <stddef.h>
void dump_regs(uint32_t *regs, size_t count) {
    /* want to print from the last down to index 0 */
    for (size_t i = count - 1; i >= 0; i--) {
        print_reg(i, regs[i]);
    }
}`,
            language: 'c',
            question: 'size_t is unsigned. What happens when i is 0 and you do i--? Why is i >= 0 always true?',
            hint: 'An unsigned value is always >= 0. i=0 then i-- wraps to a huge positive number.',
            answer: 'size_t is unsigned, so i >= 0 is always true for unsigned values and the loop never exits; moreover, when i is 0, i-- wraps to SIZE_MAX and regs[SIZE_MAX] is an out-of-bounds access. Fixes: (1) use a signed index `for (ssize_t i = count - 1; i >= 0; i--)`; (2) keep unsigned but change the test `for (size_t i = count; i-- > 0; )` (test then decrement); (3) `size_t i = count; while (i > 0) { i--; ... }`. This is the classic trap of reverse-iterating with an unsigned index, and kernel code trips over it too.',
          },
          interviewQ: {
            question: 'Why does the Linux kernel use u32/u64 everywhere instead of int/long? Explain from both hardware interaction and portability angles.',
            difficulty: 'medium',
            hint: 'Think about register layout, cross-architecture (32/64-bit, endianness), and ABI differences.',
            answer: 'Two core reasons. (1) Hardware interaction needs exact widths: GPU registers, command packets (PM4), and firmware structs have precise bit layouts; u32 is 32 bits on every platform, whereas int/long sizes vary by ABI (on some platforms long is 4 bytes), and bare types would misalign fields and read the wrong register. (2) Portability: the kernel runs on x86-64, ARM64, RISC-V, etc.; fixed-width types keep the same struct layout across all of them, and types like __le32/__be32 additionally express endianness explicitly. The kernel also has semantic fixed-width types like dma_addr_t and phys_addr_t that say "this is a bus address", not merely a number. In short: when talking to hardware or across architectures, widths must be exact, so use fixed-width types.',
            amdContext: 'amdgpu register access RREG32/WREG32, the command ring buffer, and firmware-loading structs are all built on u32/u64. A common interview question is "why not int" — answering "deterministic hardware widths + cross-architecture ABI consistency" nails it.',
          },
        },
        {
          id: 'cc-c-3',
          number: '0.7.1.3',
          title: 'Pointers & the Memory Model',
          titleEn: 'Pointers & the Memory Model',
          duration: 18,
          tags: ['C', 'pointer', 'memory'],
          concept: {
            summary: 'A pointer is just "a variable that stores a memory address". Mastering address-of, dereference, pointer types, array decay, and output parameters is the bedrock for reading and writing any kernel code. (More advanced tricks like container_of are in Module 1.)',
            explanation: [
              'Address-of & and dereference *: &x gives the address of variable x; *p accesses the value at the address p holds. Pointers have types: int* and char* both store addresses, but dereferencing interprets that memory per its type (how many bytes to read, how to interpret them).',
              'NULL and uninitialized pointers: a null pointer means “points to no object”; dereferencing it is UB, commonly a crash but not guaranteed to fail in one particular way. An uninitialized (wild) pointer has an indeterminate value, and dereferencing it is also UB — often subtler because it may happen not to crash.',
              'Arrays and pointers: in most expressions an array name "decays" to a pointer to its first element, so arr[i] is equivalent to *(arr + i) and &arr[i] equals arr + i. But an array is not a pointer — sizeof(arr) is the whole array\'s size, while sizeof(p) is always one pointer\'s size (8 bytes).',
              'Output parameters: a C function can return only one value, so "write the result back to the caller through a pointer parameter" is the standard pattern. Kernel functions generally return an int error code (0 = success, negative -Exxx = failure) and pass the real result out via a pointer.',
              'Pointer arithmetic counts in elements, not bytes: p+1 advances by sizeof(*p) bytes, and subtracting two same-typed pointers yields an element count (type ptrdiff_t). That is also why void* has no arithmetic — it does not know its element size; for a byte view, convert to unsigned char* first, the one type the C standard guarantees may alias any object. Meet strict aliasing while you are here: accessing an object through an incompatible pointer type is UB (the *(u32*)&float_var pattern). The kernel builds with -fno-strict-aliasing to switch that optimizer assumption off, but userspace code should honestly use memcpy.',
              'Defensive discipline for out-parameters: check NULL on entry; never write the output on failure paths (callers may treat it as a validity signal); write only on success and return 0 only after writing. One invisible trap is getting the pointer-to-pointer level wrong — passing int* lets you modify the caller’s int, but modifying the caller’s int* takes an int**. Companion drills: c-07 (error codes and out-params) and c-08 (hand-written memcpy — full muscle memory for void* to byte pointers).',
            ],
            keyPoints: [
              'A pointer stores an address; *p reads/writes the pointee, &x takes the address',
              'Dereferencing NULL or a wild pointer is UB; either may crash or fail more subtly',
              'arr[i] ≡ *(arr+i); but sizeof(array) ≠ sizeof(pointer)',
              'Kernel convention: return an int error code, pass results out via pointer parameters',
              'Pointer arithmetic strides by element; unsigned char* is the only sanctioned universal byte view; reinterpret across types with memcpy, not pointer casts',
            ],
          },
          diagram: {
            title: 'Pointers, addresses and dereference',
            content: `  Variables and addresses (illustrative address values)
   address     contents
  0x7ffe10:  [  42   ]  ← int x = 42;
  0x7ffe18:  [0x7ffe10] ← int *p = &x;   p holds the address of x

   *p  → follow the address 0x7ffe10 in p → read 42
   p   → 0x7ffe10 (the address itself)
   &p  → 0x7ffe18 (the address of the pointer variable)

  Array decay:
    int a[4] = {10,20,30,40};
    a      → &a[0] (address of first element)
    a[2]   ≡ *(a + 2)  → 30
    sizeof(a)=16(whole array)   sizeof(&a[0])=8(one pointer)

  Output-parameter pattern:
    int get_temp(struct dev *d, u32 *out);  // returns 0/negative errno
    u32 t;  if (get_temp(d, &t) == 0) use(t);`,
            caption: 'A pointer variable itself occupies memory and has its own address. An array name decays to a first-element pointer in expressions, but sizeof still distinguishes array from pointer.',
          },
          codeWalk: {
            title: 'Kernel-style output parameters and error codes',
            file: 'illustrative: errno-style interface',
            language: 'c',
            code: `#include <errno.h>
#include <stdint.h>

struct gpu_dev { uint32_t temp_milli_c; int powered; };

/* Return 0 for success; a negative errno for failure.
   The real result is written back through the out pointer.
   This is the most common shape of a kernel function. */
int gpu_read_temp(struct gpu_dev *dev, uint32_t *out) {
    if (!dev || !out)        /* 1 defensive: reject NULL args first */
        return -EINVAL;      /*    -22, invalid argument */
    if (!dev->powered)
        return -ENODEV;      /* 2 -19, device unavailable */
    *out = dev->temp_milli_c; /* 3 write the result back via the pointer */
    return 0;                 /* 4 success */
}

/* Caller */
void caller(struct gpu_dev *dev) {
    uint32_t temp;
    int ret = gpu_read_temp(dev, &temp);   /* pass &temp so the callee can fill it */
    if (ret) { /* handle the error in ret */ return; }
    /* temp is valid only when ret == 0 */
}`,
            annotations: [
              'Checking pointers for NULL at the entry is the standard defensive style of kernel functions',
              'Different failure reasons return different -Exxx codes so the caller can distinguish them',
              'The result is written through *out — because the return value is already taken by the error code',
              'Convention: out is valid only when the return is 0; the caller must check the return before using the result',
            ],
            explanation: 'This "int error code + pointer output parameter" shape is everywhere in the kernel (amdgpu_device_init and the various amdgpu_*_get functions all look like this). It separates "success/failure" from "result data", making error handling uniform and composable (paired with goto cleanup — see the memory-lifetime lesson). Internalize this pattern and reading amdgpu source becomes much smoother.',
          },
          miniLab: {
            title: 'Pointers, array decay, and swap',
            objective: 'Verify *, &, array decay and the sizeof difference, and modify a caller\'s variable through a pointer',
            setup: 'mkdir -p ~/amd-labs/cc-c-3 && cd ~/amd-labs/cc-c-3',
            language: 'c',
            code: `#include <stdio.h>

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);                       /* pass addresses to modify caller's vars */
    printf("x=%d y=%d\\n", x, y);        /* x=2 y=1 */

    int a[4] = {10, 20, 30, 40};
    int *p = a;                          /* array decays to first-element pointer */
    printf("a[2]=%d *(a+2)=%d p[2]=%d\\n", a[2], *(a + 2), p[2]);
    printf("sizeof(a)=%zu sizeof(p)=%zu\\n", sizeof(a), sizeof(p));
    printf("(&a[2]-&a[0])=%ld\\n", &a[2] - &a[0]); /* 2, counted in elements */
    return 0;
}`,
            steps: [
              'Build/run: gcc -Wall -o lab lab.c && ./lab',
              'Confirm swap really changed x and y (because addresses were passed)',
              'Contrast sizeof(a)=16 with sizeof(p)=8 to grasp "an array is not a pointer"',
              'Change swap to take (int a, int b) by value and watch x, y stop changing — feel why pointers are needed',
            ],
            expectedOutput: `x=2 y=1
a[2]=30 *(a+2)=30 p[2]=30
sizeof(a)=16 sizeof(p)=8
(&a[2]-&a[0])=2`,
            hint: '"To modify a caller\'s variable, pass its address." swap takes &x, &y and modifies through *a, *b. Passing by value only changes a copy.',
          },
          debugExercise: {
            title: 'Find the bug in this pointer-returning function',
            description: 'This builds a name string and returns it, but the caller gets garbage.',
            buggyCode: `#include <stdio.h>
char *make_ring_name(int id) {
    char buf[32];
    snprintf(buf, sizeof(buf), "gfx_ring_%d", id);
    return buf;          /* returns the address of a local array */
}
int main() {
    char *name = make_ring_name(3);
    printf("%s\\n", name);  /* possibly garbage / crash */
}`,
            language: 'c',
            question: 'buf is a local array. Is that memory still valid after the function returns?',
            hint: 'Local variables live on the stack; the stack frame is reclaimed/reused after the function returns.',
            answer: 'buf is a local array on the stack; the moment the function returns, its stack frame is gone and the returned pointer becomes a dangling pointer, so later reads hit reused stack memory — garbage or a crash (classic use-after-return). Three fixes: (1) have the caller pass in a buffer: `void make_ring_name(int id, char *out, size_t n){ snprintf(out,n,...); }` (most common in the kernel); (2) allocate on the heap with clear ownership: `char *p = malloc(32); ...; return p;`, with the caller responsible for free; (3) use a static buffer (but it is not thread-safe — not recommended). The kernel almost always uses option (1): the caller supplies the buffer and the callee just fills it.',
          },
          interviewQ: {
            question: 'What is the difference between an array name and a pointer? Why do sizeof(array) and sizeof(pointer) differ?',
            difficulty: 'easy',
            hint: 'Start from "an array is a contiguous block of storage" vs "a pointer is a variable holding an address".',
            answer: 'An array is a contiguous region of storage; its name represents that whole block. A pointer is a separate variable holding some address. They are easy to confuse because an array name "decays" to a pointer to its first element in most expressions (so a[i] equals *(a+i)). But they are not the same: sizeof(arr) returns the entire array\'s byte size (element count × element size), because the complete array type is known at compile time; sizeof(ptr) is always one pointer\'s size (8 on a 64-bit platform), since a pointer just holds an address. Other differences: &arr has type "pointer to array", &ptr is "pointer to pointer"; an array name is not assignable (not a modifiable lvalue object), a pointer can be reassigned. Passing an array to a function as a pointer loses the length, which is why kernel interfaces always pass an extra count/size.',
            amdContext: 'In the kernel, fixed-size buffers (like ring->name[16]) are arrays, while function parameters receive decayed pointers plus a length. Confusing the two makes sizeof miscompute buffer sizes inside functions — a real security hazard.',
          },
        },
        {
          id: 'cc-c-4',
          number: '0.7.1.4',
          title: 'Arrays, Strings & Buffer Safety',
          titleEn: 'Arrays, Strings & Buffer Safety',
          duration: 16,
          tags: ['C', 'string', 'safety'],
          concept: {
            summary: 'A C string is just "a char array terminated by \\0", and the language does no bounds checking. All of buffer safety comes down to always leaving room for the terminator and never writing past the buffer\'s size.',
            explanation: [
              'C has no built-in string type. "hello" is actually 6 bytes: h e l l o \\0. strlen returns 5 (excluding \\0), but you need 6 bytes of storage. Countless off-by-one bugs come from forgetting to reserve one byte for \\0.',
              'strcpy/strcat do not know how big the destination is; they keep writing until the source\'s \\0 — if the source is longer than the destination they overflow, clobbering adjacent memory. This is the classic buffer-overflow vulnerability.',
              'strncpy looks safe but has two pitfalls: if the source length is >= n it does NOT write a terminator (the result is not a valid string); if the source is shorter it pads the rest with \\0. So the kernel uses strscpy instead: it guarantees termination and returns the copied length or -E2BIG.',
              'For producing strings, prefer snprintf/scnprintf: they take the buffer size, never overflow, and always write \\0. A sysfs show() callback formats output safely into a PAGE_SIZE buffer using sysfs_emit/scnprintf.',
              'Array-to-pointer decay has three exemptions: sizeof(arr) returns the whole array’s byte size (the foundation that makes the ARRAY_SIZE macro work); &arr yields a "pointer to the whole array" (type T(*)[N], striding by the entire array); and a string literal initializing char arr[] copies characters rather than assigning a pointer. Writing int arr[64] in a parameter list is pure commentary — the compiler treats it as int*, the 64 checks nothing, which is why kernel interfaces always travel as "pointer + length" pairs.',
              'Know the history of the string-copy baggage: strcpy is unbounded (a CVE factory); strncpy omits the terminator when the source is too long and zero-fills the rest (performance trap + silent truncation); strlcpy returns the source length, risking over-reads (deprecated in the kernel); strscpy is the serving standard answer. sprintf likewise yields to snprintf/scnprintf. Companion drills: c-01 (snprintf register dump), c-09 (implement strscpy yourself), c-10 (safely parsing hex input).',
            ],
            keyPoints: [
              'C string = char array ending in \\0; storage must reserve 1 extra byte for \\0',
              'strcpy/strcat do no bounds checking and are a common overflow source',
              'strncpy may not write a terminator; the kernel prefers strscpy (guaranteed termination + truncation info)',
              'Format output with snprintf/scnprintf (size-bounded, always terminated)',
              'Three non-decay sites: sizeof, &arr, literal initialization; an array length in a parameter list is a comment — safe interfaces = pointer + length + bounded copies',
            ],
          },
          diagram: {
            title: 'String memory layout and off-by-one',
            content: `  char buf[8] = "GPU";
   index:   0   1   2   3   4   5   6   7
         ┌───┬───┬───┬───┬───┬───┬───┬───┐
         │'G'│'P'│'U'│\\0 │ ? │ ? │ ? │ ? │
         └───┴───┴───┴───┴───┴───┴───┴───┘
          strlen=3        ↑ terminator takes 1 byte

  Dangerous: strcpy(buf, "12345678");  // source 8 chars + \\0 = 9 bytes
   index:   0 .. 7                          OUT OF BOUNDS!
         ┌───┬───┬───┬───┬───┬───┬───┬───┐ ┌───┐
         │'1'│'2'│'3'│'4'│'5'│'6'│'7'│'8'│ │\\0 │ ← written past buf
         └───┴───┴───┴───┴───┴───┴───┴───┘ └───┘
                                            corrupts adjacent memory

  Safe: snprintf(buf, sizeof(buf), "%s", src);  // at most 7 chars + \\0`,
            caption: 'The \\0 terminator must have somewhere to live. strcpy ignores destination size; snprintf guards the boundary with sizeof(buf) and always terminates.',
          },
          codeWalk: {
            title: 'sysfs show()-style safe formatting',
            file: 'illustrative: sysfs attribute output',
            language: 'c',
            code: `#include <stdio.h>
#include <string.h>

/* The kernel sysfs show callback convention: write text into a PAGE_SIZE(4096)
   buffer and return the number of bytes written. Here is a user-space
   equivalent demonstrating the same safe pattern. */
#define PAGE_SIZE 4096

int gpu_busy_show(char *buf, int busy_percent, const char *name) {
    /* snprintf returns the length it WOULD have written (excluding \\0),
       and never exceeds size, and always writes the terminator. */
    int len = snprintf(buf, PAGE_SIZE, "%s: %d%%\\n", name, busy_percent); /* 1 */
    if (len >= PAGE_SIZE)        /* 2 a return >= size means truncation happened */
        len = PAGE_SIZE - 1;     /*    scnprintf clamps this for you */
    return len;                  /* 3 return the byte count so the framework knows */
}

int main(void) {
    char page[PAGE_SIZE];
    int n = gpu_busy_show(page, 73, "gfx");
    printf("[%d bytes] %s", n, page);   /* gfx: 73% */
    return 0;
}`,
            annotations: [
              'snprintf\'s second argument is the total buffer size; it never overruns and always writes \\0',
              'snprintf returns the length it WOULD have written; >= size signals truncation',
              'The kernel\'s scnprintf/sysfs_emit auto-clamp the return to bytes actually written',
              'No bare strcpy anywhere — the size is always explicit and controlled',
            ],
            explanation: 'amdgpu exposes many sysfs nodes (gpu_busy_percent, mem_info_vram_total, …); their show() callbacks uniformly use sysfs_emit/scnprintf to write text into a PAGE_SIZE buffer. This "take a size, guarantee termination, return the length" interface is the kernel\'s everyday weapon against buffer overflows. Replacing strcpy with snprintf/strscpy is basic literacy for writing driver code.',
          },
          miniLab: {
            title: 'Reproduce an overflow, then fix it with safe functions',
            objective: 'See strcpy overflow (caught by ASan) and fix it with snprintf',
            setup: 'mkdir -p ~/amd-labs/cc-c-4 && cd ~/amd-labs/cc-c-4',
            language: 'c',
            code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char buf[8];

    /* Dangerous version (try it to feel the crash): source 9 bytes > buf[8] */
    /* strcpy(buf, "12345678"); */

    /* Safe version: snprintf bounds with sizeof and guarantees \\0 */
    int n = snprintf(buf, sizeof(buf), "%s", "12345678");
    printf("buf=\\"%s\\" len_in_buf=%zu would_be=%d\\n",
           buf, strlen(buf), n);   /* truncated to "1234567", n=8 = would-be length */
    return 0;
}`,
            steps: [
              'First build/run the safe version: gcc -Wall -o lab lab.c && ./lab, observe safe truncation to "1234567"',
              'Uncomment the strcpy line, build with gcc -fsanitize=address -g -o lab lab.c and run',
              'Watch AddressSanitizer report stack-buffer-overflow with the exact location',
              'Note snprintf\'s return of 8 tells you "8 chars would have been written" — i.e. truncation occurred, so you can error out',
            ],
            expectedOutput: `buf="1234567" len_in_buf=7 would_be=8
# With strcpy + ASan you instead see:
# ==ERROR: AddressSanitizer: stack-buffer-overflow ...`,
            hint: 'snprintf(dst, sizeof(dst), fmt, ...) is the safe default for producing strings: it never writes beyond sizeof(dst) and always \\0-terminates. A return >= sizeof(dst) means the content was truncated.',
          },
          debugExercise: {
            title: 'Find the hazard in this strncpy',
            description: 'This copies a ring name with strncpy; usually fine, but when the name exactly equals the buffer length, later printing reads out of bounds.',
            buggyCode: `#include <string.h>
#include <stdio.h>
struct ring { char name[8]; };
void set_name(struct ring *r, const char *src) {
    strncpy(r->name, src, sizeof(r->name));  /* looks length-limited */
}
int main() {
    struct ring r;
    set_name(&r, "gfx_ring");   /* exactly 8 chars */
    printf("%s\\n", r.name);     /* may print out-of-bounds garbage */
}`,
            language: 'c',
            question: '"gfx_ring" is 8 chars and sizeof(name) is 8. Does strncpy write a terminator here?',
            hint: 'When the source length is >= n, strncpy does not append \\0. So name has no terminator.',
            answer: 'When the source length is >= n, strncpy copies exactly n chars and does NOT write a terminator. "gfx_ring" is exactly 8 chars and fills name[8], so name has no \\0; printf("%s") then keeps reading until some accidental \\0, causing out-of-bounds reads/garbage. Fixes: (1) the kernel prefers strscpy(r->name, src, sizeof(r->name)), which guarantees termination and returns -E2BIG on truncation; (2) if you must use the standard library, set the last byte to 0 after the copy, i.e. r->name[sizeof(r->name)-1] = 0;, or just use snprintf. Lesson: strncpy\'s "n" does not guarantee a valid C string.',
          },
          interviewQ: {
            question: 'What is the difference between strcpy, strncpy and strscpy (or strlcpy)? Why does the kernel prefer strscpy?',
            difficulty: 'medium',
            hint: 'Compare on "does it check destination size" and "does it guarantee a terminator".',
            answer: 'strcpy ignores destination size entirely and copies up to the source\'s \\0; if the destination is too small it overflows — essentially banned. strncpy takes a length n but has awkward semantics: when source >= n it writes no terminator (producing an invalid string), and when source < n it pads the remainder with \\0 (wasteful and ambiguous). strscpy (kernel) / strlcpy (BSD) are the pragmatic compromise: copy at most n-1 chars and ALWAYS append \\0; strscpy additionally returns -E2BIG on truncation so the caller can detect and handle it. The kernel prefers strscpy precisely because it is "bounds-safe + always terminated + truncation-detectable", matching the kernel\'s robustness requirements. For formatting, use snprintf/scnprintf/sysfs_emit.',
            amdContext: 'amdgpu uses strscpy when naming rings, fences and IP blocks; sysfs output uses sysfs_emit. On string-safety questions, answering "strscpy guarantees termination and can report truncation" captures the key point.',
          },
        },
        {
          id: 'cc-c-5',
          number: '0.7.1.5',
          title: 'Structs, Unions, Bitfields & Alignment',
          titleEn: 'Structs, Unions, Bitfields & Alignment',
          duration: 18,
          tags: ['C', 'struct', 'alignment'],
          concept: {
            summary: 'A struct in memory is not a plain stacking of fields — the compiler inserts padding so each field meets its alignment requirement. Understanding alignment, padding, unions and bitfields is what lets you describe hardware data correctly.',
            explanation: [
              'Alignment: the CPU requires an N-byte type to sit at an address that is a multiple of N (u32 aligned to 4, u64 to 8). To satisfy this, the compiler inserts padding bytes between fields and at the end of the struct. So a struct\'s size is often larger than the sum of its fields, and field order significantly affects the total size.',
              'offsetof and sizeof: offsetof(type, member) gives a field\'s byte offset within the struct, sizeof(type) gives the total size including padding. These two macros are the standard tools for analyzing layout, and the foundation of container_of (Module 1).',
              'union: all members share the same memory, and the size equals the largest member. Commonly used for "multiple views of the same memory", e.g. accessing a u32 register as an integer and as a set of bitfields.',
              'Bitfields: you can declare "unsigned busy : 1;" so a field occupies only a few bits — handy for compact flag layouts; but a bitfield\'s memory layout (bit order, cross-byte packing) is implementation-defined and not portable for hardware registers. For hardware, the robust approach is masks + shifts (see cc-c-2).',
              'Alignment requirements come from hardware: on most architectures an N-byte scalar wants an address divisible by N; misaligned access is slow at best (split into two memory operations) and faulting at worst (some ARM). The compiler therefore inserts padding between members and rounds the struct size up to a multiple of the largest member alignment (so array elements stay aligned one by one). Practical corollary: ordering members by descending alignment usually minimizes space; the pahole tool visualizes hole distribution in kernel structs, and amdgpu’s performance-sensitive structs have all been audited this way.',
              'Two bit-field pits to memorize: allocation order (low bits first or high bits first) is implementation-defined — non-portable across compilers and endianness — which is why the kernel maps hardware registers with mask+shift (REG_GET_FIELD) rather than bit-fields; and you cannot take a bit-field member’s address. The legitimate use of union is "several interpretations of one memory block" (type punning is legal C, UB in C++), but crossing an ABI boundary still calls for memcpy. Companion drills: c-11 (little-endian serialization — the correct detour around padding and byte order), c-12 (float bit dissection), k-01 (container_of rides offsetof — this lesson’s direct extension).',
            ],
            keyPoints: [
              'Alignment requirements make the compiler insert padding; field order affects sizeof',
              'offsetof gives the offset, sizeof gives the padded total size',
              'A union lets members share memory; size = largest member',
              'Bitfields are compact but implementation-defined; map hardware registers with masks+shifts or __packed',
              'Sort members by descending alignment to minimize padding; bit-field order is implementation-defined — use mask+shift for ABI/register maps; pahole visualizes struct holes',
            ],
          },
          diagram: {
            title: 'padding: how field order changes struct size',
            content: `  struct bad { char a; int b; char c; };   // 12 bytes
   off:  0      1  2  3   4   5  6  7   8     9 10 11
        ┌───┐ ┌──padding─┐┌────int b────┐ ┌───┐┌─padding─┐
        │ a │ │ .  .  .  ││ b  b  b  b  │ │ c ││ .  .  . │
        └───┘ └──────────┘└─────────────┘ └───┘└─────────┘
        3 bytes after a to align b to 4; 3 at end for array stride

  struct good { int b; char a; char c; };  // 8 bytes (smaller after reorder)
   off:  0  1  2  3   4   5   6  7
        ┌────int b────┐ ┌───┐┌───┐┌─pad─┐
        │ b  b  b  b  │ │ a ││ c ││ . . │
        └─────────────┘ └───┘└───┘└─────┘

  union reg { uint32_t value; struct { unsigned busy:1, eng:4; } bits; };
   value and bits share the same 4 bytes: read it whole or per-bit`,
            caption: 'Placing larger fields first and grouping small fields together reduces padding. A union gives the same memory both an "integer" and a "bitfield" view.',
          },
          codeWalk: {
            title: 'Use a union to give a register an "integer + bitfield" dual view',
            file: 'illustrative: register union',
            language: 'c',
            code: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

/* Two views of a 32-bit status register: the whole value, or split into bits.
   Note: bitfield layout is implementation-defined, so this is for local
   demo/debugging only; for portable hardware mapping use masks+shifts. */
union grbm_status {
    uint32_t value;
    struct {
        uint32_t busy   : 1;   /* bit 0      */
        uint32_t engine : 4;   /* bit 1..4   */
        uint32_t rsvd   : 26;  /* filler      */
        uint32_t guilty : 1;   /* bit 31     */
    } bits;
};

int main(void) {
    union grbm_status s;
    s.value = 0x80000003;                 /* 1 write a whole register value */
    printf("busy=%u engine=%u guilty=%u\\n", /* 2 read it back via bitfields */
           s.bits.busy, s.bits.engine, s.bits.guilty);

    printf("sizeof(union)=%zu\\n", sizeof(s));            /* 3 = 4, the largest member */
    printf("offsetof(value)=%zu\\n", offsetof(union grbm_status, value));
    return 0;
}`,
            annotations: [
              'The union\'s value and bits occupy the same 4 bytes; writing value changes the bits view',
              'Bitfields make per-bit reads readable (handy when debugging), but their layout is not portable',
              'A union\'s size equals its largest member (here 4 bytes), not the sum of members',
              'offsetof/sizeof are the standard tools for analyzing any struct/union layout',
            ],
            explanation: 'In the kernel, unions are common for "multiple interpretations of the same memory" — dma_fence, various descriptors, register views. amdgpu\'s register headers provide a vast number of *__SHIFT/*_MASK macros taking the masks+shifts route (portable), while union+bitfield appears more in local data structures or debugging code. Knowing the boundary where each route applies is the key judgment for describing hardware data.',
          },
          miniLab: {
            title: 'Measure padding, then shrink a struct by reordering fields',
            objective: 'Quantify alignment and padding with sizeof/offsetof and verify how field order affects size',
            setup: 'mkdir -p ~/amd-labs/cc-c-5 && cd ~/amd-labs/cc-c-5',
            language: 'c',
            code: `#include <stdio.h>
#include <stddef.h>
#include <stdint.h>

struct bad  { char a; uint32_t b; char c; };          /* has padding */
struct good { uint32_t b; char a; char c; };           /* tighter after reorder */
struct packed_bad { char a; uint32_t b; char c; } __attribute__((packed));

#define SHOW(T, m) printf("  offsetof(%s,%s)=%zu\\n", #T, #m, offsetof(T, m))

int main(void) {
    printf("sizeof(bad)=%zu\\n", sizeof(struct bad));
    SHOW(struct bad, a); SHOW(struct bad, b); SHOW(struct bad, c);
    printf("sizeof(good)=%zu\\n", sizeof(struct good));
    printf("sizeof(packed_bad)=%zu\\n", sizeof(struct packed_bad));
    return 0;
}`,
            steps: [
              'Build/run: gcc -Wall -o lab lab.c && ./lab',
              'Observe sizeof(bad)=12 but sizeof(good)=8 — reordering alone saved 4 bytes',
              'Look at offsetof: bad.b is at offset 4 (3 padding bytes were inserted after a)',
              'Note __attribute__((packed)) shrinks bad to 6 bytes (no padding), at the cost of b becoming an unaligned access',
            ],
            expectedOutput: `sizeof(bad)=12
  offsetof(struct bad,a)=0
  offsetof(struct bad,b)=4
  offsetof(struct bad,c)=8
sizeof(good)=8
sizeof(packed_bad)=6`,
            hint: 'Put larger / more-strictly-aligned fields first and group small fields together to reduce padding. __packed removes padding but introduces unaligned access; use it only with care when describing hardware/wire formats.',
          },
          debugExercise: {
            title: 'Find why this "hardware header parse" reads the wrong fields',
            description: 'This overlays a struct onto a binary firmware header to read fields, but the size read out is completely wrong.',
            buggyCode: `#include <stdint.h>
/* The firmware header is packed in the file: 1 byte version + 4 bytes size */
struct fw_header {
    uint8_t  version;   /* offset 0 */
    uint32_t size;      /* expected offset 1, but actually? */
};
uint32_t read_size(const void *raw) {
    const struct fw_header *h = raw;   /* overlay the struct directly */
    return h->size;                    /* the value read is wrong */
}`,
            language: 'c',
            question: 'Will the compiler place size at offset 1? Does the struct\'s real layout match the packed layout in the file?',
            hint: 'uint32_t must align to 4. The compiler inserts padding after version so size lands at offset 4, not 1.',
            answer: 'They do not match. Because uint32_t needs 4-byte alignment, the compiler inserts 3 padding bytes after version (offset 0) and places size at offset 4; but the packed header in the file has version at 0 and size immediately at 1. So overlaying the struct reads from offset 4 and gets wrong data. Fixes: (1) add `__attribute__((packed))` to the struct so its layout matches the file (note: subsequent access to size is then unaligned, and some architectures need get_unaligned_le32 etc.); (2) more robustly, deserialize byte-by-byte explicitly: `size = raw[1] | raw[2]<<8 | raw[3]<<16 | raw[4]<<24;` (which also makes the byte order explicit). The kernel routinely uses __packed + explicit endianness helpers when parsing firmware/wire formats.',
          },
          interviewQ: {
            question: 'Why do structs have padding, and how do you reduce it? What are the risks of mapping hardware registers with bitfields?',
            difficulty: 'medium',
            hint: 'Explain padding from alignment requirements; explain the hardware-mapping risk from "bitfield layout is implementation-defined".',
            answer: 'Padding comes from alignment requirements: each type must sit at an address that is a multiple of its size, so the compiler inserts filler between fields and at the struct\'s end to satisfy alignment and keep array stride correct; hence sizeof is often larger than the sum of fields and depends on field order. To reduce padding: order fields from larger to smaller alignment and group small fields; if necessary use __packed to remove padding entirely (at the cost of unaligned access, which may be slower or even fault on some architectures). The risk of mapping hardware registers with bitfields is that the C standard does not specify bitfield bit order (high or low bits first), cross-storage-unit packing, or interaction with endianness — these are all implementation-defined, so the same definition may lay out differently across compilers/architectures. Therefore hardware registers are more robustly mapped with explicit masks + shifts (using *_MASK/*__SHIFT macros), reserving bitfields for local data structures or readability in controlled environments.',
            amdContext: 'amdgpu register access is almost entirely masks + shifts (the thousands of *_MASK/__SHIFT macros in the asic_reg headers), precisely to avoid bitfield portability issues; __packed is used for firmware headers, descriptors and similar cases that must match a hardware/file layout exactly.',
          },
        },
        {
          id: 'cc-c-6',
          number: '0.7.1.6',
          title: 'Stack, Heap & Memory Lifetime',
          titleEn: 'Stack, Heap & Memory Lifetime',
          duration: 18,
          tags: ['C', 'memory', 'lifetime'],
          concept: {
            summary: 'Automatic variables on the stack are born and destroyed with their scope; heap memory from malloc/free is managed explicitly by you. Who frees it, and when, is the "ownership" question — exactly the pain that C++ RAII later solves.',
            explanation: [
              'Automatic storage (stack): ordinary local variables in a function are created on scope entry and destroyed automatically on scope exit. No manual management, but their lifetime cannot outlive the function — returning their address gives a dangling pointer (see cc-c-3).',
              'Dynamic storage (heap): malloc requests a block whose lifetime you control, and must be paired with free. The three classic errors: memory leak (forgot to free), dangling/double free (use or free after free), and use-after-free.',
              'Ownership: every heap block should have a clear "who is responsible for freeing it". Interfaces must state in docs/naming whether the caller owns it or the callee owns it. Muddled ownership is the biggest source of memory bugs in C projects.',
              'The kernel has no libc malloc/free; it uses kmalloc/kzalloc/kfree (with GFP flags stating whether sleeping is allowed). Further, "device-managed" allocations like devm_kzalloc free automatically when the device unbinds — which is essentially the kernel\'s flavor of RAII.',
              'Read C code with "ownership" as a first-class concept: at any instant every heap block must have exactly one accountable owner (a function, a struct, or the caller), and API naming hints at transfers — memory returned by create/alloc belongs to the caller, add/register usually only borrows, destroy/free takes ownership back. Many rounds of kernel code review are, at bottom, arguments about "who owns this block right now". The classic realloc trap (p = realloc(p, n) leaking the old block on failure) is an ownership question too: on failure no transfer happened, so the previous owner remains on the hook.',
              'The three memory diseases and their instruments: leaks (missing free) — ASan/Valgrind in userspace, kmemleak in the kernel; use-after-free — KASAN catches it kernel-side; double free — NULLing right after free is the cheapest vaccine (free(NULL) is a legal no-op). A golden habit for driver work: shake data-structure logic out in userspace under -fsanitize=address before it ever enters the kernel. Companion drills: c-15 (realloc-backed dynamic array), c-16 (nested create/destroy), k-04 (kref refcounting), k-07 (goto ladder), k-11 (devres cleanup stack) — run in sequence they retell the evolution of kernel memory management.',
            ],
            keyPoints: [
              'Stack variables live and die with scope; never return their address',
              'Heap memory pairs malloc/free; leak / double-free / use-after-free are the three killers',
              'Every block must have a clear owner responsible for freeing it',
              'The kernel uses kmalloc/kzalloc/kfree + GFP flags; devm_* frees automatically',
              'One owner per heap block at any instant; a failed realloc leaves the old block valid; NULL the pointer after free — three disciplines stop most memory incidents',
            ],
          },
          diagram: {
            title: 'Stack vs heap, and the lifetime of one block',
            content: `   high addr ┌─────────────┐
            │   Stack     │  automatic vars, push/pop with calls
            │  ↓ grows down│  lifetime = scope
            │              │
            │     ...      │
            │  ↑ grows up  │
            │    Heap     │  malloc allocates, free releases
   low addr └─────────────┘  lifetime = explicitly yours

  The life (and three deaths) of one heap block:
    p = malloc(n);   // born; p owns it
        use(p);      // normal use
    free(p);         // normal death
    ───────────────────────────────────
    ✗ forgot free          → leak (memory only grows)
    ✗ free(p); *p = 1;     → use-after-free
    ✗ free(p); free(p);    → double free
    after fixing: free(p); p = NULL;  // defensive: null out to avoid misuse`,
            caption: 'Stack is automatic, heap is manual. Giving a clear answer to "who owns it, when is it freed" is the prerequisite for leak-free C.',
          },
          codeWalk: {
            title: 'The kernel\'s classic goto cleanup: rolling back a multi-step allocation',
            file: 'illustrative: goto error handling',
            language: 'c',
            code: `#include <stdlib.h>
#include <string.h>

struct ring { int *cmd_buf; char *name; };

/* Multi-step allocation: if any step fails, free what was already allocated
   in reverse order. The staircase of goto labels is the most common resource
   management style in the kernel. */
int ring_init(struct ring *r, int dw, const char *name) {
    r->cmd_buf = malloc(dw * sizeof(int));
    if (!r->cmd_buf)
        goto err;                 /* 1 failed on step one: nothing to free */

    r->name = malloc(strlen(name) + 1);
    if (!r->name)
        goto err_free_buf;        /* 2 this step failed: roll back cmd_buf */

    strcpy(r->name, name);
    return 0;                     /* 3 all succeeded */

err_free_buf:
    free(r->cmd_buf);             /* 4 free already-allocated resources in reverse */
    r->cmd_buf = NULL;
err:
    return -1;                    /* 5 return failure; caller knows the object is incomplete */
}`,
            annotations: [
              'Each failure point goes to a label that frees exactly the resources held so far, avoiding leaks',
              'Labels are ordered to free in the reverse order of allocation',
              'Only return 0 when everything succeeds; the failure paths leave no half-built object behind',
              'After freeing, set the pointer to NULL to avoid later misuse (a defensive habit)',
            ],
            explanation: 'Because C has no destructors, a multi-step init that fails midway must manually, reverse-order free the resources already allocated — hence the kernel\'s signature goto err_xxx staircase. It is everywhere in amdgpu\'s *_sw_init/*_hw_init functions. It works, but it is easy to get wrong (miss a level, wrong order). Remember the pain of this "manual reverse cleanup": the next group\'s C++ RAII eradicates it by doing the "automatic reverse destruction" for you.',
          },
          miniLab: {
            title: 'Catch leaks and use-after-free with AddressSanitizer',
            objective: 'Deliberately create and locate a memory leak and a use-after-free to build respect for lifetime',
            setup: 'mkdir -p ~/amd-labs/cc-c-6 && cd ~/amd-labs/cc-c-6',
            language: 'c',
            code: `#include <stdlib.h>
#include <stdio.h>

int main(void) {
    int *a = malloc(4 * sizeof(int));
    for (int i = 0; i < 4; i++) a[i] = i * i;
    printf("a[3]=%d\\n", a[3]);

    /* Experiment 1: comment out free(a) → LeakSanitizer reports a leak */
    free(a);

    /* Experiment 2: uncomment the two lines below → use-after-free / double free */
    /* a[0] = 99; */     /* use-after-free */
    /* free(a);    */     /* double free   */
    return 0;
}`,
            steps: [
              'Build/run normally: gcc -fsanitize=address -g -o lab lab.c && ./lab',
              'Comment out free(a), rebuild and run, and watch LeakSanitizer report "direct leak of 16 byte(s)" with the allocation stack',
              'Restore free(a), uncomment a[0]=99, and watch ASan report heap-use-after-free with the free location',
              'Also uncomment the second free(a) and watch ASan report double-free',
            ],
            expectedOutput: `a[3]=9
# After commenting out free:
# ==ERROR: LeakSanitizer: detected memory leaks
#   Direct leak of 16 byte(s) ...
# On use-after-free:
# ==ERROR: AddressSanitizer: heap-use-after-free ...`,
            hint: 'ASan/LSan (-fsanitize=address) are the go-to tools for locating C/C++ memory errors; they pinpoint the leak\'s allocation site and the use-after-free\'s free site. Make it a habit to decide, for every malloc, "who frees it and when".',
          },
          debugExercise: {
            title: 'Find the memory leak in this error path',
            description: 'This init function returns directly when step two fails, skipping the already-allocated resource.',
            buggyCode: `#include <stdlib.h>
struct ctx { int *a; int *b; };
int ctx_init(struct ctx *c, int n) {
    c->a = malloc(n * sizeof(int));
    if (!c->a) return -1;

    c->b = malloc(n * sizeof(int));
    if (!c->b) return -1;     /* returns directly — what about c->a? */

    return 0;
}`,
            language: 'c',
            question: 'When the second malloc fails, is the already-allocated c->a freed?',
            hint: 'On this failure path, think about whether anyone still remembers c->a or will ever free it.',
            answer: 'No. When c->b allocation fails and we return -1 directly, c->a was already allocated successfully but no one frees it, and the caller — having received an error — typically discards this half-built ctx, so c->a leaks. The fix is the goto reverse-cleanup pattern: `if (!c->b) goto err_free_a; ... return 0; err_free_a: free(c->a); c->a = NULL; return -1;`. This is exactly why the kernel\'s goto err pattern exists: it guarantees that every failure path rolls back precisely the resources already allocated.',
          },
          interviewQ: {
            question: 'Why does the kernel use goto so heavily for error handling? How does this relate to C lacking destructors?',
            difficulty: 'medium',
            hint: 'Contrast how "a multi-step allocation that fails midway" is cleaned up in languages with vs without destructors.',
            answer: 'Because C has no destructors and discourages duplicating cleanup code across many return points, the kernel uses a single goto err staircase to free already-allocated resources centrally and in reverse: each failure point jumps to a label that frees/unlocks/puts exactly what is held at that moment, level by level. This both avoids leaks and writes the cleanup once instead of at every return — readable and hard to get wrong. It is essentially emulating "reverse destruction at scope exit" by hand. That also explains why C++ RAII is so valuable: it hands this manual reverse cleanup to the compiler, done automatically in destructors and covering exception paths too, eliminating the "forgot to clean up" class of bugs at the root. Understanding the pain of C\'s goto cleanup is understanding the motivation for RAII.',
            amdContext: 'amdgpu\'s per-IP-block sw_init/hw_init and allocation paths almost all use goto err_xxx reverse cleanup. When reading these functions, follow the labels to see "what each level rolls back" and you quickly map out the resource ownership.',
          },
        },
        {
          id: 'cc-c-7',
          number: '0.7.1.7',
          title: 'Function Pointers, Callbacks & ops Structs',
          titleEn: 'Function Pointers, Callbacks & ops Structs',
          duration: 18,
          tags: ['C', 'function-pointer', 'ops'],
          concept: {
            summary: 'Function pointers let "functions" be stored, passed, and swapped like data. Packing a group of function pointers into an ops struct gives you polymorphism in classless C — and that is the skeleton of every Linux subsystem.',
            explanation: [
              'The essence of a function pointer: a function name decays in expressions to "the function\'s entry address", which a pointer variable can hold and then call through. The syntax `int (*fp)(int)` reads as "fp is a pointer to a function taking int and returning int"; a typedef usually improves readability.',
              'Callback: pass a function pointer as an argument to another function so it can "call you back" at the right moment. qsort\'s comparator, kernel interrupt handlers, and timer callbacks are all this pattern.',
              'ops struct = polymorphism in C: declare a family of operations (init/fini/read/write…) as a group of function-pointer fields; different "objects" fill in different implementations, and the caller dispatches only through the uniform ops interface. This is the hand-written version of the object-oriented "virtual function table".',
              'Null-check before calling: a function pointer in ops may be NULL (the object does not support that operation). The kernel convention is `if (ops->foo) ops->foo(...)`, which both supports "optional operations" and avoids crashing on a NULL call.',
              'Reading function-pointer declarations can be mechanized: start at the name, go right, then left — int (*submit)(void *ctx, int job) reads "submit is a pointer to a function taking (void*, int) and returning int". Untangling hairy signatures with typedef is kernel convention (typedef int (*handler_fn)(...)). As for call syntax, ops->submit(ctx, job) and (*ops->submit)(ctx, job) are fully equivalent — dereferencing a function pointer is optional, a fact that regularly puzzles first-time readers.',
              'Two engineering details. First, ops tables are almost always static const — const places the whole table in .rodata, unpatchable at runtime (hardening: function pointers are attackers’ favorite hijack target) and enables devirtualization. Second, "one ops table shared by a class of objects" (the amdgpu_ring_funcs pattern) beats "each object carrying its own function pointers" on memory and cache behavior — precisely the layout logic of C++ vtables: each object stores just one vptr aimed at a class-level shared table. Companion drills: c-13 (qsort comparator), c-14 (two-engine ops polymorphism), k-11 (fn+data closures), k-12 (the opcode dispatch capstone).',
            ],
            keyPoints: [
              'A function pointer holds a function\'s entry address; it can be stored/passed/swapped',
              'A callback = handing a function pointer to someone who calls it when appropriate',
              'An ops struct packs a group of function pointers, giving polymorphic dispatch in C',
              'Null-check before calling: if (ops->fn) ops->fn(...) — supports optional ops and avoids crashes',
              'Declaring ops tables static const moves them into the read-only section — hardening and an optimization hint at once; objects store a table pointer, not the table — exactly vtable layout',
            ],
          },
          diagram: {
            title: 'ops struct: one interface, many implementations',
            content: `  Uniform interface (a group of function pointers)
  struct ip_funcs {
      int (*sw_init)(void *);
      int (*hw_init)(void *);
      void (*fini)(void *);
  };

         fill in different impls → different "objects"
  ┌───────────────────┐     ┌────────────────────┐
  │ gfx_funcs         │     │ sdma_funcs         │
  │  .sw_init=gfx_sw  │     │  .sw_init=sdma_sw  │
  │  .hw_init=gfx_hw  │     │  .hw_init=sdma_hw  │
  │  .fini   =gfx_fini│     │  .fini   =sdma_fini│
  └───────────────────┘     └────────────────────┘
            ▲                         ▲
            └──── caller knows only the interface ────┘
   for (each block)
       if (block->funcs->hw_init)        // null-check
           block->funcs->hw_init(block);  // uniform dispatch, each runs its own impl`,
            caption: 'The caller depends only on the struct ip_funcs interface; concrete behavior is decided by the function pointers each object fills in — this is polymorphism in C.',
          },
          codeWalk: {
            title: 'amdgpu-style IP block dispatch (the C polymorphism prototype)',
            file: 'illustrative: IP block ops',
            language: 'c',
            code: `#include <stdio.h>

struct ip_block;
/* An interface of operations: each IP block provides its own implementation */
struct ip_funcs {
    const char *name;
    int  (*hw_init)(struct ip_block *);   /* 1 function-pointer field */
    void (*fini)(struct ip_block *);
};
struct ip_block { const struct ip_funcs *funcs; void *priv; };

/* GFX engine implementation */
static int gfx_hw_init(struct ip_block *b){ printf("GFX hw_init\\n"); return 0; }
static void gfx_fini(struct ip_block *b){ printf("GFX fini\\n"); }
static const struct ip_funcs gfx_funcs = {  /* 2 fill in concrete impls */
    .name = "gfx", .hw_init = gfx_hw_init, .fini = gfx_fini,
};
/* SDMA engine implementation (demo: fini unsupported, left NULL) */
static int sdma_hw_init(struct ip_block *b){ printf("SDMA hw_init\\n"); return 0; }
static const struct ip_funcs sdma_funcs = {
    .name = "sdma", .hw_init = sdma_hw_init, .fini = NULL, /* 3 optional op left empty */
};

int main(void) {
    struct ip_block blocks[] = { { &gfx_funcs }, { &sdma_funcs } };
    for (int i = 0; i < 2; i++) {                 /* 4 uniform dispatch */
        struct ip_block *b = &blocks[i];
        if (b->funcs->hw_init) b->funcs->hw_init(b);
        if (b->funcs->fini)    b->funcs->fini(b);  /* SDMA's fini is NULL, skipped */
    }
    return 0;
}`,
            annotations: [
              'Declaring function-pointer fields in a struct defines an "interface"',
              'Use designated initializers .hw_init=... to fill each object with its own implementation',
              'Leave unsupported operations as NULL to mean "optional / not provided"',
              'The caller iterates objects, null-checks, and dispatches uniformly — one loop drives many implementations',
            ],
            explanation: 'This is exactly the skeleton prototype of amdgpu initialization. In real code, struct amdgpu_ip_block_version holds a const struct amd_ip_funcs *funcs containing a long list of function pointers (.sw_init/.hw_init/.hw_fini/.suspend/.resume…); GFX, SDMA, DC, VCN, etc. each fill in their implementations, and functions like amdgpu_device_ip_init iterate, null-check and dispatch uniformly. Read this ~50-line prototype thoroughly and amdgpu\'s IP init will look very familiar. The next group shows C++ turning this hand-written mechanism into a native language feature with virtual functions.',
          },
          miniLab: {
            title: 'Build a mini polymorphic dispatcher with function pointers',
            objective: 'Hand-define an ops interface, fill in multiple implementations, dispatch with one uniform loop, and feel C polymorphism',
            setup: 'mkdir -p ~/amd-labs/cc-c-7 && cd ~/amd-labs/cc-c-7',
            language: 'c',
            code: `#include <stdio.h>

typedef struct shape { const struct shape_ops *ops; double a, b; } shape;
struct shape_ops { const char *name; double (*area)(const shape *); };

static double rect_area(const shape *s){ return s->a * s->b; }
static double tri_area (const shape *s){ return 0.5 * s->a * s->b; }

static const struct shape_ops RECT = { "rect", rect_area };
static const struct shape_ops TRI  = { "tri",  tri_area  };

int main(void) {
    shape shapes[] = { { &RECT, 3, 4 }, { &TRI, 6, 8 } };
    for (int i = 0; i < 2; i++) {
        const shape *s = &shapes[i];
        printf("%-4s area=%.1f\\n", s->ops->name, s->ops->area(s));
    }
    return 0;
}`,
            steps: [
              'Build/run: gcc -Wall -o lab lab.c && ./lab',
              'Confirm one loop called different area implementations for rect and tri (polymorphism)',
              'Add a circle shape: write circle_area + define a CIRCLE ops, add it to the array — no change to the dispatch loop',
              'Set one ops\'s area to NULL and add if (s->ops->area) before the call to feel "optional operations"',
            ],
            expectedOutput: `rect area=12.0
tri  area=24.0`,
            hint: 'The key to polymorphism: the caller depends only on the ops interface (struct shape_ops), not on whether it is a rect or a tri. Adding a new type only needs a new implementation plus a filled table; the dispatch loop never changes — that is "open for extension".',
          },
          debugExercise: {
            title: 'Find why this dispatch segfaults',
            description: 'This iterates IP blocks calling hw_init, but the program crashes on the second block.',
            buggyCode: `struct ip_funcs { int (*hw_init)(void); };
struct ip_block { const struct ip_funcs *funcs; };

static int gfx_init(void){ return 0; }
static const struct ip_funcs gfx = { gfx_init };
static const struct ip_funcs sdma = { 0 };   /* hw_init not filled, it is NULL */

void init_all(struct ip_block *blocks, int n) {
    for (int i = 0; i < n; i++)
        blocks[i].funcs->hw_init();   /* call directly, no null-check */
}`,
            language: 'c',
            question: 'sdma\'s hw_init is NULL. What happens when you call blocks[i].funcs->hw_init() directly?',
            hint: 'Calling a NULL function pointer jumps to address 0.',
            answer: 'The second block (sdma) has hw_init == NULL, so blocks[i].funcs->hw_init() calls the "function" at address 0, triggering a segfault (in the kernel, a NULL-pointer-dereference oops). The fix follows the kernel convention of null-checking before calling: `if (blocks[i].funcs->hw_init) blocks[i].funcs->hw_init();`. A NULL function pointer in an ops struct is legal and common — it means the object does not provide that optional operation, and the caller is responsible for checking before calling.',
          },
          interviewQ: {
            question: 'C has no classes or virtual functions — how do you achieve polymorphism? Explain with the kernel\'s ops struct, and discuss its relationship to C++ virtual functions.',
            difficulty: 'medium',
            hint: 'Start from "a group of function pointers = a hand-written vtable", and contrast with the C++ vtable.',
            answer: 'C achieves polymorphism with "function pointers + ops structs": declare a family of operations as function-pointer fields (struct xxx_ops), have each object fill in different implementations in its own instance, and let a pointer (often obj->ops) point at the matching ops table; the caller dispatches uniformly via obj->ops->method(obj), and which implementation runs depends on which table the object points to. This is essentially a hand-written virtual function table (vtable): C++ virtual functions have the compiler automatically generate a vtable per class with virtual functions, place a hidden vptr at the object\'s head pointing to it, and route obj->method() through the vptr — a one-to-one correspondence with the hand-written C ops, the only difference being that C++ automates building the table, filling it, and the indirect call, and adds type checking and inheritance support. The kernel chooses hand-written ops for precise control over ABI, memory layout, and zero hidden overhead. Once you understand the ops struct, C++ virtual functions are "the same idea built into the language".',
            amdContext: 'amdgpu\'s amd_ip_funcs, ttm_resource_manager_func, dma_fence_ops, drm_driver are all ops-struct polymorphism. A common interview ask is to contrast C ops with C++ virtual functions — answering "ops is a hand-written vtable, virtual is the compiler-automated vtable" hits the mark.',
          },
        },
      ],
    },
    {
      id: 'cc-cpp',
      number: '0.7.2',
      title: 'C++ Training',
      titleEn: 'C++ Training',
      icon: 'Puzzle',
      description: 'Building on the C foundation, learn the systems/driver-relevant core of C++ step by step: references & overloading, classes & RAII, copy/move, inheritance & virtual functions, templates, the STL & smart pointers. The focus is exactly the parts that show up in the Mesa, ROCm/HIP and LLVM C++ codebases.',
      lessons: [
        {
          id: 'cc-cpp-1',
          number: '0.7.2.1',
          title: 'From C to C++: References, Overloading & Namespaces',
          titleEn: 'From C to C++: References, Overloading & Namespaces',
          duration: 16,
          tags: ['C++', 'reference', 'overload'],
          concept: {
            summary: 'C++ adds a "safer, more expressive" layer on top of C. Master references, function overloading, namespaces, and bool/nullptr/auto first, and you can read the most basic C++ code in Mesa, ROCm/HIP and LLVM.',
            explanation: [
              'A reference is "an alias for a variable": after int &r = x; r IS x, and operations on r act directly on x. It must be bound at definition and cannot be re-bound. Compared with pointers, references are cleaner syntactically, are not NULL (in normal use), and need no dereference operator — commonly used for parameters to avoid copies: void scale(Vec &v, float s).',
              'Function overloading: same-named functions may have different parameter lists, and the compiler picks the matching version by argument types. C does not support this (the linker only knows the function name); C++ encodes parameter types into the symbol name ("name mangling"), so print(int) and print(double) are two distinct symbols.',
              'Namespaces group names to avoid symbol clashes in large projects: amd::compute::launch and mesa::launch do not interfere. Access with :: or bring in with using. They replace C\'s manual "prefix every function with a module name" (like amdgpu_xxx).',
              'Other direct C→C++ upgrades: the bool type with true/false; nullptr replacing NULL (more type-safe); auto letting the compiler deduce types (especially handy for iterators and template return types); new/delete replacing malloc/free (and, crucially, calling constructors/destructors — see the next lesson).',
              'A reference is essentially "an alias that cannot rebind after initialization": no null references, no reference arithmetic, no retargeting — those three impossibilities are the entire source of its safety edge over pointers. const T& holds one extra privilege: it binds to temporaries and extends their lifetime to the end of the reference’s scope (which is why a const std::string& parameter accepts a string literal directly). Rule of thumb: nullable or retargetable means pointer; everything else takes a reference.',
              'extern "C" deserves the full story: to support overloading, C++ encodes parameter types into symbol names (name mangling — clamp_val(int,int,int) becomes _Z9clamp_valiii), while C symbols are bare names. extern "C" switches mangling off so C++ code links against C libraries and C code calls C++-implemented interfaces. The whole userspace GPU stack is stitched with it: libdrm exposes C interfaces, Mesa is C++ inside, and the seams are all extern "C". Companion drill: cpp-01 (overloads and reference swap).',
            ],
            keyPoints: [
              'A reference is an alias: must be initialized, cannot rebind, no dereference needed, normally non-NULL',
              'Overloading works via name mangling; C does not allow same-named functions',
              'Namespaces group names, replacing C\'s manual prefixes and avoiding clashes',
              'bool/true/false, nullptr, auto, new/delete are common C→C++ upgrades',
              'Reference = a non-null alias that never rebinds; const& extends temporary lifetimes; extern "C" turns off name mangling — the seam of every C/C++ boundary',
            ],
          },
          diagram: {
            title: 'Reference vs pointer, and overloading\'s name mangling',
            content: `  pointer vs reference
    int x = 10;
    int *p = &x;     int &r = x;   // r is an alias for x
    *p = 20;         r = 20;       // both set x to 20
    p  can re-point   r  cannot rebind once bound
    p  may be nullptr r  normally non-null, must be initialized

  overloading → name mangling (illustrative)
    void print(int);      → symbol _Z5printi
    void print(double);   → symbol _Z5printd
    void print(const char*)→ symbol _Z5printPKc
    compiler picks by argument type; linker distinguishes by mangled symbol

  namespace
    namespace amd { namespace compute { void launch(); } }
    amd::compute::launch();   // qualified call, avoids clashing with another launch`,
            caption: 'A reference is an alias that "cannot rebind, needs no dereference, is normally non-null"; overloading works by encoding parameter types into symbol names; namespaces replace manual prefixes.',
          },
          codeWalk: {
            title: 'A minimal example of reference parameters, overloading and namespaces',
            file: 'illustrative: C++ basics',
            language: 'cpp',
            code: `#include <cstdio>

namespace gpu {                       /* 1 namespace grouping */
    struct Vec3 { float x, y, z; };

    /* reference parameter: modifies the caller's object directly, no copy, no pointer syntax */
    void scale(Vec3 &v, float s) {    /* 2 Vec3& is an alias */
        v.x *= s; v.y *= s; v.z *= s;
    }

    /* function overloading: same name, different parameters */
    void print(int n)        { printf("int %d\\n", n); }       /* 3 */
    void print(const Vec3 &v){ printf("vec %.1f %.1f %.1f\\n", v.x, v.y, v.z); }
}

int main() {
    gpu::Vec3 v{1, 2, 3};             /* 4 :: to access namespace members */
    gpu::scale(v, 2.0f);              /*    v is modified in place, no &v needed */
    gpu::print(42);                   /*    picks print(int) */
    gpu::print(v);                    /*    picks print(const Vec3&) */
    auto *p = &v;                     /* 5 auto deduces gpu::Vec3* */
    if (p != nullptr) gpu::print(*p);
    return 0;
}`,
            annotations: [
              'namespace groups Vec3/scale/print under gpu to avoid clashing with other libraries',
              'The Vec3& reference parameter: changes to v inside the function are reflected in the caller, cleaner than pointers',
              'The two print functions are distinguished by argument type, chosen by the compiler at the call site',
              'Initialize with {} and access namespace members with ::',
              'auto deduces the type; nullptr is the type-safe null-pointer literal',
            ],
            explanation: 'Mesa, the ROCm/HIP runtime, and LLVM are all C++ codebases where reference parameters, overloading and namespaces appear everywhere — e.g. the HIP API passes configuration objects by reference, and LLVM wraps everything in namespace llvm. Internalize these "things C lacks but you use daily" and reading that code stops tripping you up on syntax. Note that AMD\'s kernel-side driver (amdgpu) is still pure C — C++ appears mainly in userspace and the compiler stack.',
          },
          miniLab: {
            title: 'See through name mangling with c++filt',
            objective: 'Verify in-place modification via references, overload selection, and use c++filt to recover mangled symbol names',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-1 && cd ~/amd-labs/cc-cpp-1',
            language: 'cpp',
            code: `// lab.cpp
#include <cstdio>
void tweak(int &a) { a += 100; }       // reference parameter
int sq(int x)    { return x * x; }      // overload 1
double sq(double x){ return x * x; }    // overload 2

int main() {
    int v = 1; tweak(v);
    printf("v=%d sq(3)=%d sq(2.5)=%.2f\\n", v, sq(3), sq(2.5));
    return 0;
}`,
            steps: [
              'Build/run: g++ -Wall -o lab lab.cpp && ./lab, confirm v becomes 101 via tweak',
              'View the two distinct overload symbols: nm lab | grep sq',
              'Demangle them: nm lab | grep sq | c++filt (shows sq(int) and sq(double))',
              'Change tweak\'s parameter from int& to int (by value), rerun, and watch v stop changing',
            ],
            expectedOutput: `v=101 sq(3)=9 sq(2.5)=6.25
# After c++filt demangling you see:
#   sq(int)
#   sq(double)`,
            hint: 'A reference parameter = passing an alias, so changes inside the function are visible to the caller (equivalent to a pointer but with cleaner syntax). Overloading is possible because the compiler encodes parameter types into symbol names (mangling); c++filt decodes them back to human-readable form.',
          },
          debugExercise: {
            title: 'Find why this "should-be-modified" parameter does not change',
            description: 'This tries to increment a counter through a function, but after the call the counter is unchanged.',
            buggyCode: `#include <cstdio>
void inc(int n) {     // note the parameter type
    n = n + 1;
}
int main() {
    int count = 41;
    inc(count);
    printf("%d\\n", count);   // expected 42, still 41
}`,
            language: 'cpp',
            question: 'Is inc\'s parameter int (by value) or int& (reference)? Which one does the function modify?',
            hint: 'Pass-by-value only modifies a copy of the argument, which is gone after the function returns.',
            answer: 'The parameter int n is by value, so inc modifies a copy of count; after the function returns the copy is destroyed and count itself is unchanged, still 41. The fix is to declare the parameter as a reference: void inc(int &n) { n = n + 1; }, so n is an alias for count and the modification acts on the caller\'s variable. This is exactly C++ references\' convenience over C pointers — same semantics as passing a pointer, but no & at the call site and no * inside. If you do not want to modify and only want to avoid copying a large object, use a const reference: void f(const Big &b).',
          },
          interviewQ: {
            question: 'What is the difference between a reference and a pointer? Why can C++ overload functions while C cannot?',
            difficulty: 'easy',
            hint: 'Start references from "alias, cannot rebind, non-null"; start overloading from name mangling.',
            answer: 'A reference is an alias for an existing object: it must be bound at definition, cannot be rebound to another object afterward, is normally non-null, and needs no dereference operator. A pointer is a separate variable holding an address, may be nullptr, can be repointed, requires * to dereference, and itself occupies memory. Semantically a reference "is that object", commonly used for parameter passing (avoiding copies) and returning aliases; a pointer is more flexible (nullable, re-pointable, supports pointer arithmetic). C++ supports overloading because it performs name mangling: it encodes parameter types into the symbol name, so print(int) and print(double) generate distinct symbols the linker can tell apart; C\'s symbol name is just the function name, so same-named functions clash and overloading is unsupported. Note: because mangling rules differ, calling C functions from C++ or exposing a C interface needs extern "C" to disable mangling.',
            amdContext: 'The HIP/ROCm runtime and Mesa use reference parameters and overloading heavily; the boundary with kernel-side C code (amdgpu) commonly uses extern "C". Understanding references and overloading is the entry threshold for reading the userspace GPU stack.',
          },
        },
        {
          id: 'cc-cpp-2',
          number: '0.7.2.2',
          title: 'Classes, Constructors/Destructors & RAII',
          titleEn: 'Classes, Constructors/Destructors & RAII',
          duration: 18,
          tags: ['C++', 'class', 'RAII'],
          concept: {
            summary: 'A class binds data and operations together; the constructor initializes an object at birth and the destructor cleans up at death. Putting "acquire resource in the constructor, release in the destructor" is RAII — C++\'s core idea for resource management.',
            explanation: [
              'A class (class/struct) = data members + member functions + access control (private/public). Member functions implicitly carry a this pointer to the current object. class defaults to private, struct to public; otherwise they are equivalent.',
              'A constructor is called automatically when an object is created and puts the object into a valid state (often using a member initializer list : a_(x), b_(y) to initialize members directly); a destructor ~T() is called automatically when the object is destroyed and releases the resources it holds. Neither is called manually.',
              'RAII (Resource Acquisition Is Initialization): let the object\'s construction acquire a resource (memory, lock, file, GPU buffer) and its destruction release it. Because a stack object is guaranteed to be destroyed when it leaves scope (normal return, break, even an exception), resource release is guaranteed by the language — never forgotten, and in reverse order automatically.',
              'Contrast with C\'s goto cleanup (cc-c-6): RAII hands that "manual reverse release" to the compiler. Even with ten early returns in a function, each stack object\'s destructor still fires correctly, eliminating "forgot to clean up / missed a level" bugs at the root.',
              'Burn the ordering rules into reflex: members construct in declaration order (not initializer-list order — GCC warns with -Wreorder when the two disagree) and destruct in strict reverse; base classes construct before members and destruct after them. The rule dictates that inter-member dependencies may only point backwards. Local objects construct in definition order and destruct in reverse at scope exit.',
              'RAII and exception safety are joined at the hip: during stack unwinding destructors run automatically — the bedrock that lets RAII hold resources; but if a destructor itself throws while another exception is in flight, the program goes straight to std::terminate — hence destructors default to noexcept, and cleanup code must be infallible or swallow-and-log. The userspace GPU stack (Mesa/ROCm) mostly builds with exceptions off, yet RAII loses none of its value: early returns and error paths trigger destructors all the same. Companion drills: cpp-02 (ctor/dtor order tracing), cpp-03 (the three-path RegionGuard balance).',
            ],
            keyPoints: [
              'class = data + methods + access control; member functions carry an implicit this',
              'Constructors initialize objects (prefer member initializer lists); destructors release resources',
              'RAII: acquire in the constructor, release in the destructor, bound to object lifetime',
              'A stack object leaving scope is always destroyed → release is language-guaranteed, replacing goto cleanup',
              'Members construct in declaration order and destruct in reverse (initializer-list order is irrelevant); destructors are noexcept by default — cleanup is not allowed to fail',
            ],
          },
          diagram: {
            title: 'RAII: resource release bound to scope',
            content: `  C manual cleanup            C++ RAII (automatic)
  ───────────────            ──────────────────
  p = malloc(n);             {
  if (!p) goto err;            Buffer b(n);   // ctor: allocate
  lock(&m);                    Lock g(m);     // ctor: lock
  if (x) goto unlock;          if (x) return; // ← early return is also safe
  ...                          ...
  unlock: unlock(&m);          }  // scope ends: ~g first (unlock),
  err:    free(p);                //             ~b after (free), reverse, auto

  object lifetime and destruction timing:
    enter scope → construct (acquire)
         ┌─────────────── use ───────────────┐
    leave scope (return/break/exception) → destruct (release)  ← always happens`,
            caption: 'RAII hangs resource release on object destruction; as long as the object is on the stack, destruction is guaranteed when it leaves scope, in the reverse order of construction.',
          },
          codeWalk: {
            title: 'An RAII buffer wrapper',
            file: 'illustrative: RAII Buffer',
            language: 'cpp',
            code: `#include <cstdio>
#include <cstdlib>

class Buffer {
public:
    explicit Buffer(size_t n)            /* 1 ctor: acquire resource */
        : size_(n), data_(static_cast<int*>(std::malloc(n * sizeof(int)))) {
        printf("  acquire %zu ints\\n", n);
    }
    ~Buffer() {                          /* 2 dtor: release (called automatically) */
        std::free(data_);
        printf("  release\\n");
    }
    int &operator[](size_t i) { return data_[i]; }  /* 3 use it like an array */
    size_t size() const { return size_; }
private:
    size_t size_;
    int *data_;
};

void use_gpu_cmd() {
    Buffer b(4);                         /* 4 enter: construct */
    for (size_t i = 0; i < b.size(); i++) b[i] = (int)i;
    printf("  b[3]=%d\\n", b[3]);
    if (b[3] == 3) return;               /* 5 early return: b is still destroyed */
}                                        /*   leaving scope: ~Buffer() runs automatically */

int main() { puts("enter"); use_gpu_cmd(); puts("left"); return 0; }`,
            annotations: [
              'The constructor acquires a resource (here malloc a buffer) and sets members via a member initializer list',
              'The destructor releases the resource; the compiler calls it automatically on destruction, no manual call',
              'Overloading operator[] lets the object be used like a native array',
              'Use a stack object Buffer b(4) in the function: entering constructs it',
              'Even with an early return, ~Buffer() is still called when scope ends — that is RAII\'s guarantee',
            ],
            explanation: 'Watch the output order: acquire prints on function entry, release prints on return — even when that return is an early one. That is RAII: you no longer need C\'s goto unlock/err staircase; resource release is done automatically and in reverse by object destruction. Mesa, HIP and LLVM manage GPU buffers, locks and file handles with such RAII wrappers; the standard library\'s std::lock_guard and std::unique_ptr (coming later) are also concrete RAII implementations.',
          },
          miniLab: {
            title: 'Prove destruction always happens (even on early return / exception)',
            objective: 'By printing construction/destruction timing, confirm RAII\'s guarantee of resource release',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-2 && cd ~/amd-labs/cc-cpp-2',
            language: 'cpp',
            code: `#include <cstdio>
#include <stdexcept>

struct Guard {
    const char *tag;
    explicit Guard(const char *t) : tag(t) { printf("  + %s\\n", tag); }
    ~Guard() { printf("  - %s\\n", tag); }
};

void demo(bool early, bool throw_it) {
    Guard a("A");
    Guard b("B");                 // construction order A, B
    if (early) return;            // observe whether destruction still happens
    if (throw_it) throw std::runtime_error("boom");
    printf("  ...body...\\n");
}                                 // destruction reverse order B, A

int main() {
    puts("normal:");   demo(false, false);
    puts("early ret:");demo(true,  false);
    puts("exception:");try { demo(false, true); } catch (...) { puts("  caught"); }
    return 0;
}`,
            steps: [
              'Build/run: g++ -Wall -fexceptions -o lab lab.cpp && ./lab',
              'Observe that in every case the destructors (-B, -A) run, always in reverse of construction',
              'Note the "early ret" path: the body did not run, but A and B are still destroyed',
              'Note the "exception" path: stack unwinding on throw also triggers destruction (exception safety)',
            ],
            expectedOutput: `normal:
  + A
  + B
  ...body...
  - B
  - A
early ret:
  + A
  + B
  - B
  - A
exception:
  + A
  + B
  - B
  - A
  caught`,
            hint: 'Construction in declaration order, destruction in reverse. However a function leaves (normal end, early return, thrown exception), stack objects\' destructors fire — that is the root of why RAII manages resources reliably and provides exception safety.',
          },
          debugExercise: {
            title: 'Find why this class leaks memory',
            description: 'This class allocates in its constructor, but ASan reports a leak after running.',
            buggyCode: `#include <cstdlib>
class Ring {
public:
    explicit Ring(size_t n) {
        buf_ = (int*)std::malloc(n * sizeof(int));   // allocate in ctor
    }
    // no destructor written
private:
    int *buf_;
};
void f() {
    Ring r(1024);   // when scope ends... who frees buf_?
}`,
            language: 'cpp',
            question: 'Does this class free buf_ on destruction? Does the default destructor free your malloc\'d memory?',
            hint: 'The compiler-generated default destructor only destroys members themselves; it does not free memory you malloc\'d.',
            answer: 'It leaks. Ring malloc\'d buf_ in its constructor but defines no destructor; the compiler-generated default destructor only destroys member variables (here buf_ is just a pointer, and destroying a pointer does not free what it points to). So when r leaves scope the 1024 ints pointed to by buf_ are never freed. Fix: provide a destructor ~Ring() { std::free(buf_); } so RAII takes effect. The more modern approach is to avoid raw pointers entirely — use std::vector<int> or std::unique_ptr<int[]> as the member; they carry their own RAII and you do not even write a destructor (see the STL & smart pointers lesson). This also raises the next lesson\'s question: once a class holds a raw resource, what happens when you copy it?',
          },
          interviewQ: {
            question: 'What is RAII? How does it replace C\'s goto cleanup, and why is it crucial for exception safety?',
            difficulty: 'medium',
            hint: 'Make "resource release bound to object destruction" and "stack unwinding always triggers destruction" crystal clear.',
            answer: 'RAII (Resource Acquisition Is Initialization) is C++\'s resource-management paradigm: write resource acquisition in the constructor and release in the destructor, binding the resource\'s lifetime to the object\'s. Because a stack object is always destroyed when it leaves scope, in reverse order of construction, resource release is guaranteed by the language — no need to hand-write goto cleanup at every failure/return point; even with multiple early returns, every stack object is destroyed correctly. It is even more crucial for exception safety: when an exception is thrown, "stack unwinding" occurs and all already-constructed stack objects along the way are destroyed, so locks, memory and files held via RAII are released automatically and do not leak because an exception skipped hand-written cleanup. The standard library\'s lock_guard, unique_ptr and vector all embody RAII. In one sentence: RAII uses the guarantee that "destruction always happens" to turn resource management from "the programmer remembers to clean up" into "the compiler cleans up automatically".',
            amdContext: 'Although the amdgpu kernel driver is C (relying on goto cleanup), the userspace GPU stack (Mesa, HIP, the ROCm runtime, LLVM) is C++, where wrapping GPU buffers, command streams and locks in RAII is the everyday style. Understanding RAII is essential to reading their resource management, and conversely deepens your understanding of why the kernel uses goto.',
          },
        },
        {
          id: 'cc-cpp-3',
          number: '0.7.2.3',
          title: 'Copy, Move & Resource Management',
          titleEn: 'Copy, Move & Resource Management',
          duration: 19,
          tags: ['C++', 'move', 'copy'],
          concept: {
            summary: 'Once a class holds a raw resource, copying it can leave two objects pointing at the same memory and double-freeing on destruction. Understanding copy/move semantics and the Rule of Three/Five is the key to managing resources safely.',
            explanation: [
              'Default copy is a "shallow copy": the compiler-generated copy constructor / copy assignment copies members one by one. For a class holding a raw pointer, that means both objects\' pointers point at the same heap block — when one is destroyed and frees it, the other becomes a dangling pointer, and the second destruction is a double free.',
              'Rule of Three: if you need a custom destructor (because the class manages a resource), you usually also need a custom copy constructor and copy assignment (doing a "deep copy": each allocates and owns its own). Either define all three or use the compiler defaults for all.',
              'Move semantics: often we do not want to "copy a resource", only to "transfer ownership" from one object to another (e.g. returning a large object from a function, putting an object into a container). The move constructor / move assignment takes an rvalue reference T&& and "steals" the source\'s pointer, then nulls the source — an O(1) ownership transfer.',
              'std::move merely "marks an object as movable" (casts it to an rvalue reference); the actual transfer is done by the move constructor/assignment. Rule of Five: a resource-managing class typically considers destructor + copy ctor + copy assignment + move ctor + move assignment. In practice the better advice: use members like vector/unique_ptr that already implement all of these, so you write none.',
              'The generation rules for special members are this lesson’s crux: declare any of destructor/copy ctor/copy assignment and the compiler stops generating moves (falling back to memberwise copies); declare a move and the copies are implicitly deleted. Hence the modern doctrine of two extremes: write none (Rule of Zero — let vector/unique_ptr members do the work) or write all five (Rule of Five). The middle state — "just a destructor" — is a performance trap: the class silently loses movability and every push_back becomes a deep copy.',
              'The standard contract for a moved-from object is "valid but unspecified": it must still destruct and accept new values safely, but promises no particular contents — so nulling the source pointer in a move constructor is duty, not choice (the source’s destructor will still run). Restating the commercial value of noexcept: vector growth falls back to copying whenever moves might throw (strong exception safety), so a missing noexcept silently forfeits every move win — insure with static_assert(std::is_nothrow_move_constructible_v<T>). Companion drills: cpp-04 (Rule of Three deep copy), cpp-05 (move semantics), cpp-06 (hand-rolled UniquePtr).',
            ],
            keyPoints: [
              'Default copy is shallow; a class holding a raw pointer shallow-copies into a double free',
              'Rule of Three: if you write a destructor you usually also need copy ctor + copy assignment (deep copy)',
              'Move semantics transfer ownership (steal the pointer + null the source), O(1) not a copy',
              'std::move only casts to an rvalue reference; prefer vector/unique_ptr to avoid writing these',
              'A declared destructor suppresses move generation — Rule of Zero or Rule of Five, never the middle; a moved-from object must remain safely destructible',
            ],
          },
          diagram: {
            title: 'Shallow-copy disaster vs move transferring ownership',
            content: `  shallow copy (default) — dangerous
    Buffer a(n);        a.data ─┐
    Buffer b = a;       b.data ─┴─► [same heap block]
    // a and b's data point at the same place
    // scope ends: ~b frees once, ~a frees again → double free!

  deep copy (Rule of Three) — safe but with copy cost
    Buffer b = a;       a.data ─► [block 1]
                        b.data ─► [block 2 copied from block 1]

  move (transfer ownership) — safe and efficient O(1)
    Buffer b = std::move(a);
        before:  a.data ─► [block]      b.data = ?
        after:   a.data = nullptr       b.data ─► [block]
        // "steal" the pointer to b and null a; ~a destructing null is harmless`,
            caption: 'Shallow copy makes two objects share and race to free the same block. Deep copy duplicates a block each; move transfers ownership wholesale and nulls the source.',
          },
          codeWalk: {
            title: 'Implement copy and move for a resource-holding class',
            file: 'illustrative: Rule of Five',
            language: 'cpp',
            code: `#include <cstdio>
#include <cstring>
#include <utility>   // std::move

class Buffer {
public:
    explicit Buffer(size_t n) : n_(n), p_(new int[n]) {}
    ~Buffer() { delete[] p_; }                       /* 1 dtor releases */

    Buffer(const Buffer &o) : n_(o.n_), p_(new int[o.n_]) {   /* 2 deep copy */
        std::memcpy(p_, o.p_, n_ * sizeof(int));
        puts("copy");
    }
    Buffer(Buffer &&o) noexcept : n_(o.n_), p_(o.p_) {        /* 3 move: steal pointer */
        o.p_ = nullptr; o.n_ = 0;                             /*    null the source */
        puts("move");
    }
    Buffer &operator=(Buffer o) {       /* 4 copy-and-swap: copy/move assignment in one */
        std::swap(n_, o.n_); std::swap(p_, o.p_);
        return *this;
    }
    size_t size() const { return n_; }
private:
    size_t n_; int *p_;
};

int main() {
    Buffer a(4);
    Buffer b = a;             /* 5 calls copy ctor → "copy" */
    Buffer c = std::move(a);  /* 6 calls move ctor → "move", a is emptied */
    printf("b=%zu c=%zu a=%zu\\n", b.size(), c.size(), a.size());
    return 0;
}`,
            annotations: [
              'A destructor delete[]s the array — once you have one, consider copy/move (Rule of Three/Five)',
              'The copy constructor deep-copies: new its own block, memcpy the contents, so the two objects are independent',
              'The move constructor steals the source\'s pointer, then sets the source to nullptr — O(1), and the source destructs harmlessly',
              'Implement assignment with the copy-and-swap idiom: take the parameter by value (triggering copy or move), then swap',
              'Buffer b = a triggers a copy; Buffer c = std::move(a) triggers a move, and a.size() becomes 0',
            ],
            explanation: 'This is the full face of the Rule of Five: destructor + copy ctor + move ctor + a unified assignment (copy-and-swap covering both copy and move assignment). Move semantics make "returning a large object" or "pushing an object into a vector" no longer an expensive copy but an ownership transfer. But remember the golden rule in practice: try not to write these yourself — use std::vector<int> as the member and the entire resource-management code above vanishes, with the compiler\'s default copy/move being correct and efficient. Hand-writing the Rule of Five is for understanding the mechanism; in real code prefer reusing standard containers and smart pointers.',
          },
          miniLab: {
            title: 'Observe when copy vs move happens',
            objective: 'By printing in copy/move, see whether returns, std::move and container insertion trigger which one',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-3 && cd ~/amd-labs/cc-cpp-3',
            language: 'cpp',
            code: `#include <cstdio>
#include <utility>
#include <vector>

struct R {
    int id;
    R(int i): id(i) { printf("ctor %d\\n", id); }
    R(const R &o): id(o.id) { printf("copy %d\\n", id); }
    R(R &&o) noexcept : id(o.id) { o.id = -1; printf("move %d\\n", id); }
    ~R() { printf("dtor %d\\n", id); }
};

int main() {
    R a(1);
    R b = a;             // copy
    R c = std::move(a);  // move (a.id becomes -1)
    std::vector<R> v;
    v.reserve(2);
    v.push_back(R(2));         // temporary → moved into the container
    v.push_back(std::move(b)); // explicitly moved into the container
    puts("-- end --");
    return 0;
}`,
            steps: [
              'Build/run: g++ -std=c++17 -Wall -o lab lab.cpp && ./lab',
              'Distinguish copy vs move in the output: R b = a is copy, R c = std::move(a) is move',
              'Observe push_back(R(2)) moves the temporary into the vector (not a copy)',
              'Try removing v.reserve(2); push more elements to trigger reallocation, and watch elements move to new memory',
            ],
            expectedOutput: `ctor 1
copy 1
move 1
ctor 2
move 2
move 1
-- end --
dtor ...`,
            hint: 'std::move "moves" nothing; it only casts an object to an rvalue reference so the compiler selects the move constructor/assignment. The actual transfer happens inside the move constructor (steal pointer + null source). Returns, container insertion and explicit std::move are common move triggers.',
          },
          debugExercise: {
            title: 'Find why this shared buffer double-frees',
            description: 'This class writes only a destructor and does not handle copy. After putting it into a vector the program crashes (double free).',
            buggyCode: `#include <cstdlib>
#include <vector>
class Buf {
public:
    explicit Buf(size_t n){ p_ = (int*)std::malloc(n*4); }
    ~Buf(){ std::free(p_); }      // only a destructor, no copy ctor/assignment
private:
    int *p_;
};
int main(){
    std::vector<Buf> v;
    v.push_back(Buf(16));   // the temporary is copied into the container, then both destruct
}`,
            language: 'cpp',
            question: 'Buf has no custom copy constructor; how does the default copy copy p_? What happens when both objects destruct?',
            hint: 'Default copy is shallow: both Bufs\' p_ point at the same block. Each destruction frees it.',
            answer: 'It violates the Rule of Three. Buf has a custom destructor (free p_) but uses the compiler\'s default shallow copy constructor, so when the temporary Buf(16) is copied into the vector, the container\'s object and the temporary have p_ pointing at the same block; then the temporary destructs and frees once, and the container element destructs and frees again → a double-free crash. Fixes: (1) follow the Rule of Three and add deep-copy copy constructor and copy assignment (each allocates and copies its own); (2) or define a move constructor/assignment and disable copy so it can only be moved; (3) best practice — replace the member with std::vector<int> or std::unique_ptr<int[]>, which carry correct copy/move, so Buf needs no destructor at all. This exercise is a living lesson in "if you hold a raw resource you must manage copy/move".',
          },
          interviewQ: {
            question: 'What is the Rule of Three/Five? What problem do move semantics solve, and what does std::move actually do?',
            difficulty: 'hard',
            hint: 'Start from "a custom destructor means you must manage copy", then move on to ownership transfer and what std::move really means.',
            answer: 'Rule of Three: if a class needs any one of a custom destructor, copy constructor, or copy assignment (usually because it manages a raw resource), it generally needs all three; otherwise the default shallow copy conflicts with your destructor and causes double frees or leaks. Rule of Five adds the move constructor and move assignment, because once you declare copy/destruction the compiler stops auto-generating move operations. The problem move semantics solve is "unnecessary deep-copy cost": when the source object is about to die (a temporary, or an object marked with std::move), there is no need to copy its resource — just transfer ownership of the resource (e.g. the heap pointer) from source to target and leave the source in a destructible empty state, an O(1) operation. std::move itself moves no data; it is a cast that forces an lvalue into an rvalue reference, telling overload resolution "this object may be moved", with the actual transfer done by the matched move constructor/assignment. Practical advice (Rule of Zero): prefer members like vector, string, unique_ptr, shared_ptr that already correctly implement all five operations, so you write none.',
            amdContext: 'In Mesa/HIP/LLVM, command buffers, shader modules and GPU resource handles are often expressed as "movable, non-copyable" types denoting exclusive ownership (unique_ptr-like semantics), transferring ownership via move to containers or downstream. Understanding move semantics is essential to reading such ownership-transfer code.',
          },
        },
        {
          id: 'cc-cpp-4',
          number: '0.7.2.4',
          title: 'Inheritance, Virtual Functions & Polymorphism',
          titleEn: 'Inheritance, Virtual Functions & Polymorphism',
          duration: 19,
          tags: ['C++', 'virtual', 'polymorphism'],
          concept: {
            summary: 'Inheritance lets a derived class reuse and extend a base; virtual functions make "calls through a base pointer" run the derived implementation — this is C++\'s runtime polymorphism, which is fundamentally a compiler-generated vtable, the built-in version of the hand-written ops structs from cc-c-7.',
            explanation: [
              'Inheritance: a derived class class Gfx : public IpBlock gains the base\'s members and may add/override. public inheritance expresses an "is-a" relationship (a Gfx is an IpBlock).',
              'Virtual functions and dynamic dispatch: the base declares an interface method as virtual and the derived overrides it with override. When you call that method through a base pointer/reference, the version that actually runs is the one for the object\'s real type (decided at runtime) — dynamic dispatch; non-virtual functions bind at compile time by static type.',
              'The vtable: the compiler generates a table of function addresses for each class with virtual functions, and hides a vptr at the object\'s head pointing to it; a virtual call goes indirectly through the vptr. Compare with cc-c-7\'s ops struct: obj->vptr->method() corresponds exactly to obj->ops->method(obj) — only C++ builds and fills the table automatically and adds type checking.',
              'Pure virtual functions and virtual destructors: a = 0 pure virtual function makes the class abstract (an interface, not instantiable) and forces derived classes to implement it. An extremely important rule: when you may delete a derived object through a base pointer, the base destructor must be virtual, or only the base destructor runs, the derived part is not cleaned up, and you get leaks/UB.',
              'Quantify what a virtual call really costs: read the vptr → index the vtable slot → indirect jump — one or two extra memory touches versus a direct call, and usually no inlining, which is the real price (inlining is the gateway to every further optimization). Hot paths therefore reach for C++’s other, static polymorphism (templates/CRTP — compile-time binding, zero cost), reserving virtuals for boundaries that genuinely need runtime swapping: plugins, backends, test injection. LLVM and Mesa keep that boundary sharp.',
              'Object slicing is the top killer in inheritance hierarchies: assign a derived object by value into a base variable and the derived part is silently sheared off, the vptr reverting to base — polymorphism dead, data gone. Defenses: polymorphic types travel only by pointer/reference/smart pointer; bases declare copy constructors protected or delete them outright; interface classes (pure virtual) cannot be instantiated and are thus immune. Companion drills: cpp-07 (virtual engines), cpp-08 (IAllocator interface injection) — set them beside c-14’s ops tables to feel "one design, two spellings".',
            ],
            keyPoints: [
              'public inheritance expresses is-a; a derived class reuses and extends the base',
              'virtual + override → calls through a base pointer run the derived implementation (dynamic dispatch)',
              'The mechanism is vtable + vptr, equivalent to an automated ops struct (cf. cc-c-7)',
              'Pure virtual (=0) forms an abstract interface; the base destructor must be virtual when deleting through a base pointer',
              'A virtual call’s main cost is lost inlining, not the jump itself; polymorphic objects travel by pointer/reference only — passing by value means slicing',
            ],
          },
          diagram: {
            title: 'The vtable mechanism, and its correspondence with C ops structs',
            content: `  object memory + vtable
    IpBlock *p = new Gfx();
    ┌─────────────┐        ┌──────────────────────┐
    │ Gfx object   │        │  Gfx's vtable         │
    │  vptr ───────┼──────► │  [0] hw_init = Gfx::hw_init │
    │  (members...)│        │  [1] ~Gfx (virtual dtor)   │
    └─────────────┘        └──────────────────────┘
    p->hw_init();  // via vptr finds Gfx::hw_init — decided at runtime

  C hand-written ops (cc-c-7)     ⇄    C++ virtual (this lesson)
  obj->ops->hw_init(obj)                obj->hw_init()
  programmer defines struct ops         compiler generates vtable
  programmer points obj's ops           compiler sets vptr in ctor
  no type checking, pass obj manually   type-checked, this passed implicitly`,
            caption: 'A virtual function = an automated ops struct: the vptr corresponds to your hand-written ops pointer, the vtable to that table of function pointers.',
          },
          codeWalk: {
            title: 'Rewrite cc-c-7\'s IP block dispatch with C++ virtual functions',
            file: 'illustrative: abstract base + derived',
            language: 'cpp',
            code: `#include <cstdio>
#include <vector>
#include <memory>

class IpBlock {                       /* 1 abstract base = interface */
public:
    virtual int  hw_init() = 0;       /* 2 pure virtual: derived must implement */
    virtual const char *name() const = 0;
    virtual ~IpBlock() = default;     /* 3 virtual dtor: safe to delete via base ptr */
};

class Gfx : public IpBlock {          /* 4 public inheritance (is-a) */
public:
    int hw_init() override { printf("GFX hw_init\\n"); return 0; }  /* 5 override */
    const char *name() const override { return "gfx"; }
};
class Sdma : public IpBlock {
public:
    int hw_init() override { printf("SDMA hw_init\\n"); return 0; }
    const char *name() const override { return "sdma"; }
};

int main() {
    std::vector<std::unique_ptr<IpBlock>> blocks;   /* 6 a container of base pointers */
    blocks.push_back(std::make_unique<Gfx>());
    blocks.push_back(std::make_unique<Sdma>());
    for (auto &b : blocks)            /* 7 uniform dispatch: actually calls each impl */
        printf("%-4s -> ret=%d\\n", b->name(), b->hw_init());
    return 0;   /* unique_ptr destructs → virtual dtor ensures Gfx/Sdma destruct correctly */
}`,
            annotations: [
              'Declare interface methods as pure virtual (=0), making IpBlock an abstract base that cannot be instantiated',
              'Derived classes override virtuals with override; writing override lets the compiler verify the signature truly matches',
              'Declare the base destructor virtual so deleting via IpBlock* calls Gfx/Sdma destructors',
              'Use vector<unique_ptr<IpBlock>> to hold different derived objects and manage their lifetimes automatically',
              'One loop dispatches through the base interface, each running at runtime — a one-to-one match with cc-c-7\'s C version',
            ],
            explanation: 'Put this side by side with cc-c-7\'s C version: in C you hand-write struct ip_funcs, attach an ops pointer to each object, and call obj->funcs->hw_init(obj); in C++ you write virtual, the compiler auto-generates the vtable, sets the vptr at construction, and the call obj->hw_init() dispatches through the vptr — plus type checking and an implicit this. They are two expressions of the same idea. Parts of Mesa\'s backends and LLVM\'s Pass/TargetMachine use abstract bases + virtual functions to define extensible interfaces; the kernel\'s amdgpu chooses C ops structs for precise control over ABI and zero hidden overhead.',
          },
          miniLab: {
            title: 'Abstract interface, dynamic dispatch, and "why the virtual destructor is mandatory"',
            objective: 'Implement an abstract base + two derived classes, dispatch through a base pointer, and verify the consequence of a missing virtual destructor',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-4 && cd ~/amd-labs/cc-cpp-4',
            language: 'cpp',
            code: `#include <cstdio>
#include <memory>
#include <vector>

struct Base {
    virtual void go() = 0;
    virtual ~Base() { puts("~Base"); }   // try deleting virtual to see the effect
};
struct A : Base {
    A(){ puts("A()"); } ~A() override { puts("~A"); }
    void go() override { puts("A::go"); }
};
struct B : Base {
    B(){ puts("B()"); } ~B() override { puts("~B"); }
    void go() override { puts("B::go"); }
};

int main() {
    std::vector<std::unique_ptr<Base>> v;
    v.push_back(std::make_unique<A>());
    v.push_back(std::make_unique<B>());
    for (auto &p : v) p->go();      // dynamic dispatch: A::go / B::go
    puts("-- destroy --");
    return 0;                       // destroyed via Base*, virtual dtor ensures ~A/~B run
}`,
            steps: [
              'Build/run: g++ -std=c++17 -Wall -o lab lab.cpp && ./lab',
              'Confirm p->go() through the base pointer reached A::go, B::go (dynamic dispatch)',
              'Observe at destruction ~A → ~Base, ~B → ~Base all run (because ~Base is virtual)',
              'Remove virtual from ~Base, rebuild with -Wdelete-non-virtual-dtor, observe the warning, and note ~A/~B no longer run (leak/UB)',
            ],
            expectedOutput: `A()
B()
A::go
B::go
-- destroy --
~A
~Base
~B
~Base`,
            hint: 'Dynamic dispatch requires "through a base pointer/reference + a virtual function". And when deleting a derived object via a base pointer, only if the base destructor is virtual will the derived destructor run before the base destructor; otherwise the derived part is leaked — a common and dangerous mistake.',
          },
          debugExercise: {
            title: 'Find why this "polymorphism" does not take effect',
            description: 'This expects to call the derived implementation through a base pointer, but always runs the base version.',
            buggyCode: `#include <cstdio>
struct Shape {
    double area() { return 0; }          // note: not virtual
};
struct Circle : Shape {
    double r;
    Circle(double r): r(r) {}
    double area() { return 3.14159 * r * r; }  // intends to override area
};
int main() {
    Shape *s = new Circle(2.0);
    printf("%.2f\\n", s->area());   // expected ~12.57, actually 0
    delete s;
}`,
            language: 'cpp',
            question: 'Shape::area is not virtual. When calling area() through Shape*, which version is chosen and by what type?',
            hint: 'A non-virtual function binds by the pointer\'s static type (Shape), ignoring the object\'s real type (Circle).',
            answer: 'Because Shape::area is not virtual, s->area() uses static binding — decided by the pointer\'s static type Shape — so it calls Shape::area returning 0, not Circle::area. This is not polymorphism. Fix: declare the base method virtual (virtual double area();) and override it in the derived class; then calling through Shape* dispatches through the vtable to Circle::area. Additionally, this class lacks a virtual destructor: delete s deleting a Circle through Shape* should also call the derived destructor, so add virtual ~Shape() = default;. Mantra: for runtime polymorphism, make the base interface methods and the destructor virtual.',
          },
          interviewQ: {
            question: 'How are virtual functions implemented (vtable/vptr)? Why is a base destructor usually declared virtual? What is its relationship to C\'s ops struct?',
            difficulty: 'hard',
            hint: 'Make clear the vptr→vtable indirect call, the necessity of a virtual destructor, and the parallel with cc-c-7.',
            answer: 'Mechanism: the compiler generates a vtable for each class with virtual functions, holding each virtual function\'s address in a slot; each object gets a hidden vptr at construction pointing to its real type\'s vtable. A virtual call through a base pointer compiles to "load the object\'s vptr → load the function address from a fixed slot in the vtable → call indirectly", so at runtime the object\'s real-type implementation runs — that is dynamic dispatch. Why the base destructor must be virtual: when you delete a derived object through a base pointer, a non-virtual destructor calls only the base destructor by static type, leaving the derived class\'s extra members/resources uncleaned, causing leaks or UB; a virtual destructor calls the derived destructor first, then the base, destroying it fully. Relationship to the C ops struct: they are two implementations of the same idea — C hand-writes a table of function pointers (struct ops) and has the object hold a pointer to it, calling obj->ops->fn(obj); the C++ vtable is exactly that table auto-generated by the compiler, the vptr is exactly that auto-set pointer, and obj->fn() is the automated, type-checked, implicit-this version of obj->ops->fn(obj). Understanding cc-c-7\'s ops is understanding the essence of the vtable.',
            amdContext: 'The amdgpu kernel uses C ops structs (amd_ip_funcs, dma_fence_ops, etc.) for polymorphism; userspace Mesa/LLVM use C++ virtual functions. Being able to explain "ops struct ⇄ vtable" is key to reading both the kernel-side and userspace GPU stacks, and a frequent interview question.',
          },
        },
        {
          id: 'cc-cpp-5',
          number: '0.7.2.5',
          title: 'Templates & Generic Programming',
          titleEn: 'Templates & Generic Programming',
          duration: 18,
          tags: ['C++', 'template', 'generic'],
          concept: {
            summary: 'Templates let you write one piece of code "parameterized over types", and the compiler generates an instance for each concrete type when used. It is a type-safe generic mechanism that replaces C\'s unsafe void* and macros, and is the foundation of the STL.',
            explanation: [
              'Function templates: template <typename T> T max_of(T a, T b). Calling max_of(3, 4) makes the compiler deduce T=int and instantiate an int version; max_of(2.5, 1.5) instantiates a double version. One source, multiple concrete codes generated on demand.',
              'Class templates: template <typename T> class Array { T *data; ... }. Array<int> and Array<float> are two independent classes. The STL\'s vector<T> and map<K,V> are class templates.',
              'Templates are a compile-time mechanism: instantiation happens at compile time, the generated code is as efficient as a hand-written concrete version (no runtime overhead), and it is fully type-checked — exactly where it beats C macros (pure text substitution, no type checking, hard to debug) and void* (loses type, needs casts, error-prone).',
              'One engineering point: a template\'s definition usually must go in a header. Because the compiler can only generate code once it sees "with what type to instantiate", if you hide a template definition in some .cpp, other translation units instantiating it cannot find the definition and you get a link error.',
              'The compilation model of templates explains all their quirks: a template is not code but a recipe for generating it — only when used with a concrete type (instantiated) does the compiler emit a function/class for that type. Three consequences: definitions must be visible at the point of use (hence templates live in headers); every used type gets its own machine code (the source of code bloat — budget it in constrained settings); errors erupt at the instantiation point (long, deep diagnostics). static_assert is the front-door check for templates — reporting contract violations in plain language on line one.',
              '"Implicit constraints" are the key to reading generic code: max3 only demands that the type support <, clamp_t only comparability and copyability — a template’s requirements are written in its usage, not its signature. C++20 concepts make them explicit (requires std::totally_ordered<T>), already widespread in LLVM. When reading Mesa/ROCm template code, first ask "what is this T expected to do" — the answer usually hides in the operators of the function body. Companion drills: cpp-09 (the function-template trio), cpp-10 (the RingBuffer class template, static_assert in action).',
            ],
            keyPoints: [
              'Templates parameterize over types; the compiler deduces and instantiates concrete versions at the use site',
              'Function templates and class templates; STL containers are all class templates',
              'Compile-time instantiation: zero runtime overhead + full type checking (better than macros/void*)',
              'Template definitions usually go in headers, or instantiation cannot find the definition at link time',
              'Template definitions belong in headers (instantiation must see them); errors erupt at instantiation — front-load the contract with static_assert',
            ],
          },
          diagram: {
            title: 'One template, many instances (generated at compile time)',
            content: `  source (one)                 compiler instantiates per use site (many)
  template<class T>            max_of(3, 4)    → max_of<int>
  T max_of(T a, T b){          max_of(2.5,1.0) → max_of<double>
      return a > b ? a : b;    max_of(x, y)/*Vec*/→ max_of<Vec> (needs operator>)
  }

  Three "generic" approaches compared:
   C macro    #define MAX(a,b) ((a)>(b)?(a):(b))
             text substitution, no type checking, double-evaluates side effects, hard to debug
   C void*   int cmp(const void*,const void*)  (qsort)
             loses type, needs casts, errors surface only at runtime
   C++ tmpl  template<class T> ...
             compile-time instantiation, type-safe, zero runtime overhead ✓`,
            caption: 'Templates generate specialized code per used type at compile time, getting genericity, type safety and runtime efficiency all at once.',
          },
          codeWalk: {
            title: 'A function template and a minimal class template',
            file: 'illustrative: template basics',
            language: 'cpp',
            code: `#include <cstdio>

template <typename T>            /* 1 function template */
T max_of(T a, T b) { return a > b ? a : b; }

template <typename T, int N>     /* 2 class template: can take a non-type parameter N */
class FixedArray {
public:
    T &operator[](int i) { return data_[i]; }
    int size() const { return N; }
private:
    T data_[N];
};

int main() {
    printf("%d %.1f\\n", max_of(3, 7), max_of(2.5, 1.5)); /* 3 deduces int / double */

    FixedArray<float, 4> a;       /* 4 instantiate FixedArray<float,4> */
    for (int i = 0; i < a.size(); i++) a[i] = i * 0.5f;
    printf("a[3]=%.1f size=%d\\n", a[3], a.size());
    return 0;
}`,
            annotations: [
              'Function template: parameterized by typename T, with T deduced automatically at the call site',
              'A class template can also take a "non-type parameter" (like int N) — compile-time constants are parameterizable too',
              'The same max_of serves both int and double; the compiler generates one of each',
              'FixedArray<float,4> is a concrete type whose size and element type are fixed at compile time',
            ],
            explanation: 'Templates are the foundation of C++ generics and the STL. LLVM and Mesa use templates heavily to write data structures and algorithms decoupled from concrete types (e.g. llvm::SmallVector<T,N> and various ADTs). Once you understand "one template, instantiated per type, done at compile time, zero runtime overhead", you can read why these libraries are both generic and efficient. The next lesson\'s STL containers (vector/map) and smart pointers (unique_ptr/shared_ptr) are all templates.',
          },
          miniLab: {
            title: 'Write a template function and a template class and observe instantiation',
            objective: 'Instantiate templates, understand type deduction, and experience the "template definition must be visible" link rule',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-5 && cd ~/amd-labs/cc-cpp-5',
            language: 'cpp',
            code: `// lab.cpp
#include <cstdio>

template <typename T>
T clamp(T v, T lo, T hi) { return v < lo ? lo : (v > hi ? hi : v); }

template <typename T>
struct Span {                  // a minimal "array view"
    T *ptr; int len;
    T sum() const { T s{}; for (int i=0;i<len;i++) s += ptr[i]; return s; }
};

int main() {
    printf("%d %.1f\\n", clamp(15, 0, 10), clamp(0.3, 0.0, 1.0));
    int a[] = {1,2,3,4};
    Span<int> s{a, 4};
    printf("sum=%d\\n", s.sum());
    return 0;
}`,
            steps: [
              'Build/run: g++ -std=c++17 -Wall -o lab lab.cpp && ./lab',
              'Observe clamp serving both int and double without writing two versions',
              'Try calling clamp(1, 0.0, 10.0) (mixed types) and see the compiler report a "deduction conflict" — feel the template\'s type checking',
              'Move clamp\'s definition into a separate clamp.cpp, leaving only a declaration in a header, and watch undefined reference at link, to understand "template definitions must be visible in the header"',
            ],
            expectedOutput: `10 0.3
sum=10`,
            hint: 'A template call site triggers instantiation; the compiler generates the concrete code and type-checks it. Mixed types (int with double) make T deduction conflict and error — exactly the template\'s type safety. Put template definitions in headers so every instantiation point can see them.',
          },
          debugExercise: {
            title: 'Find why this template gives a link error',
            description: 'The template function\'s definition was put in a .cpp; another file calling it reports undefined reference.',
            buggyCode: `// util.h
template <typename T> T square(T x);   // declaration only

// util.cpp
#include "util.h"
template <typename T> T square(T x) { return x * x; }  // definition hidden in .cpp

// main.cpp
#include "util.h"
int main() { return square(5); }   // link: undefined reference to square<int>`,
            language: 'cpp',
            question: 'When compiling main.cpp, can the compiler see square\'s definition? How can it generate an int instance?',
            hint: 'A template must have its definition visible where it is instantiated. main.cpp only saw a declaration.',
            answer: 'When compiling main.cpp the compiler only sees square\'s declaration (in util.h), not its definition (which is in util.cpp), so it cannot generate code for square<int>; meanwhile the template in util.cpp is not instantiated with any type and never generates square<int> either. As a result, the square<int> that main.o references has no definition at link time → undefined reference. Fixes: (1) the standard approach — put the template\'s definition directly in the header util.h (a template is not an ordinary function; putting its definition in a header does not violate the ODR); (2) or do an explicit instantiation at the end of util.cpp: template int square<int>(int); to pre-generate the needed type. The vast majority of projects choose (1), which is why STL and LLVM templates live almost entirely in headers.',
          },
          interviewQ: {
            question: 'How do templates differ from macros? Why are templates usually defined in headers? When does template instantiation happen?',
            difficulty: 'medium',
            hint: 'Contrast macros on type safety/scope/debugging; explain headers via "the instantiation point needs the definition"; stress compile time.',
            answer: 'Templates vs macros: a macro is pure text substitution in the preprocessing stage, with no type checking, no respect for scope, possible multiple evaluation of arguments (the side-effect trap), cryptic error messages, and is hard to debug; a template is a language-level generic, involving the compiler, with full type checking and overload resolution, respecting scope, understandable by the debugger, and generating code as efficient as a hand-written concrete type. Why templates go in headers: a template is not code itself; the compiler generates real code only when "instantiated with a concrete type", so every instantiation point (often in another translation unit) must be able to see the template\'s full definition, or it cannot generate the instance and you get undefined reference at link. Putting the definition in a header guarantees visibility (a template definition in a header is an ODR-permitted exception). Instantiation timing: it happens at compile time — when code first uses the template with a concrete type, the compiler generates a specialized version for that type (implicit instantiation), or you can instantiate explicitly. Because it is done at compile time, templates have no runtime dispatch overhead (unlike virtual functions\' runtime polymorphism).',
            amdContext: 'LLVM\'s ADTs (SmallVector, DenseMap, etc.) and parts of Mesa\'s C++ data structures are templates, all defined in headers. Understanding template instantiation and the header rule is a prerequisite to reading and, when necessary, modifying these libraries.',
          },
        },
        {
          id: 'cc-cpp-6',
          number: '0.7.2.6',
          title: 'STL Containers, Algorithms & Smart Pointers',
          titleEn: 'STL Containers, Algorithms & Smart Pointers',
          duration: 20,
          tags: ['C++', 'STL', 'smart-pointer'],
          concept: {
            summary: 'The STL provides ready-made containers (vector/string/map) and algorithms (sort/find) that manage memory automatically via RAII; smart pointers (unique_ptr/shared_ptr) replace raw new/delete with ownership semantics. This lesson ties every earlier thread into "how modern C++ is written day to day".',
            explanation: [
              'vector<T> is the most-used dynamic array: contiguous storage, O(1) random access, amortized O(1) push_back. It distinguishes size (current element count) from capacity (allocated capacity); when capacity is insufficient it reallocates a larger block and moves elements — which also invalidates old iterators/pointers. string is a vector of characters; map/unordered_map provide key-value lookup (ordered tree vs hash).',
              'Iterators and algorithms: containers are traversed uniformly via iterators (begin()/end()); the range-for (for (auto &x : v)) is syntactic sugar for this; <algorithm> provides generic algorithms like sort, find, count_if, often paired with a lambda ([](auto&a,auto&b){return ...;}) to customize behavior.',
              'unique_ptr<T>: an exclusive-ownership smart pointer, non-copyable and move-only; it auto-deletes when leaving scope. It is the modern replacement for raw new/delete with zero extra overhead, expressing "this resource has exactly one owner". Create with std::make_unique<T>(...).',
              'shared_ptr<T>: reference-counted shared ownership, releasing only when the last holder is destroyed; suitable for multiple parties sharing one resource, but with counting overhead and the need to watch for reference cycles (break them with weak_ptr). Rule of thumb: default to unique_ptr; reach for shared_ptr only when sharing is truly needed.',
              'Memorize vector’s growth contract together with its invalidation rules: a push_back beyond capacity reallocates and relocates every element — all pointers/references/iterators into it are invalidated at once; reserve pre-books capacity and avoids the repeated moves. map is an ordered structure (red-black tree, key-ordered iteration, O(log n)); unordered_map is a hash (amortized O(1), unordered iteration) — the first question when choosing a container is always "what traversal order and invalidation guarantees do I need".',
              'The smart-pointer cost model: unique_ptr is a zero-overhead abstraction (raw-pointer size, no runtime cost) — the default; shared_ptr carries a control block plus atomic counts (one atomic op per copy, cache-line contention under threads) — only for genuinely shared ownership; weak_ptr breaks shared_ptr reference cycles. Prefer make_unique/make_shared over bare new: exception-safe, and make_shared co-allocates object and control block. Companion drills: cpp-11 (map+sort+lambda), cpp-12 (unique_ptr composition, Rule of Zero in action); set beside k-04 — shared_ptr is kref automated.',
            ],
            keyPoints: [
              'vector: contiguous storage, size vs capacity, reallocation invalidates iterators',
              'Iterators + range-for + <algorithm> (sort/find) + lambdas',
              'unique_ptr: exclusive, move-only, auto-released, replaces raw new/delete',
              'shared_ptr: ref-counted sharing, mind overhead and cycles; default to unique_ptr',
              'Vector growth invalidates every iterator — reserve first when you can; unique_ptr is the zero-cost default, shared_ptr pays atomic counting, weak_ptr breaks cycles',
            ],
          },
          diagram: {
            title: 'vector growth and the ownership of two smart pointers',
            content: `  vector: size vs capacity
    v=[1,2,3]   size=3 capacity=4    ┌─┬─┬─┬─┐
                                     │1│2│3│ │
    v.push_back(4) → size=4 cap=4    └─┴─┴─┴─┘
    v.push_back(5) → capacity full! reallocate cap=8 and move
        old memory freed → previously saved iterators/pointers all invalid

  unique_ptr (exclusive)         shared_ptr (shared, ref-counted)
    p ─► [object]                  p ─┐ ref=2
    non-copyable, move-only        q ─┴─► [object | refcount]
    leaving scope → delete         last holder destroyed → refcount→0 → delete
                                   a cycle keeps refcount > 0 forever → use weak_ptr`,
            caption: 'vector growth moves elements and invalidates old iterators; unique_ptr expresses exclusive ownership, shared_ptr expresses sharing via reference counting.',
          },
          codeWalk: {
            title: 'Tying it together: vector<unique_ptr<base>> holding polymorphic objects',
            file: 'illustrative: modern C++ synthesis',
            language: 'cpp',
            code: `#include <cstdio>
#include <vector>
#include <memory>
#include <algorithm>
#include <string>

struct IpBlock {                                  /* reuse cc-cpp-4's interface */
    virtual int cost() const = 0;
    virtual std::string name() const = 0;
    virtual ~IpBlock() = default;
};
struct Gfx  : IpBlock { int cost() const override{return 30;} std::string name() const override{return "gfx";} };
struct Sdma : IpBlock { int cost() const override{return 10;} std::string name() const override{return "sdma";} };

int main() {
    std::vector<std::unique_ptr<IpBlock>> blocks;       /* 1 container holds exclusive ownership */
    blocks.push_back(std::make_unique<Gfx>());          /* 2 make_unique creates */
    blocks.push_back(std::make_unique<Sdma>());

    /* 3 sort by cost with algorithm + lambda */
    std::sort(blocks.begin(), blocks.end(),
              [](const auto &a, const auto &b){ return a->cost() < b->cost(); });

    for (const auto &b : blocks)                         /* 4 range-for + polymorphic dispatch */
        printf("%-4s cost=%d\\n", b->name().c_str(), b->cost());
    return 0;   /* 5 vector destructs → each unique_ptr destructs → virtual dtor destroys objects, zero leaks */
}`,
            annotations: [
              'vector<unique_ptr<IpBlock>>: the container owns these heap objects exclusively',
              'make_unique creates an object and hands it to a unique_ptr, no manual new/delete',
              'std::sort with a lambda customizes the comparison — algorithm decoupled from container',
              'Range-for traversal; b is a reference to the unique_ptr, and b->cost() dispatches via the virtual function',
              'Leaving scope: the vector destructs each unique_ptr, the virtual destructor fully destroys derived objects, all automatic and leak-free',
            ],
            explanation: 'This code threads the whole module together: function pointers/ops (cc-c-7) → virtual-function polymorphism (cc-cpp-4) → template containers (cc-cpp-5) → RAII/ownership (cc-c-6, cc-cpp-2/3). Not a single manual free, not a single raw pointer; resources are managed throughout by the RAII of vector and unique_ptr, while polymorphic dispatch drives different implementations from one loop. This is the typical modern-C++ way to manage a collection of GPU resources/Passes/IP objects in Mesa, ROCm/HIP and LLVM. Reach this point and you have the language foundation to read those codebases.',
          },
          miniLab: {
            title: 'Containers + algorithms + smart pointers in practice',
            objective: 'Process data with vector/map/sort/lambda, and rewrite raw new/delete as unique_ptr',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-6 && cd ~/amd-labs/cc-cpp-6',
            language: 'cpp',
            code: `#include <cstdio>
#include <vector>
#include <map>
#include <string>
#include <algorithm>
#include <memory>

int main() {
    std::vector<int> v{5, 2, 8, 1, 9, 3};
    std::sort(v.begin(), v.end());                 // ascending
    int big = std::count_if(v.begin(), v.end(),
                            [](int x){ return x >= 5; });
    printf("min=%d max=%d  >=5 count=%d\\n", v.front(), v.back(), big);

    std::map<std::string,int> busy{{"gfx",70},{"sdma",20}};
    busy["vcn"] = 45;
    for (auto &[k, val] : busy) printf("  %-4s %d%%\\n", k.c_str(), val);

    auto p = std::make_unique<int[]>(3);           // replaces new int[3]
    for (int i = 0; i < 3; i++) p[i] = i + 1;
    printf("p[2]=%d\\n", p[2]);                      // auto-freed at scope exit
    return 0;
}`,
            steps: [
              'Build/run: g++ -std=c++17 -Wall -fsanitize=address -o lab lab.cpp && ./lab',
              'Note there is no leak even with ASan on — containers and unique_ptr free automatically',
              'Observe std::map iterating in key order; try std::unordered_map to compare iteration order',
              'Iterate the map with structured bindings auto &[k,val]; try std::find_if + a lambda to find the first element >= 8',
            ],
            expectedOutput: `min=1 max=9  >=5 count=3
  gfx  70%
  sdma 20%
  vcn  45%
p[2]=3`,
            hint: 'The default modern-C++ posture: store data in vector/string/map, process with <algorithm> + lambdas, and manage dynamic objects with unique_ptr/make_unique. You almost never hand-write new/delete, and memory safety is guaranteed by RAII.',
          },
          debugExercise: {
            title: 'Find why this traversal crashes (iterator invalidation)',
            description: 'This tries to append to a vector while iterating it, and crashes or behaves strangely.',
            buggyCode: `#include <vector>
#include <cstdio>
int main() {
    std::vector<int> v{1, 2, 3, 4};
    for (auto it = v.begin(); it != v.end(); ++it) {
        if (*it % 2 == 0)
            v.push_back(*it * 10);   // grows during iteration → it invalidated
    }
    for (int x : v) printf("%d ", x);
}`,
            language: 'cpp',
            question: 'push_back may trigger a reallocation of the vector. After reallocation, is the previously obtained iterator it still valid?',
            hint: 'vector growth moves elements to new memory and frees the old; all iterators/pointers into the old memory become invalid.',
            answer: 'It is not valid. push_back, when capacity is insufficient, reallocates a larger buffer, moves elements over, and frees the old memory, so the iterator it held in the loop points at freed old memory, and continuing with ++it/*it is undefined behavior (crash or garbage). This is "iterator invalidation". Fixes: (1) do not modify a container\'s size while iterating it — collect the elements to append into another vector and append them all after iterating; (2) if you must add while iterating, use an index instead of an iterator and record the original length first: `size_t n=v.size(); for(size_t i=0;i<n;i++){...v.push_back(...);}` (use the fixed n, and do not reuse old references after push_back); (3) v.reserve() to sufficient capacity up front also avoids "this example\'s" reallocation, but that only sidesteps rather than generally solving it, and modifying size during iteration is still discouraged. Remember each container\'s invalidation rules: vector growth invalidates all iterators, while node-based containers like list/map keep existing iterators valid on insertion.',
          },
          interviewQ: {
            question: 'How do unique_ptr and shared_ptr differ, and when do you use each? What is the difference between a vector\'s size and capacity, and what is the cost of growth?',
            difficulty: 'medium',
            hint: 'Contrast the two smart pointers by ownership semantics; explain vector growth via amortized complexity and iterator invalidation.',
            answer: 'unique_ptr expresses exclusive ownership: only one unique_ptr owns the object at a time, it is non-copyable and move-only (transferring ownership), and it auto-deletes when leaving scope, with virtually zero extra overhead. shared_ptr expresses shared ownership: it maintains a reference count internally, multiple shared_ptrs can co-own one object, and release happens only when the last is destroyed; the cost is atomic counting operations, a larger control block, and the possibility of reference cycles that never release (break them with weak_ptr). Selection rule: default to unique_ptr to express a clear single owner; use shared_ptr only when the object genuinely needs to be shared by multiple parties with a lifetime decided by "the last user". A vector\'s size is the current number of elements, while capacity is the number it can hold without reallocating; push_back triggers growth when size==capacity: it allocates a larger buffer (usually growing geometrically), moves/copies the existing elements over, and frees the old buffer — a single growth is O(n), but thanks to the doubling strategy n appends amortize to O(1). The side effect of growth is that all iterators/pointers/references into the old storage are invalidated; if the size is known, reserve(n) up front avoids repeated growth and invalidation.',
            amdContext: 'Mesa/HIP/LLVM use unique_ptr to express exclusive ownership of GPU resources/Passes and shared_ptr for objects that must be shared; they store batches of objects in vector (and LLVM\'s SmallVector). Understanding ownership and growth/invalidation is the basis for reading these libraries\' resource management and performance trade-offs.',
          },
        },
      ],
    },
    {
      id: 'cc-kernel',
      number: '0.7.3',
      title: 'Kernel C Idioms in Practice',
      titleEn: 'Kernel C Idioms in Practice',
      icon: 'Wrench',
      description: 'Mastering C syntax is only the ticket in; kernel code is a dialect written in a fixed set of idioms. This group gives one lesson to each of the six idiom families that appear most often in driver code: bit-manipulation macros, intrusive lists, macro hygiene, error handling, reference counting & managed resources, and concurrency-context rules — every lesson wired straight into real amdgpu code.',
      lessons: [
        {
          id: 'cc-kernel-1',
          number: '0.7.3.1',
          title: 'Bit Macros: BIT, GENMASK & Register Fields',
          titleEn: 'Bit Macros: BIT, GENMASK & Register Fields',
          duration: 18,
          tags: ['kernel-C', 'BIT', 'GENMASK', 'FIELD_GET', 'registers'],
          concept: {
            summary:
              "A driver's daily life is dealing with fields squeezed together inside 32-bit registers. For this the kernel provides a standard macro set: BIT(n) picks a single bit, GENMASK(h, l) builds a contiguous bit-range mask, and FIELD_GET/FIELD_PREP access fields through a mask. amdgpu additionally has its own REG_GET_FIELD/REG_SET_FIELD family. Only once you can read and write these macros does register-manipulation code become readable at a glance.",
            explanation: [
              'Hardware registers are "bit-packed": within one 32-bit GRBM_STATUS, bit 31 is GUI_ACTIVE, bit 25 is CB_BUSY, and bits [15:12] might be some counter. Bare (reg >> 12) & 0xF works, but readers have to count bits and writers will miscount them. The kernel approach is to define each field\'s mask once and then operate through standard macros, making the "field" a first-class citizen in the code.',
              'How to use the trio: BIT(25) expands to (1UL << 25) — note the 1UL: shifting an int 1 left by 31 bits is undefined behavior (the sign bit), a high-frequency trap in interviews and reviews. GENMASK(15, 12) produces 0x0000F000, i.e. all four bits of [15:12] set to 1, and the argument order is "high bit first". FIELD_GET(mask, reg) extracts the field value from reg according to mask and right-shifts it into alignment (the shift amount is computed automatically from the mask at compile time); FIELD_PREP(mask, val) goes the other way, placing a value into the field position. Masks are named as constants ending in _MASK — defined in one place, referenced everywhere.',
              'For reasons of history and code generation, amdgpu has a set of its own: the register headers (the asic_reg/ directory) generate two constants for every field, REG__FIELD__SHIFT and _MASK, paired with the REG_GET_FIELD(value, REG, FIELD) and REG_SET_FIELD(orig, REG, FIELD, val) macros. The principle is identical to FIELD_GET — inside amdgpu you will see this set far more often, and you read it the same way: find the _MASK/_SHIFT definitions first, and the field semantics become clear.',
              "One more family to meet as needed: set_bit/clear_bit/test_bit operate on bitmaps in memory (atomic versions exist for concurrent scenarios), hweight32 counts the 1 bits (the previous module's setup_rb used it to count RBs), and ffs/fls find the first/last set bit. Bitmaps are very common in drivers for managing resource-allocation tables (which doorbell is taken, which CUs are harvested).",
              'Companion drills (/code-lab, compiled in-browser): c-04 (set/clear/test mask basics), c-05 (recreating GET_FIELD/SET_FIELD), c-06 (fls and powers of two), k-08 (a 128-bit doorbell bitmap), k-09 (ioctl four-field packing) — you will hand-implement every macro from this lesson.',
            ],
            keyPoints: [
              'BIT(n) = (1UL << n) — the UL suffix avoids the undefined behavior of left-shifting an int by 31.',
              'GENMASK(h, l): high bit first, builds the contiguous [h:l] mask; swapping the arguments is a classic bug.',
              'FIELD_GET/FIELD_PREP extract/place fields via a mask; the shift amount is derived automatically at compile time.',
              'amdgpu dialect: REG_GET_FIELD/REG_SET_FIELD plus header-generated _SHIFT/_MASK constants — same principle.',
              'The set_bit/test_bit family operates on in-memory bitmaps (atomic if needed); drivers use it to manage resource-occupancy tables.',
            ],
          },
          diagram: {
            title: 'Anatomy of the fields in one 32-bit register',
            content: `GRBM_STATUS (32 bit)
 31          25       15  12            0
┌─┬───────┬─┬─────────┬────┬─────────────┐
│G│ ...   │C│  ...    │CNT │    ...      │
└─┴───────┴─┴─────────┴────┴─────────────┘
 ▲          ▲             ▲
 GUI_ACTIVE CB_BUSY      [15:12] counter field
 BIT(31)    BIT(25)      GENMASK(15,12)=0xF000

Read field:  cnt = FIELD_GET(GENMASK(15,12), reg);
Write field: reg = (reg & ~mask) | FIELD_PREP(mask, 5);
amdgpu:      busy = REG_GET_FIELD(v, GRBM_STATUS, CB_BUSY);`,
            caption: 'One register, three views: bit numbers, mask macros, field names. Driver code strives for the bottom "field name" level of readability.',
          },
          codeWalk: {
            title: 'Kernel definitions + amdgpu usage side by side',
            language: 'c',
            file: 'include/linux/bits.h + drivers/gpu/drm/amd/amdgpu/ (excerpt, simplified)',
            code: `/* ── Kernel standard macros (simplified) ─────────── */
#define BIT(nr)        (1UL << (nr))
#define GENMASK(h, l) \\
	(((~0UL) << (l)) & (~0UL >> (BITS_PER_LONG - 1 - (h))))
/* Core of FIELD_GET: derive the shift from the mask's low bits */
#define FIELD_GET(mask, reg) \\
	(((reg) & (mask)) >> __bf_shf(mask))

/* ── amdgpu's equivalent dialect ─────────────────── */
/* Auto-generated register headers (asic_reg/gc/gc_11_0_0_sh_mask.h): */
#define GRBM_STATUS__CB_BUSY__SHIFT   0x19
#define GRBM_STATUS__CB_BUSY_MASK     0x02000000L

#define REG_GET_FIELD(value, reg, field) \\
	(((value) & reg##__##field##_MASK) \\
	 >> reg##__##field##__SHIFT)

/* In practice: gfx_v11_0.c checks whether the GPU is idle */
static bool gfx_v11_0_is_idle(void *handle)
{
	u32 tmp = RREG32_SOC15(GC, 0, regGRBM_STATUS);
	return !REG_GET_FIELD(tmp, GRBM_STATUS,
			      GUI_ACTIVE);
}`,
            explanation:
              'Two macro sets, one principle: the mask is the single source of truth, and the shift is derived from it (the kernel computes it at compile time with __bf_shf; amdgpu generates _SHIFT constants directly). Note the ## pasting inside REG_GET_FIELD — the macro splices GRBM_STATUS and CB_BUSY into a constant name, which is exactly why the field name must match the header definition character for character.',
          },
          miniLab: {
            title: 'Build a userspace register-field playground',
            objective: 'Implement and verify the trio by hand, and run into the 1<<31 undefined behavior along the way.',
            language: 'c',
            code: `#include <stdio.h>
#include <stdint.h>
#define BIT(n)        (1UL << (n))
#define GENMASK(h, l) \\
    (((~0UL) << (l)) & (~0UL >> (63 - (h))))
#define FIELD_GET(m, r) (((r) & (m)) >> __builtin_ctzl(m))

int main(void)
{
    uint32_t reg = 0x8200F123;   /* simulated GRBM_STATUS */
    printf("GUI_ACTIVE = %lu\\n", FIELD_GET(BIT(31), reg));
    printf("CB_BUSY    = %lu\\n", FIELD_GET(BIT(25), reg));
    printf("CNT[15:12] = %lu\\n",
           FIELD_GET(GENMASK(15, 12), reg));
    /* Experiment: change the 1UL in BIT to 1, build with
       -fsanitize=undefined, watch UBSan bust 1 << 31 */
    return 0;
}`,
            steps: [
              'Compile and run: gcc -Wall -fsanitize=undefined lab.c && ./a.out, and check the three field values (1, 1, 0xF)',
              'Change the 1UL in the BIT macro to 1 and rerun — UBSan reports "left shift of 1 by 31 places cannot be represented in type int"',
              'Swap GENMASK(15,12) into GENMASK(12,15), print the mask value, and understand why the result is 0 (or why it triggers shift UB)',
              'Open gc_11_0_0_sh_mask.h on elixir, pick any register, find the _MASK/_SHIFT of any of its fields, and verify by hand that the mask and shift are consistent',
              "Write one sentence into your log comparing __builtin_ctzl with the kernel's __bf_shf approach",
            ],
            expectedOutput:
              'GUI_ACTIVE = 1, CB_BUSY = 1, CNT[15:12] = 15 (0xF). In step 2 UBSan precisely reports the undefined behavior of shifting an int left by 31. In step 3 the mask is 0 — a swapped argument order does not error out, it just silently yields 0, which is exactly what makes it scary.',
            hint: "__builtin_ctzl(mask) = the number of trailing zeros in the mask = the field's start bit — the compiler-builtin implementation of the kernel's __bf_shf idea.",
          },
          debugExercise: {
            title: 'Why does this "enable interrupts" function never light anything up?',
            language: 'c',
            question: 'A newcomer wrote a helper that turns on the interrupt-enable bit; testing shows the interrupt is never enabled, and occasionally other configuration gets clobbered too. Find the three bit-manipulation errors.',
            buggyCode: `#define IH_CNTL__ENABLE_INTR__SHIFT  0x1f  /* bit 31 */
#define IH_CNTL__RING_SIZE_MASK      0x0000003EL /* [5:1] */

void broken_enable_intr(struct my_dev *dev, int ring_size)
{
	u32 v = read_reg(dev, IH_CNTL);

	/* 1. Turn on the enable bit */
	v |= 1 << IH_CNTL__ENABLE_INTR__SHIFT;

	/* 2. Set the ring size field [5:1] */
	v |= ring_size << 1;

	/* 3. "Clear the reserved bits [30:26]" */
	v &= GENMASK(26, 30);

	write_reg(dev, IH_CNTL, v);
}`,
            hint: 'For spot 1 think about the type of 1; for spot 2 think about the old value — can |= "set" a field? For spot 3, GENMASK argument order plus the semantics of &= — is it "keep" or "clear"?',
            answer:
              'Error one: 1 << 31 shifts an int into the sign bit — undefined behavior; the correct form is BIT(31) or 1UL << shift. Error two: setting a multi-bit field with |= without clearing the old value first — if the ring_size field in the register was previously 0b11111 and you now want to write 0b00010, |= leaves you with 0b11111. Field writes must "clear, then set": v = (v & ~RING_SIZE_MASK) | FIELD_PREP(RING_SIZE_MASK, ring_size), and ring_size should also be validated against the field width. Error three: the GENMASK(26, 30) arguments are reversed (high bit must come first: GENMASK(30, 26)), and even with the right mask, v &= mask means "keep only these bits and clear all the others" — wiping out the enable bit and the ring size; to clear [30:26] you want v &= ~GENMASK(30, 26). The common cure for all three: always use the BIT/GENMASK/FIELD_PREP macros that carry their correctness with them, and never hand-roll shifts.',
          },
          interviewQ: {
            question: "Why does the kernel's BIT macro use 1UL instead of 1? What engineering value do macros like FIELD_GET/REG_GET_FIELD have over hand-written shifts?",
            difficulty: 'medium',
            hint: 'Start the first half from C integer promotion and shift UB; the second half from "single source of truth" and readability.',
            answer:
              '1 is an int (32-bit signed), and 1 << 31 shifts the 1 into the sign bit, which the C standard classifies as undefined behavior; moreover an int can only shift up to 30 places, so the high bits of a 64-bit register cannot be expressed at all. 1UL is an unsigned long: unsigned shifts are well defined, and the width is at least that of long, covering the 64-bit cases. The value of the FIELD_GET-style macros: the mask constant is the field\'s "single source of truth", and the shift amount is derived from the mask automatically, eliminating the hand-slip class of mismatched shift and mask; the code turns from (reg>>12)&0xF into FIELD_GET(CNT_MASK, reg), which is self-describing; and mask definitions are audited in one central place, so when the hardware manual revs you change exactly one spot. amdgpu\'s REG_GET_FIELD works the same way, and additionally uses macro pasting to force field names to match the official register headers — the code is the documentation.',
            amdContext: 'Register questions in amdgpu interviews are nearly inevitable: you get a stretch of RREG32/REG_GET_FIELD code and are asked what it does, or you write a read-modify-write of a field on the spot. Making the two points — "clear, then set" and 1UL — crystal clear is full marks.',
          },
        },
        {
          id: 'cc-kernel-2',
          number: '0.7.3.2',
          title: 'Kernel Lists: list_head, Intrusive by Design',
          titleEn: 'Kernel Lists: list_head, Intrusive by Design',
          duration: 20,
          tags: ['kernel-C', 'list_head', 'container_of', 'intrusive-list'],
          concept: {
            summary:
              'The kernel list is "intrusive": instead of a container holding your data, you embed the tiny struct list_head node into your own struct. Paired with container_of to recover the host from a node, one set of list_add/list_del/list_for_each_entry macros lets any struct sit on any number of lists. In amdgpu, the management of BOs, fences and ctxs all rests on it.',
            explanation: [
              "First understand the problem with ordinary linked lists: C++'s std::list<T> allocates a separate node per element and stores a copy of (or pointer to) the data in the node. The kernel does not do that — memory allocation in the kernel is expensive and can fail, and one object frequently needs to be on several lists at once (a BO can be on the VM's moved list and on the eviction LRU at the same time). The intrusive design solves all of it in one stroke: struct list_head holds just two pointers, prev and next; embed it as a member of the host struct, and joining a list = updating four pointers — zero allocation, O(1) removal, and a host can be on as many lists as it embeds list_heads.",
              'The price is that "getting from a node back to its host" takes one reverse computation — which is exactly the container_of taught in Module 1: knowing a member\'s address and the member\'s offset inside the struct, subtract to recover the host address. list_entry(ptr, type, member) is just an alias for container_of, and list_for_each_entry(pos, head, member) packages "walk the nodes + recover the host" into one loop macro, so pos is directly the host pointer.',
              'Operation semantics you must internalize: a list head is initialized with LIST_HEAD(name) or INIT_LIST_HEAD into an empty ring "pointing at itself" (kernel lists are doubly linked circular lists; the emptiness test is head->next == head); list_add inserts at the head, list_add_tail at the tail; after list_del the node\'s pointers are written with poison values (LIST_POISON) to help you catch use-after-delete — if the node will be reused, use list_del_init instead; deleting while traversing requires list_for_each_entry_safe — it caches next in advance, whereas continuing with the plain version after a delete is a use-after-free.',
              'Finding the door plates inside amdgpu: amdgpu_vm sorts BOs into states with multiple lists (idle/evicted/moved/invalidated — the BO state machine is literally "which list am I on"); TTM\'s LRU eviction scan is a list traversal; fence callback lists and ctx entity lists are the same story. When you hit list_for_each_entry while reading driver code, the first move is always to look at the third argument (the member name), then find that list_head member\'s comment in the host struct definition — that is where the semantics of the list are written down.',
              'Companion drills (/code-lab): k-01 (container_of from scratch), k-02 (the four core ops of the sentinel circular list), k-03 (list_for_each_entry traversal and _safe removal) — do the trio and this lesson’s list API upgrades from "can read" to "can write".',
            ],
            keyPoints: [
              'Intrusive: the list_head is embedded in the host struct — zero allocation, O(1) removal, one object on many lists simultaneously.',
              'list_entry = container_of; list_for_each_entry makes the loop variable the host pointer directly.',
              'Doubly linked circular; the emptiness test is head->next == head; list_del writes poison values against misuse, and reusable nodes need list_del_init.',
              'Deleting during traversal requires the _safe variant (caches next in advance), otherwise use-after-free.',
              'The amdgpu BO state machine = "which list is it on": idle/evicted/moved/invalidated.',
            ],
          },
          diagram: {
            title: 'Intrusive list: the node lives inside the BO',
            content: `LIST_HEAD(moved)          ┌──────────────┐
   head ◀──────────────────┤ prev    next ├───▶ (back to head)
    │                      │  list_head   │
    │   ┌─ amdgpu_bo_va ───┼──────────────┼───┐
    ▼   │  base.bo  ...    │ ← vm_status  │   │
        │                  └──────────────┘   │
        └─────────────────────────────────────┘
container_of(node address, struct amdgpu_bo_va, vm_status)
                = address of the host BO_VA
Traverse: list_for_each_entry(bo_va, &vm->moved, vm_status)
        → bo_va directly usable, no hand-written container_of`,
            caption: 'The node (list_head) is a member of the host struct; the list strings nodes together, and container_of restores each node to its host. A host embedding N list_heads can be on N lists at once.',
          },
          codeWalk: {
            title: "amdgpu_vm's moved list: the state machine in action",
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c (excerpt, simplified)',
            code: `/* Host struct: one BO-to-VM mapping */
struct amdgpu_bo_va {
	struct amdgpu_vm_bo_base base;
	/* State node: which vm list it hangs on right now */
	struct list_head vm_status;
	/* ... */
};

/* BO was moved → page tables need updating; hang it on the moved list */
static void amdgpu_vm_bo_moved(
		struct amdgpu_vm_bo_base *base)
{
	struct amdgpu_bo_va *bo_va =
		container_of(base, struct amdgpu_bo_va, base);
	spin_lock(&base->vm->status_lock);
	list_move(&bo_va->vm_status,
		  &base->vm->moved);      /* new list = new state */
	spin_unlock(&base->vm->status_lock);
}

/* Before submit: process every "moved" BO, update its page-table mapping */
int amdgpu_vm_handle_moved(struct amdgpu_device *adev,
			   struct amdgpu_vm *vm, ...)
{
	struct amdgpu_bo_va *bo_va, *next;

	/* _safe: the loop body moves nodes to other lists */
	list_for_each_entry_safe(bo_va, next,
				 &vm->moved, vm_status) {
		r = amdgpu_vm_bo_update(adev, bo_va, ...);
		/* update done → bo_va moves to the idle list */
	}
	return 0;
}`,
            explanation:
              'Three idioms in one frame: list_move performs "unhook from the old list, hang on the new one" in a single step (the atomic expression of a BO state transition); the traversal uses _safe because the loop body moves nodes around; and the list operations are protected by a spinlock — the list macros themselves carry no locking, concurrency safety is the caller\'s responsibility (expanded in lesson 6). This code also answers the earlier module\'s foreshadowed question: after eviction, how do the page tables catch up? The answer is the moved list + handle_moved.',
          },
          miniLab: {
            title: 'Implement the kernel list in 30 lines, then manage two BO state lists with it',
            objective: 'Hand-implement the core list_head macros and experience "one object on two lists at the same time".',
            language: 'c',
            code: `#include <stdio.h>
#include <stddef.h>
struct list_head { struct list_head *prev, *next; };
#define LIST_HEAD_INIT(n) { &(n), &(n) }
#define container_of(p, T, m) \\
    ((T *)((char *)(p) - offsetof(T, m)))
#define list_entry(p, T, m) container_of(p, T, m)
#define list_for_each_entry(pos, head, m)               \\
    for (pos = list_entry((head)->next, typeof(*pos), m); \\
         &pos->m != (head);                              \\
         pos = list_entry(pos->m.next, typeof(*pos), m))

static void list_add_tail(struct list_head *n,
                          struct list_head *h)
{
    n->prev = h->prev; n->next = h;
    h->prev->next = n; h->prev = n;
}

struct bo {
    int id; size_t size;
    struct list_head lru;      /* list 1: eviction LRU */
    struct list_head vm_status;/* list 2: VM state     */
};`,
            steps: [
              "Complete the skeleton: implement list_del (unlink + point the node's own pointers at NULL for easy observation) and INIT_LIST_HEAD",
              'In main create 3 bos, list_add_tail all of them onto the lru list, then hang 2 of them additionally on a moved list — the same object on two lists',
              'Traverse both lists with list_for_each_entry printing the ids, confirming they do not interfere with each other',
              'Deliberately list_del the current node inside a plain list_for_each_entry loop and keep going; observe the crash/endless loop; then fix it with a _safe version you implement yourself (cache next in advance)',
              'Compare: open include/linux/list.h on elixir and log the differences between your implementation and the kernel version (poison values, WRITE_ONCE)',
            ],
            expectedOutput:
              "The two lists traverse independently, each printing the correct id set; the delete-while-iterating loop without _safe segfaults or loops forever (depending on how you poison); the _safe version passes cleanly. The log records the kernel version's two hardening points: LIST_POISON poison values + WRITE_ONCE against tearing.",
            hint: 'offsetof lives in <stddef.h>; typeof is a GNU extension, available by default in gcc/clang.',
          },
          debugExercise: {
            title: 'The cleanup function crashes intermittently at the second node',
            language: 'c',
            question: 'This "free every BO on the list" function crashes whenever the list length is ≥2. Point out the root cause and one more hidden problem.',
            buggyCode: `void broken_free_all(struct my_vm *vm)
{
	struct my_bo *bo;

	list_for_each_entry(bo, &vm->bo_list, node) {
		list_del(&bo->node);
		kfree(bo);        /* frees the whole host */
	}

	/* casually reuse the head node to mean "already emptied" */
	vm->bo_list.next = NULL;
}`,
            hint: 'How does list_for_each_entry find the next node each round? What just happened to the memory it reads? And do the last two lines represent an "empty list" the way the kernel convention does?',
            answer:
              'Root cause: each round the loop macro advances through bo->node.next, but the loop body just kfree\'d bo — the next round reads the next pointer out of freed memory, a textbook use-after-free; with KASAN/ASan on it is caught every time, without them it is intermittent crashes or silent out-of-bounds. Fix: list_for_each_entry_safe(bo, next, &vm->bo_list, node) — the macro caches next before the free. Hidden problem: setting next to NULL violates the kernel\'s empty-list convention — an empty list is head->next == head (pointing at itself); any later list_empty check or list_add will crash on the NULL; after emptying, INIT_LIST_HEAD(&vm->bo_list) is what belongs there. Extra reminder: in a real driver this list is most likely lock-protected as well — hold the lock across the whole delete-while-traversing, otherwise a concurrent list_add races your kfree.',
          },
          interviewQ: {
            question: 'Why are kernel lists designed to be intrusive (list_head embedded in the host) instead of container-holds-elements like std::list? Give one cost and one benefit each.',
            difficulty: 'medium',
            hint: 'For benefits talk allocation, multi-list membership, O(1) removal; for costs talk type safety and "the host must reserve a member".',
            answer:
              'Benefits: (1) zero extra allocation — the node is part of the host, list operations can never fail, which matters enormously in a kernel where allocation can fail and failure must be handled; (2) one object can be on arbitrarily many lists at once (embed as many list_heads as lists you join) — a BO simultaneously on the LRU list and a VM state list is the norm, while a container design would either copy or add a layer of indirection; (3) given the host, it can unlink itself in O(1), no traversal to find its position first. Costs: (1) no type safety — list_head itself is untyped, and writing the wrong type/member in container_of mostly does not make the compiler complain; naming discipline and review are the backstop; (2) intrusiveness — the host struct must reserve the member, and third-party types cannot go on a list directly; (3) lifetime is fully manual: the node does not manage host memory (there is no destructor concept), the use-after-free risk is yours to carry. One-sentence summary: the kernel trades type safety for determinism (no allocation, no failure path) — the through-line trade of kernel C.',
            amdContext: "AMD kernel-team interviews often use amdgpu_vm's state lists as a live code-reading question; proactively stating that \"the BO state machine = which list it is on\" and pointing out where the _safe variant is required shows you have actually read the code rather than memorized concepts.",
          },
        },
        {
          id: 'cc-kernel-3',
          number: '0.7.3.3',
          title: 'Macro Hygiene: do-while(0), ARRAY_SIZE & Designated Init',
          titleEn: 'Macro Hygiene: do-while(0), ARRAY_SIZE & Designated Init',
          duration: 18,
          tags: ['kernel-C', 'macros', 'ARRAY_SIZE', 'designated-initializers'],
          concept: {
            summary:
              'The kernel uses macros heavily and has established a set of "hygiene rules" for them: wrap multi-statement macros in do{...}while(0), parenthesize every parameter and stay alert to repeated evaluation, use ARRAY_SIZE instead of hand-written division, and write ops tables exclusively with C99 designated initializers. Behind every one of these rules is a class of real accidents.',
            explanation: [
              'do{...}while(0) solves the classic accident of "a multi-statement macro falling apart under if": with #define CLEANUP() free(a); free(b), inside if (err) CLEANUP(); only free(a) is governed by the if while free(b) runs unconditionally. Wrapped in do{...}while(0), the macro becomes syntactically a single statement, safely takes a trailing semicolon, and slots into if/else without breaking structure. Every multi-statement macro gets it, unconditionally — a hard requirement in kernel review.',
              "Repeated parameter evaluation is the second accident class: #define MAX(a,b) ((a)>(b)?(a):(b)) evaluates i++ twice in MAX(i++, j). The kernel's min()/max() use statement expressions (the GNU extension ({ ... })) to store the arguments into locals before comparing, and use type-check macros to reject signed/unsigned mixed comparisons. Your discipline when writing your own macros: either guarantee each parameter appears exactly once, or switch to a static inline function (type-checked, no repeated evaluation, zero cost after inlining — the kernel style document explicitly prefers the latter).",
              'ARRAY_SIZE(arr) expands to sizeof(arr)/sizeof((arr)[0]), but the kernel version adds a __must_be_array check: once an array passed into a function has decayed to a pointer, sizeof(pointer)/sizeof(element) yields an absurd number that still compiles — the kernel version makes that misuse fail compilation outright. Use it whenever you traverse a fixed table (IP block lists, register init tables); a hand-written length constant sooner or later falls out of sync with the array itself.',
              'C99 designated initializers (.field = value) are the standard way to write ops tables: field names are explicit, order does not matter, and omitted members are zeroed automatically (function pointers become NULL — check for NULL before the call and you get "optional callbacks"). Contrast positional initialization: add one field to the struct and every positional initializer shifts out of place — the hundreds of funcs tables across amdgpu can only evolve safely thanks to designated initializers. This also explains why kernel structs can grow fields frequently without blowing up the whole tree.',
              'Companion drills (/code-lab): k-01’s container_of macro is macro hygiene in concentrate (parenthesized parameters, the char* hop); c-07’s static match table and c-14’s ops tables both lean on designated initializers — watch how those details fence off subtle bugs as you solve.',
            ],
            keyPoints: [
              'Multi-statement macros must be do{...}while(0): the macro becomes a single statement and does not fall apart under if/else.',
              'Macro parameters get re-evaluated: MAX(i++, j) double-increments; kernel min/max dodge it with statement expressions — if a static inline can do the job, skip the macro.',
              'ARRAY_SIZE carries __must_be_array: using it on a pointer fails compilation outright — safer than hand-written sizeof division.',
              'Designated initializers: order-independent, defaults zeroed, adding fields never mis-slots — the survival basis of ops/funcs tables.',
              'likely/unlikely are branch-prediction hints (__builtin_expect); use them only on hot paths with data behind them.',
            ],
          },
          diagram: {
            title: 'Anatomy of the two macro accident classes',
            content: `Accident 1: multi-statement macro falls apart
#define CLEANUP() free(a); free(b)
if (err)
    CLEANUP();
After expansion:
if (err)
    free(a);      ← only this one is governed by the if!
free(b);          ← runs unconditionally, double free scheduled

Accident 2: repeated parameter evaluation
#define MAX(a,b) ((a)>(b)?(a):(b))
v = MAX(i++, j);
After expansion:  ((i++)>(j)?(i++):(j))
              ↑ i may be incremented twice

Vaccines:  do{...}while(0)  |  ({statement expression})  |  static inline`,
            caption: 'Behind each hygiene rule is a class of real accidents. Expanding the macro and reading the expansion line by line is the only reliable way to diagnose a macro bug (gcc -E).',
          },
          codeWalk: {
            title: "amdgpu's ops tables: designated initializers + ARRAY_SIZE in action",
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c (excerpt, simplified)',
            code: `/* Designated initializers: explicit names, any order, unlisted fields = NULL */
static const struct amdgpu_ring_funcs
gfx_v11_0_ring_funcs_gfx = {
	.type		= AMDGPU_RING_TYPE_GFX,
	.align_mask	= 0xff,
	.nop		= PACKET3(PACKET3_NOP, 0x3FFF),
	.get_rptr	= gfx_v11_0_ring_get_rptr_gfx,
	.get_wptr	= gfx_v11_0_ring_get_wptr_gfx,
	.set_wptr	= gfx_v11_0_ring_set_wptr_gfx,
	.emit_ib	= gfx_v11_0_ring_emit_ib_gfx,
	.emit_fence	= gfx_v11_0_ring_emit_fence,
	/* callbacks not listed are NULL automatically → callers check and skip */
};

/* ARRAY_SIZE for traversing a fixed table: length always in sync with the array */
static const u32 golden_settings_gc_11_0[] = {
	/* register,  mask,  value triplets... */
};

static void gfx_v11_0_init_golden_registers(
		struct amdgpu_device *adev)
{
	soc15_program_register_sequence(adev,
		golden_settings_gc_11_0,
		ARRAY_SIZE(golden_settings_gc_11_0));
}`,
            explanation:
              'You saw the usage side of this ring_funcs table in the GPU architecture module (set_wptr ringing the doorbell) — now you see the definition side: designated initializers let a table with 40-plus callback fields fill in only what it needs, and adding a new callback field disturbs no existing table. The ARRAY_SIZE usage for golden registers is a template-grade convention: the table and its length can never drift apart.',
          },
          miniLab: {
            title: 'Trigger both macro accident classes yourself, then fix them with the hygiene rules',
            objective: 'See through macro expansion with gcc -E and build the "read the expansion" debugging instinct.',
            language: 'c',
            code: `#include <stdio.h>
#define SWAP_BAD(T, a, b) T t = (a); (a) = (b); (b) = t
#define SWAP_OK(T, a, b) \\
    do { T t = (a); (a) = (b); (b) = t; } while (0)
#define MAX_BAD(a, b) ((a) > (b) ? (a) : (b))

int main(void)
{
    int x = 1, y = 2;
    if (x < y)
        SWAP_BAD(int, x, y);   /* compile-time or semantic blast site */
    printf("%d %d\\n", x, y);

    int i = 5, j = 3;
    int m = MAX_BAD(i++, j);   /* how many times does i increment? */
    printf("i=%d m=%d\\n", i, m);
    return 0;
}`,
            steps: [
              'Guess the output first, then compile and run to compare (if SWAP_BAD gives a compile error, understand from the message what happened after the if)',
              "Run gcc -E lab.c | tail -20 and read both macro expansions line by line, marking which line escaped the if's control and how many times i++ appears",
              'Replace SWAP_BAD with SWAP_OK to verify the fix; rewrite MAX_BAD as the GNU statement-expression version ({ typeof(a) _a=(a); typeof(b) _b=(b); _a>_b?_a:_b; }) and verify i increments only once',
              'Add an ARRAY_SIZE experiment: pass an array into a function as an argument, compute sizeof(arr)/sizeof(arr[0]) inside, and observe the absurd value you get after decay to pointer',
              'Read the kernel min() implementation in include/linux/minmax.h on elixir, compare it with your statement-expression version, and log the difference (type checking)',
            ],
            expectedOutput:
              'SWAP_BAD under the if either fails to compile (dangling else) or swaps incompletely; gcc -E clearly shows the free-style statements escaping the if and i++ appearing twice (i=7). The statement-expression version gives i=6, m=5. The in-function sizeof division yields a wrong length tied to the element size.',
            hint: 'The -E output is long; locate with | grep -A3 main or tail. Statement expressions are a GNU extension, fine to use in kernel code.',
          },
          debugExercise: {
            title: 'Why did only half of the register init table get written?',
            language: 'c',
            question: 'This init code configures only part of the registers on real hardware, and the logging macro occasionally scrambles the error path. Find the three macro/initialization problems.',
            buggyCode: `#define LOG_ERR(fmt, ...) \\
	printk("myGPU: " fmt, ##__VA_ARGS__); \\
	dev->err_count++

static const struct reg_init table[] = {
	{ REG_A, 0xffffffff, 0x1 },
	{ REG_B, 0x0000ff00, 0x2 },
	/* ... 24 entries total ... */
};
#define TABLE_LEN 16   /* "16 for now, remember to update later" */

int init_regs(struct my_dev *dev,
              const struct reg_init *t)
{
	for (int i = 0; i < TABLE_LEN; i++)
		write_masked(dev, t[i]);

	if (check_failed(dev))
		LOG_ERR("init failed\\n");
	else
		return 0;      /* compiler: which if does this else match? */
	return -EIO;
}`,
            hint: 'Between the 24-entry table and the constant 16, which one is lying? How many statements is LOG_ERR? What happens when it sits between an if and an else?',
            answer:
              'Problem one: the hand-written TABLE_LEN=16 has drifted from the actual 24-entry table — the last 8 registers are never written; this is exactly why ARRAY_SIZE(table) exists (and note the function receives a pointer t: ARRAY_SIZE must be applied to the array object at its definition site/translation unit, with the length passed into the function). Problem two: LOG_ERR is "two statements wearing no clothes" — after expansion, if (check_failed) governs only the printk while dev->err_count++ runs unconditionally; worse, the following else now sits right after err_count++, which is either a syntax error or complete semantic scrambling. Fix: wrap the macro body in do{...}while(0). Problem three (design level): a "remember to change it later" comment is an appointment slip for an accident — the constant and the data must be generated from the same source (ARRAY_SIZE or code generation); relying on human memory always blows up. Bonus point: printk should carry a log level (KERN_ERR); the kernel actually uses the dev_err/drm_err families.',
          },
          interviewQ: {
            question: 'Why does kernel coding style prefer static inline functions over macros? In which situations must you still use a macro?',
            difficulty: 'medium',
            hint: 'Type checking / single evaluation / debuggability vs scenarios needing to operate on types themselves, string pasting, or compile-time constants.',
            answer:
              'Compared with a macro, static inline gives you: type-checked parameters (a wrong type is a compiler error rather than a silent conversion), each argument evaluated exactly once (no i++ double-increment trap), a real symbol you can set a breakpoint on, and adherence to scope rules; with optimization on it inlines just the same, so there is no performance difference. So anything expressible as a function should be a function — kernel coding-style says so in writing. Situations that still require macros: (1) operating on the "type" itself — container_of, ARRAY_SIZE, offsetof, anything needing typeof/sizeof applied to an expression or type; (2) preprocessor-time stringification/pasting (#, ##) — register-name pasting in REG_GET_FIELD, tracepoint definitions; (3) needing to be a compile-time constant expression (array lengths, case labels, static assertions); (4) forwarding varargs to the printk family. Rule of thumb: macros only do what the preprocessor alone can do, everything else goes to inline functions — and when you do write a macro, the trio of do-while(0), all parameters parenthesized, single evaluation is non-negotiable.',
            amdContext: 'A high-frequency review pushback in the kernel community is "why is this macro not an inline function". If an amdgpu interview shows you the RREG32/WREG32 macro family, the point under test is usually why they must be macros (register-name pasting) and how the soc15 variants do offset computation.',
          },
        },
        {
          id: 'cc-kernel-4',
          number: '0.7.3.4',
          title: 'Error Handling: ERR_PTR, Layered goto, Overflow Checks',
          titleEn: 'Error Handling: ERR_PTR, Layered goto, Overflow Checks',
          duration: 22,
          tags: ['kernel-C', 'ERR_PTR', 'goto-cleanup', 'overflow'],
          concept: {
            summary:
              'The kernel has no exceptions; error handling rests entirely on three idiom sets: pointer-returning functions hide error codes inside the pointer value with ERR_PTR/IS_ERR; multi-step initialization rolls back in reverse order with layered goto; and every size computation on values from users or hardware passes through check_*_overflow/kmalloc_array against overflow. All three are hard review standards.',
            explanation: [
              'ERR_PTR works by an address-space convention: the kernel guarantees that the topmost page of virtual addresses (the last 4095 values) will never be a valid pointer, so values like (void *)-EINVAL can safely serve as "error codes disguised as pointers". ERR_PTR(-EINVAL) encodes, IS_ERR(p) tests (does p fall in the top page), PTR_ERR(p) decodes back to an int. Pointer-returning functions thereby gain failure-with-a-reason: p = amdgpu_bo_create_kernel(...); if (IS_ERR(p)) return PTR_ERR(p);. The division of labor with NULL: NULL means "absent, but not an error" (a lookup miss), ERR_PTR means "failed, with a reason" — a function picks exactly one and writes it into its comment, callers check per the convention, and mixing the two is a bug hatchery.',
              'You saw the embryo of goto layered cleanup in cc-c-6; here we complete the engineering details. The core invariant: labels are laid out in the reverse order of resource acquisition, and the err_N label means "steps 1..N succeeded; roll back starting from step N". On failure you goto "the next label of your own layer" — step 3 failing jumps to err_2 (rolling back steps 1 and 2), not err_3. Common variants: a shared unwind label (some drivers use amdgpu\'s reverse-order ip_block fini pattern); when the success and error paths share a tail, an out: label plus a ret variable. There is exactly one acceptance criterion: on every failure path, every resource acquired so far is released exactly once.',
              "Overflow checking targets a class of real vulnerabilities: in kmalloc(count * size, GFP_KERNEL) where count comes from userspace, the multiplication can wrap around to a small number — the allocation succeeds but is far smaller than expected, and the writes that follow are a heap overflow (a large share of historical CVEs belong to this class). The defense toolkit: kmalloc_array(count, size, flags) (checks the multiplication internally, returns NULL on overflow), struct_size(ptr, member, count) (computes the safe size of \"struct + flexible array\"), check_add_overflow/check_mul_overflow (general arithmetic checks that return true on overflow). The discipline: any value from userspace, firmware or hardware registers must pass a check before joining size/offset arithmetic — amdgpu's ioctl entry points are full of this code.",
              'Chain the three into one template: validate parameters at entry (overflow checks included) → acquire resources step by step, each failure goto-ing to its layer → return 0 on success → the label area frees in reverse order. This skeleton recurs in every amdgpu init/create function; reading one thoroughly equals reading a hundred. A C++ cross-reference in passing: this manual discipline is exactly the thing RAII automates away (covered in the cc-cpp group) — only when you understand goto cleanup do you truly understand what RAII solves.',
              'Companion drills (/code-lab): k-06 (the full ERR_PTR/PTR_ERR/IS_ERR kit plus an application), k-07 (a three-resource goto ladder with failure injection), c-10 (an overflow-predicting parser) — each piece of the error-handling trio has its own dedicated exercise.',
            ],
            keyPoints: [
              'ERR_PTR: error codes hide in the top page of pointer space; IS_ERR tests, PTR_ERR decodes; NULL = absent-not-an-error, ERR_PTR = failed-with-a-reason.',
              'Layered goto: labels in reverse order; err_N = "roll back the first N steps"; on failure jump to the next label of your own layer.',
              'Invariant: on every failure path, each acquired resource is released exactly once — review checks exactly this.',
              'User-controllable count*size must be overflow-checked: kmalloc_array/struct_size/check_mul_overflow.',
              'Template: validate (incl. overflow) → acquire step by step + goto → return 0 → reverse-order label area.',
            ],
          },
          diagram: {
            title: 'Layered goto: each failure jumps to its own rollback entry point',
            content: `int my_init(...)
{
    r = alloc_A();  if (r) return r;     ── step 1
    r = alloc_B();  if (r) goto err_a;   ── step 2
    r = alloc_C();  if (r) goto err_b;   ── step 3
    return 0;             success: skips the label area
                                       │
err_b:  free_B();   ◀── step 3 failure lands here │ reverse
err_a:  free_A();   ◀── step 2 failure lands here │ order
    return r;                                     ▼ release

ERR_PTR address encoding:
0x0000...0000 ─ valid pointers ─ 0xFFFF...F000 ─ error codes (4095)
p = ERR_PTR(-EINVAL) → IS_ERR(p)=true → PTR_ERR(p)=-22`,
            caption: 'Top: the goto ladder — label order mirrors resource acquisition. Bottom: the ERR_PTR address-space convention; the top page never serves as a valid address.',
          },
          codeWalk: {
            title: 'An amdgpu-style create function: all three idioms in one frame',
            language: 'c',
            file: 'amdgpu idiomatic pattern (simplified from the amdgpu_bo_create/ctx paths)',
            code: `struct my_ctx *my_ctx_create(struct my_dev *dev,
                             u32 count)   /* from userspace */
{
	struct my_ctx *ctx;
	size_t bytes;
	int r;

	/* 1. Overflow check: count is user-supplied */
	if (check_mul_overflow((size_t)count,
			       sizeof(*ctx->slots), &bytes))
		return ERR_PTR(-EINVAL);

	ctx = kzalloc(sizeof(*ctx), GFP_KERNEL);
	if (!ctx)
		return ERR_PTR(-ENOMEM);

	/* 2. Safe allocation equivalent to kmalloc_array */
	ctx->slots = kzalloc(bytes, GFP_KERNEL);
	if (!ctx->slots) {
		r = -ENOMEM;
		goto err_free_ctx;
	}

	r = my_hw_bind(dev, ctx);        /* 3. hardware-side registration */
	if (r)
		goto err_free_slots;

	return ctx;                      /* success exit */

err_free_slots:
	kfree(ctx->slots);
err_free_ctx:
	kfree(ctx);
	return ERR_PTR(r);               /* pointer function reports the error code */
}
/* Caller:
 * ctx = my_ctx_create(dev, n);
 * if (IS_ERR(ctx)) return PTR_ERR(ctx);  */`,
            explanation:
              'Note three details: the function returns a pointer, so errors are wrapped in ERR_PTR (the caller unwraps with IS_ERR/PTR_ERR); the two labels are strictly reverse-ordered and their names describe what they free; and the multiplication passes check_mul_overflow before any allocation happens. This 40-line skeleton is the common shape of hundreds of create/init functions across amdgpu.',
          },
          miniLab: {
            title: 'Prove your cleanup paths leak-free with fault injection',
            objective: 'Write a three-step init with all-path fault injection, and verify every error path with ASan.',
            language: 'c',
            code: `/* Userspace ERR_PTR teaching clone */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#define MAX_ERRNO 4095
#define ERR_PTR(e)  ((void *)(long)(e))
#define IS_ERR(p)   ((unsigned long)(p) \\
                     >= (unsigned long)-MAX_ERRNO)
#define PTR_ERR(p)  ((long)(p))

static int fail_at;   /* fault-injection switch: 1..3 */
static void *try_alloc(int step, size_t n)
{
    if (step == fail_at) return NULL;
    return calloc(1, n);
}`,
            steps: [
              'Implement create() on the skeleton: three try_alloc steps (simulating ctx/slots/hw); any failure walks the layered goto and returns ERR_PTR(-ENOMEM)',
              'In main loop fail_at = 0..3, calling it once each: 0 is the success path (remember to free normally at the end), 1-3 are the three error paths',
              'Compile and run with gcc -fsanitize=address — ASan staying silent means every path is leak-free; delete one kfree on purpose to see what an ASan leak report looks like',
              'Add an overflow experiment: size_t bytes = count * 8 with count = SIZE_MAX/4 to trigger the wraparound; print bytes and feel "the allocation succeeds but is absurdly small"; then fix it with __builtin_mul_overflow',
              'Rewrite "each resource released exactly once on every path" into your own three-item review checklist and log it',
            ],
            expectedOutput:
              'fail_at=0 prints success; 1-3 each return a pointer for which IS_ERR is true, with no ASan leak reports; after deleting a kfree, ASan pinpoints the leaked allocation site. The overflow experiment prints a tiny bytes value — the crime scene of a heap-overflow vulnerability, first-hand.',
            hint: 'Userspace has no top-page protection; this ERR_PTR clone exists purely to practice the API shape — the real semantics hold only in kernel address space.',
          },
          debugExercise: {
            title: 'This init function hides three error-path bugs',
            language: 'c',
            question: "Review this code against the lesson's invariant: which three paths violate \"released exactly once\" or the ERR_PTR convention?",
            buggyCode: `struct ring *ring_create(struct dev *d, u32 n_dw)
{
	struct ring *r;
	int err;

	r = kzalloc(sizeof(*r), GFP_KERNEL);
	if (!r)
		return NULL;                  /* A */

	r->buf = kmalloc(n_dw * 4, GFP_KERNEL); /* B */
	if (!r->buf)
		goto err_all;

	err = hw_register(d, r);
	if (err)
		goto err_buf;

	r->wq = create_workqueue("ring");
	if (!r->wq) {
		err = -ENOMEM;
		goto err_all;                 /* C */
	}
	return r;

err_buf:
	kfree(r->buf);
err_all:
	kfree(r->buf);
	kfree(r);
	return ERR_PTR(err);
}`,
            hint: 'A: does the caller get NULL or ERR_PTR? B: where does n_dw come from? C: when jumping to err_all, what state is hw_register in, and how many times does buf get freed?',
            answer:
              'Bug A (convention chaos): the first failure returns NULL while every other path returns ERR_PTR(err) — the caller cannot cope: if (IS_ERR(r)) misses the NULL, if (!r) misses the ERR_PTR. Unify on ERR_PTR(-ENOMEM). Bug B (overflow): in n_dw * 4, n_dw is a u32, and for n_dw > 0x3FFFFFFF the multiplication wraps, allocating far less than expected — use kmalloc_array(n_dw, 4, GFP_KERNEL) or check_mul_overflow first. Bug C (double free + leaked resource): the workqueue failure jumps to err_all — but wait, does control first fall through the err_buf before err_all? No, it jumps straight to err_all, and that creates two problems: first, err_buf\'s kfree(r->buf) is skipped here, yet err_all contains another kfree(r->buf); that looks fine, but the err_buf→err_all path executes two consecutive kfree(r->buf) calls — the hw_register-failure path double-frees; second, on the workqueue failure path hw_register has already succeeded but nobody calls hw_unregister — a resource leak. The correct structure: one label per step in strict reverse order (err_wq→err_hw→err_buf→err_ctx); a catch-all label like err_all is exactly what the layering principle exists to eliminate.',
          },
          interviewQ: {
            question: 'How does the ERR_PTR mechanism stuff an error code into a pointer? Why is doing so safe? When should you return NULL rather than ERR_PTR?',
            difficulty: 'medium',
            hint: 'The top page of addresses is never valid; the IS_ERR test condition; the semantic split between "absent" and "failed".',
            answer:
              'The kernel reserves the topmost 4095 values of the virtual address space (corresponding to -1..-4095, i.e. the range -MAX_ERRNO..-1 cast to unsigned) as illegal addresses that are never mapped, so a negative errno cast to a pointer lands in that range and never collides with any valid pointer. ERR_PTR(err) is just (void *)err; IS_ERR(p) tests (unsigned long)p >= -4095UL; PTR_ERR(p) casts back to long. Safety comes from a double guarantee: at the architecture level the top page is never mapped (a mistaken dereference faults immediately instead of silently reading/writing), and at the convention level errno never exceeds 4095. The NULL vs ERR_PTR split follows the semantics: query-style "not found, and that is not an error" (a lookup miss, an absent optional feature) returns NULL; action-style "tried and failed, the caller needs the reason" returns ERR_PTR. One function uses exactly one convention and states it in its comment; when three states truly must be distinguished there is IS_ERR_OR_NULL, but its presence usually says the interface deserves a redesign.',
            amdContext: 'In amdgpu, dma_fence, gem object lookup and entity acquisition are all ERR_PTR style; when an interview asks you to write a create function, delivering the full trio — return convention + goto ladder + overflow check — essentially clears the kernel-C bar.',
          },
        },
        {
          id: 'cc-kernel-5',
          number: '0.7.3.5',
          title: 'Lifetime Pillars: kref Refcounting & devm Resources',
          titleEn: 'Lifetime Pillars: kref Refcounting & devm Resources',
          duration: 20,
          tags: ['kernel-C', 'kref', 'refcount', 'devm', 'lifetime'],
          concept: {
            summary:
              '"Who is responsible for freeing this" is the hardest question in C. The kernel offers two pillars: shared objects use kref reference counting — the last user triggers release; device-lifetime resources use devm_ management — released automatically in reverse order when the device leaves the stage. amdgpu\'s BOs, fences and ctxs are all kref family, and probe paths use devm heavily.',
            explanation: [
              "Reference counting solves the who-may-free problem for shared objects: a fence is held by the submitter, the waiters and the interrupt handler, and none of them knows whether it is the last one. kref's answer: embed struct kref in the object (internally a refcount_t, an atomic counter with overflow detection) plus three iron rules — (1) before passing the pointer to someone else or storing it, kref_get first; (2) when done, call kref_put(&obj->ref, release); when the count reaches zero the release callback is invoked exactly once, and that is where you kfree; (3) after a put, the pointer counts as invalid immediately — touching it again is a use-after-free. Ownership semantics in one sentence: a reference is a share of ownership, and get/put must pair strictly.",
              'Two high-frequency traps: first, "borrow escape" — a function receives a pointer the caller holds (a borrow) yet stores it into a long-lived structure (say a global list) without a get; after the caller puts, the list holds a dangling pointer. Second, "resurrection after zero" — release has already run while another thread still wants to kref_get; for this, lookup paths must use kref_get_unless_zero (typical of "find the fence in a list" scenarios), which is also why lookup and release usually have to coordinate under the same lock. The value of refcount_t over a bare atomic_t: saturation semantics — on overflow the count pins at a saturation value and WARNs, downgrading the exploitable "counter wraparound causes premature free" class of vulnerabilities to a denial of service.',
              "devm_ (device-managed) is the other pillar, addressing probe/remove symmetry: a driver's probe acquires a dozen kinds of resources (memory, ioremap, interrupts, clocks), any failing step must undo everything before it, and remove has to write the same teardown all over again — two sites that lose sync with ease. devm_kzalloc/devm_ioremap/devm_request_irq hang the resources on struct device's managed list; on probe failure or device removal the framework releases them automatically in reverse order, shrinking the error path from a dozen goto layers down to a plain return.",
              'devm\'s boundaries matter just as much: it fits only resources that "live and die with the device"; shorter-lived ones (a temporary buffer within one ioctl) use plain kmalloc/kfree, and longer-lived ones (objects shared across devices or referenced by userspace, like fences/BOs) use kref — managing those with devm would yank the memory out from under userspace the instant the device is unplugged. Another detail is release order: devm frees in reverse registration order, and manually freeing a devm resource is a future double-free. The rule-of-thumb split: device skeleton devm, shared objects kref, temporary buffers manual — three kingdoms, each minding its own domain.',
              'Companion drills (/code-lab): k-04 (kref_get/put with a release callback recovering the host via container_of), k-11 (the devres cleanup stack — register-and-forget, ported to userspace), c-16 (the manual create/destroy control group) — after all three, the trade-offs across three generations of resource management become self-evident.',
            ],
            keyPoints: [
              'kref three iron rules: get before storing; put(release) when done; the pointer is dead immediately after put.',
              'release runs exactly once at count-zero; lookup paths use kref_get_unless_zero against "resurrection after zero".',
              'refcount_t saturates + WARNs: downgrades counter-wraparound vulnerabilities to DoS — never count with a bare atomic_t.',
              'devm_: resources hang on the device and are auto-released in reverse order on probe failure/removal, killing probe/remove asymmetry bugs.',
              'Three kingdoms: device skeleton devm, cross-lifetime shared objects kref, short-lived temporary buffers manual kmalloc/kfree.',
            ],
          },
          diagram: {
            title: 'The life of a kref: three holders and one release',
            content: `        create fence (count=1, creator holds it)
submitter ───────────┐
  kref_get → count=2 │ waiter
             kref_get → count=3
                      │
submit done kref_put → 2 │
        wait returns kref_put → 1
                creator kref_put → 0 ─▶ release(fence)
                                        └ kfree exactly once
Iron rule: after put ✂ the pointer is void; touch it = use-after-free

devm for contrast:
probe: devm_kzalloc → devm_ioremap → devm_request_irq
        └────── all hang on struct device ──────┘
remove/probe failure: framework auto-frees in reverse order, zero driver code`,
            caption: 'Top: the get/put timeline of three holders; release happens only at the moment of reaching zero. Bottom: devm outsources "reverse-order release" to the device framework.',
          },
          codeWalk: {
            title: 'dma_fence: the kref instance amdgpu uses every day',
            language: 'c',
            file: 'include/linux/dma-fence.h + drivers/dma-buf/dma-fence.c (excerpt, simplified)',
            code: `struct dma_fence {
	struct kref refcount;      /* ← embedded refcount */
	const struct dma_fence_ops *ops;
	/* ... seqno, flags, cb_list ... */
};

/* get: required before storing/passing the pointer */
static inline struct dma_fence *
dma_fence_get(struct dma_fence *fence)
{
	if (fence)
		kref_get(&fence->refcount);
	return fence;
}

/* lookup scenario: the count may be hitting zero → unless_zero */
struct dma_fence *
dma_fence_get_rcu(struct dma_fence *fence)
{
	if (kref_get_unless_zero(&fence->refcount))
		return fence;
	return NULL;   /* it is dying, hands off */
}

/* put: reaching zero triggers release */
void dma_fence_put(struct dma_fence *fence)
{
	if (fence)
		kref_put(&fence->refcount,
			 dma_fence_release);
}
/* amdgpu usage: get before storing a submit-returned fence into
 * a ctx, put once the wait completes; the ring's fence array and
 * drm_sched's dependency tracking follow the same get/put rhythm */`,
            explanation:
              'dma_fence is the "heartbeat" object of the GPU stack (the fence from the GPU architecture module is this very type), and its life and death are managed entirely by kref. Note the get_rcu variant using unless_zero — a fence fished out of a shared structure may be mid-release, and this API turns "resurrecting a dying object" into a safe failure. When you later read amdgpu_ctx.c and amdgpu_sync.c you will see this rhythm everywhere.',
          },
          miniLab: {
            title: 'Clone kref in userspace, then cause and fix a borrow escape',
            objective: 'Implement the kref three iron rules, and witness with ASan the consequences of breaking each one.',
            language: 'c',
            code: `#include <stdio.h>
#include <stdlib.h>
#include <stdatomic.h>

struct kref { atomic_int count; };
struct fence {
    struct kref ref;
    int seqno;
};
static void kref_init(struct kref *k)
{ atomic_store(&k->count, 1); }
static void kref_get(struct kref *k)
{ atomic_fetch_add(&k->count, 1); }
static int kref_put(struct kref *k,
                    void (*release)(struct kref *))
{
    if (atomic_fetch_sub(&k->count, 1) == 1) {
        release(k); return 1;
    }
    return 0;
}`,
            steps: [
              'Complete the release function (container_of back to the fence, then free) and a "waiter" function: on receiving a fence it gets first, puts when done',
              'Normal script: create (count=1) → hand to the waiter (which gets/puts internally) → creator puts → ASan exits clean, printf confirms release printed exactly once',
              'Break iron rule one: the waiter stores the fence into a global array without a get; after the creator puts, read seqno from the array — ASan reports heap-use-after-free; this is the "borrow escape"',
              'Break iron rule three: the creator puts twice — ASan reports a double-free (entered a second time via release)',
              'Look up the saturation behavior of kernel refcount_t (elixir: refcount_warn_saturate) and log one sentence on what it defends against that your bare atomic version does not',
            ],
            expectedOutput:
              'The normal script prints release once with no ASan warnings; the rule-one violation reports use-after-free precisely, pointing at the allocation/free stacks; the rule-three violation reports a double-free. Log conclusion: a bare atomic counter can wrap around and free early (exploitable); refcount_t saturation + WARN turns that into a diagnosable denial of service.',
            hint: 'For container_of use the macro from the cc-kernel-2 lab; ASan compile switches: -fsanitize=address -g.',
          },
          debugExercise: {
            title: "Why does this cache layer occasionally crash in someone else's hands?",
            language: 'c',
            question: 'A colleague wrote a fence cache: "get/put are paired anyway". Under stress testing, other modules hit sporadic use-after-free. Find the two reference-counting errors.',
            buggyCode: `static struct fence *cache[16];
static DEFINE_SPINLOCK(cache_lock);

/* store into the cache: the caller holds one reference to f */
void cache_store(int slot, struct fence *f)
{
	spin_lock(&cache_lock);
	cache[slot] = f;          /* A: just stores the pointer */
	spin_unlock(&cache_lock);
}

/* take from the cache */
struct fence *cache_lookup(int slot)
{
	struct fence *f;

	spin_lock(&cache_lock);
	f = cache[slot];
	spin_unlock(&cache_lock);
	if (f)
		kref_get(&f->ref);    /* B: get outside the lock */
	return f;
}`,
            hint: 'A: does the cache itself count as a holder? What happens once the caller puts later? B: the get happens outside the lock — between the unlock and the get, what can another CPU do?',
            answer:
              'Error A (borrow escape): cache_store stores the pointer into a long-lived array without kref_get — the cache becomes a "shareholder that owns no shares". The caller later legitimately puts its own reference, the count reaches zero, release runs, and cache[slot] dangles from then on; the next lookup hands out freed memory. Fix: kref_get on store (the cache holds one reference of its own), and kref_put the old value when a slot is replaced or cleared. Error B (the window between check and acquisition): lookup does kref_get outside the lock — between spin_unlock and kref_get, another CPU may perform the final put and release completes, so this get increments a counter inside freed memory (use-after-free, plus manufacturing a "resurrected zombie"). Fix: the get must complete inside the lock, and use kref_get_unless_zero: failure means the object is dying — return NULL and let the caller retry or give up. The two errors combined are precisely why dma_fence_get_rcu exists — reference acquisition on the lookup path is the hardest corner of concurrent refcounting.',
          },
          interviewQ: {
            question: "Why is kref_put's release callback triggered by put itself instead of letting callers inspect the count themselves? When should devm_ resources NOT be used?",
            difficulty: 'hard',
            hint: 'For the first half think "the window between deciding and acting"; for the second half think lifetime mismatch in both directions.',
            answer:
              'If the API were "put, then read the count yourself and free at zero", a window opens between "reading zero" and "freeing": another thread could get inside that window (semantically-wrongly resurrecting the object through an old pointer it still holds) or also read zero and free as well (double free). kref_put fuses "decrement, test for zero, trigger release" into one atomic decision point, guaranteeing release runs exactly once and that no legitimate get path exists after zero (paired with kref_get_unless_zero on the lookup side). That is the key design of concurrent ownership: the release decision must complete inside the atomicity of the counter operation. Where devm should not be used: (1) lifetime shorter than the device — temporary buffers within one operation would pile up until device removal under devm, which equals a leak; (2) lifetime longer than the device — objects referenced by userspace or other subsystems (fences, BOs, dma-bufs); devm force-freeing them at hot-unplug yanks memory from under the referents, so these must be kref-managed and allowed to "outlive the device, die a little later"; (3) when the release order has special requirements that differ from reverse registration order. The judgment mantra: is the resource\'s moment of death strictly equal to the device\'s? Only then devm.',
            amdContext: 'GPU hot-unplug (hotplug/unplug) has been a major amdgpu engineering focus in recent years, with piles of patches handling exactly "the device died but userspace still clutches fences/BOs" — when an interview reaches the kref vs devm boundary, citing the hot-unplug example lands squarely on work actually in progress.',
          },
        },
        {
          id: 'cc-kernel-6',
          number: '0.7.3.6',
          title: 'Concurrency Contexts in C: Spinlocks, Mutexes & "May Not Sleep"',
          titleEn: 'Concurrency Contexts in C: Spinlocks, Mutexes & "May Not Sleep"',
          duration: 22,
          tags: ['kernel-C', 'spinlock', 'mutex', 'atomic-context', 'workqueue'],
          concept: {
            summary:
              'Kernel code runs in two kinds of context: process context may sleep; atomic context (interrupt handlers, any period holding a spinlock) absolutely may not. That single line decides every concurrency choice: spinlocks are short and fast and usable in atomic context; mutexes sleep, so process context only; GFP_KERNEL allocations can sleep, so interrupts must use GFP_ATOMIC; and heavy work escapes from interrupts to workqueues. The price of breaking the rules is deadlock or a machine-wide freeze.',
            explanation: [
              'Lay the foundation first: "sleeping" in the kernel means voluntarily yielding the CPU to wait (mutex_lock not getting the lock, kmalloc(GFP_KERNEL) waiting on memory reclaim, msleep waiting on time). Process context (system calls, ioctl, inside a workqueue) has a process identity that can be scheduled away; sleeping is fine. Atomic context has none: an interrupt handler borrows the scene of whoever it interrupted, and while you hold a spinlock other CPUs are busy-waiting on you — sleeping there means deadlock at best (the CPU waiting for your lock never gets it) or the scheduler outright BUGs ("scheduling while atomic"). Before writing each line of driver code, ask first: which kind of context am I in right now?',
              'From that line the two-lock decision tree follows. spinlock: busy-waits (no sleeping), locks and unlocks in nanoseconds, usable in any context — but the critical section must be extremely short (other CPUs are burning power spinning), and nothing inside it may call anything that could sleep. When data is shared with an interrupt, use spin_lock_irqsave (which also disables local interrupts): otherwise, being interrupted while holding the lock by a handler that takes the same lock = single-CPU self-deadlock. mutex: sleeps when it cannot acquire, scheduling someone else — the critical section may be long and may sleep inside (taking another mutex, allocating), but process context only. Rule of thumb: short critical sections that "flip a few pointers/flags" get a spinlock, "a whole stretch of possibly-sleeping complex work" gets a mutex; in amdgpu, fence lists use spinlocks while BO reservation and big-structure init use mutex/dma-resv.',
              "What if an interrupt has heavy work to do? The kernel's standard escape hatch is the workqueue: the interrupt handler performs only minimal first aid (read the status register, acknowledge the interrupt, note what needs doing), then schedule_work throws the heavy lifting to a worker thread — which runs in process context, free to sleep, take mutexes and allocate GFP_KERNEL. amdgpu's rhythm is exactly this: GPU interrupt → amdgpu_irq dispatch → fence processing finishes fast, while major surgery like GPU reset goes entirely through work (amdgpu_device_gpu_recover is triggered by a dedicated work). At the C level note the work pattern: struct work_struct embedded in your struct, container_of in the handler to recover the host — lesson 2's intrusive design all over again.",
              'Get to know the lock-free light weapons too: atomic_t/atomic64_t suit independent counters (statistics, sequence generators) — a single operation is atomic, but a "read-decide-write" combination is not; when you need combined semantics use atomic_cmpxchg or fall back to a lock; refcount_t (last lesson) is its refcounting specialization. Finally, three lines of discipline: declare data together with the lock that protects it and write the comment (/* protected by @lock */); fix the acquisition order of multiple locks (document it, against AB-BA deadlock); and treat code inside a critical section as "borrowed time" — everything that can move out moves out. These rules run through every amdgpu file you are about to read.',
              'Drill note: concurrency primitives cannot be genuinely exercised in a single-threaded judge, but k-05 (ring wptr/rptr) and k-10 (fence seqno wraparound) are the single-threaded skeletons of this lesson’s concurrent structures — digest their memory models first and Module 1’s atomics and locks will go down much easier.',
            ],
            keyPoints: [
              'Two context kinds: process context may sleep; atomic context (interrupts, spinlock held) never — ask "where am I" before every line.',
              'spinlock: busy-wait, any context, critical section must be short and sleepless; shared with interrupts → _irqsave against single-CPU self-deadlock.',
              'mutex: sleeps, process context only, critical section may be long and may sleep — memorize the two-lock decision tree.',
              'Allocation splits by context too: GFP_KERNEL may sleep (process context); atomic context requires GFP_ATOMIC (which can fail — handle it).',
              'The interrupt escape hatch is the workqueue: the interrupt does first aid + schedule_work, heavy work runs in process context — the amdgpu reset pattern.',
            ],
          },
          diagram: {
            title: 'Context decides everything: one decision chart',
            content: `Where am I?
├─ process context (ioctl/syscall/workqueue)
│    may sleep ✓ → mutex ✓  GFP_KERNEL ✓  msleep ✓
│    (but the instant you take a spinlock, you enter ↓)
└─ atomic context (interrupt handler / spinlock held / preempt off)
     may sleep ✗ → spinlock ✓  GFP_ATOMIC ✓
                mutex ✗  GFP_KERNEL ✗  msleep ✗

Heavy work inside an interrupt?
  IRQ handler: read status/ack interrupt (microseconds)
      └─ schedule_work(&dev->reset_work)
             └─ worker thread (process context): can sleep/lock/allocate
Sharing data with an interrupt?
  spin_lock_irqsave(&lock, flags)  ← prevents single-CPU self-deadlock`,
            caption: 'This chart is the whole lesson. Print it and pin it to the wall — until "can I sleep right now" becomes the instinctive question before writing every function.',
          },
          codeWalk: {
            title: "amdgpu's interrupt→work rhythm: first aid separated from surgery",
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/ (fence/reset paths, excerpt, simplified)',
            code: `/* ── Interrupt side: atomic context, first aid only ── */
int amdgpu_fence_process(struct amdgpu_ring *ring)
{
	struct amdgpu_fence_driver *drv = &ring->fence_drv;
	u32 seq;

	seq = le32_to_cpu(*drv->cpu_addr); /* read completed seqno */
	/* wake waiters: wake_up does not sleep, atomic-context safe */
	if (unlikely(seq != drv->sync_seq))
		wake_up_all(&drv->fence_queue);
	return 0;
}

/* hang detection (timer/interrupt path) sees a timeout: dare not reset here */
static void amdgpu_fence_fallback(struct timer_list *t)
{
	struct amdgpu_ring *ring =
		from_timer(ring, t, fence_drv.fallback_timer);
	if (amdgpu_fence_process(ring))
		return;
	/* queue the heavy work: hand it to process context */
	schedule_work(&ring->adev->reset_work);
}

/* ── Work side: process context, major surgery allowed ── */
static void amdgpu_reset_work_handler(
		struct work_struct *work)
{
	struct amdgpu_device *adev = container_of(
		work, struct amdgpu_device, reset_work);

	/* Here we may: mutex_lock, GFP_KERNEL allocations,
	 * wait on fences, stop the scheduler, re-init IP blocks...
	 * — the full GPU reset; even minutes-long is fine */
	amdgpu_device_gpu_recover(adev, NULL, &reset_ctx);
}`,
            explanation:
              'Read the three-beat rhythm three times: the interrupt does nothing but read the seqno + wake_up (neither sleeps); on seeing that a reset is needed it does not act — schedule_work enqueues and leaves; the work handler performs the full surgery at leisure in process context. container_of recovers adev from the work_struct — the intrusive design\'s third appearance. This "first aid / surgery separation" pattern is the master motif of interrupt design in every device driver.',
          },
          miniLab: {
            title: 'Context-judgment bootcamp: life-or-death verdicts on 12 snippets',
            objective: 'Drill "can I sleep right now" into a reflex — no AMD hardware needed, pen and paper suffice.',
            steps: [
              'For each snippet below rule legal/illegal and justify it: ① mutex_lock in an interrupt handler ② spin_lock in an interrupt handler ③ kmalloc(GFP_KERNEL) while holding a spinlock ④ kmalloc(GFP_ATOMIC) while holding a spinlock ⑤ msleep while holding a mutex ⑥ mutex_lock on another lock while holding a mutex',
              'Continue: ⑦ mutex_lock in a workqueue handler ⑧ schedule_work from an interrupt ⑨ data held under spin_lock (not irqsave) that an interrupt handler also touches ⑩ GFP_KERNEL on the ioctl path ⑪ wake_up in an interrupt ⑫ copy_from_user while holding a spinlock',
              'For every "illegal" case write the correct alternative (e.g. ① → first aid + schedule_work; ⑨ → spin_lock_irqsave)',
              'Verify your judgment against two pieces of real code on elixir: why amdgpu_fence_process is lock-free and allocation-free throughout; why amdgpu_device_gpu_recover can mutex/wait right from the start',
              'Condense the 6 verdict rules into your own cheat card (context × allowed-operations matrix) and log it',
            ],
            expectedOutput:
              'Verdicts: ①✗ ②✓ ③✗ ④✓ ⑤✗ (legal but a terrible practice — sleeping inside a mutex region stalls every lock waiter; refactor unless well justified) ⑥✓ (mind lock ordering) ⑦✓ ⑧✓ ⑨✗ ⑩✓ ⑪✓ ⑫✗ (may page-fault and sleep). Cheat-card core, two lines: atomic context = no sleeping, no GFP_KERNEL, no mutex; shared with an interrupt = irqsave.',
            hint: '⑫ is the sneakiest: copy_from_user sleeps on a fault against an unmapped page — touching user memory while holding a spinlock is a classic accident.',
          },
          debugExercise: {
            title: 'This interrupt handler is a menu of deadlocks',
            language: 'c',
            question: 'A newcomer\'s "efficient" interrupt handler freezes the whole system after a few minutes of running. Use this lesson\'s decision chart to find the four context violations.',
            buggyCode: `static irqreturn_t my_gpu_irq(int irq, void *arg)
{
	struct my_dev *dev = arg;
	u32 status;

	mutex_lock(&dev->hw_lock);            /* A */
	status = read_status(dev);

	if (status & ERROR_BIT) {
		/* record detailed error info */
		dev->err_log = kmalloc(4096,
				       GFP_KERNEL);  /* B */
		fill_error_log(dev->err_log, dev);

		/* do the GPU reset right here */
		do_full_gpu_reset(dev);       /* C: internally
			mutex_lock + msleep(100)×N */
	}

	spin_lock(&dev->list_lock);           /* D:
		also taken with plain spin_lock on non-IRQ paths */
	list_add_tail(&dev->ev.node, &dev->events);
	spin_unlock(&dev->list_lock);

	mutex_unlock(&dev->hw_lock);
	return IRQ_HANDLED;
}`,
            hint: 'Walk each line through the decision chart: interrupt = atomic context. Which rule do A/B/C each collide with? D looks legal on its own, but combined with "non-interrupt paths take this lock too", think about what that side is missing.',
            answer:
              'A: mutex_lock in an interrupt (atomic context) — a mutex sleeps, and sleeping in atomic context is "scheduling while atomic", an immediate BUG candidate. B: GFP_KERNEL in an interrupt — under memory pressure it enters the reclaim path and sleeps; interrupts may only use GFP_ATOMIC (and must handle failure), or better: a preallocated buffer. C: performing the full GPU reset inside the interrupt (internally mutex + msleep) — heavy work must schedule_work its way out to process context, which is exactly the design reason for amdgpu\'s reset_work. D: this line\'s own spin_lock is fine, but the problem states that non-interrupt paths take the same lock with plain spin_lock — if that side holds the lock when this interrupt arrives on the same CPU and the handler takes the same lock, that is a single-CPU self-deadlock; the fix is spin_lock_irqsave on the process side (the interrupt side may use spin_lock inside the handler, since local interrupts are already masked there). The corrected shape: in the handler, spin_lock to read status + preallocated/GFP_ATOMIC to note the essentials + schedule_work, all microsecond-scale; every mutex/reset/msleep goes into the work. The four errors each map to one edge of the decision chart — this exercise is that chart\'s photographic negative.',
          },
          interviewQ: {
            question: 'Why must you not sleep while holding a spinlock? How do you choose between spin_lock and spin_lock_irqsave?',
            difficulty: 'hard',
            hint: 'Two deadlock chains: cross-CPU busy-wait never satisfied + single-CPU interrupt reentry; the irqsave criterion is "is this lock also used on an interrupt path".',
            answer:
              'Two roads to ruin when sleeping under a spinlock: (1) cross-CPU — other CPUs are busy-waiting for the lock (spinning without yielding the CPU), while you sleep and may not be scheduled back for a long time, so the waiting CPUs spin until the system seizes up; if the scheduler places a task that also wants this lock onto your CPU, the deadlock is permanent. (2) configuration level — the lock-held region disables preemption in most configurations, and sleeping there triggers scheduling that directly violates a scheduler invariant: the kernel reports "BUG: scheduling while atomic". Hence spinlock critical sections must be short and call only functions that never sleep. The irqsave criterion in one sentence: is the data this lock protects also accessed on an interrupt (or softirq) path? If yes — the process side must use spin_lock_irqsave (disable local interrupts, then take the lock), otherwise an interrupt arriving on this CPU while the lock is held, whose handler takes the same lock, self-deadlocks the core; if no — plain spin_lock suffices, leaving interrupts on and latency lower. Extra credit: irqsave saves and restores the interrupt state (flags), so it nests safely on paths where interrupts may already be off; the softirq counterpart is spin_lock_bh. When expanding in an interview, attach the amdgpu example: the fence lock is irqsave-family (the interrupt path amdgpu_fence_process touches it), while purely process-side structures use plain spinlocks or mutexes.',
            amdContext: "Concurrency-context questions are a fixed segment of AMD kernel-team phone screens, most commonly \"find the bugs in this interrupt handler\" — the four error classes in this lesson's debug exercise cover the most commonly asked failure patterns, and volunteering amdgpu's irq→work separation design is a significant plus.",
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Explain a .c file\'s full journey from source to object file to link, and the difference between declaration and definition',
    'Use fixed-width integers correctly and recognize the traps of integer promotion and signed/unsigned conversion',
    'Use pointers and output parameters fluently while avoiding dangling pointers and out-of-bounds access',
    'Understand struct memory layout, alignment and bitfields, and explain where padding comes from',
    'Understand stack/heap and memory lifetime, and write leak-free C resource management with goto cleanup',
    'Implement polymorphism in C with function pointers/ops structs, and map it to C++ virtual functions',
    'Master C++ references, classes & RAII, copy/move, inheritance & polymorphism, templates, STL containers and smart pointers',
    'Use BIT/GENMASK/FIELD_GET and REG_GET_FIELD fluently to manipulate register fields, and recognize shift UB',
    'Implement and correctly use intrusive lists: list_for_each_entry and its _safe variant, list_move state transitions',
    'Write macros that meet kernel hygiene rules (do-while(0), single evaluation), and explain what designated initializers mean for ops tables',
    'Write error-handling paths that pass review, using the ERR_PTR / layered goto / overflow-check trio',
    'Master the kref three iron rules and the kref_get_unless_zero lookup scenario, and judge the applicability boundaries of devm/kref/manual management',
    'Determine the running context of any piece of driver code, and choose spinlock/mutex/GFP flags/workqueue correctly on that basis',
  ],
};
