import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";

// ==========================================
// SUBJECTS MANAGEMENT
// ==========================================

export async function getAdminSubjects(
  page: number,
  size: number,
  search: string
): Promise<APIResponseData<any>> {
  return apiFetch<any>(
    `/admin/subjects?page=${page}&size=${size}&search=${encodeURIComponent(search)}`,
    { method: "GET" }
  );
}

export async function createSubject(subject: {
  subjectCode: string;
  subjectName: string;
}): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/subjects", {
    method: "POST",
    body: JSON.stringify(subject),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateSubject(
  subjectId: number,
  subject: { subjectCode: string; subjectName: string }
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/subjects/${subjectId}`, {
    method: "PUT",
    body: JSON.stringify(subject),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteSubject(subjectId: number): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/subjects/${subjectId}`, {
    method: "DELETE",
  });
}

export async function importSubjects(
  subjectsList: Array<{ subjectCode: string; subjectName: string }>
): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/subjects/import", {
    method: "POST",
    body: JSON.stringify(subjectsList),
    headers: { "Content-Type": "application/json" },
  });
}

// ==========================================
// CURRICULUMS MANAGEMENT
// ==========================================

export async function getAdminCurriculums(): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/curriculums", { method: "GET" });
}

export async function createCurriculum(curriculum: {
  curriculumCode: string;
  curriculumName: string;
}): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/curriculums", {
    method: "POST",
    body: JSON.stringify(curriculum),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateCurriculum(
  id: number,
  curriculum: { curriculumCode: string; curriculumName: string }
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/curriculums/${id}`, {
    method: "PUT",
    body: JSON.stringify(curriculum),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteCurriculum(id: number): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/curriculums/${id}`, { method: "DELETE" });
}

export async function getCurriculumSubjects(id: number): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/curriculums/${id}/subjects`, { method: "GET" });
}

export async function addSubjectToCurriculum(
  id: number,
  mapping: {
    studyYearNo: number;
    semesterNo: number;
    subjectId: number;
    isRequired: boolean;
    recommendedOrder?: number;
  }
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/curriculums/${id}/subjects`, {
    method: "POST",
    body: JSON.stringify(mapping),
    headers: { "Content-Type": "application/json" },
  });
}

export async function removeSubjectFromCurriculum(
  curriculumId: number,
  subjectId: number
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/curriculums/${curriculumId}/subjects/${subjectId}`, {
    method: "DELETE",
  });
}

// ==========================================
// COHORTS MANAGEMENT
// ==========================================

export async function getAdminCohorts(): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/cohorts", { method: "GET" });
}

export async function createCohort(cohort: {
  cohortCode: string;
  startAcademicYear: number;
  totalStudyYears?: number;
  curriculumId: number;
}): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/cohorts", {
    method: "POST",
    body: JSON.stringify(cohort),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateCohort(
  cohortId: number,
  cohort: {
    cohortCode: string;
    startAcademicYear: number;
    totalStudyYears?: number;
    curriculumId: number;
  }
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/cohorts/${cohortId}`, {
    method: "PUT",
    body: JSON.stringify(cohort),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteCohort(cohortId: number): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/cohorts/${cohortId}`, { method: "DELETE" });
}

// ==========================================
// ACADEMIC TERMS MANAGEMENT
// ==========================================

export async function getAdminAcademicTerms(): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/academic-terms", { method: "GET" });
}

export async function createAcademicTerm(term: {
  academicYearStart: number;
  academicYearEnd: number;
  semesterNo: number;
  fullName: string;
  status: string;
}): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/academic-terms", {
    method: "POST",
    body: JSON.stringify(term),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateAcademicTerm(
  termId: number,
  term: {
    academicYearStart: number;
    academicYearEnd: number;
    semesterNo: number;
    fullName: string;
    status: string;
  }
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/academic-terms/${termId}`, {
    method: "PUT",
    body: JSON.stringify(term),
    headers: { "Content-Type": "application/json" },
  });
}

export async function activateAcademicTerm(termId: number): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/academic-terms/${termId}/active`, {
    method: "PUT",
  });
}

// ==========================================
// STUDENT PROFILES MANAGEMENT
// ==========================================

export async function getAdminProfiles(
  page: number,
  size: number,
  search: string,
  cohortId?: number
): Promise<APIResponseData<any>> {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("size", String(size));
  query.set("search", search);
  if (cohortId != null) query.set("cohortId", String(cohortId));

  return apiFetch<any>(`/admin/profiles?${query.toString()}`, {
    method: "GET",
  });
}

export async function getProfileDetail(profileId: number): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/profiles/${profileId}`, { method: "GET" });
}

export async function updateStudentProfile(
  profileId: number,
  profile: {
    cohortId?: number;
    studentCode?: string;
    fullName?: string;
    region?: string;
    gender?: string;
  }
): Promise<APIResponseData<any>> {
  return apiFetch<any>(`/admin/profiles/${profileId}`, {
    method: "PUT",
    body: JSON.stringify(profile),
    headers: { "Content-Type": "application/json" },
  });
}

export async function getAcademicStats(): Promise<APIResponseData<any>> {
  return apiFetch<any>("/admin/profiles/stats", { method: "GET" });
}
