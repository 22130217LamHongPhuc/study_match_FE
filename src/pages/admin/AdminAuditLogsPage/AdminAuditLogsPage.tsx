import React, { useEffect, useState } from "react";
import { getAuditLogs, getAuditLogFilters, AuditLogItem } from "../../../services/AuditLogService";
import {
  Search,
  RotateCcw,
  Eye,
  Calendar,
  User,
  Shield,
  Activity,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function getActionLabel(action: string): string {
  switch (action) {
    case "INVITE_ADMIN":
      return "Mời quản trị viên";
    case "UPDATE_ADMIN_STATUS":
      return "Cập nhật trạng thái Admin";
    case "UPDATE_ADMIN_PROFILE":
      return "Cập nhật hồ sơ Admin";
    case "CHANGE_ADMIN_PASSWORD":
      return "Thay đổi mật khẩu Admin";
    case "UPDATE_STUDENT_STATUS":
      return "Cập nhật trạng thái Sinh viên";
    case "UPDATE_GROUP_STATUS":
      return "Cập nhật trạng thái Nhóm học";
    case "REMOVE_GROUP_MEMBER":
      return "Xóa thành viên khỏi Nhóm";
    case "CHANGE_GROUP_OWNER":
      return "Chuyển quyền sở hữu Nhóm";
    default:
      return action;
  }
}

function formatDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function getActionBadge(action: string) {
  const baseClass = "inline-flex items-center bg-slate-50 text-slate-600 border-slate-200 rounded px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap";
  switch (action) {
    case "INVITE_ADMIN":
      return { label: "Mời quản trị viên", className: baseClass };
    case "UPDATE_ADMIN_STATUS":
      return { label: "Cập nhật trạng thái Admin", className: baseClass };
    case "UPDATE_ADMIN_PROFILE":
      return { label: "Cập nhật hồ sơ Admin", className: baseClass };
    case "CHANGE_ADMIN_PASSWORD":
      return { label: "Thay đổi mật khẩu Admin", className: baseClass };
    case "UPDATE_STUDENT_STATUS":
      return { label: "Cập nhật trạng thái Sinh viên", className: baseClass };
    case "UPDATE_GROUP_STATUS":
      return { label: "Cập nhật trạng thái Nhóm học", className: baseClass };
    case "REMOVE_GROUP_MEMBER":
      return { label: "Xóa thành viên khỏi Nhóm", className: baseClass };
    case "CHANGE_GROUP_OWNER":
      return { label: "Chuyển quyền sở hữu Nhóm", className: baseClass };
    default:
      return { label: action, className: baseClass };
  }
}

function getActionDescription(action: string): string {
  switch (action) {
    case "INVITE_ADMIN":
      return "Super Admin gửi lời mời tham gia quản trị cho tài khoản mới.";
    case "UPDATE_ADMIN_STATUS":
      return "Super Admin Khóa hoặc Mở khóa tài khoản của một Admin.";
    case "UPDATE_ADMIN_PROFILE":
      return "Admin tự thay đổi thông tin cá nhân (họ tên, ảnh đại diện, bio).";
    case "CHANGE_ADMIN_PASSWORD":
      return "Admin tự thay đổi mật khẩu tài khoản quản trị của mình.";
    case "UPDATE_STUDENT_STATUS":
      return "Admin khóa hoặc mở khóa tài khoản của một Sinh viên.";
    case "UPDATE_GROUP_STATUS":
      return "Admin khóa, mở khóa, hoặc đình chỉ hoạt động nhóm học tập của sinh viên.";
    case "REMOVE_GROUP_MEMBER":
      return "Admin can thiệp kích sinh viên vi phạm ra khỏi nhóm học tập.";
    case "CHANGE_GROUP_OWNER":
      return "Admin chuyển quyền sở hữu Trưởng nhóm cho một sinh viên khác.";
    default:
      return "Thao tác quản trị hệ thống.";
  }
}

function getTargetTypeLabel(targetType: string) {
  switch (targetType) {
    case "ADMIN_INVITATION":
      return "Lời mời Admin";
    case "ADMIN":
      return "Admin";
    case "USER":
      return "Sinh viên";
    case "STUDY_GROUP":
      return "Nhóm học tập";
    default:
      return targetType;
  }
}

export default function AdminAuditLogsPage() {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableTargetTypes, setAvailableTargetTypes] = useState<string[]>([]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const response = await getAuditLogFilters();
        if (response.success && response.data) {
          setAvailableActions(response.data.actions);
          setAvailableTargetTypes(response.data.targetTypes);
        }
      } catch (err) {
        console.error("Failed to load audit log filters", err);
      }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const response = await getAuditLogs({
          page,
          limit,
          keyword: searchKeyword || undefined,
          action: action || undefined,
          targetType: targetType || undefined,
        });

        if (response.success && response.data) {
          setLogs(response.data.content);
          setTotalPages(response.data.totalPages);
          setTotalElements(response.data.totalElements);
        } else {
          setError(response.message || "Không thể tải nhật ký hoạt động");
        }
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi kết nối");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [page, limit, searchKeyword, action, targetType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchKeyword(keyword.trim());
  };

  const handleResetFilters = () => {
    setKeyword("");
    setSearchKeyword("");
    setAction("");
    setTargetType("");
    setPage(0);
  };

  const startItem = page * limit + 1;
  const endItem = Math.min((page + 1) * limit, totalElements);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Nhật ký hoạt động
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi, tìm kiếm và lọc lịch sử thao tác của các Admin trên toàn hệ thống
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Tìm theo tên, email admin, mô tả..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={action}
              onChange={(e) => {
                setPage(0);
                setAction(e.target.value);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả hành động</option>
              {availableActions.map((act) => (
                <option key={act} value={act}>
                  {getActionLabel(act)}
                </option>
              ))}
            </select>

            <select
              value={targetType}
              onChange={(e) => {
                setPage(0);
                setTargetType(e.target.value);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả đối tượng</option>
              {availableTargetTypes.map((tgt) => (
                <option key={tgt} value={tgt}>
                  {getTargetTypeLabel(tgt)}
                </option>
              ))}
            </select>

            {(searchKeyword || action || targetType || keyword) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 hover:bg-slate-50 px-3.5 text-sm font-medium text-slate-600 transition-colors"
              >
                <RotateCcw size={15} />
                Đặt lại
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Quản trị viên</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Hành động</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Đối tượng</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">IP Address</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mô tả</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-6 bg-slate-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 bg-slate-100 rounded mb-1.5" />
                      <div className="h-3 w-40 bg-slate-100 rounded" />
                    </td>
                    <td className="px-5 py-4"><div className="h-6 w-28 bg-slate-100 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-48 bg-slate-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-3">
                      <X size={20} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{error}</p>
                    <button
                      type="button"
                      onClick={() => setPage(0)}
                      className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Thử lại
                    </button>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3">
                      <Activity size={20} />
                    </div>
                    <p className="text-sm">Không tìm thấy bản ghi nhật ký hoạt động nào</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">{log.id}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-800">{log.adminName}</div>
                        <div className="text-xs text-slate-500">{log.adminEmail}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={badge.className}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-700">{getTargetTypeLabel(log.targetType)}</div>
                        <div className="text-xs text-slate-500">ID: {log.targetId}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-mono">{log.ipAddress}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate">{log.details}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-medium text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">{startItem}</span> -{" "}
              <span className="font-semibold text-slate-700">{endItem}</span> trong{" "}
              <span className="font-semibold text-slate-700">{totalElements}</span> bản ghi
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-all ${
                    page === index
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/15"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Chi tiết nhật ký hoạt động</h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Activity size={13} /> Log ID
                </span>
                <span className="col-span-2 text-sm font-semibold text-slate-800">{selectedLog.id}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Calendar size={13} /> Thời gian
                </span>
                <span className="col-span-2 text-sm text-slate-600">{formatDateTime(selectedLog.createdAt)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <User size={13} /> Admin thực hiện
                </span>
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-slate-800">{selectedLog.adminName}</div>
                  <div className="text-xs text-slate-500">ID: {selectedLog.adminId} • {selectedLog.adminEmail}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Shield size={13} /> Hành động
                </span>
                <div className="col-span-2">
                  <span className={`inline-flex items-center ${getActionBadge(selectedLog.action).className}`}>
                    {getActionBadge(selectedLog.action).label}
                  </span>
                  <div className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">
                    {getActionDescription(selectedLog.action)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Activity size={13} /> Đối tượng
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{getTargetTypeLabel(selectedLog.targetType)}</div>
                  <div className="text-xs text-slate-500">Type: {selectedLog.targetType}</div>
                  <div className="text-xs text-slate-500">ID: {selectedLog.targetId}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Globe size={13} /> Địa chỉ IP
                </span>
                <span className="col-span-2 text-sm text-slate-600 font-mono">{selectedLog.ipAddress}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mô tả chi tiết</span>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="h-10 rounded-lg border border-slate-200 hover:bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
