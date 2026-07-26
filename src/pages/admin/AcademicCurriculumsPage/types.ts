export interface Curriculum {
  curriculumId: number;
  curriculumCode: string;
  curriculumName: string;
}

export interface CurriculumSubject {
  id: number;
  curriculum?: Curriculum;
  subject?: Subject;
  studyYearNo: number;
  semesterNo: number;
  required: boolean;
  recommendedOrder?: number;
}

export interface Subject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
}

export interface CurriculumFormErrors {
  code?: string;
  name?: string;
}

export interface AssignFormErrors {
  subjectId?: string;
  studyYearNo?: string;
  semesterNo?: string;
  recommendedOrder?: string;
}
