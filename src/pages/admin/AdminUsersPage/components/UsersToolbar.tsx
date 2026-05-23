import { Search } from "lucide-react";
import type { AdminUserRole, AdminUserStatus } from "../types";

const statusOptions: Array<{ label: string; value: AdminUserStatus }> = [
  { label: "Tất cả", value: "all" },
  { label: "Hoạt động", value: "active" },
  { label: "Không hoạt động", value: "inactive" },
  { label: "Tạm khóa", value: "suspended" },
];

const roleOptions: Array<{ label: string; value: AdminUserRole }> = [
  { label: "Tất cả vai trò", value: "all" },
  { label: "Sinh viên", value: "student" },
  { label: "Quản trị viên", value: "admin" },
];

type UsersToolbarProps = {
  query: string;
  statusFilter: AdminUserStatus;
  roleFilter: AdminUserRole;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: AdminUserStatus) => void;
  onRoleChange: (value: AdminUserRole) => void;
};

export function UsersToolbar({
  query,
  statusFilter,
  roleFilter,
  onQueryChange,
  onStatusChange,
  onRoleChange,
}: UsersToolbarProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-sand-900">
            Quản lý người dùng
          </h1>
          <p className="mt-0.5 text-sm text-sand-500">
            Quản lý tài khoản người dùng, vai trò và trạng thái hoạt động
          </p>
        </div>

        <button className="rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50">
          Xuất dữ liệu
        </button>
      </div>

      <div className="rounded-lg border border-sand-200 bg-white p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
            />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white"
              placeholder="Tìm user_id, họ tên, email, vai trò..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === option.value
                    ? "border-sand-800 bg-sand-900 text-white"
                    : "border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-sand-400">
              Vai trò
            </span>
            <select
              value={roleFilter}
              onChange={(event) =>
                onRoleChange(event.target.value as AdminUserRole)
              }
              className="h-9 rounded-lg border border-sand-300 bg-sand-50 px-3 text-sm font-medium text-sand-700 outline-none focus:border-accent-600"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
