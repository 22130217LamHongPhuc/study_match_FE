import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AcademicTerm } from "./types";
import { TermToolbar } from "./components/TermToolbar";
import { TermTable } from "./components/TermTable";
import { AddEditTermModal } from "./components/AddEditTermModal";
import { ActivateTermConfirmModal } from "./components/ActivateTermConfirmModal";
import {
  getAdminAcademicTerms,
  createAcademicTerm,
  updateAcademicTerm,
  activateAcademicTerm,
} from "../../../services/AdminAcademicService";

export function AcademicTermsPage() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [activateConfirmOpen, setActivateConfirmOpen] = useState<number | null>(null);

  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);

  // Fetch academic terms list
  useEffect(() => {
    let active = true;
    const fetchTermsList = async () => {
      try {
        setLoading(true);
        const res = await getAdminAcademicTerms();
        if (!active) return;

        if (res.success && res.data) {
          setTerms(res.data || []);
        } else {
          setTerms([]);
          toast.error(res.message || "Không thể tải danh sách học kỳ");
        }
      } catch {
        toast.error("Có lỗi xảy ra khi kết nối server");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTermsList();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const handleOpenAddModal = () => {
    setEditingTerm(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (term: AcademicTerm) => {
    setEditingTerm(term);
    setAddEditModalOpen(true);
  };

  const handleSaveTerm = async (payload: {
    academicYearStart: number;
    academicYearEnd: number;
    semesterNo: number;
    fullName: string;
    status: string;
  }): Promise<boolean> => {
    try {
      let res;
      if (editingTerm) {
        res = await updateAcademicTerm(editingTerm.termId, payload);
      } else {
        res = await createAcademicTerm(payload);
      }

      if (res.success) {
        toast.success(editingTerm ? "Cập nhật học kỳ thành công" : "Tạo học kỳ thành công");
        setRefreshTrigger((prev) => prev + 1);
        return true;
      } else {
        toast.error(res.message || "Lưu thông tin học kỳ thất bại");
        return false;
      }
    } catch {
      toast.error("Có lỗi xảy ra khi kết nối server");
      return false;
    }
  };

  const handleActivateTerm = async () => {
    if (activateConfirmOpen === null) return;
    try {
      setLoading(true);
      const res = await activateAcademicTerm(activateConfirmOpen);
      if (res.success) {
        toast.success("Kích hoạt học kỳ hiện tại thành công");
        setActivateConfirmOpen(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(res.message || "Kích hoạt học kỳ hiện tại thất bại");
      }
    } catch {
      toast.error("Lỗi khi kết nối gửi yêu cầu kích hoạt học kỳ");
    } finally {
      setLoading(false);
    }
  };

  const getTargetTermName = () => {
    if (activateConfirmOpen === null) return "";
    const term = terms.find((t) => t.termId === activateConfirmOpen);
    return term ? term.fullName : "";
  };

  return (
    <main className="space-y-6">
      <TermToolbar onAddClick={handleOpenAddModal} />

      <TermTable
        terms={terms}
        loading={loading}
        onEditClick={handleOpenEditModal}
        onActivateClick={(id) => setActivateConfirmOpen(id)}
      />

      <AddEditTermModal
        open={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        editingTerm={editingTerm}
        onSave={handleSaveTerm}
      />

      <ActivateTermConfirmModal
        open={activateConfirmOpen !== null}
        onClose={() => setActivateConfirmOpen(null)}
        onConfirm={handleActivateTerm}
        termName={getTargetTermName()}
      />
    </main>
  );
}

export default AcademicTermsPage;
