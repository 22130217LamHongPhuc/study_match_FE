import { Curriculum } from "../AcademicCurriculumsPage/types";

export interface Cohort {
  cohortId: number;
  cohortCode: string;
  startAcademicYear: number;
  totalStudyYears: number;
  curriculum?: Curriculum;
}

export interface CohortFormErrors {
  code?: string;
  startYear?: string;
  curriculumId?: string;
}
