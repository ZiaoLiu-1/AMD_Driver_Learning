// ============================================================
// AMD Linux Driver Learning Platform - Module 1 Micro-Lessons (English)
// Module 1: Prerequisites
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module1MicroLessonsEn: MicroLessonModule = {
  moduleId: 'prerequisites',
  groups: [
    {
      id: "1-1",
      number: "1.1",
      title: "C Memory Model",
      titleEn: "C Memory Model",
      icon: "\ud83e\udde0",
      description: "The foundation of driver development. Understanding pointers, struct layout, and bit operations is a prerequisite for reading any kernel code.",
      lessons: [
        {
          id: "1-1-1",
          number: "1.1.1",
          title: "Pointer Arithmetic & Memory Model",
          titleEn: "Pointer Arithmetic & Memory Model",
          duration: 15,
          tags: ["C", "pointer", "memory"],
          concept: {
            summary: "A pointer is a numeric representation of a memory address; pointer arithmetic advances addresses in steps of the pointed-to type's size.",
            explanation: [
              "In C, a pointer is essentially an integer that stores a memory address. When you write int *p = &x, p stores the address of variable x in memory (a 64-bit number like 0xFFFF888001234560).",
              "The key rule of pointer arithmetic: p + 1 does not add 1 to the address — it adds sizeof(*p). If p is an int*, p + 1 adds 4 to the address (since int is 4 bytes). If p is a struct amdgpu_ring*, p + 1 adds the size of the entire struct.",
              "In kernel drivers, pointer arithmetic is everywhere. For example, when the driver needs to access GPU registers, it maps the BAR (Base Address Register) to a void __iomem * pointer, then accesses different registers through offsets. Understanding this mechanism is fundamental to reading amdgpu register access code.",
              "A common kernel pattern is the container_of macro: given a pointer to a struct member, it uses pointer arithmetic to derive the pointer to the containing struct. This is heavily used in the Linux kernel's linked lists and object systems."
            ],
            keyPoints: [
              "p + n is equivalent to (char*)p + n * sizeof(*p)",
              "void* pointers cannot be used in arithmetic directly — a cast is required first",
              "Pointers annotated with __iomem in the kernel must be accessed using readl/writel, never dereferenced directly",
              "container_of(ptr, type, member) is one of the kernel's most important macros"
            ],
          },
          diagram: {
            title: "Pointers and Arrays in Memory",
            content: `Address:  0x100    0x104    0x108    0x10C    0x110
         +--------+--------+--------+--------+--------+
Memory:  |  0x0A  |  0x14  |  0x1E  |  0x28  |  0x32  |
         +--------+--------+--------+--------+--------+
           ^
           p (int*, points to 0x100)

p[0] = *(p+0) -> address 0x100 -> value 0x0A (10)
p[1] = *(p+1) -> address 0x104 -> value 0x14 (20)  <- +4 bytes (sizeof int)
p[2] = *(p+2) -> address 0x108 -> value 0x1E (30)

container_of example:
struct amdgpu_ring {
    ...
    struct drm_gpu_scheduler sched;  <- offset: assume 128 bytes
    ...
};
Given &ring->sched, container_of subtracts 128 bytes to get ring's address`,
            caption: "Memory layout of an int array. Each element occupies 4 bytes; p+1 jumps 4 bytes, not 1 byte.",
          },
          codeWalk: {
            title: "container_of Macro — The Most Important Pointer Trick in the Kernel",
            file: "include/linux/container_of.h",
            language: "c",
            code: `/* include/linux/container_of.h */
#define container_of(ptr, type, member) ({          \\
    void *__mptr = (void *)(ptr);                   \\ /* 1 */
    static_assert(__same_type(*(ptr),               \\
        ((type *)0)->member),                       \\ /* 2 */
        "pointer type mismatch in container_of()"); \\
    ((type *)(__mptr - offsetof(type, member))); }) /* 3 */

/* Usage example — in amdgpu_sched.c */
static struct amdgpu_ring *
to_amdgpu_ring(struct drm_gpu_scheduler *sched)
{
    return container_of(sched, struct amdgpu_ring, sched); /* 4 */
}`,
            annotations: [
              "Cast ptr to void* to avoid compiler warnings",
              "Compile-time type check: ensures ptr's type matches the type of type.member",
              "Core calculation: use offsetof to get member's byte offset within type, then subtract that offset from ptr's address to get the containing struct's start address",
              "Real-world usage: given a drm_gpu_scheduler pointer, derive the pointer to the containing amdgpu_ring struct"
            ],
            explanation: "container_of is the core mechanism for implementing object-oriented polymorphism in the Linux kernel. The DRM scheduler only knows about drm_gpu_scheduler, but through container_of, the amdgpu driver can obtain the full amdgpu_ring information from the generic scheduler pointer. This pattern appears throughout the kernel.",
          },
          miniLab: {
            title: "Implement Your Own container_of",
            objective: "Understand offsetof and pointer arithmetic by manually implementing the container_of functionality",
            setup: "mkdir -p ~/amd-labs/1-1-1 && cd ~/amd-labs/1-1-1",
            language: "c",
            code: `#include <stdio.h>
#include <stddef.h>

struct amdgpu_ring {
    int ring_id;
    char name[32];
    int wptr;
    int rptr;
    struct {
        int timeout;
        int hw_submission;
    } sched;
    int num_dw;
};

#define my_container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

int main() {
    struct amdgpu_ring ring = {
        .ring_id = 42,
        .sched = { .timeout = 5000, .hw_submission = 64 }
    };
    void *sched_ptr = &ring.sched;
    struct amdgpu_ring *recovered = my_container_of(
        sched_ptr, struct amdgpu_ring, sched);
    printf("Original ring_id: %d\\n", ring.ring_id);
    printf("Recovered ring_id: %d\\n", recovered->ring_id);
    printf("Match: %s\\n",
        (&ring == recovered) ? "YES" : "NO");
    printf("offsetof(amdgpu_ring, sched) = %zu bytes\\n",
        offsetof(struct amdgpu_ring, sched));
    return 0;
}`,
            steps: [
              "Save the code above as lab.c",
              "Compile and run: gcc -o lab lab.c && ./lab",
              "Observe the output and confirm ring_id matches",
              "Modify the struct by adding more fields before sched, and observe how offsetof changes",
              "Try adding __attribute__((packed)) to the struct and observe the offsetof changes"
            ],
            expectedOutput: `Original ring_id: 42
Recovered ring_id: 42
Match: YES
offsetof(amdgpu_ring, sched) = 36 bytes`,
            hint: "offsetof(type, member) returns the byte offset of member within the type struct. Subtracting this offset from the member's address gives you the struct's start address.",
          },
          debugExercise: {
            title: "Find the Bug in This Code",
            description: "The following code attempts to iterate over a GPU register array, but the results are incorrect. Find the problem.",
            buggyCode: `#include <stdio.h>
#include <stdint.h>

uint32_t fake_bar[16] = {
    0x100, 0x200, 0x300, 0x400,
};

void read_registers(void *base, int count) {
    char *p = (char *)base;
    for (int i = 0; i < count; i++) {
        /* BUG: trying to read each uint32_t register */
        printf("REG[%d] = 0x%X\\n", i, *(uint32_t *)(p + i));
    }
}

int main() {
    read_registers(fake_bar, 4);
    return 0;
}`,
            language: "c",
            question: "What is wrong with this code? What consequences would it cause?",
            hint: "Each uint32_t is 4 bytes, so the offset should be i * sizeof(uint32_t) rather than i.",
            answer: "Change p + i to p + i * sizeof(uint32_t), or declare p as uint32_t *p and use p[i] to access elements. In a kernel driver, this type of error would cause reading incorrect register addresses, triggering GPU anomalies.",
          },
          interviewQ: {
            question: "In Linux kernel drivers, why can't you directly dereference __iomem pointers, and must use readl()/writel() functions instead?",
            difficulty: "medium",
            hint: "Consider memory barriers and compiler optimization issues.",
            answer: "__iomem pointers point to MMIO (Memory-Mapped I/O) regions, i.e., GPU register space. Direct dereferencing has two problems: 1) The compiler may reorder memory accesses as an optimization, but GPU register access order typically has strict requirements; 2) On some architectures, MMIO access requires special CPU instructions to guarantee atomicity and ordering of accesses. readl()/writel() internally include the necessary memory barriers (mb()), ensuring correct access ordering.",
            amdContext: "The amdgpu driver heavily uses RREG32()/WREG32() macros, which ultimately call readl()/writel(). AMD interviews frequently ask about the correct way to perform MMIO access.",
          },
        },
        {
          id: "1-1-2",
          number: "1.1.2",
          title: "Struct Layout & Alignment",
          titleEn: "Struct Layout & Alignment",
          duration: 15,
          tags: ["C", "struct", "alignment", "padding"],
          concept: {
            summary: "The compiler inserts padding bytes between struct members to satisfy alignment requirements, which directly affects driver memory usage and DMA operations.",
            explanation: [
              "CPUs have alignment requirements for memory access: a 4-byte int must be stored at an address that is a multiple of 4; an 8-byte long must be stored at a multiple of 8. If alignment is not met, some CPUs will generate hardware exceptions, while others will use multiple memory accesses to complete the operation, causing performance degradation.",
              "To satisfy alignment requirements, the compiler automatically inserts padding bytes between struct members. For example, in struct { char a; int b; }, a takes 1 byte, but b requires 4-byte alignment, so the compiler inserts 3 bytes of padding between a and b, making the struct 8 bytes instead of 5.",
              "In kernel driver development, struct layout is critically important. When the CPU transfers data to the GPU via DMA, the GPU expects to see a specific memory layout. If the struct defined by the driver doesn't match the layout expected by the GPU hardware, the GPU will parse data incorrectly, producing bugs that are extremely difficult to debug.",
              "There are two solutions: 1) Carefully arrange struct members by placing larger members first to avoid padding (recommended); 2) Use __attribute__((packed)) to force-remove padding, but this causes unaligned access, with performance penalties on some architectures."
            ],
            keyPoints: [
              "A struct's alignment requirement equals the alignment requirement of its largest member",
              "Member declaration order affects padding size: larger members first can reduce padding",
              "sizeof(struct) may be larger than the sum of all member sizes",
              "DMA descriptor structs must precisely match the hardware specification — no unexpected padding"
            ],
          },
          diagram: {
            title: "Struct Memory Layout Comparison",
            content: `// Bad layout (8 bytes padding)
struct bad_layout {
    char  a;    // 1 byte  @ offset 0
                // 3 bytes padding
    int   b;    // 4 bytes @ offset 4
    char  c;    // 1 byte  @ offset 8
                // 7 bytes padding
    long  d;    // 8 bytes @ offset 16
};              // total: 24 bytes!

Memory: [a][P][P][P][b][b][b][b][c][P][P][P][P][P][P][P][d][d][d][d][d][d][d][d]
         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16 ...  23

// Optimized layout (2 bytes padding)
struct good_layout {
    long  d;    // 8 bytes @ offset 0
    int   b;    // 4 bytes @ offset 8
    char  a;    // 1 byte  @ offset 12
    char  c;    // 1 byte  @ offset 13
                // 2 bytes padding (struct tail alignment)
};              // total: 16 bytes (saves 8 bytes!)`,
            caption: "By reordering members, the struct shrinks from 24 bytes to 16 bytes, saving 33% memory.",
          },
          codeWalk: {
            title: "amdgpu_ib Struct — GPU Command Buffer Descriptor",
            file: "drivers/gpu/drm/amd/amdgpu/amdgpu.h",
            language: "c",
            code: `/* drivers/gpu/drm/amd/amdgpu/amdgpu.h */
struct amdgpu_ib {
    struct amdgpu_sa_bo     *sa_bo;    /* 1: 8 bytes - pointer, 8-byte aligned */
    uint32_t                length_dw; /* 2: 4 bytes - command length (in DWs) */
    uint64_t                gpu_addr;  /* 3: 8 bytes - GPU virtual address */
    uint32_t                *ptr;      /* 4: 8 bytes - CPU virtual address */
    uint32_t                flags;     /* 5: 4 bytes - flags */
};

/* Compare: what happens with a bad ordering */
struct amdgpu_ib_bad {
    uint32_t    flags;     /* 4 bytes @ 0 */
                           /* 4 bytes padding! */
    uint64_t    gpu_addr;  /* 8 bytes @ 8 */
    uint32_t    length_dw; /* 4 bytes @ 16 */
                           /* 4 bytes padding! */
    uint32_t    *ptr;      /* 8 bytes @ 24 */
};`,
            annotations: [
              "sa_bo is a pointer (8 bytes), placed first to satisfy 8-byte alignment",
              "length_dw is uint32_t (4 bytes), follows the 8-byte pointer at offset 8",
              "gpu_addr is uint64_t (8 bytes), requires 8-byte alignment",
              "ptr is a pointer (8 bytes), at offset 24",
              "flags is uint32_t (4 bytes), at offset 32"
            ],
            explanation: "amdgpu_ib describes a GPU command buffer (Indirect Buffer). This struct is allocated and freed frequently; a well-designed memory layout can reduce cache line usage and improve performance. In real kernel code, you'll see developers pay very close attention to struct member ordering.",
          },
          miniLab: {
            title: "Struct Layout Analyzer",
            objective: "Write a C program that prints the complete memory layout of structs, understanding where padding is placed and how large it is",
            setup: "mkdir -p ~/amd-labs/1-1-2 && cd ~/amd-labs/1-1-2",
            language: "c",
            code: `#include <stdio.h>
#include <stddef.h>
#include <stdint.h>

struct layout_a { char a; int b; char c; long d; };
struct layout_b { long d; int b; char a; char c; };

struct gpu_dma_desc {
    uint64_t src_addr;
    uint64_t dst_addr;
    uint32_t size;
    uint32_t flags;
};

#define PRINT_FIELD(s, f) \\
    printf("  %-12s offset=%2zu  size=%zu\\n", \\
        #f, offsetof(s, f), sizeof(((s*)0)->f))

int main() {
    printf("=== layout_a ===\\nTotal: %zu bytes\\n", sizeof(struct layout_a));
    PRINT_FIELD(struct layout_a, a);
    PRINT_FIELD(struct layout_a, b);
    PRINT_FIELD(struct layout_a, c);
    PRINT_FIELD(struct layout_a, d);

    printf("\\n=== layout_b ===\\nTotal: %zu bytes\\n", sizeof(struct layout_b));
    PRINT_FIELD(struct layout_b, d);
    PRINT_FIELD(struct layout_b, b);
    PRINT_FIELD(struct layout_b, a);
    PRINT_FIELD(struct layout_b, c);

    printf("\\n=== gpu_dma_desc ===\\nTotal: %zu bytes\\n", sizeof(struct gpu_dma_desc));
    PRINT_FIELD(struct gpu_dma_desc, src_addr);
    PRINT_FIELD(struct gpu_dma_desc, dst_addr);
    PRINT_FIELD(struct gpu_dma_desc, size);
    PRINT_FIELD(struct gpu_dma_desc, flags);
    return 0;
}`,
            steps: [
              "Save as lab.c, compile and run: gcc -o lab lab.c && ./lab",
              "Observe the padding difference between layout_a and layout_b",
              "Calculate how many bytes layout_a wastes",
              "Think: what would happen if gpu_dma_desc had padding?",
              "Challenge: design a zero-padding struct containing 1 long, 2 ints, and 3 chars"
            ],
            expectedOutput: `=== layout_a ===
Total: 24 bytes
  a            offset= 0  size=1
  b            offset= 4  size=4
  c            offset= 8  size=1
  d            offset=16  size=8

=== layout_b ===
Total: 16 bytes
  d            offset= 0  size=8
  b            offset= 8  size=4
  a            offset=12  size=1
  c            offset=13  size=1`,
            hint: "There may also be padding at the end of a struct, to ensure each element in a struct array satisfies alignment requirements.",
          },
          debugExercise: {
            title: "Find the Bug in This Code",
            description: "The following code defines a GPU DMA descriptor, but on 64-bit systems it produces unexpected padding, causing a driver-hardware mismatch.",
            buggyCode: `struct sdma_v4_packet_bad {
    uint32_t    op_sub_op;
    uint64_t    src_addr;    /* BUG: there will be padding here! */
    uint32_t    count;
    uint64_t    dst_addr;
};`,
            language: "c",
            question: "What is wrong with this code? What consequences would it cause?",
            hint: "uint64_t requires 8-byte alignment. After op_sub_op (4 bytes), the compiler needs to insert 4 bytes of padding to align src_addr to an 8-byte boundary.",
            answer: "sdma_v4_packet_bad is 32 bytes (not 24): op_sub_op(4) + padding(4) + src_addr(8) + count(4) + padding(4) + dst_addr(8) = 32. This causes the command format written to the GPU by the driver to not match what the hardware expects. The GPU will parse incorrect addresses — in mild cases, the command fails; in severe cases, the GPU hangs or the system crashes.",
          },
          interviewQ: {
            question: "When writing GPU DMA descriptor structs, how do you ensure there is no unexpected padding? Give at least two methods.",
            difficulty: "medium",
            hint: "Consider both compile-time checks and runtime checks.",
            answer: "1) Use BUILD_BUG_ON(sizeof(struct foo) != expected_size) for compile-time checking; 2) Use static_assert in C11; 3) Use __attribute__((packed)) to eliminate padding; 4) Arrange members in descending size order; 5) Use the pahole tool to analyze struct layout.",
            amdContext: "SDMA command packet structs must precisely match the specifications in the AMD hardware manual. The amdgpu driver contains many BUILD_BUG_ON checks ensuring these structs have the correct size.",
          },
        },
        {
          id: "1-1-3",
          number: "1.1.3",
          title: "Bit Operations & Register Access",
          titleEn: "Bit Operations & Register Access",
          duration: 15,
          tags: ["C", "bitops", "registers", "bitmask"],
          concept: {
            summary: "GPU registers are collections of bit fields; bit operations are the fundamental language for driver-hardware communication.",
            explanation: [
              "A GPU register is a 32-bit or 64-bit integer where each bit or group of bits represents a different hardware state or control signal. For example, a 32-bit GPU status register might use bit 0 for GPU busy, bits 1-4 for current power state, bits 5-8 for temperature warning level, etc.",
              "The driver must precisely read and modify specific bits without affecting others. This is the core purpose of bit operations. Common operations include: |= to set a bit, &= ~mask to clear a bit, & to test a bit, ^= to toggle a bit.",
              "In the amdgpu driver, you'll see extensive code like RREG32_SOC15(GC, 0, mmGRBM_STATUS) — these macros read GPU registers, then use bitmasks to extract specific fields.",
              "The kernel provides a standard set of bit operation APIs: set_bit(), clear_bit(), test_bit(), test_and_set_bit(), etc. These functions are atomic operations that can be safely used in concurrent environments."
            ],
            keyPoints: [
              "Set bit: val |= (1 << n)",
              "Clear bit: val &= ~(1 << n)",
              "Test bit: val & (1 << n)",
              "Extract field: (val & MASK) >> SHIFT",
              "GENMASK(h, l) generates a mask from bit l to bit h"
            ],
          },
          diagram: {
            title: "GPU Register Bit Field Operations",
            content: `GRBM_STATUS Register (32-bit):
Bit 31    Bit 16    Bit 8     Bit 0
  |         |         |         |
  v         v         v         v
+----+----+----+----+----+----+----+----+
| ME | PFP| BCI| SX | TA | TC |GUI |IDLE|
+----+----+----+----+----+----+----+----+
  31   30   27   26   14   13   2    0

Read GUI_ACTIVE bit (bit 2):
  val = RREG32(mmGRBM_STATUS)
  gui_active = (val & GRBM_STATUS__GUI_ACTIVE_MASK)
             >> GRBM_STATUS__GUI_ACTIVE__SHIFT

Set SOFT_RESET bit (bit 20):
  val = RREG32(mmGRBM_SOFT_RESET)
  val |= GRBM_SOFT_RESET__SOFT_RESET_CP_MASK
  WREG32(mmGRBM_SOFT_RESET, val)`,
            caption: "Each bit field in a GPU register has corresponding MASK and SHIFT macros for precise read/write operations.",
          },
          codeWalk: {
            title: "Register Access Patterns in amdgpu",
            file: "drivers/gpu/drm/amd/amdgpu/gfx_v11_0.c",
            language: "c",
            code: `/* 1. Read register */
u32 tmp = RREG32_SOC15(GC, 0, regCP_MEC_CNTL);

/* 2. Modify specific bit fields (without affecting others) */
tmp = REG_SET_FIELD(tmp, CP_MEC_CNTL, MEC_ME1_HALT, 0); /* Clear HALT bit */
tmp = REG_SET_FIELD(tmp, CP_MEC_CNTL, MEC_ME2_HALT, 0);

/* 3. Write register back */
WREG32_SOC15(GC, 0, regCP_MEC_CNTL, tmp);

/* REG_SET_FIELD macro implementation */
#define REG_SET_FIELD(orig_val, reg, field, field_val) \\
    (((orig_val) & ~REG_FIELD_MASK(reg, field)) | \\
     (((field_val) << reg##__##field##__SHIFT) & \\
      REG_FIELD_MASK(reg, field)))

/* Wait for a register bit to reach a specific value */
r = SOC15_WAIT_ON_RREG(GC, 0, regGRBM_STATUS,
    0, GRBM_STATUS__GUI_ACTIVE_MASK);
if (r)
    dev_err(adev->dev, "GPU not idle after reset\\n");`,
            annotations: [
              "RREG32_SOC15 reads a register from a specified IP block (GC = Graphics Core)",
              "REG_SET_FIELD macro safely modifies a single bit field without affecting other bits",
              "WREG32_SOC15 writes the modified value back to the register",
              "SOC15_WAIT_ON_RREG polls until a register bit reaches the expected value, used for waiting on hardware operations to complete"
            ],
            explanation: "All register accesses in the amdgpu driver use these macros rather than directly manipulating memory addresses. The benefits are: 1) Better code readability — register names appear directly in the code; 2) The macros internally handle MMIO memory barriers; 3) In debug mode, all register accesses can be logged for tracing GPU hang issues.",
          },
          miniLab: {
            title: "Bit Operations Exercise: Parse a GPU Status Register",
            objective: "Use a C program to simulate reading and writing a GPU status register, understanding how bit operations are used in drivers",
            setup: "mkdir -p ~/amd-labs/1-1-3 && cd ~/amd-labs/1-1-3",
            language: "c",
            code: `#include <stdio.h>
#include <stdint.h>

/* Simulate GRBM_STATUS register */
#define GRBM_STATUS__CMDFIFO_AVAIL_MASK    0x0000001FL
#define GRBM_STATUS__CMDFIFO_AVAIL__SHIFT  0
#define GRBM_STATUS__GUI_ACTIVE_MASK       0x80000000L
#define GRBM_STATUS__GUI_ACTIVE__SHIFT     31
#define GRBM_STATUS__CP_BUSY_MASK          0x20000000L
#define GRBM_STATUS__CP_BUSY__SHIFT        29

#define REG_GET_FIELD(val, mask, shift) (((val) & (mask)) >> (shift))
#define REG_SET_FIELD(val, mask, shift, fval) \\
    (((val) & ~(mask)) | (((fval) << (shift)) & (mask)))

int main() {
    /* Simulate a GPU-busy status value */
    uint32_t grbm_status = 0xA0000010;
    printf("GRBM_STATUS = 0x%08X\\n", grbm_status);
    printf("CMDFIFO_AVAIL = %u\\n",
        REG_GET_FIELD(grbm_status, GRBM_STATUS__CMDFIFO_AVAIL_MASK,
                      GRBM_STATUS__CMDFIFO_AVAIL__SHIFT));
    printf("GUI_ACTIVE = %u\\n",
        REG_GET_FIELD(grbm_status, GRBM_STATUS__GUI_ACTIVE_MASK,
                      GRBM_STATUS__GUI_ACTIVE__SHIFT));
    printf("CP_BUSY = %u\\n",
        REG_GET_FIELD(grbm_status, GRBM_STATUS__CP_BUSY_MASK,
                      GRBM_STATUS__CP_BUSY__SHIFT));
    return 0;
}`,
            steps: [
              "Save as lab.c, compile and run: gcc -o lab lab.c && ./lab",
              "Explain the output: what does each bit field in 0xA0000010 represent?",
              "Modify the grbm_status value so that GUI_ACTIVE=0 (GPU idle)",
              "Challenge: implement a function that waits for GUI_ACTIVE to become 0 (polling)"
            ],
            expectedOutput: `GRBM_STATUS = 0xA0000010
CMDFIFO_AVAIL = 16
GUI_ACTIVE = 1
CP_BUSY = 0`,
            hint: "0xA0000010 = 1010 0000 0000 0000 0000 0000 0001 0000 (binary). bit 31 = 1 (GUI_ACTIVE), bit 29 = 0 (CP_BUSY), bits 4:0 = 10000 = 16 (CMDFIFO_AVAIL).",
          },
          debugExercise: {
            title: "Find the Bug in This Code",
            description: "The following code attempts to clear a specific bit in a GPU status register, but the result is incorrect.",
            buggyCode: `uint32_t val = RREG32(mmGRBM_SOFT_RESET);
/* BUG: trying to clear bit 20 */
val = val & 20;
WREG32(mmGRBM_SOFT_RESET, val);`,
            language: "c",
            question: "What is wrong with this code? What consequences would it cause?",
            hint: "val & 20 does not clear bit 20 — it only keeps bits 2 and 4 (because 20 = 0b10100). The correct way to clear bit n is val &= ~(1 << n).",
            answer: "Correct form: val &= ~(1 << 20) or val &= ~GRBM_SOFT_RESET__SOFT_RESET_CP_MASK. val & 20 is actually val & 0x14 (binary 10100), which clears all bits except bits 2 and 4, completely destroying the register's value.",
          },
          interviewQ: {
            question: "In the amdgpu driver, why use RREG32/WREG32 macros instead of directly using readl/writel to access registers?",
            difficulty: "easy",
            hint: "Consider code readability, debugging capability, and hardware abstraction layer design.",
            answer: "RREG32/WREG32 macros provide multiple layers of abstraction: 1) Readability: macro names directly correspond to register names, making code self-documenting; 2) Debug support: in DEBUG mode, all register accesses can be logged, making it easier to trace GPU hang issues; 3) Hardware version adaptation: different GPU generations have different register offsets, and the macros handle these differences internally; 4) MMIO safety: they internally include necessary memory barriers; 5) Error detection: range checks on register addresses can be added inside the macros.",
            amdContext: "When debugging GPU hangs, the amdgpu driver has a register dump feature that prints all critical register values. This feature relies on the unified RREG32 macro interface. AMD interviews frequently ask how to debug GPU hangs — understanding the register access mechanism is fundamental.",
          },
        },
        {
          id: "1-1-4",
          number: "1.1.4",
          title: "Atomic Operations & Memory Ordering",
          titleEn: "Atomic Operations & Memory Ordering",
          duration: 20,
          tags: ["C", "atomic", "memory-order", "concurrency"],
          concept: {
            summary: "On multi-core systems, ordinary read-modify-write operations are not atomic and can lead to race conditions. Atomic operations and memory barriers are the foundation of driver concurrency safety.",
            explanation: [
              "On multi-core CPUs, two cores may simultaneously execute val++. This operation is actually three steps: read val, add 1, write val. If both cores read the same value, each adds 1 and writes back, the final result is incremented by 1 instead of 2. This is a race condition.",
              "Atomic operations guarantee that the entire read-modify-write process cannot be interrupted. The Linux kernel provides the atomic_t type and corresponding functions: atomic_read(), atomic_set(), atomic_inc(), atomic_dec_and_test(), etc. These operations guarantee atomicity at the hardware level.",
              "Memory ordering is a deeper issue: both compiler and CPU may reorder memory accesses to improve performance. In single-threaded programs this is fine, but in multi-threaded or driver-hardware interaction scenarios, reordering can cause serious bugs. Memory barriers prevent this reordering.",
              "In the amdgpu driver, atomic operations are used to manage GPU reference counts (e.g., amdgpu_bo reference counting), track the number of pending GPU commands, and synchronize state between CPU and GPU. Understanding these mechanisms is key to understanding the driver's concurrency model."
            ],
            keyPoints: [
              "atomic_t type guarantees atomicity of read-modify-write operations",
              "atomic_inc_return() returns the new value after the operation",
              "atomic_dec_and_test() decrements by 1 and checks if it becomes 0 (used for reference counting)",
              "smp_mb() is a full memory barrier; smp_rmb()/smp_wmb() are unidirectional barriers",
              "READ_ONCE()/WRITE_ONCE() prevent the compiler from optimizing away seemingly redundant memory accesses"
            ],
          },
          diagram: {
            title: "Race Condition vs Atomic Operation Comparison",
            content: `Race Condition (non-atomic):
  CPU 0              CPU 1
  ─────────────────  ─────────────────
  read val (=5)      read val (=5)
  val = 5 + 1 = 6    val = 5 + 1 = 6
  write val = 6      write val = 6
  Result: val = 6 (Wrong! Should be 7)

Atomic Operation (correct):
  CPU 0              CPU 1
  ─────────────────  ─────────────────
  LOCK               Waiting for lock
  read val (=5)      |
  val = 5 + 1 = 6    |
  write val = 6      |
  UNLOCK             LOCK
                     read val (=6)
                     val = 6 + 1 = 7
                     write val = 7
                     UNLOCK
  Result: val = 7 (Correct!)`,
            caption: "Atomic operations guarantee the indivisibility of read-modify-write through hardware bus locking, avoiding race conditions.",
          },
          codeWalk: {
            title: "Atomic Operation Usage in amdgpu",
            file: "drivers/gpu/drm/amd/amdgpu/amdgpu_fence.c",
            language: "c",
            code: `/* amdgpu_fence.c - GPU fence reference counting */

/* 1. Atomic reference counting */
struct amdgpu_fence {
    struct dma_fence base;  /* Contains refcount: atomic_t */
    struct amdgpu_ring *ring;
    uint64_t seq;
};

/* 2. Increment reference count */
struct amdgpu_fence *amdgpu_fence_ref(struct amdgpu_fence *fence)
{
    dma_fence_get(&fence->base);  /* Internally calls atomic_inc */
    return fence;
}

/* 3. Decrement reference count, free when 0 */
void amdgpu_fence_unref(struct amdgpu_fence **fence)
{
    struct amdgpu_fence *tmp = *fence;
    *fence = NULL;
    if (tmp)
        dma_fence_put(&tmp->base);  /* atomic_dec_and_test + free */
}

/* 4. Wait for GPU completion (memory barrier ensures ordering) */
int amdgpu_fence_wait(struct amdgpu_fence *fence, bool intr)
{
    long r = dma_fence_wait(&fence->base, intr);
    /* smp_mb() ensures memory accesses after fence completion
     * won't be reordered before the wait */
    smp_mb();
    return r < 0 ? r : 0;
}`,
            annotations: [
              "dma_fence internally contains atomic_t refcount, guaranteeing thread-safe reference counting",
              "dma_fence_get internally calls atomic_inc_not_zero, safely incrementing the reference count",
              "dma_fence_put internally calls atomic_dec_and_test, triggering release when count reaches 0",
              "smp_mb() memory barrier ensures GPU completion notification is visible to the CPU before it reads GPU output data"
            ],
            explanation: "GPU fences are the core mechanism for the CPU to wait for GPU operations to complete. In the amdgpu driver, every command submitted to the GPU is associated with a fence. When the GPU completes a command, it notifies the CPU via an interrupt, and the CPU-side fence wait function returns. The entire process requires atomic operations and memory barriers for correctness.",
          },
          miniLab: {
            title: "Atomic Operations Experiment",
            objective: "Observe a race condition, then fix it with atomic operations",
            setup: "mkdir -p ~/amd-labs/1-1-4 && cd ~/amd-labs/1-1-4",
            language: "c",
            code: `#include <stdio.h>
#include <pthread.h>
#include <stdatomic.h>

#define NUM_THREADS 4
#define ITERATIONS  100000

/* Non-atomic counter (has race condition) */
int unsafe_counter = 0;

/* Atomic counter (thread-safe) */
atomic_int safe_counter = 0;

void *unsafe_increment(void *arg) {
    for (int i = 0; i < ITERATIONS; i++)
        unsafe_counter++;  /* Race condition! */
    return NULL;
}

void *safe_increment(void *arg) {
    for (int i = 0; i < ITERATIONS; i++)
        atomic_fetch_add(&safe_counter, 1);  /* Atomic operation */
    return NULL;
}

int main() {
    pthread_t threads[NUM_THREADS];
    int expected = NUM_THREADS * ITERATIONS;

    /* Test non-atomic version */
    for (int i = 0; i < NUM_THREADS; i++)
        pthread_create(&threads[i], NULL, unsafe_increment, NULL);
    for (int i = 0; i < NUM_THREADS; i++)
        pthread_join(threads[i], NULL);
    printf("Unsafe: expected=%d, got=%d, lost=%d\\n",
        expected, unsafe_counter, expected - unsafe_counter);

    /* Test atomic version */
    for (int i = 0; i < NUM_THREADS; i++)
        pthread_create(&threads[i], NULL, safe_increment, NULL);
    for (int i = 0; i < NUM_THREADS; i++)
        pthread_join(threads[i], NULL);
    printf("Safe:   expected=%d, got=%d, lost=%d\\n",
        expected, atomic_load(&safe_counter), expected - atomic_load(&safe_counter));
    return 0;
}`,
            steps: [
              "Save as lab.c, compile and run: gcc -o lab lab.c -lpthread && ./lab",
              "Observe the unsafe_counter result: it differs on each run, and is less than the expected value",
              "Observe the safe_counter result: it equals the expected value every run",
              "Run several times and observe the instability of the unsafe version",
              "Think: in a kernel driver, which data needs atomic operation protection?"
            ],
            expectedOutput: `Unsafe: expected=400000, got=312847, lost=87153
Safe:   expected=400000, got=400000, lost=0`,
            hint: "The unsafe version's result differs on each run because the occurrence of race conditions is non-deterministic. The safe version's result is always exactly 400000.",
          },
          debugExercise: {
            title: "Find the Bug in This Code",
            description: "The following code attempts to implement simple GPU reference counting, but has issues in a multi-threaded environment.",
            buggyCode: `struct gpu_bo {
    int refcount;  /* BUG: should be atomic_t */
    void *vaddr;
};

void gpu_bo_ref(struct gpu_bo *bo) {
    bo->refcount++;  /* Race condition! */
}

void gpu_bo_unref(struct gpu_bo *bo) {
    if (--bo->refcount == 0)  /* Race condition! */
        kfree(bo);
}`,
            language: "c",
            question: "What is wrong with this code? What consequences would it cause?",
            hint: "If two threads call gpu_bo_unref simultaneously, both might see refcount change from 1 to 0, and both call kfree, causing a double free.",
            answer: "Change refcount to atomic_t, using atomic_inc() and atomic_dec_and_test() to guarantee atomicity. In the kernel, this is typically implemented via the kref mechanism: kref_get() increments the reference, kref_put() decrements it and calls the release function when it reaches 0.",
          },
          interviewQ: {
            question: "In the amdgpu driver, how is the lifecycle of a GPU buffer object (BO) managed? Why is reference counting needed?",
            difficulty: "medium",
            hint: "Consider that a GPU BO may be simultaneously referenced by multiple processes and multiple GPU commands.",
            answer: "amdgpu_bo uses ttm_bo_reference() and ttm_bo_unref() to manage reference counts (internally using kref). Reference counting is needed because: 1) A BO may be simultaneously referenced by command queues from multiple processes; 2) The CPU may try to free a BO while the GPU is still using it; 3) Multiple GPU rings may use the same BO simultaneously. Reference counting ensures a BO is only truly freed when all users have released their references, preventing use-after-free issues.",
            amdContext: "amdgpu_bo lifecycle management is a common interview topic at AMD. Interviewers typically ask: if the GPU is still using a BO but user space has already closed the fd, what happens? The answer is: reference counting ensures the BO won't be immediately freed — it waits until the GPU fence completes, which decrements the reference count and eventually triggers the release.",
          },
        },
        {
          id: "1-1-5",
          number: "1.1.5",
          title: "Spinlock vs Mutex",
          titleEn: "Spinlock vs Mutex",
          duration: 20,
          tags: ["C", "spinlock", "mutex", "locking", "concurrency"],
          concept: {
            summary: "The kernel provides two main mutual exclusion mechanisms: spinlocks for short, non-sleepable critical sections, and mutexes for potentially longer critical sections where sleeping is allowed. Choosing the wrong one leads to deadlocks or performance issues.",
            explanation: [
              "Spinlock: when a thread tries to acquire a spinlock that's already held, it busy-waits (spins) on the CPU, continuously checking whether the lock has been released. This means: 1) Code holding a spinlock cannot sleep (otherwise other waiting CPUs spin forever); 2) Spinlocks are suitable for very short critical sections (microsecond scale); 3) Spinlocks must be used in interrupt handlers, since interrupt context cannot sleep.",
              "Mutex: when a thread tries to acquire a mutex that's already held, it is placed on a wait queue and put to sleep, yielding the CPU to other tasks. When the lock is released, the waiting thread is woken up. Mutexes are suitable for longer critical sections but cannot be used in interrupt context.",
              "In the amdgpu driver, both types are used extensively. For example, ring->ring_lock in the amdgpu_device struct is a spinlock, protecting the ring buffer write pointer (a very fast operation); while adev->mn_lock is a mutex, protecting memory notification operations that take longer.",
              "A common error is calling functions that might sleep while holding a spinlock (such as kmalloc with GFP_KERNEL, copy_from_user, etc.). This triggers a kernel BUG because sleeping would cause other CPUs to spin forever, hanging the system."
            ],
            keyPoints: [
              "spinlock: busy-waits, cannot sleep, suitable for interrupt context and extremely short critical sections",
              "mutex: sleep-waits, can sleep, cannot be used in interrupt context",
              "spin_lock_irqsave() acquires the lock while disabling local interrupts, preventing deadlock",
              "lockdep is the kernel's lock dependency detection tool, detecting potential deadlocks at runtime",
              "Cannot call any function that might sleep while holding a spinlock"
            ],
          },
          diagram: {
            title: "Spinlock vs Mutex Behavior Comparison",
            content: `Spinlock:
  CPU 0 (holding lock)  CPU 1 (waiting for lock)
  ─────────────────     ─────────────────────
  spin_lock()           spin_lock()  <- starts spinning
  [critical section]     while(!lock) { /* busy wait */ }
  [critical section]     while(!lock) { /* busy wait */ }
  spin_unlock()         Acquired lock! Enter critical section
  CPU 1 consumes CPU resources the entire time!

Mutex:
  CPU 0 (holding lock)  CPU 1 (waiting for lock)
  ─────────────────     ─────────────────────
  mutex_lock()          mutex_lock()  <- goes to sleep
  [critical section]     [CPU 1 sleeps, yields CPU]
  [critical section]     [CPU 1 sleeps]
  mutex_unlock()        [CPU 1 woken up]
                        Acquired lock! Enter critical section
  CPU 1 doesn't consume CPU, but has wake-up overhead`,
            caption: "Spinlocks are suitable for extremely short critical sections (< 1\u03bcs); mutexes are suitable for longer critical sections (> 1\u03bcs).",
          },
          codeWalk: {
            title: "Lock Usage Patterns in amdgpu",
            file: "drivers/gpu/drm/amd/amdgpu/amdgpu_ring.c",
            language: "c",
            code: `/* 1. Spinlock: protects ring buffer write pointer (extremely short critical section) */
int amdgpu_ring_alloc(struct amdgpu_ring *ring, unsigned ndw)
{
    /* spin_lock protects wptr updates */
    spin_lock(&ring->ring_lock);
    if (ring->count_dw < ndw) {
        spin_unlock(&ring->ring_lock);
        return -ENOMEM;
    }
    ring->count_dw -= ndw;
    ring->wptr += ndw;
    spin_unlock(&ring->ring_lock);
    return 0;
}

/* 2. Mutex: protects GPU initialization (a long operation that may sleep) */
int amdgpu_device_init(struct amdgpu_device *adev, ...)
{
    mutex_init(&adev->lock_reset);
    ...
    mutex_lock(&adev->lock_reset);
    r = amdgpu_hw_init(adev);  /* May sleep */
    mutex_unlock(&adev->lock_reset);
    return r;
}

/* 3. In interrupt context, must use spin_lock_irqsave */
irqreturn_t amdgpu_irq_handler(int irq, void *arg)
{
    unsigned long flags;
    spin_lock_irqsave(&adev->irq.lock, flags);  /* Disable interrupts + lock */
    /* Handle interrupt */
    spin_unlock_irqrestore(&adev->irq.lock, flags);
    return IRQ_HANDLED;
}`,
            annotations: [
              "ring_lock is a spinlock because the ring buffer write pointer update only takes a few instructions",
              "lock_reset is a mutex because GPU initialization may need to wait for hardware response (may sleep)",
              "spin_lock_irqsave saves and disables local CPU interrupts while acquiring the lock, preventing the interrupt handler from competing for the same lock",
              "spin_unlock_irqrestore restores the previously saved interrupt state"
            ],
            explanation: "Choosing the correct lock type is a key skill in driver development. Incorrect choices lead to: 1) Using mutex in interrupt context \u2192 kernel BUG; 2) Calling kmalloc(GFP_KERNEL) while holding spinlock \u2192 potential deadlock; 3) Using mutex for extremely short operations \u2192 unnecessary context switch overhead.",
          },
          miniLab: {
            title: "Lock Usage Experiment",
            objective: "Simulate kernel lock mechanisms using user-space pthreads to understand the performance differences between spinlocks and mutexes",
            setup: "mkdir -p ~/amd-labs/1-1-5 && cd ~/amd-labs/1-1-5",
            language: "c",
            code: `#include <stdio.h>
#include <pthread.h>
#include <stdatomic.h>
#include <time.h>

#define ITERATIONS 1000000

/* Simulated spinlock */
atomic_flag spinlock = ATOMIC_FLAG_INIT;
void spin_lock(atomic_flag *lock) {
    while (atomic_flag_test_and_set(lock)) { /* busy wait */ }
}
void spin_unlock(atomic_flag *lock) {
    atomic_flag_clear(lock);
}

/* Mutex */
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

long long spin_counter = 0;
long long mutex_counter = 0;

void *spin_thread(void *arg) {
    for (int i = 0; i < ITERATIONS; i++) {
        spin_lock(&spinlock);
        spin_counter++;
        spin_unlock(&spinlock);
    }
    return NULL;
}

void *mutex_thread(void *arg) {
    for (int i = 0; i < ITERATIONS; i++) {
        pthread_mutex_lock(&mutex);
        mutex_counter++;
        pthread_mutex_unlock(&mutex);
    }
    return NULL;
}

double time_test(void *(*fn)(void *), int nthreads) {
    pthread_t threads[4];
    struct timespec start, end;
    clock_gettime(CLOCK_MONOTONIC, &start);
    for (int i = 0; i < nthreads; i++)
        pthread_create(&threads[i], NULL, fn, NULL);
    for (int i = 0; i < nthreads; i++)
        pthread_join(threads[i], NULL);
    clock_gettime(CLOCK_MONOTONIC, &end);
    return (end.tv_sec - start.tv_sec) * 1000.0 +
           (end.tv_nsec - start.tv_nsec) / 1e6;
}

int main() {
    double t1 = time_test(spin_thread, 2);
    double t2 = time_test(mutex_thread, 2);
    printf("Spinlock:  %.1f ms, counter=%lld\\n", t1, spin_counter);
    printf("Mutex:     %.1f ms, counter=%lld\\n", t2, mutex_counter);
    return 0;
}`,
            steps: [
              "Save as lab.c, compile and run: gcc -O2 -o lab lab.c -lpthread && ./lab",
              "Compare the performance difference between spinlock and mutex",
              "Modify to use 4 threads and observe performance changes under increased contention",
              "Think about: in what situations is spinlock faster than mutex?"
            ],
            expectedOutput: `Spinlock:  245.3 ms, counter=2000000
Mutex:     312.7 ms, counter=2000000`,
            hint: "Under heavy contention, spinlock consumes more CPU due to busy-waiting, but avoids the overhead of context switches. For extremely short critical sections, spinlock is usually faster.",
          },
          debugExercise: {
            title: "Find the Bug in This Code",
            description: "The following kernel code triggers a kernel BUG under certain conditions. Find the problem.",
            buggyCode: `spinlock_t lock;

void driver_work_handler(struct work_struct *work)
{
    spin_lock(&lock);
    
    /* BUG: kmalloc with GFP_KERNEL may sleep! */
    void *buf = kmalloc(4096, GFP_KERNEL);
    if (!buf) {
        spin_unlock(&lock);
        return;
    }
    
    /* Process data */
    kfree(buf);
    spin_unlock(&lock);
}`,
            language: "c",
            question: "What is wrong with this code? What consequences would it cause?",
            hint: "kmalloc(GFP_KERNEL) may trigger memory reclamation when memory is low, causing the current process to sleep. Sleeping while holding a spinlock is not allowed and triggers the kernel BUG: scheduling while atomic.",
            answer: "Solutions: 1) Move the kmalloc before the spin_lock; 2) Use the GFP_ATOMIC flag (won't sleep, but may fail); 3) Change the spinlock to a mutex (if this function is not called from interrupt context). Best practice is to allocate all needed memory before acquiring the lock.",
          },
          interviewQ: {
            question: "In the amdgpu driver, when should you use a spinlock, and when should you use a mutex? Give specific examples.",
            difficulty: "medium",
            hint: "Consider interrupt context, critical section length, and whether sleeping is possible.",
            answer: "Use spinlock: 1) In interrupt handlers (irq handler), because interrupt context cannot sleep; 2) Protecting extremely short critical sections, such as ring buffer write pointer updates (a few instructions); 3) In softirq or tasklet context. Use mutex: 1) Protecting operations that may need to wait for hardware response, such as GPU initialization; 2) Protecting operations that need memory allocation; 3) Protecting user-space ioctl handling (can sleep). Examples in amdgpu: ring->ring_lock (spinlock) protects ring write pointer; adev->lock_reset (mutex) protects the GPU reset flow.",
            amdContext: "AMD interviews frequently ask about lock selection, especially in the GPU hang recovery (GPU reset) scenario, where coordination between interrupt context and process context is needed, making lock choice critical.",
          },
        },
      ],
    },
    {
      id: "1-2",
      number: "1.2",
      title: "Linux Toolchain",
      titleEn: "Linux Toolchain",
      icon: "\ud83d\udd27",
      description: "Master the daily tools for kernel development: from building kernel modules to debugging and submitting patches.",
      lessons: [
        {
          id: "1-2-1",
          number: "1.2.1",
          title: "Kernel Source Tree Structure",
          titleEn: "Kernel Source Tree Structure",
          duration: 10,
          tags: ["kernel", "source", "navigation"],
          concept: {
            summary: "The Linux kernel source tree has a strict directory structure; understanding this structure is the foundation for quickly locating amdgpu-related code.",
            explanation: [
              "The Linux kernel source tree is a massive project containing millions of lines of code. But it has a very clear directory structure: arch/ contains architecture-specific code, drivers/ contains all drivers, fs/ contains filesystems, mm/ contains memory management, net/ contains the networking stack, and kernel/ contains the core scheduler and system calls.",
              "For AMD GPU driver developers, the most important directory is drivers/gpu/drm/amd/. This directory contains all of the amdgpu driver code, further divided into subdirectories: amdgpu/ (main driver), display/ (display controller), amdkfd/ (ROCm kernel interface), pm/ (power management), and others.",
              "The kernel uses Kconfig and Makefile systems to manage build configuration. Each directory has a Kconfig file (defining configuration options) and a Makefile (defining compilation rules). Understanding these two files is the foundation for adding new files to the kernel build system.",
              "Tools like cscope or ctags enable rapid navigation within the kernel source. A more modern approach is to use the clangd language server (which requires first generating compile_commands.json), providing code completion and navigation in VS Code or Neovim."
            ],
            keyPoints: [
              "drivers/gpu/drm/amd/ is the AMD GPU driver root directory",
              "amdgpu/ contains the main driver; amdkfd/ contains the ROCm kernel interface",
              "include/uapi/drm/ contains the user-space visible DRM API header files",
              "make scripts/clang-tools generates compile_commands.json for IDE support"
            ],
          },
          diagram: {
            title: "Kernel Source Tree Structure for AMD GPU",
            content: `linux/
+-- drivers/
|   +-- gpu/
|       +-- drm/                   <- DRM subsystem
|           +-- amd/               <- AMD GPU driver root directory
|           |   +-- amdgpu/        <- Main GPU driver (where you spend most time)
|           |   |   +-- amdgpu_device.c  <- Device initialization
|           |   |   +-- amdgpu_ring.c    <- Command ring buffer
|           |   |   +-- amdgpu_fence.c   <- GPU synchronization fence
|           |   |   +-- amdgpu_vm.c      <- GPU virtual memory management
|           |   |   +-- amdgpu_cs.c      <- Command submission
|           |   |   +-- display/         <- Display controller (DC)
|           |   +-- amdkfd/      <- ROCm kernel driver (KFD)
|           |   +-- pm/          <- Power management
|           +-- drm_drv.c        <- DRM core
+-- include/
    +-- uapi/drm/
    |   +-- amdgpu_drm.h          <- User-space API
    +-- drm/
        +-- drm_drv.h             <- DRM kernel API`,
            caption: "AMD GPU driver code is distributed across multiple subdirectories under drivers/gpu/drm/amd/, each responsible for a different functional module.",
          },
          codeWalk: {
            title: "The amdgpu Directory Makefile — Understanding the Build System",
            file: "drivers/gpu/drm/amd/amdgpu/Makefile",
            language: "makefile",
            code: `# drivers/gpu/drm/amd/amdgpu/Makefile

# 1. Define module name
obj-$(CONFIG_DRM_AMDGPU) += amdgpu.o

# 2. List all source files (excerpt)
amdgpu-y := amdgpu_drv.o \\
            amdgpu_device.o \\
            amdgpu_ring.o \\
            amdgpu_fence.o \\
            amdgpu_vm.o \\
            amdgpu_cs.o \\
            amdgpu_gem.o

# 3. Conditional compilation (only compile KFD interface when ROCm is supported)
amdgpu-$(CONFIG_HSA_AMD) += amdgpu_amdkfd.o

# 4. Include subdirectories
include $(src)/display/Makefile`,
            annotations: [
              "obj-$(CONFIG_DRM_AMDGPU) means this module is only compiled when the kernel is configured with DRM_AMDGPU",
              "amdgpu-y lists all source files that need to be compiled into amdgpu.ko",
              "amdgpu-$(CONFIG_HSA_AMD) conditionally adds files based on the HSA_AMD configuration",
              "include pulls in subdirectory Makefiles, so display subsystem files are also compiled"
            ],
            explanation: "Understanding the Makefile is the foundation for adding new files to the amdgpu driver. When you create a new .c file, you need to add it to the amdgpu-y list in the Makefile, or the kernel build system won't compile it.",
          },
          miniLab: {
            title: "Explore the amdgpu Source Tree",
            objective: "Learn to use command-line tools for quickly navigating the amdgpu source code and finding key function definitions",
            setup: "# Clone kernel source (only latest commit to save time)\ngit clone --depth=1 https://github.com/torvalds/linux.git\ncd linux",
            language: "bash",
            code: `# 1. View the amdgpu directory structure
ls drivers/gpu/drm/amd/amdgpu/ | head -30

# 2. Count amdgpu lines of code
find drivers/gpu/drm/amd/ -name '*.c' | xargs wc -l | tail -1

# 3. Search for a function definition
grep -rn 'int amdgpu_device_init' drivers/gpu/drm/amd/

# 4. Find all places that call amdgpu_ring_alloc
grep -rn 'amdgpu_ring_alloc' drivers/gpu/drm/amd/ | grep -v '.h:'

# 5. Generate compile_commands.json (for IDE support)
make defconfig
bear -- make -j$(nproc) drivers/gpu/drm/amd/

# 6. Build cscope index
find drivers/gpu/drm/amd/ -name '*.[ch]' > cscope.files
cscope -b -q -k
# Then in vim: :cs find g amdgpu_device_init`,
            steps: [
              "Clone the kernel source (--depth=1 gets only the latest commit, saving time and space)",
              "Use ls to view the amdgpu directory and understand the file organization",
              "Use grep -rn to search for function definitions — this is the most common code navigation method",
              "Count lines of code to get a sense of the amdgpu driver's scale",
              "Try to find the amdgpu_device_init function and read the first 50 lines"
            ],
            expectedOutput: `# ls output: amdgpu_device.c, amdgpu_ring.c, amdgpu_fence.c ...
# wc -l output: approximately 500,000 lines of code
# grep output: drivers/gpu/drm/amd/amdgpu/amdgpu_device.c:1234:int amdgpu_device_init(...)`,
            hint: "grep -rn is the fastest way to search code. -r means recursive search, -n shows line numbers. For large projects, you can use ripgrep (rg) instead of grep — it's 10x faster.",
          },
          debugExercise: {
            title: "Find the Bug in This Code",
            description: "A developer wants to add a new debug file amdgpu_debug_new.c to amdgpu, but after compiling it wasn't included in the kernel module. Find the cause.",
            buggyCode: `# Developer created the file
touch drivers/gpu/drm/amd/amdgpu/amdgpu_debug_new.c

# But forgot to modify the Makefile
# drivers/gpu/drm/amd/amdgpu/Makefile does not contain:
# amdgpu-y += amdgpu_debug_new.o`,
            language: "c",
            question: "What is wrong with this code? What consequences would it cause?",
            hint: "The kernel build system only compiles files explicitly listed in the Makefile. After creating a .c file, you must add the corresponding .o file to the Makefile for it to be compiled.",
            answer: "Add amdgpu_debug_new.o to the amdgpu-y list in drivers/gpu/drm/amd/amdgpu/Makefile. Then re-run make drivers/gpu/drm/amd/amdgpu/ to compile.",
          },
          interviewQ: {
            question: "How would you quickly find the code in the amdgpu driver that handles GPU hang detection? Describe your search strategy.",
            difficulty: "easy",
            hint: "Consider using grep to search for keywords, and how to trace from one function to related call chains.",
            answer: "Search strategy: 1) grep -rn 'gpu_hang\\|gpu hang\\|amdgpu_gpu_recovery' drivers/gpu/drm/amd/ to find relevant functions; 2) Find amdgpu_device_gpu_recover() — this is the entry point for GPU hang recovery; 3) Look at where it's called: grep -rn 'gpu_recover' to find trigger points; 4) Read amdgpu_job_timedout() — this is the entry point for timeout detection; 5) Use cscope or ctags to trace function call chains. Key files: amdgpu_device.c (recovery logic), amdgpu_job.c (timeout detection).",
            amdContext: "AMD interviews frequently ask about GPU hang handling flow. Knowing where the code lives in the source tree and being able to quickly locate relevant code is a fundamental skill for engineers' daily work.",
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Can explain pointer arithmetic and how the container_of macro works',
    'Can describe the impact of struct alignment and padding on drivers',
    'Can correctly use bit operations to read/write GPU registers',
    'Can distinguish between atomic operations and spinlock/mutex use cases',
    'Can compile kernel modules with make and load them with insmod',
    'Can perform kernel debugging using printk/dmesg',
    'Can explain CPU cache lines and the MESI protocol',
    'Can describe virtual memory and the page table walk process',
    'Can write a simple PCI driver template',
    'Can generate kernel patches using git format-patch',
  ],
};

export default module1MicroLessonsEn;