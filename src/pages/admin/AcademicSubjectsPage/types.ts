export interface Subject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
}

export interface SubjectFormErrors {
  code?: string;
  name?: string;
}
