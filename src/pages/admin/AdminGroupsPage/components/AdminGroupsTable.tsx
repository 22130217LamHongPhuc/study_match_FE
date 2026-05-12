import { useMemo } from "react";
import {
  Eye,
  Filter,
  Globe2,
  MoreHorizontal,
  Lock,
  UsersRound,
} from "lucide-react";
import type { GroupRow } from "../types";
import { GroupStatusBadge, GroupTypeBadge } from "./GroupBadges";
import { Pagination } from "../../../../components/admin/Pagination";
export function AdminGroupsTable({
  groups,
  page,
  pageSize,
  totalItems,
  totalPages,
  loading,
  onPageChange,
}: {
  groups: GroupRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const formattedRows = useMemo(() => {
    return groups.map((g) => ({
      ...g,
      createdAtText: new Date(g.createdAt).toLocaleString("vi-VN"),
    }));
  }, [groups]);

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Danh sách nhóm học
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-gray-400">
            Theo dõi nhóm cộng đồng và nhóm học riêng của sinh viên
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
          <Filter size={13} />
          Bộ lọc
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Tên nhóm
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Loại
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Môn học
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Thành viên
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {formattedRows.map((group) => (
              <tr
                key={group.id}
                className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                        group.type === "COMMUNITY"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      {group.type === "COMMUNITY" ? (
                        <Globe2 size={15} />
                      ) : (
                        <UsersRound size={15} />
                      )}
                    </div>

                    <div>
                      <p className="text-[13px] font-bold text-gray-800">
                        {group.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <GroupTypeBadge type={group.type} />
                </td>

                <td className="px-4 py-3">
                  <span className="text-[12px] font-semibold text-gray-700">
                    {group.subjectName}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-gray-800">
                    {group.memberCount}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <GroupStatusBadge status={group.status} />
                </td>

                <td className="px-4 py-3">
                  <span className="text-[12px] font-medium text-gray-500">
                    {group.createdAtText}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600">
                      <Eye size={15} />
                    </button>
                    <button className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-orange-600">
                      <Lock size={15} />
                    </button>
                    <button className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && formattedRows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[13px] font-medium text-gray-400"
                >
                  Không có nhóm học nào.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[13px] font-medium text-gray-400"
                >
                  Đang tải dữ liệu...
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
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
