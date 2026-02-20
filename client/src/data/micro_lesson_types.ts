// ============================================================
// AMD Linux Driver Learning Platform - Micro-Lesson Type Definitions
// Unified type definitions matching all generated data files.
// Each micro-lesson is a 10-20 minute focused unit with 6 sections:
// Concept → Diagram → Code Walk → Mini Lab → Debug Exercise → Interview Q
//
// Three data formats are supported:
//   Format A (Module 1): lesson.concept.{summary, explanation[], keyPoints[]}
//                        lesson.interviewQ, lesson.debugExercise.answer
//   Format B (Module 2 group1/2): lesson.concept.{summary, keyPoints[]}
//                                 lesson.interviewQuestion, lesson.debugExercise.solution
//   Format C (Module 2 group3): lesson.summary, lesson.keyPoints[] (flat)
//                               lesson.interviewQuestion, lesson.debugExercise.solution
// ============================================================

export interface MicroLesson {
  id: string;
  title: string;
  titleEn?: string;
  number?: string;
  duration: number | string;
  difficulty?: string;
  tags?: string[];

  // Format A & B: concept nested object
  concept?: {
    summary: string;
    explanation?: string[];
    keyPoints: string[];
  };

  // Format C: flat summary/keyPoints at lesson level
  summary?: string;
  keyPoints?: string[];

  // ASCII diagram
  diagram: {
    title: string;
    content: string;
    caption?: string;
  };

  // Annotated kernel code snippet
  codeWalk: {
    title: string;
    language: string;
    code: string;
    file?: string;
    annotations?: string[];
    explanation: string;
  };

  // Hands-on lab exercise
  miniLab: {
    title: string;
    objective?: string;
    setup?: string;
    language?: string;
    code?: string;
    steps?: string[];
    expectedOutput?: string;
    hint?: string;
  };

  // Find-the-bug challenge
  debugExercise: {
    title: string;
    language: string;
    description?: string;
    question: string;
    buggyCode: string;
    hint: string;
    answer?: string;    // Format A
    solution?: string;  // Format B & C
  };

  // AMD Interview question (Format A uses interviewQ, B & C use interviewQuestion)
  interviewQ?: {
    question: string;
    difficulty?: string;
    hint: string;
    answer: string;
    amdContext?: string;
  };
  interviewQuestion?: {
    question: string;
    difficulty?: string;
    hint: string;
    answer: string;
  };

  // Completion checklist (Format B & C: per-lesson; Format A: module-level)
  completionChecklist?: string[];
}

export interface MicroLessonGroup {
  id?: string;
  groupId?: string;
  number?: string;
  title?: string;
  groupTitle?: string;
  titleEn?: string;
  icon?: string;
  description?: string;
  groupDescription?: string;
  lessons: MicroLesson[];
}

export interface MicroLessonModule {
  moduleId: string;
  groupId?: string;
  groupTitle?: string;
  groupDescription?: string;
  groups?: MicroLessonGroup[];
  lessons?: MicroLesson[];
  completionChecklist?: string[];
}
