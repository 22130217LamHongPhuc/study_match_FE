import { useEffect, useState } from "react";
import { AdminGroupsTable } from "./components/AdminGroupsTable";
import { CommunityCreateModal } from "./components/CommunityCreateModal";
import { GroupRatioCard } from "./components/GroupRatioCard";
import { GroupStatCard } from "./components/GroupStatCard";
import { GroupsFilterBar, GroupsToolbar } from "./components/GroupsToolbar";
import { RecentActivityCard } from "./components/RecentActivityCard";

import type { GroupRow } from "./types";
import { AlertCircle, BookOpenCheck, Globe2, UsersRound } from "lucide-react";
import { getAdminGroups } from "../../../services/GroupService";

export const groupStats = [
  {
    title: "Tổng nhóm",
    value: "128",
    change: "+8 tuần này",
    icon: BookOpenCheck,
  },
  {
    title: "Cộng đồng",
    value: "24",
    change: "do Admin tạo",
    icon: Globe2,
  },
  {
    title: "Nhóm học riêng",
    value: "104",
    change: "từ sinh viên",
    icon: UsersRound,
  },
  {
    title: "Cần xử lý",
    value: "3",
    change: "2 báo cáo",
    icon: AlertCircle,
    warning: true,
  },
] as const;

export default function AdminGroupsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingGroups(true);
      setGroupsError(null);

      const res = await getAdminGroups(page - 1, pageSize);
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
  }, [page]);

  return (
    <main className="overflow-y-auto p-6">
      <GroupsToolbar onOpenCreate={() => setCreateOpen(true)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groupStats.map((card) => (
          <GroupStatCard key={card.title} card={card} />
        ))}
      </div>

      <GroupsFilterBar />

      <div className="mt-6 grid gap-6">
        <div className="xl:col-span-2">
          {groupsError && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
              {groupsError}
            </div>
          )}

          <AdminGroupsTable
            groups={groups}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            loading={loadingGroups}
            onPageChange={setPage}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GroupRatioCard />
        <RecentActivityCard />
      </div>

      <CommunityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(values) => {
          console.log("create community", values);
          setCreateOpen(false);
        }}
      />
    </main>
  );
}
