// ============================================================
// AMD Linux Driver Learning Platform - Module 2 Micro-Lessons
// Module 2: Hardware Interface Basics (硬件接口基础)
// Merges module2_group1, module2_group2, module2_group3
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';
import { module2Group1 } from './module2_group1';
import { module2Group2 } from './module2_group2';
import { module2Group3 } from './module2_group3';

export const module2MicroLessons: MicroLessonModule = {
  moduleId: 'hardware',
  groups: [
    {
      id: module2Group1.id || 'hardware-pcie',
      title: module2Group1.title || 'PCIe 协议基础',
      description: module2Group1.description || '',
      lessons: module2Group1.lessons,
    },
    {
      id: module2Group2.id || 'hardware-kernel-driver',
      title: module2Group2.title || '内核 PCI 驱动开发',
      description: module2Group2.description || '',
      lessons: module2Group2.lessons,
    },
    {
      id: module2Group3.groupId || 'hardware-gpu-internals',
      title: module2Group3.groupTitle || 'GPU 内存与设备管理',
      description: module2Group3.groupDescription || '',
      lessons: module2Group3.lessons || [],
    },
  ],
  completionChecklist: [
    '能解释 PCIe BDF 地址和 BAR 映射机制',
    '能编写一个完整的 PCI 驱动骨架（probe/remove）',
    '理解 DMA coherent 和 streaming DMA 的区别',
    '能配置 MSI-X 中断并编写中断处理函数',
    '理解 AMDGPU 三种内存域（VRAM/GTT/System）',
    '能用 sysfs 查询 GPU 内存使用情况',
    '理解 Command Ring Buffer 的工作原理',
    '能解释 GPU 固件加载流程',
  ],
};
