import { useEffect, useState } from "react";
import { AdminGroupsTable } from "./components/AdminGroupsTable";
import { CommunityCreateModal } from "./components/CommunityCreateModal";
import { GroupRatioCard } from "./components/GroupRatioCard";
import { GroupStatCard } from "./components/GroupStatCard";
import { GroupsFilterBar, GroupsToolbar } from "./components/GroupsToolbar";
import { RecentActivityCard } from "./components/RecentActivityCard";

import type { FilterGroup, GroupRow, GroupStats } from "./types";
import { BookOpenCheck, Globe2, UsersRound } from "lucide-react";
import {
  getAdminGroups,
  getGroupStatsForAdmin,
} from "../../../services/GroupService";

const filters: FilterGroup[] = [
  { title: "Tất cả", type: null, status: null, keyword: null },
  { title: "Cộng đồng", type: "COMMUNITY", status: null, keyword: null },
  { title: "Nhóm học riêng", type: "STUDY", status: null, keyword: null },
  { title: "Đang hoạt động", type: null, status: "ACTIVE", keyword: null },
  { title: "Bị khóa", type: null, status: "INACTIVE", keyword: null },
];

export default function AdminGroupsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);

  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState<FilterGroup>(filters[0]);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
      setIsTyping(false);
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingGroups(true);
      setGroupsError(null);

      const res = await getAdminGroups(
        page - 1,
        pageSize,
        selectedFilter.type,
        selectedFilter.status,
        debouncedKeyword.length > 0 ? debouncedKeyword : null,
      );

      if (cancelled) return;

      if (!res.success) {
        setGroups([]);
        setTotalPages(0);
        setTotalItems(0);
        setGroupsError(res.message || "Không thể tải danh sách nhóm");
        setLoadingGroups(false);
        return;
      }

      setGroups(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalElements);
      setLoadingGroups(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page, selectedFilter, debouncedKeyword]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getGroupStatsForAdmin();

      if (res.success) {
        setGroupStats([
          {
            title: "Tổng nhóm",
            value: res.data.totalGroup.toString(),
            change: "",
            icon: BookOpenCheck,
          },
          {
            title: "Cộng đồng",
            value: res.data.communityGroup.toString(),
            change: "do Admin tạo",
            icon: Globe2,
          },
          {
            title: "Nhóm học riêng",
            value: res.data.privateGroup.toString(),
            change: "từ sinh viên",
            icon: UsersRound,
          },
          {
            title: "Nhóm công khai",
            value: res.data.publicGroup.toString(),
            change: "",
            icon: UsersRound,
          },
        ]);
      }
    };

    fetchStats();
  }, []);

  const onFilterChange = (filter: FilterGroup) => {
    setSelectedFilter(filter);
    setPage(1);
  };

  return (
    <main className="space-y-6">
      <GroupsToolbar onOpenCreate={() => setCreateOpen(true)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groupStats.map((stat) => (
          <GroupStatCard key={stat.title} card={stat} />
        ))}
      </div>

      <GroupsFilterBar
        filters={filters}
        selectedFilter={selectedFilter}
        onFilterChange={onFilterChange}
        keyword={keyword}
        setKeyword={setKeyword}
      />

      <div className="grid gap-6">
        <div className="xl:col-span-2">
          {groupsError && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {groupsError}
            </div>
          )}

          {!loadingGroups && !isTyping && groups.length === 0 && (
            <div className="text-center text-gray-500 py-6">
              Không tìm thấy nhóm nào
            </div>
          )}

          <AdminGroupsTable
            groups={groups}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            loading={loadingGroups || isTyping}
            onPageChange={setPage}
            onStatusUpdated={(groupId, status) => {
              setGroups((prev) =>
                prev.map((g) => (g.id === groupId ? { ...g, status } : g)),
              );
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GroupRatioCard />
        <RecentActivityCard />
      </div>

      <CommunityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={() => setCreateOpen(false)}
      />
    </main>
  );
}
