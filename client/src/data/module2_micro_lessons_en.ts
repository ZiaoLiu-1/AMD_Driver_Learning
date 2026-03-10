// ============================================================
// AMD Linux Driver Learning Platform - Module 2 Micro-Lessons (English)
// Module 2: Hardware Interface Basics
// Merges module2_group1_en, module2_group2_en, module2_group3_en
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';
import { module2Group1En } from './module2_group1_en';
import { module2Group2En } from './module2_group2_en';
import { module2Group3En } from './module2_group3_en';

export const module2MicroLessonsEn: MicroLessonModule = {
    moduleId: 'hardware',
    groups: [
        {
            id: module2Group1En.id || 'hardware-pcie',
            title: module2Group1En.title || 'PCIe Protocol Basics',
            description: module2Group1En.description || '',
            lessons: module2Group1En.lessons,
        },
        {
            id: module2Group2En.id || 'hardware-kernel-driver',
            title: module2Group2En.title || 'Kernel PCI Driver Development',
            description: module2Group2En.description || '',
            lessons: module2Group2En.lessons,
        },
        {
            id: module2Group3En.groupId || 'hardware-gpu-internals',
            title: module2Group3En.groupTitle || 'GPU Memory & Device Management',
            description: module2Group3En.groupDescription || '',
            lessons: module2Group3En.lessons || [],
        },
    ],
    completionChecklist: [
        'Can explain PCIe BDF addressing and BAR mapping mechanisms',
        'Can write a complete PCI driver skeleton (probe/remove)',
        'Understand the difference between DMA coherent and streaming DMA',
        'Can configure MSI-X interrupts and write interrupt handlers',
        'Understand AMDGPU\'s three memory domains (VRAM/GTT/System)',
        'Can query GPU memory usage via sysfs',
        'Understand how Command Ring Buffers work',
        'Can explain the GPU firmware loading process',
    ],
};
