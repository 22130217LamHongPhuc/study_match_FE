export interface AcademicTerm {
  termId: number;
  academicYearStart: number;
  academicYearEnd: number;
  semesterNo: number;
  fullName: string;
  status: string; // active, planned, completed
}

export interface TermFormErrors {
  academicYearStart?: string;
  academicYearEnd?: string;
  semesterNo?: string;
  fullName?: string;
  status?: string;
}
