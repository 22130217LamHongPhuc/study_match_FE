import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Cohort } from "./types";
import { Curriculum } from "../AcademicCurriculumsPage/types";
import { CohortToolbar } from "./components/CohortToolbar";
import { CohortTable } from "./components/CohortTable";
import { AddEditCohortModal } from "./components/AddEditCohortModal";
import { DeleteCohortModal } from "./components/DeleteCohortModal";
import {
  getAdminCohorts,
  createCohort,
  updateCohort,
  deleteCohort,
  getAdminCurriculums,
} from "../../../services/AdminAcademicService";

export function AcademicCohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);

  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);

  // Fetch cohorts list
  useEffect(() => {
    let active = true;
    const fetchCohortsList = async () => {
      try {
        setLoading(true);
        const res = await getAdminCohorts();
        if (!active) return;

        if (res.success && res.data) {
          setCohorts(res.data || []);
        } else {
          setCohorts([]);
          toast.error(res.message || "Không thể tải danh sách khóa học");
        }
      } catch {
        toast.error("Có lỗi xảy ra khi kết nối server");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCohortsList();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  // Fetch curriculums for dropdown select options
  useEffect(() => {
    const fetchCurriculumsList = async () => {
      try {
        const res = await getAdminCurriculums();
        if (res.success && res.data) {
          setCurriculums(res.data || []);
        }
      } catch {
        console.error("Lỗi khi tải danh sách chương trình đào tạo cho khóa học");
      }
    };

    fetchCurriculumsList();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCohort(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setAddEditModalOpen(true);
  };

  const handleSaveCohort = async (payload: {
    cohortCode: string;
    startAcademicYear: number;
    totalStudyYears: number;
    curriculumId: number;
  }): Promise<boolean> => {
    try {
      let res;
      if (editingCohort) {
        res = await updateCohort(editingCohort.cohortId, payload);
      } else {
        res = await createCohort(payload);
      }

      if (res.success) {
        toast.success(editingCohort ? "Cập nhật khóa học thành công" : "Thêm khóa học thành công");
        setRefreshTrigger((prev) => prev + 1);
        return true;
      } else {
        toast.error(res.message || "Lưu thông tin khóa học thất bại");
        return false;
      }
    } catch {
      toast.error("Có lỗi xảy ra khi kết nối server");
      return false;
    }
  };

  const handleDeleteCohort = async () => {
    if (deleteConfirmOpen === null) return;
    try {
      setLoading(true);
      const res = await deleteCohort(deleteConfirmOpen);
      if (res.success) {
        toast.success("Xóa khóa học thành công");
        setDeleteConfirmOpen(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        // Display warning blocking delete due to student profile references
        toast.error(res.message || "Không thể xóa khóa học này do ràng buộc dữ liệu");
      }
    } catch {
      toast.error("Lỗi khi gửi yêu cầu xóa lên server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <CohortToolbar onAddClick={handleOpenAddModal} />

      <CohortTable
        cohorts={cohorts}
        loading={loading}
        onEditClick={handleOpenEditModal}
        onDeleteClick={(id) => setDeleteConfirmOpen(id)}
      />

      <AddEditCohortModal
        open={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        editingCohort={editingCohort}
        curriculums={curriculums}
        onSave={handleSaveCohort}
      />

      <DeleteCohortModal
        open={deleteConfirmOpen !== null}
        onClose={() => setDeleteConfirmOpen(null)}
        onConfirm={handleDeleteCohort}
      />
    </main>
  );
}

export default AcademicCohortsPage;
