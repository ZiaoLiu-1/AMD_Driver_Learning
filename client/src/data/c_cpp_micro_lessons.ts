// ============================================================
// AMD Linux Driver Learning Platform - Module 0.7 Micro-Lessons
// Module 0.7: C/C++ 基础速成 (C/C++ Foundations)
// Group 0: C 从零起步 (C from Zero) — 7 lessons
// Group 1: C 语言核心复习 (C Core Review) — 7 lessons
// Group 2: C++ 训练 (C++ Training) — 6 lessons
// Group 3: 内核 C 惯用法实战 (Kernel C Idioms) — 6 lessons
// 每节课配套 Code Lab 刷题 (/code-lab, 72 题在线编译运行)。
// Style: 以基础为主，驱动相关案例作为拓展与关联 (foundations-first,
//        amdgpu/kernel cases as extensions). Format A.
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const cCppMicroLessons: MicroLessonModule = {
  moduleId: 'c-cpp',
  groups: [
    {
      id: 'cc-c0',
      number: '0.7.0',
      title: 'C 从零起步',
      titleEn: 'C from Zero',
      icon: 'BookOpen',
      description: '不预设任何编程经验的 C 入门：从第一个函数、表达式与 printf 开始，经分支循环、数组、指针与字符串，到堆内存与所有权。每节课配套 Code Lab 热身题（/code-lab 的 C 基础热身轨道），学一节、练一节。已能独立写 C 函数的读者可直接进入 0.7.1 的系统性复习。',
      lessons: [
        {
          id: 'cc-c0-1',
          number: '0.7.0.1',
          title: '第一段 C：函数、变量、return 与 printf',
          titleEn: 'First C: Functions, Variables, return & printf',
          duration: 14,
          tags: ['C', 'basics', 'functions'],
          concept: {
            summary: '一段 C 程序由函数组成；函数接收参数、算出结果、用 return 交回。变量要先声明类型再使用；printf 负责把值排版成文字输出。main 只是程序的运行入口。',
            explanation: [
              '把函数想成一台小机器：左边投入原料（参数），右边掉出成品（返回值）。int add3(int a, int b, int c) 这行"铭牌"（签名）说明：投入三个 int，产出一个 int。函数体写在花括号里，return 表达式; 负责把成品交出去——return 一执行，这台机器立即停机，后面的代码不再运行。',
              '变量是"带名字的储物格"，使用前必须声明它装什么类型：int count = 0; 声明了一个装整数的格子并放入 0。声明（int count）、初始化（= 0）、赋值（count = 5）是三个动作；只声明不初始化的局部变量里是垃圾值——读它是 bug 的常见源头，本课组的习惯是声明时就初始化。',
              'printf("count = %d\\n", count) 把变量排版成文字：格式串里的 %d 是"这里插一个整数"的占位符，后面的参数按顺序填坑。常用四个：%d 整数、%f 小数（double）、%s 字符串、%c 单个字符；\\n 表示换行。占位符类型必须和实参匹配——%d 配上 double 是错误，编译器会警告（-Wall 时）。printf 成功时返回实际输出的字符数，输出失败时返回负数；入门题 w-04 暂时只关注精确文本，真实程序可用返回值发现 I/O 错误。',
              'main 是程序的运行入口：操作系统从 main 开始执行。在 Code Lab 里判题器已经替你写好了 main（它调用你的函数、检查结果），所以你只需要专注实现题目要求的那个函数——这也正是真实工程的日常：绝大多数时候你写的是"被别人调用的函数"，不是 main。',
              '编译是把 .c 文本翻译成可执行程序的过程：gcc prog.c -o prog && ./prog 两步完成。看不懂报错时先抓两样：文件名:行号 和第一条错误（后面的错误常常是第一条的连锁反应）。',
            ],
            keyPoints: [
              '函数签名 = 使用契约：返回类型 + 函数名 + 参数表',
              'return 立即结束函数并交回结果',
              '局部变量声明时就初始化；未初始化的值是垃圾',
              'printf 占位符要与参数类型匹配；成功返回输出字符数，失败返回负数',
            ],
          },
          diagram: {
            title: '一个 C 源文件的解剖',
            content: `  #include <stdio.h>        ← 引入标准库声明(printf 在这里)

  int add3(int a, int b, int c)   ← 签名: 返回类型 名字(参数表)
  {                                ← 函数体开始
      int sum = a + b + c;         ← 声明 + 初始化
      return sum;                  ← 交回结果, 函数结束
  }

  int main(void)                   ← 程序运行入口
  {
      printf("%d\\n", add3(1, 2, 3));  ← 调用函数, 打印返回值
      return 0;                    ← 告诉操作系统: 正常结束
  }`,
            caption: '自上而下：include 引声明、普通函数干活、main 只是入口。Code Lab 判题时 main 由判题器提供。',
          },
          codeWalk: {
            title: '从调用到返回：值是怎么流动的',
            file: 'first.c',
            language: 'c',
            code: `#include <stdio.h>

int square_plus(int x, int bonus)   /* 1 签名: 两个 int 进, 一个 int 出 */
{
    int result = x * x + bonus;     /* 2 局部变量: 声明即初始化 */
    return result;                  /* 3 交回; 函数到此为止 */
}

int main(void)
{
    int a = 4;
    int r = square_plus(a, 10);     /* 4 实参 a 的"值"被拷给形参 x */
    printf("r = %d\\n", r);          /* 5 %d 处填入 r 的值 -> 打印 r = 26 */
    return 0;
}`,
            annotations: [
              '签名读法：int(出) square_plus(名) (int x, int bonus)(进)。',
              '形参 x/bonus 是函数自己的储物格，装的是调用时拷来的值。',
              'return 后写任何代码都不会执行（编译器常会警告 unreachable）。',
              '调用处 square_plus(a, 10)：先求值、再拷贝、后进入函数。',
              '%d 与 int 匹配；想打印 double 要换 %f。',
            ],
            explanation: '记住"值的旅行"：调用方的 a 只是把值 4 拷给了形参 x——函数里怎么改 x 都不影响 a。这一点在阶段 4 学指针时会成为主角：想让函数改到调用方的变量，就要把"地址"递进去。',
          },
          miniLab: {
            title: '在 Code Lab 写下你的第一个函数',
            objective: '完成热身题 w-01（三数之和）与 w-04（打印一行加法），体验"实现函数 → 编译 → 判题"的完整循环。',
            steps: [
              '打开 /code-lab，进入「C 基础热身」轨道的阶段 0。',
              '先做 w-01：只改 return 那一行，点「编译运行」。',
              '故意删掉分号再运行一次，读一读编译错误的 文件名:行号 格式。',
              '再做 w-04：注意 printf 的格式串要和期望输出一字不差（包括空格和换行）。',
            ],
            expectedOutput: 'w-01 与 w-04 判题全绿（RESULT n/n + exit 0）。',
            hint: '编译错误看第一条；输出不匹配时逐字符对比空格与 \\n。',
          },
          debugExercise: {
            title: '两处新手错误',
            language: 'c',
            question: '下面的函数想返回两数平均值的整数部分，其中有两处错误，另有一处值得改进的写法。都找出来。',
            buggyCode: `int average(int a, int b)
{
    int sum;
    sum = a + b
    return Sum / 2;
}`,
            hint: '一处标点、一处大小写、一处"读了什么值"。',
            answer: '两处错误：(1) sum = a + b 缺分号；(2) C 区分大小写，Sum 不是 sum，是未声明的名字。一处改进：int sum; 先声明后赋值合法，但声明时直接初始化 int sum = a + b; 更不易漏。修正后：int sum = a + b; return sum / 2;（整数除法向零截断，10/4 得 2——这是特性不是错误，w-02 会专门练它。）',
          },
          interviewQ: {
            question: '入门自查：int add3(int a, int b, int c) 这行里，每个部分分别告诉了调用者什么？如果把函数体写成 return a + b; c 会怎样？',
            difficulty: 'easy',
            hint: '签名 = 契约；return 的行为。',
            answer: '返回类型 int 告诉调用者"会拿回一个整数"；函数名 add3 是调用时用的名字；参数表 (int a, int b, int c) 说明要传三个整数、顺序即含义。写成 return a + b; 后 c 完全没参与——编译器可能给"未使用参数"的警告，函数会安静地返回错误结果。签名没变，契约却被实现悄悄违反了：这就是为什么判题器（和真实项目的测试）要对行为做检查，而不是只看签名。',
          },
        },
        {
          id: 'cc-c0-2',
          number: '0.7.0.2',
          title: '表达式、类型与转换',
          titleEn: 'Expressions, Types & Conversions',
          duration: 14,
          tags: ['C', 'types', 'operators'],
          concept: {
            summary: '运算符把值组合成表达式；操作数的类型决定运算的规则。最大的新手陷阱只有一个：两个整数相除还是整数——小数部分直接扔掉。',
            explanation: [
              '四类常用运算符：算术 + - * / %；比较 == != < <= > >=（结果是 1 或 0）；逻辑 && || !（组合条件，短路求值：左边已能定结论时右边不执行）；赋值 =。注意 == 是"比较"而 = 是"赋值"——if (x = 5) 是合法但几乎总是写错的代码（-Wall 会提醒）。',
              '整型除法：5 / 9 的两个操作数都是 int，结果按 int 规则算——0.555 被截断成 0，方向是"向零"（-7/2 得 -3）。配套的 % 取余数：17 % 5 得 2。想要小数结果，至少一个操作数得是浮点：5.0 / 9 或 (double)5 / 9。这条规则藏在无数换算 bug 里（w-02 会让你亲手踩一次再修好）。',
              '类型转换两种：隐式——int 和 double 混算时 int 自动升成 double；显式——(double)x 强制转换（cast）。反向 (int)3.9 直接截断成 3，不是四舍五入。原则：让转换显式可见，读代码的人不用猜。',
              'bool：C99 起 #include <stdbool.h> 提供 bool/true/false。本质仍是整数（0 假、非 0 真），但把"这是个是否"写进类型让签名更诚实：bool is_even(int n) 比 int is_even(int n) 表达得更清楚。',
              '给 w-30 的最短位运算桥：^ 是按位异或——相同为 0、不同为 1。三条推论够用：x ^ x == 0、x ^ 0 == x、异或满足交换结合律。更完整的位操作世界在 0.7.1.2 与 c-04~c-06。',
            ],
            keyPoints: [
              '整数 / 整数 = 整数（向零截断）；% 取余数',
              '想要小数：让至少一个操作数是浮点，或显式 (double) 转换',
              '== 比较、= 赋值；比较结果是 1/0',
              '<stdbool.h> 的 bool 让"是否"进入类型系统',
            ],
          },
          diagram: {
            title: '整型除法：值在哪一步丢失',
            content: `  c * 9 / 5 + 32     (c 是 double)          c * (9 / 5) + 32
      │                                          │
      ▼ 从左往右                                 ▼ 括号先算
  (c*9) -> double ✓                        9 / 5 -> int 除法 = 1 ✗
      │                                          │
  double / 5 -> double ✓                    c * 1 + 32  -> 错误结果
      │
  正确: 100C -> 212F                        错误: 100C -> 132F

  规则: 运算一次看一步, 谁参与谁定类型`,
            caption: 'c * 9 / 5 逐步都有 double 参与，安全；一旦写成 (9 / 5)，括号里是纯 int 除法，1.8 被截断成 1，错误从此定型。',
          },
          codeWalk: {
            title: '同一个公式的三种写法',
            file: 'convert.c',
            language: 'c',
            code: `double c2f_ok(double c)
{
    return c * 9 / 5 + 32;        /* 1 c 是 double, 逐步"传染"整个表达式 */
}

double c2f_also_ok(double c)
{
    return c * (9.0 / 5.0) + 32;  /* 2 括号里已是浮点除法 = 1.8 */
}

double c2f_wrong(double c)
{
    return c * (9 / 5) + 32;      /* 3 BUG: 9/5 是 int 除法 = 1 */
}`,
            annotations: [
              '乘法先发生：double * int 时 int 升成 double。',
              '9.0 的小数点让它是 double 字面量。',
              '括号改变了求值顺序——纯 int 相除先被算成 1。',
            ],
            explanation: '三个函数签名一样，第三个悄悄错——这类 bug 编译器不报错（类型全部合法），只能靠判题/测试抓行为。w-02 的判题用容差比较浮点（不做 == 精确相等），这也是浮点的通用纪律。',
          },
          miniLab: {
            title: '踩一次整型除法',
            objective: '完成 w-02（摄氏转华氏）与 w-03（判断偶数），亲手经历"写错→读失败输出→修正"。',
            steps: [
              '打开热身轨道阶段 0 的 w-02，先按直觉写 c * (9 / 5) + 32，运行看哪些用例挂。',
              '修成任一正确写法，全绿后读题解里的三种写法对比。',
              'w-03：用 % 实现 is_even，注意负偶数 -4 也要返回 true。',
            ],
            expectedOutput: 'w-02 第一次运行 -40/37 等用例失败；修正后 RESULT 全绿。',
            hint: '看到 0/100 通过而 37 失败？说明只有整数部分对了。',
          },
          debugExercise: {
            title: '平均分为什么总是整数',
            language: 'c',
            question: '这个函数想返回三门课的平均分（可以有小数），却总是返回整数值。为什么？怎么改？',
            buggyCode: `double average3(int a, int b, int c)
{
    return (a + b + c) / 3;
}`,
            hint: '返回类型是 double 没错——问题出在 return 后面的表达式内部。',
            answer: '(a+b+c) 与 3 都是 int，除法按 int 规则先把小数扔掉，然后才把"已经截断的整数"转成 double 返回——转换发生得太晚。修法任选：除以 3.0；或 (double)(a + b + c) / 3。教训：返回类型不会拯救表达式内部的整型除法。',
          },
          interviewQ: {
            question: '入门自查：-7 / 2 和 -7 % 2 在 C11 里分别是多少？为什么？',
            difficulty: 'easy',
            hint: '除法向哪个方向截断？余数公式 a == (a/b)*b + a%b 恒成立。',
            answer: 'C11 规定整数除法向零截断：-7 / 2 = -3（不是向下取整的 -4）。余数满足恒等式 a == (a/b)*b + a%b，所以 -7 % 2 = -7 - (-3)*2 = -1——余数符号跟着被除数。推论：判断奇偶写 n % 2 != 0 比 n % 2 == 1 更稳，因为负奇数的 n % 2 是 -1。',
          },
        },
        {
          id: 'cc-c0-3',
          number: '0.7.0.3',
          title: '分支与循环',
          titleEn: 'Branches & Loops',
          duration: 15,
          tags: ['C', 'if', 'loops'],
          concept: {
            summary: 'if/else 让程序按条件走不同的路；while/for 让一段代码重复执行。写循环的功夫全在边界：从哪开始、到哪结束、会不会一次都不执行。',
            explanation: [
              '分支：if (条件) { ... } else if (另一条件) { ... } else { ... }。条件是任意表达式，非 0 即真。多路等值分派可用 switch (x) { case 1: ...; break; ... default: ...; }——记得每个 case 结尾的 break，漏掉会"穿透"到下一个 case（偶尔是故意技巧，通常是 bug）。',
              '循环两兄弟：while (条件) { ... } 先判后做，可能一次都不执行；for (初始化; 条件; 步进) { ... } 把计数三件套写在一行，是"重复 n 次"的标准形态：for (int i = 0; i < n; i++)。do { ... } while (条件); 先做后判，至少执行一次——用得少但要认得。',
              'break 立即跳出整个循环；continue 跳过本轮剩余部分直接进入下一轮判断。两者只作用于最内层循环。',
              '循环的正确性靠两问：终止吗（条件最终会变假吗）？边界对吗？经典口诀 i < n 而非 i <= n：前者恰好执行 n 次。"差一错误"（off-by-one）是全宇宙最常见的 bug——检验办法是拿最小输入走一遍：n=0 应该一次都不进循环，n=1 应该恰好一次。',
              '空转是合法状态：sum_to(0) 的循环体执行 0 次、返回初始值 0——这不是特例而是设计。让"零次循环"自然正确，代码就少一半 if。',
            ],
            keyPoints: [
              'if/else if/else 自上而下找第一个为真的分支；switch 记得 break',
              'for (int i = 0; i < n; i++) 恰好执行 n 次——i < n 不是 i <= n',
              'break 出整个循环，continue 进下一轮',
              '用 n=0 和 n=1 检验边界；零次循环应当自然正确',
            ],
          },
          diagram: {
            title: 'while 与 for：同一个循环的两种写法',
            content: `  int i = 0;                       for (int i = 0; i < n; i++) {
  while (i < n) {                      /* 循环体 */
      /* 循环体 */                  }
      i++;                          ┌─────────────────────────┐
  }                                 │ 初始化 -> 判断 -> 体 -> │
                                    │      步进 -> 判断 -> ...│
  n=3 的轨迹:                        └─────────────────────────┘
  i=0 判(0<3)真 -> 体 -> i=1
  i=1 判(1<3)真 -> 体 -> i=2        n=0 的轨迹:
  i=2 判(2<3)真 -> 体 -> i=3        i=0 判(0<0)假 -> 一次都不进
  i=3 判(3<3)假 -> 结束             (这是正确行为, 不是 bug)`,
            caption: 'for 只是把 while 的三件套折进一行。先判后做意味着零次循环天然合法——好的循环让 n=0 自动正确。',
          },
          codeWalk: {
            title: '一个循环的四个部件',
            file: 'digits.c',
            language: 'c',
            code: `int count_digits(int n)      /* 约定: n >= 0 */
{
    if (n == 0)               /* 1 边界: 0 也占一位 */
        return 1;

    int count = 0;            /* 2 累计变量: 初始化 */
    while (n > 0) {           /* 3 条件: n 终将变 0 */
        n = n / 10;           /* 4 步进: 每轮砍掉一位 */
        count++;
    }
    return count;
}`,
            annotations: [
              '0 需要特判：不特判的话循环零次、错误返回 0 位。',
              '累计变量声明时初始化——垃圾值 + 循环 = 随机结果。',
              '每轮 n/10 严格变小，保证终止。',
              '步进和计数放在一起，读起来是"砍一位、数一位"。',
            ],
            explanation: '读任何循环都按这四件套拆：初始状态、继续条件、每轮做什么、什么保证终止。w-08~w-10 各练一个变体；到阶段 3 数组遍历时，这套框架原样复用。',
          },
          miniLab: {
            title: '分支与循环六连',
            objective: '按顺序完成 w-05（两数取大）、w-06（区间夹取）、w-07（符号函数）、w-08（1 加到 n）、w-09（数位个数）、w-10（整数幂）。',
            steps: [
              '阶段 1 三题全是分支：注意 w-07 的三分支必须互斥完整。',
              '阶段 2 三题全是循环：写完先自问 n=0（或 exp=0）时走几轮。',
              '任何一题挂了，用失败信息里的输入值在纸上人肉跑一遍你的循环。',
            ],
            expectedOutput: '六题全绿；w-09 的 0 用例与 w-10 的 exp=0 用例是边界思维的试金石。',
            hint: '纸上跑循环 = 一列 i、一列条件真假、一列累计值。',
          },
          debugExercise: {
            title: '这个循环差在哪一？',
            language: 'c',
            question: '想计算 1+2+...+n，但 sum_to(3) 返回了 3 而不是 6。哪里错了？',
            buggyCode: `long sum_to(int n)
{
    long sum = 0;
    for (int i = 1; i < n; i++)
        sum = sum + i;
    return sum;
}`,
            hint: '把 n=3 的每一轮写下来：i 取到了哪些值？',
            answer: 'i < n 让循环在 i==n 前停下：n=3 时 i 只取 1、2，漏掉了 3 本身——返回 1+2=3。要么 i <= n，要么 i < n + 1。这就是差一错误的标准长相：题意是"含 n"，条件写成了"不含 n"。口诀"i < n 执行 n 次"针对的是从 0 开始数 n 个的场景；从 1 数到 n 含两端，就是 i <= n。边界永远回到题意本身。',
          },
          interviewQ: {
            question: '入门自查：while (条件) 和 do { } while (条件); 的本质区别是什么？各举一个自然的使用场景。',
            difficulty: 'easy',
            hint: '判断发生在体之前还是之后？最少执行几次？',
            answer: 'while 先判后做，最少 0 次；do-while 先做后判，最少 1 次。自然场景：while 适合"可能根本无事可做"——处理队列里的元素（队列可能是空的）；do-while 适合"至少要做一次再看要不要继续"——向用户请求输入直到合法。经验法则：默认 while；只有当"第一次执行无条件发生"是题意本身时才用 do-while。',
          },
        },
        {
          id: 'cc-c0-4',
          number: '0.7.0.4',
          title: '数组、值传递与长度参数',
          titleEn: 'Arrays, Pass-by-Value & Length Parameters',
          duration: 15,
          tags: ['C', 'arrays', 'functions'],
          concept: {
            summary: '数组是一排连续的同类型元素，用下标 0..n-1 访问。C 的数组不记得自己多长，所以函数接收数组时永远同时接收长度。参数传递是"拷贝值"——但数组参数拷贝的是位置，不是内容。',
            explanation: [
              '声明与访问：int a[5] 开出连续 5 个 int，下标从 0 到 4——a[0] 是第一个，a[4] 是最后一个，a[5] 不存在。越界访问属于未定义行为（UB）：C 不保证替你报错，它可能静默破坏内存、读到怪值，也可能直接崩溃。习惯必须从第一天养成：下标合法范围永远是 0 <= i < n。',
              '遍历就是 cc-c0-3 的循环骨架套上下标：for (int i = 0; i < n; i++) 用 a[i]。i < n 在这里不再是口诀而是安全线。',
              '值传递：普通参数是拷贝。void f(int x) 里改 x，调用方的变量纹丝不动（cc-c0-1 的 codeWalk 已见过）。这既是保护也是限制——想让函数改动调用方的数据，之后要靠指针（下一课）。',
              '数组作参数的特殊性：int a[] 写在参数表里时，传的不是 5 个元素的拷贝，而是数组的**位置**——所以函数里改 a[i] 会真正改到调用方的数组（w-14 原地反转正是靠这一点）。也因为只传了位置，长度信息丢了：C 的约定是数组参数永远配一个长度参数 int n。签名里的 a[] 与指针写法等价，细节留到下一课揭开。',
              '空数组（n==0）是合法输入：循环零次、返回初始值。计数/求和的初始值答案（0）、找最大值时"用第一个元素而非 0 初始化"（w-12 专练），这些边界选择就是数组题的全部难点。',
            ],
            keyPoints: [
              '下标合法范围 0 <= i < n；越界是 UB，可能静默破坏也可能崩溃',
              '遍历模板：for (int i = 0; i < n; i++) 用 a[i]',
              '普通参数是值拷贝；数组参数传的是位置——函数能改到真数组',
              '数组不自带长度：签名永远是 (类型 a[], int n) 成对出现',
            ],
          },
          diagram: {
            title: '值传递 vs 数组参数',
            content: `  void twice(int x)  { x *= 2; }        void fill7(int a[], int n) { a[0] = 7; }

  int v = 10;                            int arr[3] = {1, 2, 3};
  twice(v);        v 还是 10             fill7(arr, 3);   arr[0] 变成 7 !
      │                                      │
      ▼                                      ▼
  ┌────────┐   拷贝值    ┌────────┐      ┌───────────┐  拷贝"位置"  ┌────┐
  │ v = 10 │ ─────────> │ x = 10 │      │ [1][2][3] │ <──────────  │ a ●│
  └────────┘  改x不回传  └────────┘      └───────────┘   改a[i]落在  └────┘
                                          原数组上`,
            caption: '普通参数拷贝"值"，函数里怎么改都是自己的副本；数组参数拷贝"位置"，函数隔空操作的是调用方那排真实元素。',
          },
          codeWalk: {
            title: '一个数组函数的标准长相',
            file: 'scan.c',
            language: 'c',
            code: `int array_max(const int a[], int n)   /* 1 约定: n >= 1 */
{
    int best = a[0];                   /* 2 用首元素初始化, 不是 0 */
    for (int i = 1; i < n; i++) {      /* 3 从 1 开始: a[0] 已经看过 */
        if (a[i] > best)
            best = a[i];               /* 4 打擂台: 见强者就换 */
    }
    return best;
}`,
            annotations: [
              'const 表示"本函数承诺只读不改"——能写 const 就写，是给调用者的免费保险。',
              '用 0 初始化在全负数组上必错：{-5,-2,-9} 的最大值是 -2，不是 0。',
              '从 i=1 起步避免和初始化重复比较（从 0 也对，只是多一次）。',
              '"擂台变量"模式：找最大/最小/最长……全是同一个模子。',
            ],
            explanation: '数组题的骨架 = 循环骨架 + 两个决定：累计/擂台变量初始化成什么、空或单元素输入走什么路。w-11~w-15 五题各拧一个旋钮：求和、找最大、计数、原地改、查找。',
          },
          miniLab: {
            title: '数组五连',
            objective: '完成 w-11（求和）、w-12（最大值）、w-13（统计正数）、w-14（原地反转）、w-15（线性查找）。',
            steps: [
              'w-11 到 w-13 是只读遍历：签名里的 const 帮你自查"没打算改却改了"。',
              'w-14 是第一次原地修改：先纸上画 5 个格子推双下标怎么相遇。',
              'w-15 找到就 return——体会"提前退出"和"扫完全场"的区别。',
            ],
            expectedOutput: '五题全绿；w-12 的全负用例与 w-14 的奇偶长度用例是本课边界思维的验收点。',
            hint: '每题动手前先答两问：n==0 时返回什么？初始值为什么是它？',
          },
          debugExercise: {
            title: '最大值哪里错了',
            language: 'c',
            question: 'array_max({-5, -2, -9}, 3) 返回了 0，而不是 -2。找出两处问题。',
            buggyCode: `int array_max(const int a[], int n)
{
    int best = 0;
    for (int i = 0; i <= n; i++) {
        if (a[i] > best)
            best = a[i];
    }
    return best;
}`,
            hint: '初始值遇上全负数组会怎样？i <= n 的最后一轮读了哪里？',
            answer: '两处：(1) best 初始化为 0——全负数组里没有元素能打赢 0，返回了根本不在数组里的值；应初始化为 a[0]（题目保证 n>=1）。(2) i <= n 让最后一轮访问 a[n]——越界读，结果不可预测（这次"碰巧没炸"恰恰是越界最危险的形态）。修正：best = a[0]，循环 i = 1; i < n。',
          },
          interviewQ: {
            question: '入门自查：为什么 C 的数组函数签名总是 (int a[], int n) 成对出现？sizeof 能在函数里算出数组长度吗？',
            difficulty: 'easy',
            hint: '数组参数传的是什么？sizeof 作用在"位置"上得到多少？',
            answer: '因为数组作参数传递的只是首元素的位置，长度信息不随行——函数内 sizeof(a) 得到的是"一个位置"的大小（指针大小，比如 8），不是整个数组的字节数，所以除以 sizeof(a[0]) 得不到元素个数。长度必须由调用方显式递进来。这也是内核接口"指针 + 长度"惯例的根源；下一课会把"位置"这个词换成它的真名：指针。',
          },
        },
        {
          id: 'cc-c0-5',
          number: '0.7.0.5',
          title: '指针与 C 字符串',
          titleEn: 'Pointers & C Strings',
          duration: 16,
          tags: ['C', 'pointers', 'strings'],
          concept: {
            summary: '指针就是"存着地址的变量"：& 取地址，* 顺着地址找到本体。有了它，函数才能修改调用方的变量。C 字符串是 char 数组加一个结尾标记 \\0。',
            explanation: [
              '每个变量都住在内存的某个地址上。&v 取出 v 的地址；int *p = &v 声明一个指针存下它；*p 是"顺着 p 找到的那个变量本体"——读 *p 就是读 v，写 *p = 9 就是写 v。这一对操作互为逆运算：*(&v) 就是 v。',
              '指针补上了值传递的缺口：swap(int *a, int *b) 接到两个地址，通过 *a、*b 直接操作调用方的变量——这正是上一课"数组参数传位置"的普遍化。调用时写 swap(&x, &y)：把地址递进去。',
              'NULL 是“不指向任何对象”的特殊空指针值。解引用 NULL 属于未定义行为（UB）；常见系统往往会崩溃，但 C 语言不保证以某一种方式失败。纪律：接收指针的函数，契约里要么保证非 NULL，要么在使用前检查。',
              'C 字符串 = char 数组 + 结尾哨兵 \\0（数值为 0 的字符）。"gfx" 在内存里是 4 个字节：g f x \\0。所有字符串函数都靠 \\0 知道哪里结束——strlen 数到 \\0 为止（不含它）。丢了 \\0，字符串函数会一路读进不属于你的内存。',
              '上一课的悬念揭晓：参数表里的 int a[] 其实就是 int *a——数组作参数"退化"成指向首元素的指针。a[i] 与 *(a + i) 完全等价（指针加 i 前进 i 个元素）。这也再次解释了为什么长度必须另传。',
              '预告：w-23 的签名是 int **arr——指向指针的指针。逻辑不变：想改 int 传 int*，想改 int* 就传 int**。到堆内存课（下一课）它会派上用场。',
            ],
            keyPoints: [
              '& 取地址，* 解引用；*(&v) 就是 v',
              '想让函数改调用方的变量：传地址，函数里用 * 操作',
              '解引用 NULL 是 UB（常见表现为崩溃）；契约要么保证非 NULL 要么先检查',
              'C 字符串以 \\0 结尾；数组参数退化为指针，a[i] == *(a+i)',
            ],
          },
          diagram: {
            title: 'swap 的地址之旅',
            content: `  main:  int x = 3, y = 9;      swap(&x, &y);

     地址 0x100   地址 0x104          swap 的形参
    ┌─────────┐ ┌─────────┐       ┌──────────┐ ┌──────────┐
    │ x = 3   │ │ y = 9   │       │ a = 0x100│ │ b = 0x104│
    └────▲────┘ └────▲────┘       └────│─────┘ └────│─────┘
         │           │                 │            │
         └───────────┼─────── *a ──────┘            │
                     └─────── *b ───────────────────┘

  swap 里: int t = *a;  *a = *b;  *b = t;
  结果:    x == 9, y == 3   (真的变了!)`,
            caption: '指针 a、b 是"遥控器"：函数拿到的是地址的拷贝，但顺着地址按下 * 键，操作的就是 main 里的真实变量。',
          },
          codeWalk: {
            title: '手写 strlen：\\0 的发现之旅',
            file: 'strlen.c',
            language: 'c',
            code: `#include <stddef.h>

size_t my_strlen(const char *s)   /* 1 字符串参数就是 char 指针 */
{
    size_t len = 0;               /* 2 size_t: 标准库的"长度类型" */
    while (s[len] != '\\0')        /* 3 哨兵未现, 继续数 */
        len++;
    return len;                   /* 4 len 恰好是不含 \0 的字符数 */
}`,
            annotations: [
              '"gfx" 传进来时, s 指向字符 g。',
              'size_t 是无符号的、专门装"大小/长度"的类型——标准 strlen 的返回类型就是它。',
              "'\\0' 就是数值 0, 条件也可以写 while (s[len])。",
              '对空串 "" 而言 s[0] 就是 \\0, 循环零次, 返回 0。',
            ],
            explanation: '同一份代码可以从两个视角读：下标视角 s[len]（上一课的习惯）或指针视角 *(s + len)——两者等价。真实工程里读到哪种都要认识。字符串遍历的一切（w-17~w-19）都是这一个循环的变体。',
          },
          miniLab: {
            title: '指针与字符串四连',
            objective: '完成 w-16（指针交换）、w-17（手写 strlen）、w-18（统计字符）、w-19（字符串相等）。',
            steps: [
              'w-16：注意签名里没有数组——纯指针。写完想想 swap(&x, &x) 为什么也对。',
              'w-17：先写 while 版，再试试指针步进版（p 一路走到 \\0）。',
              'w-18/w-19：都是"遍历到 \\0 停"的变体；w-19 要同时推进两个指针。',
            ],
            expectedOutput: '四题全绿；w-19 的"前缀不相等"用例（"abc" vs "abcd"）是常见翻车点。',
            hint: '纸上画格子：把字符串画成带 \\0 的字节序列再走指针。',
          },
          debugExercise: {
            title: '这个 swap 为什么没交换',
            language: 'c',
            question: '调用 swap(x, y) 后 x、y 纹丝不动。两处错误在哪里？',
            buggyCode: `void swap(int a, int b)
{
    int t = a;
    a = b;
    b = t;
}

/* 调用处: swap(x, y); */`,
            hint: '参数是什么类型？函数里交换的是谁？',
            answer: '(1) 参数是 int 而非 int*——值传递拷贝了 x、y 的值，函数里交换的是自己的两个副本，调用方毫发无损；(2) 对应地，调用处也只是传了值。修正：void swap(int *a, int *b) 配合 *a、*b 操作，调用处 swap(&x, &y)。判断口诀：函数想"改到外面"，签名里必须出现 *，调用处必须出现 &（数组因为天然传位置而例外）。',
          },
          interviewQ: {
            question: '入门自查：char s[4] = "gfx" 在内存里是哪 4 个字节？strlen(s) 是多少？如果把数组开成 char s[3] 会发生什么？',
            difficulty: 'easy',
            hint: '字符串字面量自带什么结尾？strlen 数到哪停？',
            answer: '4 个字节是 g、f、x、\\0——字面量 "gfx" 自带结尾哨兵。strlen(s) 是 3：数到 \\0 停且不含它。char s[3] = "gfx" 在 C 里合法但危险：三个字符恰好填满、\\0 被挤掉——它不再是合法的 C 字符串，strlen/printf 会越过末尾一路读到"碰巧遇到的下一个 0"。教训：给字符串开数组永远多留 1 个字节；这也是 c-09 里 strscpy 容量语义的源头。',
          },
        },
        {
          id: 'cc-c0-6',
          number: '0.7.0.6',
          title: '堆内存与所有权',
          titleEn: 'Heap Memory & Ownership',
          duration: 16,
          tags: ['C', 'malloc', 'ownership'],
          concept: {
            summary: '局部变量在函数结束时消失；要让数据活得比函数久、或大小在运行时才知道，就向堆"租"内存：malloc 租、free 还。谁负责还，就是"所有权"。',
            explanation: [
              '到目前为止你的变量都住在"栈"上：函数返回，它们就消失。堆是另一块内存：用 malloc(字节数) 手动租用，用 free(指针) 手动归还，生命周期完全由你掌控。租 10 个 int 的标准写法：int *p = malloc(10 * sizeof(int));——sizeof 让字节数跟着类型走。',
              'malloc 可能失败：内存不足时返回 NULL。所以每次租用后的第一件事是检查：if (!p) return NULL;（或其他失败处理）。用完必须 free(p) 归还——忘了还叫"泄漏"；还了两次叫"double free"（严重错误）；还了之后再用叫"使用已释放内存"（UAF，同样严重）。一个便宜的疫苗：free 之后立刻 p = NULL;，因为 free(NULL) 是合法的空操作。',
              '三个亲戚：calloc(n, size) 租 n 个元素并全部清零（malloc 租来的内容是垃圾值）；realloc(p, 新字节数) 把已租的块改大小——成功返回新地址（内容自动搬家），失败返回 NULL 而旧块原封不动。realloc 的铁律：结果必须先接在临时指针里，if (!tmp) 时旧指针还活着；直接写 p = realloc(p, n) 会在失败时把唯一的地址弄丢——既泄漏又再也拿不回数据。',
              '"所有权"是读写 C 代码的核心问句：这块内存现在归谁管、谁负责 free？两个常见契约：函数返回 malloc 出来的指针 = 所有权移交给调用方（调用方负责 free，就像 w-20 的 make_range）；函数只是读写你传入的指针 = 借用，不许 free。函数命名常暗示契约：create/make/dup 移交，而 print/sum/find 只是借用。',
              '判断内存 bug 的工具以后会学（ASan、valgrind）；现阶段 Code Lab 的判题器扮演这个角色：它统计每一次 malloc/free 是否配平、注入 realloc 失败检查你的失败路径。',
            ],
            keyPoints: [
              'malloc 租 / free 还；租后判 NULL，还后置 NULL',
              'calloc = 租 + 清零；realloc 改大小，失败时旧块仍有效',
              'realloc 结果先进临时指针——p = realloc(p, n) 是经典事故',
              '所有权问句：这块内存谁负责 free？返回指针=移交，传入指针=借用',
            ],
          },
          diagram: {
            title: '栈与堆：两种生命周期',
            content: `  函数调用中                     函数返回后
  ┌─栈──────────────┐            ┌─栈──────────────┐
  │ int n = 4;      │  ->        │ (自动消失)       │
  │ int *p = ●──┐   │            │                  │
  └─────────────│───┘            └──────────────────┘
  ┌─堆──────────▼───┐            ┌─堆──────────────┐
  │ [0][1][2][3]    │  ->        │ [0][1][2][3]     │ <- 还活着!
  │ malloc(4*sizeof(int))│        │ 直到有人 free    │
  └─────────────────┘            └──────────────────┘
  栈: 自动管理, 函数结束即回收    堆: 手动管理, free 才回收`,
            caption: '指针 p 本身住在栈上，它指向的内存在堆上。函数返回后 p 消失，但堆块仍在——所以"谁拿着地址、谁负责 free"必须在契约里说清。',
          },
          codeWalk: {
            title: '一次完整的租-用-还，含失败路径',
            file: 'own.c',
            language: 'c',
            code: `#include <stdlib.h>

int *make_squares(int n)            /* 契约: 所有权移交调用方 */
{
    int *p = malloc((size_t)n * sizeof(int));  /* 1 租 */
    if (!p)                          /* 2 可能失败: 先检查 */
        return NULL;
    for (int i = 0; i < n; i++)
        p[i] = i * i;                /* 3 用 */
    return p;                        /* 4 移交: 调用方负责 free */
}

int use_it(void)
{
    int *sq = make_squares(8);
    if (!sq)
        return -1;                   /* 5 失败向上传递 */
    int last = sq[7];
    free(sq);                        /* 6 还 */
    sq = NULL;                       /* 7 疫苗: 防误用 */
    return last;
}`,
            annotations: [
              'sizeof(int) 让字节数计算不依赖平台记忆。',
              '每个 malloc 都可能返回 NULL——失败路径是契约的一部分。',
              '租来的内容是垃圾值，必须自己填。',
              '返回堆指针 = 明确告诉调用方"你来 free"。',
              '调用方检查 NULL 后再用。',
              'free 只能对 malloc 家族租来的地址调用一次。',
              'free 后置 NULL：free(NULL) 合法，误 free 第二次也无害。',
            ],
            explanation: '这套"租-查-用-还-置空"的节奏就是 C 内存管理的全部骨架。realloc 只是在"用"的中途改大小——它的临时指针纪律在 w-23 单独隔离训练，然后 c-15/c-16 把同样的纪律放进真实数据结构。',
          },
          miniLab: {
            title: '在 Code Lab 完成堆内存四连',
            objective: '按顺序完成 w-20（malloc 造数组）、w-21（calloc 清零）、w-22（复制数组）、w-23（安全 realloc）——判题器会统计配平并注入失败。',
            steps: [
              '打开 /code-lab 热身轨道阶段 5。',
              'w-20/w-21：注意 n==0 的约定返回 NULL；malloc 失败时透传 NULL。',
              'w-22：复制后改副本，原件必须不动——这就是"深拷贝"的最小版。',
              'w-23：先写"临时指针三行诀"，再故意改成 *arr = realloc(*arr, ...) 跑一次，看判题的注入失败怎么抓你。',
            ],
            expectedOutput: '四题全绿；w-23 的 "pointer untouched on failure" 与 "allocator fully balanced" 通过。',
            hint: '所有大小计算写成 n * sizeof(类型)；释放后的指针不要再读。',
          },
          debugExercise: {
            title: '找出四处内存问题',
            language: 'c',
            question: '这段代码有两条不同的泄漏路径、一次 UAF 读取和一次 double free。把四处都指出来。',
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
            hint: '失败路径漏了什么？free 之后发生了什么？b 去哪了？',
            answer: '四处：(1) if (!a || !b) return -1 时，可能其中一个已经分配成功——直接返回会在失败路径泄漏（free(a); free(b); 对 NULL 调用是安全的）；(2) 即使两个分配都成功，b 在正常路径也从未 free，是另一条泄漏；(3) int x = a[0] 在 free(a) 后读取，是使用已释放内存（UAF）；(4) 第二次 free(a) 是 double free。修正思路：检查分配后走统一清理出口，每个成功分配恰好释放一次，释放后不再读取。',
          },
          interviewQ: {
            question: '为什么 p = realloc(p, n) 是危险写法？失败时到底丢了什么？',
            difficulty: 'easy',
            hint: 'realloc 失败返回什么？旧块此时什么状态？',
            answer: 'realloc 失败返回 NULL，但旧块仍然有效。p = realloc(p, n) 在失败时把 NULL 覆盖进 p——旧块的地址是你手里唯一的钥匙，覆盖后这块内存既无法访问也无法 free：数据丢失 + 永久泄漏。正确姿势：int *tmp = realloc(p, n); if (!tmp) return 错误; p = tmp;。这条纪律从 w-23 到 c-15 再到内核 krealloc 评审一路通用。',
          },
        },
        {
          id: 'cc-c0-7',
          number: '0.7.0.7',
          title: 'POSIX Bridge：页、mmap 与 munmap',
          titleEn: 'POSIX Bridge: Pages, mmap & munmap',
          duration: 14,
          tags: ['POSIX', 'mmap', 'pages'],
          concept: {
            summary: 'malloc/free 是 C 标准库的语言层接口；mmap/munmap 是 POSIX/Linux 的系统层接口，按"页"为单位直接向内核要内存。分清这两层，是从 C 语言迈向系统编程的第一步。',
            explanation: [
              '层次先分清：malloc 属于 ISO C 标准库，任何平台的 C 都有；mmap 属于 POSIX（Unix 系家族的系统接口标准），Linux/macOS 有、裸机和 Windows 原生没有。两者不是竞争关系而是上下游——许多 libc 的 malloc 实现会在底层按策略使用 mmap 向内核批发内存，但这是实现细节，不是 ISO C 的保证。',
              '页（page）是内核管理内存的最小单位，常见 4096 字节但**不可硬编码**——运行时用 sysconf(_SC_PAGESIZE) 查询（返回 long，需检查 > 0）。GPU 显存、DMA 缓冲、内核映射全都以页为粒度思考，这个词从此会一直伴随你。',
              '匿名映射的调用形态：mmap(NULL, len, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0)——向内核直接要 len 字节可读写内存（不背靠任何文件，故曰"匿名"）。两个与 malloc 判若两人的细节：失败返回 **MAP_FAILED（(void *)-1）而不是 NULL**，判错必须比对 MAP_FAILED；归还用 munmap(p, len)——要把长度带回去，且 munmap 自己也可能失败（返回 -1）。',
              '何时用哪个：日常分配一律 malloc/free（快、带缓存、任意大小）；mmap 的舞台是页对齐的大块内存、进程间共享、把文件映射进地址空间——以及本课程真正的目的地：GPU 驱动把显存/BO 映射给用户态（模块 4 的 GEM/TTM）正是 mmap 语义的延伸。注意匿名映射**不是** PCI BAR/MMIO——寄存器映射另有一套机制，到模块 2/4 再见分晓。',
              '实操说明：判题沙箱已用仓库 scripts/probe-mmap-backends.mjs 预检，Godbolt 与 Wandbox 双后端都通过最终 harness；热身题 w-32 已上线，可在浏览器里完成同一套完整往返。本地 Linux/macOS 仍可用本课 MiniLab 观察自己机器的真实页大小。',
            ],
            keyPoints: [
              'malloc = ISO C 库函数；mmap = POSIX 系统接口——分层，不是替代',
              '页大小用 sysconf(_SC_PAGESIZE) 查询，不硬编码 4096',
              'mmap 失败返回 MAP_FAILED（不是 NULL）；munmap 需要长度且可能失败',
              '匿名映射 ≠ MMIO/PCI BAR；GPU 的 BO 映射是 mmap 语义的延伸（模块 4）',
            ],
          },
          diagram: {
            title: '两层内存接口',
            content: `  你的代码
     │ malloc(37)          任意字节数, 快, 带缓存
     ▼
  ┌─────────────────┐
  │ libc 分配器      │  ← ISO C 标准库层
  │ (堆管理/缓存)    │
  └───────┬─────────┘
          │ 大块/批发时按策略使用
          ▼
  ┌─────────────────┐
  │ mmap / munmap   │  ← POSIX 系统层 (页粒度)
  └───────┬─────────┘
          ▼
  ┌─────────────────┐
  │ Linux 内核       │  页表 / 物理内存
  └─────────────────┘`,
            caption: '许多 Linux libc 分配器会按策略把大块请求交给 mmap（这是实现细节，不是 ISO C 保证）；直接调用 mmap 绕过的是 libc 分配器策略，而不是绕过 libc 本身。',
          },
          codeWalk: {
            title: '一页匿名内存的完整往返',
            file: 'page.c',
            language: 'c',
            code: `#define _DEFAULT_SOURCE          /* 1 必须在任何 #include 之前 */
#include <sys/mman.h>
#include <unistd.h>

int page_roundtrip(void)
{
    long raw = sysconf(_SC_PAGESIZE);   /* 2 询问页大小 */
    if (raw <= 0)
        return -1;
    size_t page = (size_t)raw;

    unsigned char *p = mmap(NULL, page,
                            PROT_READ | PROT_WRITE,
                            MAP_PRIVATE | MAP_ANONYMOUS,
                            -1, 0);
    if (p == MAP_FAILED)                /* 3 不是 NULL! */
        return -1;

    for (size_t i = 0; i < page; i++)   /* 4 整页可读写 */
        p[i] = 0xAB;

    if (munmap(p, page) != 0)           /* 5 归还也要判错 */
        return -1;
    return 0;
}`,
            annotations: [
              '_DEFAULT_SOURCE 是 glibc 的 feature-test macro：在严格标准模式下恢复默认/BSD 派生定义（包括 MAP_ANONYMOUS）；它不是 POSIX 标准宏，必须放在任何系统头之前。',
              'sysconf 返回 long；-1 表示查询失败。',
              'MAP_FAILED 是 (void *)-1——用 NULL 判错会漏掉真正的失败。',
              'PROT_* 声明访问权限，MAP_PRIVATE|MAP_ANONYMOUS 表示私有匿名页。',
              'munmap 的长度以页为粒度；本例归还与映射一致的整页长度（按页对齐的部分解除映射也是合法的，见 MiniLab）。',
            ],
            explanation: '这套"查页长 → 映射 → 判 MAP_FAILED → 使用 → munmap"的往返，是所有 mmap 使用场景的公共骨架。到模块 4 你会看到同一骨架的 GPU 版：用户态 mmap 一个 BO，读写的却是显存。',
          },
          miniLab: {
            title: '本地验证一页内存',
            objective: '在任意 Linux 环境（或 macOS 终端）编译运行上面的往返代码，并观察页大小。',
            steps: [
              '把 codeWalk 的代码存为 page.c，加一个 main 打印 page_roundtrip() 的返回值与 sysconf(_SC_PAGESIZE)。',
              '编译运行：gcc -std=c11 -Wall -Wextra page.c -o page && ./page。',
              '把 mmap 的长度改成 2*page（映射两页），先用 munmap(p, page) 归还第一页，再用 munmap(p + page, page) 归还第二页——体会部分解除映射时起始地址必须落在页边界。普通页的 munmap 长度本身不要求是整页倍数；系统会解除覆盖该范围的整页，因此工程上仍应传回清晰、匹配的映射区间。',
              '进入 Code Lab 的 w-32，在浏览器里完成带双后端判题、失败注入与资源配平检查的在线版。',
            ],
            expectedOutput: '返回 0；页大小通常打印 4096（Apple Silicon 上是 16384——这就是不硬编码的理由）。',
            hint: 'macOS 上 MAP_ANONYMOUS 拼作 MAP_ANON 也通；Linux 两者皆可。',
          },
          debugExercise: {
            title: '三处系统层误用',
            language: 'c',
            question: '这段代码能编译，但有三处对 mmap 语义的误用。找出来。',
            buggyCode: `#include <sys/mman.h>

void *get_page(void)
{
    void *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
                   MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (p == NULL)
        return NULL;
    return p;   /* 调用方用完后 free(p) */
}`,
            hint: '判错判的是什么值？4096 从哪来？归还用什么函数？',
            answer: '(1) mmap 失败返回 MAP_FAILED（(void*)-1），p == NULL 无法识别这个失败哨兵——失败的映射会被当成功传出去；(2) 4096 是硬编码的页大小假设，应 sysconf(_SC_PAGESIZE)；(3) 注释让调用方 free()——mmap 的内存必须 munmap(p, len) 归还，free 一个非 malloc 的指针是未定义行为。另外在 glibc 的 -std=c11 严格模式下，缺 _DEFAULT_SOURCE 可能看不到 MAP_ANONYMOUS。',
          },
          interviewQ: {
            question: '入门自查：为什么说"malloc 底层就是 mmap"是不准确的？两者各自的失败返回值是什么？',
            difficulty: 'easy',
            hint: '标准与实现的边界；NULL vs MAP_FAILED。',
            answer: 'ISO C 只规定 malloc 的行为（返回可用内存或 NULL），不规定实现手段；glibc 等实现确实会对大块分配使用 mmap、小块用 brk/堆缓存，但那是实现策略，换个 libc 或阈值就变——教学与代码都不应依赖它。失败返回值：malloc → NULL；mmap → MAP_FAILED（(void*)-1）。把 mmap 的错误当 NULL 判，是跨这两层时最典型的移植性 bug。',
          },
        },
        // [c0-lessons-end]
      ],
    },
    {
      id: 'cc-c',
      number: '0.7.1',
      title: 'C 语言核心复习',
      titleEn: 'C Core Review',
      icon: 'Terminal',
      description: '系统性复习：从底层原理把驱动开发需要的 C 知识点过一遍——编译链接、类型与整数、指针、字符串、结构体、内存生命周期、函数指针。如果这些词里有第一次见的，先回 0.7.0「C 从零起步」和 Code Lab 的 C 基础热身轨道打底。',
      lessons: [
        {
          id: 'cc-c-1',
          number: '0.7.1.1',
          title: '翻译单元、编译与链接',
          titleEn: 'Translation Units, Compilation & Linking',
          duration: 16,
          tags: ['C', 'compilation', 'linking'],
          concept: {
            summary: '一个 .c 文件经过预处理、编译、汇编、链接四个阶段变成可执行文件或内核模块；理解“声明 vs 定义”是读懂多文件工程的钥匙。',
            explanation: [
              '预处理（cpp）：处理 #include、#define、#if 等指令。#include 本质是把头文件内容原样粘贴进来。一个 .c 文件加上它递归展开的所有头文件，构成一个“翻译单元”（translation unit）——这是编译器实际看到的最小完整单位。',
              '编译与汇编（cc1 + as）：每个翻译单元被独立编译成目标文件（.o）。关键点是“独立”——编译 amdgpu_device.c 时，编译器并不知道 amdgpu_ring.c 里函数的具体实现，它只需要看到一个“声明”就能生成对该函数的调用，把符号解析推迟到链接阶段。',
              '链接（ld）：链接器把多个 .o 中的符号（函数名、全局变量名）匹配起来。某个 .o 调用了 foo()，另一个 .o 定义了 foo()，链接器把它们绑定。找不到定义就报 “undefined reference to foo”；找到两个定义就报 “multiple definition”。',
              '声明（declaration）告诉编译器“这个名字存在、类型是什么”，定义（definition）才真正分配实体（函数体、变量存储）。约定：头文件里放声明，.c 文件里放定义。这就是“一处定义原则”（ODR）的工程化体现。',
              'static 与 extern 的链接语义值得单独强调：static 修饰的文件级函数/变量具有内部链接（internal linkage），符号不进入全局符号表，多个 .c 里的同名 static 函数互不冲突——这是内核在没有命名空间的 C 里管理名字污染的主要手段，amdgpu 里大量以 IP 块名开头的 static 函数（如 gfx_v10_0_ring_emit_ib）只对本文件可见。extern 声明则宣告"定义在别处"，链接器负责最终绑定；内核模块还多一层 EXPORT_SYMBOL 机制——只有显式导出的符号才能被其他模块引用，这是比 extern 更严格的边界。',
              '两个高频误区：其一，把定义写进头文件——头文件被多个 .c 包含后每个翻译单元都产生一份定义，链接期爆 multiple definition（static inline 函数是例外：每个翻译单元一份私有拷贝且不导出符号，内核头文件里大量使用）；其二，以为头文件守卫能防链接冲突——守卫只防同一翻译单元内的重复包含，防不了跨翻译单元的重复定义。排查这类问题的实用工具是 nm 和 objdump -t，直接看 .o 的符号表：大写 T/D 是导出定义，小写 t/d 是 static，U 是未解析引用。',
              '配套刷题提示：本课没有专属题目——但整个 Code Lab（/code-lab）的判题过程就是一次真实的"单翻译单元编译 + 链接"：你的代码与判题 main 拼成同一个源文件交给 gcc，undefined reference、multiple definition、类型不匹配这些本课讲的错误会原样出现在编译输出里。刷任何一题遇到链接类报错时，回到本课对号入座。',
            ],
            keyPoints: [
              '翻译单元 = 一个 .c + 它递归 #include 的所有头文件',
              '每个 .o 独立编译，符号解析推迟到链接期',
              'undefined reference = 链接期找不到定义；multiple definition = 重复定义',
              '头文件守卫 #ifndef/#define/#endif 或 #pragma once 防止重复包含',
              'static = 内部链接（文件私有），extern = 引用别处定义；内核用 EXPORT_SYMBOL 控制模块间可见性',
            ],
          },
          diagram: {
            title: '从源码到内核模块的编译流水线',
            content: `  gpu_ring.c                 gpu_device.c
      │                          │
      ▼  预处理 cpp              ▼  (#include "gpu_ring.h" 被粘贴进来)
  gpu_ring.i                 gpu_device.i
      │  编译 cc1                │
      ▼                          ▼
  gpu_ring.s                 gpu_device.s   (汇编)
      │  汇编 as                 │
      ▼                          ▼
  gpu_ring.o  ◄── 符号表 ──►  gpu_device.o
      └───────────┬───────────────┘
                  ▼  链接 ld（解析符号、绑定调用）
            amdgpu.ko / a.out

  声明放头文件         定义放 .c
  ┌──────────────────────┐    ┌───────────────────────────────┐
  │ gpu_ring.h:　　　　  │    │ gpu_ring.c:　　　　　         │
  │ int ring_init　　　　│    │ int ring_init(...) {　　　　　│
  │   (..);　　　　      │    │   /* 真正的实现 */            │
  │ // 只是声明          │    │ }   // 定义　　　             │
  └──────────────────────┘    └───────────────────────────────┘`,
            caption: '每个 .c 是一个独立编译的翻译单元；链接器最后把它们的符号拼接成一个模块。amdgpu.ko 就是数百个 .o 链接而成。',
          },
          codeWalk: {
            title: '声明、定义与 extern —— 多文件如何共享符号',
            file: 'gpu_ring.h / gpu_ring.c / main.c',
            language: 'c',
            code: `/* ---------- gpu_ring.h（只放声明）---------- */
#ifndef GPU_RING_H          /* 1 头文件守卫开始 */
#define GPU_RING_H

extern int g_active_rings;  /* 2 声明一个全局变量，不分配存储 */
int ring_init(int ring_id); /* 3 函数声明（原型）*/

#endif /* GPU_RING_H */

/* ---------- gpu_ring.c（放定义）---------- */
#include "gpu_ring.h"
int g_active_rings = 0;     /* 4 这里才真正分配存储 */

static int compute_size(int id) { return id * 16; } /* 5 static：仅本文件可见 */

int ring_init(int ring_id) {
    g_active_rings++;
    return compute_size(ring_id);
}

/* ---------- main.c ---------- */
#include "gpu_ring.h"
#include <stdio.h>
int main(void) {
    printf("size=%d, active=%d\\n", ring_init(4), g_active_rings);
    return 0;   /* compute_size 在这里不可见（static），但 ring_init 可见 */
}`,
            annotations: [
              '头文件守卫：防止同一头文件被多次 #include 时重复展开导致重定义',
              'extern 声明全局变量：告诉所有翻译单元“它在别处定义”，自己不分配存储',
              '函数原型：让 main.c 在不知道实现的情况下也能正确生成调用',
              '全局变量的唯一定义放在某一个 .c——这就是 ODR 在工程上的落地',
              'static 函数只有内部链接（internal linkage），其它文件看不到，可避免符号污染',
            ],
            explanation: 'amdgpu 驱动有数百个 .c 文件，全靠这套“头文件声明 + .c 定义 + extern/static 控制可见性”的机制协作。drivers/gpu/drm/amd/amdgpu/Makefile 里的 amdgpu-y += amdgpu_device.o amdgpu_ring.o ... 就是在列出要编译并链接进 amdgpu.ko 的每一个翻译单元。理解这一层，你才能看懂“为什么这个函数在 .h 里只有原型”“为什么这个函数标了 static”。',
          },
          miniLab: {
            title: '亲手制造一次链接错误',
            objective: '通过拆解编译/链接两个阶段，理解声明与定义、以及 undefined reference 的来源',
            setup: 'mkdir -p ~/amd-labs/cc-c-1 && cd ~/amd-labs/cc-c-1',
            language: 'bash',
            code: `# 用上面的三个文件 gpu_ring.h / gpu_ring.c / main.c
# 1) 只编译不链接，得到 .o
gcc -c gpu_ring.c -o gpu_ring.o
gcc -c main.c     -o main.o

# 2) 查看符号表：T=本文件定义的，U=未定义（待链接解析），t=本地(static)
nm gpu_ring.o
nm main.o

# 3) 链接成可执行文件
gcc gpu_ring.o main.o -o ring && ./ring`,
            steps: [
              '先按 codeWalk 的内容创建 gpu_ring.h、gpu_ring.c、main.c 三个文件',
              '运行上面的命令，观察 nm 输出里 ring_init 在 main.o 中是 U、在 gpu_ring.o 中是 T',
              '故意删掉 gpu_ring.c 里 ring_init 的函数体，只留声明，重新链接，观察 “undefined reference to ring_init”',
              '把 compute_size 前的 static 去掉，再 nm 一次，观察它从 t 变成 T（外部可见）',
            ],
            expectedOutput: `# nm main.o 里会看到：
                 U ring_init      # U = 未定义，等链接器去别处找
# nm gpu_ring.o 里会看到：
0000000000000000 T ring_init      # T = 本文件提供定义
0000000000000000 t compute_size   # t = static，内部链接
# 最终运行：
size=64, active=1`,
            hint: 'nm 的符号类型：大写=外部链接（其它文件可见），小写=内部链接（static）。U 表示该符号在本目标文件里只是被引用、尚未定义，必须由链接阶段在别的 .o 里找到对应的大写定义。',
          },
          debugExercise: {
            title: '找出这段代码的链接期 Bug',
            description: '下面是一个常见的新手错误：把全局变量的定义直接写进了头文件。两个 .c 都 #include 了它。',
            buggyCode: `/* config.h */
#ifndef CONFIG_H
#define CONFIG_H
int g_debug_level = 0;   /* 注意：这是定义，不是声明 */
#endif

/* a.c */            /* b.c */
#include "config.h"  #include "config.h"
/* ... */            /* ... */

/* 编译每个 .c 都没问题，但：
   gcc a.o b.o -o app
   /usr/bin/ld: multiple definition of 'g_debug_level' */`,
            language: 'c',
            question: '为什么单独编译都正常，链接却报 multiple definition？怎么修？',
            hint: '头文件会被“粘贴”进每一个 #include 它的 .c。想想 a.o 和 b.o 各自得到了什么。',
            answer: '因为 g_debug_level = 0 是一个“定义”（分配存储 + 初始化），头文件被粘贴进 a.c 和 b.c 后，a.o 和 b.o 里各有一份 g_debug_level 的定义，链接器看到两份外部定义就报 multiple definition。修法：头文件里只放声明 `extern int g_debug_level;`，把真正的定义 `int g_debug_level = 0;` 放进且只放进某一个 .c（如 config.c）。这正是 extern 的用途，也是内核所有共享全局符号的标准做法。',
          },
          interviewQ: {
            question: '内核头文件里为什么大量使用 static inline 函数，而不是普通函数声明？这和链接有什么关系？',
            difficulty: 'medium',
            hint: '考虑“普通函数定义放头文件”会发生什么，以及 inline 与 static 的链接属性。',
            answer: '如果把一个普通（非 inline）函数的“定义”放进头文件，那么每个 #include 它的翻译单元都会得到一份定义，链接时就会 multiple definition。而 static inline 同时做了两件事：static 给它“内部链接”，每个翻译单元各有一份私有副本，彼此不冲突；inline 提示编译器就地展开、避免函数调用开销。这样就能把短小的工具函数（如寄存器位域提取、链表操作）直接放在头文件里供所有人 include，既无链接冲突，又有内联性能。内核里大量的 static inline 辅助函数（include/linux/ 下随处可见）正是这个道理。',
            amdContext: 'amdgpu 的很多头文件（如 amdgpu.h、各 IP block 的头）里有大量 static inline 包装函数，用于寄存器访问和状态查询。理解 static inline 的链接语义是读懂这些头文件的前提。',
          },
        },
        {
          id: 'cc-c-2',
          number: '0.7.1.2',
          title: '类型、整数提升与定宽整数',
          titleEn: 'Types, Integer Promotion & Fixed-Width Integers',
          duration: 17,
          tags: ['C', 'types', 'integer'],
          concept: {
            summary: 'C 基本整数类型的大小是“实现定义”的；表达式里窄整数会先做整数提升（一般提升为 int；int 装不下其全部取值时为 unsigned int）；驱动用定宽类型（u8/u16/u32/u64）来保证与硬件寄存器一致的确定宽度。',
            explanation: [
              'char/short/int/long/long long 的字节数由平台 ABI 决定。Linux x86-64 用 LP64：int=4、long=8、指针=8。正因为“不确定”，内核绝不用裸 int 去描述硬件，而用 u8/u16/u32/u64（等价于 uint8_t…）这些定宽类型——GPU 寄存器是 32 位，就必须是 u32，少一位多一位都会读错。',
              '整数提升（integer promotion）：任何比 int 窄的整数（char、short、位域、u8、u16）在参与算术运算前都会先被提升——若 int 能表示原类型的全部取值（char/short/u8/u16 皆如此）就提升为 int，否则提升为 unsigned int。所以 u8 a=200, b=100; a+b 实际上是在 int 里算 300，不会回绕——这常常出乎意料。',
              '常规算术转换（usual arithmetic conversions）：当有符号和无符号混在一起运算，若无符号一方的秩（rank）不低于有符号一方，有符号被转成无符号（int 对 unsigned int 即是）；若有符号秩更高且能表示无符号的全部值（如 long long 对 unsigned int），转向该有符号类型；若秩更高却装不下（如 32 位平台的 long 对 unsigned int），双方转向该有符号类型对应的无符号类型。经典陷阱：unsigned a=0; a-1 不是 -1 而是 0xFFFFFFFF；if (a - b < 0) 当 a、b 都是无符号时永远为假。',
              '溢出语义：有符号整数溢出是“未定义行为”（UB，编译器可据此激进优化甚至删代码）；无符号溢出有明确定义，就是对 2^n 取模回绕。所以做位掩码、移位、哈希时要用无符号类型。',
              '整数提升的规则要说准确：比 int 窄的类型（char、short、位域）参与运算前先提升——int 能装下其全部取值就提升为 int，否则为 unsigned int。类型不同的两个操作数再按"常规算术转换"找公共类型：同秩的有符号遇上无符号，有符号一方转成无符号；无符号一方的秩更高时同样是无符号赢；只有当有符号类型的秩更高**且能表示无符号类型的全部值**时（如 long long 对 unsigned int），才统一向有符号转换；若秩更高却仍装不下（32 位平台的 long 对 unsigned int），双方转向该有符号类型对应的无符号类型。事故几乎全部来自"无符号赢"的分支：size_t（无符号）与 int 相减、u32 和 -1 比较，负数瞬间变成天文数字。读驱动代码时看到 (int) 或 (s32) 的显式转换，多半是作者在手动掐断这条规则。',
              '给自己立三条 UB 红线：有符号整数溢出是 UB（无符号回绕是良定义的模运算——ring 与 fence 正是靠它工作）；移位量大于等于左操作数位宽是 UB（32 位值移 32 位）；窄类型移位前已被提升为 int，所以 1 << 31 也是 UB（要写 1u << 31 或 BIT(31)）。配套刷题：Code Lab 的 c-02（高低 32 位）、c-03（size_t 下溢）、c-04/c-05（掩码与位域）、c-06（fls）、k-05（环形缓冲）、k-10（fence 回绕）全部围绕本课展开，在浏览器里即可编译运行。',
            ],
            keyPoints: [
              'int/long 大小平台相关；硬件相关数据一律用定宽 u8/u16/u32/u64',
              '窄于 int 的整数运算前先做整数提升：一般到 int，int 装不下才到 unsigned int',
              '有符号⊕无符号同秩混合运算→转无符号（负数变巨大正数的高发地）；仅当有符号秩更高且装得下全部无符号值时才向有符号转换',
              '有符号溢出=UB，无符号溢出=按 2^n 回绕；位运算用 unsigned',
              '常规算术转换中无符号会"传染"有符号；无符号回绕合法、有符号溢出是 UB——ring/fence 的回绕数学全靠前者',
            ],
          },
          diagram: {
            title: 'LP64 下的整数类型与提升规则',
            content: `  类型大小（Linux x86-64, LP64）
  ┌──────────────┬───────┬───────────────────────────────┐
  │ 类型         │ 字节  │ 内核定宽别名                  │
  ├──────────────┼───────┼───────────────────────────────┤
  │ char　　     │  1　　│ u8  / s8　　　　　　          │
  │ short　　    │  2　　│ u16 / s16　　　　　　         │
  │ int　　      │  4　　│ u32 / s32   ← GPU 寄存器宽度　│
  │ long　　     │  8　　│ u64 / s64（x86-64）　　　　   │
  │ long long　　│  8　　│ u64 / s64　　　　　　         │
  │ void *　　   │  8　　│ —　　　　　　                 │
  └──────────────┴───────┴───────────────────────────────┘

  整数提升陷阱：
    uint8_t a = 0xFF, b = 0x01;
    (a + b)  →  先各自提升为 int  →  0xFF + 0x01 = 0x100 (256)
               不是回绕成 0！若你期望 8 位回绕，需显式 (uint8_t)(a + b)

  有符号/无符号陷阱：
    unsigned u = 0;
    (u - 1)  →  0xFFFFFFFF (4294967295)，不是 -1`,
            caption: '硬件寄存器布局要求确定的位宽，所以驱动用 u32 而非 int。整数提升与有符号/无符号转换是 C 里最隐蔽的 bug 来源之一。',
          },
          codeWalk: {
            title: '从 32 位寄存器里提取位域 —— 为什么必须用无符号定宽类型',
            file: '示意：寄存器位域解析',
            language: 'c',
            code: `#include <stdint.h>

/* 假设这是从 GPU 读回的 32 位状态寄存器 GRBM_STATUS 的某种简化版：
   bit[0]      : busy
   bit[8..11]  : 当前活跃的引擎编号 (4 bit)
   bit[31]     : guilty (上次 hang 的元凶) */

#define BUSY_BIT      (1u << 0)          /* 1 用 1u（无符号）做掩码 */
#define ENGINE_SHIFT  8
#define ENGINE_MASK   (0xFu << ENGINE_SHIFT)
#define GUILTY_BIT    (1u << 31)         /* 2 1<<31 在 int 上是 UB！用 1u */

static uint32_t engine_id(uint32_t reg) {
    return (reg & ENGINE_MASK) >> ENGINE_SHIFT;  /* 3 先掩码再右移 */
}

int main(void) {
    uint32_t reg = 0x80000A01;          /* guilty=1, engine=0xA, busy=1 */
    /* 4 用 %u/%x 打印无符号，避免按有符号解释最高位 */
    return (int)engine_id(reg);          /* = 0xA = 10 */
}`,
            annotations: [
              '掩码字面量加 u 后缀（1u）：确保它是无符号，避免与有符号 int 运算时被转换',
              '1u << 31 是合法的无符号移位；1 << 31 会触碰有符号溢出（UB），是真实存在的编译器告警',
              '提取位域的标准套路：先 & 掩码清掉无关位，再 >> 移到最低位',
              '打印/比较寄存器值要用无符号语义，否则 bit31 会被当成符号位导致负数',
            ],
            explanation: 'amdgpu 里 RREG32() 返回 u32，所有寄存器位域宏（drivers/gpu/drm/amd/include/asic_reg/ 下成千上万个 *_MASK / *__SHIFT 定义）都建立在“无符号 + 定宽”之上。如果用有符号 int 接寄存器值，bit31 一旦置位就会被解释成负数，比较和移位全乱套。这节课的规则不是学院派洁癖，而是每天都在防的真实 bug。',
          },
          miniLab: {
            title: '亲眼看到整数提升与无符号回绕',
            objective: '用最小程序复现“提升到 int”和“无符号回绕”，建立对类型的肌肉记忆',
            setup: 'mkdir -p ~/amd-labs/cc-c-2 && cd ~/amd-labs/cc-c-2',
            language: 'c',
            code: `#include <stdio.h>
#include <stdint.h>

int main(void) {
    printf("sizeof(int)=%zu long=%zu ptr=%zu\\n",
           sizeof(int), sizeof(long), sizeof(void *));

    uint8_t a = 0xFF, b = 0x01;
    printf("a+b as int      = %d\\n", a + b);           /* 256，被提升 */
    printf("(uint8_t)(a+b)  = %u\\n", (uint8_t)(a + b)); /* 0，显式回绕 */

    unsigned u = 0;
    printf("u - 1           = %u\\n", u - 1);            /* 4294967295 */
    printf("(u - 1 < 0)?    = %d\\n", (u - 1) < 0);      /* 0 (永远为假) */

    printf("1u << 31        = 0x%X\\n", 1u << 31);       /* 0x80000000 */
    return 0;
}`,
            steps: [
              '保存为 lab.c，用 gcc -Wall -Wextra -o lab lab.c && ./lab 编译运行',
              '观察 a+b 输出 256 而非 0——证明运算发生在 int 上',
              '把 unsigned u 改成 int u，再看 (u-1<0)，对比有/无符号的差别',
              '尝试把 1u << 31 改成 1 << 31，加 -fsanitize=undefined 重新编译运行，观察 UBSan 报告的有符号移位溢出',
            ],
            expectedOutput: `sizeof(int)=4 long=8 ptr=8
a+b as int      = 256
(uint8_t)(a+b)  = 0
u - 1           = 4294967295
(u - 1 < 0)?    = 0
1u << 31        = 0x80000000`,
            hint: '记住两条铁律：(1) 比 int 窄的整数运算前一律提升到 int；(2) 有符号与无符号相遇，结果通常是无符号。位运算、掩码、寄存器一律用无符号定宽类型。',
          },
          debugExercise: {
            title: '找出这个循环为什么停不下来',
            description: '下面想倒序遍历一个寄存器数组，但程序卡死（无限循环）。',
            buggyCode: `#include <stddef.h>
void dump_regs(uint32_t *regs, size_t count) {
    /* 想从最后一个往前打印到第 0 个 */
    for (size_t i = count - 1; i >= 0; i--) {
        print_reg(i, regs[i]);
    }
}`,
            language: 'c',
            question: 'size_t 是无符号类型。当 i 等于 0 再 i-- 会发生什么？为什么 i >= 0 永远成立？',
            hint: '无符号数永远 >= 0。i=0 再减 1 会回绕成一个巨大的正数。',
            answer: 'size_t 是无符号的，i >= 0 对无符号数恒为真，所以循环永不退出；而且 i=0 时 i-- 回绕成 SIZE_MAX，接着 regs[SIZE_MAX] 越界访问。修法有几种：(1) 改用有符号下标 `for (ssize_t i = count - 1; i >= 0; i--)`；(2) 保持无符号但改判条件 `for (size_t i = count; i-- > 0; )`（先判后减）；(3) `size_t i = count; while (i > 0) { i--; ... }`。这是无符号下标倒序遍历的经典陷阱，内核代码里也时常因此踩坑。',
          },
          interviewQ: {
            question: '为什么 Linux 内核到处用 u32/u64 而不是 int/long？请从硬件交互和可移植性两方面说明。',
            difficulty: 'medium',
            hint: '想想寄存器布局、跨架构（32 位/64 位、大小端）以及 ABI 差异。',
            answer: '两个核心原因。(1) 硬件交互需要确定的位宽：GPU 寄存器、命令包（PM4）、固件结构体的每个字段都有精确的位布局，u32 在任何平台都是 32 位，而 int/long 的大小随 ABI 变化（如某些平台 long 是 4 字节），用裸类型会导致字段错位、读错寄存器。(2) 可移植性：内核要同时跑在 x86-64、ARM64、RISC-V 等架构上，定宽类型让同一份结构体在所有架构上布局一致；配合 __le32/__be32 等还能显式表达字节序。此外内核还有 dma_addr_t、phys_addr_t 等语义化定宽类型，进一步表达“这是一个总线地址”而不仅是一个数。简言之：和硬件/跨架构打交道，宽度必须确定，所以用定宽类型。',
            amdContext: 'amdgpu 的寄存器访问 RREG32/WREG32、命令环 ring buffer、固件加载结构体，全部基于 u32/u64。面试常考“为什么不用 int”，答到“硬件位宽确定性 + 跨架构 ABI 一致性”即可。',
          },
        },
        {
          id: 'cc-c-3',
          number: '0.7.1.3',
          title: '指针与内存模型',
          titleEn: 'Pointers & the Memory Model',
          duration: 18,
          tags: ['C', 'pointer', 'memory'],
          concept: {
            summary: '指针就是“存着某个内存地址的变量”。掌握取地址、解引用、指针类型、数组退化与输出参数，是读写一切内核代码的地基。（更进阶的 container_of 等技巧见模块 1。）',
            explanation: [
              '取地址 & 和解引用 *：&x 得到变量 x 的地址，*p 访问 p 所指地址处的值。指针有类型，int* 和 char* 都存地址，但解引用时按各自类型解释那块内存（读几个字节、如何理解这些字节）。',
              'NULL 与未初始化指针：空指针表示“不指向任何对象”，解引用是 UB，常见表现是崩溃但并非语言保证。未初始化的指针（野指针）含不确定值，解引用同样是 UB——往往更隐蔽，因为它可能“碰巧不崩”。',
              '数组与指针：数组名在大多数表达式里会“退化”成指向首元素的指针，所以 arr[i] 等价于 *(arr + i)，&arr[i] 等价于 arr + i。但数组不是指针——sizeof(arr) 是整个数组大小，sizeof(p) 永远是一个指针的大小（8 字节）。',
              '输出参数（out-param）：C 函数只能返回一个值，于是“通过指针参数把结果写回调用者”成为标准模式。内核函数普遍返回 int 错误码（0 成功、负的 -Exxx 失败），把真正的结果通过指针参数传出。',
              '指针算术的单位是"元素"而不是字节：p+1 前进 sizeof(*p) 个字节，两个同型指针相减得到元素个数（类型 ptrdiff_t）。这也解释了为什么 void* 不能做算术——它不知道元素多大；需要字节视角时先转 unsigned char*，这是 C 标准唯一保证可以别名访问任何对象的类型。顺带认识严格别名规则：通过不兼容类型的指针访问对象是 UB（*(u32*)&float_var 这类写法）。内核编译时用 -fno-strict-aliasing 关闭了该优化假设，但用户态代码要老实用 memcpy。',
              '输出参数的防御纪律：进函数先判 NULL；失败路径绝不写输出（调用方可能拿它当"有效性"信号）；成功才写、写完才返回 0。另一个隐形陷阱是"指针的指针"层级搞错——传 int* 能改调用方的 int，但要改调用方的 int* 就得传 int**。配套刷题：c-07（错误码与输出参数）、c-08（手写 memcpy——void* 到字节指针的完整肌肉记忆）。',
            ],
            keyPoints: [
              '指针是存地址的变量；*p 读/写所指对象，&x 取地址',
              '解引用 NULL 或野指针都是 UB；常见表现包括崩溃，也可能更隐蔽',
              'arr[i] ≡ *(arr+i)；但 sizeof(数组) ≠ sizeof(指针)',
              '内核惯例：返回 int 错误码，结果用指针参数传出',
              '指针算术按元素步长；unsigned char* 是唯一合法的"万能字节视角"；跨类型重解释用 memcpy 而非指针强转',
            ],
          },
          diagram: {
            title: '指针、地址与解引用',
            content: `  变量与地址（示意地址值）
   地址        内容
  0x7ffe10:  [  42   ]  ← int x = 42;
  0x7ffe18:  [0x7ffe10] ← int *p = &x;   p 里存的是 x 的地址

   *p  → 顺着 p 里的地址 0x7ffe10 找过去 → 读到 42
   p   → 0x7ffe10（地址本身）
   &p  → 0x7ffe18（指针变量自己的地址）

  数组退化：
    int a[4] = {10,20,30,40};
    a      → &a[0]（首元素地址）
    a[2]   ≡ *(a + 2)  → 30
    sizeof(a)=16(整个数组)   sizeof(&a[0])=8(一个指针)

  输出参数模式：
    int get_temp(struct dev *d, u32 *out);  // 返回 0/负错误码
    u32 t;  if (get_temp(d, &t) == 0) use(t);`,
            caption: '指针变量本身也占内存、也有自己的地址。数组名在表达式中退化为首元素指针，但 sizeof 仍能区分数组与指针。',
          },
          codeWalk: {
            title: '内核风格的输出参数与错误码',
            file: '示意：errno 风格接口',
            language: 'c',
            code: `#include <errno.h>
#include <stdint.h>

struct gpu_dev { uint32_t temp_milli_c; int powered; };

/* 返回 0 表示成功；返回负的 errno 表示失败。
   真正的结果通过 out 指针写回。这是内核最常见的函数形态。 */
int gpu_read_temp(struct gpu_dev *dev, uint32_t *out) {
    if (!dev || !out)        /* 1 防御：先挡掉 NULL 参数 */
        return -EINVAL;      /*    -22，参数非法 */
    if (!dev->powered)
        return -ENODEV;      /* 2 -19，设备不可用 */
    *out = dev->temp_milli_c; /* 3 通过指针把结果写回调用者 */
    return 0;                 /* 4 成功 */
}

/* 调用方 */
void caller(struct gpu_dev *dev) {
    uint32_t temp;
    int ret = gpu_read_temp(dev, &temp);   /* 传 &temp 让被调函数写入 */
    if (ret) { /* 处理 ret 对应的错误 */ return; }
    /* 只有 ret==0 时 temp 才有效 */
}`,
            annotations: [
              '入口处检查指针是否为 NULL，是内核函数的标准防御性写法',
              '不同失败原因返回不同的 -Exxx 错误码，调用者据此区分处理',
              '结果通过 *out 写回——因为返回值已经被错误码占用了',
              '约定：返回 0 才表示 out 有效；调用者必须先查返回值再用结果',
            ],
            explanation: '这种“int 返回错误码 + 指针输出参数”的形态在内核里无处不在（amdgpu_device_init、各种 amdgpu_*_get 函数都是如此）。它把“成功/失败”和“结果数据”分离开，让错误处理统一、可组合（配合 goto 清理，见后面的内存生命周期一课）。先看懂这个模式，再去读 amdgpu 源码会顺畅很多。',
          },
          miniLab: {
            title: '指针、数组退化与交换',
            objective: '动手验证 *、&、数组退化与 sizeof 的区别，并实现通过指针修改调用者变量',
            setup: 'mkdir -p ~/amd-labs/cc-c-3 && cd ~/amd-labs/cc-c-3',
            language: 'c',
            code: `#include <stdio.h>

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);                       /* 传地址，才能改到调用者的变量 */
    printf("x=%d y=%d\\n", x, y);        /* x=2 y=1 */

    int a[4] = {10, 20, 30, 40};
    int *p = a;                          /* 数组退化为首元素指针 */
    printf("a[2]=%d *(a+2)=%d p[2]=%d\\n", a[2], *(a + 2), p[2]);
    printf("sizeof(a)=%zu sizeof(p)=%zu\\n", sizeof(a), sizeof(p));
    printf("(&a[2]-&a[0])=%ld\\n", &a[2] - &a[0]); /* 2，按元素计 */
    return 0;
}`,
            steps: [
              '编译运行：gcc -Wall -o lab lab.c && ./lab',
              '确认 swap 真的改到了 x、y（因为传的是地址）',
              '对比 sizeof(a)=16 与 sizeof(p)=8，理解“数组不是指针”',
              '把 swap 的参数改成 (int a, int b) 值传递，观察 x、y 不再改变，体会为何要传指针',
            ],
            expectedOutput: `x=2 y=1
a[2]=30 *(a+2)=30 p[2]=30
sizeof(a)=16 sizeof(p)=8
(&a[2]-&a[0])=2`,
            hint: '“想让函数改到调用者的变量，就把变量的地址传进去。”swap 传 &x、&y，函数内通过 *a、*b 间接修改。值传递只会改副本。',
          },
          debugExercise: {
            title: '找出这个返回指针的函数错在哪',
            description: '下面的函数想构造一个名字字符串并返回它，但调用者拿到的内容是乱码。',
            buggyCode: `#include <stdio.h>
char *make_ring_name(int id) {
    char buf[32];
    snprintf(buf, sizeof(buf), "gfx_ring_%d", id);
    return buf;          /* 返回局部数组的地址 */
}
int main(void) {
    char *name = make_ring_name(3);
    printf("%s\\n", name);  /* 可能乱码 / 崩溃 */
}`,
            language: 'c',
            question: 'buf 是函数内的局部数组。函数返回后这块内存还有效吗？',
            hint: '局部变量在栈上，函数返回后栈帧就被回收/复用了。',
            answer: 'buf 是栈上的局部数组，函数一返回，它所在的栈帧就失效，返回的指针成了“悬空指针”，后续读到的是已被复用的栈内存，于是乱码或崩溃（典型的 use-after-return）。三种修法：(1) 让调用者传入缓冲区：`void make_ring_name(int id, char *out, size_t n){ snprintf(out,n,...); }`（内核最常用）；(2) 在堆上分配并明确所有权：`char *p = malloc(32); ...; return p;`，由调用者负责 free；(3) 用 static 缓冲区（但非线程安全，不推荐）。内核里几乎都用第 (1) 种——调用者给缓冲区，被调函数只填写。',
          },
          interviewQ: {
            question: '数组名和指针有什么区别？为什么 sizeof(数组) 和 sizeof(指针) 结果不同？',
            difficulty: 'easy',
            hint: '从“数组是一块连续存储”和“指针是存地址的变量”两个本质出发。',
            answer: '数组是一块连续的存储区域，名字代表这整块内存；指针是一个独立的变量，里面存着某个地址。两者容易混淆是因为数组名在大多数表达式中会“退化”为指向首元素的指针（于是 a[i] 等价 *(a+i)）。但它们不是一回事：sizeof(arr) 返回整个数组的字节数（元素个数×元素大小），因为编译期就知道数组的完整类型；而 sizeof(ptr) 永远是一个指针的大小（64 位平台上是 8），因为指针只是存了个地址。其它区别：&arr 的类型是“指向数组的指针”，&ptr 是“指向指针的指针”；数组名不能被赋值（不是左值对象），指针可以重新指向别处。把数组当指针传给函数时会丢失长度信息，所以内核接口总是额外传一个 count/size 参数。',
            amdContext: '内核里固定大小缓冲区（如 ring->name[16]）是数组，而函数参数收到的几乎都是退化后的指针 + 长度。混淆二者会导致 sizeof 在函数内算错缓冲区大小——这是真实的安全隐患。',
          },
        },
        {
          id: 'cc-c-4',
          number: '0.7.1.4',
          title: '数组、字符串与缓冲区安全',
          titleEn: 'Arrays, Strings & Buffer Safety',
          duration: 16,
          tags: ['C', 'string', 'safety'],
          concept: {
            summary: 'C 字符串就是“以 \\0 结尾的 char 数组”，语言本身不做边界检查。缓冲区安全的全部功夫，都在于时刻为终止符留位、并永远不写超过缓冲区大小。',
            explanation: [
              'C 没有内建字符串类型。"hello" 实际是 6 个字节：h e l l o \\0。strlen 返回 5（不含 \\0），但你需要的存储是 6。无数 off-by-one bug 都源于忘了给 \\0 留一个字节。',
              'strcpy/strcat 不知道目标缓冲区有多大，会一直写到源串的 \\0 为止——源比目标长就溢出，覆盖相邻内存，是经典的缓冲区溢出漏洞。',
              'strncpy 看似安全，却有两个坑：如果源长度 >= n，它不会写终止符（结果不是合法字符串）；如果源较短，它会把剩余空间全填 \\0。所以内核改用 strscpy：保证终止、返回拷贝长度或 -E2BIG。',
              '生成字符串优先用 snprintf/scnprintf：它接收缓冲区大小、保证不溢出、并始终写入 \\0。sysfs 的 show() 回调就是用 sysfs_emit/scnprintf 往 PAGE_SIZE 缓冲区里安全地格式化输出。',
              '"数组退化为指针"有三处不发生：sizeof(arr) 返回整个数组的字节数（这是 ARRAY_SIZE 宏能工作的根基）；&arr 得到"指向整个数组的指针"（类型 T(*)[N]，步长是整个数组）；字符串字面量初始化 char arr[] 时是逐字符拷贝而非指针赋值。函数参数里写 int arr[64] 纯属注释——编译器一律按 int* 处理，64 不参与任何检查，这就是为什么内核接口总是"指针 + 长度"成对出现。',
              '缓冲区安全的历史包袱要认清楚：strcpy 无界（CVE 制造机）；strncpy 源太长时不写结尾 0，还会把剩余空间全部清零（性能陷阱 + 静默截断）；strlcpy 返回源长度导致读越界风险（内核已弃用）；strscpy 是现役标准答案。sprintf 同理让位给 snprintf/scnprintf。配套刷题：c-01（snprintf 寄存器转储）、c-09（亲手实现 strscpy）、c-10（安全解析十六进制输入）。',
            ],
            keyPoints: [
              'C 字符串 = 以 \\0 结尾的 char 数组；存储要为 \\0 多留 1 字节',
              'strcpy/strcat 无边界检查，是缓冲区溢出的常见根源',
              'strncpy 可能不写终止符；内核偏好 strscpy（保证终止 + 返回截断信息）',
              '格式化输出用 snprintf/scnprintf（带大小、保证 \\0）',
              'sizeof、&arr、字面量初始化三处不退化；函数参数里的数组长度只是注释——安全接口 = 指针 + 长度 + 有界拷贝',
            ],
          },
          diagram: {
            title: '字符串的内存布局与 off-by-one',
            content: `  char buf[8] = "GPU";
   下标:   0   1   2   3   4   5   6   7
         ┌───┬───┬───┬───┬───┬───┬───┬───┐
         │'G'│'P'│'U'│\\0 │ ? │ ? │ ? │ ? │
         └───┴───┴───┴───┴───┴───┴───┴───┘
          strlen=3        ↑ 终止符占 1 字节

  危险：strcpy(buf, "12345678");  // 源 8 字符 + \\0 = 9 字节
   下标:   0 .. 7                         越界!
         ┌───┬───┬───┬───┬───┬───┬───┬───┐ ┌───┐
         │'1'│'2'│'3'│'4'│'5'│'6'│'7'│'8'│ │\\0 │ ← 写到了 buf 之外
         └───┴───┴───┴───┴───┴───┴───┴───┘ └───┘
                                            破坏相邻内存

  安全：snprintf(buf, sizeof(buf), "%s", src);  // 最多写 7 字符 + \\0`,
            caption: '终止符 \\0 必须有容身之处。strcpy 不看目标大小；snprintf 用 sizeof(buf) 守住边界并始终终止。',
          },
          codeWalk: {
            title: 'sysfs show() 风格的安全格式化',
            file: '示意：sysfs 属性输出',
            language: 'c',
            code: `#include <stdio.h>
#include <string.h>

/* 内核 sysfs 的 show 回调约定：往一个 PAGE_SIZE(4096) 的 buf 里写文本，
   返回写入的字节数。这里用用户态等价物演示同样的安全模式。 */
#define PAGE_SIZE 4096

int gpu_busy_show(char *buf, int busy_percent, const char *name) {
    /* scnprintf 返回“实际写入”的长度（不含 \\0），
       且永远不会超过 size、永远写入终止符。 */
    int len = snprintf(buf, PAGE_SIZE, "%s: %d%%\\n", name, busy_percent); /* 1 */
    if (len >= PAGE_SIZE)        /* 2 snprintf 返回“本应写入”的长度，可借此判断截断 */
        len = PAGE_SIZE - 1;     /*    scnprintf 则直接帮你 clamp */
    return len;                  /* 3 返回字节数，调用框架据此知道写了多少 */
}

int main(void) {
    char page[PAGE_SIZE];
    int n = gpu_busy_show(page, 73, "gfx");
    printf("[%d bytes] %s", n, page);   /* gfx: 73% */
    return 0;
}`,
            annotations: [
              'snprintf 第二个参数是缓冲区总大小，它据此绝不越界并始终写 \\0',
              'snprintf 的返回值是“本应写入的长度”，>= size 即说明发生了截断',
              '内核的 scnprintf/sysfs_emit 会自动把返回值 clamp 到实际写入量，省去手动判断',
              '整个过程没有任何裸 strcpy——大小始终显式可控',
            ],
            explanation: 'amdgpu 暴露了大量 sysfs 节点（如 gpu_busy_percent、mem_info_vram_total），它们的 show() 回调统一用 sysfs_emit/scnprintf 往 PAGE_SIZE 缓冲区写文本。这类“带大小、保证终止、返回长度”的接口，是内核对抗缓冲区溢出的日常武器。把 strcpy 换成 snprintf/strscpy，是写驱动代码的基本素养。',
          },
          miniLab: {
            title: '复现溢出，再用安全函数修好',
            objective: '亲眼看到 strcpy 溢出（用 ASan 捕获），并改用 snprintf 修复',
            setup: 'mkdir -p ~/amd-labs/cc-c-4 && cd ~/amd-labs/cc-c-4',
            language: 'c',
            code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char buf[8];

    /* 危险版（先体验崩溃）：源 9 字节超过 buf[8] */
    /* strcpy(buf, "12345678"); */

    /* 安全版：snprintf 用 sizeof 守边界，保证 \\0 */
    int n = snprintf(buf, sizeof(buf), "%s", "12345678");
    printf("buf=\\"%s\\" len_in_buf=%zu would_be=%d\\n",
           buf, strlen(buf), n);   /* 被截断为 "1234567"，n=8 表示本应 8 字符 */
    return 0;
}`,
            steps: [
              '先用安全版编译运行：gcc -Wall -o lab lab.c && ./lab，观察被安全截断为 "1234567"',
              '取消注释 strcpy 那行，用 gcc -fsanitize=address -g -o lab lab.c 编译运行',
              '观察 AddressSanitizer 报出 stack-buffer-overflow，并指出溢出的精确位置',
              '体会：snprintf 的返回值 8 告诉你“本应写 8 字符”，即发生了截断，可据此报错',
            ],
            expectedOutput: `buf="1234567" len_in_buf=7 would_be=8
# 启用 strcpy + ASan 时则会看到：
# ==ERROR: AddressSanitizer: stack-buffer-overflow ...`,
            hint: 'snprintf(dst, sizeof(dst), fmt, ...) 是生成字符串的安全默认选择：它绝不写超过 sizeof(dst)，并总是以 \\0 结尾。返回值若 >= sizeof(dst)，说明内容被截断了。',
          },
          debugExercise: {
            title: '找出这段 strncpy 的隐患',
            description: '下面用 strncpy 拷贝 ring 名字，多数情况正常，但当名字恰好等于缓冲区长度时后续打印会越界。',
            buggyCode: `#include <string.h>
#include <stdio.h>
struct ring { char name[8]; };
void set_name(struct ring *r, const char *src) {
    strncpy(r->name, src, sizeof(r->name));  /* 看起来限制了长度 */
}
int main(void) {
    struct ring r;
    set_name(&r, "gfx_ring");   /* 正好 8 个字符 */
    printf("%s\\n", r.name);     /* 可能打印出越界的乱码 */
}`,
            language: 'c',
            question: '"gfx_ring" 是 8 个字符，sizeof(name) 也是 8。strncpy 这时会写终止符吗？',
            hint: 'strncpy 在“源长度 >= n”时不会补 \\0。name 里就没有终止符了。',
            answer: '当源串长度 >= n 时，strncpy 拷满 n 个字符后“不”写终止符。"gfx_ring" 恰好 8 个字符填满 name[8]，于是 name 里没有 \\0，printf("%s") 会一直读到下一个偶然的 \\0 为止，造成越界读取/乱码。修法：(1) 内核首选 strscpy(r->name, src, sizeof(r->name))，它保证终止，并在截断时返回 -E2BIG；(2) 若只能用标准库，则手动补零：strncpy(...) 之后把最后一个字节置 0，即 r->name[sizeof(r->name)-1] = 0;，或直接用 snprintf。教训：strncpy 的“n”不保证产生合法 C 字符串。',
          },
          interviewQ: {
            question: 'strcpy、strncpy、strscpy（或 strlcpy）有什么区别？为什么内核更偏好 strscpy？',
            difficulty: 'medium',
            hint: '围绕“是否检查目标大小”和“是否保证写入终止符”两点比较。',
            answer: 'strcpy 完全不看目标大小，一路拷到源的 \\0，目标不够大就溢出——基本被禁用。strncpy 接收长度 n，但语义别扭：源 >= n 时不写终止符（产出非法字符串），源 < n 时又把剩余空间全填 \\0（浪费且语义模糊）。strscpy（内核）/ strlcpy（BSD）则是务实的折中：最多写 n-1 个字符并“始终”补 \\0；strscpy 还在发生截断时返回 -E2BIG，让调用者能检测并处理截断。内核偏好 strscpy 正是因为它“边界安全 + 永远终止 + 可检测截断”，符合内核对健壮性的要求。需要格式化时则用 snprintf/scnprintf/sysfs_emit。',
            amdContext: 'amdgpu 里给 ring、fence、IP block 命名时用 strscpy；sysfs 输出用 sysfs_emit。面试问到字符串安全，答出“strscpy 保证终止并能报告截断”即抓住要点。',
          },
        },
        {
          id: 'cc-c-5',
          number: '0.7.1.5',
          title: '结构体、联合体、位域与对齐',
          titleEn: 'Structs, Unions, Bitfields & Alignment',
          duration: 18,
          tags: ['C', 'struct', 'alignment'],
          concept: {
            summary: '结构体在内存里不是字段的简单堆叠——编译器会插入 padding 让每个字段满足对齐要求。理解对齐、padding、union 与位域，才能正确描述硬件数据。',
            explanation: [
              '对齐（alignment）：CPU 要求 N 字节的类型放在 N 的倍数地址上（u32 对齐到 4、u64 对齐到 8）。为满足这一点，编译器在字段之间和结构体末尾插入 padding 字节。所以结构体大小常常大于各字段大小之和，且字段顺序会显著影响总大小。',
              'offsetof 与 sizeof：offsetof(type, member) 给出字段在结构体内的字节偏移，sizeof(type) 给出含 padding 的总大小。这两个宏是分析内存布局的标准工具，也是 container_of（模块 1）的基础。',
              'union（联合体）：所有成员共享同一块内存，大小等于最大成员。常用于“同一段内存的多种视角”，比如把一个 u32 寄存器既当整数、又当一组位域来访问。',
              '位域（bitfield）：可以声明 “unsigned busy : 1;” 让字段只占若干 bit，适合紧凑表达标志位；但位域的内存布局（位序、跨字节填充）是实现定义的，跨平台/对硬件寄存器并不可移植，硬件寄存器更稳妥的做法是用掩码+移位（见 cc-c-2）。',
              '对齐要求的根源是硬件：多数体系结构上 N 字节的标量要求地址是 N 的倍数，未对齐访问轻则变慢（拆成两次访存）重则异常（某些 ARM）。编译器于是在成员之间插 padding，并把结构体总大小补齐到最大成员对齐的倍数（这样数组元素才能逐个对齐）。实用推论：把成员按对齐从大到小排列通常最省空间；pahole 工具能直接展示内核结构体的空洞分布，amdgpu 的性能敏感结构体都被这样审视过。',
              '位域的两大坑要牢记：位的分配顺序（从低位还是高位开始）是实现定义，跨编译器/跨大小端不可移植——所以映射硬件寄存器时内核宁可用掩码+移位（REG_GET_FIELD）也不用位域；位域成员也不能取地址。union 的合法用途是"同一块内存的多种解释"（类型双关在 C 里合法、在 C++ 里是 UB），但跨越 ABI 边界仍推荐 memcpy。配套刷题：c-11（小端序列化——绕开 padding 与字节序的正解）、c-12（float 位型拆解）、k-01（container_of 依赖 offsetof，本课的直接延伸）。',
            ],
            keyPoints: [
              '对齐要求导致编译器插入 padding；字段顺序影响 sizeof',
              'offsetof 给偏移、sizeof 给含 padding 的总大小',
              'union 让多个成员共享内存，大小=最大成员',
              '位域紧凑但布局实现定义；映射硬件寄存器优先用掩码+移位或 __packed',
              '成员按对齐降序排列可最小化 padding；位域顺序是实现定义——ABI/寄存器映射用掩码+移位；pahole 可视化结构体空洞',
            ],
          },
          diagram: {
            title: 'padding：字段顺序如何改变结构体大小',
            content: `  struct bad { char a; int b; char c; };   // 12 字节
   偏移: 0      1  2  3   4   5  6  7   8     9 10 11
        ┌───┐ ┌──padding─┐┌────int b────┐ ┌───┐┌─padding─┐
        │ a │ │ .  .  .  ││ b  b  b  b  │ │ c ││ .  .  . │
        └───┘ └──────────┘└─────────────┘ └───┘└─────────┘
        a 后补 3 字节让 b 对齐到 4；末尾补 3 字节让数组步进对齐

  struct good { int b; char a; char c; };  // 8 字节（重排后更小）
   偏移: 0  1  2  3   4   5   6  7
        ┌────int b────┐ ┌───┐┌───┐┌─pad─┐
        │ b  b  b  b  │ │ a ││ c ││ . . │
        └─────────────┘ └───┘└───┘└─────┘

  union reg { uint32_t value; struct { unsigned busy:1, eng:4; } bits; };
   value 和 bits 共享同一 4 字节：可整体读，也可按位读`,
            caption: '把大字段排在前、小字段聚在一起，能减少 padding。union 让同一块内存有“整数”和“位域”两种视角。',
          },
          codeWalk: {
            title: '用 union 给寄存器建立“整数 + 位域”双视角',
            file: '示意：寄存器联合体',
            language: 'c',
            code: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

/* 一个 32 位状态寄存器的两种视角：整体 value，或拆成位域 bits。
   注意：位域布局是实现定义的，这里仅用于本机演示/调试，
   真正跨平台映射硬件请用掩码+移位。 */
union grbm_status {
    uint32_t value;
    struct {
        uint32_t busy   : 1;   /* bit 0      */
        uint32_t engine : 4;   /* bit 1..4   */
        uint32_t rsvd   : 26;  /* 占位        */
        uint32_t guilty : 1;   /* bit 31     */
    } bits;
};

int main(void) {
    union grbm_status s;
    s.value = 0x80000003;                 /* 1 整体写入一个寄存器值 */
    printf("busy=%u engine=%u guilty=%u\\n", /* 2 立刻用位域视角读出来 */
           s.bits.busy, s.bits.engine, s.bits.guilty);

    printf("sizeof(union)=%zu\\n", sizeof(s));            /* 3 = 4，等于最大成员 */
    printf("offsetof(value)=%zu\\n", offsetof(union grbm_status, value));
    return 0;
}`,
            annotations: [
              'union 的 value 和 bits 占同一块 4 字节内存，写 value 即同时改变了 bits 视图',
              '位域让“按位读取”代码更直观（调试时方便），但其内存布局不保证跨平台一致',
              'union 大小等于最大成员（这里 4 字节），不是各成员之和',
              'offsetof/sizeof 是分析任何结构体/联合体布局的标准工具',
            ],
            explanation: '内核里 union 常用于“同一段内存的多种解读”，例如 dma_fence、各类描述符、寄存器视图。amdgpu 的寄存器头文件提供海量 *__SHIFT/*_MASK 宏走掩码+移位路线（可移植），而 union+bitfield 更多出现在本地数据结构或调试代码里。理解两条路线各自的适用边界，是描述硬件数据的关键判断。',
          },
          miniLab: {
            title: '测量 padding，并通过重排字段缩小结构体',
            objective: '用 sizeof/offsetof 量化对齐与 padding，验证字段顺序对大小的影响',
            setup: 'mkdir -p ~/amd-labs/cc-c-5 && cd ~/amd-labs/cc-c-5',
            language: 'c',
            code: `#include <stdio.h>
#include <stddef.h>
#include <stdint.h>

struct bad  { char a; uint32_t b; char c; };          /* 有 padding */
struct good { uint32_t b; char a; char c; };           /* 重排后更紧凑 */
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
              '编译运行：gcc -Wall -o lab lab.c && ./lab',
              '观察 sizeof(bad)=12 但 sizeof(good)=8——仅仅重排字段就省了 4 字节',
              '看 offsetof：bad.b 的偏移是 4（a 后被补了 3 字节 padding）',
              '观察 __attribute__((packed)) 把 bad 压到 6 字节（无 padding），但代价是 b 变成未对齐访问',
            ],
            expectedOutput: `sizeof(bad)=12
  offsetof(struct bad,a)=0
  offsetof(struct bad,b)=4
  offsetof(struct bad,c)=8
sizeof(good)=8
sizeof(packed_bad)=6`,
            hint: '把更大/对齐要求更高的字段排在前面、把小字段聚在一起，能减少 padding。__packed 能消除 padding，但会带来未对齐访问，仅在描述硬件/线缆格式时谨慎使用。',
          },
          debugExercise: {
            title: '找出这个“硬件头解析”为什么字段错位',
            description: '下面想用结构体直接套到一段二进制固件头上读取字段，但读出来的 size 完全不对。',
            buggyCode: `#include <stdint.h>
/* 固件头在文件里是紧凑排布的：1 字节版本 + 紧跟 4 字节大小 */
struct fw_header {
    uint8_t  version;   /* 偏移 0 */
    uint32_t size;      /* 期望偏移 1，实际呢？ */
};
uint32_t read_size(const void *raw) {
    const struct fw_header *h = raw;   /* 直接把结构体套上去 */
    return h->size;                    /* 读出来的值不对 */
}`,
            language: 'c',
            question: '编译器会把 size 放在偏移 1 吗？结构体的实际布局和文件里的紧凑布局一致吗？',
            hint: 'uint32_t 要对齐到 4。编译器会在 version 后插入 padding，使 size 落在偏移 4 而非 1。',
            answer: '不一致。因为 uint32_t 要 4 字节对齐，编译器在 version(偏移0) 之后插入 3 字节 padding，把 size 放到偏移 4；而文件里的紧凑头是 version 在 0、size 紧跟在 1。于是用这个结构体直接覆盖会从偏移 4 取值，读到错误数据。修法：(1) 给结构体加 `__attribute__((packed))` 消除 padding，使布局与文件一致（注意之后对 size 的访问是未对齐的，部分架构需用 get_unaligned_le32 等）；(2) 更稳妥的是显式按字节反序列化：`size = raw[1] | raw[2]<<8 | raw[3]<<16 | raw[4]<<24;`（同时明确字节序）。内核解析固件/线缆格式时普遍用 __packed + 显式字节序帮助宏。',
          },
          interviewQ: {
            question: '结构体为什么会有 padding？怎样减少它？用位域映射硬件寄存器有什么风险？',
            difficulty: 'medium',
            hint: '从对齐要求讲 padding 的来源；从“位域布局实现定义”讲硬件映射的风险。',
            answer: 'padding 来自对齐要求：每个类型要放在其大小的倍数地址上，编译器便在字段间/结构体尾插入填充字节以满足对齐并保证数组步进正确，于是 sizeof 常大于字段之和，且与字段顺序有关。减少 padding 的办法：按对齐从大到小排列字段、把同类小字段聚拢；必要时用 __packed 彻底取消 padding（代价是未对齐访问，可能更慢甚至在某些架构出错）。用位域映射硬件寄存器的风险在于：C 标准没有规定位域的位序（先填高位还是低位）、跨存储单元的填充方式、以及字节序交互，这些都是实现定义的；同一段定义在不同编译器/架构上可能布局不同。因此硬件寄存器更稳妥的做法是用显式的掩码+移位（配合 *_MASK/*__SHIFT 宏），而把位域留给本地数据结构或可控环境下的可读性用途。',
            amdContext: 'amdgpu 的寄存器访问几乎全部走掩码+移位（asic_reg 头里成千上万的 *_MASK/__SHIFT），正是为了规避位域可移植性问题；而 __packed 多用于固件头、descriptor 等需要与硬件/文件精确对齐布局的场景。',
          },
        },
        {
          id: 'cc-c-6',
          number: '0.7.1.6',
          title: '栈、堆与内存生命周期',
          titleEn: 'Stack, Heap & Memory Lifetime',
          duration: 18,
          tags: ['C', 'memory', 'lifetime'],
          concept: {
            summary: '栈上的“自动变量”随作用域自动生灭；堆上的内存由你 malloc/free 显式管理。谁来释放、何时释放，就是“所有权”问题——这也是后面 C++ RAII 要解决的痛点。',
            explanation: [
              '自动存储（栈）：函数内的普通局部变量在进入作用域时诞生、离开作用域时自动销毁。无需手动管理，但生命周期不能超出函数——返回它的地址就是悬空指针（见 cc-c-3）。',
              '动态存储（堆）：malloc 申请一块生命周期由你掌控的内存，必须配对 free 释放。三大经典错误：内存泄漏（忘了 free）、悬空/二次释放（free 后又用或又 free）、释放后使用（use-after-free）。',
              '所有权（ownership）：每块堆内存都该有明确的“谁负责释放它”。接口要在文档/命名上说清楚是“调用者拥有”还是“被调用者拥有”。所有权混乱是 C 项目最大的内存 bug 来源。',
              '内核里没有 libc 的 malloc/free，而是 kmalloc/kzalloc/kfree（还要带 GFP 标志说明能否睡眠）。更进一步，devm_kzalloc 等“设备托管”分配会在设备卸载时自动释放——这其实就是内核版的 RAII 思路。',
              '把"所有权"当成一等概念来读 C 代码：每块堆内存在任何时刻必须有且只有一个明确的负责人（函数、结构体或调用方），API 命名会暗示所有权转移——create/alloc 返回的内存归调用方管，add/register 通常只是借用，destroy/free 收回所有权。内核代码评审的很多来回，本质都是在争论"这块内存现在归谁"。realloc 的经典陷阱（p = realloc(p, n) 失败时旧块泄漏）也属于所有权问题：失败时所有权没有转移，旧负责人仍要负责到底。',
              '三大内存病及其检测工具：泄漏（忘 free）——用户态 ASan/Valgrind、内核 kmemleak；使用后释放 UAF——KASAN 能在内核态抓；双重释放——free 后立即置 NULL 是最廉价的疫苗（free(NULL) 是合法空操作）。练驱动的黄金习惯：先在用户态用 -fsanitize=address 把数据结构逻辑跑干净再进内核。配套刷题：c-15（realloc 动态数组）、c-16（嵌套资源 create/destroy）、k-04（kref 引用计数）、k-07（goto 阶梯）、k-11（devres 清理栈）——五题连起来就是内核内存管理的进化史。',
            ],
            keyPoints: [
              '栈变量随作用域自动生灭；不可返回其地址',
              '堆内存 malloc/free 配对；泄漏/二次释放/释放后使用是三大杀手',
              '每块内存都要有明确的所有者负责释放',
              '内核用 kmalloc/kzalloc/kfree + GFP 标志；devm_* 提供自动释放',
              '每块堆内存任一时刻只有一个所有者；realloc 失败时旧块仍有效；free 后置 NULL——三条纪律防住大半内存事故',
            ],
          },
          diagram: {
            title: '栈与堆，以及一块内存的生命周期',
            content: `   高地址  ┌─────────────┐
           │    栈 Stack  │  自动变量，随函数调用入/出栈
           │  ↓ 向下生长  │  生命周期 = 作用域
           │　　　　        │
           │     ...　　　　│
           │  ↑ 向上生长    │
           │    堆 Heap   │  malloc 分配，free 释放
   低地址  └─────────────┘  生命周期 = 你显式控制

  一块堆内存的一生（以及三种死法）：
    p = malloc(n);   // 出生，p 拥有它
        use(p);      // 正常使用
    free(p);         // 正常死亡
    ───────────────────────────────────
    ✗ 忘了 free            → 泄漏（内存只增不减）
    ✗ free(p); *p = 1;     → use-after-free（释放后使用）
    ✗ free(p); free(p);    → double free（二次释放）
    修复后应： free(p); p = NULL;  // 防御：置空避免误用`,
            caption: '栈自动管理、堆手动管理。给“谁拥有、何时释放”一个清晰答案，是写出无泄漏 C 代码的前提。',
          },
          codeWalk: {
            title: '内核经典的 goto 清理：多步分配的错误回滚',
            file: '示意：goto 错误处理',
            language: 'c',
            code: `#include <stdlib.h>
#include <string.h>

struct ring { int *cmd_buf; char *name; };

/* 多步分配：任何一步失败，都要把“已经分配的”按相反顺序释放。
   goto 标签的阶梯式回滚是内核里最常见的资源管理写法。 */
int ring_init(struct ring *r, int dw, const char *name) {
    r->cmd_buf = malloc(dw * sizeof(int));
    if (!r->cmd_buf)
        goto err;                 /* 1 第一步就失败，无需释放任何东西 */

    r->name = malloc(strlen(name) + 1);
    if (!r->name)
        goto err_free_buf;        /* 2 这一步失败，要回滚上一步的 cmd_buf */

    strcpy(r->name, name);
    return 0;                     /* 3 全部成功 */

err_free_buf:
    free(r->cmd_buf);             /* 4 按相反顺序释放已分配资源 */
    r->cmd_buf = NULL;
err:
    return -1;                    /* 5 返回失败，调用者知道对象未建成 */
}`,
            annotations: [
              '每个失败点 goto 到“恰好回滚已分配资源”的标签，避免泄漏',
              '标签按资源分配的相反顺序排列，逐级释放',
              '全部成功才 return 0；失败路径保证不残留半成品',
              '释放后把指针置 NULL，避免后续误用（防御性习惯）',
            ],
            explanation: '因为 C 没有析构函数，多步初始化中途失败时必须手动、逆序地释放已分配的资源，于是形成了内核标志性的 goto err_xxx 阶梯。amdgpu 的 *_sw_init/*_hw_init 函数里随处可见这种结构。它能工作，但容易写错（漏一级、顺序错）。记住这种“手动逆序清理”的痛，下一组 C++ 的 RAII 正是用“析构函数自动逆序清理”来根除它。',
          },
          miniLab: {
            title: '用 AddressSanitizer 抓住泄漏与 use-after-free',
            objective: '亲手制造并定位内存泄漏与释放后使用，建立对生命周期的敬畏',
            setup: 'mkdir -p ~/amd-labs/cc-c-6 && cd ~/amd-labs/cc-c-6',
            language: 'c',
            code: `#include <stdlib.h>
#include <stdio.h>

int main(void) {
    int *a = malloc(4 * sizeof(int));
    for (int i = 0; i < 4; i++) a[i] = i * i;
    printf("a[3]=%d\\n", a[3]);

    /* 实验 1：注释掉 free(a) → LeakSanitizer 报泄漏 */
    free(a);

    /* 实验 2：取消下面两行 → use-after-free / double free */
    /* a[0] = 99; */     /* use-after-free */
    /* free(a);    */     /* double free   */
    return 0;
}`,
            steps: [
              '正常编译运行：gcc -fsanitize=address -g -o lab lab.c && ./lab',
              '注释掉 free(a)，重新编译运行，观察 LeakSanitizer 报出 “direct leak of 16 byte(s)” 并给出分配栈',
              '恢复 free(a)，再取消 a[0]=99 那行，观察 ASan 报 heap-use-after-free 及释放位置',
              '再取消第二个 free(a)，观察 ASan 报 double-free',
            ],
            expectedOutput: `a[3]=9
# 注释掉 free 后：
# ==ERROR: LeakSanitizer: detected memory leaks
#   Direct leak of 16 byte(s) ...
# use-after-free 时：
# ==ERROR: AddressSanitizer: heap-use-after-free ...`,
            hint: 'ASan/LSan（-fsanitize=address）是定位 C/C++ 内存错误的利器，它会精确报出泄漏的分配点、use-after-free 的释放点。养成给每个 malloc 想清楚“谁来 free、何时 free”的习惯。',
          },
          debugExercise: {
            title: '找出这个错误处理路径里的内存泄漏',
            description: '下面的初始化函数在第二步失败时直接返回，漏掉了已分配的资源。',
            buggyCode: `#include <stdlib.h>
struct ctx { int *a; int *b; };
int ctx_init(struct ctx *c, int n) {
    c->a = malloc(n * sizeof(int));
    if (!c->a) return -1;

    c->b = malloc(n * sizeof(int));
    if (!c->b) return -1;     /* 这里直接返回 —— c->a 怎么办？ */

    return 0;
}`,
            language: 'c',
            question: '当第二个 malloc 失败时，第一个已经成功分配的 c->a 被释放了吗？',
            hint: '想想这条失败路径上，c->a 还有没有人记得它、还有没有人会 free 它。',
            answer: '没有。当 c->b 分配失败直接 return -1 时，c->a 已经分配成功却无人释放，调用者又因为返回了错误码而通常会丢弃这个半成品 ctx——于是 c->a 泄漏。修法是采用 goto 逆序清理：`if (!c->b) goto err_free_a; ... return 0; err_free_a: free(c->a); c->a = NULL; return -1;`。这正是内核 goto err 模式存在的理由：保证任何失败路径都把“已分配的资源”精确回滚干净。',
          },
          interviewQ: {
            question: '内核里为什么大量使用 goto 做错误处理？这和 C 缺少析构函数有什么关系？',
            difficulty: 'medium',
            hint: '对比“多步分配中途失败”在有/无析构函数语言里的清理方式。',
            answer: '因为 C 没有析构函数，也不鼓励多重 return 时到处复制清理代码，所以内核用单一的 goto err 阶梯来集中、逆序地释放已分配资源：每个失败点跳到“恰好回滚到此刻已持有资源”的标签，逐级 free/unlock/put。这样既避免了泄漏，又把清理逻辑写一遍而非每个 return 重复一遍，可读且不易漏。它本质上是在用手工方式模拟“作用域退出时逆序析构”。这也解释了为什么 C++ 的 RAII 如此有价值——把这套手工逆序清理交给编译器在析构函数里自动完成，连异常路径也覆盖，从根上消灭了“忘记清理”这类 bug。理解 C 的 goto 清理之痛，就理解了 RAII 的动机。',
            amdContext: 'amdgpu 各 IP block 的 sw_init/hw_init、内存分配路径几乎都用 goto err_xxx 逆序清理。读这些函数时，顺着标签看“每一级回滚了什么”，就能快速理清资源持有关系。',
          },
        },
        {
          id: 'cc-c-7',
          number: '0.7.1.7',
          title: '函数指针、回调与 ops 结构体',
          titleEn: 'Function Pointers, Callbacks & ops Structs',
          duration: 18,
          tags: ['C', 'function-pointer', 'ops'],
          concept: {
            summary: '函数指针让“函数”也能像数据一样被存储、传递、替换。把一组函数指针打包成 ops 结构体，就能在没有类的 C 里实现多态——这正是 Linux 子系统的骨架。',
            explanation: [
              '函数指针的本质：函数名在表达式里退化为“函数的入口地址”，可以用一个指针变量保存它，再通过该指针调用。语法 `int (*fp)(int)` 读作“fp 是指向‘接收 int 返回 int 的函数’的指针”，常用 typedef 提升可读性。',
              '回调（callback）：把函数指针作为参数传给另一个函数，让对方在合适时机“回调”你的逻辑。qsort 的比较函数、内核的中断处理、定时器回调都是这种模式。',
              'ops 结构体 = C 的多态：把同一类操作（init/fini/read/write…）声明成一组函数指针字段，不同的“对象”填入不同实现，调用方只通过统一的 ops 接口分发。这就是面向对象“虚函数表”在 C 里的手写版。',
              '调用前必须判空：ops 里的某个函数指针可能是 NULL（该对象不支持此操作）。内核惯例是 `if (ops->foo) ops->foo(...)`，既支持“可选操作”，也避免调用空指针崩溃。',
              '函数指针声明的读法可以机械化：从名字出发向右再向左——int (*submit)(void *ctx, int job) 读作"submit 是指针，指向接收 (void*, int)、返回 int 的函数"。复杂签名用 typedef 拆解是内核惯例（typedef int (*handler_fn)(...)）。调用语法上 ops->submit(ctx, job) 与 (*ops->submit)(ctx, job) 完全等价——函数指针的解引用是可选的，这一点常让初读者困惑。',
              '工程细节两则：其一，ops 表几乎总是声明成 static const——const 让整张表进 .rodata，运行期不可篡改（安全加固：函数指针是攻击者最爱的劫持目标），编译器还能借此做去虚拟化优化；其二，"一类对象共享一张 ops 表"（amdgpu_ring_funcs 模式）比"每个对象各存一把函数指针"省内存且缓存友好——这正是 C++ vtable 的布局逻辑：对象里只存一个指向类级共享表的 vptr。配套刷题：c-13（qsort 比较器）、c-14（ops 双引擎多态）、k-11（fn+data 闭包）、k-12（opcode 分发表综合战）。',
            ],
            keyPoints: [
              '函数指针保存函数入口地址，可存储/传递/替换',
              '回调 = 把函数指针传给别人，由对方择机调用',
              'ops 结构体把一组函数指针打包，实现 C 的多态分发',
              '调用前判空：if (ops->fn) ops->fn(...)，支持可选操作并防崩溃',
              'ops 表声明为 static const 使其进入只读段——既是安全加固也是优化提示；对象存表指针而非整张表，正是 vtable 的内存布局',
            ],
          },
          diagram: {
            title: 'ops 结构体：一个接口，多个实现',
            content: `  统一接口（一组函数指针）
  struct ip_funcs {
      int (*sw_init)(void *);
      int (*hw_init)(void *);
      void (*fini)(void *);
  };

         填入不同实现 → 不同“对象”
  ┌───────────────────┐     ┌────────────────────┐
  │ gfx_funcs         │     │ sdma_funcs         │
  │  .sw_init=gfx_sw  │     │  .sw_init=sdma_sw  │
  │  .hw_init=gfx_hw  │     │  .hw_init=sdma_hw  │
  │  .fini   =gfx_fini│     │  .fini   =sdma_fini│
  └───────────────────┘     └────────────────────┘
            ▲                         ▲
            └──── 调用方只认接口 ─────┘
   for (each block)
       if (block->funcs->hw_init)        // 判空
           block->funcs->hw_init(block);  // 统一分发，各自执行各自实现`,
            caption: '调用方只依赖 struct ip_funcs 这个接口，具体行为由每个对象填入的函数指针决定——这就是 C 的多态。',
          },
          codeWalk: {
            title: 'amdgpu 风格的 IP block 分发（C 多态原型）',
            file: '示意：IP block ops',
            language: 'c',
            code: `#include <stdio.h>

struct ip_block;
/* 一组操作的接口：每个 IP block 提供自己的实现 */
struct ip_funcs {
    const char *name;
    int  (*hw_init)(struct ip_block *);   /* 1 函数指针字段 */
    void (*fini)(struct ip_block *);
};
struct ip_block { const struct ip_funcs *funcs; void *priv; };

/* GFX 引擎的实现 */
static int gfx_hw_init(struct ip_block *b){ printf("GFX hw_init\\n"); return 0; }
static void gfx_fini(struct ip_block *b){ printf("GFX fini\\n"); }
static const struct ip_funcs gfx_funcs = {  /* 2 填入具体实现 */
    .name = "gfx", .hw_init = gfx_hw_init, .fini = gfx_fini,
};
/* SDMA 引擎的实现（演示：fini 不支持，置 NULL） */
static int sdma_hw_init(struct ip_block *b){ printf("SDMA hw_init\\n"); return 0; }
static const struct ip_funcs sdma_funcs = {
    .name = "sdma", .hw_init = sdma_hw_init, .fini = NULL, /* 3 可选操作留空 */
};

int main(void) {
    struct ip_block blocks[] = { { &gfx_funcs }, { &sdma_funcs } };
    for (int i = 0; i < 2; i++) {                 /* 4 统一分发 */
        struct ip_block *b = &blocks[i];
        if (b->funcs->hw_init) b->funcs->hw_init(b);
        if (b->funcs->fini)    b->funcs->fini(b);  /* SDMA 的 fini 为 NULL，跳过 */
    }
    return 0;
}`,
            annotations: [
              '在结构体里声明函数指针字段，就定义了一个“接口”',
              '用指定初始化器 .hw_init=... 给每个对象填入各自的实现函数',
              '不支持的操作把指针留为 NULL，表示“可选/不提供”',
              '调用方遍历对象、判空后统一分发——一份循环驱动多种实现',
            ],
            explanation: '这正是 amdgpu 初始化的骨架原型。真实代码里 struct amdgpu_ip_block_version 持有一个 const struct amd_ip_funcs *funcs，里面是 .sw_init/.hw_init/.hw_fini/.suspend/.resume 等一长串函数指针；GFX、SDMA、DC、VCN 等每个 IP block 各自填入实现，amdgpu_device_ip_init 等函数则统一遍历、判空、分发。把这节课的 50 行原型读透，再看 amdgpu 的 IP 初始化就会非常眼熟。下一组我们会看到 C++ 用 virtual 函数把这套手写机制变成语言原生特性。',
          },
          miniLab: {
            title: '用函数指针实现一个 mini 多态分发器',
            objective: '亲手定义 ops 接口、填入多种实现、用统一循环分发，体会 C 多态',
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
              '编译运行：gcc -Wall -o lab lab.c && ./lab',
              '确认同一个循环对 rect 和 tri 调用了不同的 area 实现（多态）',
              '新增一个 circle 形状：写 circle_area + 定义 CIRCLE ops，加进数组，无需改动分发循环',
              '把某个 ops 的 area 设为 NULL，并在调用前加 if (s->ops->area) 判空，体会“可选操作”',
            ],
            expectedOutput: `rect area=12.0
tri  area=24.0`,
            hint: '多态的关键：调用方只依赖 ops 接口（struct shape_ops），不关心具体是 rect 还是 tri。新增类型只需提供新实现并填表，分发循环一行都不用改——这就是“对扩展开放”。',
          },
          debugExercise: {
            title: '找出这个分发为什么会段错误',
            description: '下面遍历 IP block 调用 hw_init，但程序在第二个 block 崩溃。',
            buggyCode: `struct ip_funcs { int (*hw_init)(void); };
struct ip_block { const struct ip_funcs *funcs; };

static int gfx_init(void){ return 0; }
static const struct ip_funcs gfx = { gfx_init };
static const struct ip_funcs sdma = { 0 };   /* hw_init 没填，为 NULL */

void init_all(struct ip_block *blocks, int n) {
    for (int i = 0; i < n; i++)
        blocks[i].funcs->hw_init();   /* 直接调用，没判空 */
}`,
            language: 'c',
            question: 'sdma 的 hw_init 是 NULL。直接 blocks[i].funcs->hw_init() 会发生什么？',
            hint: '调用一个值为 NULL 的函数指针会跳转到地址 0。',
            answer: '第二个 block（sdma）的 hw_init 是 NULL，blocks[i].funcs->hw_init() 等于调用地址 0 处的“函数”，触发段错误（在内核里就是 NULL 指针解引用 oops）。修法是遵循内核惯例，调用前判空：`if (blocks[i].funcs->hw_init) blocks[i].funcs->hw_init();`。ops 结构体里的函数指针为 NULL 是合法且常见的——表示该对象不提供这个可选操作，调用方有责任先检查再调用。',
          },
          interviewQ: {
            question: 'C 没有类和虚函数，如何实现多态？请以内核的 ops 结构体为例说明，并谈谈它和 C++ 虚函数的关系。',
            difficulty: 'medium',
            hint: '从“一组函数指针 = 手写虚表”切入，对比 C++ vtable。',
            answer: 'C 用“函数指针 + ops 结构体”手写多态：把一类操作声明为一组函数指针字段（struct xxx_ops），不同对象在自己的实例里填入不同实现，再让一个指针（常是 obj->ops）指向对应的 ops 表；调用方只通过 obj->ops->method(obj) 统一分发，具体执行哪份实现取决于对象填了哪张表。这本质上就是手工版的虚函数表（vtable）：C++ 的虚函数由编译器自动为每个含虚函数的类生成一张 vtable，对象头部放一个隐藏的 vptr 指向它，obj->method() 经 vptr 间接跳转——和 C 手写 ops 一一对应，区别只是 C++ 把建表、填表、间接调用自动化了，并加上了类型检查与继承支持。内核选择手写 ops 是出于对 ABI、内存布局和零隐藏开销的精确控制。理解了 ops 结构体，C++ 的虚函数就是“同一思想的语言内建版”。',
            amdContext: 'amdgpu 的 amd_ip_funcs、ttm_resource_manager_func、dma_fence_ops、drm_driver 等都是 ops 结构体多态。面试常让你对比 C ops 与 C++ 虚函数——答出“ops 是手写 vtable，virtual 是编译器自动化的 vtable”即切中要害。',
          },
        },
      ],
    },
    {
      id: 'cc-cpp',
      number: '0.7.2',
      title: 'C++ 训练',
      titleEn: 'C++ Training',
      icon: 'Puzzle',
      description: '在 C 的地基上，循序渐进地学习 C++ 中与系统/驱动相关的核心：引用与重载、类与 RAII、拷贝/移动、继承与虚函数、模板、STL 与智能指针。重点是 Mesa、ROCm/HIP、LLVM 这些 C++ 代码库里真正会用到的部分。',
      lessons: [
        {
          id: 'cc-cpp-1',
          number: '0.7.2.1',
          title: '从 C 到 C++：引用、重载与命名空间',
          titleEn: 'From C to C++: References, Overloading & Namespaces',
          duration: 16,
          tags: ['C++', 'reference', 'overload'],
          concept: {
            summary: 'C++ 在 C 之上加了一层“更安全、更有表达力”的语法。先掌握引用、函数重载、命名空间、bool/nullptr/auto，就能读懂 Mesa、ROCm/HIP、LLVM 里最基础的 C++ 代码。',
            explanation: [
              '引用（reference）是“变量的别名”：int &r = x; 之后 r 就是 x，对 r 的操作直接作用于 x。它必须在定义时绑定、且不能改绑。相比指针，引用语法更干净、不会是 NULL（正常情况下）、不需要解引用符号，常用于函数参数避免拷贝：void scale(Vec &v, float s)。',
              '函数重载（overloading）：同名函数可以有不同参数列表，编译器按实参类型选择匹配的版本。C 不支持（链接器只认函数名），C++ 通过“名字改写”（name mangling）把参数类型编码进符号名，于是 print(int) 和 print(double) 是两个不同符号。',
              '命名空间（namespace）把名字分组，避免大型项目里的符号冲突：amd::compute::launch 与 mesa::launch 互不干扰。用 :: 限定访问，或用 using 引入。它取代了 C 里“给每个函数加模块前缀”（如 amdgpu_xxx）的手工做法。',
              '其它 C→C++ 的直接升级：true/false 的 bool 类型；用 nullptr 取代 NULL（类型更安全）；用 auto 让编译器推导类型（写迭代器、模板返回值时尤其有用）；new/delete 取代 malloc/free（且会调用构造/析构函数，见下一课）。',
              '引用的本质是"初始化后不可重绑定的别名"：没有空引用、没有引用算术、不能改指向——这三条"不可能"正是它比指针安全的全部来源。const T& 还有一个特权：绑定到临时对象并把临时的生命周期延长到引用作用域结束（函数参数写 const std::string& 能直接接住字符串字面量就是这个机制）。选择引用还是指针的经验法则：可空或需要中途重定向用指针，其余一律引用。',
              'extern "C" 的机制值得说透：C++ 为支持重载把参数类型编进符号名（name mangling，clamp_val(int,int,int) 变成 _Z9clamp_valiii），而 C 符号就是裸名字。extern "C" 关闭改编，让 C++ 代码能链接 C 库、C 代码能调用 C++ 实现的接口。整个 GPU 用户态栈靠它缝合：libdrm 暴露 C 接口，Mesa 内部是 C++，边界上全是 extern "C"。配套刷题：cpp-01（重载与引用交换）。',
            ],
            keyPoints: [
              '引用是别名：必须初始化、不可改绑、无需解引用、正常不为 NULL',
              '函数重载靠 name mangling 实现；C 不支持同名函数',
              'namespace 分组名字，取代 C 的手工前缀，避免符号冲突',
              'bool/true/false、nullptr、auto、new/delete 是常用的 C→C++ 升级',
              '引用 = 不可重绑定的非空别名，const& 可延长临时对象生命周期；extern "C" 关闭 name mangling——C/C++ 边界的缝合线',
            ],
          },
          diagram: {
            title: '引用 vs 指针，以及重载的名字改写',
            content: `  指针 vs 引用
    int x = 10;
    int *p = &x;     int &r = x;   // r 是 x 的别名
    *p = 20;         r = 20;       // 两者都把 x 改成 20
    p  可改指向别处   r  绑定后不可改绑
    p  可为 nullptr   r  正常不为空、必须初始化

  函数重载 → 名字改写（name mangling，示意）
    void print(int);      → 符号 _Z5printi
    void print(double);   → 符号 _Z5printd
    void print(const char*);→ 符号 _Z5printPKc
    编译器按实参类型选版本；链接器按改写后的符号区分

  命名空间
    namespace amd { namespace compute { void launch(); } }
    amd::compute::launch();   // 限定调用，避免与别处的 launch 冲突`,
            caption: '引用是“不可改绑、无需解引用、正常非空”的别名；重载靠把参数类型编码进符号名实现；命名空间取代手工前缀。',
          },
          codeWalk: {
            title: '引用参数、重载与命名空间的最小实例',
            file: '示意：C++ 基础',
            language: 'cpp',
            code: `#include <cstdio>

namespace gpu {                       /* 1 命名空间分组 */
    struct Vec3 { float x, y, z; };

    /* 引用参数：直接修改调用者的对象，无拷贝、无指针语法 */
    void scale(Vec3 &v, float s) {    /* 2 Vec3& 是别名 */
        v.x *= s; v.y *= s; v.z *= s;
    }

    /* 函数重载：同名不同参 */
    void print(int n)        { printf("int %d\\n", n); }       /* 3 */
    void print(const Vec3 &v){ printf("vec %.1f %.1f %.1f\\n", v.x, v.y, v.z); }
}

int main() {
    gpu::Vec3 v{1, 2, 3};             /* 4 :: 限定访问命名空间 */
    gpu::scale(v, 2.0f);              /*    v 被就地修改，无需 &v */
    gpu::print(42);                   /*    选 print(int) */
    gpu::print(v);                    /*    选 print(const Vec3&) */
    auto *p = &v;                     /* 5 auto 推导出 gpu::Vec3* */
    if (p != nullptr) gpu::print(*p);
    return 0;
}`,
            annotations: [
              'namespace 把 Vec3/scale/print 归到 gpu 下，避免与其它库重名',
              'Vec3& 引用参数：函数内对 v 的修改直接反映到调用者，语法比指针干净',
              '两个同名 print 靠参数类型区分，由编译器在调用点选择',
              '用 {} 初始化、用 :: 访问命名空间成员',
              'auto 推导类型；nullptr 是类型安全的空指针字面量',
            ],
            explanation: 'Mesa、ROCm/HIP 运行时、LLVM 都是 C++ 代码库，引用参数、重载、命名空间在其中随处可见。比如 HIP API 大量用引用传递配置对象，LLVM 用 namespace llvm 包裹一切。先把这几个“C 没有但天天用”的特性吃透，再去读这些代码就不会被语法绊住。注意 AMD 的内核态驱动（amdgpu）仍是纯 C——C++ 主要出现在用户态与编译器栈。',
          },
          miniLab: {
            title: '用 c++filt 看穿名字改写',
            objective: '验证引用就地修改、重载选择，并用 c++filt 还原被改写的符号名',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-1 && cd ~/amd-labs/cc-cpp-1',
            language: 'cpp',
            code: `// lab.cpp
#include <cstdio>
void tweak(int &a) { a += 100; }       // 引用参数
int sq(int x)    { return x * x; }      // 重载 1
double sq(double x){ return x * x; }    // 重载 2

int main() {
    int v = 1; tweak(v);
    printf("v=%d sq(3)=%d sq(2.5)=%.2f\\n", v, sq(3), sq(2.5));
    return 0;
}`,
            steps: [
              '编译运行：g++ -Wall -o lab lab.cpp && ./lab，确认 v 被 tweak 改成 101',
              '查看重载产生的两个不同符号：nm lab | grep sq',
              '把改写名还原：nm lab | grep sq | c++filt（会显示 sq(int) 与 sq(double)）',
              '把 tweak 的参数 int& 改成 int（值传递），重新运行，观察 v 不再改变',
            ],
            expectedOutput: `v=101 sq(3)=9 sq(2.5)=6.25
# c++filt 还原后可见：
#   sq(int)
#   sq(double)`,
            hint: '引用参数 = 传别名，函数内的修改对调用者可见（等效于传指针但语法更干净）。重载之所以可行，是因为编译器把参数类型编码进了符号名（mangling），c++filt 能把它解码回人类可读形式。',
          },
          debugExercise: {
            title: '找出这个“本应被修改”的参数为何没变',
            description: '下面想通过函数把计数器加一，但调用后计数器还是原值。',
            buggyCode: `#include <cstdio>
void inc(int n) {     // 注意参数类型
    n = n + 1;
}
int main() {
    int count = 41;
    inc(count);
    printf("%d\\n", count);   // 期望 42，实际仍是 41
}`,
            language: 'cpp',
            question: 'inc 的参数是 int（值传递）还是 int&（引用）？函数内改的是谁？',
            hint: '值传递只会修改实参的一份副本，函数返回后副本就没了。',
            answer: '参数 int n 是值传递，inc 内修改的是 count 的一份副本，函数返回后副本销毁，count 本身不变，所以仍是 41。修法是把参数声明为引用：void inc(int &n) { n = n + 1; }，这样 n 就是 count 的别名，修改直接作用于调用者的变量。这正是 C++ 引用相对 C 指针的便利之处——语义等同于传指针，但调用处不用写 &、函数内不用写 *。若不希望修改、只想避免拷贝大对象，则用 const 引用：void f(const Big &b)。',
          },
          interviewQ: {
            question: '引用和指针有什么区别？为什么 C++ 能函数重载而 C 不能？',
            difficulty: 'easy',
            hint: '引用从“别名、不可改绑、非空”切入；重载从 name mangling 切入。',
            answer: '引用是已存在对象的别名：必须在定义时绑定、之后不能改绑到别的对象、正常情况下不为空、使用时不需要解引用符号；指针是独立变量，存着地址，可以为 nullptr、可以改指向、需要 * 解引用、本身也占内存。语义上引用更像“就是那个对象”，常用于参数传递（避免拷贝）和返回别名；指针更灵活（可空、可重指、可做指针算术）。C++ 支持函数重载是因为它做“名字改写”（name mangling）：把参数类型编码进符号名，于是 print(int) 与 print(double) 生成不同符号，链接器能区分；而 C 的符号名就是函数名本身，同名函数会冲突，所以不支持重载。补充：因为 mangling 规则不同，C++ 要调用 C 函数或暴露 C 接口时需用 extern "C" 关闭改写。',
            amdContext: 'HIP/ROCm 运行时与 Mesa 大量使用引用参数和重载；与内核态 C 代码（amdgpu）交互的边界上常见 extern "C"。理解引用与重载是读用户态 GPU 栈的入门门槛。',
          },
        },
        {
          id: 'cc-cpp-2',
          number: '0.7.2.2',
          title: '类、构造/析构与 RAII',
          titleEn: 'Classes, Constructors/Destructors & RAII',
          duration: 18,
          tags: ['C++', 'class', 'RAII'],
          concept: {
            summary: '类把数据和操作绑在一起；构造函数在对象诞生时初始化、析构函数在对象销毁时清理。把“获取资源放进构造、释放资源放进析构”，就是 RAII——C++ 管理资源的核心思想。',
            explanation: [
              '类（class/struct）= 数据成员 + 成员函数 + 访问控制（private/public）。成员函数隐含一个 this 指针指向当前对象。class 默认 private、struct 默认 public，其余等价。',
              '构造函数在对象创建时自动调用，负责把对象置于有效状态（常用成员初始化列表 : a_(x), b_(y) 直接初始化成员）；析构函数 ~T() 在对象销毁时自动调用，负责释放它持有的资源。两者都不用手动调用。',
              'RAII（Resource Acquisition Is Initialization）：让对象的“构造”获取资源（内存、锁、文件、GPU buffer），“析构”释放资源。由于栈对象在离开作用域时一定会析构（包括正常返回、break、甚至抛异常），资源释放就被语言机制保证了——不会忘、顺序还自动逆序。',
              '对比 C 的 goto 清理（cc-c-6）：RAII 把那套“手工逆序释放”交给编译器自动完成。一个函数里即便有十个提前返回点，每个栈对象的析构也都会被正确触发，从根上消灭“忘记清理/漏一级”的 bug。',
              '构造与析构的顺序规则要背到条件反射：成员按"声明顺序"构造（与初始化列表里的书写顺序无关——两者不一致时 GCC 会给 -Wreorder 警告），析构严格逆序；基类构造先于成员、析构晚于成员。这条规则决定了成员之间的依赖只能"后面依赖前面"。局部对象则按定义顺序构造、作用域退出时逆序析构。',
              'RAII 与异常安全的连带关系：栈展开（stack unwinding）时析构函数被自动执行，这是 RAII 能守住资源的根基；但如果析构函数自己再抛异常、且此时已有异常在飞行，程序直接 std::terminate——所以析构函数默认 noexcept，清理代码必须"不会失败"或把失败吞掉记日志。GPU 用户态栈（Mesa/ROCm）大多禁用异常，但 RAII 的价值不减：提前 return 与错误路径同样触发析构。配套刷题：cpp-02（构造析构顺序追踪）、cpp-03（RegionGuard 三路径平衡）。',
            ],
            keyPoints: [
              '类 = 数据 + 方法 + 访问控制；成员函数隐含 this',
              '构造函数初始化对象（优先用成员初始化列表），析构函数清理资源',
              'RAII：构造获取资源、析构释放资源，绑定到对象生命周期',
              '栈对象离开作用域必定析构 → 资源释放被语言保证，取代 goto 清理',
              '成员按声明序构造、逆序析构（与初始化列表书写顺序无关）；析构函数默认 noexcept——清理逻辑不允许失败',
            ],
          },
          diagram: {
            title: 'RAII：资源释放绑定到作用域',
            content: `  C 手工清理                 C++ RAII（自动）
  ───────────────            ──────────────────
  p = malloc(n);             {
  if (!p) goto err;            Buffer b(n);   // 构造：分配
  lock(&m);                    Lock g(m);     // 构造：加锁
  if (x) goto unlock;          if (x) return; // ← 提前返回也安全
  ...                          ...
  unlock: unlock(&m);          }  // 作用域结束：g 先析构(解锁)，
  err:    free(p);                //            b 后析构(释放)，逆序自动

  对象生命周期与析构时机：
    进入作用域 → 构造（acquire）
         ┌─────────────── 使用 ───────────────┐
    离开作用域(return/break/异常) → 析构（release）  ← 一定发生`,
            caption: 'RAII 把资源释放挂到对象析构上；只要对象是栈上的，离开作用域时析构必然发生，且按构造的逆序进行。',
          },
          codeWalk: {
            title: '一个 RAII 缓冲区包装器',
            file: '示意：RAII Buffer',
            language: 'cpp',
            code: `#include <cstdio>
#include <cstdlib>

class Buffer {
public:
    explicit Buffer(size_t n)            /* 1 构造：获取资源 */
        : size_(n), data_(static_cast<int*>(std::malloc(n * sizeof(int)))) {
        printf("  acquire %zu ints\\n", n);
    }
    ~Buffer() {                          /* 2 析构：释放资源（自动调用）*/
        std::free(data_);
        printf("  release\\n");
    }
    int &operator[](size_t i) { return data_[i]; }  /* 3 像数组一样用 */
    size_t size() const { return size_; }
private:
    size_t size_;
    int *data_;
};

void use_gpu_cmd() {
    Buffer b(4);                         /* 4 进入：构造 */
    for (size_t i = 0; i < b.size(); i++) b[i] = (int)i;
    printf("  b[3]=%d\\n", b[3]);
    if (b[3] == 3) return;               /* 5 提前返回：b 仍会被析构 */
}                                        /*   离开作用域：~Buffer() 自动跑 */

int main() { puts("enter"); use_gpu_cmd(); puts("left"); return 0; }`,
            annotations: [
              '构造函数获取资源（这里 malloc 一块缓冲区），并用成员初始化列表设置成员',
              '析构函数释放资源；它在对象销毁时由编译器自动调用，无需手动',
              '重载 operator[] 让对象用起来就像原生数组',
              '在函数里用栈对象 Buffer b(4)：进入即构造',
              '即使中途 return，离开作用域时 ~Buffer() 也一定被调用——这就是 RAII 的保证',
            ],
            explanation: '注意看输出顺序：acquire 在进入函数时打印，release 在函数返回时打印——即便那次返回是提前 return。这就是 RAII：你不再需要 C 的 goto unlock/err 阶梯，资源释放由对象析构自动、逆序地完成。Mesa、HIP、LLVM 里管理 GPU buffer、锁、文件句柄几乎都用这种 RAII 包装器；C++ 标准库的 std::lock_guard、std::unique_ptr（后面会学）也都是 RAII 的具体落地。',
          },
          miniLab: {
            title: '证明析构总会发生（哪怕提前返回/异常）',
            objective: '通过打印构造/析构时机，亲眼确认 RAII 对资源释放的保证',
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
    Guard b("B");                 // 构造顺序 A, B
    if (early) return;            // 观察析构是否仍发生
    if (throw_it) throw std::runtime_error("boom");
    printf("  ...body...\\n");
}                                 // 析构逆序 B, A

int main() {
    puts("normal:");   demo(false, false);
    puts("early ret:");demo(true,  false);
    puts("exception:");try { demo(false, true); } catch (...) { puts("  caught"); }
    return 0;
}`,
            steps: [
              '编译运行：g++ -Wall -fexceptions -o lab lab.cpp && ./lab',
              '观察每种情形下析构 (-B, -A) 都发生，且永远是构造的逆序',
              '注意“early ret”路径：没执行函数体，但 A、B 仍被析构',
              '注意“exception”路径：抛异常时栈展开也会触发析构（异常安全）',
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
            hint: '构造按声明顺序、析构按逆序。无论函数怎样离开（正常结束、提前 return、抛异常），栈对象的析构都会发生——这正是 RAII 能可靠管理资源、实现异常安全的根本。',
          },
          debugExercise: {
            title: '找出这个类为什么会泄漏内存',
            description: '下面的类在构造里分配了内存，但运行后 ASan 报泄漏。',
            buggyCode: `#include <cstdlib>
class Ring {
public:
    explicit Ring(size_t n) {
        buf_ = (int*)std::malloc(n * sizeof(int));   // 构造里分配
    }
    // 没有写析构函数
private:
    int *buf_;
};
void f() {
    Ring r(1024);   // 离开作用域时……谁来 free buf_？
}`,
            language: 'cpp',
            question: '这个类在析构时释放 buf_ 了吗？默认析构函数会帮你 free 吗？',
            hint: '编译器生成的默认析构函数只会析构成员本身，不会 free 你 malloc 的裸内存。',
            answer: '会泄漏。Ring 在构造里 malloc 了 buf_，但没有定义析构函数；编译器自动生成的默认析构函数只销毁成员变量（这里 buf_ 只是个指针，销毁指针不会 free 它指向的堆内存）。于是 r 离开作用域时 buf_ 指向的 1024 个 int 无人释放。修法：提供析构函数 ~Ring() { std::free(buf_); }，让 RAII 生效。更现代的做法是干脆不用裸指针——用 std::vector<int> 或 std::unique_ptr<int[]> 作为成员，它们自带 RAII，连析构函数都不用写（见 STL 与智能指针一课）。这也引出下一课的问题：一旦类持有裸资源，拷贝时又会怎样？',
          },
          interviewQ: {
            question: '什么是 RAII？它如何替代 C 的 goto 清理，又为什么对异常安全至关重要？',
            difficulty: 'medium',
            hint: '把“资源释放绑定到对象析构”和“栈展开必触发析构”两点讲透。',
            answer: 'RAII（资源获取即初始化）是 C++ 的资源管理范式：把资源的获取写在构造函数、释放写在析构函数，于是资源的生命周期与对象的生命周期绑定。因为栈对象在离开作用域时一定会被析构、且按构造的逆序，所以资源释放被语言机制保证，不必像 C 那样在每个失败/返回点手工 goto 清理——一个函数即使有多个提前 return，每个栈对象也都会被正确析构。对异常安全更是关键：当异常抛出时会发生“栈展开”，沿途所有已构造的栈对象都会被析构，因此用 RAII 持有的锁、内存、文件会被自动释放，不会因为异常跳过了手写的清理代码而泄漏。标准库的 lock_guard、unique_ptr、vector 都是 RAII 的体现。一句话：RAII 用“析构必然发生”这个保证，把资源管理从“程序员记得清理”变成“编译器自动清理”。',
            amdContext: '虽然 amdgpu 内核驱动是 C（靠 goto 清理），但用户态 GPU 栈（Mesa、HIP、ROCm 运行时、LLVM）是 C++，RAII 包装 GPU buffer、command stream、锁是日常写法。理解 RAII 才能读懂这些代码的资源管理，也能反过来更深刻地理解内核为何要用 goto。',
          },
        },
        {
          id: 'cc-cpp-3',
          number: '0.7.2.3',
          title: '拷贝、移动与资源管理',
          titleEn: 'Copy, Move & Resource Management',
          duration: 19,
          tags: ['C++', 'move', 'copy'],
          concept: {
            summary: '一旦类持有裸资源，拷贝它就可能让两个对象指向同一块内存，析构时二次释放。理解拷贝/移动语义、Rule of Three/Five，是安全管理资源的关键。',
            explanation: [
              '默认拷贝是“浅拷贝”：编译器自动生成的拷贝构造/拷贝赋值会逐成员复制。对持有裸指针的类，这意味着两个对象的指针指向同一块堆内存——其中一个析构 free 后，另一个就成了悬空指针，第二次析构则 double free。',
              'Rule of Three：如果你需要自定义析构函数（因为类管理资源），那通常也需要自定义拷贝构造和拷贝赋值（做“深拷贝”：各自分配、各自拥有），三者要么都写、要么都用编译器默认。',
              '移动语义（move）：很多时候我们不想“复制资源”，只想把所有权从一个对象“转移”给另一个（如函数返回一个大对象、把对象放进容器）。移动构造/移动赋值接收右值引用 T&&，把源对象的指针“偷”过来、再把源置空，实现 O(1) 的所有权转移。',
              'std::move 只是把对象“标记为可被移动”（转成右值引用），真正的搬运由移动构造/赋值完成。Rule of Five：管理资源的类通常要考虑析构 + 拷贝构造 + 拷贝赋值 + 移动构造 + 移动赋值。现实中更推荐：用 vector/unique_ptr 等已实现好这些的类型作成员，自己就一个都不用写。',
              '特殊成员函数的生成规则是本课的题眼：写了析构/拷贝构造/拷贝赋值中的任何一个，编译器就不再自动生成移动操作（退回逐成员拷贝）；写了移动操作，拷贝操作被隐式删除。所以现代守则是两个极端：要么什么都不写（Rule of Zero，让 vector/unique_ptr 成员代劳），要么五个全写（Rule of Five）。中间态"只写析构"是性能陷阱——类悄悄失去移动能力，push_back 全变深拷贝。',
              '被移动对象的标准约定是"有效但未指定"（valid but unspecified）：必须仍可安全析构和赋新值，但不承诺具体内容——所以移动构造里把源指针置 nullptr 不是可选项而是义务（源的析构还会执行）。noexcept 的商业价值再强调一次：vector 扩容在移动可能抛异常时退回拷贝（强异常安全要求），漏标 noexcept 会静默丢掉全部移动收益——可以用 static_assert(std::is_nothrow_move_constructible_v<T>) 上保险。配套刷题：cpp-04（Rule of Three 深拷贝）、cpp-05（移动语义）、cpp-06（手搓 UniquePtr）。',
            ],
            keyPoints: [
              '默认拷贝是浅拷贝；持有裸指针的类浅拷贝 → 二次释放',
              'Rule of Three：要析构就通常也要拷贝构造 + 拷贝赋值（深拷贝）',
              '移动语义转移所有权（偷指针 + 源置空），O(1) 而非复制',
              'std::move 只是转成右值引用；优先用 vector/unique_ptr 免写这些',
              '声明了析构就不再自动生成移动——Rule of Zero 或 Rule of Five，别停在中间；移动后的源对象必须仍可安全析构',
            ],
          },
          diagram: {
            title: '浅拷贝灾难 vs 移动转移所有权',
            content: `  浅拷贝（默认）— 危险
    Buffer a(n);        a.data ─┐
    Buffer b = a;       b.data ─┴─► [同一块堆内存]
    // a、b 的 data 指向同一处
    // 作用域结束：~b free 一次，~a 再 free 一次 → double free！

  深拷贝（Rule of Three）— 安全但有复制开销
    Buffer b = a;       a.data ─► [内存1]
                        b.data ─► [内存2 复制自内存1]

  移动（转移所有权）— 安全且高效 O(1)
    Buffer b = std::move(a);
        before:  a.data ─► [内存]      b.data = ?
        after:   a.data = nullptr      b.data ─► [内存]
        // 把指针“偷”给 b，并把 a 置空；~a 析构空指针无害`,
            caption: '浅拷贝让两个对象共享并争相释放同一块内存。深拷贝各自复制一份；移动则把所有权整体搬走并把源置空。',
          },
          codeWalk: {
            title: '为持有资源的类实现拷贝与移动',
            file: '示意：Rule of Five',
            language: 'cpp',
            code: `#include <cstdio>
#include <cstring>
#include <utility>   // std::move

class Buffer {
public:
    explicit Buffer(size_t n) : n_(n), p_(new int[n]) {}
    ~Buffer() { delete[] p_; }                       /* 1 析构释放 */

    Buffer(const Buffer &o) : n_(o.n_), p_(new int[o.n_]) {   /* 2 深拷贝 */
        std::memcpy(p_, o.p_, n_ * sizeof(int));
        puts("copy");
    }
    Buffer(Buffer &&o) noexcept : n_(o.n_), p_(o.p_) {        /* 3 移动：偷指针 */
        o.p_ = nullptr; o.n_ = 0;                             /*    源置空 */
        puts("move");
    }
    Buffer &operator=(Buffer o) {       /* 4 copy-and-swap：拷贝/移动赋值二合一 */
        std::swap(n_, o.n_); std::swap(p_, o.p_);
        return *this;
    }
    size_t size() const { return n_; }
private:
    size_t n_; int *p_;
};

int main() {
    Buffer a(4);
    Buffer b = a;             /* 5 调用拷贝构造 → "copy" */
    Buffer c = std::move(a);  /* 6 调用移动构造 → "move"，a 被掏空 */
    printf("b=%zu c=%zu a=%zu\\n", b.size(), c.size(), a.size());
    return 0;
}`,
            annotations: [
              '析构函数 delete[] 释放数组——一旦有它，就要考虑拷贝/移动（Rule of Three/Five）',
              '拷贝构造做深拷贝：自己 new 一块、memcpy 内容，两对象互不干扰',
              '移动构造把源的指针偷过来、再把源置 nullptr——O(1)，且源析构无害',
              '用 copy-and-swap 惯用法实现赋值：按值收参（触发拷贝或移动），再 swap',
              'Buffer b = a 触发拷贝；Buffer c = std::move(a) 触发移动，a.size() 变 0',
            ],
            explanation: '这就是 Rule of Five 的完整样貌：析构 + 拷贝构造 + 移动构造 + 统一的赋值（copy-and-swap 同时覆盖拷贝赋值与移动赋值）。移动语义让“返回大对象”“把对象塞进 vector”不再昂贵复制，而是转移所有权。但请记住实战的黄金法则：尽量别自己写这些——用 std::vector<int> 当成员，上面整个类的资源管理代码都能删光，编译器默认的拷贝/移动就正确高效。手写 Rule of Five 是为了理解机制，真正写代码时优先复用标准库容器与智能指针。',
          },
          miniLab: {
            title: '观察拷贝与移动各自何时发生',
            objective: '通过给拷贝/移动加打印，看清返回值、std::move、入容器时触发的是哪一个',
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
    R c = std::move(a);  // move（a.id 变 -1）
    std::vector<R> v;
    v.reserve(2);
    v.push_back(R(2));         // 临时对象 → move 进容器
    v.push_back(std::move(b)); // 显式 move 进容器
    puts("-- end --");
    return 0;
}`,
            steps: [
              '编译运行：g++ -std=c++17 -Wall -o lab lab.cpp && ./lab',
              '区分输出里的 copy 与 move：R b = a 是 copy，R c = std::move(a) 是 move',
              '观察 push_back(R(2)) 把临时对象 move 进 vector（而非 copy）',
              '尝试去掉 v.reserve(2)，push 更多元素触发扩容，观察元素被 move 到新内存',
            ],
            expectedOutput: `ctor 1
copy 1
move 1
ctor 2
move 2
move 1
-- end --
dtor ...`,
            hint: 'std::move 不“移动”任何东西，它只是把对象转成右值引用，从而让编译器选择移动构造/赋值。真正的搬运发生在移动构造里（偷指针 + 源置空）。返回值、入容器、显式 std::move 都是常见的移动触发点。',
          },
          debugExercise: {
            title: '找出这个共享缓冲区为何二次释放',
            description: '下面的类只写了析构函数，没处理拷贝。把它放进 vector 后程序崩溃（double free）。',
            buggyCode: `#include <cstdlib>
#include <vector>
class Buf {
public:
    explicit Buf(size_t n){ p_ = (int*)std::malloc(n*4); }
    ~Buf(){ std::free(p_); }      // 只有析构，没有拷贝构造/赋值
private:
    int *p_;
};
int main(){
    std::vector<Buf> v;
    v.push_back(Buf(16));   // 临时对象被拷贝进容器，然后两者都析构
}`,
            language: 'cpp',
            question: 'Buf 没有自定义拷贝构造，编译器生成的默认拷贝会怎么复制 p_？两个对象析构时各发生什么？',
            hint: '默认拷贝是浅拷贝：两个 Buf 的 p_ 指向同一块内存。各自析构都会 free 它。',
            answer: '违反了 Rule of Three。Buf 有自定义析构（free p_），却用了编译器默认的浅拷贝构造，于是把临时 Buf(16) 拷进 vector 时，容器内对象与临时对象的 p_ 指向同一块内存；随后临时对象析构 free 一次，容器元素析构再 free 一次 → double free 崩溃。修法：(1) 按 Rule of Three 补上深拷贝的拷贝构造与拷贝赋值（各自分配、复制内容）；(2) 或定义移动构造/赋值并禁用拷贝，使其只能移动；(3) 最佳实践——把成员换成 std::vector<int> 或 std::unique_ptr<int[]>，让它们自带正确的拷贝/移动，Buf 连析构都不用写。这题正是“持有裸资源就必须管好拷贝/移动”的活教材。',
          },
          interviewQ: {
            question: '什么是 Rule of Three/Five？移动语义解决了什么问题，std::move 到底做了什么？',
            difficulty: 'hard',
            hint: '从“自定义析构就要管拷贝”讲起，再到移动转移所有权与 std::move 的真实含义。',
            answer: 'Rule of Three：若一个类需要自定义析构函数、拷贝构造、拷贝赋值中的任意一个（通常因为它管理裸资源），那三个一般都要自定义，否则默认的浅拷贝会与你的析构冲突，导致二次释放或泄漏。Rule of Five 在此基础上加上移动构造与移动赋值，因为一旦你声明了拷贝/析构，编译器就不再自动生成移动操作。移动语义解决的问题是“不必要的深拷贝开销”：当源对象即将消亡（临时对象、std::move 标记的对象）时，没必要复制其资源，直接把资源的所有权（如堆指针）从源转移给目标、再把源置于可析构的空状态即可，复杂度 O(1)。std::move 本身不搬运任何数据，它只是一个把左值强制转换成右值引用的类型转换，作用是“告诉重载决议：这个对象可以被移动”，真正的搬运由匹配到的移动构造/移动赋值完成。实践建议（Rule of Zero）：尽量用 vector、string、unique_ptr、shared_ptr 这些已正确实现五大操作的类型作为成员，自己一个都不用写。',
            amdContext: '在 Mesa/HIP/LLVM 中，命令缓冲、shader 模块、GPU 资源句柄常以“可移动、不可拷贝”的类型表达独占所有权（类似 unique_ptr 语义），通过移动把所有权交给容器或下游。理解移动语义才能读懂这些所有权转移代码。',
          },
        },
        {
          id: 'cc-cpp-4',
          number: '0.7.2.4',
          title: '继承、虚函数与多态',
          titleEn: 'Inheritance, Virtual Functions & Polymorphism',
          duration: 19,
          tags: ['C++', 'virtual', 'polymorphism'],
          concept: {
            summary: '继承让派生类复用并扩展基类；虚函数让“通过基类指针调用”时执行派生类的实现——这就是 C++ 的运行时多态，本质上是编译器自动生成的虚表，正是 cc-c-7 那套手写 ops 结构体的语言内建版。',
            explanation: [
              '继承：派生类 class Gfx : public IpBlock 获得基类的成员，并可新增/覆盖。public 继承表达“is-a”关系（Gfx 是一种 IpBlock）。',
              '虚函数与动态分发：基类把接口方法声明为 virtual，派生类用 override 覆盖。通过基类指针/引用调用该方法时，实际执行的是对象真实类型的版本（运行时决定），这叫动态分发；非虚函数则在编译期按静态类型绑定。',
              '虚表（vtable）：编译器为每个含虚函数的类生成一张函数地址表，对象头部藏一个 vptr 指向它；virtual 调用经 vptr 间接跳转。把它和 cc-c-7 的 ops 结构体对照：obj->vptr->method() 正对应 obj->ops->method(obj)——只是 C++ 自动建表、填表并做类型检查。',
              '纯虚函数与虚析构：= 0 的纯虚函数使类成为抽象基类（接口，不能实例化），强制派生类实现。极其重要的一条：当你可能通过基类指针 delete 派生对象时，基类析构函数必须是 virtual，否则只调用基类析构、派生部分不被清理，导致泄漏/UB。',
              '虚调用的真实开销要量化理解：一次虚调用 = 读 vptr → 查 vtable 槽位 → 间接跳转，比直接调用多一两次访存，且通常无法内联——不可内联才是主要代价（内联是后续一切优化的入口）。因此性能热路径上 C++ 还有一套"静态多态"工具（模板/CRTP，编译期绑定零开销），虚函数用于真正需要运行时可替换的边界：插件、后端、测试注入。LLVM 和 Mesa 的设计里两者的分界非常清晰。',
              '对象切片（slicing）是继承体系的第一杀手：把派生类对象按值赋给基类变量，派生部分被无声切掉，vptr 也变回基类——多态失效且数据丢失。防御手段：多态类型永远经由指针/引用/智能指针传递；基类把拷贝构造声明为 protected 或直接 delete；接口类（纯虚）天然不可实例化因此免疫。配套刷题：cpp-07（虚函数引擎）、cpp-08（IAllocator 接口注入）——对照 c-14 的 ops 表，体会"同一设计的两种拼写"。',
            ],
            keyPoints: [
              'public 继承表达 is-a；派生类复用并扩展基类',
              'virtual + override → 通过基类指针调用执行派生实现（动态分发）',
              '机制是 vtable + vptr，等价于自动化的 ops 结构体（对照 cc-c-7）',
              '纯虚函数(=0)构成抽象接口；经基类指针删除时基类析构必须 virtual',
              '虚调用的主要代价是不可内联而非跳转本身；多态对象永远按指针/引用传递——按值传递即切片',
            ],
          },
          diagram: {
            title: 'vtable 机制，以及与 C ops 结构体的对应',
            content: `  对象内存 + 虚表（vtable）
    IpBlock *p = new Gfx();
    ┌─────────────┐        ┌──────────────────────┐
    │ Gfx 对象     │        │  Gfx 的 vtable        │
    │  vptr ───────┼──────► │  [0] hw_init = Gfx::hw_init │
    │  (成员...)   │        │  [1] ~Gfx (virtual dtor)   │
    └─────────────┘        └──────────────────────┘
    p->hw_init();  // 经 vptr 找到 Gfx::hw_init —— 运行时决定

  C 手写 ops（cc-c-7）        ⇄    C++ 虚函数（本课）
  obj->ops->hw_init(obj)            obj->hw_init()
  程序员定义 struct ops             编译器自动生成 vtable
  程序员把对象的 ops 指过去         编译器在构造时设置 vptr
  无类型检查、需手动传 obj          有类型检查、this 隐式传入`,
            caption: '虚函数 = 编译器自动化的 ops 结构体：vptr 对应你手写的 ops 指针，vtable 对应那张函数指针表。',
          },
          codeWalk: {
            title: '把 cc-c-7 的 IP block 分发改写成 C++ 虚函数',
            file: '示意：抽象基类 + 派生',
            language: 'cpp',
            code: `#include <cstdio>
#include <vector>
#include <memory>

class IpBlock {                       /* 1 抽象基类 = 接口 */
public:
    virtual int  hw_init() = 0;       /* 2 纯虚函数：派生类必须实现 */
    virtual const char *name() const = 0;
    virtual ~IpBlock() = default;     /* 3 虚析构：经基类指针删除时安全 */
};

class Gfx : public IpBlock {          /* 4 public 继承（is-a）*/
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
    std::vector<std::unique_ptr<IpBlock>> blocks;   /* 6 基类指针的容器 */
    blocks.push_back(std::make_unique<Gfx>());
    blocks.push_back(std::make_unique<Sdma>());
    for (auto &b : blocks)            /* 7 统一分发：实际调用各自的实现 */
        printf("%-4s -> ret=%d\\n", b->name(), b->hw_init());
    return 0;   /* unique_ptr 析构 → 虚析构确保 Gfx/Sdma 正确销毁 */
}`,
            annotations: [
              '把接口方法声明为纯虚函数 (=0)，IpBlock 成为不能实例化的抽象基类',
              '派生类用 override 覆盖虚函数；写 override 让编译器帮你检查签名是否真的匹配',
              '基类析构声明为 virtual，保证经 IpBlock* 删除时调用到 Gfx/Sdma 的析构',
              '用 vector<unique_ptr<IpBlock>> 持有不同派生对象并自动管理生命周期',
              '一个循环通过基类接口分发，运行时各自执行——和 cc-c-7 的 C 版一一对应',
            ],
            explanation: '把这段和 cc-c-7 的 C 版并排看：C 里你手写 struct ip_funcs、给每个对象挂 ops 指针、调用时 obj->funcs->hw_init(obj)；C++ 里你写 virtual，编译器自动生成 vtable、在构造时设置 vptr、调用时 obj->hw_init() 经 vptr 分发，还顺带做类型检查并隐式传 this。两者是同一思想的两种表达。Mesa 的部分后端、LLVM 的 Pass/TargetMachine 等大量使用抽象基类 + 虚函数定义可扩展接口；而内核 amdgpu 选择 C 的 ops 结构体是为了精确控制 ABI 与零隐藏开销。',
          },
          miniLab: {
            title: '抽象接口、动态分发与“虚析构为何必须”',
            objective: '实现抽象基类 + 两个派生类，经基类指针分发，并验证缺少虚析构的后果',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-4 && cd ~/amd-labs/cc-cpp-4',
            language: 'cpp',
            code: `#include <cstdio>
#include <memory>
#include <vector>

struct Base {
    virtual void go() = 0;
    virtual ~Base() { puts("~Base"); }   // 试着删掉 virtual 看后果
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
    for (auto &p : v) p->go();      // 动态分发：A::go / B::go
    puts("-- destroy --");
    return 0;                       // 经 Base* 销毁，虚析构确保 ~A/~B 被调用
}`,
            steps: [
              '编译运行：g++ -std=c++17 -Wall -o lab lab.cpp && ./lab',
              '确认 p->go() 经基类指针调用到了 A::go、B::go（动态分发）',
              '观察销毁时 ~A → ~Base、~B → ~Base 都被调用（因为 ~Base 是 virtual）',
              '把 ~Base 的 virtual 去掉，加 -Wdelete-non-virtual-dtor 重新编译，观察告警，并注意派生析构 ~A/~B 不再被调用（泄漏/UB）',
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
            hint: '动态分发的前提是“通过基类指针/引用 + 虚函数”。而通过基类指针 delete 派生对象时，只有基类析构是 virtual，才会先调用派生析构再调用基类析构；否则派生部分被泄漏，是常见且危险的错误。',
          },
          debugExercise: {
            title: '找出这个“多态”为什么没生效',
            description: '下面期望通过基类指针调用到派生类的实现，但总是执行基类版本。',
            buggyCode: `#include <cstdio>
struct Shape {
    double area() { return 0; }          // 注意：没有 virtual
};
struct Circle : Shape {
    double r;
    Circle(double r): r(r) {}
    double area() { return 3.14159 * r * r; }  // 想覆盖 area
};
int main() {
    Shape *s = new Circle(2.0);
    printf("%.2f\\n", s->area());   // 期望 ~12.57，实际 0
    delete s;
}`,
            language: 'cpp',
            question: 'Shape::area 不是 virtual。通过 Shape* 调用 area() 时，按什么类型决定调用哪个版本？',
            hint: '非虚函数按指针的静态类型（Shape）绑定，不看对象的真实类型（Circle）。',
            answer: '因为 Shape::area 不是虚函数，s->area() 走静态绑定——按指针的静态类型 Shape 决定，于是调用 Shape::area 返回 0，而不是 Circle::area。这不是多态。修法：把基类方法声明为 virtual（virtual double area();），派生类用 override 覆盖；这样经 Shape* 调用会经 vtable 动态分发到 Circle::area。顺带，这个类还缺少 virtual 析构函数：delete s 经 Shape* 删除 Circle 对象时也应调用派生析构，所以应加 virtual ~Shape() = default;。口诀：想要运行时多态，基类接口方法和析构都要 virtual。',
          },
          interviewQ: {
            question: '虚函数是如何实现的（vtable/vptr）？为什么基类析构函数通常要声明为 virtual？它和 C 的 ops 结构体是什么关系？',
            difficulty: 'hard',
            hint: '讲清 vptr→vtable 的间接调用、虚析构的必要性，并对照 cc-c-7。',
            answer: '实现机制：编译器为每个含虚函数的类生成一张虚表（vtable），表里按槽位放各虚函数的地址；每个对象在构造时被植入一个隐藏指针 vptr 指向其真实类型的 vtable。通过基类指针调用虚函数时，生成的代码是“取对象的 vptr → 在 vtable 固定槽位取函数地址 → 间接调用”，因此运行时执行的是对象真实类型的实现，这就是动态分发。基类析构要 virtual 的原因：当通过基类指针 delete 一个派生对象时，若析构非虚，则只按静态类型调用基类析构，派生类新增的成员/资源不会被清理，造成泄漏或未定义行为；析构为 virtual 后，会先调派生析构再调基类析构，完整销毁。与 C ops 结构体的关系：二者是同一思想的两种实现——C 手写一个函数指针表（struct ops）并让对象持有指向它的指针，调用 obj->ops->fn(obj)；C++ 的 vtable 就是编译器自动生成的那张表，vptr 就是自动设置的那个指针，obj->fn() 就是自动化、带类型检查、隐式传 this 的 obj->ops->fn(obj)。理解了 cc-c-7 的 ops，就理解了 vtable 的本质。',
            amdContext: '内核 amdgpu 用 C ops 结构体（amd_ip_funcs、dma_fence_ops 等）实现多态；用户态 Mesa/LLVM 用 C++ 虚函数。能把“ops 结构体 ⇄ vtable”讲通，是同时读懂内核态与用户态 GPU 栈的关键，也是高频面试题。',
          },
        },
        {
          id: 'cc-cpp-5',
          number: '0.7.2.5',
          title: '模板与泛型编程',
          titleEn: 'Templates & Generic Programming',
          duration: 18,
          tags: ['C++', 'template', 'generic'],
          concept: {
            summary: '模板让你写一份“对类型参数化”的代码，编译器在用到时为每个具体类型生成一份实例。它是类型安全的泛型机制，取代了 C 里 void* 和宏的不安全做法，也是 STL 的基石。',
            explanation: [
              '函数模板：template <typename T> T max_of(T a, T b)。调用 max_of(3, 4) 时编译器推导 T=int 并实例化出一份 int 版本；max_of(2.5, 1.5) 再实例化 double 版本。一份源码，按需生成多份具体代码。',
              '类模板：template <typename T> class Array { T *data; ... }。Array<int> 与 Array<float> 是两个独立的类。STL 的 vector<T>、map<K,V> 都是类模板。',
              '模板是编译期机制：实例化在编译时完成，生成的代码和手写具体类型版本一样高效（无运行时开销），且有完整类型检查——这正是它优于 C 宏（纯文本替换、无类型检查、调试困难）和 void*（丢失类型、需强转、易错）的地方。',
              '一个工程要点：模板的定义通常要放在头文件里。因为编译器只有在“看到用什么类型实例化”时才能生成代码，如果把模板定义藏在某个 .cpp 里，其它翻译单元实例化时找不到定义，就会链接报错。',
              '模板的编译模型解释了它的一切怪癖：模板本身不是代码而是"生成代码的配方"，只有被具体类型使用（实例化）时编译器才为该类型生成一份函数/类。这带来三个推论：定义必须对使用点可见（所以模板放头文件）；每个用到的类型各产出一份机器码（代码膨胀的来源，资源受限场景要节制）；错误在实例化点才爆发（报错信息又长又深）。static_assert 是给模板加"前门检查"的工具——把违约在第一行用人话报出来。',
              '"隐式约束"是读懂泛型代码的钥匙：max3 只要求类型支持 <，clamp_t 只要求可比较可拷贝——模板对类型的要求写在用法里而非签名里。C++20 的 concepts 把这些要求显式化（requires std::totally_ordered<T>），LLVM 代码库已大量使用。读 Mesa/ROCm 的模板代码时先问"这个 T 被要求会做什么"，答案通常藏在函数体的操作符里。配套刷题：cpp-09（函数模板三件套）、cpp-10（RingBuffer 类模板，static_assert 实战）。',
            ],
            keyPoints: [
              '模板对类型参数化；编译器按使用处推导并实例化具体版本',
              '函数模板与类模板；STL 容器都是类模板',
              '编译期实例化：零运行时开销 + 完整类型检查（优于宏/void*）',
              '模板定义通常放头文件，否则实例化时链接找不到定义',
              '模板定义必须放头文件（实例化需可见）；错误爆发在实例化点——用 static_assert 把契约前置到第一行',
            ],
          },
          diagram: {
            title: '一份模板，多份实例（编译期生成）',
            content: `  源码（一份）                  编译器按使用处实例化（多份）
  template<class T>             max_of(3, 4)    → max_of<int>
  T max_of(T a, T b){          max_of(2.5,1.0) → max_of<double>
      return a > b ? a : b;    max_of(x, y)/*Vec*/→ max_of<Vec> (需 operator>)
  }

  对比三种“泛型”手段：
   C 宏       #define MAX(a,b) ((a)>(b)?(a):(b))
             纯文本替换，无类型检查，副作用求值两次，调试难
   C void*   int cmp(const void*,const void*)（qsort）
             丢失类型，需强制转换，运行期才暴露错误
   C++ 模板  template<class T> ...
             编译期实例化，类型安全，零运行时开销 ✓`,
            caption: '模板在编译期为每个用到的类型生成专门代码，兼得泛用性、类型安全与运行效率。',
          },
          codeWalk: {
            title: '函数模板与一个最小类模板',
            file: '示意：模板基础',
            language: 'cpp',
            code: `#include <cstdio>

template <typename T>            /* 1 函数模板 */
T max_of(T a, T b) { return a > b ? a : b; }

template <typename T, int N>     /* 2 类模板：可带非类型参数 N */
class FixedArray {
public:
    T &operator[](int i) { return data_[i]; }
    int size() const { return N; }
private:
    T data_[N];
};

int main() {
    printf("%d %.1f\\n", max_of(3, 7), max_of(2.5, 1.5)); /* 3 推导 int / double */

    FixedArray<float, 4> a;       /* 4 实例化 FixedArray<float,4> */
    for (int i = 0; i < a.size(); i++) a[i] = i * 0.5f;
    printf("a[3]=%.1f size=%d\\n", a[3], a.size());
    return 0;
}`,
            annotations: [
              '函数模板：用 typename T 参数化，调用处自动推导 T 的具体类型',
              '类模板还能带“非类型参数”（如 int N），编译期常量也能参数化',
              '同一个 max_of 同时服务 int 和 double，编译器各生成一份',
              'FixedArray<float,4> 是一个具体类型，编译期就确定了大小与元素类型',
            ],
            explanation: '模板是 C++ 泛型与 STL 的根基。LLVM 与 Mesa 大量使用模板编写与具体类型解耦的数据结构与算法（如 llvm::SmallVector<T,N>、各种 ADT）。理解“一份模板、按类型实例化、编译期完成、零运行时开销”，你才能读懂这些库为何能既通用又高效。下一课的 STL 容器（vector/map）与智能指针（unique_ptr/shared_ptr）全都是模板。',
          },
          miniLab: {
            title: '写一个模板函数与模板类并观察实例化',
            objective: '动手实例化模板，理解类型推导，并体验“模板定义必须可见”的链接规则',
            setup: 'mkdir -p ~/amd-labs/cc-cpp-5 && cd ~/amd-labs/cc-cpp-5',
            language: 'cpp',
            code: `// lab.cpp
#include <cstdio>

template <typename T>
T clamp(T v, T lo, T hi) { return v < lo ? lo : (v > hi ? hi : v); }

template <typename T>
struct Span {                  // 极简“数组视图”
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
              '编译运行：g++ -std=c++17 -Wall -o lab lab.cpp && ./lab',
              '观察 clamp 同时用于 int 和 double，无需写两份',
              '试着调用 clamp(1, 0.0, 10.0)（混类型），看编译器报“推导冲突”——体会模板的类型检查',
              '把 clamp 的定义移到单独的 clamp.cpp、只在头文件留声明，链接时观察 undefined reference，理解“模板定义要在头文件可见”',
            ],
            expectedOutput: `10 0.3
sum=10`,
            hint: '模板调用处会触发实例化，编译器据此生成具体代码并做类型检查。混合类型（int 与 double）会让 T 推导冲突而报错，这正是模板类型安全的体现。模板定义放头文件，是为了让每个实例化点都能看到定义。',
          },
          debugExercise: {
            title: '找出这个模板为什么链接报错',
            description: '把模板函数的定义放进了 .cpp，另一个文件调用它时报 undefined reference。',
            buggyCode: `// util.h
template <typename T> T square(T x);   // 只有声明

// util.cpp
#include "util.h"
template <typename T> T square(T x) { return x * x; }  // 定义藏在 .cpp

// main.cpp
#include "util.h"
int main() { return square(5); }   // 链接：undefined reference to square<int>`,
            language: 'cpp',
            question: '编译 main.cpp 时，编译器能看到 square 的定义吗？它如何为 int 生成实例？',
            hint: '模板要在“实例化的地方”能看到定义。main.cpp 只看到了声明。',
            answer: '编译 main.cpp 时，编译器只看到 square 的声明（在 util.h），看不到定义（它在 util.cpp 里），因此无法为 square<int> 生成代码；而 util.cpp 里的模板没有被任何类型实例化，也不会生成 square<int>。结果链接期 main.o 引用的 square<int> 无人定义 → undefined reference。修法：(1) 标准做法——把模板的“定义”直接放进头文件 util.h（模板不是普通函数，定义放头文件不会违反 ODR）；(2) 或在 util.cpp 末尾做“显式实例化”：template int square<int>(int);，为需要的类型预先生成。绝大多数项目选 (1)，这也是为什么 STL、LLVM 的模板几乎全在头文件里。',
          },
          interviewQ: {
            question: '模板和宏有什么区别？模板为什么通常定义在头文件里？模板实例化发生在什么时候？',
            difficulty: 'medium',
            hint: '从类型安全/作用域/调试对比宏；从“实例化点需要看到定义”讲头文件；强调编译期。',
            answer: '模板 vs 宏：宏是预处理阶段的纯文本替换，没有类型检查、不尊重作用域、参数可能被多次求值（副作用陷阱）、出错信息晦涩、难以调试；模板是语言层的泛型，编译器参与，具有完整的类型检查与重载决议、尊重作用域、可被调试器理解，并且生成的代码与手写具体类型一样高效。模板为何放头文件：模板本身不是代码，只有在“用某个具体类型实例化”时编译器才据其定义生成真正的代码；因此每个实例化点（通常在别的翻译单元）都必须能看到模板的完整定义，否则生成不出实例、链接时 undefined reference。把定义放头文件就保证了可见性（模板定义放头文件是 ODR 允许的特例）。实例化时机：发生在编译期——当代码首次以某具体类型使用该模板时，编译器为该类型生成一份专门代码（隐式实例化），也可显式实例化。正因为是编译期完成，模板没有运行时分发开销（区别于虚函数的运行时多态）。',
            amdContext: 'LLVM 的 ADT（SmallVector、DenseMap 等）和 Mesa 的部分 C++ 数据结构都是模板，全部定义在头文件。理解模板实例化与头文件规则，是阅读和（必要时）修改这些库的前提。',
          },
        },
        {
          id: 'cc-cpp-6',
          number: '0.7.2.6',
          title: 'STL 容器、算法与智能指针',
          titleEn: 'STL Containers, Algorithms & Smart Pointers',
          duration: 20,
          tags: ['C++', 'STL', 'smart-pointer'],
          concept: {
            summary: 'STL 提供现成的容器（vector/string/map）和算法（sort/find），它们靠 RAII 自动管理内存；智能指针（unique_ptr/shared_ptr）用所有权语义取代裸 new/delete。这一课把前面所有线索收束成“现代 C++ 的日常写法”。',
            explanation: [
              'vector<T> 是最常用的动态数组：连续存储、随机访问 O(1)、尾部追加均摊 O(1)。它区分 size（当前元素数）与 capacity（已分配容量）；容量不足时会重新分配更大内存并搬移元素——这也会使旧的迭代器/指针失效。string 是字符的 vector，map/unordered_map 提供键值查找（有序树 vs 哈希）。',
              '迭代器与算法：容器用迭代器统一遍历（begin()/end()），范围 for（for (auto &x : v)）是其语法糖；<algorithm> 提供 sort、find、count_if 等通用算法，常配合 lambda（[](auto&a,auto&b){return ...;}）定制行为。',
              'unique_ptr<T>：独占所有权的智能指针，不可拷贝、只能移动；离开作用域自动 delete。它是“裸 new/delete”的现代替代，零额外开销，表达“这块资源只有一个主人”。用 std::make_unique<T>(...) 创建。',
              'shared_ptr<T>：引用计数的共享所有权，最后一个持有者销毁时才释放；适合多方共享同一资源，但有计数开销，且要警惕循环引用（用 weak_ptr 打破）。经验法则：默认 unique_ptr，确有共享需求才上 shared_ptr。',
              'vector 的增长契约与迭代器失效规则必须一起记：push_back 超过 capacity 时重新分配并搬移全部元素——所有指向元素的指针/引用/迭代器同时失效；reserve 能一次性预留、避免反复搬家。map 是有序结构（红黑树，按 key 序迭代，O(log n)），unordered_map 是哈希（均摊 O(1) 但迭代序不定）——选容器的第一问永远是"我需要什么样的遍历顺序与失效保证"。',
              '智能指针的成本模型：unique_ptr 是零开销抽象（大小与裸指针相同、无运行时代价），默认选它；shared_ptr 有控制块 + 原子计数（每次拷贝一次原子操作，多线程下还有缓存行竞争），只在所有权真正需要共享时用；weak_ptr 用于打破 shared_ptr 的循环引用。make_unique/make_shared 优先于裸 new：异常安全，且 make_shared 能把对象与控制块合并分配。配套刷题：cpp-11（map+sort+lambda）、cpp-12（unique_ptr 组合，Rule of Zero 实战）；对照 k-04——shared_ptr 就是自动化的 kref。',
            ],
            keyPoints: [
              'vector：连续存储、size vs capacity、扩容会使迭代器失效',
              '迭代器 + 范围 for + <algorithm>（sort/find）+ lambda',
              'unique_ptr：独占、只能移动、自动释放，取代裸 new/delete',
              'shared_ptr：引用计数共享，注意开销与循环引用；默认优先 unique_ptr',
              'vector 扩容使所有迭代器失效——能预估就先 reserve；unique_ptr 零开销默认选，shared_ptr 付原子计数成本，weak_ptr 破环',
            ],
          },
          diagram: {
            title: 'vector 扩容与两种智能指针的所有权',
            content: `  vector：size vs capacity
    v=[1,2,3]   size=3 capacity=4    ┌─┬─┬─┬─┐
                                     │1│2│3│ │
    v.push_back(4) → size=4 cap=4    └─┴─┴─┴─┘
    v.push_back(5) → 容量不足！重新分配 cap=8 并搬移
        旧内存被释放 → 之前保存的迭代器/指针全部失效

  unique_ptr（独占）            shared_ptr（共享，引用计数）
    p ─► [对象]                   p ─┐ ref=2
    不可拷贝，只能 move           q ─┴─► [对象 | refcount]
    离开作用域 → delete           最后一个销毁时 refcount→0 → delete
                                  循环引用会让 refcount 永不归零 → 用 weak_ptr`,
            caption: 'vector 扩容会搬移元素并使旧迭代器失效；unique_ptr 表达独占所有权，shared_ptr 用引用计数表达共享。',
          },
          codeWalk: {
            title: '收束全篇：vector<unique_ptr<基类>> 持有多态对象',
            file: '示意：现代 C++ 综合',
            language: 'cpp',
            code: `#include <cstdio>
#include <vector>
#include <memory>
#include <algorithm>
#include <string>

struct IpBlock {                                  /* 复用 cc-cpp-4 的接口 */
    virtual int cost() const = 0;
    virtual std::string name() const = 0;
    virtual ~IpBlock() = default;
};
struct Gfx  : IpBlock { int cost() const override{return 30;} std::string name() const override{return "gfx";} };
struct Sdma : IpBlock { int cost() const override{return 10;} std::string name() const override{return "sdma";} };

int main() {
    std::vector<std::unique_ptr<IpBlock>> blocks;       /* 1 容器持有独占所有权 */
    blocks.push_back(std::make_unique<Gfx>());          /* 2 make_unique 创建 */
    blocks.push_back(std::make_unique<Sdma>());

    /* 3 用 algorithm + lambda 按 cost 排序 */
    std::sort(blocks.begin(), blocks.end(),
              [](const auto &a, const auto &b){ return a->cost() < b->cost(); });

    for (const auto &b : blocks)                         /* 4 范围 for + 多态分发 */
        printf("%-4s cost=%d\\n", b->name().c_str(), b->cost());
    return 0;   /* 5 vector 析构 → 每个 unique_ptr 析构 → 虚析构销毁对象，零泄漏 */
}`,
            annotations: [
              'vector<unique_ptr<IpBlock>>：容器拥有这些堆对象的独占所有权',
              'make_unique 创建对象并交给 unique_ptr 管理，无需手写 new/delete',
              'std::sort 配 lambda 定制比较规则——算法与容器解耦',
              '范围 for 遍历，b 是 unique_ptr 的引用，b->cost() 经虚函数动态分发',
              '离开作用域：vector 逐个析构 unique_ptr，虚析构确保派生对象完整销毁，全自动无泄漏',
            ],
            explanation: '这段代码把整个模块串了起来：函数指针/ops（cc-c-7）→ 虚函数多态（cc-cpp-4）→ 模板容器（cc-cpp-5）→ RAII/所有权（cc-c-6、cc-cpp-2/3）。没有一行手动 free、没有一个裸指针，资源全程由 vector 和 unique_ptr 的 RAII 自动管理；而多态分发让一个循环驱动不同实现。这正是 Mesa、ROCm/HIP、LLVM 里管理一组 GPU 资源/Pass/IP 对象的典型现代 C++ 写法。掌握到这里，你已具备读这些代码库的语言基础。',
          },
          miniLab: {
            title: '容器 + 算法 + 智能指针综合实战',
            objective: '用 vector/map/sort/lambda 处理数据，并把裸 new/delete 改写成 unique_ptr',
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
    std::sort(v.begin(), v.end());                 // 升序
    int big = std::count_if(v.begin(), v.end(),
                            [](int x){ return x >= 5; });
    printf("min=%d max=%d  >=5 count=%d\\n", v.front(), v.back(), big);

    std::map<std::string,int> busy{{"gfx",70},{"sdma",20}};
    busy["vcn"] = 45;
    for (auto &[k, val] : busy) printf("  %-4s %d%%\\n", k.c_str(), val);

    auto p = std::make_unique<int[]>(3);           // 取代 new int[3]
    for (int i = 0; i < 3; i++) p[i] = i + 1;
    printf("p[2]=%d\\n", p[2]);                      // 离开作用域自动释放
    return 0;
}`,
            steps: [
              '编译运行：g++ -std=c++17 -Wall -fsanitize=address -o lab lab.cpp && ./lab',
              '注意即便开了 ASan 也无泄漏——容器与 unique_ptr 自动释放',
              '观察 std::map 按 key 有序遍历；试着换成 std::unordered_map 比较遍历顺序',
              '用结构化绑定 auto &[k,val] 遍历 map；尝试用 std::find_if + lambda 查找第一个 >=8 的元素',
            ],
            expectedOutput: `min=1 max=9  >=5 count=3
  gfx  70%
  sdma 20%
  vcn  45%
p[2]=3`,
            hint: '现代 C++ 的默认姿势：用 vector/string/map 装数据，用 <algorithm> + lambda 处理，用 unique_ptr/make_unique 管理动态对象。几乎不需要手写 new/delete，内存安全由 RAII 保证。',
          },
          debugExercise: {
            title: '找出这个遍历为什么崩溃（迭代器失效）',
            description: '下面想在遍历 vector 的同时往里追加元素，结果崩溃或行为诡异。',
            buggyCode: `#include <vector>
#include <cstdio>
int main() {
    std::vector<int> v{1, 2, 3, 4};
    for (auto it = v.begin(); it != v.end(); ++it) {
        if (*it % 2 == 0)
            v.push_back(*it * 10);   // 遍历中扩容 → it 失效
    }
    for (int x : v) printf("%d ", x);
}`,
            language: 'cpp',
            question: 'push_back 可能触发 vector 重新分配。重新分配后，之前取得的迭代器 it 还有效吗？',
            hint: 'vector 扩容会把元素搬到新内存，旧内存释放，所有指向旧内存的迭代器/指针都失效。',
            answer: '不有效。push_back 在容量不足时会重新分配更大的缓冲区并搬移元素、释放旧内存，于是循环里持有的迭代器 it 指向已被释放的旧内存，继续 ++it/*it 就是未定义行为（崩溃或读到垃圾）。这就是“迭代器失效”。修法：(1) 不要在遍历容器的同时修改它的大小——先把要追加的元素收集到另一个 vector，遍历结束后再统一 append；(2) 若必须边遍历边加，用下标而非迭代器，并先记录原始长度：`size_t n=v.size(); for(size_t i=0;i<n;i++){...v.push_back(...);}`（注意用固定的 n，且 push_back 后不要再用旧引用）；(3) 提前 v.reserve() 到足够容量也能避免“本例”的重分配，但这只是规避而非通用解，仍不推荐遍历时改大小。记住各容器的失效规则：vector 扩容使全部迭代器失效，而 list/map 的节点型容器在插入时已存在的迭代器仍有效。',
          },
          interviewQ: {
            question: 'unique_ptr 和 shared_ptr 有何区别、各自何时用？vector 的 size 与 capacity 有什么区别，扩容代价如何？',
            difficulty: 'medium',
            hint: '从所有权语义对比两种智能指针；从均摊复杂度与迭代器失效讲 vector 扩容。',
            answer: 'unique_ptr 表达独占所有权：同一时刻只有一个 unique_ptr 拥有对象，不可拷贝、只能移动（转移所有权），离开作用域自动 delete，几乎零额外开销。shared_ptr 表达共享所有权：内部维护引用计数，多个 shared_ptr 可共同拥有同一对象，最后一个销毁时才释放；代价是计数的原子操作开销和更大的控制块，且可能出现循环引用导致永不释放（需用 weak_ptr 打破）。选择法则：默认用 unique_ptr 表达明确的单一所有者；只有当对象确实需要被多方共享、生命周期由“最后使用者”决定时才用 shared_ptr。vector 的 size 是当前实际元素个数，capacity 是已分配、可容纳而不必重新分配的元素个数；push_back 在 size==capacity 时触发扩容：分配更大缓冲（通常按倍数增长）、把已有元素移动/复制过去、释放旧缓冲，单次扩容是 O(n)，但因倍增策略，n 次追加的均摊成本是 O(1)。扩容的副作用是所有指向旧存储的迭代器/指针/引用失效；若已知规模，先 reserve(n) 可避免多次扩容与失效。',
            amdContext: 'Mesa/HIP/LLVM 用 unique_ptr 表达 GPU 资源/Pass 的独占所有权、用 shared_ptr 处理需共享的对象；用 vector（及 LLVM 的 SmallVector）存放批量对象。理解所有权与扩容/失效，是读懂这些库资源管理与性能权衡的基础。',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════
    // Group 0.7.3: 内核 C 惯用法实战 (Kernel C Idioms in Practice)
    // 依据 2026-07 内容审计补齐的真实缺口：位操作宏、内核链表、
    // 宏卫生学、错误处理三件套、kref/devm 生命周期、并发上下文。
    // 与 cc-c-6(goto 入门)、模块1(container_of/屏障) 衔接不重叠。
    // ════════════════════════════════════════════════════════════
    {
      id: 'cc-kernel',
      number: '0.7.3',
      title: '内核 C 惯用法实战',
      titleEn: 'Kernel C Idioms in Practice',
      icon: 'Wrench',
      description: '掌握了 C 语法只是入场券；内核代码是用一套固定惯用法写成的方言。这一组把驱动代码里出现频率最高的六套惯用法各拆一课：位操作宏、侵入式链表、宏卫生学、错误处理、引用计数与托管资源、并发上下文规则——每课都直连 amdgpu 真实代码。',
      lessons: [
        // ── Lesson 0.7.3.1 ────────────────────────────────────
        {
          id: 'cc-kernel-1',
          number: '0.7.3.1',
          title: '位操作宏：BIT、GENMASK 与寄存器字段',
          titleEn: 'Bit Macros: BIT, GENMASK & Register Fields',
          duration: 18,
          tags: ['kernel-C', 'BIT', 'GENMASK', 'FIELD_GET', 'registers'],
          concept: {
            summary:
              '驱动的日常是和 32 位寄存器里挤在一起的字段打交道。内核为此提供了一套标准宏：BIT(n) 取单个位，GENMASK(h, l) 生成连续位段掩码，FIELD_GET/FIELD_PREP 按掩码存取字段。amdgpu 还有自己的 REG_GET_FIELD/REG_SET_FIELD 家族。会读会写这些宏，寄存器操作代码才能一眼看懂。',
            explanation: [
              '硬件寄存器是"位打包"的：一个 32 位的 GRBM_STATUS 里，bit 31 是 GUI_ACTIVE、bit 25 是 CB_BUSY、bits [15:12] 可能是某个计数器。裸写 (reg >> 12) & 0xF 能工作，但读者要数位、写者会数错。内核的做法是给每个字段一次性定义掩码，再用标准宏操作，让"字段"成为代码里的一等公民。',
              '三件套怎么用：BIT(25) 展开为 (1UL << 25)——注意是 1UL，用 int 的 1 左移 31 位是未定义行为（符号位），这是面试和 review 的高频陷阱。GENMASK(15, 12) 生成 0x0000F000，即 [15:12] 四个位全 1，参数顺序是"高位在前"。FIELD_GET(mask, reg) 从 reg 里按 mask 抽出字段值并右移对齐（编译期由掩码自动算出移位量），FIELD_PREP(mask, val) 反向把值放进字段位置。掩码用 _MASK 结尾的常量命名，一处定义、处处引用。',
              'amdgpu 因为历史与代码生成的原因有自己的一套：寄存器头文件（asic_reg/ 目录）为每个字段生成 REG__FIELD__SHIFT 和 _MASK 两个常量，配套 REG_GET_FIELD(value, REG, FIELD) 与 REG_SET_FIELD(orig, REG, FIELD, val) 宏。原理与 FIELD_GET 完全相同——你在 amdgpu 里会更常见到这套，读法一样：先找 _MASK/_SHIFT 定义，字段语义就清楚了。',
              '还有一族朋友按需认识：set_bit/clear_bit/test_bit 操作的是内存里的位图（bitmap，原子版本用于并发场景），hweight32 数 1 的个数（上一模块 setup_rb 数 RB 就用它），ffs/fls 找第一个/最后一个置位。位图在驱动里管理资源分配表（哪个 doorbell 被占用、哪些 CU 被 harvest）非常常见。',
              '配套刷题（/code-lab，浏览器内编译运行）：c-04（set/clear/test 掩码基本功）、c-05（GET_FIELD/SET_FIELD 复刻）、c-06（fls 与 2 的幂）、k-08（128 位 doorbell 位图）、k-09（ioctl 四段位打包）——本课的每个宏你都会亲手实现一遍。',
            ],
            keyPoints: [
              'BIT(n) = (1UL << n)——UL 后缀避免 int 左移 31 位的未定义行为。',
              'GENMASK(h, l)：高位在前，生成 [h:l] 连续掩码；写反参数是经典 bug。',
              'FIELD_GET/FIELD_PREP 按掩码抽取/放置字段，移位量编译期自动推导。',
              'amdgpu 方言：REG_GET_FIELD/REG_SET_FIELD + 头文件生成的 _SHIFT/_MASK 常量，原理相同。',
              'set_bit/test_bit 家族操作内存位图（可原子），驱动用它管理资源占用表。',
            ],
          },
          diagram: {
            title: '一个 32 位寄存器的字段解剖',
            content: `GRBM_STATUS (32 bit)
 31          25       15  12            0
┌─┬───────┬─┬─────────┬────┬─────────────┐
│G│ ...   │C│  ...    │CNT │    ...      │
└─┴───────┴─┴─────────┴────┴─────────────┘
 ▲          ▲             ▲
 GUI_ACTIVE CB_BUSY      [15:12] 计数字段
 BIT(31)    BIT(25)      GENMASK(15,12)=0xF000

读字段:  cnt = FIELD_GET(GENMASK(15,12), reg);
写字段:  reg = (reg & ~mask) | FIELD_PREP(mask, 5);
amdgpu:  busy = REG_GET_FIELD(v, GRBM_STATUS, CB_BUSY);`,
            caption: '同一个寄存器，三种视角：位号、掩码宏、字段名。驱动代码追求的是最下面那种"字段名"级别的可读性。',
          },
          codeWalk: {
            title: '内核定义 + amdgpu 用法对照',
            language: 'c',
            file: 'include/linux/bits.h + drivers/gpu/drm/amd/amdgpu/（节选简化）',
            code: `/* ── 内核标准宏（简化展示）────────────────── */
#define BIT(nr)        (1UL << (nr))
#define GENMASK(h, l) \\
	(((~0UL) << (l)) & (~0UL >> (BITS_PER_LONG - 1 - (h))))
/* FIELD_GET 的核心: 用掩码低位算出移位量 */
#define FIELD_GET(mask, reg) \\
	(((reg) & (mask)) >> __bf_shf(mask))

/* ── amdgpu 的等价方言 ──────────────────── */
/* 寄存器头文件自动生成(asic_reg/gc/gc_11_0_0_sh_mask.h): */
#define GRBM_STATUS__CB_BUSY__SHIFT   0x19
#define GRBM_STATUS__CB_BUSY_MASK     0x02000000L

#define REG_GET_FIELD(value, reg, field) \\
	(((value) & reg##__##field##_MASK) \\
	 >> reg##__##field##__SHIFT)

/* 实战: gfx_v11_0.c 判断 GPU 是否空闲 */
static bool gfx_v11_0_is_idle(void *handle)
{
	u32 tmp = RREG32_SOC15(GC, 0, regGRBM_STATUS);
	return !REG_GET_FIELD(tmp, GRBM_STATUS,
			      GUI_ACTIVE);
}`,
            explanation:
              '两套宏一个原理：掩码是唯一的事实来源，移位量从掩码推导（内核用 __bf_shf 编译期计算，amdgpu 直接生成 _SHIFT 常量）。注意 REG_GET_FIELD 里的 ## 拼接——宏把 GRBM_STATUS 和 CB_BUSY 拼成常量名，这就是为什么字段名必须和头文件里的定义一字不差。',
          },
          miniLab: {
            title: '用户态搭一个寄存器字段游乐场',
            objective: '亲手实现并验证三件套，顺便撞一次 1<<31 的未定义行为。',
            language: 'c',
            code: `#include <stdio.h>
#include <stdint.h>
#define BIT(n)        (1UL << (n))
#define GENMASK(h, l) \\
    (((~0UL) << (l)) & (~0UL >> (63 - (h))))
#define FIELD_GET(m, r) (((r) & (m)) >> __builtin_ctzl(m))

int main(void)
{
    uint32_t reg = 0x8200F123;   /* 模拟 GRBM_STATUS */
    printf("GUI_ACTIVE = %lu\\n", FIELD_GET(BIT(31), reg));
    printf("CB_BUSY    = %lu\\n", FIELD_GET(BIT(25), reg));
    printf("CNT[15:12] = %lu\\n",
           FIELD_GET(GENMASK(15, 12), reg));
    /* 实验: 把 BIT 里的 1UL 改成 1, 开 -fsanitize=undefined
       编译, 观察 1 << 31 被 UBSan 抓包 */
    return 0;
}`,
            steps: [
              '编译运行：gcc -Wall -fsanitize=undefined lab.c && ./a.out，核对三个字段值（1、1、0xF）',
              '把 BIT 宏的 1UL 改成 1，重跑——UBSan 报 "left shift of 1 by 31 places cannot be represented in type int"',
              '把 GENMASK(15,12) 写反成 GENMASK(12,15)，打印掩码值，理解为什么结果是 0（或触发移位 UB）',
              '在 elixir 上打开 gc_11_0_0_sh_mask.h，随便挑一个寄存器，找出它任意字段的 _MASK/_SHIFT，手算验证掩码和移位的一致性',
              '把 __builtin_ctzl 和内核 __bf_shf 的思路写一句对比进日志',
            ],
            expectedOutput:
              'GUI_ACTIVE = 1、CB_BUSY = 1、CNT[15:12] = 15（0xF）。UBSan 在第 2 步准确报出 int 左移 31 的未定义行为。第 3 步掩码为 0——参数顺序错误不会报错，只会静默出 0，这正是它可怕的地方。',
            hint: '__builtin_ctzl(mask) = 数掩码末尾的 0 个数 = 字段起始位，就是内核 __bf_shf 的编译器内建实现。',
          },
          debugExercise: {
            title: '这个"使能中断"的函数为什么点不亮任何东西？',
            language: 'c',
            question: '新人写了个开中断位的辅助函数，测试发现中断从来没被使能，偶尔还把别的配置搞坏了。找出三个位操作错误。',
            buggyCode: `#define IH_CNTL__ENABLE_INTR__SHIFT  0x1f  /* bit 31 */
#define IH_CNTL__RING_SIZE_MASK      0x0000003EL /* [5:1] */

void broken_enable_intr(struct my_dev *dev, int ring_size)
{
	u32 v = read_reg(dev, IH_CNTL);

	/* 1. 打开使能位 */
	v |= 1 << IH_CNTL__ENABLE_INTR__SHIFT;

	/* 2. 设置 ring size 字段 [5:1] */
	v |= ring_size << 1;

	/* 3. "清掉保留位 [30:26]" */
	v &= GENMASK(26, 30);

	write_reg(dev, IH_CNTL, v);
}`,
            hint: '第 1 处想想 1 的类型；第 2 处想想旧值——|= 能"设置"字段吗？第 3 处 GENMASK 参数顺序 + &= 的语义是"保留"还是"清除"？',
            answer:
              '错误一：1 << 31 是 int 左移进符号位——未定义行为，正确写法 BIT(31) 或 1UL << shift。错误二：用 |= 设置多位字段不先清旧值——若寄存器里 ring_size 字段原来是 0b11111，现在想写 0b00010，|= 之后得到 0b11111，字段设置必须"先清后置"：v = (v & ~RING_SIZE_MASK) | FIELD_PREP(RING_SIZE_MASK, ring_size)，还应校验 ring_size 不超字段宽度。错误三：GENMASK(26, 30) 参数写反（必须高位在前 GENMASK(30, 26)），且就算掩码对了，v &= mask 的语义是"只保留这些位、清掉其他所有位"——把使能位和 ring size 全清了；想清除 [30:26] 应该是 v &= ~GENMASK(30, 26)。三个错误的共同解药：永远用 BIT/GENMASK/FIELD_PREP 这套自带正确性的宏，别手搓移位。',
          },
          interviewQ: {
            question: '为什么内核的 BIT 宏用 1UL 而不是 1？FIELD_GET/REG_GET_FIELD 这类宏相比手写移位有什么工程价值？',
            difficulty: 'medium',
            hint: '前半从 C 的整数提升和移位 UB 说起；后半从"单一事实来源"和可读性说。',
            answer:
              '1 是 int（32 位有符号），1 << 31 把 1 移进符号位，属于 C 标准的未定义行为；而且 int 最多移到 30 位，64 位寄存器的高位根本表达不了。1UL 是 unsigned long，无符号移位行为良定义、宽度至少与 long 相同，覆盖 64 位场景。FIELD_GET 系宏的价值：掩码常量是字段的"单一事实来源"，移位量由掩码自动推导，杜绝了 shift 和 mask 不匹配这类手滑；代码从 (reg>>12)&0xF 变成 FIELD_GET(CNT_MASK, reg)，语义自明；掩码定义处集中审计，硬件手册改版时只改一处。amdgpu 的 REG_GET_FIELD 同理，还借宏拼接强制字段名与官方寄存器头一致——代码即文档。',
            amdContext: 'amdgpu 面试的寄存器题几乎必然出现：给你一段 RREG32/REG_GET_FIELD 代码问在干什么，或让你现场写"读-改-写"一个字段。把"先清后置"和 1UL 两个点说清楚就是满分。',
          },
        },
        // ── Lesson 0.7.3.2 ────────────────────────────────────
        {
          id: 'cc-kernel-2',
          number: '0.7.3.2',
          title: '内核链表 list_head：把节点长在数据里',
          titleEn: 'Kernel Lists: list_head, Intrusive by Design',
          duration: 20,
          tags: ['kernel-C', 'list_head', 'container_of', 'intrusive-list'],
          concept: {
            summary:
              '内核链表是"侵入式"的：不是容器持有数据，而是把 struct list_head 这个小节点嵌进你的结构体里。配合 container_of 从节点找回宿主，一套 list_add/list_del/list_for_each_entry 宏就能让任何结构体上任意多条链表。amdgpu 里 BO、fence、ctx 的管理全靠它。',
            explanation: [
              '先想清楚普通链表的问题：C++ 的 std::list<T> 为每个元素单独分配节点、节点里存数据副本或指针。内核不这么干——内存分配在内核是昂贵且可能失败的操作，而且一个对象经常要同时在好几条链表上（一个 BO 既在 VM 的 moved 链表上、又在驱逐 LRU 上）。侵入式设计一次解决：struct list_head 只有 prev/next 两个指针，把它作为成员嵌进宿主结构体，加入链表 = 改四个指针，零分配、O(1) 摘除、一个宿主嵌几个 list_head 就能上几条链。',
              '代价是"从节点找回宿主"需要一步反向运算——这正是模块 1 教过的 container_of：已知成员地址和成员在结构体里的偏移，减回去就是宿主地址。list_entry(ptr, type, member) 就是 container_of 的别名，而 list_for_each_entry(pos, head, member) 把"遍历节点 + 还原宿主"打包成一个循环宏，pos 直接就是宿主指针。',
              '几个必须内化的操作语义：头节点用 LIST_HEAD(name) 或 INIT_LIST_HEAD 初始化成"指向自己"的空环（内核链表是双向循环链表，判空是 head->next == head）；list_add 头插、list_add_tail 尾插；list_del 摘除后节点指针被写成毒值（LIST_POISON）帮你抓 use-after-delete，若节点还要复用应使用 list_del_init；遍历中要删除节点必须用 list_for_each_entry_safe——它提前缓存 next，普通版在删除后继续走就是 use-after-free。',
              '在 amdgpu 里认门牌：amdgpu_vm 用多条链表给 BO 分状态（idle/evicted/moved/invalidated——BO 状态机就是"在哪条链上"）；TTM 的 LRU 驱逐扫描就是链表遍历；fence 的回调列表、ctx 的实体列表同理。读驱动代码遇到 list_for_each_entry 时，第一件事永远是看第三个参数（member 名），再去宿主结构体定义里找那个 list_head 成员的注释——那里写着这条链的语义。',
              '配套刷题（/code-lab）：k-01（container_of 从零实现）、k-02（哨兵环形双链的四个核心操作）、k-03（list_for_each_entry 遍历与 _safe 安全删除）——三题连做，本课的链表 API 就从"看得懂"升级为"写得出"。',
            ],
            keyPoints: [
              '侵入式：list_head 嵌进宿主结构体——零分配、O(1) 摘除、一个对象可同时上多条链。',
              'list_entry = container_of；list_for_each_entry 让循环变量直接是宿主指针。',
              '双向循环 + 判空 head->next == head；list_del 写毒值防误用，复用节点要 list_del_init。',
              '遍历中删除必须用 _safe 变体（提前缓存 next），否则 use-after-free。',
              'amdgpu 的 BO 状态机 = "在哪条链表上"：idle/evicted/moved/invalidated。',
            ],
          },
          diagram: {
            title: '侵入式链表：节点长在 BO 里',
            content: `LIST_HEAD(moved)          ┌──────────────┐
   head ◀──────────────────┤ prev    next ├───▶ (回到 head)
    │                      │  list_head   │
    │   ┌─ amdgpu_bo_va ───┼──────────────┼───┐
    ▼   │  base.bo  ...    │ ← vm_status  │   │
        │                  └──────────────┘   │
        └─────────────────────────────────────┘
container_of(节点地址, struct amdgpu_bo_va, vm_status)
                = 宿主 BO_VA 的地址
遍历: list_for_each_entry(bo_va, &vm->moved, vm_status)
        → bo_va 直接可用, 无需手写 container_of`,
            caption: '节点(list_head)是宿主结构体的一个成员；链表串起来的是节点，container_of 把每个节点还原成宿主。一个宿主嵌 N 个 list_head 就能同时在 N 条链上。',
          },
          codeWalk: {
            title: 'amdgpu_vm 的 moved 链表：状态机实战',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c（节选简化）',
            code: `/* 宿主结构体: 每个 BO 到 VM 的映射 */
struct amdgpu_bo_va {
	struct amdgpu_vm_bo_base base;
	/* 状态节点: 此刻挂在 vm 的哪条链上 */
	struct list_head vm_status;
	/* ... */
};

/* BO 被移动过 → 页表需要更新, 挂到 moved 链 */
static void amdgpu_vm_bo_moved(
		struct amdgpu_vm_bo_base *base)
{
	struct amdgpu_bo_va *bo_va =
		container_of(base, struct amdgpu_bo_va, base);
	spin_lock(&base->vm->status_lock);
	list_move(&bo_va->vm_status,
		  &base->vm->moved);      /* 换链 = 换状态 */
	spin_unlock(&base->vm->status_lock);
}

/* 提交前: 处理所有"移动过"的 BO, 更新其页表映射 */
int amdgpu_vm_handle_moved(struct amdgpu_device *adev,
			   struct amdgpu_vm *vm, ...)
{
	struct amdgpu_bo_va *bo_va, *next;

	/* _safe: 循环体内会把节点挪去别的链 */
	list_for_each_entry_safe(bo_va, next,
				 &vm->moved, vm_status) {
		r = amdgpu_vm_bo_update(adev, bo_va, ...);
		/* 更新完成 → bo_va 移入 idle 链 */
	}
	return 0;
}`,
            explanation:
              '三个惯用法同框：list_move 一步完成"从旧链摘下挂到新链"（BO 状态迁移的原子表达）；遍历用 _safe 因为循环体会挪动节点；链表操作被 spinlock 保护——链表宏本身不带锁，并发安全是使用者的责任（第 6 课展开）。这段代码同时回答了上一模块的伏笔：驱逐后页表怎么跟上？答案就是 moved 链表 + handle_moved。',
          },
          miniLab: {
            title: '30 行实现内核链表，再用它管理两条 BO 状态链',
            objective: '亲手实现 list_head 核心宏，体验"一个对象同时在两条链上"。',
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
    struct list_head lru;      /* 链 1: 驱逐 LRU  */
    struct list_head vm_status;/* 链 2: VM 状态   */
};`,
            steps: [
              '把骨架补完整：实现 list_del（摘除 + 把自身指针指向 NULL 便于观察）和 INIT_LIST_HEAD',
              'main 里创建 3 个 bo，全部 list_add_tail 到 lru 链，其中 2 个再挂到 moved 链——同一对象在两条链上',
              '分别用 list_for_each_entry 遍历两条链打印 id，确认互不干扰',
              '故意在普通 list_for_each_entry 循环体里 list_del 当前节点再继续，观察崩溃/死循环；改用 _safe 版本（自己实现，提前缓存 next）修复',
              '对照：在 elixir 打开 include/linux/list.h，找出你的实现与内核版的差异点（毒值、WRITE_ONCE）记进日志',
            ],
            expectedOutput:
              '两条链独立遍历各自输出正确 id 集合；未用 _safe 的删除遍历出现段错误或死循环（取决于毒化方式）；_safe 版本干净通过。日志记录内核版的两个加固点：LIST_POISON 毒值 + WRITE_ONCE 防撕裂。',
            hint: 'offsetof 在 <stddef.h>；typeof 是 GNU 扩展，gcc/clang 默认可用。',
          },
          debugExercise: {
            title: '清理函数偶发崩溃在第二个节点',
            language: 'c',
            question: '这个"释放整条链上所有 BO"的函数在链表长度 ≥2 时崩溃。指出根因和另一个隐藏问题。',
            buggyCode: `void broken_free_all(struct my_vm *vm)
{
	struct my_bo *bo;

	list_for_each_entry(bo, &vm->bo_list, node) {
		list_del(&bo->node);
		kfree(bo);        /* 宿主整个释放 */
	}

	/* 顺手复用头节点表示"清空过" */
	vm->bo_list.next = NULL;
}`,
            hint: 'list_for_each_entry 每轮怎么找下一个节点？它读的内存刚刚发生了什么？最后两行对"空链"的表示和内核约定一致吗？',
            answer:
              '根因：循环宏每轮通过 pos->node.next 前进，但循环体刚把 bo kfree 掉——下一轮读的是已释放内存里的 next 指针，典型 use-after-free；开着 KASAN/ASan 必抓，不开就是偶发崩溃或静默越界。修法：list_for_each_entry_safe(bo, next, &vm->bo_list, node)，宏在释放前已把 next 缓存好。隐藏问题：把 next 置 NULL 违反内核链表的空链约定——空链是 head->next == head（指向自己），后续任何 list_empty 判断、list_add 都会在 NULL 上崩；清空后应 INIT_LIST_HEAD(&vm->bo_list)。附加提醒：真实驱动里这条链多半还有锁保护，遍历删除全程要持锁，否则并发的 list_add 会和你的 kfree 赛跑。',
          },
          interviewQ: {
            question: '内核链表为什么设计成侵入式（list_head 嵌入宿主）而不是像 std::list 那样容器持有元素？各举一个代价与收益。',
            difficulty: 'medium',
            hint: '从分配、多链成员资格、O(1) 删除三方面说收益；从类型安全和"宿主必须预留成员"说代价。',
            answer:
              '收益：(1) 零额外分配——节点是宿主的一部分，链表操作永不失败，这对"分配可能失败且失败要处理"的内核至关重要；(2) 一个对象可同时在任意多条链上（嵌几个 list_head 上几条链），BO 同时在 LRU 链和 VM 状态链是常态，容器式设计要么复制要么套一层间接；(3) 已知宿主即可 O(1) 摘除自己，无需先遍历找到位置。代价：(1) 类型不安全——list_head 本身无类型，container_of 的 type/member 写错编译器多数情况不报错，靠命名纪律和 review 兜底；(2) 侵入性——宿主结构体必须预留成员，第三方类型无法直接上链；(3) 生命周期完全手动，节点不管理宿主内存（没有析构概念），use-after-free 风险自负。总结一句：内核用类型安全换确定性（无分配、无失败路径）——这是内核 C 一以贯之的交易。',
            amdContext: 'AMD 内核组面试常拿 amdgpu_vm 的状态链表当现场读码题；能主动说出"BO 状态机 = 在哪条链上"并指出 _safe 变体的使用场景，说明真读过代码而不是背概念。',
          },
        },
        // ── Lesson 0.7.3.3 ────────────────────────────────────
        {
          id: 'cc-kernel-3',
          number: '0.7.3.3',
          title: '宏卫生学：do-while(0)、ARRAY_SIZE 与指定初始化',
          titleEn: 'Macro Hygiene: do-while(0), ARRAY_SIZE & Designated Init',
          duration: 18,
          tags: ['kernel-C', 'macros', 'ARRAY_SIZE', 'designated-initializers'],
          concept: {
            summary:
              '内核大量使用宏，也为此立了一套"卫生规范"：多语句宏包 do{...}while(0)、参数全部加括号且警惕重复求值、用 ARRAY_SIZE 代替手写除法、ops 表一律用 C99 指定初始化器。这些规范每一条背后都是一类真实事故。',
            explanation: [
              'do{...}while(0) 解决"多语句宏在 if 下解体"的经典事故：#define CLEANUP() free(a); free(b) 在 if (err) CLEANUP(); 里只有 free(a) 受 if 控制，free(b) 无条件执行。包上 do{...}while(0) 后宏成为一条语法上的单语句，还能安全接分号、进 if/else 不破坏结构。所有多语句宏无条件用它——这是内核 review 的硬性要求。',
              '参数重复求值是第二类事故：#define MAX(a,b) ((a)>(b)?(a):(b)) 遇到 MAX(i++, j) 时 i++ 被求值两次。内核的 min()/max() 用语句表达式（GNU 扩展 ({ ... })）把参数先存进局部变量再比较，同时用类型检查宏拒绝有符号/无符号混比。你自己写宏时的纪律：要么保证每个参数只出现一次，要么改用 static inline 函数（有类型检查、无重复求值，内联后零开销——内核风格文档明确偏好后者）。',
              'ARRAY_SIZE(arr) 展开为 sizeof(arr)/sizeof((arr)[0])，但内核版多一层 __must_be_array 检查：数组传进函数退化成指针后，sizeof(指针)/sizeof(元素) 会得到一个荒谬但能编译的数字——内核版让这种误用直接编译失败。凡是遍历固定表（IP block 列表、寄存器初始化表）都用它，手写长度常量迟早和数组本体失去同步。',
              'C99 指定初始化器（.field = value）是 ops 表的标准写法：字段名显式、顺序无关、漏掉的成员自动清零（函数指针为 NULL，调用前判空即可实现"可选回调"）。对比按位置初始化：结构体加一个字段，所有按位置写的初始化全部错位——amdgpu 里几百张 funcs 表全靠指定初始化器才能安全演进。这也解释了为什么内核结构体可以频繁加字段而不炸掉全树。',
              '配套刷题（/code-lab）：k-01 的 container_of 宏正是"宏卫生学"的综合应用（参数加括号、char* 转换）；c-07 的静态 match table 与 c-14 的 ops 表都依赖指定初始化器——写题时留意这些细节如何防住隐蔽 bug。',
            ],
            keyPoints: [
              '多语句宏必须 do{...}while(0)：让宏成为单语句，if/else 下不解体。',
              '宏参数会被重复求值：MAX(i++, j) 双自增；内核 min/max 用语句表达式规避——能用 static inline 就别用宏。',
              'ARRAY_SIZE 带 __must_be_array：对指针使用直接编译失败，比手写 sizeof 除法安全。',
              '指定初始化器：顺序无关、缺省清零、加字段不错位——ops/funcs 表的生存基础。',
              'likely/unlikely 是给分支预测的提示（__builtin_expect），只在有数据支撑的热路径用。',
            ],
          },
          diagram: {
            title: '两类宏事故的解剖',
            content: `事故一: 多语句宏解体
#define CLEANUP() free(a); free(b)
if (err)
    CLEANUP();
展开后:
if (err)
    free(a);      ← 只有它受 if 控制!
free(b);          ← 无条件执行, 双重释放预定

事故二: 参数重复求值
#define MAX(a,b) ((a)>(b)?(a):(b))
v = MAX(i++, j);
展开后:  ((i++)>(j)?(i++):(j))
              ↑ i 可能被加两次

疫苗:  do{...}while(0)  |  ({语句表达式})  |  static inline`,
            caption: '每条卫生规范背后都是一类真实事故。展开宏、逐行读展开结果，是诊断宏 bug 的唯一可靠方法（gcc -E）。',
          },
          codeWalk: {
            title: 'amdgpu 的 ops 表：指定初始化器 + ARRAY_SIZE 实战',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c（节选简化）',
            code: `/* 指定初始化器: 字段名显式, 顺序无关, 未列字段=NULL */
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
	/* 没列出的回调自动为 NULL → 调用方判空跳过 */
};

/* ARRAY_SIZE 遍历固定表: 长度永远和数组同步 */
static const u32 golden_settings_gc_11_0[] = {
	/* 寄存器,  掩码,  值 三元组... */
};

static void gfx_v11_0_init_golden_registers(
		struct amdgpu_device *adev)
{
	soc15_program_register_sequence(adev,
		golden_settings_gc_11_0,
		ARRAY_SIZE(golden_settings_gc_11_0));
}`,
            explanation:
              '这张 ring_funcs 表你在 GPU 架构模块见过它的使用侧（set_wptr 敲 doorbell）——现在看到定义侧：指定初始化器让 40 多个回调字段只填需要的，新增回调字段不影响任何现有表。golden registers 的 ARRAY_SIZE 用法是模板级惯例：表和长度永不脱节。',
          },
          miniLab: {
            title: '亲手触发两类宏事故，再用卫生规范修复',
            objective: '用 gcc -E 看穿宏展开，建立"读展开结果"的调试直觉。',
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
        SWAP_BAD(int, x, y);   /* 编译或语义炸点 */
    printf("%d %d\\n", x, y);

    int i = 5, j = 3;
    int m = MAX_BAD(i++, j);   /* i 加了几次? */
    printf("i=%d m=%d\\n", i, m);
    return 0;
}`,
            steps: [
              '先猜输出，再编译运行对拍（SWAP_BAD 若报编译错，读懂错误信息里 if 后面发生了什么）',
              '运行 gcc -E lab.c | tail -20，逐行读两处宏的展开结果，标注哪一行脱离了 if 的控制、i++ 出现了几次',
              '把 SWAP_BAD 换成 SWAP_OK 验证修复；把 MAX_BAD 改写成 GNU 语句表达式版 ({ typeof(a) _a=(a); typeof(b) _b=(b); _a>_b?_a:_b; }) 验证 i 只加一次',
              '补一个 ARRAY_SIZE 实验：数组作实参传入函数后再算 sizeof(arr)/sizeof(arr[0])，观察退化成指针后得到的荒谬值',
              '在 elixir 读内核 include/linux/minmax.h 的 min() 实现，把它对比你的语句表达式版，差异（类型检查）记日志',
            ],
            expectedOutput:
              'SWAP_BAD 在 if 下要么编译错（else 悬挂）要么交换不完整；gcc -E 清晰显示 free 类语句逃逸出 if、i++ 出现两次（i=7）。语句表达式版 i=6、m=5。函数内 sizeof 除法给出与元素大小相关的错误长度。',
            hint: '-E 输出很长，用 | grep -A3 main 或 tail 定位；语句表达式是 GNU 扩展，内核代码可用。',
          },
          debugExercise: {
            title: '寄存器初始化表为什么只写进去一半？',
            language: 'c',
            question: '这段初始化代码在真机上只配置了一部分寄存器，且日志宏偶尔把错误路径搞乱。找出三处宏/初始化问题。',
            buggyCode: `#define LOG_ERR(fmt, ...) \\
	printk("myGPU: " fmt, ##__VA_ARGS__); \\
	dev->err_count++

static const struct reg_init table[] = {
	{ REG_A, 0xffffffff, 0x1 },
	{ REG_B, 0x0000ff00, 0x2 },
	/* ... 共 24 项 ... */
};
#define TABLE_LEN 16   /* "先写 16, 以后记得改" */

int init_regs(struct my_dev *dev,
              const struct reg_init *t)
{
	for (int i = 0; i < TABLE_LEN; i++)
		write_masked(dev, t[i]);

	if (check_failed(dev))
		LOG_ERR("init failed\\n");
	else
		return 0;      /* 编译器: else 匹配谁? */
	return -EIO;
}`,
            hint: '24 项的表和 16 的常量谁在说谎？LOG_ERR 是几条语句？它放进 if/else 之间会发生什么？',
            answer:
              '问题一：手写 TABLE_LEN=16 与实际 24 项的表脱节——后 8 个寄存器从未被写入，这正是 ARRAY_SIZE(table) 存在的意义（且注意函数收到的是指针 t，ARRAY_SIZE 必须在表的定义处/同翻译单元对数组本体使用，传长度进函数）。问题二：LOG_ERR 是"两条语句没穿衣服"——展开后 if (check_failed) 只控制 printk，dev->err_count++ 无条件执行；更糟的是紧跟的 else 现在贴在 err_count++ 之后，语法直接不成立或语义完全错乱。修法：宏体包 do{...}while(0)。问题三（设计层）：这种"记得以后改"的注释就是事故预约单——常量与数据必须由同一来源生成（ARRAY_SIZE 或代码生成），靠人记必炸。附加分：printk 应带日志级别（KERN_ERR），内核实际用 dev_err/drm_err 系列。',
          },
          interviewQ: {
            question: '为什么内核编码风格偏好 static inline 函数而不是宏？什么情况下仍然必须用宏？',
            difficulty: 'medium',
            hint: '类型检查/单次求值/调试性 vs 需要操作类型本身、字符串拼接、编译期常量的场景。',
            answer:
              'static inline 相比宏：参数有类型检查（传错类型编译器报错而不是静默转换）、每个参数恰好求值一次（无 i++ 双增陷阱）、有真实符号可下断点、遵守作用域规则；开优化后同样内联，性能无差。所以能用函数表达的一律用函数——内核 coding-style 明文如此。仍必须用宏的场景：(1) 要操作"类型"本身——container_of、ARRAY_SIZE、offsetof 这类需要 typeof/sizeof 作用于表达式或类型的；(2) 需要预处理期字符串化/拼接（#、##）——寄存器名拼接 REG_GET_FIELD、trace 点定义；(3) 需要成为编译期常量表达式（数组长度、case 标签、静态断言）；(4) 可变参数转发给 printk 家族。经验法则：宏只干预处理器才干得了的活，其余交给 inline 函数——写宏时 do-while(0)、全参数括号、单次求值三件套一个不能少。',
            amdContext: '内核社区 review 的高频退回意见就是"这个宏为什么不是 inline 函数"。amdgpu 面试如果给你看 RREG32/WREG32 宏族，考点通常是它们为什么必须是宏（寄存器名拼接）以及 soc15 版本如何做偏移计算。',
          },
        },
        // ── Lesson 0.7.3.4 ────────────────────────────────────
        {
          id: 'cc-kernel-4',
          number: '0.7.3.4',
          title: '错误处理三件套：ERR_PTR、goto 分层清理、溢出检查',
          titleEn: 'Error Handling: ERR_PTR, Layered goto, Overflow Checks',
          duration: 22,
          tags: ['kernel-C', 'ERR_PTR', 'goto-cleanup', 'overflow'],
          concept: {
            summary:
              '内核没有异常，错误处理全靠三套惯用法：返回指针的函数用 ERR_PTR/IS_ERR 把错误码藏进指针值；多步初始化用分层 goto 逆序回滚；一切来自用户或硬件的尺寸运算过 check_*_overflow/kmalloc_array 防溢出。三套全是硬性 review 标准。',
            explanation: [
              'ERR_PTR 的原理是一个地址空间约定：内核保证虚拟地址最顶端的一页（最后 4095 个值）永远不会是有效指针，于是 (void *)-EINVAL 这类值可以安全地当"错误码假扮的指针"用。ERR_PTR(-EINVAL) 编码，IS_ERR(p) 判断（p 是否落在顶端页），PTR_ERR(p) 解码回 int。这样返回指针的函数就有了带原因的失败：p = amdgpu_bo_create_kernel(...); if (IS_ERR(p)) return PTR_ERR(p);。与 NULL 的分工：NULL 表示"没有但不算错"（查找未命中），ERR_PTR 表示"失败且有原因"——一个函数选定其一并写进注释，调用方按约定检查，混用是 bug 温床。',
              'goto 分层清理在 cc-c-6 里见过雏形，这里补齐工程细节。核心不变式：标签按资源获取的逆序排列，err_N 标签意味着"第 1..N 步已成功、从第 N 步开始回滚"。失败时 goto 到"自己那一层的下一个标签"——第 3 步失败跳 err_2（回滚 1、2 步），而不是 err_3。常见变体：unwind 标签共用（部分驱动用 amdgpu 的 ip_block 逆序 fini 模式）；成功路径和错误路径共享尾部时用 out: 标签 + ret 变量。评判标准只有一条：每条失败路径上，已获取的每样资源恰好被释放一次。',
              '溢出检查针对一类真实漏洞：kmalloc(count * size, GFP_KERNEL) 中 count 来自用户态时，乘法可以回绕成一个很小的数——分配成功但远小于预期，随后的写入就是堆溢出（历史上大量 CVE 属于此类）。防御工具：kmalloc_array(count, size, flags)（内部检查乘法溢出，溢出返回 NULL）、struct_size(ptr, member, count)（算"结构体+柔性数组"的安全尺寸）、check_add_overflow/check_mul_overflow（通用算术检查，溢出返回 true）。纪律：任何来自用户态、固件、硬件寄存器的数值参与尺寸/偏移运算前必须过检查——amdgpu 的 ioctl 入口处处是这种代码。',
              '把三套连成一个模板：入口先校验参数（含溢出检查）→ 逐步获取资源，每步失败 goto 对应层 → 成功 return 0 → 标签区逆序释放。这个骨架在 amdgpu 的每个 init/create 函数里重复出现，读熟一个等于读熟一百个。顺带一提 C++ 对照：这套手工纪律正是 RAII 自动化掉的东西（cc-cpp 组讲过）——理解 goto 清理，才真正理解 RAII 在解决什么。',
              '配套刷题（/code-lab）：k-06（ERR_PTR/PTR_ERR/IS_ERR 全套实现 + 应用）、k-07（三资源 goto 阶梯 + 失败注入）、c-10（溢出预判解析器）——错误处理三件套每件都有一道专属练习题。',
            ],
            keyPoints: [
              'ERR_PTR：错误码藏进指针顶端页；IS_ERR 判断、PTR_ERR 解码；NULL=没有不算错，ERR_PTR=失败有原因。',
              'goto 分层：标签逆序排列，err_N = "回滚前 N 步"；失败跳"自己层的下一个标签"。',
              '不变式：每条失败路径上，已获取资源恰好释放一次——review 就查这一条。',
              '用户可控的 count*size 必须防溢出：kmalloc_array/struct_size/check_mul_overflow。',
              '模板：校验(含溢出) → 逐步获取+goto → return 0 → 逆序标签区。',
            ],
          },
          diagram: {
            title: '分层 goto：每层失败跳到自己的回滚起点',
            content: `int my_init(...)
{
    r = alloc_A();  if (r) return r;     ── 第1步
    r = alloc_B();  if (r) goto err_a;   ── 第2步
    r = alloc_C();  if (r) goto err_b;   ── 第3步
    return 0;                       成功: 不进标签区
                                       │
err_b:  free_B();   ◀── 第3步失败落点   │ 逆
err_a:  free_A();   ◀── 第2步失败落点   │ 序
    return r;                           ▼ 释放

ERR_PTR 地址编码:
0x0000...0000 ─ 正常指针区 ─ 0xFFFF...F000 ─ 错误码区(4095个)
p = ERR_PTR(-EINVAL) → IS_ERR(p)=true → PTR_ERR(p)=-22`,
            caption: '上：goto 阶梯——标签顺序 = 资源获取的镜像。下：ERR_PTR 的地址空间约定，顶端一页永不作有效地址。',
          },
          codeWalk: {
            title: 'amdgpu 风格的 create 函数：三件套同框',
            language: 'c',
            file: 'amdgpu 惯用模式（依 amdgpu_bo_create/ctx 路径简化）',
            code: `struct my_ctx *my_ctx_create(struct my_dev *dev,
                             u32 count)   /* 来自用户态 */
{
	struct my_ctx *ctx;
	size_t bytes;
	int r;

	/* 1. 溢出检查: count 是用户给的 */
	if (check_mul_overflow((size_t)count,
			       sizeof(*ctx->slots), &bytes))
		return ERR_PTR(-EINVAL);

	ctx = kzalloc(sizeof(*ctx), GFP_KERNEL);
	if (!ctx)
		return ERR_PTR(-ENOMEM);

	/* 2. 等价于 kmalloc_array 的安全分配 */
	ctx->slots = kzalloc(bytes, GFP_KERNEL);
	if (!ctx->slots) {
		r = -ENOMEM;
		goto err_free_ctx;
	}

	r = my_hw_bind(dev, ctx);        /* 3. 硬件侧注册 */
	if (r)
		goto err_free_slots;

	return ctx;                      /* 成功出口 */

err_free_slots:
	kfree(ctx->slots);
err_free_ctx:
	kfree(ctx);
	return ERR_PTR(r);               /* 指针函数报错误码 */
}
/* 调用方:
 * ctx = my_ctx_create(dev, n);
 * if (IS_ERR(ctx)) return PTR_ERR(ctx);  */`,
            explanation:
              '注意三个细节：返回指针所以错误用 ERR_PTR 包装（调用方 IS_ERR/PTR_ERR 解包）；两个标签严格逆序且名字自述释放内容；乘法先过 check_mul_overflow 才进入分配。这个 40 行骨架就是 amdgpu 里几百个 create/init 函数的公共形状。',
          },
          miniLab: {
            title: '用故障注入证明你的清理路径无泄漏',
            objective: '写一个三步初始化 + 全路径故障注入，用 ASan 验证每条错误路径。',
            language: 'c',
            code: `/* 用户态 ERR_PTR 教学克隆 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#define MAX_ERRNO 4095
#define ERR_PTR(e)  ((void *)(long)(e))
#define IS_ERR(p)   ((unsigned long)(p) \\
                     >= (unsigned long)-MAX_ERRNO)
#define PTR_ERR(p)  ((long)(p))

static int fail_at;   /* 故障注入开关: 1..3 */
static void *try_alloc(int step, size_t n)
{
    if (step == fail_at) return NULL;
    return calloc(1, n);
}`,
            steps: [
              '基于骨架实现 create()：三步 try_alloc（模拟 ctx/slots/hw），任一步失败走分层 goto，返回 ERR_PTR(-ENOMEM)',
              'main 里循环 fail_at = 0..3 各调用一次：0 为成功路径（记得最后正常释放），1-3 为三条错误路径',
              '用 gcc -fsanitize=address 编译运行——ASan 静默即全部路径无泄漏；故意删掉一个 kfree 看 ASan 的 leak 报告长什么样',
              '加一个溢出实验：size_t bytes = count * 8 用 count = SIZE_MAX/4 触发回绕，打印 bytes 感受"溢出后分配成功但小得离谱"；再用 __builtin_mul_overflow 修复',
              '把"每条路径资源恰好释放一次"改写成你自己的 review 检查清单三条，记进日志',
            ],
            expectedOutput:
              'fail_at=0 输出成功；1-3 各返回 IS_ERR 为真的指针且 ASan 无泄漏报告；删掉 kfree 后 ASan 精确指出泄漏分配点。溢出实验打印出一个极小的 bytes 值——这就是堆溢出漏洞的第一现场。',
            hint: '用户态没有顶端页保护，这个 ERR_PTR 克隆纯为练习 API 形状；真实语义只在内核地址空间成立。',
          },
          debugExercise: {
            title: '这个 init 函数藏着三个错误路径 bug',
            language: 'c',
            question: '按本课的不变式审查这段代码：哪三条路径违反了"恰好释放一次"或 ERR_PTR 约定？',
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
            hint: 'A：调用方拿到 NULL 还是 ERR_PTR？B：n_dw 从哪来？C：跳到 err_all 时 hw_register 处于什么状态、buf 会被释放几次？',
            answer:
              'Bug A（约定混乱）：第一处失败 return NULL，其余路径 return ERR_PTR(err)——调用方无所适从：if (IS_ERR(r)) 漏掉 NULL，if (!r) 漏掉 ERR_PTR。统一为 ERR_PTR(-ENOMEM)。Bug B（溢出）：n_dw * 4 中 n_dw 是 u32，n_dw > 0x3FFFFFFF 时乘法回绕，分配远小于预期——用 kmalloc_array(n_dw, 4, GFP_KERNEL) 或先 check_mul_overflow。Bug C（双重释放 + 泄漏资源）：workqueue 失败跳 err_all，但控制流会先落进 err_buf 之后的 err_all 吗？——不会，直接跳 err_all 造成两个问题：其一 err_buf: 的 kfree(r->buf) 被跳过但 err_all: 里又有一个 kfree(r->buf)，看似释放了，然而路径 err_buf→err_all 会连续执行两个 kfree(r->buf)——hw_register 失败那条路双重释放；其二 workqueue 失败路径上 hw_register 已成功却无人 hw_unregister——资源泄漏。正确结构：每步一个标签严格逆序（err_wq→err_hw→err_buf→err_ctx），err_all 这种"一锅端"标签正是分层原则要消灭的东西。',
          },
          interviewQ: {
            question: 'ERR_PTR 机制是怎么把错误码塞进指针的？为什么这样做是安全的？什么时候应该返回 NULL 而不是 ERR_PTR？',
            difficulty: 'medium',
            hint: '顶端一页地址永不有效；IS_ERR 的判断条件；"没有"与"失败"的语义区分。',
            answer:
              '内核把虚拟地址空间最顶端的 4095 个值（对应 -1..-4095，即 -MAX_ERRNO..-1 转成无符号后的区间）保留为永不映射的非法地址，于是负 errno 强转成指针后落在这个区间，与一切有效指针无碰撞。ERR_PTR(err) 就是 (void *)err；IS_ERR(p) 判断 (unsigned long)p >= -4095UL；PTR_ERR(p) 转回 long。安全性来自双重保证：架构层面顶端页不建立映射（误解引用立刻 fault，不会静默读写），约定层面 errno 不超过 4095。NULL vs ERR_PTR 的分工看语义：查询类"没找到但这不是错误"（如 lookup 未命中、可选特性不存在）返回 NULL；执行类"尝试做但失败了、调用方需要知道原因"返回 ERR_PTR。同一个函数只用一种约定并在注释里写明；需要区分三态时有 IS_ERR_OR_NULL，但它的存在通常说明接口设计该重构了。',
            amdContext: 'amdgpu 里 dma_fence、gem object lookup、entity 获取全是 ERR_PTR 风格；面试让你写 create 函数时，返回约定 + goto 阶梯 + 溢出检查三件套齐活，基本就过了内核 C 这一关。',
          },
        },
        // ── Lesson 0.7.3.5 ────────────────────────────────────
        {
          id: 'cc-kernel-5',
          number: '0.7.3.5',
          title: '生命周期两大支柱：kref 引用计数与 devm 托管资源',
          titleEn: 'Lifetime Pillars: kref Refcounting & devm Resources',
          duration: 20,
          tags: ['kernel-C', 'kref', 'refcount', 'devm', 'lifetime'],
          concept: {
            summary:
              '"谁负责释放"是 C 里最难的问题。内核给出两根支柱：共享对象用 kref 引用计数——最后一个使用者触发 release；设备生命周期资源用 devm_ 托管——设备离场时自动逆序释放。amdgpu 的 BO、fence、ctx 全是 kref 家族，probe 路径大量使用 devm。',
            explanation: [
              '引用计数解决共享对象的释放权问题：fence 被提交者、等待者、中断处理各持有引用，谁都不知道自己是不是最后一个。kref 的答案：对象里嵌 struct kref（内部是 refcount_t，带溢出检测的原子计数），三条铁律——(1) 拿到指针要传给别人或存起来，先 kref_get；(2) 用完调 kref_put(&obj->ref, release)，计数归零时 release 回调被恰好调用一次，在里面 kfree；(3) put 之后这个指针立刻视为失效，再碰就是 use-after-free。所有权语义总结成一句：引用即所有权份额，get/put 必须严格配对。',
              '两个高频陷阱：其一"借用逃逸"——函数收到调用方持有的指针（借用），却把它存进了长生命周期的结构（如全局链表）而不 get，调用方 put 后链表里就是悬空指针；其二"归零后复活"——release 已跑，另一个线程还想 kref_get，为此查找路径必须用 kref_get_unless_zero（典型于"从链表找 fence"的场景），这也是为什么查找和释放通常要在同一把锁下协调。refcount_t 相比裸 atomic_t 的价值：饱和语义——计数溢出时卡死在饱和值并 WARN，把"计数回绕导致提前释放"这类可利用漏洞降级为拒绝服务。',
              'devm_（device-managed）是另一根支柱，解决的是 probe/remove 的对称性：驱动 probe 要申请十几种资源（内存、ioremap、中断、时钟），任何一步失败都要把前面的全撤销，remove 时还要再写一遍同样的撤销——两处极易失去同步。devm_kzalloc/devm_ioremap/devm_request_irq 把资源挂到 struct device 的托管链表上，probe 失败或设备移除时框架自动逆序释放，错误路径从 goto 阶梯十几层缩成 return。',
              'devm 的边界同样重要：只适用于"与设备同生共死"的资源；生命周期更短的（一次 ioctl 内的临时缓冲）用普通 kmalloc/kfree，更长的（跨设备共享、被用户态引用的对象如 fence/BO）用 kref——用 devm 管理它们会在设备拔出瞬间从用户态脚下抽走内存。另一个细节是释放顺序：devm 按注册的逆序释放，若手动 free 了一个 devm 资源就是未来的双重释放。经验分配：设备骨架 devm、共享对象 kref、临时缓冲手动——三分天下，各司其职。',
              '配套刷题（/code-lab）：k-04（kref_get/put 与 release 回调，用 container_of 回收宿主）、k-11（devres 清理栈——注册即忘的用户态复刻）、c-16（手动 create/destroy 对照组）——三题做完，三代资源管理的取舍自然清晰。',
            ],
            keyPoints: [
              'kref 三铁律：存起来先 get；用完 put(release)；put 后指针立即失效。',
              'release 在计数归零时恰好执行一次；查找路径用 kref_get_unless_zero 防"归零后复活"。',
              'refcount_t 带饱和+WARN：把计数回绕漏洞降级为 DoS——别用裸 atomic_t 计数。',
              'devm_：资源挂到 device，probe 失败/移除时自动逆序释放，消灭 probe/remove 不对称 bug。',
              '三分天下：设备骨架 devm、跨生命周期共享对象 kref、短命临时缓冲手动 kmalloc/kfree。',
            ],
          },
          diagram: {
            title: 'kref 的一生：三个持有者与一次 release',
            content: `        创建 fence (count=1, 创建者持有)
提交者 ──────────────┐
  kref_get → count=2 │ 等待者
             kref_get → count=3
                      │
提交完成 kref_put → 2 │
        等待返回 kref_put → 1
                创建者 kref_put → 0 ─▶ release(fence)
                                        └ kfree 恰好一次
铁律: put 之后 ✂ 指针作废, 再碰 = use-after-free

devm 对照:
probe: devm_kzalloc → devm_ioremap → devm_request_irq
        └────── 全部挂在 struct device 上 ──────┘
remove/probe失败: 框架自动逆序释放, 驱动零代码`,
            caption: '上：三个持有者的 get/put 时间线，release 只在归零那一刻发生。下：devm 把"逆序释放"外包给设备框架。',
          },
          codeWalk: {
            title: 'dma_fence：amdgpu 天天在用的 kref 实例',
            language: 'c',
            file: 'include/linux/dma-fence.h + drivers/dma-buf/dma-fence.c（节选简化）',
            code: `struct dma_fence {
	struct kref refcount;      /* ← 嵌入式引用计数 */
	const struct dma_fence_ops *ops;
	/* ... seqno, flags, cb_list ... */
};

/* get: 存指针/传递前必须调用 */
static inline struct dma_fence *
dma_fence_get(struct dma_fence *fence)
{
	if (fence)
		kref_get(&fence->refcount);
	return fence;
}

/* 查找场景: 计数可能正在归零 → unless_zero */
struct dma_fence *
dma_fence_get_rcu(struct dma_fence *fence)
{
	if (kref_get_unless_zero(&fence->refcount))
		return fence;
	return NULL;   /* 它正在死亡, 别碰 */
}

/* put: 归零触发 release */
void dma_fence_put(struct dma_fence *fence)
{
	if (fence)
		kref_put(&fence->refcount,
			 dma_fence_release);
}
/* amdgpu 用法: 提交返回的 fence 存进 ctx 前 get,
 * 等待完成后 put; ring 的 fence 数组、drm_sched
 * 的依赖跟踪, 全是同一套 get/put 节奏 */`,
            explanation:
              'dma_fence 是 GPU 栈的"心跳"对象（GPU 架构模块的 fence 就是它），它的生死完全由 kref 管理。注意 get_rcu 版本用 unless_zero——从共享结构里捞 fence 时它可能正被释放，这个 API 把"复活垂死对象"变成安全的失败。你未来读 amdgpu_ctx.c、amdgpu_sync.c 时会看到这套节奏无处不在。',
          },
          miniLab: {
            title: '用户态克隆 kref，亲手制造并修复借用逃逸',
            objective: '实现 kref 三铁律，用 ASan 见证违反每条铁律的后果。',
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
              '补齐 release 函数（container_of 找回 fence 再 free）和一个"等待者"函数：收到 fence 先 get、用完 put',
              '正常剧本：创建(count=1) → 交给等待者(内部 get/put) → 创建者 put → ASan 干净退出，printf 确认 release 恰好打印一次',
              '违反铁律一：等待者把 fence 存进全局数组但不 get；创建者 put 后再从数组里读 seqno——ASan 报 heap-use-after-free，这就是"借用逃逸"',
              '违反铁律三：创建者 put 两次——ASan 报 double-free（经由 release 二次进入）',
              '把内核 refcount_t 的饱和行为查一下（elixir: refcount_warn_saturate），一句话记录它相比你这个裸 atomic 版多防了什么',
            ],
            expectedOutput:
              '正常剧本 release 打印一次、ASan 无告警；铁律一违规精确报 use-after-free 且指出分配/释放栈；铁律三违规报 double-free。日志结论：裸 atomic 计数回绕可导致提前释放（可利用），refcount_t 饱和 + WARN 把它变成可诊断的拒绝服务。',
            hint: 'container_of 用 cc-kernel-2 实验里的宏；ASan 编译开关 -fsanitize=address -g。',
          },
          debugExercise: {
            title: '这个缓存层为什么偶尔崩在别人手里？',
            language: 'c',
            question: '同事写了个 fence 缓存："反正 get/put 配对了"。压力测试下其他模块偶发 use-after-free。找出两处引用计数错误。',
            buggyCode: `static struct fence *cache[16];
static DEFINE_SPINLOCK(cache_lock);

/* 存入缓存: 调用方持有 f 的一个引用 */
void cache_store(int slot, struct fence *f)
{
	spin_lock(&cache_lock);
	cache[slot] = f;          /* A: 只是存指针 */
	spin_unlock(&cache_lock);
}

/* 从缓存取用 */
struct fence *cache_lookup(int slot)
{
	struct fence *f;

	spin_lock(&cache_lock);
	f = cache[slot];
	spin_unlock(&cache_lock);
	if (f)
		kref_get(&f->ref);    /* B: 锁外 get */
	return f;
}`,
            hint: 'A：缓存自己算不算一个持有者？调用方之后 put 了会怎样？B：get 发生在锁外——在锁释放到 get 执行之间，别的 CPU 可以做什么？',
            answer:
              '错误 A（借用逃逸）：cache_store 把指针存进长生命周期的数组却不 kref_get——缓存成为一个"不持股的股东"。调用方随后合法地 put 掉自己的引用，计数归零 release 执行，cache[slot] 从此悬空；下一个 lookup 者拿到的就是已释放内存。修法：store 时 kref_get（缓存持有一份），替换/清除槽位时对旧值 kref_put。错误 B（检查与获取的窗口）：lookup 在锁外做 kref_get——从 spin_unlock 到 kref_get 之间，另一个 CPU 可能执行了最后一次 put，release 已跑完，这次 get 是在给已释放内存的计数加一（use-after-free 且制造"复活的僵尸"）。修法：get 必须在锁内完成，且用 kref_get_unless_zero：失败说明对象正在死亡，返回 NULL 让调用方重试/放弃。两个错误合起来正是 dma_fence_get_rcu 存在的原因——查找路径的引用获取是并发 refcounting 的最难一角。',
          },
          interviewQ: {
            question: 'kref_put 的 release 回调为什么由 put 触发而不是让调用者自己判断计数？devm_ 资源什么时候不该用？',
            difficulty: 'hard',
            hint: '前半想"判断和行动之间的窗口"；后半想生命周期不匹配的两个方向。',
            answer:
              '如果 API 是"put 后自己读计数、为零就 free"，那么"读到零"和"free"之间存在窗口：另一线程可能在窗口里 get（基于它还持有的旧指针语义错误地复活对象）或同样读到零并 free（双重释放）。kref_put 把"减一、判零、触发 release"合成一个原子决策点，保证 release 恰好一次、且归零后不存在合法的 get 路径（配合查找侧 kref_get_unless_zero）。这是并发所有权的关键设计：释放决策必须在计数操作的原子性内部完成。devm 不该用的场景：(1) 生命周期短于设备——一次操作内的临时缓冲用 devm 会累积到设备移除才释放，等于泄漏；(2) 生命周期长于设备——被用户态或其他子系统引用的对象（fence、BO、dma-buf），设备热拔时 devm 强制释放会在引用者脚下抽走内存，这类对象必须 kref 并允许"设备已死、对象缓亡"；(3) 释放顺序有特殊要求且与注册逆序不符时。判断口诀：资源的死亡时刻是否严格等于设备的死亡时刻——是才 devm。',
            amdContext: 'GPU 热拔（hotplug/unplug）是 amdgpu 近年的重点工程，大量补丁就在处理"设备死了但 fence/BO 还被用户态攥着"——面试聊到 kref vs devm 的边界，举热拔例子直接命中在做的工作。',
          },
        },
        // ── Lesson 0.7.3.6 ────────────────────────────────────
        {
          id: 'cc-kernel-6',
          number: '0.7.3.6',
          title: '并发上下文的 C 规则：自旋锁、互斥锁与"不能睡眠"',
          titleEn: 'Concurrency Contexts in C: Spinlocks, Mutexes & "May Not Sleep"',
          duration: 22,
          tags: ['kernel-C', 'spinlock', 'mutex', 'atomic-context', 'workqueue'],
          concept: {
            summary:
              '内核代码运行在两类上下文里：进程上下文可以睡眠，原子上下文（中断处理、持自旋锁期间）绝对不能。这条线决定了一切并发选择：自旋锁短平快可用于原子上下文，互斥锁会睡只能进程上下文用，GFP_KERNEL 分配会睡、中断里必须 GFP_ATOMIC，重活从中断逃到 workqueue。违反规则的代价是死锁或整机卡死。',
            explanation: [
              '先立地基："睡眠"在内核里指主动让出 CPU 等待（mutex_lock 等不到、kmalloc(GFP_KERNEL) 等内存回收、msleep 等时间）。进程上下文（系统调用、ioctl、workqueue 里）有一个可以被调度走的进程身份，睡眠没问题。原子上下文没有：中断处理程序借用了被打断者的现场，持自旋锁时其他 CPU 正在忙等你——这时睡眠轻则死锁（等你锁的 CPU 永远等不到）、重则调度器直接 BUG("scheduling while atomic")。写每一行驱动代码前先问：我此刻在哪类上下文？',
              '两把锁的选择树由此而来。spinlock：忙等（不睡眠），加锁解锁纳秒级，可用于任何上下文——但临界区必须极短（别的 CPU 在烧电空转），区内绝不能调用任何可能睡眠的函数。与中断共享数据时用 spin_lock_irqsave（顺手关本地中断）：否则持锁时被同一把锁的中断处理打断 = 单核自死锁。mutex：等不到就睡，去调度别人——临界区可以长、可以在区内睡眠（比如区内再拿别的 mutex、做分配），但只能在进程上下文用。经验法则：保护"改几个指针/标志"的短临界区用 spinlock，保护"一整段可能睡眠的复杂操作"用 mutex；amdgpu 里 fence 列表用 spinlock、BO 预留和大结构初始化用 mutex/dma-resv。',
              '中断上下文干不了重活怎么办？内核的标准逃生通道是 workqueue：中断处理只做最小急救（读状态寄存器、确认中断、记下要干什么），然后 schedule_work 把重活扔给 worker 线程——它在进程上下文里跑，能睡眠能加 mutex 能分配 GFP_KERNEL。amdgpu 的节奏就是如此：GPU 中断 → amdgpu_irq 分发 → fence 处理快速完成，而 GPU reset 这种大手术全部走 work（amdgpu_device_gpu_recover 由专门的 work 触发）。C 语言层面注意 work 的模式：struct work_struct 嵌进你的结构体，handler 里 container_of 找回宿主——又是第 2 课的侵入式设计。',
              '无锁的轻武器也要认识：atomic_t/atomic64_t 适合独立计数器（统计、序号发生器），单个操作原子但"读-判断-写"的组合不原子——需要组合语义时用 atomic_cmpxchg 或回到锁；refcount_t（上一课）是它的引用计数特化。最后是纪律性的三条：数据和保护它的锁声明在一起并写注释（/* protected by @lock */）；多把锁固定获取顺序（文档化，防 AB-BA 死锁）；临界区里的代码当成"借来的时间"——能挪出去的全挪出去。这些规则贯穿你将读到的每一个 amdgpu 文件。',
              '配套刷题提示：并发原语无法在单线程判题环境里真实演练，但 k-05（环形缓冲 wptr/rptr）与 k-10（fence 序号回绕）正是本课并发结构的单线程骨架——先把这两题的内存模型吃透，模块 1 的原子操作与锁会顺滑得多。',
            ],
            keyPoints: [
              '两类上下文：进程上下文可睡眠；原子上下文（中断、持 spinlock）绝不可睡——每行代码先问自己在哪。',
              'spinlock：忙等、任何上下文、临界区必须短且不可睡；与中断共享用 _irqsave 防单核自死锁。',
              'mutex：会睡眠、仅进程上下文、临界区可长可睡——两把锁的选择树背下来。',
              '分配也分上下文：GFP_KERNEL 可能睡（进程上下文）；原子上下文必须 GFP_ATOMIC（可失败，要处理）。',
              '中断逃生通道 workqueue：中断只做急救 + schedule_work，重活到进程上下文干——amdgpu reset 即此模式。',
            ],
          },
          diagram: {
            title: '上下文决定一切：一张决策图',
            content: `我在哪?
├─ 进程上下文 (ioctl/syscall/workqueue)
│    可睡眠 ✓ → mutex ✓  GFP_KERNEL ✓  msleep ✓
│    (但持 spinlock 的瞬间, 你就进入 ↓)
└─ 原子上下文 (中断处理 / 持 spinlock / preempt off)
     可睡眠 ✗ → spinlock ✓  GFP_ATOMIC ✓
                mutex ✗  GFP_KERNEL ✗  msleep ✗

中断里有重活?
  IRQ handler: 读状态/确认中断 (微秒级)
      └─ schedule_work(&dev->reset_work)
             └─ worker 线程 (进程上下文): 能睡能锁能分配
与中断共享数据?
  spin_lock_irqsave(&lock, flags)  ← 防单核自死锁`,
            caption: '整课就是这张决策图。打印出来贴墙上——直到"此刻能不能睡"成为写每个函数前的本能提问。',
          },
          codeWalk: {
            title: 'amdgpu 的中断→work 节奏：急救与手术分离',
            language: 'c',
            file: 'drivers/gpu/drm/amd/amdgpu/（fence/reset 路径节选简化）',
            code: `/* ── 中断侧: 原子上下文, 只做急救 ────────── */
int amdgpu_fence_process(struct amdgpu_ring *ring)
{
	struct amdgpu_fence_driver *drv = &ring->fence_drv;
	u32 seq;

	seq = le32_to_cpu(*drv->cpu_addr); /* 读完成序号 */
	/* 唤醒等待者: wake_up 不睡眠, 原子上下文安全 */
	if (unlikely(seq != drv->sync_seq))
		wake_up_all(&drv->fence_queue);
	return 0;
}

/* hang 检测(定时器/中断路径)发现超时: 不敢在这做 reset */
static void amdgpu_fence_fallback(struct timer_list *t)
{
	struct amdgpu_ring *ring =
		from_timer(ring, t, fence_drv.fallback_timer);
	if (amdgpu_fence_process(ring))
		return;
	/* 重活入队: 交给进程上下文 */
	schedule_work(&ring->adev->reset_work);
}

/* ── work 侧: 进程上下文, 可以动大手术 ───── */
static void amdgpu_reset_work_handler(
		struct work_struct *work)
{
	struct amdgpu_device *adev = container_of(
		work, struct amdgpu_device, reset_work);

	/* 这里可以: mutex_lock, GFP_KERNEL 分配,
	 * 等 fence, 停调度器, 重新初始化 IP blocks…
	 * ——全套 GPU reset, 分钟级也没关系 */
	amdgpu_device_gpu_recover(adev, NULL, &reset_ctx);
}`,
            explanation:
              '三段式节奏读三遍：中断里只有读序号 + wake_up（都不睡眠）；发现要 reset 时不动手，schedule_work 入队走人；work handler 在进程上下文里从容做全套手术。container_of 从 work_struct 找回 adev——侵入式设计第三次登场。这个"急救/手术分离"模式是所有设备驱动中断设计的母题。',
          },
          miniLab: {
            title: '上下文判断特训：12 段代码的生死判决',
            objective: '把"此刻能不能睡"练成条件反射——不需要 AMD 硬件，纸笔即可。',
            steps: [
              '对下面每段代码判断合法/非法并说明理由：① 中断处理里 mutex_lock ② 中断处理里 spin_lock ③ 持 spinlock 时 kmalloc(GFP_KERNEL) ④ 持 spinlock 时 kmalloc(GFP_ATOMIC) ⑤ 持 mutex 时 msleep ⑥ 持 mutex 时再 mutex_lock 另一把锁',
              '继续：⑦ workqueue handler 里 mutex_lock ⑧ 中断里 schedule_work ⑨ 持 spin_lock（非 irqsave）的数据同时被中断处理访问 ⑩ ioctl 路径里 GFP_KERNEL ⑪ 中断里 wake_up ⑫ 持 spinlock 时 copy_from_user',
              '对每个"非法"写出正确替代（如 ① → 急救+schedule_work；⑨ → spin_lock_irqsave）',
              '上 elixir 验证两处真实代码印证你的判断：amdgpu_fence_process 里为什么全程无锁无分配；amdgpu_device_gpu_recover 为什么开头就能 mutex/等待',
              '把 6 条判决规则总结成你自己的速查卡（上下文 × 允许操作矩阵）记进日志',
            ],
            expectedOutput:
              '判决：①✗ ②✓ ③✗ ④✓ ⑤✗(合法但极坏的实践——mutex 区内睡眠拖住所有等锁者；若无充分理由应重构) ⑥✓(注意锁序) ⑦✓ ⑧✓ ⑨✗ ⑩✓ ⑪✓ ⑫✗(可能缺页睡眠)。速查卡两行核心：原子上下文=不睡不 GFP_KERNEL 不 mutex；与中断共享=irqsave。',
            hint: '⑫ 最隐蔽：copy_from_user 遇到未映射页会缺页睡眠——持 spinlock 时碰用户内存是经典事故。',
          },
          debugExercise: {
            title: '这个中断处理函数是一张死锁菜单',
            language: 'c',
            question: '新人的"高效"中断处理，跑几分钟系统整个冻住。按本课决策图找出四处上下文违规。',
            buggyCode: `static irqreturn_t my_gpu_irq(int irq, void *arg)
{
	struct my_dev *dev = arg;
	u32 status;

	mutex_lock(&dev->hw_lock);            /* A */
	status = read_status(dev);

	if (status & ERROR_BIT) {
		/* 记录详细错误信息 */
		dev->err_log = kmalloc(4096,
				       GFP_KERNEL);  /* B */
		fill_error_log(dev->err_log, dev);

		/* 直接在这里做 GPU 复位 */
		do_full_gpu_reset(dev);       /* C: 内部
			mutex_lock + msleep(100)×N */
	}

	spin_lock(&dev->list_lock);           /* D:
		此锁也被非中断路径以 spin_lock 持有 */
	list_add_tail(&dev->ev.node, &dev->events);
	spin_unlock(&dev->list_lock);

	mutex_unlock(&dev->hw_lock);
	return IRQ_HANDLED;
}`,
            hint: '逐行过决策图：中断=原子上下文。A/B/C 各撞了哪条？D 单看这里合法，但结合"非中断路径也拿这把锁"想想那一侧缺了什么。',
            answer:
              'A：中断（原子上下文）里 mutex_lock——mutex 会睡眠，原子上下文睡眠即"scheduling while atomic"，直接可 BUG。B：GFP_KERNEL 在中断里——分配压力大时会进入回收路径睡眠；中断里只能 GFP_ATOMIC（且要处理失败），或者更好：预分配缓冲。C：中断里做整套 GPU reset（内部 mutex + msleep）——重活必须 schedule_work 逃到进程上下文，这正是 amdgpu reset_work 的设计原因。D：这一行本身用 spin_lock 没错，但题干说非中断路径也用普通 spin_lock 拿同一把锁——那一侧持锁时被本中断打断，中断又来拿同一把锁 = 单核自死锁；修法是进程侧用 spin_lock_irqsave（中断侧在 handler 里本地中断已屏蔽，可用 spin_lock）。整改后的正确形状：handler 里 spin_lock 读状态 + 预分配/GFP_ATOMIC 记要点 + schedule_work，全程微秒级；所有 mutex/reset/msleep 进 work。四个错各对应决策图一条边——这道题就是那张图的反面教材。',
          },
          interviewQ: {
            question: '为什么持有自旋锁时不能睡眠？spin_lock 和 spin_lock_irqsave 怎么选？',
            difficulty: 'hard',
            hint: '两条死锁链：跨 CPU 忙等等不到 + 单核中断重入；irqsave 的判据是"这把锁是否也在中断路径使用"。',
            answer:
              '持自旋锁睡眠的两条死路：(1) 跨 CPU——其他 CPU 在忙等这把锁（自旋不让出 CPU），你却睡了且可能长时间不被调度回来，等锁的 CPU 空转到系统瘫痪；若调度器把另一个也要这把锁的任务放上你的 CPU，永久死锁。(2) 配置层——持锁区在多数配置下关闭抢占，睡眠触发调度直接违反调度器不变式，内核报 "BUG: scheduling while atomic"。因此自旋锁临界区必须短且区内只调用绝不睡眠的函数。irqsave 的选择判据一句话：这把锁保护的数据是否也会在中断（或软中断）路径被访问？会——进程侧必须 spin_lock_irqsave（关本地中断再拿锁），否则进程侧持锁时本 CPU 来了中断、中断处理再拿同一把锁，就是单核自死锁；不会——普通 spin_lock 即可，少关中断降低延迟。补充加分：irqsave 保存并恢复中断状态（flags），使其可嵌套在"中断可能已关"的路径里安全使用；软中断场景对应 spin_lock_bh。面试展开时配 amdgpu 实例：fence 的 lock 用 irqsave 系（中断路径 amdgpu_fence_process 会碰），而纯进程侧的结构用普通 spinlock 或 mutex。',
            amdContext: '并发上下文题是 AMD 内核岗电面的固定环节，常见形式就是给一段中断处理代码找错——本课 debug 练习的四类错误覆盖了最常被考察的出错模式；能主动说出 amdgpu 的 irq→work 分离设计会显著加分。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '能解释一个 .c 文件从源码到目标文件再到链接的完整过程，并说清声明与定义的区别',
    '能正确使用定宽整数，识别整数提升与有符号/无符号转换带来的陷阱',
    '能熟练使用指针、输出参数，并避免悬空指针与越界',
    '理解结构体内存布局、对齐与位域，能解释 padding 的来源',
    '理解栈/堆与内存生命周期，能用 goto 清理写出无泄漏的 C 资源管理',
    '能用函数指针/ops 结构体在 C 中实现多态，并把它对应到 C++ 虚函数',
    '掌握 C++ 的引用、类与 RAII、拷贝/移动、继承多态、模板、STL 容器与智能指针',
    '能熟练使用 BIT/GENMASK/FIELD_GET 与 REG_GET_FIELD 操作寄存器字段，并识别移位 UB',
    '能实现并正确使用侵入式链表：list_for_each_entry 及其 _safe 变体、list_move 状态迁移',
    '能写出符合内核卫生规范的宏（do-while(0)、单次求值），并解释指定初始化器对 ops 表的意义',
    '能按 ERR_PTR/分层 goto/溢出检查三件套写出 review 能过的错误处理路径',
    '掌握 kref 三铁律与 kref_get_unless_zero 的查找场景，能判断 devm/kref/手动管理的适用边界',
    '能对任意一段驱动代码判断其运行上下文，并据此正确选择 spinlock/mutex/GFP 标志/workqueue',
  ],
};
