import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Subject } from "./types";
import { SubjectToolbar } from "./components/SubjectToolbar";
import { SubjectTable } from "./components/SubjectTable";
import { AddEditSubjectModal } from "./components/AddEditSubjectModal";
import { ImportSubjectModal } from "./components/ImportSubjectModal";
import { DeleteSubjectModal } from "./components/DeleteSubjectModal";
import { 
  getAdminSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject, 
  importSubjects 
} from "../../../services/AdminAcademicService";

// Custom Debounce Hook
function useDebounce<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function AcademicSubjectsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);

  // Editing subject reference
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Fetch subjects list
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getAdminSubjects(page, size, debouncedSearch);
        if (!active) return;
        
        if (res.success && res.data) {
          setSubjects(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
        } else {
          setSubjects([]);
          toast.error(res.message || "Không thể tải danh sách môn học");
        }
      } catch (err: any) {
        if (!active) return;
        toast.error("Lỗi khi kết nối mạng");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [page, size, debouncedSearch, refreshTrigger]);

  // Reset page to 0 when search term changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setEditModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setEditModalOpen(true);
  };

  const handleSaveSubject = async (code: string, name: string): Promise<boolean> => {
    try {
      const payload = {
        subjectCode: code,
        subjectName: name,
      };

      let res;
      if (editingSubject) {
        res = await updateSubject(editingSubject.subjectId, payload);
      } else {
        res = await createSubject(payload);
      }

      if (res.success) {
        toast.success(editingSubject ? "Cập nhật môn học thành công" : "Thêm môn học thành công");
        setRefreshTrigger(prev => prev + 1);
        return true;
      } else {
        toast.error(res.message || "Lưu thông tin thất bại");
        return false;
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra khi kết nối server");
      return false;
    }
  };

  const handleDeleteSubject = async () => {
    if (deleteConfirmOpen === null) return;
    try {
      setLoading(true);
      const res = await deleteSubject(deleteConfirmOpen);
      if (res.success) {
        toast.success("Xóa môn học thành công");
        setDeleteConfirmOpen(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        // Display exact warning returned from backend
        toast.error(res.message || "Không thể xóa môn học");
      }
    } catch (err: any) {
      toast.error("Lỗi khi thực hiện xóa môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleImportSubjects = async (list: any[]): Promise<boolean> => {
    try {
      const res = await importSubjects(list);
      if (res.success) {
        toast.success(`Import thành công ${res.data?.length || list.length} môn học`);
        setRefreshTrigger(prev => prev + 1);
        return true;
      } else {
        toast.error(res.message || "Import môn học thất bại");
        return false;
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
      return false;
    }
  };

  return (
    <main className="space-y-6">
      <SubjectToolbar
        search={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenAddModal}
        onImportClick={() => setImportModalOpen(true)}
      />

      <SubjectTable
        subjects={subjects}
        loading={loading}
        page={page}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onEditClick={handleOpenEditModal}
        onDeleteClick={(id) => setDeleteConfirmOpen(id)}
      />

      <AddEditSubjectModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editingSubject={editingSubject}
        onSave={handleSaveSubject}
      />

      <ImportSubjectModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportSubjects}
      />

      <DeleteSubjectModal
        open={deleteConfirmOpen !== null}
        onClose={() => setDeleteConfirmOpen(null)}
        onConfirm={handleDeleteSubject}
      />
    </main>
  );
}

export default AcademicSubjectsPage;
