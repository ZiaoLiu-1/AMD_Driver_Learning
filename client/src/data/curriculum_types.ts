/* ============================================================
   Curriculum shared types & small constants
   Must stay free of heavy data imports: pages import from here
   without pulling the full curriculum into their chunk.
   ============================================================ */

export type {
  SubModule,
  Module,
  TheoryContent,
  TheorySection,
  DiagramContent,
  BookReference,
  OnlineResource,
  CodeContent,
  ProjectContent,
  InterviewQuestion,
  GlossaryTerm,
} from "./curriculum";

export const difficultyColors = {
  beginner: "text-success",
  intermediate: "text-info",
  advanced: "text-primary",
  expert: "text-destructive",
};
