import { useState } from "react";
import { AdminGroupsTable } from "./components/AdminGroupsTable";
import { CommunityCreateModal } from "./components/CommunityCreateModal";
import { GroupRatioCard } from "./components/GroupRatioCard";
import { GroupStatCard } from "./components/GroupStatCard";
import { GroupsFilterBar, GroupsToolbar } from "./components/GroupsToolbar";
import { RecentActivityCard } from "./components/RecentActivityCard";

import type { GroupRow } from "./types";
import { AlertCircle, BookOpenCheck, Globe2, UsersRound } from "lucide-react";

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

export const groups: GroupRow[] = [
  {
    id: 1,
    name: "Cộng đồng Lập trình Java",
    type: "COMMUNITY",
    subjectName: "Lập trình Java",
    termName: "HK2 2025-2026",
    createdBy: "Admin",
    members: "230",
    status: "ACTIVE",
    createdAt: "11/05/2026",
  },
  {
    id: 2,
    name: "Nhóm ôn Java giữa kỳ",
    type: "STUDY",
    subjectName: "Lập trình Java",
    termName: "HK2 2025-2026",
    createdBy: "Lâm Hồng Phúc",
    ownerName: "Lâm Hồng Phúc",
    members: "5/5",
    status: "ACTIVE",
    createdAt: "10/05/2026",
  },
  {
    id: 3,
    name: "Nhóm học Cấu trúc dữ liệu",
    type: "STUDY",
    subjectName: "Cấu trúc dữ liệu",
    termName: "HK2 2025-2026",
    createdBy: "Phạm Thành Tài",
    ownerName: "Phạm Thành Tài",
    members: "4/6",
    status: "ACTIVE",
    createdAt: "09/05/2026",
  },
  {
    id: 4,
    name: "Cộng đồng Cơ sở dữ liệu",
    type: "COMMUNITY",
    subjectName: "Cơ sở dữ liệu",
    termName: "HK2 2025-2026",
    createdBy: "Admin",
    members: "184",
    status: "ACTIVE",
    createdAt: "08/05/2026",
  },
  {
    id: 5,
    name: "Nhóm học Web nâng cao",
    type: "STUDY",
    subjectName: "Lập trình Web",
    termName: "HK2 2025-2026",
    createdBy: "Nguyễn Văn A",
    ownerName: "Nguyễn Văn A",
    members: "2/5",
    status: "INACTIVE",
    createdAt: "05/05/2026",
  },
];

export default function AdminGroupsPage() {
  const [createOpen, setCreateOpen] = useState(false);

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
          <AdminGroupsTable groups={groups} />
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
