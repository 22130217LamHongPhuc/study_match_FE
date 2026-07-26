import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { StudentProfile, StudentTermProfileDetail } from "./types";
import { Cohort } from "../AcademicCohortsPage/types";
import { ProfileToolbar } from "./components/ProfileToolbar";
import { ProfileTable } from "./components/ProfileTable";
import { ProfilePagination } from "./components/ProfilePagination";
import { ProfileDetailModal } from "./components/ProfileDetailModal";
import { EditProfileModal } from "./components/EditProfileModal";
import {
  getAdminProfiles,
  getProfileDetail,
  updateStudentProfile,
  getAdminCohorts,
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

export function AcademicProfilesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [cohortFilter, setCohortFilter] = useState<number | "">("");
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [termProfiles, setTermProfiles] = useState<StudentTermProfileDetail[]>([]);
  const [loadingTermProfiles, setLoadingTermProfiles] = useState(false);

  // Fetch cohorts for dropdown filter
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const res = await getAdminCohorts();
        if (res.success && res.data) {
          setCohorts(res.data || []);
        }
      } catch {
        console.error("Lỗi khi tải danh sách khóa học cho bộ lọc");
      }
    };

    fetchCohorts();
  }, []);

  // Fetch profiles list
  useEffect(() => {
    let active = true;
    const fetchProfilesList = async () => {
      try {
        setLoading(true);
        const res = await getAdminProfiles(
          page,
          size,
          debouncedSearch,
          cohortFilter || undefined
        );
        if (!active) return;

        if (res.success && res.data) {
          const data = res.data;
          setProfiles(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setProfiles([]);
          toast.error(res.message || "Không thể tải danh sách hồ sơ sinh viên");
        }
      } catch {
        toast.error("Có lỗi xảy ra khi kết nối server");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfilesList();
    return () => {
      active = false;
    };
  }, [page, size, debouncedSearch, cohortFilter, refreshTrigger]);

  // Reset to page 0 when search/filter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, cohortFilter]);

  const handleViewDetail = async (profile: StudentProfile) => {
    setSelectedProfile(profile);
    setDetailModalOpen(true);
    setTermProfiles([]);

    // Fetch full profile detail to get term profiles
    try {
      setLoadingTermProfiles(true);
      const res = await getProfileDetail(profile.profileId);
      if (res.success && res.data) {
        // The detail endpoint returns the StudentProfile entity which may contain
        // nested term profiles - we'll use the data as-is
        // For now, term profiles are not directly on the profile entity,
        // so we show what we have
        setTermProfiles([]);
      }
    } catch {
      console.error("Lỗi khi tải chi tiết hồ sơ sinh viên");
    } finally {
      setLoadingTermProfiles(false);
    }
  };

  const handleOpenEditModal = (profile: StudentProfile) => {
    setSelectedProfile(profile);
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (payload: {
    cohortId?: number;
    studentCode?: string;
    fullName?: string;
    region?: string;
    gender?: string;
  }): Promise<boolean> => {
    if (!selectedProfile) return false;
    try {
      const res = await updateStudentProfile(selectedProfile.profileId, payload);
      if (res.success) {
        toast.success("Cập nhật hồ sơ sinh viên thành công");
        setRefreshTrigger((prev) => prev + 1);
        return true;
      } else {
        toast.error(res.message || "Cập nhật hồ sơ sinh viên thất bại");
        return false;
      }
    } catch {
      toast.error("Có lỗi xảy ra khi kết nối server");
      return false;
    }
  };

  return (
    <main className="space-y-6">
      <ProfileToolbar
        search={search}
        onSearchChange={setSearch}
        cohortId={cohortFilter}
        onCohortChange={setCohortFilter}
        cohorts={cohorts}
      />

      <ProfileTable
        profiles={profiles}
        loading={loading}
        onViewDetail={handleViewDetail}
        onEditClick={handleOpenEditModal}
      />

      <ProfilePagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        size={size}
        onPageChange={setPage}
        onSizeChange={(newSize) => {
          setSize(newSize);
          setPage(0);
        }}
      />

      <ProfileDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        profile={selectedProfile}
        termProfiles={termProfiles}
        loadingTermProfiles={loadingTermProfiles}
      />

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={selectedProfile}
        cohorts={cohorts}
        onSave={handleSaveProfile}
      />
    </main>
  );
}

export default AcademicProfilesPage;
