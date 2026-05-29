import { useEffect, useState } from "react";
import { AdminUsersTable } from "./components/AdminUsersTable";
import { UsersToolbar } from "./components/UsersToolbar";
import {
  ADMIN_USER_PAGE_SIZE,
  DEFAULT_USER_FILTERS,
  type AdminUserDbRow,
  type AdminUserRole,
  type AdminUserStatus,
} from "./types";
import { getAdminUsers } from "../../../services/UserService";
import { AdminUserDetailModal } from "./components/AdminUserDetailModal";

function useDebounce<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 400);

  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | null>(
    DEFAULT_USER_FILTERS.status,
  );

  const [roleFilter, setRoleFilter] = useState<AdminUserRole | null>(
    DEFAULT_USER_FILTERS.role,
  );

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserDbRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openUserDetail, setOpenUserDetail] = useState<AdminUserDbRow | null>(
    null,
  );

  const handleStatusUpdated = (userId: number, status: AdminUserStatus) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === userId
          ? {
              ...user,
              status,
            }
          : user,
      ),
    );
  };
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, roleFilter]);

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAdminUsers(
          page - 1,
          ADMIN_USER_PAGE_SIZE,
          statusFilter,
          debouncedQuery,
          roleFilter,
        );

        if (!res.success || !res.data) {
          setUsers([]);
          setTotalPages(0);
          setTotalItems(0);
          setError(res.message || "Không thể tải danh sách người dùng");
          return;
        }

        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalElements);
      } catch {
        setUsers([]);
        setTotalPages(0);
        setTotalItems(0);
        setError("Có lỗi xảy ra khi tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, [page, debouncedQuery, statusFilter, roleFilter]);

  const handleStatusChange = (value: AdminUserStatus | null) => {
    setStatusFilter(value);
  };

  const handleRoleChange = (value: AdminUserRole | null) => {
    setRoleFilter(value);
  };

  return (
    <main className="space-y-6">
      <UsersToolbar
        query={query}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        onQueryChange={setQuery}
        onStatusChange={handleStatusChange}
        onRoleChange={handleRoleChange}
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-sand-200 bg-white px-4 py-3 text-sm font-medium text-sand-500">
          Đang tải danh sách người dùng...
        </div>
      )}

      <AdminUsersTable
        users={users}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={ADMIN_USER_PAGE_SIZE}
        onPageChange={setPage}
        onStatusUpdated={handleStatusUpdated}
        onViewUser={(userId) => {
          const user = users.find((item) => item.user_id === userId) ?? null;
          setOpenUserDetail(user);
        }}
      />

      <AdminUserDetailModal
        open={openUserDetail !== null}
        user={openUserDetail}
        onClose={() => setOpenUserDetail(null)}
      />
    </main>
  );
}
