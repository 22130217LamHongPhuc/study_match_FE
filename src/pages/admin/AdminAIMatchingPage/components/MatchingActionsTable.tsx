import type { ReactNode } from "react";
import { BrainCircuit, Eye, Search } from "lucide-react";
import type { MatchingActionResponse, MatchingActionStatus } from "../types";
import { AI_MATCHING_PAGE_SIZE } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../utils";
import { Pagination } from "../../../../components/admin/Pagination";

const statusOptions: Array<{ label: string; value: MatchingActionStatus | null }> = [
  { label: "Tất cả", value: null },
  { label: "Đã xem", value: "VIEWED" },
  { label: "Gửi lời mời", value: "FRIEND_REQUEST_SENT" },
  { label: "Đã chấp nhận", value: "ACCEPTED" },
  { label: "Đã từ chối", value: "REJECTED" },
];

type MatchingActionsTableProps = {
  actions: MatchingActionResponse[];
  page: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (action: MatchingActionResponse) => void;
  loading: boolean;
  userId: string;
  onUserIdChange: (value: string) => void;
  recommendedUserId: string;
  onRecommendedUserIdChange: (value: string) => void;
  statusFilter: MatchingActionStatus | null;
  onStatusFilterChange: (value: MatchingActionStatus | null) => void;
};

export function MatchingActionsTable({
  actions,
  page,
  totalItems,
  totalPages,
  onPageChange,
  onViewDetail,
  loading,
  userId,
  onUserIdChange,
  recommendedUserId,
  onRecommendedUserIdChange,
  statusFilter,
  onStatusFilterChange,
}: MatchingActionsTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sand-200 bg-white p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <FilterInput
              value={userId}
              onChange={onUserIdChange}
              placeholder="User ID"
            />
            <FilterInput
              value={recommendedUserId}
              onChange={onRecommendedUserIdChange}
              placeholder="Recommended user ID"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-sand-400">
              Trạng thái
            </span>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((option) => (
                <button
                  key={option.value ?? "all"}
                  type="button"
                  onClick={() => onStatusFilterChange(option.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === option.value
                      ? "border-sand-800 bg-sand-900 text-white"
                      : "border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
        <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-medium text-sand-800">
              Hoạt động ghép đôi
            </h3>
            <p className="mt-0.5 text-xs font-medium text-sand-500">
              Danh sách hành động matching từ AI
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50">
                <TableHeader>Người dùng</TableHeader>
                <TableHeader>Người được gợi ý</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeader>Ngày tạo</TableHeader>
                <TableHeader>Cập nhật</TableHeader>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-sand-500">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {loading &&
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="border-b border-sand-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-sand-200" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 bg-sand-200 rounded" />
                        <div className="h-3 w-32 bg-sand-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-sand-200" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 bg-sand-200 rounded" />
                        <div className="h-3 w-32 bg-sand-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 bg-sand-200 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))}

              {!loading &&
                actions.map((action) => (
                  <tr
                    key={action.id}
                    className="border-b border-sand-100 transition-colors last:border-0 hover:bg-sand-50/50"
                  >
                    <td className="px-4 py-3">
                      <UserCell
                        userId={action.userId}
                        fullName={action.userFullName}
                        email={action.userEmail}
                        avatarUrl={action.userAvatarUrl}
                        variant="neutral"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <UserCell
                        userId={action.recommendedUserId}
                        fullName={action.recommendedUserFullName}
                        email={action.recommendedUserEmail}
                        avatarUrl={action.recommendedUserAvatarUrl}
                        variant="accent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={action.actionStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-600">
                        {formatDateTime(action.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-600">
                        {formatDateTime(action.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onViewDetail(action)}
                          className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                          aria-label="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && actions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
                        <BrainCircuit size={22} className="text-sand-400" />
                      </div>
                      <p className="text-sm font-medium text-sand-600">
                        Không có hoạt động ghép đôi nào
                      </p>
                      <p className="text-xs text-sand-400">
                        Thử thay đổi bộ lọc hoặc khoảng thời gian.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={AI_MATCHING_PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
      />
      <input
        type="number"
        min="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
        placeholder={placeholder}
      />
    </div>
  );
}

function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
      {children}
    </th>
  );
}

function UserCell({
  userId,
  fullName,
  email,
  avatarUrl,
  variant,
}: {
  userId: number;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  variant: "neutral" | "accent";
}) {
  const name = fullName?.trim() || `User #${userId}`;
  const badgeClass =
    variant === "accent"
      ? "bg-accent-50 text-accent-600"
      : "bg-sand-200 text-sand-600";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {getInitials(name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-sand-800">{name}</p>
        <p className="truncate text-[11px] font-medium text-sand-500">
          {email || `ID ${userId}`}
        </p>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
