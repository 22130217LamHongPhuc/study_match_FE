import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Curriculum, CurriculumSubject, Subject } from "./types";
import { CurriculumToolbar } from "./components/CurriculumToolbar";
import { CurriculumList } from "./components/CurriculumList";
import { CurriculumDetail } from "./components/CurriculumDetail";
import { AddEditCurriculumModal } from "./components/AddEditCurriculumModal";
import { AssignSubjectModal } from "./components/AssignSubjectModal";
import { DeleteCurriculumModal } from "./components/DeleteCurriculumModal";
import { RemoveSubjectConfirmModal } from "./components/RemoveSubjectConfirmModal";
import {
  getAdminCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  getCurriculumSubjects,
  addSubjectToCurriculum,
  removeSubjectFromCurriculum,
  getAdminSubjects,
} from "../../../services/AdminAcademicService";

export function AcademicCurriculumsPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mappedSubjects, setMappedSubjects] = useState<CurriculumSubject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);
  const [removeSubjectConfirmOpen, setRemoveSubjectConfirmOpen] = useState(false);
  const [pendingRemoveSubject, setPendingRemoveSubject] = useState<{ id: number; name: string } | null>(null);

  // Target states
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [assignDefaultYear, setAssignDefaultYear] = useState(1);
  const [assignDefaultSemester, setAssignDefaultSemester] = useState(1);

  // Fetch curriculums list
  useEffect(() => {
    let active = true;
    const fetchCurriculums = async () => {
      try {
        setLoadingList(true);
        const res = await getAdminCurriculums();
        if (!active) return;

        if (res.success && res.data) {
          const list = res.data || [];
          setCurriculums(list);
          if (list.length > 0 && selectedId === null) {
            setSelectedId(list[0].curriculumId);
          }
        } else {
          toast.error(res.message || "Không thể tải danh sách chương trình");
        }
      } catch {
        toast.error("Có lỗi xảy ra khi kết nối server");
      } finally {
        if (active) setLoadingList(false);
      }
    };

    fetchCurriculums();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  // Fetch mapped subjects of selected curriculum
  useEffect(() => {
    if (selectedId === null) {
      setMappedSubjects([]);
      return;
    }

    let active = true;
    const fetchDetails = async () => {
      try {
        setLoadingDetail(true);
        const res = await getCurriculumSubjects(selectedId);
        if (!active) return;

        if (res.success && res.data) {
          setMappedSubjects(res.data || []);
        } else {
          setMappedSubjects([]);
          toast.error(res.message || "Không thể tải chi tiết lộ trình môn học");
        }
      } catch {
        toast.error("Lỗi khi kết nối tải thông tin lộ trình");
      } finally {
        if (active) setLoadingDetail(false);
      }
    };

    fetchDetails();
    return () => {
      active = false;
    };
  }, [selectedId]);

  // Fetch all subjects for assigning select box (fetch a large size to show all)
  useEffect(() => {
    const fetchAllSubjectsList = async () => {
      try {
        const res = await getAdminSubjects(0, 1000, "");
        if (res.success && res.data) {
          setAllSubjects(res.data.content || []);
        }
      } catch {
        console.error("Lỗi khi tải danh sách môn học cho dropdown");
      }
    };

    fetchAllSubjectsList();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCurriculum(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (curriculum: Curriculum) => {
    setEditingCurriculum(curriculum);
    setAddEditModalOpen(true);
  };

  const handleSaveCurriculum = async (code: string, name: string): Promise<boolean> => {
    try {
      const payload = {
        curriculumCode: code,
        curriculumName: name,
      };

      let res;
      if (editingCurriculum) {
        res = await updateCurriculum(editingCurriculum.curriculumId, payload);
      } else {
        res = await createCurriculum(payload);
      }

      if (res.success) {
        toast.success(editingCurriculum ? "Cập nhật chương trình thành công" : "Thêm chương trình thành công");
        setRefreshTrigger((prev) => prev + 1);
        if (!editingCurriculum && res.data) {
          setSelectedId(res.data.curriculumId);
        }
        return true;
      } else {
        toast.error(res.message || "Lưu thông tin thất bại");
        return false;
      }
    } catch {
      toast.error("Có lỗi xảy ra khi kết nối server");
      return false;
    }
  };

  const handleDeleteCurriculum = async () => {
    if (deleteConfirmOpen === null) return;
    try {
      const res = await deleteCurriculum(deleteConfirmOpen);
      if (res.success) {
        toast.success("Xóa chương trình đào tạo thành công");
        if (selectedId === deleteConfirmOpen) {
          setSelectedId(null);
          // Set to next active or null
          const remaining = curriculums.filter(c => c.curriculumId !== deleteConfirmOpen);
          if (remaining.length > 0) {
            setSelectedId(remaining[0].curriculumId);
          }
        }
        setDeleteConfirmOpen(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(res.message || "Không thể xóa chương trình đào tạo");
      }
    } catch {
      toast.error("Lỗi khi kết nối xóa dữ liệu");
    }
  };

  const handleOpenAssignModal = (year: number, semester: number) => {
    setAssignDefaultYear(year);
    setAssignDefaultSemester(semester);
    setAssignModalOpen(true);
  };

  const handleAssignSubject = async (mapping: {
    studyYearNo: number;
    semesterNo: number;
    subjectId: number;
    isRequired: boolean;
    recommendedOrder?: number;
  }): Promise<boolean> => {
    if (selectedId === null) return false;
    try {
      const res = await addSubjectToCurriculum(selectedId, mapping);
      if (res.success) {
        toast.success("Gán môn học thành công");
        // Reload details
        const detailsRes = await getCurriculumSubjects(selectedId);
        if (detailsRes.success) {
          setMappedSubjects(detailsRes.data || []);
        }
        return true;
      } else {
        toast.error(res.message || "Gán môn học thất bại");
        return false;
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
      return false;
    }
  };

  const handleOpenRemoveSubjectConfirm = (subjectId: number, subjectName: string) => {
    setPendingRemoveSubject({ id: subjectId, name: subjectName });
    setRemoveSubjectConfirmOpen(true);
  };

  const handleRemoveSubject = async () => {
    if (selectedId === null || pendingRemoveSubject === null) return;
    try {
      const res = await removeSubjectFromCurriculum(selectedId, pendingRemoveSubject.id);
      if (res.success) {
        toast.success("Gỡ môn học khỏi lộ trình thành công");
        setRemoveSubjectConfirmOpen(false);
        setPendingRemoveSubject(null);
        // Reload details
        const detailsRes = await getCurriculumSubjects(selectedId);
        if (detailsRes.success) {
          setMappedSubjects(detailsRes.data || []);
        }
      } else {
        toast.error(res.message || "Không thể gỡ môn học");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const getSelectedCurriculumName = () => {
    const selected = curriculums.find((c) => c.curriculumId === selectedId);
    return selected ? selected.curriculumName : "";
  };

  return (
    <main className="space-y-6">
      <CurriculumToolbar onAddCurriculumClick={handleOpenAddModal} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - List of Curriculums */}
        <div className="lg:col-span-1">
          <CurriculumList
            curriculums={curriculums}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEdit={handleOpenEditModal}
            onDelete={(id) => setDeleteConfirmOpen(id)}
            loading={loadingList}
          />
        </div>

        {/* Right Column - Subject Details Mappings */}
        <div className="lg:col-span-2">
          {selectedId !== null ? (
            <CurriculumDetail
              curriculumName={getSelectedCurriculumName()}
              subjects={mappedSubjects}
              loading={loadingDetail}
              onAssignSubject={handleOpenAssignModal}
              onRemoveSubject={handleOpenRemoveSubjectConfirm}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-sand-200 bg-white text-center text-sm text-sand-500">
              Chưa chọn chương trình đào tạo nào để hiển thị chi tiết.
            </div>
          )}
        </div>
      </div>

      <AddEditCurriculumModal
        open={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        editingCurriculum={editingCurriculum}
        onSave={handleSaveCurriculum}
      />

      <AssignSubjectModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        allSubjects={allSubjects}
        defaultYear={assignDefaultYear}
        defaultSemester={assignDefaultSemester}
        onAssign={handleAssignSubject}
      />

      <DeleteCurriculumModal
        open={deleteConfirmOpen !== null}
        onClose={() => setDeleteConfirmOpen(null)}
        onConfirm={handleDeleteCurriculum}
      />

      <RemoveSubjectConfirmModal
        open={removeSubjectConfirmOpen}
        onClose={() => {
          setRemoveSubjectConfirmOpen(false);
          setPendingRemoveSubject(null);
        }}
        onConfirm={handleRemoveSubject}
        subjectName={pendingRemoveSubject?.name || ""}
        curriculumName={getSelectedCurriculumName()}
      />
    </main>
  );
}

export default AcademicCurriculumsPage;
