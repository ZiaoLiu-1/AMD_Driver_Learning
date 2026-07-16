/* ============================================================
   Code Lab — Track 3: 内核惯用法 (Kernel Idioms), 12 problems
   Kernel patterns ported to userspace so they compile & run
   in the browser judge: container_of, intrusive lists, kref,
   rings, goto ladders, ERR_PTR, ioctl encoding, seqno wrap.
   ============================================================ */
import type { CodeProblem } from "./code_problems_types";

export const codeProblemsKernel: CodeProblem[] = [
  {
    id: "k-01",
    track: "kernel",
    number: 1,
    title: "container_of：从成员找回宿主",
    titleEn: "container_of: From Member Back to Host",
    difficulty: "medium",
    minutes: 15,
    tags: ["container_of", "offsetof", "内核惯用法"],
    tagsEn: ["container_of", "offsetof", "kernel-idioms"],
    lessonId: "cc-kernel-2",
    brief: "内核最著名的宏：拿着结构体成员的指针，反推出整个结构体的地址。",
    briefEn: "The kernel’s most famous macro: given a pointer to a member, recover the whole struct.",
    description: [
      '内核回调经常只把"成员"的指针交还给你：调度器给你 `sched_entity*`，定时器给你 `timer_list*`——但你要操作的是包着它的大结构体。`container_of(ptr, type, member)` 用一次减法完成反推：成员地址 - 成员在结构体里的偏移 = 结构体首地址。',
      '给定 `struct fence_cb { int flags; }` 内嵌于 `struct gpu_job { int id; char name[12]; struct fence_cb cb; int prio; }`。实现：(1) 宏 `container_of(ptr, type, member)`（用 `offsetof`）；(2) 函数 `job_from_cb(struct fence_cb *cb)`——用你的宏还原 gpu_job；(3) `job_prio_from_cb(cb)`——直接返回宿主 job 的 prio。',
      '这个宏是读懂 amdgpu 代码的门票：`to_amdgpu_ring(sched)`、`to_amdgpu_bo(tbo)` 全是它的马甲。',
    ],
    descriptionEn: [
      'Kernel callbacks often hand you only a pointer to a *member*: the scheduler gives you `sched_entity*`, timers give you `timer_list*` — but you need the big struct wrapping it. `container_of(ptr, type, member)` recovers it with one subtraction: member address - member offset within the struct = struct base address.',
      'Given `struct fence_cb { int flags; }` embedded in `struct gpu_job { int id; char name[12]; struct fence_cb cb; int prio; }`. Implement: (1) the macro `container_of(ptr, type, member)` (via `offsetof`); (2) `job_from_cb(struct fence_cb *cb)` — recover the gpu_job with your macro; (3) `job_prio_from_cb(cb)` — return the host job’s prio directly.',
      'This macro is the admission ticket to amdgpu code: `to_amdgpu_ring(sched)`, `to_amdgpu_bo(tbo)` are all its aliases.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

struct fence_cb {
    int flags;
};

struct gpu_job {
    int id;
    char name[12];
    struct fence_cb cb;
    int prio;
};

/* TODO: 实现 container_of(ptr, type, member) */
#define container_of(ptr, type, member) \\
    ((type *)0) /* 替换这行 */

struct gpu_job *job_from_cb(struct fence_cb *cb)
{
    (void)cb;
    return 0; /* TODO */
}

int job_prio_from_cb(struct fence_cb *cb)
{
    (void)cb;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>

struct fence_cb {
    int flags;
};

struct gpu_job {
    int id;
    char name[12];
    struct fence_cb cb;
    int prio;
};

/* TODO: implement container_of(ptr, type, member) */
#define container_of(ptr, type, member) \\
    ((type *)0) /* replace this line */

struct gpu_job *job_from_cb(struct fence_cb *cb)
{
    (void)cb;
    return 0; /* TODO */
}

int job_prio_from_cb(struct fence_cb *cb)
{
    (void)cb;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    struct gpu_job job = { .id = 7, .prio = 3 };
    strcpy(job.name, "vcn_dec");
    job.cb.flags = 0x5;

    struct gpu_job *back = job_from_cb(&job.cb);
    check("recovers exact address", back == &job);
    check("fields readable via recovery", back->id == 7 && back->prio == 3);
    check("name intact", strcmp(back->name, "vcn_dec") == 0);
    check("prio helper", job_prio_from_cb(&job.cb) == 3);

    struct gpu_job jobs[3] = { { .prio = 10 }, { .prio = 20 }, { .prio = 30 } };
    check("works inside arrays", job_from_cb(&jobs[1].cb) == &jobs[1]);
    check("array element prio", job_prio_from_cb(&jobs[2].cb) == 30);

    /* the macro itself works for any struct/member pair */
    struct pair { int a; int b; };
    struct pair p = { 1, 2 };
    check("macro is generic", container_of(&p.b, struct pair, b) == &p);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '公式：`(type *)((char *)(ptr) - offsetof(type, member))`——必须先转 `char *` 才能按字节做减法（void* 不能做算术，type* 步长又不对）。',
      'offsetof(type, member) 在 <stddef.h> 里，返回成员到结构体开头的字节距离——编译期常量。',
      'job_from_cb 就一行：`return container_of(cb, struct gpu_job, cb);`——第三个参数是成员**名**，不是指针。',
    ],
    hintsEn: [
      'The formula: `(type *)((char *)(ptr) - offsetof(type, member))` — cast to `char *` first for byte arithmetic (void* has no arithmetic; type* strides wrongly).',
      'offsetof(type, member) lives in <stddef.h>: the byte distance from struct start to the member — a compile-time constant.',
      'job_from_cb is one line: `return container_of(cb, struct gpu_job, cb);` — the third argument is the member *name*, not a pointer.',
    ],
    solution: `#include <stddef.h>

struct fence_cb {
    int flags;
};

struct gpu_job {
    int id;
    char name[12];
    struct fence_cb cb;
    int prio;
};

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct gpu_job *job_from_cb(struct fence_cb *cb)
{
    return container_of(cb, struct gpu_job, cb);
}

int job_prio_from_cb(struct fence_cb *cb)
{
    return container_of(cb, struct gpu_job, cb)->prio;
}`,
    solutionNote:
      '三个理解层次：(1) 数学上就是"成员地址减偏移"；(2) 类型上必须经过 char*（字节单位算术）；(3) 工程上它让"把小结构体嵌进大结构体"成为内核的组合范式——链表节点、定时器、工作项全部内嵌，然后 container_of 找回宿主（k-02 立刻用到）。内核真身（include/linux/container_of.h）还有 typeof 静态类型检查，防止传错成员。',
    solutionNoteEn:
      'Three levels: (1) mathematically it is "member address minus offset"; (2) type-wise the char* hop is mandatory (byte arithmetic); (3) engineering-wise it makes "embed small structs into big ones" the kernel’s composition paradigm — list nodes, timers, work items are all embedded, then container_of recovers the host (used immediately in k-02). The real one (include/linux/container_of.h) adds a typeof static check against wrong-member mistakes.',
  },
  {
    id: "k-02",
    track: "kernel",
    number: 2,
    title: "侵入式链表：list_add / list_del",
    titleEn: "Intrusive Lists: list_add / list_del",
    difficulty: "medium",
    minutes: 20,
    tags: ["链表", "list_head", "指针"],
    tagsEn: ["lists", "list_head", "pointers"],
    lessonId: "cc-kernel-2",
    brief: "内核链表把节点嵌进你的结构体——实现哨兵环形双链表的四个核心操作。",
    briefEn: "Kernel lists embed the node inside your struct — implement the four core ops of the sentinel circular doubly-linked list.",
    description: [
      '教科书链表让节点持有数据指针；内核反过来：`struct list_head { next, prev }` 嵌进**你的**结构体，一个对象可以同时挂在多条链上，且无需为节点单独分配内存。整个内核（包括 amdgpu 的 BO 列表、调度队列）都用这一套。',
      '内核链表是**带哨兵的环形双链**：空链表 = 哨兵的 next/prev 都指向自己。实现四个函数：`list_init(head)`；`list_add(new, head)`——插到哨兵之后（头插）；`list_add_tail(new, head)`——插到哨兵之前（尾插）；`list_del(entry)`——摘除并把 entry 的指针置为 NULL（内核置 LIST_POISON，这里用 NULL 表达同一意图：摘掉的节点不能再被误用）。',
      '不变量思维是关键：任何时刻，环上每对相邻节点都满足 `a->next == b && b->prev == a`。每个函数都要维护它。',
    ],
    descriptionEn: [
      'Textbook lists give nodes a data pointer; the kernel inverts it: `struct list_head { next, prev }` is embedded in **your** struct, so one object can hang on several lists at once with no separate node allocation. The whole kernel — including amdgpu’s BO lists and scheduler queues — runs on this.',
      'Kernel lists are **sentinel circular doubly-linked**: an empty list = the sentinel’s next/prev pointing at itself. Implement four functions: `list_init(head)`; `list_add(new, head)` — insert right after the sentinel (push front); `list_add_tail(new, head)` — insert right before it (push back); `list_del(entry)` — unlink and set entry’s pointers to NULL (the kernel writes LIST_POISON; NULL states the same intent: a removed node must not be reused silently).',
      'Think in invariants: at all times every adjacent pair on the ring satisfies `a->next == b && b->prev == a`. Every function must preserve it.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

void list_init(struct list_head *head)
{
    (void)head; /* TODO: 空链 = 自环 */
}

void list_add(struct list_head *new_node, struct list_head *head)
{
    (void)new_node; (void)head; /* TODO: 头插 */
}

void list_add_tail(struct list_head *new_node, struct list_head *head)
{
    (void)new_node; (void)head; /* TODO: 尾插 */
}

void list_del(struct list_head *entry)
{
    (void)entry; /* TODO: 摘除, entry 指针置 NULL */
}`,
    starterCodeEn: `#include <stddef.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

void list_init(struct list_head *head)
{
    (void)head; /* TODO: empty list = self-loop */
}

void list_add(struct list_head *new_node, struct list_head *head)
{
    (void)new_node; (void)head; /* TODO: push front */
}

void list_add_tail(struct list_head *new_node, struct list_head *head)
{
    (void)new_node; (void)head; /* TODO: push back */
}

void list_del(struct list_head *entry)
{
    (void)entry; /* TODO: unlink, then NULL entry's pointers */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static int ring_ok(struct list_head *head, int expect_len)
{
    int n = 0;
    struct list_head *p = head->next;
    while (p != head) {
        if (p->next->prev != p || p->prev->next != p) return 0;
        n++;
        if (n > 100) return 0;
        p = p->next;
    }
    return n == expect_len && head->next->prev == head;
}

int main(void)
{
    struct list_head head, a, b, c;
    list_init(&head);
    check("empty list self-loops", head.next == &head && head.prev == &head);
    check("empty ring invariant", ring_ok(&head, 0));

    list_add(&a, &head);            /* [a] */
    check("first add", head.next == &a && head.prev == &a && ring_ok(&head, 1));

    list_add(&b, &head);            /* [b a] */
    check("push front order", head.next == &b && b.next == &a && ring_ok(&head, 2));

    list_add_tail(&c, &head);       /* [b a c] */
    check("push back order", head.prev == &c && a.next == &c && ring_ok(&head, 3));

    list_del(&a);                   /* [b c] */
    check("middle delete relinks", b.next == &c && c.prev == &b && ring_ok(&head, 2));
    check("deleted node poisoned", a.next == NULL && a.prev == NULL);

    list_del(&b);
    list_del(&c);
    check("drained back to empty", ring_ok(&head, 0));

    list_add_tail(&a, &head);
    check("reuse after re-add", ring_ok(&head, 1) && head.next == &a);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '插入的通用子问题："把 new 塞进 prev 和 next 之间"：`next->prev = new; new->next = next; new->prev = prev; prev->next = new;`——内核就有这个私有助手 __list_add(new, prev, next)。',
      '头插 = __list_add(new, head, head->next)；尾插 = __list_add(new, head->prev, head)。两个公开函数瞬间变成一行。',
      '删除："让我的邻居互相牵手"：`entry->prev->next = entry->next; entry->next->prev = entry->prev;` 然后毒化自己的指针。',
      '哨兵的美：所有函数零特判——空表、单元素、头尾位置全是同一套指针操作。',
    ],
    hintsEn: [
      'The shared sub-problem: "wedge new between prev and next": `next->prev = new; new->next = next; new->prev = prev; prev->next = new;` — the kernel has exactly this private helper, __list_add(new, prev, next).',
      'Push front = __list_add(new, head, head->next); push back = __list_add(new, head->prev, head). Both public functions collapse to one line.',
      'Delete: "make my neighbors hold hands": `entry->prev->next = entry->next; entry->next->prev = entry->prev;` then poison your own pointers.',
      'The sentinel’s beauty: zero special cases — empty list, single element, head or tail are all the same pointer moves.',
    ],
    solution: `#include <stddef.h>

struct list_head {
    struct list_head *next;
    struct list_head *prev;
};

static void __list_add(struct list_head *new_node,
                       struct list_head *prev,
                       struct list_head *next)
{
    next->prev = new_node;
    new_node->next = next;
    new_node->prev = prev;
    prev->next = new_node;
}

void list_init(struct list_head *head)
{
    head->next = head;
    head->prev = head;
}

void list_add(struct list_head *new_node, struct list_head *head)
{
    __list_add(new_node, head, head->next);
}

void list_add_tail(struct list_head *new_node, struct list_head *head)
{
    __list_add(new_node, head->prev, head);
}

void list_del(struct list_head *entry)
{
    entry->prev->next = entry->next;
    entry->next->prev = entry->prev;
    entry->next = NULL;
    entry->prev = NULL;
}`,
    solutionNote:
      '与 include/linux/list.h 逐行同构（那边 poison 用 LIST_POISON1/2——非法地址，误用立刻崩给你看，比静默腐化好一万倍）。哨兵环形设计消灭了所有 if：这是"用数据结构不变量换代码分支"的经典案例。注意此链表存的全是 list_head——数据在哪？在宿主结构体里，靠 k-01 的 container_of 找回：k-03 见。',
    solutionNoteEn:
      'Line-for-line isomorphic to include/linux/list.h (which poisons with LIST_POISON1/2 — illegal addresses that crash loudly on misuse, ten thousand times better than silent corruption). The sentinel-ring design eliminates every if: a classic trade of data-structure invariants for code branches. Notice the list stores only list_heads — where is the data? In the host struct, recovered via k-01’s container_of: see k-03.',
  },
  {
    id: "k-03",
    track: "kernel",
    number: 3,
    title: "链表遍历与安全删除",
    titleEn: "List Traversal & Safe Removal",
    difficulty: "hard",
    minutes: 25,
    tags: ["链表", "container_of", "迭代器失效"],
    tagsEn: ["lists", "container_of", "iterator-invalidation"],
    lessonId: "cc-kernel-2",
    brief: "边遍历边删除是链表第一大坑——实现 for_each、按条件删除，理解 _safe 后缀的含义。",
    briefEn: "Deleting while iterating is the number-one list trap — implement for_each and conditional removal, and understand the _safe suffix.",
    description: [
      'k-02 的链表只存 list_head，这题把数据接回来：`struct gpu_bo { u32 size; struct list_head node; }` 挂在 LRU 链上。遍历时拿到的是 `list_head*`，用 container_of 还原 gpu_bo——这就是内核 `list_for_each_entry` 宏帮你做的事。',
      '实现三个函数（list_head 基础操作已提供）：(1) `lru_total_size(head)`——遍历累加所有 BO 的 size；(2) `lru_find(head, min_size)`——返回第一个 `size >= min_size` 的 BO，找不到返回 NULL；(3) `lru_evict_smaller(head, threshold)`——**删除**所有 `size < threshold` 的节点，返回删除个数。',
      '第 (3) 问是本题灵魂：`p = p->next` 发生在 list_del(p) 之后就是用已毒化的指针走路（UB）。内核的答案是 `list_for_each_entry_safe`——遍历前先存好 next。',
    ],
    descriptionEn: [
      'k-02’s list held only list_heads; this problem reattaches the data: `struct gpu_bo { u32 size; struct list_head node; }` hangs on an LRU list. Traversal hands you `list_head*`; container_of recovers the gpu_bo — exactly what the kernel’s `list_for_each_entry` macro does for you.',
      'Implement three functions (list primitives provided): (1) `lru_total_size(head)` — sum all BO sizes; (2) `lru_find(head, min_size)` — first BO with `size >= min_size`, NULL if none; (3) `lru_evict_smaller(head, threshold)` — **remove** every node with `size < threshold`, return the removal count.',
      'Part (3) is the soul: doing `p = p->next` after list_del(p) walks a poisoned pointer (UB). The kernel’s answer is `list_for_each_entry_safe` — save next before you step.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>
#include <stdint.h>

/* ---- 已提供: k-02 的成果 ---- */
struct list_head { struct list_head *next, *prev; };

static void list_init(struct list_head *h) { h->next = h; h->prev = h; }

static void list_del(struct list_head *e)
{
    e->prev->next = e->next;
    e->next->prev = e->prev;
    e->next = NULL;
    e->prev = NULL;
}

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct gpu_bo {
    uint32_t size;
    struct list_head node;
};
/* ---- 已提供部分结束 ---- */

uint64_t lru_total_size(struct list_head *head)
{
    (void)head;
    return 0; /* TODO: 遍历 + container_of */
}

struct gpu_bo *lru_find(struct list_head *head, uint32_t min_size)
{
    (void)head; (void)min_size;
    return NULL; /* TODO */
}

int lru_evict_smaller(struct list_head *head, uint32_t threshold)
{
    (void)head; (void)threshold;
    return 0; /* TODO: 边遍历边删 —— 先保存 next! */
}`,
    starterCodeEn: `#include <stddef.h>
#include <stdint.h>

/* ---- provided: the fruits of k-02 ---- */
struct list_head { struct list_head *next, *prev; };

static void list_init(struct list_head *h) { h->next = h; h->prev = h; }

static void list_del(struct list_head *e)
{
    e->prev->next = e->next;
    e->next->prev = e->prev;
    e->next = NULL;
    e->prev = NULL;
}

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct gpu_bo {
    uint32_t size;
    struct list_head node;
};
/* ---- end of provided section ---- */

uint64_t lru_total_size(struct list_head *head)
{
    (void)head;
    return 0; /* TODO: traverse + container_of */
}

struct gpu_bo *lru_find(struct list_head *head, uint32_t min_size)
{
    (void)head; (void)min_size;
    return NULL; /* TODO */
}

int lru_evict_smaller(struct list_head *head, uint32_t threshold)
{
    (void)head; (void)threshold;
    return 0; /* TODO: delete while iterating — save next first! */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static void list_add_tail(struct list_head *n, struct list_head *h)
{
    n->prev = h->prev;
    n->next = h;
    h->prev->next = n;
    h->prev = n;
}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static int list_len(struct list_head *h)
{
    int n = 0;
    for (struct list_head *p = h->next; p != h; p = p->next) n++;
    return n;
}

int main(void)
{
    struct list_head lru;
    struct gpu_bo bos[6] = {
        { .size = 100 }, { .size = 4096 }, { .size = 50 },
        { .size = 8192 }, { .size = 200 }, { .size = 10 },
    };
    list_init(&lru);
    for (int i = 0; i < 6; i++) list_add_tail(&bos[i].node, &lru);

    check("total size", lru_total_size(&lru) == 12648);
    check("find first >= 4096", lru_find(&lru, 4096) == &bos[1]);
    check("find first >= 5000", lru_find(&lru, 5000) == &bos[3]);
    check("find miss -> NULL", lru_find(&lru, 100000) == NULL);
    check("empty total is 0", 1); /* covered below after drain */

    int evicted = lru_evict_smaller(&lru, 200);
    check("evicted 3 small BOs", evicted == 3);
    check("survivors: 3 left", list_len(&lru) == 3);
    check("survivor order kept", lru.next == &bos[1].node && lru.prev == &bos[4].node);
    check("remaining total", lru_total_size(&lru) == 12488);

    check("evict nothing", lru_evict_smaller(&lru, 1) == 0 && list_len(&lru) == 3);

    int all = lru_evict_smaller(&lru, 0xFFFFFFFFu);
    check("evict all", all == 3 && list_len(&lru) == 0);
    check("empty list total", lru_total_size(&lru) == 0);
    check("find on empty", lru_find(&lru, 1) == NULL);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '只读遍历模板：`for (struct list_head *p = head->next; p != head; p = p->next) { struct gpu_bo *bo = container_of(p, struct gpu_bo, node); ... }`。',
      '删除版模板（_safe 的展开）：`struct list_head *p = head->next, *n; while (p != head) { n = p->next; /* 先存! */ ...可能 list_del(p)... p = n; }`。',
      '为什么普通遍历删除必炸：list_del 把 p->next 置了 NULL，下一步 `p = p->next` 就是 NULL 解引用。毒化的意义正是让这个 bug 立刻显形。',
    ],
    hintsEn: [
      'Read-only traversal template: `for (struct list_head *p = head->next; p != head; p = p->next) { struct gpu_bo *bo = container_of(p, struct gpu_bo, node); ... }`.',
      'The deleting template (what _safe expands to): `struct list_head *p = head->next, *n; while (p != head) { n = p->next; /* save first! */ ...maybe list_del(p)... p = n; }`.',
      'Why plain traversal + delete must blow up: list_del NULLs p->next, so the next `p = p->next` dereferences NULL. Poisoning exists precisely to make this bug surface instantly.',
    ],
    solution: `#include <stddef.h>
#include <stdint.h>

struct list_head { struct list_head *next, *prev; };

static void list_init(struct list_head *h) { h->next = h; h->prev = h; }

static void list_del(struct list_head *e)
{
    e->prev->next = e->next;
    e->next->prev = e->prev;
    e->next = NULL;
    e->prev = NULL;
}

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct gpu_bo {
    uint32_t size;
    struct list_head node;
};

uint64_t lru_total_size(struct list_head *head)
{
    uint64_t sum = 0;
    for (struct list_head *p = head->next; p != head; p = p->next)
        sum += container_of(p, struct gpu_bo, node)->size;
    return sum;
}

struct gpu_bo *lru_find(struct list_head *head, uint32_t min_size)
{
    for (struct list_head *p = head->next; p != head; p = p->next) {
        struct gpu_bo *bo = container_of(p, struct gpu_bo, node);
        if (bo->size >= min_size)
            return bo;
    }
    return NULL;
}

int lru_evict_smaller(struct list_head *head, uint32_t threshold)
{
    int count = 0;
    struct list_head *p = head->next;

    while (p != head) {
        struct list_head *next = p->next;   /* save next BEFORE unlinking */
        struct gpu_bo *bo = container_of(p, struct gpu_bo, node);
        if (bo->size < threshold) {
            list_del(p);
            count++;
        }
        p = next;
    }
    return count;
}`,
    solutionNote:
      '内核宏与你刚写的代码一一对应：list_for_each_entry = 只读模板 + container_of；list_for_each_entry_safe = 多存一个 next 的删除版。看到 _safe 后缀就该条件反射："循环体里会摘节点"。amdgpu 的 LRU 回收（amdgpu_vram_mgr）、fence 清理全是 _safe 遍历。这套"侵入式节点 + 宿主还原 + 安全遍历"三件套，是读任何内核子系统源码的通用钥匙。',
    solutionNoteEn:
      'The kernel macros map one-to-one onto what you wrote: list_for_each_entry = the read template + container_of; list_for_each_entry_safe = the deleting version with the extra saved next. The _safe suffix should trigger a reflex: "the loop body unlinks nodes". amdgpu’s LRU reclaim (amdgpu_vram_mgr) and fence cleanup are all _safe walks. This trio — intrusive node, host recovery, safe traversal — is the universal key to reading any kernel subsystem.',
  },
  {
    id: "k-04",
    track: "kernel",
    number: 4,
    title: "kref：引用计数与最后一人关灯",
    titleEn: "kref: Refcounting & Last One Out Turns Off the Lights",
    difficulty: "medium",
    minutes: 20,
    tags: ["引用计数", "kref", "生命周期"],
    tagsEn: ["refcounting", "kref", "lifetime"],
    lessonId: "cc-kernel-5",
    brief: "多个使用者共享一个对象，谁负责释放？实现 kref_get/put 和 release 回调。",
    briefEn: "Many users share one object — who frees it? Implement kref_get/put with a release callback.",
    description: [
      '一个 BO 同时被命令提交、显示器、用户态句柄引用——谁都不能擅自释放，谁也不能都不释放。内核的通解是 kref：对象带一个计数，取用 +1、放手 -1，**减到 0 的那个人**负责调 release。',
      '实现（本题用普通 int 模拟计数；真实内核用原子操作，见题解）：`kref_init(k)`——计数置 1（创建者持有首个引用）；`kref_get(k)`——+1；`kref_put(k, release)`——-1，到 0 时调用 `release(k)` 并返回 1，否则返回 0。再用它武装 `struct gpu_buffer { struct kref ref; u32 id; }`：实现 `buffer_release(struct kref *k)`——用 container_of 找回 gpu_buffer，free 它并把全局 `g_released_id` 记为它的 id。',
      'harness 模拟三个使用者先后 get/put，验证：中途 put 不释放、最后一次 put 恰好释放一次。',
    ],
    descriptionEn: [
      'One BO is referenced by a command submission, a display, and a userspace handle at once — nobody may free it unilaterally, and somebody must free it eventually. The kernel’s universal answer is kref: the object carries a count; take +1, release -1, and **whoever hits zero** calls release.',
      'Implement (plain int here; the real kernel uses atomics — see the solution note): `kref_init(k)` — count = 1 (the creator holds the first reference); `kref_get(k)` — +1; `kref_put(k, release)` — -1, and at zero call `release(k)` and return 1, else 0. Then arm `struct gpu_buffer { struct kref ref; u32 id; }` with it: implement `buffer_release(struct kref *k)` — container_of back to the gpu_buffer, free it, and record its id into the global `g_released_id`.',
      'The harness simulates three users getting/putting in sequence, verifying: intermediate puts never free; the final put frees exactly once.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stdlib.h>
#include <stddef.h>

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct kref {
    int refcount;
};

void kref_init(struct kref *k)
{
    (void)k; /* TODO: 创建者持首引用 */
}

void kref_get(struct kref *k)
{
    (void)k; /* TODO */
}

/* 减 1; 到 0 调 release(k) 并返回 1, 否则返回 0 */
int kref_put(struct kref *k, void (*release)(struct kref *k))
{
    (void)k; (void)release;
    return 0; /* TODO */
}

/* ---- 应用: 引用计数的 GPU buffer ---- */
extern uint32_t g_released_id;   /* harness 提供 */

struct gpu_buffer {
    struct kref ref;
    uint32_t id;
};

void buffer_release(struct kref *k)
{
    (void)k; /* TODO: container_of 找回 buffer, 记录 id, free */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stdlib.h>
#include <stddef.h>

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct kref {
    int refcount;
};

void kref_init(struct kref *k)
{
    (void)k; /* TODO: the creator holds the first reference */
}

void kref_get(struct kref *k)
{
    (void)k; /* TODO */
}

/* Decrement; at zero call release(k) and return 1, else return 0 */
int kref_put(struct kref *k, void (*release)(struct kref *k))
{
    (void)k; (void)release;
    return 0; /* TODO */
}

/* ---- application: a refcounted GPU buffer ---- */
extern uint32_t g_released_id;   /* provided by the judge */

struct gpu_buffer {
    struct kref ref;
    uint32_t id;
};

void buffer_release(struct kref *k)
{
    (void)k; /* TODO: container_of back to the buffer, record id, free */
}`,
    harness: `#include <stdio.h>
#include <stdint.h>

uint32_t g_released_id = 0;

{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static int g_release_calls = 0;
static struct kref g_probe;
static void probe_release(struct kref *k)
{
    (void)k;
    g_release_calls++;
}

int main(void)
{
    kref_init(&g_probe);
    check("init makes count 1 (put releases)", 1); /* verified below */

    kref_get(&g_probe);      /* 2 */
    kref_get(&g_probe);      /* 3 */
    check("put from 3 -> no release", kref_put(&g_probe, probe_release) == 0 && g_release_calls == 0);
    check("put from 2 -> no release", kref_put(&g_probe, probe_release) == 0 && g_release_calls == 0);
    check("final put releases exactly once", kref_put(&g_probe, probe_release) == 1 && g_release_calls == 1);

    /* three users share one buffer */
    struct gpu_buffer *bo = malloc(sizeof(*bo));
    bo->id = 0x42;
    kref_init(&bo->ref);       /* creator */
    kref_get(&bo->ref);        /* submit path */
    kref_get(&bo->ref);        /* display path */

    check("submitter done -> alive", kref_put(&bo->ref, buffer_release) == 0 && g_released_id == 0);
    check("display done -> alive", kref_put(&bo->ref, buffer_release) == 0 && g_released_id == 0);
    check("creator done -> released", kref_put(&bo->ref, buffer_release) == 1);
    check("release saw right buffer", g_released_id == 0x42);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'kref_put 的骨架：`k->refcount--; if (k->refcount == 0) { release(k); return 1; } return 0;`。',
      'buffer_release 是 k-01 的直接应用：`struct gpu_buffer *bo = container_of(k, struct gpu_buffer, ref); g_released_id = bo->id; free(bo);`。',
      '为什么 release 收 kref* 而不是 gpu_buffer*？这样 kref 机制完全不依赖使用者的类型——每种对象自带自己的 release，用 container_of 各回各家。和 c-14 的 ops 是同一种"机制无知"设计。',
    ],
    hintsEn: [
      'The kref_put skeleton: `k->refcount--; if (k->refcount == 0) { release(k); return 1; } return 0;`.',
      'buffer_release applies k-01 directly: `struct gpu_buffer *bo = container_of(k, struct gpu_buffer, ref); g_released_id = bo->id; free(bo);`.',
      'Why does release take kref* rather than gpu_buffer*? So the kref machinery stays ignorant of user types — each object brings its own release and container_ofs its way home. The same "mechanism-blind" design as c-14’s ops.',
    ],
    solution: `#include <stdint.h>
#include <stdlib.h>
#include <stddef.h>

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct kref {
    int refcount;
};

void kref_init(struct kref *k)
{
    k->refcount = 1;
}

void kref_get(struct kref *k)
{
    k->refcount++;
}

int kref_put(struct kref *k, void (*release)(struct kref *k))
{
    k->refcount--;
    if (k->refcount == 0) {
        release(k);
        return 1;
    }
    return 0;
}

extern uint32_t g_released_id;

struct gpu_buffer {
    struct kref ref;
    uint32_t id;
};

void buffer_release(struct kref *k)
{
    struct gpu_buffer *bo = container_of(k, struct gpu_buffer, ref);
    g_released_id = bo->id;
    free(bo);
}`,
    solutionNote:
      '真实 kref（include/linux/kref.h）的计数是 refcount_t：原子自减且带溢出/下溢检测，因为多个 CPU 可能同时 put——本题的 int 版本在单线程语义下等价，并发版在模块 1 的原子操作课展开。规则三条背下来：创建即 1；传出引用前 get；用完必 put 且 put 后不得再碰对象（你的引用已经没了）。amdgpu_bo、dma_fence、drm_gem_object 的生命周期全是 kref 驱动。对照 C++：shared_ptr 就是"kref + 自动 put"（析构时）。',
    solutionNoteEn:
      'The real kref (include/linux/kref.h) counts with refcount_t: atomic decrement plus overflow/underflow detection, because multiple CPUs may put concurrently — this int version is equivalent under single-threaded semantics; the concurrent story unfolds in Module 1’s atomics lessons. Memorize three rules: creation = 1; get before handing out a reference; always put when done and never touch the object after your put (your reference is gone). The lifetimes of amdgpu_bo, dma_fence and drm_gem_object are all kref-driven. C++ contrast: shared_ptr is "kref + automatic put" (at destruction).',
  },
  {
    id: "k-05",
    track: "kernel",
    number: 5,
    title: "GPU 环形缓冲：wptr / rptr 空间核算",
    titleEn: "GPU Ring Buffer: wptr / rptr Space Accounting",
    difficulty: "medium",
    minutes: 22,
    tags: ["环形缓冲", "无符号回绕", "amdgpu"],
    tagsEn: ["ring-buffer", "unsigned-wrap", "amdgpu"],
    lessonId: "cc-c-2",
    brief: "CPU 写 wptr、GPU 追 rptr——用单调递增计数器和掩码实现 ring 的空间管理。",
    briefEn: "CPU advances wptr, GPU chases rptr — manage ring space with monotonic counters and a mask.",
    description: [
      'amdgpu 给 GPU 喂命令的核心结构就是 ring：一块 2 的幂大小的环形内存，CPU 从 wptr 写入，GPU 从 rptr 消费。两个指针都是**只增不减**的 u32 计数器，访问时用 `& (size-1)` 落到实际下标——u32 自身的回绕（0xFFFFFFFF+1=0）在无符号减法下毫发无伤。',
      '给定 `struct ring { uint32_t *buf; uint32_t size; uint32_t wptr; uint32_t rptr; }`（size 保证 2 的幂）。实现：`ring_used(r)`——已占用字数；`ring_free(r)`——空闲字数；`ring_write(r, data, n)`——空间不足返回 -ENOSPC（-28），否则把 n 个字写进 buf（逐字 `& mask` 定位）并推进 wptr，返回 0；`ring_read(r, out, n)`——数据不足返回 -ENODATA（-61），否则读出并推进 rptr。',
      'harness 特意把初始 wptr/rptr 设到 0xFFFFFFF8 附近——如果你的 used/free 用了有符号运算或取模而不是掩码，会当场现形。',
    ],
    descriptionEn: [
      'The core structure amdgpu feeds the GPU through is the ring: a power-of-two block of memory the CPU writes at wptr and the GPU consumes at rptr. Both are **monotonically increasing** u32 counters, masked with `& (size-1)` on access — and u32’s own wraparound (0xFFFFFFFF+1=0) is harmless under unsigned subtraction.',
      'Given `struct ring { uint32_t *buf; uint32_t size; uint32_t wptr; uint32_t rptr; }` (size guaranteed a power of two). Implement: `ring_used(r)` — words occupied; `ring_free(r)` — words free; `ring_write(r, data, n)` — return -ENOSPC (-28) if space is short, else write n words (each located via `& mask`), advance wptr, return 0; `ring_read(r, out, n)` — return -ENODATA (-61) if data is short, else read out and advance rptr.',
      'The harness deliberately starts wptr/rptr near 0xFFFFFFF8 — signed arithmetic or %-modulo instead of masking gets exposed on the spot.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC  28
#define ENODATA 61

struct ring {
    uint32_t *buf;
    uint32_t size;    /* 2 的幂 */
    uint32_t wptr;    /* 只增 */
    uint32_t rptr;    /* 只增 */
};

uint32_t ring_used(const struct ring *r)
{
    (void)r;
    return 0; /* TODO */
}

uint32_t ring_free(const struct ring *r)
{
    (void)r;
    return 0; /* TODO */
}

int ring_write(struct ring *r, const uint32_t *data, uint32_t n)
{
    (void)r; (void)data; (void)n;
    return -ENOSPC; /* TODO */
}

int ring_read(struct ring *r, uint32_t *out, uint32_t n)
{
    (void)r; (void)out; (void)n;
    return -ENODATA; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC  28
#define ENODATA 61

struct ring {
    uint32_t *buf;
    uint32_t size;    /* power of two */
    uint32_t wptr;    /* only increases */
    uint32_t rptr;    /* only increases */
};

uint32_t ring_used(const struct ring *r)
{
    (void)r;
    return 0; /* TODO */
}

uint32_t ring_free(const struct ring *r)
{
    (void)r;
    return 0; /* TODO */
}

int ring_write(struct ring *r, const uint32_t *data, uint32_t n)
{
    (void)r; (void)data; (void)n;
    return -ENOSPC; /* TODO */
}

int ring_read(struct ring *r, uint32_t *out, uint32_t n)
{
    (void)r; (void)out; (void)n;
    return -ENODATA; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    uint32_t storage[8];
    struct ring r = { .buf = storage, .size = 8, .wptr = 0, .rptr = 0 };

    check("empty: used 0 free 8", ring_used(&r) == 0 && ring_free(&r) == 8);

    uint32_t pkt1[] = { 0xC0DE0001, 0xC0DE0002, 0xC0DE0003 };
    check("write 3 ok", ring_write(&r, pkt1, 3) == 0);
    check("used 3 free 5", ring_used(&r) == 3 && ring_free(&r) == 5);

    uint32_t big[6] = { 0 };
    check("write 6 into 5 -> ENOSPC", ring_write(&r, big, 6) == -ENOSPC);
    check("failed write leaves state", ring_used(&r) == 3);

    uint32_t out[8];
    check("read 2 ok", ring_read(&r, out, 2) == 0);
    check("FIFO content", out[0] == 0xC0DE0001 && out[1] == 0xC0DE0002);
    check("read 2 -> ENODATA (only 1 left)", ring_read(&r, out, 2) == -ENODATA);

    /* wrap across the physical boundary */
    uint32_t pkt2[] = { 11, 12, 13, 14, 15, 16 };
    check("write 6 wraps ok", ring_write(&r, pkt2, 6) == 0);
    check("full now", ring_free(&r) == 1 && ring_used(&r) == 7);
    check("drain 7", ring_read(&r, out, 7) == 0);
    check("wrap order kept", out[0] == 0xC0DE0003 && out[1] == 11 && out[6] == 16);

    /* the u32 counters themselves wrap: wptr starts near 0xFFFFFFFC */
    struct ring w = { .buf = storage, .size = 8, .wptr = 0xFFFFFFFCu, .rptr = 0xFFFFFFFCu };
    uint32_t seq[] = { 1, 2, 3, 4, 5, 6 };
    check("write across u32 wrap", ring_write(&w, seq, 6) == 0);
    check("used correct across wrap", ring_used(&w) == 6);
    check("read across u32 wrap", ring_read(&w, out, 6) == 0 && out[0] == 1 && out[5] == 6);
    check("counters wrapped cleanly", ring_used(&w) == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'used 就是一句无符号减法：`r->wptr - r->rptr`——哪怕 wptr 已经回绕到比 rptr "小"，模 2³² 的差值依然正确。free = size - used。',
      '写入循环：`r->buf[(r->wptr + i) & (r->size - 1)] = data[i];` 最后 `r->wptr += n;`（读取对称）。',
      '先判空间再动手：失败路径必须不改变任何状态（对照 c-15 的纪律）。',
    ],
    hintsEn: [
      'used is one unsigned subtraction: `r->wptr - r->rptr` — even after wptr wraps "below" rptr, the mod-2³² difference stays correct. free = size - used.',
      'The write loop: `r->buf[(r->wptr + i) & (r->size - 1)] = data[i];` then `r->wptr += n;` (reads mirror it).',
      'Check space before touching anything: the failure path must not mutate state (c-15’s discipline again).',
    ],
    solution: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC  28
#define ENODATA 61

struct ring {
    uint32_t *buf;
    uint32_t size;
    uint32_t wptr;
    uint32_t rptr;
};

uint32_t ring_used(const struct ring *r)
{
    return r->wptr - r->rptr;
}

uint32_t ring_free(const struct ring *r)
{
    return r->size - ring_used(r);
}

int ring_write(struct ring *r, const uint32_t *data, uint32_t n)
{
    if (ring_free(r) < n)
        return -ENOSPC;
    for (uint32_t i = 0; i < n; i++)
        r->buf[(r->wptr + i) & (r->size - 1)] = data[i];
    r->wptr += n;
    return 0;
}

int ring_read(struct ring *r, uint32_t *out, uint32_t n)
{
    if (ring_used(r) < n)
        return -ENODATA;
    for (uint32_t i = 0; i < n; i++)
        out[i] = r->buf[(r->rptr + i) & (r->size - 1)];
    r->rptr += n;
    return 0;
}`,
    solutionNote:
      '两层回绕要分开想：物理下标回绕靠 `& (size-1)`（要求 2 的幂，c-06 铺垫过）；计数器自身回绕靠模 2³² 无符号减法（C 标准保证无符号溢出是良定义的回绕——这是少数"溢出合法"的地方）。真实 amdgpu_ring 还有 CPU/GPU 缓存一致性、wptr doorbell 写入等硬件细节，但空间核算的数学与此完全一致。cpp-10 是它的 C++ 模板版，对照着复习。',
    solutionNoteEn:
      'Keep the two wraparounds separate: physical indices wrap via `& (size-1)` (power-of-two required — c-06 set this up); the counters themselves wrap via mod-2³² unsigned subtraction (the C standard defines unsigned overflow as wraparound — one of the few places overflow is legal). The real amdgpu_ring adds CPU/GPU cache coherency and wptr doorbell writes, but the accounting math is identical. cpp-10 is its C++ template twin — review them together.',
  },
  {
    id: "k-06",
    track: "kernel",
    number: 6,
    title: "ERR_PTR：把错误码藏进指针",
    titleEn: "ERR_PTR: Hiding errno Inside a Pointer",
    difficulty: "medium",
    minutes: 18,
    tags: ["ERR_PTR", "错误处理", "指针技巧"],
    tagsEn: ["ERR_PTR", "error-handling", "pointer-tricks"],
    lessonId: "cc-kernel-4",
    brief: "返回指针的函数怎么带出错误码？内核的答案：借用地址空间顶端的 4095 个\"非法地址\"。",
    briefEn: "How does a pointer-returning function carry an errno? The kernel’s answer: borrow the 4095 “impossible addresses” at the top of the address space.",
    description: [
      '返回 int 的函数用负 errno 报错（c-07），那返回指针的函数呢？返回 NULL 只能表达"失败"却说不出**为什么**。内核的技巧：地址空间最顶端的一页（最后 4095 个值）永远不会是合法内核地址，把 -errno 强转成指针塞在那里——一个返回值同时承载"指针或错误码"。',
      '实现三件套：`ERR_PTR(err)`——负 errno 转指针；`PTR_ERR(p)`——转回 long；`IS_ERR(p)`——判断指针是否落在错误区（提示：转成 unsigned long 后 `>= -4095UL` 一步搞定，写成 `(unsigned long)-4095` 的字面量）。再实现应用 `ring_lookup(id)`：id 在 0..3 返回全局表里对应 ring 的指针；4..15 返回 ERR_PTR(-ENODEV)（-19）；其他返回 ERR_PTR(-EINVAL)（-22）。',
      '指针与整数互转要用 `uintptr_t`/`intptr_t` 过桥（本题用户态可移植写法），这也是复习 c-12"位世界与值世界"的机会。',
    ],
    descriptionEn: [
      'Functions returning int report failure with negative errno (c-07); what about functions returning pointers? NULL only says "failed", never **why**. The kernel’s trick: the top page of the address space (the last 4095 values) can never be a valid kernel address, so cast -errno into a pointer parked there — one return value carrying "pointer or error".',
      'Implement the trio: `ERR_PTR(err)` — negative errno to pointer; `PTR_ERR(p)` — back to long; `IS_ERR(p)` — is the pointer in the error zone (hint: cast to unsigned long and compare `>= (unsigned long)-4095` in one step). Then the application `ring_lookup(id)`: ids 0..3 return pointers into a global ring table; 4..15 return ERR_PTR(-ENODEV) (-19); anything else ERR_PTR(-EINVAL) (-22).',
      'Pointer↔integer conversions should bridge through `uintptr_t`/`intptr_t` (the portable userspace spelling) — a chance to revisit c-12’s "bit world vs value world".',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stddef.h>

#define ENODEV 19
#define EINVAL 22

void *ERR_PTR(long err)
{
    (void)err;
    return NULL; /* TODO */
}

long PTR_ERR(const void *p)
{
    (void)p;
    return 0; /* TODO */
}

int IS_ERR(const void *p)
{
    (void)p;
    return 0; /* TODO: 最后 4095 个地址值 = 错误区 */
}

/* ---- 应用 ---- */
struct gpu_ring { int id; };
extern struct gpu_ring g_rings[4];   /* harness 提供 */

struct gpu_ring *ring_lookup(int id)
{
    (void)id;
    return NULL; /* TODO: 0..3 查表; 4..15 -ENODEV; 其他 -EINVAL */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stddef.h>

#define ENODEV 19
#define EINVAL 22

void *ERR_PTR(long err)
{
    (void)err;
    return NULL; /* TODO */
}

long PTR_ERR(const void *p)
{
    (void)p;
    return 0; /* TODO */
}

int IS_ERR(const void *p)
{
    (void)p;
    return 0; /* TODO: last 4095 address values = error zone */
}

/* ---- application ---- */
struct gpu_ring { int id; };
extern struct gpu_ring g_rings[4];   /* provided by the judge */

struct gpu_ring *ring_lookup(int id)
{
    (void)id;
    return NULL; /* TODO: 0..3 table lookup; 4..15 -ENODEV; else -EINVAL */
}`,
    harness: `#include <stdio.h>

struct gpu_ring;

{{USER_CODE}}

struct gpu_ring g_rings[4] = { { 0 }, { 1 }, { 2 }, { 3 } };

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    check("ERR_PTR/PTR_ERR round-trip", PTR_ERR(ERR_PTR(-ENODEV)) == -ENODEV);
    check("IS_ERR on error ptr", IS_ERR(ERR_PTR(-EINVAL)) != 0);
    check("IS_ERR on edge -4095", IS_ERR(ERR_PTR(-4095)) != 0);
    check("IS_ERR on real object", IS_ERR(&g_rings[0]) == 0);
    check("IS_ERR on NULL is false", IS_ERR(NULL) == 0);

    struct gpu_ring *r = ring_lookup(2);
    check("valid id returns table entry", r == &g_rings[2] && !IS_ERR(r));
    check("entry usable", r->id == 2);

    struct gpu_ring *e1 = ring_lookup(9);
    check("4..15 -> ENODEV", IS_ERR(e1) && PTR_ERR(e1) == -ENODEV);

    struct gpu_ring *e2 = ring_lookup(-1);
    check("negative id -> EINVAL", IS_ERR(e2) && PTR_ERR(e2) == -EINVAL);
    struct gpu_ring *e3 = ring_lookup(16);
    check("id 16 -> EINVAL", IS_ERR(e3) && PTR_ERR(e3) == -EINVAL);

    check("boundary id 0 and 3 valid", ring_lookup(0) == &g_rings[0] && ring_lookup(3) == &g_rings[3]);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'ERR_PTR：`return (void *)(intptr_t)err;`——负数转 intptr_t 再转指针，得到接近 UINTPTR_MAX 的地址值。PTR_ERR 反向：`return (long)(intptr_t)p;`。',
      'IS_ERR：`return (uintptr_t)p >= (uintptr_t)-4095;`——(uintptr_t)-4095 是"倒数第 4095 个值"，错误区 [-4095, -1] 映射到地址空间最顶端。NULL(0) 显然不在区内。',
      '调用方的标准姿势（读内核代码天天见）：`ring = ring_lookup(id); if (IS_ERR(ring)) return PTR_ERR(ring);`。',
    ],
    hintsEn: [
      'ERR_PTR: `return (void *)(intptr_t)err;` — the negative number goes through intptr_t into a pointer near UINTPTR_MAX. PTR_ERR reverses: `return (long)(intptr_t)p;`.',
      'IS_ERR: `return (uintptr_t)p >= (uintptr_t)-4095;` — (uintptr_t)-4095 is the 4095th-from-last value; the error zone [-4095, -1] maps to the very top of the address space. NULL (0) is clearly outside.',
      'The caller idiom you will meet daily in kernel code: `ring = ring_lookup(id); if (IS_ERR(ring)) return PTR_ERR(ring);`.',
    ],
    solution: `#include <stdint.h>
#include <stddef.h>

#define ENODEV 19
#define EINVAL 22

void *ERR_PTR(long err)
{
    return (void *)(intptr_t)err;
}

long PTR_ERR(const void *p)
{
    return (long)(intptr_t)p;
}

int IS_ERR(const void *p)
{
    return (uintptr_t)p >= (uintptr_t)-4095;
}

struct gpu_ring { int id; };
extern struct gpu_ring g_rings[4];

struct gpu_ring *ring_lookup(int id)
{
    if (id >= 0 && id <= 3)
        return &g_rings[id];
    if (id >= 4 && id <= 15)
        return ERR_PTR(-ENODEV);
    return ERR_PTR(-EINVAL);
}`,
    solutionNote:
      '设计的精妙在"借地"：错误码只有 [-4095, -1]（MAX_ERRNO=4095），映射成地址正好占据最顶端一页——内核保证那页永不映射，所以指针值域和错误值域**不相交**，一个 void* 无歧义地承载两种含义。读 amdgpu 时你会看到三种失败表达并存：返回 int 负 errno、返回 NULL（只关心成败）、返回 ERR_PTR（要指针也要原因）——现在你能解释何时用哪种了。',
    solutionNoteEn:
      'The elegance is the "borrowed land": errnos span only [-4095, -1] (MAX_ERRNO=4095), mapping exactly onto the top page of the address space — which the kernel guarantees is never mapped, so the pointer domain and error domain are **disjoint** and one void* carries both meanings unambiguously. Reading amdgpu you will see all three failure styles: int with negative errno, NULL (success/failure only), and ERR_PTR (pointer wanted, reason too) — now you can articulate when each applies.',
  },
  {
    id: "k-07",
    track: "kernel",
    number: 7,
    title: "goto 错误处理阶梯",
    titleEn: "The goto Error Ladder",
    difficulty: "hard",
    minutes: 25,
    tags: ["goto", "错误回滚", "资源管理"],
    tagsEn: ["goto", "error-rollback", "resource-management"],
    lessonId: "cc-kernel-4",
    brief: "内核唯一体面的 goto 用法：初始化五步，第三步失败要精确拆掉前两步。",
    briefEn: "The kernel’s one dignified goto: five init steps, and a failure at step three must tear down exactly the first two.",
    description: [
      '"goto 有害"在内核有一个著名例外：错误处理阶梯。函数按顺序申请多个资源，失败时 goto 到对应的标签，从那里**只**释放已经成功的部分——标签按逆序排列，控制流像下楼梯一样穿过它们。这是 amdgpu 初始化代码里最高频的形态。',
      '给定三个模拟资源 API（已提供，带失败注入与计数器）：`fw_load/fw_unload`（固件）、`ring_setup/ring_teardown`（环）、`irq_attach/irq_detach`（中断）。实现 `gpu_init(struct gpu *g)`：按 固件→环→中断 的顺序初始化，全部成功返回 0；任何一步失败，**逆序**释放之前成功的步骤，并把那一步的错误码原样返回。再实现 `gpu_fini(g)`：逆序全部释放（仅在 gpu_init 成功后调用）。',
      'harness 会分别注入三个位置的失败，检查：返回码正确、每个资源的 setup/teardown 恰好配平、失败步骤自身不被"释放"。',
    ],
    descriptionEn: [
      '"goto considered harmful" has one famous kernel exception: the error ladder. A function acquires resources in order; on failure it gotos to the matching label and from there releases **only** what already succeeded — labels stacked in reverse, control flow descending them like stairs. This is the single most frequent shape in amdgpu init code.',
      'Given three simulated resource APIs (provided, with failure injection and counters): `fw_load/fw_unload` (firmware), `ring_setup/ring_teardown` (ring), `irq_attach/irq_detach` (interrupt). Implement `gpu_init(struct gpu *g)`: initialize firmware→ring→irq, return 0 when all succeed; on any failure, release the earlier successes **in reverse** and return that step’s error code verbatim. Also `gpu_fini(g)`: release everything in reverse (called only after a successful gpu_init).',
      'The harness injects failure at each of the three positions and checks: correct return codes, setup/teardown exactly balanced per resource, and the failing step itself never "released".',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

#define EIO    5
#define ENOMEM 12
#define EBUSY  16

/* ---- 已提供: 模拟资源 API (勿改) ---- */
struct gpu {
    int fw_loads, fw_unloads;
    int ring_setups, ring_teardowns;
    int irq_attaches, irq_detaches;
    int fail_fw, fail_ring, fail_irq;   /* 失败注入开关 */
};

static int fw_load(struct gpu *g)
{
    if (g->fail_fw) return -EIO;
    g->fw_loads++;
    return 0;
}
static void fw_unload(struct gpu *g) { g->fw_unloads++; }

static int ring_setup(struct gpu *g)
{
    if (g->fail_ring) return -ENOMEM;
    g->ring_setups++;
    return 0;
}
static void ring_teardown(struct gpu *g) { g->ring_teardowns++; }

static int irq_attach(struct gpu *g)
{
    if (g->fail_irq) return -EBUSY;
    g->irq_attaches++;
    return 0;
}
static void irq_detach(struct gpu *g) { g->irq_detaches++; }
/* ---- 已提供部分结束 ---- */

int gpu_init(struct gpu *g)
{
    (void)g;
    return 0; /* TODO: 固件->环->中断, 失败走 goto 阶梯逆序回滚 */
}

void gpu_fini(struct gpu *g)
{
    (void)g; /* TODO: 逆序释放 */
}`,
    starterCodeEn: `#include <stddef.h>

#define EIO    5
#define ENOMEM 12
#define EBUSY  16

/* ---- provided: simulated resource APIs (do not edit) ---- */
struct gpu {
    int fw_loads, fw_unloads;
    int ring_setups, ring_teardowns;
    int irq_attaches, irq_detaches;
    int fail_fw, fail_ring, fail_irq;   /* failure-injection switches */
};

static int fw_load(struct gpu *g)
{
    if (g->fail_fw) return -EIO;
    g->fw_loads++;
    return 0;
}
static void fw_unload(struct gpu *g) { g->fw_unloads++; }

static int ring_setup(struct gpu *g)
{
    if (g->fail_ring) return -ENOMEM;
    g->ring_setups++;
    return 0;
}
static void ring_teardown(struct gpu *g) { g->ring_teardowns++; }

static int irq_attach(struct gpu *g)
{
    if (g->fail_irq) return -EBUSY;
    g->irq_attaches++;
    return 0;
}
static void irq_detach(struct gpu *g) { g->irq_detaches++; }
/* ---- end of provided section ---- */

int gpu_init(struct gpu *g)
{
    (void)g;
    return 0; /* TODO: firmware->ring->irq; goto ladder unwinds in reverse on failure */
}

void gpu_fini(struct gpu *g)
{
    (void)g; /* TODO: release in reverse order */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    /* full success + fini */
    struct gpu g;
    memset(&g, 0, sizeof(g));
    check("happy init", gpu_init(&g) == 0);
    check("all three up", g.fw_loads == 1 && g.ring_setups == 1 && g.irq_attaches == 1);
    check("nothing torn down yet", g.fw_unloads == 0 && g.ring_teardowns == 0 && g.irq_detaches == 0);
    gpu_fini(&g);
    check("fini balances all", g.fw_unloads == 1 && g.ring_teardowns == 1 && g.irq_detaches == 1);

    /* step 1 fails: nothing to tear down */
    memset(&g, 0, sizeof(g));
    g.fail_fw = 1;
    check("fw failure code", gpu_init(&g) == -EIO);
    check("nothing acquired, nothing released",
          g.fw_loads == 0 && g.fw_unloads == 0 && g.ring_setups == 0 && g.irq_attaches == 0);

    /* step 2 fails: unload only the firmware */
    memset(&g, 0, sizeof(g));
    g.fail_ring = 1;
    check("ring failure code", gpu_init(&g) == -ENOMEM);
    check("fw rolled back", g.fw_loads == 1 && g.fw_unloads == 1);
    check("ring itself not torn down", g.ring_setups == 0 && g.ring_teardowns == 0);
    check("irq never attempted", g.irq_attaches == 0 && g.irq_detaches == 0);

    /* step 3 fails: tear down ring then firmware, in reverse */
    memset(&g, 0, sizeof(g));
    g.fail_irq = 1;
    check("irq failure code", gpu_init(&g) == -EBUSY);
    check("ring rolled back", g.ring_setups == 1 && g.ring_teardowns == 1);
    check("fw rolled back too", g.fw_loads == 1 && g.fw_unloads == 1);
    check("irq not detached", g.irq_detaches == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '标准形态：每步 `ret = xxx(g); if (ret) goto err_yyy;`。标签区按**逆序**排：`err_ring: ring_teardown(g); err_fw: fw_unload(g); err_out: return ret;`——注意标签之间不写 break，控制流自然下坠穿过所有后续标签，这正是"阶梯"的含义。',
      '标签名习惯用"失败时要跳到的清理点"命名：第 2 步失败 → goto err_fw（去拆固件）；第 3 步失败 → goto err_ring（先拆环，坠落到拆固件）。',
      'gpu_fini 就是阶梯的完整版：`irq_detach(g); ring_teardown(g); fw_unload(g);`——和 err 区的顺序一致。',
    ],
    hintsEn: [
      'The canonical shape: each step `ret = xxx(g); if (ret) goto err_yyy;`. The label zone runs in **reverse**: `err_ring: ring_teardown(g); err_fw: fw_unload(g); err_out: return ret;` — no breaks between labels: control falls through every later label, which is exactly what "ladder" means.',
      'Name labels after the cleanup point you jump to: step-2 failure → goto err_fw (go unload firmware); step-3 failure → goto err_ring (tear the ring, then fall into unloading firmware).',
      'gpu_fini is the full ladder: `irq_detach(g); ring_teardown(g); fw_unload(g);` — the same order as the err zone.',
    ],
    solution: `#include <stddef.h>

#define EIO    5
#define ENOMEM 12
#define EBUSY  16

struct gpu {
    int fw_loads, fw_unloads;
    int ring_setups, ring_teardowns;
    int irq_attaches, irq_detaches;
    int fail_fw, fail_ring, fail_irq;
};

static int fw_load(struct gpu *g)
{
    if (g->fail_fw) return -EIO;
    g->fw_loads++;
    return 0;
}
static void fw_unload(struct gpu *g) { g->fw_unloads++; }

static int ring_setup(struct gpu *g)
{
    if (g->fail_ring) return -ENOMEM;
    g->ring_setups++;
    return 0;
}
static void ring_teardown(struct gpu *g) { g->ring_teardowns++; }

static int irq_attach(struct gpu *g)
{
    if (g->fail_irq) return -EBUSY;
    g->irq_attaches++;
    return 0;
}
static void irq_detach(struct gpu *g) { g->irq_detaches++; }

int gpu_init(struct gpu *g)
{
    int ret;

    ret = fw_load(g);
    if (ret)
        goto err_out;

    ret = ring_setup(g);
    if (ret)
        goto err_fw;

    ret = irq_attach(g);
    if (ret)
        goto err_ring;

    return 0;

err_ring:
    ring_teardown(g);
err_fw:
    fw_unload(g);
err_out:
    return ret;
}

void gpu_fini(struct gpu *g)
{
    irq_detach(g);
    ring_teardown(g);
    fw_unload(g);
}`,
    solutionNote:
      '阶梯的三条纪律：标签逆序排列且利用坠落（fall-through）串联；跳转目标 = "我之前最后一个成功的资源的清理点"；失败的那步自己不清理（它没成功，没资源可清）。这是内核代码评审最严格盯防的结构——顺序错、漏一级、多一级都是事故。对照 cpp-03：RAII 把这架楼梯完全自动化；对照 c-16："随时可销毁 + 复用 destroy"是另一种消灭阶梯的方法。三种写法都要会读。',
    solutionNoteEn:
      'Three ladder disciplines: labels in reverse order chained by fall-through; the jump target = "the cleanup point of the last resource that succeeded before me"; the failing step never cleans itself (it didn’t succeed — there is nothing to clean). Kernel review guards this structure zealously — wrong order, one rung missing or one extra are all incidents. Contrast cpp-03: RAII automates the whole staircase; contrast c-16: "always destroyable + reuse destroy" is another way to abolish it. Learn to read all three.',
  },
  {
    id: "k-08",
    track: "kernel",
    number: 8,
    title: "位图：128 个 doorbell 的占用表",
    titleEn: "Bitmaps: An Occupancy Table for 128 Doorbells",
    difficulty: "medium",
    minutes: 20,
    tags: ["位图", "bitmap", "资源分配"],
    tagsEn: ["bitmap", "bit-ops", "resource-allocation"],
    lessonId: "cc-kernel-1",
    brief: "128 个布尔用 16 字节：跨机器字的 set/clear/test 和 find_first_zero。",
    briefEn: "128 booleans in 16 bytes: cross-word set/clear/test and find_first_zero.",
    description: [
      '跟踪"128 个 doorbell 槽位哪些被占用"，用 128 个 bool 浪费 128 字节，位图只要 16 字节且能用位运算批量操作。内核的 bitmap（bitmap.h）就是 `unsigned long` 数组 + 一套跨字位操作——amdgpu 用它管理 doorbell、queue、VMID 等所有"编号资源池"。',
      '实现四个函数（`nbits` 保证不超过数组容量）：`bm_set(map, n)`、`bm_clear(map, n)`、`bm_test(map, n)`——第 n 位置 1/置 0/读取；`bm_find_first_zero(map, nbits)`——返回第一个为 0 的位号，全满返回 nbits。核心换算：第 n 位落在 `map[n / BITS_PER_LONG]` 的 `n % BITS_PER_LONG` 位上。',
      'harness 用 2 个 unsigned long（128 位）测试，重点打击第 63/64 位的跨字边界。',
    ],
    descriptionEn: [
      'Tracking "which of 128 doorbell slots are taken" with 128 bools wastes 128 bytes; a bitmap needs 16 and supports bulk bit-ops. The kernel bitmap (bitmap.h) is an `unsigned long` array plus cross-word bit operations — amdgpu manages doorbells, queues, VMIDs, every "numbered resource pool" with it.',
      'Implement four functions (`nbits` guaranteed within array capacity): `bm_set(map, n)`, `bm_clear(map, n)`, `bm_test(map, n)` — set/clear/read bit n; `bm_find_first_zero(map, nbits)` — index of the first 0 bit, or nbits when full. The core conversion: bit n lives at bit `n % BITS_PER_LONG` of `map[n / BITS_PER_LONG]`.',
      'The harness uses 2 unsigned longs (128 bits) and hammers the 63/64 cross-word boundary.',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

#define BITS_PER_LONG (8 * sizeof(unsigned long))

void bm_set(unsigned long *map, unsigned int n)
{
    (void)map; (void)n; /* TODO */
}

void bm_clear(unsigned long *map, unsigned int n)
{
    (void)map; (void)n; /* TODO */
}

int bm_test(const unsigned long *map, unsigned int n)
{
    (void)map; (void)n;
    return 0; /* TODO */
}

/* 第一个 0 位的位号; 全满返回 nbits */
unsigned int bm_find_first_zero(const unsigned long *map, unsigned int nbits)
{
    (void)map; (void)nbits;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stddef.h>

#define BITS_PER_LONG (8 * sizeof(unsigned long))

void bm_set(unsigned long *map, unsigned int n)
{
    (void)map; (void)n; /* TODO */
}

void bm_clear(unsigned long *map, unsigned int n)
{
    (void)map; (void)n; /* TODO */
}

int bm_test(const unsigned long *map, unsigned int n)
{
    (void)map; (void)n;
    return 0; /* TODO */
}

/* Index of the first 0 bit; nbits when the map is full */
unsigned int bm_find_first_zero(const unsigned long *map, unsigned int nbits)
{
    (void)map; (void)nbits;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    unsigned long map[2];
    memset(map, 0, sizeof(map));

    check("fresh map: first zero is 0", bm_find_first_zero(map, 128) == 0);

    bm_set(map, 0);
    bm_set(map, 5);
    check("test set bits", bm_test(map, 0) && bm_test(map, 5));
    check("test clear bit", !bm_test(map, 1));
    check("first zero now 1", bm_find_first_zero(map, 128) == 1);

    bm_clear(map, 0);
    check("clear works", !bm_test(map, 0));
    check("first zero back to 0", bm_find_first_zero(map, 128) == 0);

    /* word boundary: bits 63 and 64 live in different unsigned longs */
    bm_set(map, 63);
    bm_set(map, 64);
    check("bit 63 in word 0", bm_test(map, 63) && (map[0] >> 63) == 1);
    check("bit 64 in word 1", bm_test(map, 64) && (map[1] & 1ul) == 1);
    bm_clear(map, 63);
    check("clear 63 leaves 64", !bm_test(map, 63) && bm_test(map, 64));

    /* fill the first 64 bits; first_zero must cross into word 2 */
    memset(map, 0, sizeof(map));
    for (unsigned int i = 0; i < 64; i++) bm_set(map, i);
    check("first zero crosses word", bm_find_first_zero(map, 128) == 64);

    for (unsigned int i = 64; i < 128; i++) bm_set(map, i);
    check("full map returns nbits", bm_find_first_zero(map, 128) == 128);

    /* allocator usage: find + set */
    memset(map, 0, sizeof(map));
    bm_set(map, 0); bm_set(map, 1); bm_set(map, 2);
    unsigned int slot = bm_find_first_zero(map, 128);
    bm_set(map, slot);
    check("alloc pattern grabs slot 3", slot == 3 && bm_test(map, 3));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '定位公式：字下标 `n / BITS_PER_LONG`，字内位 `n % BITS_PER_LONG`。set：`map[i] |= 1UL << bit;`——注意 1UL 而不是 1（int 的 1 左移 63 位是 UB，c-02 的教训）。',
      'test：`(map[n / BITS_PER_LONG] >> (n % BITS_PER_LONG)) & 1UL`。',
      'find_first_zero 直白写法：`for (n = 0; n < nbits; n++) if (!bm_test(map, n)) return n;`——先求对，再谈快（真实内核按字跳：整字 == ~0UL 直接 continue）。',
    ],
    hintsEn: [
      'The locating formula: word `n / BITS_PER_LONG`, bit-in-word `n % BITS_PER_LONG`. set: `map[i] |= 1UL << bit;` — 1UL, not 1 (shifting int 1 by 63 is UB — c-02’s lesson).',
      'test: `(map[n / BITS_PER_LONG] >> (n % BITS_PER_LONG)) & 1UL`.',
      'The straightforward find_first_zero: `for (n = 0; n < nbits; n++) if (!bm_test(map, n)) return n;` — correct first, fast later (the real kernel skips by words: a word == ~0UL just continues).',
    ],
    solution: `#include <stddef.h>

#define BITS_PER_LONG (8 * sizeof(unsigned long))

void bm_set(unsigned long *map, unsigned int n)
{
    map[n / BITS_PER_LONG] |= 1UL << (n % BITS_PER_LONG);
}

void bm_clear(unsigned long *map, unsigned int n)
{
    map[n / BITS_PER_LONG] &= ~(1UL << (n % BITS_PER_LONG));
}

int bm_test(const unsigned long *map, unsigned int n)
{
    return (int)((map[n / BITS_PER_LONG] >> (n % BITS_PER_LONG)) & 1UL);
}

unsigned int bm_find_first_zero(const unsigned long *map, unsigned int nbits)
{
    for (unsigned int n = 0; n < nbits; n++) {
        if (!bm_test(map, n))
            return n;
    }
    return nbits;
}`,
    solutionNote:
      '这就是内核 set_bit/clear_bit/test_bit/find_first_zero_bit 的单线程语义版（内核版是原子的，因为多 CPU 会并发改同一个字）。两个必会点：1UL 后缀防移位 UB；除法/取模定位跨字。"find + set"两步在并发下有竞态窗口——内核用 test_and_set_bit（原子读改写）合并成一步，这是模块 1 原子操作课的引子。amdgpu_doorbell_get_kfd_info 附近就有真实的 doorbell 位图管理。',
    solutionNoteEn:
      'This is the single-threaded semantics of the kernel’s set_bit/clear_bit/test_bit/find_first_zero_bit (the kernel’s are atomic, since CPUs race on the same word). Two must-knows: the 1UL suffix against shift UB; divide/modulo locating across words. The two-step "find + set" has a race window under concurrency — the kernel merges it into atomic test_and_set_bit, a teaser for Module 1’s atomics lessons. Real doorbell bitmap management lives near amdgpu_doorbell_get_kfd_info.',
  },
  {
    id: "k-09",
    track: "kernel",
    number: 9,
    title: "ioctl 命令编码：_IOC 的四段位打包",
    titleEn: "ioctl Command Encoding: _IOC’s Four-Field Packing",
    difficulty: "hard",
    minutes: 22,
    tags: ["ioctl", "位打包", "ABI"],
    tagsEn: ["ioctl", "bit-packing", "ABI"],
    lessonId: "cc-kernel-1",
    brief: "用户态和 amdgpu 对话的每个 ioctl 号,都是 dir/size/type/nr 四段打包成的 u32——亲手实现打包与解包。",
    briefEn: "Every ioctl number userspace sends amdgpu packs dir/size/type/nr into one u32 — implement pack and unpack yourself.",
    description: [
      '用户态驱动库（libdrm）通过 `ioctl(fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args)` 和内核对话。那个命令号不是随便编的：32 位里挤着四段信息——低 8 位 `nr`（命令序号）、8..15 位 `type`（子系统魔数，DRM 是 \'d\'）、16..29 位 `size`（参数结构体大小，14 位）、30..31 位 `dir`（数据方向：0 无、1 写、2 读、3 读写）。内核靠它做参数大小校验和方向检查。',
      '实现：`mk_ioc(dir, type, nr, size)`——四段打包（各段先掩掉超宽部分再移位）；四个解包函数 `ioc_dir/ioc_type/ioc_nr/ioc_size`；以及 `ioc_valid_size(cmd, expect)`——判断命令中的 size 是否等于期望值（内核入口的第一道防线）。',
      '这是 c-05 位域功夫的 ABI 级应用：打包格式一旦发布就是永久契约，一位都不能挪。',
    ],
    descriptionEn: [
      'Userspace driver libraries (libdrm) talk to the kernel via `ioctl(fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args)`. That command number is no arbitrary constant: 32 bits carry four fields — bits 0..7 `nr` (command index), 8..15 `type` (subsystem magic, \'d\' for DRM), 16..29 `size` (argument struct size, 14 bits), 30..31 `dir` (data direction: 0 none, 1 write, 2 read, 3 both). The kernel uses it for argument-size validation and direction checks.',
      'Implement: `mk_ioc(dir, type, nr, size)` — pack the four fields (mask each to width before shifting); the four decoders `ioc_dir/ioc_type/ioc_nr/ioc_size`; and `ioc_valid_size(cmd, expect)` — does the command’s size equal the expectation (the kernel entry point’s first line of defense).',
      'This is c-05’s field craft elevated to ABI level: once published, the packing format is a permanent contract — not one bit may move.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>

/* 布局: [31:30] dir | [29:16] size | [15:8] type | [7:0] nr */
#define IOC_DIR_NONE  0u
#define IOC_DIR_WRITE 1u
#define IOC_DIR_READ  2u

uint32_t mk_ioc(uint32_t dir, uint32_t type, uint32_t nr, uint32_t size)
{
    (void)dir; (void)type; (void)nr; (void)size;
    return 0; /* TODO: 各段掩宽后移位合并 */
}

uint32_t ioc_dir(uint32_t cmd)  { (void)cmd; return 0; /* TODO */ }
uint32_t ioc_type(uint32_t cmd) { (void)cmd; return 0; /* TODO */ }
uint32_t ioc_nr(uint32_t cmd)   { (void)cmd; return 0; /* TODO */ }
uint32_t ioc_size(uint32_t cmd) { (void)cmd; return 0; /* TODO */ }

int ioc_valid_size(uint32_t cmd, uint32_t expect)
{
    (void)cmd; (void)expect;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>

/* Layout: [31:30] dir | [29:16] size | [15:8] type | [7:0] nr */
#define IOC_DIR_NONE  0u
#define IOC_DIR_WRITE 1u
#define IOC_DIR_READ  2u

uint32_t mk_ioc(uint32_t dir, uint32_t type, uint32_t nr, uint32_t size)
{
    (void)dir; (void)type; (void)nr; (void)size;
    return 0; /* TODO: mask each field to width, then shift and merge */
}

uint32_t ioc_dir(uint32_t cmd)  { (void)cmd; return 0; /* TODO */ }
uint32_t ioc_type(uint32_t cmd) { (void)cmd; return 0; /* TODO */ }
uint32_t ioc_nr(uint32_t cmd)   { (void)cmd; return 0; /* TODO */ }
uint32_t ioc_size(uint32_t cmd) { (void)cmd; return 0; /* TODO */ }

int ioc_valid_size(uint32_t cmd, uint32_t expect)
{
    (void)cmd; (void)expect;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

struct fake_gem_create { uint64_t size; uint32_t flags; uint32_t pad; };

int main(void)
{
    /* hand-checked: dir=3, type='d'(0x64), nr=0x12, size=0x20
     * (3<<30)|(0x20<<16)|(0x64<<8)|0x12 = 0xC0206412 */
    uint32_t cmd = mk_ioc(3, 0x64, 0x12, 0x20);
    check("packed value exact", cmd == 0xC0206412u);

    check("dir round-trip", ioc_dir(cmd) == 3);
    check("type round-trip", ioc_type(cmd) == 0x64);
    check("nr round-trip", ioc_nr(cmd) == 0x12);
    check("size round-trip", ioc_size(cmd) == 0x20);

    uint32_t none = mk_ioc(IOC_DIR_NONE, 'k', 0xFF, 0);
    check("zero size, max nr", ioc_nr(none) == 0xFF && ioc_size(none) == 0 && ioc_dir(none) == 0);

    uint32_t big = mk_ioc(IOC_DIR_READ, 'd', 1, 0x3FFF);
    check("14-bit size max", ioc_size(big) == 0x3FFF);

    /* width clipping: oversize inputs must not pollute neighbors */
    uint32_t dirty = mk_ioc(7, 0x1FF, 0x123, 0x7FFF);
    check("oversize dir clipped", ioc_dir(dirty) == 3);
    check("oversize type clipped", ioc_type(dirty) == 0xFF);
    check("oversize nr clipped", ioc_nr(dirty) == 0x23);
    check("oversize size clipped", ioc_size(dirty) == 0x3FFF);

    uint32_t gem = mk_ioc(3, 'd', 0x00, sizeof(struct fake_gem_create));
    check("size validation accepts", ioc_valid_size(gem, sizeof(struct fake_gem_create)));
    check("size validation rejects", !ioc_valid_size(gem, sizeof(struct fake_gem_create) + 4));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '打包：`((dir & 0x3u) << 30) | ((size & 0x3FFFu) << 16) | ((type & 0xFFu) << 8) | (nr & 0xFFu)`——每段先 & 后 <<，顺序不能反（先移位会把垃圾位带上去）。',
      '解包是镜像：`(cmd >> 30) & 0x3u`、`(cmd >> 16) & 0x3FFFu`、`(cmd >> 8) & 0xFFu`、`cmd & 0xFFu`。',
      '真实定义在 include/uapi/asm-generic/ioctl.h：_IOC(dir,type,nr,size) 与 _IOC_DIR/_IOC_TYPE/_IOC_NR/_IOC_SIZE——写完对照读一遍，会发现一模一样。',
    ],
    hintsEn: [
      'Packing: `((dir & 0x3u) << 30) | ((size & 0x3FFFu) << 16) | ((type & 0xFFu) << 8) | (nr & 0xFFu)` — mask **then** shift, never the reverse (shifting first drags garbage bits up).',
      'Unpacking mirrors it: `(cmd >> 30) & 0x3u`, `(cmd >> 16) & 0x3FFFu`, `(cmd >> 8) & 0xFFu`, `cmd & 0xFFu`.',
      'The real definitions live in include/uapi/asm-generic/ioctl.h: _IOC(dir,type,nr,size) and _IOC_DIR/_IOC_TYPE/_IOC_NR/_IOC_SIZE — read them after solving and find them identical.',
    ],
    solution: `#include <stdint.h>

#define IOC_DIR_NONE  0u
#define IOC_DIR_WRITE 1u
#define IOC_DIR_READ  2u

uint32_t mk_ioc(uint32_t dir, uint32_t type, uint32_t nr, uint32_t size)
{
    return ((dir & 0x3u) << 30) |
           ((size & 0x3FFFu) << 16) |
           ((type & 0xFFu) << 8) |
           (nr & 0xFFu);
}

uint32_t ioc_dir(uint32_t cmd)  { return (cmd >> 30) & 0x3u; }
uint32_t ioc_type(uint32_t cmd) { return (cmd >> 8) & 0xFFu; }
uint32_t ioc_nr(uint32_t cmd)   { return cmd & 0xFFu; }
uint32_t ioc_size(uint32_t cmd) { return (cmd >> 16) & 0x3FFFu; }

int ioc_valid_size(uint32_t cmd, uint32_t expect)
{
    return ioc_size(cmd) == expect;
}`,
    solutionNote:
      '为什么把 size 编进命令号？内核在 copy_from_user 之前就能校验用户态与内核态对参数结构体大小的认知是否一致——结构体加了字段而用户态库没重编译，这里立刻发现，而不是静默读越界。libdrm 里的 DRM_IOWR(0x12, struct xxx) 宏展开后就是你写的 mk_ioc(3, DRM_IOCTL_BASE, 0x12, sizeof(struct xxx))。"先掩宽再移位"是位打包的通用纪律——ABI 层面尤其如此，脏位混进去就是永久兼容性事故。',
    solutionNoteEn:
      'Why encode size into the command number? Before any copy_from_user the kernel can verify that userspace and kernel agree on the argument struct’s size — a struct gained a field but the userspace lib wasn’t rebuilt? Caught here, instead of a silent out-of-bounds read. libdrm’s DRM_IOWR(0x12, struct xxx) expands to exactly your mk_ioc(3, DRM_IOCTL_BASE, 0x12, sizeof(struct xxx)). "Mask, then shift" is the universal packing discipline — doubly so at ABI level, where a stray bit is a permanent compatibility incident.',
  },
  {
    id: "k-10",
    track: "kernel",
    number: 10,
    title: "fence 序号：回绕安全的先后比较",
    titleEn: "Fence Seqnos: Wrap-Safe Ordering",
    difficulty: "hard",
    minutes: 22,
    tags: ["fence", "序号回绕", "有符号技巧"],
    tagsEn: ["fence", "seqno-wrap", "signed-trick"],
    lessonId: "cc-c-2",
    brief: "seqno 是 u32,跑几天就回绕——`a > b` 判断先后从此失效。学内核的有符号差值技巧。",
    briefEn: "Seqnos are u32 and wrap after days of uptime — plain `a > b` ordering breaks. Learn the kernel’s signed-difference trick.",
    description: [
      'GPU 每完成一个任务就把递增的 seqno 写回内存，CPU 拿"最新完成号"对比"等待号"判断任务是否做完。seqno 是 u32：跑到 0xFFFFFFFF 之后回到 0。此时朴素的 `completed >= wait` 会把"刚完成的 0x00000005"误判成"远古于 0xFFFFFFF0"——挂死或过早放行，都是事故。',
      '内核的技巧：**转成有符号差值**。`(int32_t)(a - b) > 0` 表示 a 在 b 之后（模 2³² 距离小于 2³¹ 的前提下恒真）。实现四个函数：`seq_after(a, b)`——a 严格在 b 后；`seq_after_eq(a, b)`；`fence_done(completed, wait)`——等价 after_eq 的语义别名；`count_done(completed, waits[], n)`——统计已完成的等待号个数。',
      'harness 的关键用例全在回绕边界上：completed=2、wait=0xFFFFFFFE 这种"跨零点"组合。',
    ],
    descriptionEn: [
      'Each finished GPU job writes back an increasing seqno; the CPU compares "latest completed" with "waiting for" to decide completion. Seqnos are u32: after 0xFFFFFFFF comes 0. Naive `completed >= wait` then misjudges freshly-completed 0x00000005 as "ancient history versus 0xFFFFFFF0" — hangs or premature releases, both incidents.',
      'The kernel’s trick: **the signed difference**. `(int32_t)(a - b) > 0` means a is after b (always true while the mod-2³² distance stays under 2³¹). Implement four functions: `seq_after(a, b)` — a strictly after b; `seq_after_eq(a, b)`; `fence_done(completed, wait)` — a semantic alias of after_eq; `count_done(completed, waits[], n)` — how many waited-on seqnos have completed.',
      'The harness’s key cases all sit on the wrap boundary: combinations like completed=2, wait=0xFFFFFFFE that straddle zero.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

/* a 是否严格在 b 之后 (模 2^32 回绕安全) */
bool seq_after(uint32_t a, uint32_t b)
{
    (void)a; (void)b;
    return false; /* TODO */
}

bool seq_after_eq(uint32_t a, uint32_t b)
{
    (void)a; (void)b;
    return false; /* TODO */
}

bool fence_done(uint32_t completed, uint32_t wait)
{
    (void)completed; (void)wait;
    return false; /* TODO */
}

int count_done(uint32_t completed, const uint32_t *waits, size_t n)
{
    (void)completed; (void)waits; (void)n;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

/* Is a strictly after b (mod 2^32, wrap-safe)? */
bool seq_after(uint32_t a, uint32_t b)
{
    (void)a; (void)b;
    return false; /* TODO */
}

bool seq_after_eq(uint32_t a, uint32_t b)
{
    (void)a; (void)b;
    return false; /* TODO */
}

bool fence_done(uint32_t completed, uint32_t wait)
{
    (void)completed; (void)wait;
    return false; /* TODO */
}

int count_done(uint32_t completed, const uint32_t *waits, size_t n)
{
    (void)completed; (void)waits; (void)n;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

int main(void)
{
    check("plain after", seq_after(10, 5));
    check("plain not-after", !seq_after(5, 10));
    check("equal is not strictly after", !seq_after(7, 7));
    check("after_eq on equal", seq_after_eq(7, 7));

    /* wrap boundary: 2 is after 0xFFFFFFFE (walked through 0) */
    check("wrap: 2 after 0xFFFFFFFE", seq_after(2, 0xFFFFFFFEu));
    check("wrap: 0xFFFFFFFE not after 2", !seq_after(0xFFFFFFFEu, 2));
    check("wrap: 0 after 0xFFFFFFFF", seq_after(0, 0xFFFFFFFFu));

    check("fence exactly done", fence_done(100, 100));
    check("fence overdone", fence_done(150, 100));
    check("fence pending", !fence_done(99, 100));
    check("fence wrap done", fence_done(3, 0xFFFFFFF0u));
    check("fence wrap pending", !fence_done(0xFFFFFFF0u, 3));

    uint32_t waits[] = { 0xFFFFFFF0u, 0xFFFFFFFFu, 0, 2, 5, 9 };
    check("count across wrap", count_done(4, waits, 6) == 4);
    check("count none", count_done(0xFFFFFFEFu, waits, 6) == 0);
    check("count all", count_done(100, waits, 6) == 6);
    check("count empty", count_done(4, waits, 0) == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'seq_after：`return (int32_t)(a - b) > 0;`——无符号减法先算出模 2³² 距离，再"重新解释"为有符号：距离 < 2³¹ 为正（a 在后），> 2³¹ 变负（a 在前）。',
      '为什么合法：u32 减法回绕是良定义（k-05 用过）；把结果转 int32_t 是实现定义而非 UB（gcc/clang 保证补码重解释）。内核显式依赖这一点。',
      'count_done 就是 fence_done 的循环累计。想清楚 waits 里 0xFFFFFFF0 在 completed=4 时算不算完成（提示：4 - 0xFFFFFFF0 = 20，正数 → 完成）。',
    ],
    hintsEn: [
      'seq_after: `return (int32_t)(a - b) > 0;` — unsigned subtraction computes the mod-2³² distance, then reinterpret as signed: distance < 2³¹ is positive (a later), > 2³¹ goes negative (a earlier).',
      'Why it’s legal: u32 subtraction wraps well-defined (used in k-05); converting to int32_t is implementation-defined, not UB (gcc/clang guarantee two’s-complement reinterpretation). The kernel relies on this explicitly.',
      'count_done is fence_done in a loop. Convince yourself 0xFFFFFFF0 counts as done at completed=4 (hint: 4 - 0xFFFFFFF0 = 20, positive → done).',
    ],
    solution: `#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

bool seq_after(uint32_t a, uint32_t b)
{
    return (int32_t)(a - b) > 0;
}

bool seq_after_eq(uint32_t a, uint32_t b)
{
    return (int32_t)(a - b) >= 0;
}

bool fence_done(uint32_t completed, uint32_t wait)
{
    return seq_after_eq(completed, wait);
}

int count_done(uint32_t completed, const uint32_t *waits, size_t n)
{
    int count = 0;
    for (size_t i = 0; i < n; i++) {
        if (fence_done(completed, waits[i]))
            count++;
    }
    return count;
}`,
    solutionNote:
      '一行 `(int32_t)(a - b) > 0` 背后是整个"序号空间"世界观：比较的不是绝对大小而是**环上的方向**，有效前提是两个号的真实距离小于半环（2³¹）——GPU 场景天然满足（不可能有 20 亿个未决任务）。同一技巧守护着 TCP 序号（RFC 1982 serial number arithmetic）、内核 jiffies 的 time_after()、amdgpu_fence_process 里的 seq 判断。忘掉它的人会写出"运行 49.7 天后死机"式的传奇 bug（Windows 95 的 GetTickCount 事故）。',
    solutionNoteEn:
      'Behind the one-liner `(int32_t)(a - b) > 0` is a worldview: you compare **direction on a ring**, not absolute magnitude, valid while the true distance stays under half the ring (2³¹) — naturally satisfied for GPUs (two billion outstanding jobs won’t happen). The same trick guards TCP sequence numbers (RFC 1982 serial arithmetic), the kernel’s jiffies time_after(), and the seq checks in amdgpu_fence_process. Forget it and you write legendary "crashes after 49.7 days of uptime" bugs (Windows 95’s GetTickCount incident).',
  },
  {
    id: "k-11",
    track: "kernel",
    number: 11,
    title: "devres：注册即忘的清理栈",
    titleEn: "devres: The Register-and-Forget Cleanup Stack",
    difficulty: "medium",
    minutes: 20,
    tags: ["devres", "函数指针", "LIFO"],
    tagsEn: ["devres", "function-pointers", "LIFO"],
    lessonId: "cc-kernel-5",
    brief: "devm_* 系列为什么能\"申请后不用管释放\"？背后是一个函数指针清理栈——实现它。",
    briefEn: "Why can devm_* APIs “allocate and never free”? A stack of cleanup callbacks — build it.",
    description: [
      'k-07 的 goto 阶梯有个工程痛点：每加一种资源就要改一处阶梯，漏改就泄漏。内核的进化答案是 devres（设备资源管理）：申请资源时**顺手注册一个清理回调**，设备拆除时框架**逆序**执行全部回调——初始化代码从此不写任何清理逻辑，这就是 amdgpu 里 devm_kzalloc、devm_request_irq 的原理。',
      '实现固定容量的清理栈 `struct devres { struct dr_action actions[8]; int count; }`，其中 `struct dr_action { void (*fn)(void *data); void *data; }`：`devres_init(dr)`；`devres_add(dr, fn, data)`——登记回调，满（8 个）返回 -ENOMEM；`devres_release_all(dr)`——**逆序**执行所有回调、清空计数、返回执行个数（可安全重复调用，第二次应为 0）。',
      'harness 用回调向日志字符串追加标记来验证执行顺序，并检查"注册顺序 A、B、C → 执行顺序 C、B、A"。',
    ],
    descriptionEn: [
      'k-07’s goto ladder has an engineering pain: every new resource edits the ladder, and a missed edit leaks. The kernel’s evolved answer is devres (device resource management): when acquiring a resource you **register a cleanup callback on the spot**, and at device teardown the framework runs all callbacks **in reverse** — init code stops carrying any cleanup logic. This is how devm_kzalloc and devm_request_irq in amdgpu work.',
      'Implement the fixed-capacity cleanup stack `struct devres { struct dr_action actions[8]; int count; }` with `struct dr_action { void (*fn)(void *data); void *data; }`: `devres_init(dr)`; `devres_add(dr, fn, data)` — register a callback, return -ENOMEM when full (8); `devres_release_all(dr)` — run all callbacks **in reverse**, clear the count, return how many ran (safe to call again: the second call returns 0).',
      'The harness verifies order by having callbacks append tags to a log string, checking "registered A, B, C → executed C, B, A".',
    ],
    language: "c",
    starterCode: `#include <stddef.h>

#define ENOMEM 12
#define DEVRES_CAP 8

struct dr_action {
    void (*fn)(void *data);
    void *data;
};

struct devres {
    struct dr_action actions[DEVRES_CAP];
    int count;
};

void devres_init(struct devres *dr)
{
    (void)dr; /* TODO */
}

int devres_add(struct devres *dr, void (*fn)(void *data), void *data)
{
    (void)dr; (void)fn; (void)data;
    return -ENOMEM; /* TODO */
}

int devres_release_all(struct devres *dr)
{
    (void)dr;
    return 0; /* TODO: 逆序执行 + 清空 + 返回个数 */
}`,
    starterCodeEn: `#include <stddef.h>

#define ENOMEM 12
#define DEVRES_CAP 8

struct dr_action {
    void (*fn)(void *data);
    void *data;
};

struct devres {
    struct dr_action actions[DEVRES_CAP];
    int count;
};

void devres_init(struct devres *dr)
{
    (void)dr; /* TODO */
}

int devres_add(struct devres *dr, void (*fn)(void *data), void *data)
{
    (void)dr; (void)fn; (void)data;
    return -ENOMEM; /* TODO */
}

int devres_release_all(struct devres *dr)
{
    (void)dr;
    return 0; /* TODO: run in reverse + clear + return how many ran */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

static char g_log[64];
static void append_tag(void *data)
{
    strcat(g_log, (const char *)data);
}

static int g_freed;
static void fake_free(void *data)
{
    (void)data;
    g_freed++;
}

int main(void)
{
    struct devres dr;
    devres_init(&dr);
    check("fresh devres empty", devres_release_all(&dr) == 0);

    g_log[0] = 0;
    check("add A", devres_add(&dr, append_tag, (void *)"A") == 0);
    check("add B", devres_add(&dr, append_tag, (void *)"B") == 0);
    check("add C", devres_add(&dr, append_tag, (void *)"C") == 0);
    check("nothing ran during add", g_log[0] == 0);

    check("release runs 3", devres_release_all(&dr) == 3);
    check("reverse order CBA", strcmp(g_log, "CBA") == 0);
    check("second release is no-op", devres_release_all(&dr) == 0);
    check("log unchanged after no-op", strcmp(g_log, "CBA") == 0);

    /* capacity: 8 fill it, the 9th is rejected */
    g_freed = 0;
    for (int i = 0; i < 8; i++)
        check("fill slot", devres_add(&dr, fake_free, NULL) == 0);
    check("9th add rejected", devres_add(&dr, fake_free, NULL) == -ENOMEM);
    check("release full stack", devres_release_all(&dr) == 8 && g_freed == 8);

    /* reuse: re-registration works after release */
    g_log[0] = 0;
    devres_add(&dr, append_tag, (void *)"X");
    check("reusable after release", devres_release_all(&dr) == 1 && strcmp(g_log, "X") == 0);

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      'devres_add：满则拒，否则 `dr->actions[dr->count].fn = fn; dr->actions[dr->count].data = data; dr->count++;`。',
      'release 的逆序循环：`for (int i = dr->count - 1; i >= 0; i--) dr->actions[i].fn(dr->actions[i].data);`——注意 i 用 int 而不是无符号（i >= 0 对无符号永真，c-03 的坑换了件衣服）。',
      '执行完把 count 清零——这一步同时买到"可重复调用"和"可复用"两个性质。',
    ],
    hintsEn: [
      'devres_add: reject when full, else `dr->actions[dr->count].fn = fn; dr->actions[dr->count].data = data; dr->count++;`.',
      'The reverse loop in release: `for (int i = dr->count - 1; i >= 0; i--) dr->actions[i].fn(dr->actions[i].data);` — i must be int, not unsigned (`i >= 0` is always true for unsigned — c-03’s trap in new clothes).',
      'Zero the count after running — that single step buys both "safe to call twice" and "reusable".',
    ],
    solution: `#include <stddef.h>

#define ENOMEM 12
#define DEVRES_CAP 8

struct dr_action {
    void (*fn)(void *data);
    void *data;
};

struct devres {
    struct dr_action actions[DEVRES_CAP];
    int count;
};

void devres_init(struct devres *dr)
{
    dr->count = 0;
}

int devres_add(struct devres *dr, void (*fn)(void *data), void *data)
{
    if (dr->count >= DEVRES_CAP)
        return -ENOMEM;
    dr->actions[dr->count].fn = fn;
    dr->actions[dr->count].data = data;
    dr->count++;
    return 0;
}

int devres_release_all(struct devres *dr)
{
    int ran = dr->count;

    for (int i = dr->count - 1; i >= 0; i--)
        dr->actions[i].fn(dr->actions[i].data);
    dr->count = 0;
    return ran;
}`,
    solutionNote:
      '三代错误处理的完整谱系到此集齐：goto 阶梯（k-07，手动、就地）→ devres 回调栈（本题，注册即忘、框架代劳）→ C++ RAII（cpp-03，语言原生）。三者共享同一条铁律：**释放顺序 = 申请顺序的倒序**。真实 devres（drivers/base/devres.c）用链表而非定长数组、且挂在 struct device 上随设备生命周期走；amdgpu 大量 devm_* 调用让驱动卸载路径缩短了数百行。fn+data 的组合就是 C 的"闭包"——c-14 ops 的单函数版。',
    solutionNoteEn:
      'The full genealogy of error handling assembles here: goto ladders (k-07 — manual, inline) → the devres callback stack (this problem — register-and-forget, framework-run) → C++ RAII (cpp-03 — native to the language). All three share one iron law: **release order = reverse of acquisition order**. The real devres (drivers/base/devres.c) uses a linked list rather than a fixed array and rides on struct device across the device lifetime; amdgpu’s heavy devm_* usage shortened its teardown paths by hundreds of lines. The fn+data pair is C’s "closure" — a one-function edition of c-14’s ops.',
  },
  {
    id: "k-12",
    track: "kernel",
    number: 12,
    title: "综合战：mini 命令处理器",
    titleEn: "Capstone: A Mini Command Processor",
    difficulty: "hard",
    minutes: 40,
    tags: ["综合", "ring", "ops", "位域"],
    tagsEn: ["capstone", "ring", "ops", "bit-fields"],
    lessonId: "cc-kernel-6",
    brief: "毕业题：ring + 包头位域 + 操作码分发表——把整条轨道的知识拼成一个能跑的迷你 GPU 前端。",
    briefEn: "Graduation: ring + packet-header fields + an opcode dispatch table — assemble the whole track into a running mini GPU front-end.",
    description: [
      '这是内核轨道的毕业综合题，模拟 GPU 命令处理器消费 ring 里的命令流。命令包格式：1 个包头字 + N 个负载字。包头布局：[31:24] opcode、[23:16] 负载长度 len、[15:0] 保留。这正是 AMD PM4 包（PACKET3）的简化版。',
      '`struct cmdring` 的 wptr/rptr 是**只增**的 u32 计数器（k-05 的套路）：任何对 buf 的访问都必须 `& (RING_WORDS - 1)` 落到物理下标——环会被长期复用，包头和负载都可能跨越物理边界回绕。实现 (1) `emit(ring, opcode, payload, len)`：空间不足（需要 1+len 字）返回 -ENOSPC 且不写任何字；否则写入包头+负载并推进 wptr。',
      '(2) `process(ring, table, stats)`：循环消费命令包。每个包先做三重校验：包必须完整（头声明的 `1+len` 不得超过 ring 里现有数据，防御畸形流）；opcode 必须 < 16 且表项非 NULL；三者任一不满足返回 -EINVAL 且 **rptr 停在该包的包头之前**。因为负载可能物理回绕，需要先把 len 个字拷进本地 staging 缓冲（≤255 字）再传给处理器；处理器返回负值时原样透传并同样停在包前。全部处理完返回包数。做完这题，amdgpu_ring_write / PM4 解析代码你直接就能读了。',
    ],
    descriptionEn: [
      'The track’s graduation exercise: simulate a GPU command processor consuming a ring’s command stream. Packet format: 1 header word + N payload words. Header layout: [31:24] opcode, [23:16] payload length len, [15:0] reserved. This is a simplified AMD PM4 packet (PACKET3).',
      'The wptr/rptr in `struct cmdring` are **monotonically increasing** u32 counters (the k-05 pattern): every access into buf must be masked with `& (RING_WORDS - 1)` — the ring is reused indefinitely, so headers and payloads may wrap across the physical boundary. Implement (1) `emit(ring, opcode, payload, len)`: return -ENOSPC without writing anything when space (1+len words) is short; otherwise write header + payload and advance wptr.',
      '(2) `process(ring, table, stats)`: consume packets in a loop. Each packet passes three gates: it must be complete (the header’s claimed `1+len` may not exceed the data currently in the ring — defends against malformed streams); the opcode must be < 16 with a non-NULL table entry; violating any gate returns -EINVAL with **rptr parked before that packet’s header**. Because payloads may wrap physically, copy the len words into a local staging buffer (≤255 words) before handing them to the handler; a negative handler return propagates verbatim, likewise parking before the packet. Return the packet count when everything is consumed. After this, amdgpu_ring_write / PM4 parsing code reads like plain prose.',
    ],
    language: "c",
    starterCode: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC 28
#define EINVAL 22
#define RING_WORDS  64u
#define MAX_PAYLOAD 255u

struct stats {
    uint64_t sum;
    int calls;
};

typedef int (*handler_fn)(const uint32_t *payload, uint32_t len, struct stats *st);

struct cmdring {
    uint32_t buf[RING_WORDS];
    uint32_t wptr;   /* 只增计数器 —— 访问 buf 必须 & (RING_WORDS-1) */
    uint32_t rptr;   /* 只增计数器 */
};

/* 包头: [31:24] opcode | [23:16] len | [15:0] 0 */
static inline uint32_t mk_header(uint32_t opcode, uint32_t len)
{
    return ((opcode & 0xFFu) << 24) | ((len & 0xFFu) << 16);
}

/* 1 头字 + len 负载字; 空间不足 -> -ENOSPC 且不写。
 * 注意: 环长期复用, 写入下标必须取掩码, 内容可跨物理边界。 */
int emit(struct cmdring *r, uint32_t opcode, const uint32_t *payload, uint32_t len)
{
    (void)r; (void)opcode; (void)payload; (void)len;
    return -ENOSPC; /* TODO */
}

/* 逐包: 完整性校验 -> 查表 -> 负载拷入本地 staging -> 分发 -> 推进 rptr。
 * 不完整包 / 未知 opcode / 空表项 -> -EINVAL, rptr 停在该包前。
 * 处理器负返回值原样透传, 同样停在该包前。 */
int process(struct cmdring *r, handler_fn table[16], struct stats *st)
{
    (void)r; (void)table; (void)st;
    return 0; /* TODO */
}`,
    starterCodeEn: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC 28
#define EINVAL 22
#define RING_WORDS  64u
#define MAX_PAYLOAD 255u

struct stats {
    uint64_t sum;
    int calls;
};

typedef int (*handler_fn)(const uint32_t *payload, uint32_t len, struct stats *st);

struct cmdring {
    uint32_t buf[RING_WORDS];
    uint32_t wptr;   /* monotonic counter — mask with & (RING_WORDS-1) for buf access */
    uint32_t rptr;   /* monotonic counter */
};

/* Header: [31:24] opcode | [23:16] len | [15:0] 0 */
static inline uint32_t mk_header(uint32_t opcode, uint32_t len)
{
    return ((opcode & 0xFFu) << 24) | ((len & 0xFFu) << 16);
}

/* 1 header word + len payload words; short on space -> -ENOSPC, write nothing.
 * The ring is reused forever: mask every index, content may wrap physically. */
int emit(struct cmdring *r, uint32_t opcode, const uint32_t *payload, uint32_t len)
{
    (void)r; (void)opcode; (void)payload; (void)len;
    return -ENOSPC; /* TODO */
}

/* Per packet: completeness check -> table lookup -> copy payload into a local
 * staging buffer -> dispatch -> advance rptr.
 * Incomplete packet / unknown opcode / NULL entry -> -EINVAL, rptr parked
 * before the packet. Negative handler returns propagate, likewise parked. */
int process(struct cmdring *r, handler_fn table[16], struct stats *st)
{
    (void)r; (void)table; (void)st;
    return 0; /* TODO */
}`,
    harness: `#include <stdio.h>
#include <string.h>
{{USER_CODE}}

static int _pass, _total;
static void check(const char *label, int cond)
{
    _total++;
    if (cond) { _pass++; printf("[PASS] %s\\n", label); }
    else printf("[FAIL] %s\\n", label);
}

/* Canary-guarded ring: any out-of-bounds buf write lands in the guards. */
struct guarded {
    uint32_t pre[4];
    struct cmdring r;
    uint32_t post[4];
};

static void guard_init(struct guarded *g)
{
    memset(g, 0, sizeof(*g));
    for (int i = 0; i < 4; i++) { g->pre[i] = 0xCAFEBABE; g->post[i] = 0xCAFEBABE; }
}

static int guards_ok(const struct guarded *g)
{
    for (int i = 0; i < 4; i++)
        if (g->pre[i] != 0xCAFEBABE || g->post[i] != 0xCAFEBABE) return 0;
    return 1;
}

static int op_accumulate(const uint32_t *p, uint32_t len, struct stats *st)
{
    for (uint32_t i = 0; i < len; i++) st->sum += p[i];
    st->calls++;
    return 0;
}

static int op_nop(const uint32_t *p, uint32_t len, struct stats *st)
{
    (void)p; (void)len;
    st->calls++;
    return 0;
}

static int op_fail(const uint32_t *p, uint32_t len, struct stats *st)
{
    (void)p; (void)len; (void)st;
    return -99;
}

int main(void)
{
    struct guarded g;
    struct stats st;
    handler_fn table[16];
    memset(table, 0, sizeof(table));
    table[1] = op_accumulate;
    table[2] = op_nop;
    table[5] = op_fail;

    /* basic flow */
    guard_init(&g);
    memset(&st, 0, sizeof(st));
    uint32_t pay[] = { 10, 20, 30 };
    check("emit acc(3)", emit(&g.r, 1, pay, 3) == 0);
    check("emit nop(0)", emit(&g.r, 2, NULL, 0) == 0);
    check("wptr advanced 5", g.r.wptr == 5);
    check("header packed", g.r.buf[0] == 0x01030000u);
    check("process 2 packets", process(&g.r, table, &st) == 2);
    check("payload summed", st.sum == 60 && st.calls == 2);
    check("ring drained", g.r.rptr == g.r.wptr);
    check("empty process is 0", process(&g.r, table, &st) == 0);

    /* long-lived reuse: 3-word packets sweep every physical offset,
     * headers and payloads must wrap across the 64-word boundary */
    guard_init(&g);
    int reuse_ok = 1;
    for (uint32_t round = 0; round < 200 && reuse_ok; round++) {
        memset(&st, 0, sizeof(st));
        uint32_t p2[] = { round, round + 1 };
        if (emit(&g.r, 1, p2, 2) != 0) reuse_ok = 0;
        else if (process(&g.r, table, &st) != 1) reuse_ok = 0;
        else if (st.sum != (uint64_t)round * 2 + 1 || st.calls != 1) reuse_ok = 0;
    }
    check("200 reuse rounds across wrap", reuse_ok);
    check("no out-of-bounds writes (canaries)", guards_ok(&g));
    check("rptr never passes wptr", g.r.rptr == g.r.wptr);

    /* fill to exactly full, then overflow attempt while wrapped */
    guard_init(&g);
    uint32_t big[32];
    memset(big, 0xAA, sizeof(big));
    check("emit 33 words ok", emit(&g.r, 1, big, 32) == 0);
    check("emit 31 more ok", emit(&g.r, 1, big, 30) == 0);
    check("ring exactly full", g.r.wptr - g.r.rptr == 64);
    check("one more word -> ENOSPC", emit(&g.r, 2, NULL, 0) == -ENOSPC);
    memset(&st, 0, sizeof(st));
    check("drain full ring", process(&g.r, table, &st) == 2);
    check("full ring canaries intact", guards_ok(&g));

    /* unknown opcode: park before the bad packet */
    guard_init(&g);
    memset(&st, 0, sizeof(st));
    emit(&g.r, 1, pay, 1);
    emit(&g.r, 9, pay, 1);         /* table[9] == NULL */
    emit(&g.r, 1, pay, 1);
    check("unknown opcode -> -EINVAL", process(&g.r, table, &st) == -EINVAL);
    check("stopped before bad packet", st.calls == 1 && g.r.rptr == 2);

    /* handler error propagates */
    guard_init(&g);
    memset(&st, 0, sizeof(st));
    emit(&g.r, 2, NULL, 0);
    emit(&g.r, 5, pay, 2);
    uint32_t rptr_before = g.r.rptr;
    check("handler error propagates", process(&g.r, table, &st) == -99);
    check("error stops consumption", st.calls == 1 && g.r.rptr == rptr_before + 1);

    /* truncated packet: header claims 5 payload words, only 2 present */
    guard_init(&g);
    memset(&st, 0, sizeof(st));
    emit(&g.r, 2, NULL, 0);
    g.r.buf[g.r.wptr & (RING_WORDS - 1)] = mk_header(1, 5);
    g.r.buf[(g.r.wptr + 1) & (RING_WORDS - 1)] = 7;
    g.r.buf[(g.r.wptr + 2) & (RING_WORDS - 1)] = 8;
    g.r.wptr += 3;
    check("incomplete packet -> -EINVAL", process(&g.r, table, &st) == -EINVAL);
    check("good packet before it was handled", st.calls == 1);
    check("parked at truncated header", g.r.wptr - g.r.rptr == 3);
    check("truncated case canaries intact", guards_ok(&g));

    printf("RESULT %d/%d\\n", _pass, _total);
    return _pass == _total ? 0 : 1;
}`,
    hints: [
      '一切从 used 出发：`uint32_t used = r->wptr - r->rptr;`（k-05 的无符号减法）。emit 的空间检查是 `RING_WORDS - used < len + 1`；process 的完整性检查是 `len + 1 > used`。',
      '写和读都必须逐字取掩码：`r->buf[(r->wptr + i) & (RING_WORDS - 1)]`——wptr/rptr 本身只增不减，永不取模。',
      '负载可能跨物理边界，不能把 &buf[x] 直接递给处理器。先拷进本地数组：`uint32_t staging[MAX_PAYLOAD]; for (i < len) staging[i] = r->buf[(r->rptr + 1 + i) & (RING_WORDS - 1)];`。',
      '"停在包前"的实现要点：先窥视包头做所有校验、调用处理器，**全部成功后**才执行 `r->rptr += 1 + len`。任何失败路径都不碰 rptr。',
    ],
    hintsEn: [
      'Everything starts from used: `uint32_t used = r->wptr - r->rptr;` (k-05’s unsigned subtraction). emit’s space check is `RING_WORDS - used < len + 1`; process’s completeness check is `len + 1 > used`.',
      'Mask every word on both write and read: `r->buf[(r->wptr + i) & (RING_WORDS - 1)]` — wptr/rptr themselves only ever increase, never modulo them.',
      'Payloads may wrap physically, so &buf[x] must not be handed to handlers. Copy into a local array first: `uint32_t staging[MAX_PAYLOAD]; for (i < len) staging[i] = r->buf[(r->rptr + 1 + i) & (RING_WORDS - 1)];`.',
      'The key to "park before the packet": peek the header, run every check and the handler, and only **after full success** do `r->rptr += 1 + len`. No failure path touches rptr.',
    ],
    solution: `#include <stdint.h>
#include <stddef.h>

#define ENOSPC 28
#define EINVAL 22
#define RING_WORDS  64u
#define MAX_PAYLOAD 255u

struct stats {
    uint64_t sum;
    int calls;
};

typedef int (*handler_fn)(const uint32_t *payload, uint32_t len, struct stats *st);

struct cmdring {
    uint32_t buf[RING_WORDS];
    uint32_t wptr;
    uint32_t rptr;
};

static inline uint32_t mk_header(uint32_t opcode, uint32_t len)
{
    return ((opcode & 0xFFu) << 24) | ((len & 0xFFu) << 16);
}

int emit(struct cmdring *r, uint32_t opcode, const uint32_t *payload, uint32_t len)
{
    uint32_t used = r->wptr - r->rptr;

    if (RING_WORDS - used < len + 1)
        return -ENOSPC;

    r->buf[r->wptr & (RING_WORDS - 1)] = mk_header(opcode, len);
    r->wptr++;
    for (uint32_t i = 0; i < len; i++) {
        r->buf[r->wptr & (RING_WORDS - 1)] = payload[i];
        r->wptr++;
    }
    return 0;
}

int process(struct cmdring *r, handler_fn table[16], struct stats *st)
{
    int packets = 0;

    while (r->rptr != r->wptr) {
        uint32_t used = r->wptr - r->rptr;
        uint32_t hdr = r->buf[r->rptr & (RING_WORDS - 1)];
        uint32_t op = hdr >> 24;
        uint32_t len = (hdr >> 16) & 0xFFu;

        if (len + 1 > used)              /* incomplete/malformed packet */
            return -EINVAL;
        if (op >= 16 || !table[op])
            return -EINVAL;

        uint32_t staging[MAX_PAYLOAD];   /* payload may wrap physically */
        for (uint32_t i = 0; i < len; i++)
            staging[i] = r->buf[(r->rptr + 1 + i) & (RING_WORDS - 1)];

        int ret = table[op](staging, len, st);
        if (ret < 0)
            return ret;

        r->rptr += 1 + len;
        packets++;
    }
    return packets;
}`,
    solutionNote:
      '清点武器库：单调计数器 + 掩码下标（k-05）、包头位打包（c-05/k-09）、函数指针分发表（c-13/c-14）、errno 与"失败不推进状态"（c-07/c-15）、对畸形输入的完整性校验（c-10 的精神）。两处最容易翻车：复用后的环必须对每个字取掩码（否则写穿 buf——本题 harness 用 canary 抓这个）；头声明的长度必须先对照 used 校验（否则畸形流会让 rptr 越过 wptr）。真实 GPU 的 CP 固件对 PM4 包做同样的防御——驱动永远不信任命令流的自我声明。',
    solutionNoteEn:
      'Inventory the arsenal: monotonic counters + masked indices (k-05), header bit-packing (c-05/k-09), function-pointer dispatch (c-13/c-14), errno with "failure advances nothing" (c-07/c-15), and integrity checks against malformed input (the spirit of c-10). The two classic crashes: a reused ring must mask every word (or you write past buf — this harness catches it with canaries), and the header’s claimed length must be validated against used first (or a malformed stream walks rptr past wptr). Real GPU CP firmware defends PM4 packets the same way — a driver never trusts a command stream’s self-description.',
  },
];
