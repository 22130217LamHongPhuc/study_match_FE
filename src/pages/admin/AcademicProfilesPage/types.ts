import { Cohort } from "../AcademicCohortsPage/types";

export interface StudentProfile {
  profileId: number;
  userId: number;
  studentCode: string;
  fullName: string;
  avatarUrl?: string;
  gender?: string;
  ageGroup?: string;
  region?: string;
  cohort?: Cohort;
  createdAt?: string;
}

export interface StudentTermProfileDetail {
  id: number;
  userId: number;
  term?: {
    termId: number;
    academicYearStart: number;
    academicYearEnd: number;
    semesterNo: number;
    fullName: string;
    status: string;
  };
  studyYearNo: number;
  semesterNo: number;
  avgScore?: number;
  studiedCredits?: number;
  studyGoal?: string;
  studyMode?: string;
  mainSubjectId?: number;
  mainSubjectName?: string;
}

export interface ProfileFormErrors {
  studentCode?: string;
  fullName?: string;
}
