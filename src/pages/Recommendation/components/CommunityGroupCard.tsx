import { Users } from "lucide-react";

type CommunityGroupStatus = "ACTIVE" | "INACTIVE";
type CommunityGroupType = "COMMUNITY" | "PRIVATE";

export interface CommunityGroup {
  id: number;
  name: string;
  subjectName: string;
  memberCount: number;

  status: CommunityGroupStatus;
  type: CommunityGroupType;
  createdAt: string;
}

interface CommunityGroupCardProps {
  group: CommunityGroup;
  recommended?: boolean;
  onView?: (id: number) => void;
  onJoin?: (id: number) => void;
}

export default function CommunityGroupCard({
  group,
  recommended = false,
  onView,
  onJoin,
}: CommunityGroupCardProps) {
  const createdDate = new Date(group.createdAt).toLocaleDateString("vi-VN");

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-gray-900">
            {group.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">{group.subjectName}</p>
        </div>

        {recommended && (
          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            Phù hợp
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Users size={16} />
        <span>{group.memberCount} thành viên</span>
        <span className="text-gray-300">•</span>
        <span>{group.status}</span>
      </div>

      <div className="mb-4 rounded-md bg-gray-50 p-3">
        <p className="text-xs text-gray-500">Loại nhóm</p>
        <p className="mt-1 text-sm font-medium text-gray-800">Nhóm cộng đồng</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400">Tạo ngày {createdDate}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onView?.(group.id)}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Xem
          </button>

          <button
            type="button"
            onClick={() => onJoin?.(group.id)}
            className="h-9 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Tham gia
          </button>
        </div>
      </div>
    </article>
  );
}
